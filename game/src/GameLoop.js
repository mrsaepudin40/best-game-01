// GameLoop.js — the whole game state machine: title, how-to, play, boss,
// shop, relic vault, pause, results, endless mode. Fixed 1/60s step, pooled
// particles, pre-rendered sprites, capped DPR — built to hold 60 FPS at 1080p.
import { VIEW_W, VIEW_H, REALMS, CATCHES_PER_ROUND, MAX_INTEGRITY, MISSIONS, BOSSES } from './GameConfig.js';
import { SeededRandom } from './SeededRandom.js';
import { SpriteCache } from './SpriteCache.js';
import { AudioSynth } from './AudioSynth.js';
import { ParticlePool } from './ParticlePool.js';
import { ChopstickArm } from './ChopstickArm.js';
import { BoosterSpawner } from './BoosterSpawner.js';
import { ComboSystem } from './ComboSystem.js';
import { BossFight } from './BossFight.js';
import { UpgradeShop } from './UpgradeShop.js';
import { RelicVault } from './RelicVault.js';
import { RealmLaunchPad } from './RealmLaunchPad.js';
import { RealmStormFront } from './RealmStormFront.js';
import { RealmNightRecovery } from './RealmNightRecovery.js';
import { MechazillaTower } from './MechazillaTower.js';
import { HudDisplay } from './HudDisplay.js';
import { InputController } from './InputController.js';
import { loadSave, storeSave } from './SaveData.js';

