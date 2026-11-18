// BoosterSpawner.js — spawns falling boosters (and hazardous debris) on a timer,
// with wind drift, golden variants, and per-realm pacing.
import { BOOSTER_KINDS, REALMS } from './GameConfig.js';
import { SeededRandom } from './SeededRandom.js';

export class BoosterSpawner {
  constructor() {
    this.rng = new SeededRandom(20261118);
    this.timer = 0; this.boosters = []; this.nextId = 1;
  }
  reset() { this.boosters.length = 0; this.timer = 0.4; }
  spawnOne(realm, upgrades, relics, goldenBoost = 0) {
    const kind = this.rng.pick(REALMS[realm].boosterKinds);
    const k = BOOSTER_KINDS[kind];
    const goldenChance = 0.06 + 0.12 * (upgrades.lucky || 0) + (relics.has('charm') ? 0.06 : 0) + goldenBoost;
    const golden = this.rng.chance(goldenChance);
    const slow = 1 - 0.08 * (upgrades.brakes || 0);
    const b = {
      id: this.nextId++, kind, x: this.rng.range(90, 1190), y: -90,
      w: k.w, h: k.h, vy: k.speed * REALMS[realm].speed * slow * this.rng.range(0.9, 1.15),
      vx: 0, hp: k.hp, maxHp: k.hp, score: k.score, scrap: k.scrap,
      golden, hazard: !!k.hazard, caught: false, spin: this.rng.range(-1, 1),
      flame: k.flame, color: k.color, label: k.label, t: 0,
    };
    if (b.hazard) b.kind = 'debris';
    this.boosters.push(b);
    return b;
  }
  update(dt, realm, upgrades, relics, arm, wind) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.spawnOne(realm, upgrades, relics);
      this.timer = REALMS[realm].spawnMs / 1000 * this.rng.range(0.8, 1.25);
      // Storm Front sometimes throws debris too
      if (realm === 1 && this.rng.chance(0.25)) this.spawnOne(realm, upgrades, relics);
    }
    const magnetR = 90 + 40 * (upgrades.magnet || 0);
    for (let i = this.boosters.length - 1; i >= 0; i--) {
      const b = this.boosters[i];
      b.t += dt;
      b.vx += wind * 26 * dt;
      b.vx *= (1 - 0.6 * dt);
      if (magnetR > 90 && !b.hazard) {
        const d = arm.x - b.x;
        if (Math.abs(d) < magnetR && b.y > arm.y - 320 && b.y < arm.y) b.vx += Math.sign(d) * 130 * dt;
      }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < 30) { b.x = 30; b.vx = Math.abs(b.vx) * 0.5; }
      if (b.x > 1250) { b.x = 1250; b.vx = -Math.abs(b.vx) * 0.5; }
    }
  }
  removeAt(i) { this.boosters.splice(i, 1); }
}