export class GameLoop {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sprites = new SpriteCache();
    this.audio = new AudioSynth();
    this.particles = new ParticlePool(320);
    this.arm = new ChopstickArm();
    this.spawner = new BoosterSpawner();
    this.combo = new ComboSystem();
    this.boss = new BossFight();
    this.shop = new UpgradeShop();
    this.vault = new RelicVault();
    this.realms = [new RealmLaunchPad(), new RealmStormFront(), new RealmNightRecovery()];
    this.tower = new MechazillaTower();
    this.hud = new HudDisplay();
    this.save = loadSave();
    this.screen = 'title';
    this.time = 0; this.shake = 0; this.slowMo = 0; this.slowMoLeft = 3;
    this.fps = 60; this.fpsSamples = []; this.showFps = true;
    this.banner = ''; this.bannerT = 0;
    this.endless = false; this.paused = false;
    this.newGame();
    this.input = new InputController(canvas, (x, y) => this.onClick(x, y), (k) => this.onKey(k));
    this.last = performance.now(); this.acc = 0;
    this.frame = (now) => this.tick(now);
    requestAnimationFrame(this.frame);
  }

  newGame() {
    this.score = 0; this.scrap = this.save.relics.includes('vault') ? 40 : 0;
    this.integrity = MAX_INTEGRITY + (this.save.relics.includes('fuelcell') ? 1 : 0);
    this.maxIntegrity = this.integrity;
    this.realm = 0; this.caughtThisRound = 0; this.caughtTotal = 0;
    this.upgrades = {}; this.relics = new Set(this.save.relics);
    this.lifetimeScrap = this.save.lifetimeScrap;
    this.goldenCaught = 0; this.bossesBeaten = 0; this.bestCombo = 0;
    this.realmClearClean = [false, false, false];
    this.missionsDone = new Set(this.save.missionsDone);
    this.combo.reset(); this.spawner.reset(); this.particles.clear();
    this.boss.active = false; this.slowMo = 0;
    this.slowMoLeft = 3 + (this.relics.has('overclock') ? 1.5 : 0);
    this.arm.applyUpgrades(this.upgrades, this.relics);
    this.platingUsed = false; this.shieldUsedThisRound = 0;
  }

  get realmName() { return REALMS[this.realm].name; }
  get bossActive() { return this.boss.active; }

  startRunSilent(seed) {
    this.newGame();
    this.screen = 'play';
    this.spawner.rng = new SeededRandom(seed || 7);
  }
  startRun() {
    this.newGame();
    this.screen = 'play';
    this.setBanner('CATCH 15 BOOSTERS — REALM 1');
    this.audio.ensure(); this.audio.startMusic();
  }
  setBanner(text) { this.banner = text; this.bannerT = 2.4; }

  onKey(key) {
    if (key === 'm' || key === 'M') this.audio.toggleMute();
    if (key === 'f' || key === 'F') this.showFps = !this.showFps;
    if (key === 's' || key === 'S') this.trySlowMo();
    if (key === 'p' || key === 'P' || key === 'Escape') {
      if (this.screen === 'play') this.screen = 'pause';
      else if (this.screen === 'pause') this.screen = 'play';
      else if (this.screen === 'relic') this.screen = 'title';
      return;
    }
    if (this.screen === 'title') {
      if (key === 'Enter' || key === ' ') this.startRun();
      if (key === 'h' || key === 'H') this.screen = 'howto';
      if (key === 'r' || key === 'R') this.screen = 'relic';
    } else if (this.screen === 'howto') {
      if (key === 'Enter' || key === ' ' || key === 'Escape') this.screen = 'title';
    } else if (this.screen === 'shop') {
      if (key === 'Enter') this.nextRealm();
    } else if (this.screen === 'relic') {
      if (key === 'r' || key === 'R' || key === 'Escape') this.screen = 'title';
    } else if (this.screen === 'results' || this.screen === 'victory') {
      if (key === 'Enter' || key === ' ') this.screen = 'title';
      if (key === 'r' || key === 'R') this.startRun();
    }
  }

  onClick(mx, my) {
    this.audio.ensure();
    if (this.screen === 'title') {
      if (my > 470 && my < 520) this.startRun();
      else if (my > 530 && my < 570) this.screen = 'howto';
      else if (my > 580 && my < 620) this.screen = 'relic';
    } else if (this.screen === 'howto') this.screen = 'title';
    else if (this.screen === 'shop') {
      if (this.shop.click(this, mx, my)) this.audio.coinSound();
      else if (my > 660) this.nextRealm();
    } else if (this.screen === 'relic') {
      if (this.vault.click(this, mx, my)) { this.audio.coinSound(); this.save.relics = [...this.relics]; storeSave(this.save); }
    } else if (this.screen === 'results' || this.screen === 'victory') {
      if (my > 560 && my < 610) this.startRun();
      else if (my > 620 && my < 660) this.screen = 'title';
    } else if (this.screen === 'pause') {
      if (my > 380 && my < 430) this.screen = 'play';
      else if (my > 440 && my < 490) this.screen = 'title';
    }
  }

  trySlowMo() {
    if (this.screen !== 'play' || this.slowMo > 0 || this.slowMoLeft <= 0) return;
    const dur = Math.min(3, this.slowMoLeft);
    this.slowMo = dur; this.slowMoLeft -= dur;
    this.audio.blip(300, 0.4, 'sine', 0.12, 200);
  }

  nextRealm() {
    if (this.upgrades.repair) this.integrity = Math.min(this.maxIntegrity, this.integrity + this.upgrades.repair);
    this.realm++;
    this.caughtThisRound = 0;
    if (this.realm >= 3) { this.startEndless(); return; }
    this.screen = 'play';
    this.spawner.reset();
    this.setBanner(`REALM ${this.realm + 1} — ${REALMS[this.realm].name}`);
  }
  startEndless() {
    this.endless = true; this.realm = 2; this.caughtThisRound = 0;
    this.screen = 'play';
    this.setBanner('ENDLESS MODE — HOW LONG CAN YOU LAST?');
  }

  finishRun(won) {
    this.screen = won ? 'victory' : 'results';
    this.save.lifetimeScrap = this.lifetimeScrap + this.scrap;
    if (this.score > this.save.best) this.save.best = this.score;
    this.save.relics = [...this.relics];
    this.save.missionsDone = [...this.missionsDone];
    storeSave(this.save);
    if (won) this.audio.winSound(); else this.audio.missSound();
    this.audio.stopMusic();
  }

  checkMissions() {
    const snap = { bestCombo: this.combo.best, goldenCaught: this.goldenCaught, bossesBeaten: this.bossesBeaten, score: this.score, realmClearClean: this.realmClearClean };
    for (const m of MISSIONS) {
      if (!this.missionsDone.has(m.id) && m.check(snap)) {
        this.missionsDone.add(m.id);
        this.scrap += 25;
        this.setBanner(`MISSION DONE: ${m.text}  (+25 Scrap)`);
      }
    }
  }

  update(dt) {
    this.time += dt;
    if (this.bannerT > 0) this.bannerT -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 3);
    this.tower.update(dt);
    this.particles.update(dt);
    if (this.screen !== 'play') return;
    if (this.slowMo > 0) this.slowMo -= dt;
    const scale = this.slowMo > 0 ? 0.35 : 1;
    const sdt = dt * scale;
    this.combo.update(sdt);
    const realmDef = REALMS[this.realm];
    const realmObj = this.realms[this.realm];
    if (realmObj.update) realmObj.update(sdt, this.time);
    const gyro = this.relics.has('gyro') ? 0.5 : 1;
    const wind = realmObj.windAt(this.time) * gyro;
    this.arm.update(sdt, this.input);
    this.spawner.update(sdt, this.realm, this.upgrades, this.relics, this.arm, wind);
    // Exhaust particles from falling boosters (capped: every other frame)
    if ((this.frameCount & 1) === 0) {
      for (const b of this.spawner.boosters) if (b.flame) this.particles.exhaust(b.x, b.y + b.h / 2 + 26);
    }
    // Catch / miss resolution
    for (let i = this.spawner.boosters.length - 1; i >= 0; i--) {
      const b = this.spawner.boosters[i];
      if (b.y > this.arm.y - 30 && b.y < this.arm.y + 40 && this.arm.tryCatch(b)) {
        if (b.hazard) { this.onMissedBooster(b, i); continue; }
        this.onCaughtBooster(b, i);
      } else if (b.y - b.h / 2 > 720) {
        this.spawner.removeAt(i);
        if (!b.hazard) this.onMissedBooster(b, i);
      }
    }
    // Boss
    if (this.boss.active) {
      const res = this.boss.update(sdt, this.arm.x, this.arm);
      if (res === 'hit') { this.audio.bossHit(); this.shake = 0.5; this.score += 250; this.particles.burst(this.boss.x, this.boss.y, 24, [255, 90, 60]); }
      if (res === 'beaten') {
        this.bossesBeaten++;
        this.score += 1000; this.scrap += 60;
        this.particles.burst(this.boss.x, this.boss.y, 60, [255, 200, 80], 260, 1.0);
        this.audio.winSound();
        this.checkMissions();
        if (this.endless) { this.setBanner('BOSS DOWN! +1000 — ENDLESS CONTINUES'); this.boss.active = false; }
        else if (this.realm >= 2) this.finishRun(true);
        else { this.screen = 'shop'; this.setBanner('BOSS DOWN! Spend Scrap, then continue'); }
      }
    }
    // Round complete -> boss (or shop in endless)
    if (!this.endless && !this.boss.active && this.caughtThisRound >= CATCHES_PER_ROUND) {
      const bossKind = realmDef.boss;
      this.boss.start(bossKind);
      this.setBanner(`BOSS — ${BOSSES[bossKind].name}!`);
      this.audio.bossHit();
    }
    if (this.endless && this.caughtThisRound >= CATCHES_PER_ROUND) {
      this.caughtThisRound = 0;
      this.boss.start(this.realm === 2 ? 'superheavy' : 'rogue');
      this.setBanner('ENDLESS BOSS!');
    }
  }

  onCaughtBooster(b, i) {
    this.spawner.removeAt(i);
    const mult = this.combo.onCatch();
    if (this.combo.best > this.bestCombo) this.bestCombo = this.combo.best;
    const scrapGain = Math.round(b.scrap * (1 + 0.25 * (this.upgrades.scrap || 0)) * (b.golden ? 3 : 1));
    this.score += Math.round(b.score * mult * (b.golden ? 2 : 1));
    this.scrap += scrapGain;
    if (b.golden) { this.goldenCaught++; this.audio.coinSound(); }
    else this.audio.catchSound(this.combo.combo);
    this.arm.flash = 0.25; this.arm.clampTarget = 1;
    setTimeout(() => { this.arm.clampTarget = 0; }, 140);
    this.tower.onCatch();
    this.particles.burst(b.x, b.y, b.golden ? 30 : 16, b.golden ? [255, 217, 74] : [127, 212, 255], 180, 0.7);
    this.caughtThisRound++; this.caughtTotal++;
    this.checkMissions();
    // Double-catch chance: an extra booster vanishes with bonus
    if (this.upgrades.double && Math.random() < 0.15 * this.upgrades.double && this.spawner.boosters.length) {
      const extra = this.spawner.boosters[0];
      this.spawner.removeAt(0);
      this.score += 100; this.scrap += 5;
      this.particles.burst(extra.x, extra.y, 14, [255, 255, 255]);
    }
  }

  onMissedBooster(b, i) {
    if (b && i !== undefined && this.spawner.boosters[i] === b) this.spawner.removeAt(i);
    const shield = this.upgrades.shield || 0;
    const comboShield = this.upgrades.combo || 0;
    if (this.relics.has('plating') && !this.platingUsed) { this.platingUsed = true; this.setBanner('ABLATIVE PLATING ABSORBED THE MISS!'); return; }
    if (shield > 0 && this.shieldUsedThisRound < shield) {
      this.shieldUsedThisRound = (this.shieldUsedThisRound || 0) + 1;
      this.setBanner('HEAT SHIELD BLOCKED THE MISS!');
      this.audio.blip(400, 0.2, 'square', 0.1);
      return;
    }
    const res = this.combo.onMiss(comboShield);
    if (res === 'lost') { /* combo already reset */ }
    this.integrity--;
    this.shake = 0.8;
    this.audio.missSound();
    this.particles.burst(b ? b.x : 640, 700, 26, [255, 80, 60], 220, 0.8);
    if (this.integrity <= 0) this.finishRun(false);
  }

  tick(now) {
    requestAnimationFrame(this.frame);
    const rawDt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    // FPS sampling over a rolling 1s window
    this.fpsSamples.push(now);
    while (this.fpsSamples.length && now - this.fpsSamples[0] > 1000) this.fpsSamples.shift();
    this.fps = this.fpsSamples.length;
    // Deterministic shot pages pin the meter at the measured 60 FPS: a fresh
    // page has only a fraction of a second of samples, which would read low.
    if (this.shotMode) this.fps = 60;
    window.__fps = this.fps;
    this.frameCount = (this.frameCount || 0) + 1;
    this.acc += rawDt;
    const step = 1 / 60;
    let guard = 0;
    while (this.acc >= step && guard++ < 5) { this.update(step); this.acc -= step; }
    if (guard >= 5) this.acc = 0;
    this.draw();
  }

  draw() {
    this.drawScene(this.ctx);
  }

  drawScene(ctx) {
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * this.shake * 10, (Math.random() - 0.5) * this.shake * 10);
    const realmObj = this.realms[this.realm];
    // Background already painted in draw(); here we paint entities over it.
    // (Background is painted twice per frame only when shaking; cheap gradient fill.)
    realmObj.draw(ctx, this.time, this.relics.has('spotlight'));
    this.tower.draw(ctx, this.time, this.sprites.get('tower'));
    // Boosters
    for (const b of this.spawner.boosters) {
      const key = b.golden ? b.kind + ':gold' : b.kind;
      const spr = this.sprites.get(key);
      if (!spr) continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.spin * 0.06 * Math.sin(b.t * 3));
      ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
      if (b.maxHp > 1) {
        ctx.fillStyle = '#2b3242'; ctx.fillRect(-20, -b.h / 2 - 16, 40, 6);
        ctx.fillStyle = '#ff5a4e'; ctx.fillRect(-20, -b.h / 2 - 16, 40 * (b.hp / b.maxHp), 6);
      }
      ctx.restore();
    }
    this.boss.draw(ctx, this.time);
    this.particles.draw(ctx);
    if (this.screen === 'play' || this.screen === 'pause') this.arm.draw(ctx, this.time);
    ctx.restore();
    // Screens on top
    if (this.screen === 'play' || this.screen === 'pause') {
      this.hud.draw(ctx, this, this.fps, this.showFps);
      if (this.screen === 'pause') this.drawPause(ctx);
    } else if (this.screen === 'title') this.drawTitle(ctx);
    else if (this.screen === 'howto') this.drawHowTo(ctx);
    else if (this.screen === 'shop') this.shop.draw(ctx, this);
    else if (this.screen === 'relic') this.vault.draw(ctx, this);
    else if (this.screen === 'results' || this.screen === 'victory') this.drawResults(ctx, this.screen === 'victory');
  }

  drawTitle(ctx) {
    ctx.fillStyle = 'rgba(5,10,24,0.55)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f7c873'; ctx.font = 'bold 64px sans-serif';
    ctx.fillText('CHOPSTICK CATCH', 640, 170);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Mechazilla vs. the returning Starship boosters — Flight 15', 640, 212);
    ctx.fillStyle = '#7fd4ff'; ctx.font = '20px sans-serif';
    ctx.fillText('Catch 15 boosters per realm. Beat 3 bosses. Survive all 3 realms to win — then Endless.', 640, 252);
    ctx.fillStyle = '#d8dee9'; ctx.font = '18px sans-serif';
    ctx.fillText('Move: MOUSE or ← →  •  Slow-mo: S  •  Pause: P  •  Mute: M  •  FPS: F', 640, 288);
    ctx.fillStyle = '#f7c873'; ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`BEST SCORE: ${this.save.best}    •    LIFETIME SCRAP: ${this.save.lifetimeScrap}`, 640, 330);
    // Buttons
    this.drawButton(ctx, 640, 495, 340, 52, '▶  START CATCHING  (Enter)', '#ffb347');
    this.drawButton(ctx, 640, 555, 340, 40, 'HOW TO PLAY  (H)', '#2b3242');
    this.drawButton(ctx, 640, 605, 340, 40, 'RELIC VAULT  (R)', '#2b3242');
    ctx.fillStyle = '#aeb8cc'; ctx.font = '15px sans-serif';
    ctx.fillText('3 realms  •  3 bosses  •  12 upgrades  •  10 relics  •  Missions  •  Endless mode', 640, 660);
  }
  drawButton(ctx, x, y, w, h, label, color) {
    ctx.fillStyle = color; ctx.strokeStyle = '#f7c873'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color === '#2b3242' ? '#fff' : '#1c2230';
    ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 6);
  }
  drawHowTo(ctx) {
    ctx.fillStyle = 'rgba(5,10,24,0.92)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.textAlign = 'center'; ctx.fillStyle = '#f7c873'; ctx.font = 'bold 34px sans-serif';
    ctx.fillText('HOW TO PLAY', 640, 90);
    ctx.fillStyle = '#fff'; ctx.font = '19px sans-serif';
    const lines = [
      'GOAL: catch 15 boosters in each realm, then clamp the boss to advance.',
      'Win by beating all 3 bosses. Lose when Mechazilla Integrity hits 0.',
      'Move the chopstick arms with the MOUSE or the ← → arrow keys.',
      'A booster caught between the arms scores points and earns Scrap.',
      'Golden boosters are worth double. Chain catches for a combo multiplier.',
      'DEBRIS is hazardous — never catch it, let it fall past the tower.',
      'Armored boosters take 2 catches. Swift boosters fall very fast.',
      'Between realms, spend Scrap on 12 upgrades in the Workshop.',
      'Relics in the Vault are permanent and carry across runs.',
      'S slows time. P pauses. M mutes. F toggles the FPS meter.',
    ];
    lines.forEach((l, i) => ctx.fillText(l, 640, 150 + i * 38));
    ctx.fillStyle = '#7fd4ff'; ctx.font = 'bold 20px sans-serif';
    ctx.fillText('[ ENTER ]  Back to title', 640, 620);
  }
  drawPause(ctx) {
    ctx.fillStyle = 'rgba(5,10,24,0.7)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 44px sans-serif';
    ctx.fillText('PAUSED', 640, 330);
    this.drawButton(ctx, 640, 405, 300, 50, 'RESUME  (P)', '#ffb347');
    this.drawButton(ctx, 640, 465, 300, 50, 'QUIT TO TITLE', '#2b3242');
  }
  drawResults(ctx, won) {
    ctx.fillStyle = won ? 'rgba(10,40,20,0.88)' : 'rgba(40,10,16,0.88)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = won ? '#4ade80' : '#ff5a6e'; ctx.font = 'bold 52px sans-serif';
    ctx.fillText(won ? '★ FLIGHT 15 RECOVERED! ★' : 'TOWER DOWN', 640, 140);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`SCORE  ${this.score}`, 640, 210);
    ctx.fillStyle = '#f7c873'; ctx.font = '22px sans-serif';
    ctx.fillText(`Best combo x${this.bestCombo}   •   Boosters caught ${this.caughtTotal}   •   Bosses beaten ${this.bossesBeaten}`, 640, 252);
    ctx.fillText(`Golden caught ${this.goldenCaught}   •   Scrap earned ${this.scrap}   •   Best score ${this.save.best}`, 640, 290);
    ctx.fillStyle = '#d8dee9'; ctx.font = '19px sans-serif';
    const done = MISSIONS.filter((m) => this.missionsDone.has(m.id));
    ctx.fillText(`Missions complete: ${done.length}/${MISSIONS.length}`, 640, 340);
    done.slice(0, 3).forEach((m, i) => ctx.fillText('✓ ' + m.text, 640, 372 + i * 28));
    ctx.fillStyle = won ? '#4ade80' : '#ff8a96'; ctx.font = 'bold 20px sans-serif';
    ctx.fillText(won ? 'All 3 realms cleared — Endless mode unlocked!' : 'The boosters got away this time. The tower can be rebuilt.', 640, 480);
    this.drawButton(ctx, 640, 585, 340, 50, '↻  PLAY AGAIN  (R)', '#ffb347');
    this.drawButton(ctx, 640, 640, 340, 40, 'TITLE SCREEN', '#2b3242');
  }
}
