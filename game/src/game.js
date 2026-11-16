// The game itself: the state machine (title, playing, victory, game over,
// paused), the spawn director, the difficulty ramp, scoring, combos, lives,
// and winning and losing. One update step and one render call per frame; the
// animation loop lives in main.js.

import { WATERLINE, GAME, POINTS } from './config.js';
import { makeRng } from './random.js';
import {
  makeBooster,
  makeShip,
  makeDebris,
  updateFaller,
  drawFaller,
  fallerPastWaterline,
} from './entities.js';
import { Tower } from './tower.js';
import { Particles } from './particles.js';
import { Background } from './background.js';
import {
  Popups,
  drawHud,
  drawTitle,
  drawVictory,
  drawGameOver,
  drawPaused,
} from './hud.js';

export class Game {
  constructor(canvas, sound, input, opts = {}) {
    this.canvas = canvas;
    this.sound = sound;
    this.input = input;
    this.seed = opts.seed ?? ((Math.random() * 1e9) | 0);
    this.rng = makeRng(this.seed);
    this.background = new Background(makeRng(this.seed ^ 0x9e3779b9));
    this.tower = new Tower();
    this.particles = new Particles();
    this.popups = new Popups();
    this.state = 'title';
    this.time = 0;
    this.score = 0;
    this.combo = 1;
    this.lives = GAME.lives;
    this.caught = 0;
    this.best = this.loadBest();
    this.endless = false;
    this.fallers = [];
    this.ambientFallers = [];
    this.spawnTimerMs = 1200;
    this.spawnCount = 0;
    this.wind = 0;
    this.windTarget = 0;
    this.windTimer = 0;
    this.confettiTimer = 0;
    this.endAt = -10;
    this.muted = false;
  }

  loadBest() {
    try {
      return Number(window.localStorage.getItem('chopstick-catch-best') || 0) || 0;
    } catch {
      return 0;
    }
  }

  saveBest() {
    if (this.score > this.best) {
      this.best = this.score;
      try {
        window.localStorage.setItem('chopstick-catch-best', String(this.best));
      } catch {
        /* storage unavailable: best score just does not persist */
      }
    }
  }

  fallSpeed() {
    return Math.min(GAME.maxFallSpeed, GAME.baseFallSpeed + this.caught * GAME.fallSpeedPerCatch);
  }

  spawnIntervalMs() {
    return Math.max(GAME.minSpawnMs, GAME.baseSpawnMs - this.caught * 55);
  }

  maxConcurrent() {
    return Math.min(3, 1 + Math.floor(this.caught / 4));
  }

  startGame() {
    this.score = 0;
    this.combo = 1;
    this.lives = GAME.lives;
    this.caught = 0;
    this.endless = false;
    this.fallers = [];
    this.ambientFallers = [];
    this.spawnTimerMs = 900;
    this.spawnCount = 0;
    this.wind = 0;
    this.windTarget = 0;
    this.tower = new Tower();
    this.particles.clear();
    this.popups.clear();
    this.input.clearAll();
    this.state = 'playing';
    this.sound.ensure();
    this.sound.startAmbient();
    this.sound.click();
  }

  continueEndless() {
    this.endless = true;
    this.input.clearAll();
    this.state = 'playing';
    this.sound.click();
  }

  spawnFaller() {
    const speed = this.fallSpeed();
    let f;
    if (this.spawnCount % GAME.shipEvery === GAME.shipEvery - 1 && this.caught >= 4) {
      f = makeShip(this.rng, speed);
    } else if (this.rng.next() < GAME.debrisChance) {
      f = makeDebris(this.rng, speed);
    } else {
      f = makeBooster(this.rng, speed);
    }
    this.spawnCount++;
    this.fallers.push(f);
  }

  resolveCatch(f) {
    if (f.kind === 'debris') {
      this.lives -= 1;
      this.combo = 1;
      this.tower.addShake(10);
      this.sound.debrisSound();
      this.popups.add(f.x, f.y - 34, 'DEBRIS!', '#ff5a5a', 30);
      this.particles.burst(f.x, f.y, {
        count: 14,
        speed: 160,
        life: 0.6,
        size: 5,
        colors: ['#4a4a55', '#6a6a78', '#ff4d4d'],
        gravity: 200,
      });
      if (this.lives <= 0) this.endGame(false);
      return;
    }
    const perfect = this.tower.isPerfect(f);
    const gained = f.points * this.combo + (perfect ? POINTS.perfectBonus : 0);
    this.score += gained;
    this.caught += 1;
    this.popups.add(
      f.x,
      f.y - 44,
      perfect ? `+${gained} PERFECT!` : `+${gained}`,
      perfect ? '#ffe9a8' : '#7dff8a',
      perfect ? 34 : 28,
    );
    this.particles.catchSparkle(f.x, f.y, perfect);
    if (perfect) this.sound.perfectSound();
    else this.sound.catchSound(this.combo);
    this.combo = Math.min(this.combo + 1, GAME.maxCombo);
    if (!this.endless && this.caught >= GAME.goal) this.endGame(true);
  }

  missFaller(f) {
    this.particles.explosion(f.x, WATERLINE);
    this.sound.explosionSound();
    this.tower.addShake(12);
    this.lives -= 1;
    this.combo = 1;
    this.popups.add(f.x, WATERLINE - 60, 'MISS', '#ff5a5a', 30);
    if (this.lives <= 0) this.endGame(false);
  }

  endGame(won) {
    this.saveBest();
    this.input.clearAll();
    this.endAt = this.time;
    this.state = won ? 'victory' : 'gameover';
    if (won) {
      this.sound.winSound();
      this.particles.confetti(420, 200);
      this.particles.confetti(860, 200);
      this.confettiTimer = 0.4;
    } else {
      this.sound.loseSound();
    }
  }

  update(dt) {
    this.time += dt;
    if (this.input.takeMute()) {
      this.muted = !this.muted;
      this.sound.setMuted(this.muted);
    }
    if (this.input.takePause()) {
      if (this.state === 'playing') this.state = 'paused';
      else if (this.state === 'paused') this.state = 'playing';
    }

    if (this.state === 'title') {
      this.updateTitle(dt);
      if (this.input.takeStart() || this.input.takeRestart()) this.startGame();
      return;
    }
    if (this.state === 'paused') return;
    if (this.state === 'victory') {
      this.particles.update(dt);
      this.popups.update(dt);
      this.confettiTimer -= dt;
      if (this.confettiTimer <= 0) {
        this.particles.confetti(200 + Math.random() * 880, 140 + Math.random() * 120);
        this.confettiTimer = 0.7;
      }
      // A 0.6 s grace period: the click or keypress that ended the flight
      // (a double-click to catch, the final miss) must not skip this screen.
      const startPressed = this.input.takeStart();
      const restartPressed = this.input.takeRestart();
      if (this.time - this.endAt > 0.6) {
        if (startPressed) this.continueEndless();
        else if (restartPressed) this.startGame();
      }
      return;
    }
    if (this.state === 'gameover') {
      this.particles.update(dt);
      this.popups.update(dt);
      const startPressed = this.input.takeStart();
      const restartPressed = this.input.takeRestart();
      if (this.time - this.endAt > 0.6) {
        if (startPressed || restartPressed) this.startGame();
      }
      return;
    }

    this.tower.update(dt, this.input.pointerY, this.input.armKeyDirection(), this.input.pointerSeen);
    this.input.takeStart(); // clicks during play must not start the next screen
    if (this.input.takeClose()) {
      if (this.tower.requestClose()) this.sound.click();
    }
    if (this.input.takeRestart()) {
      this.startGame();
      return;
    }

    this.windTimer -= dt;
    if (this.windTimer <= 0) {
      const strength = 1 + Math.min(this.caught * 0.04, 0.6);
      this.windTarget = this.rng.range(-80, 80) * strength;
      this.windTimer = this.rng.range(2.5, 5);
    }
    this.wind += (this.windTarget - this.wind) * (1 - Math.exp(-dt * 1.2));

    this.spawnTimerMs -= dt * 1000;
    if (this.spawnTimerMs <= 0 && this.fallers.length < this.maxConcurrent()) {
      this.spawnFaller();
      this.spawnTimerMs = this.spawnIntervalMs() * this.rng.range(0.8, 1.2);
    }

    const slot = this.tower.catchSlot();
    const closed = this.tower.isClosed();
    for (let i = this.fallers.length - 1; i >= 0; i--) {
      const f = this.fallers[i];
      updateFaller(f, dt, this.wind, this.time);
      if (closed && f.x >= slot.x0 && f.x <= slot.x1 && f.y >= slot.y0 && f.y <= slot.y1) {
        this.fallers.splice(i, 1);
        this.resolveCatch(f);
        if (this.state !== 'playing') return;
        continue;
      }
      if (fallerPastWaterline(f)) {
        this.fallers.splice(i, 1);
        if (f.kind === 'debris') {
          this.particles.burst(f.x, WATERLINE, {
            count: 8,
            speed: 90,
            life: 0.5,
            size: 4,
            colors: ['#8a8f9e', '#5a7a9e'],
            gravity: 120,
          });
        } else {
          this.missFaller(f);
        }
        if (this.state !== 'playing') return;
      }
    }

    this.particles.update(dt);
    this.popups.update(dt);
  }

  updateTitle(dt) {
    this.tower.armTargetY = 300 + Math.sin(this.time * 0.7) * 130;
    this.tower.update(dt, this.tower.armTargetY, 0, false);
    if (this.ambientFallers.length < 2 && Math.random() < dt * 0.7) {
      const f = makeBooster(this.rng, 90);
      f.y = -90;
      this.ambientFallers.push(f);
    }
    for (let i = this.ambientFallers.length - 1; i >= 0; i--) {
      const f = this.ambientFallers[i];
      updateFaller(f, dt, 12, this.time);
      if (f.y > WATERLINE + 40) this.ambientFallers.splice(i, 1);
    }
    this.particles.update(dt);
    this.popups.update(dt);
  }

  hudState() {
    let nearest = null;
    for (const f of this.fallers) {
      if (f.kind === 'debris') continue;
      if (!nearest || f.y > nearest.y) nearest = f;
    }
    return {
      score: this.score,
      combo: this.combo,
      lives: this.lives,
      caught: this.caught,
      wind: this.wind,
      nearest,
      muted: this.muted,
    };
  }

  render(ctx) {
    this.background.draw(ctx, this.time);
    // The tower column sits behind the falling objects and the arms close
    // around them in front, so a booster is never hidden at the catch moment.
    ctx.save();
    if (this.tower.shake > 0.2) {
      ctx.translate((Math.random() - 0.5) * this.tower.shake, (Math.random() - 0.5) * this.tower.shake);
    }
    this.tower.drawColumn(ctx, this.time);
    const flying = this.state === 'title' ? this.ambientFallers : this.fallers;
    for (const f of flying) drawFaller(ctx, f, this.time);
    this.tower.drawArms(ctx);
    this.particles.draw(ctx);
    ctx.restore();
    this.popups.draw(ctx);
    if (this.state === 'playing' || this.state === 'paused') drawHud(ctx, this.hudState());
    if (this.state === 'title') drawTitle(ctx, this.time, this.best);
    else if (this.state === 'victory') drawVictory(ctx, this.score, this.best);
    else if (this.state === 'gameover') drawGameOver(ctx, this.score, this.best, this.caught);
    else if (this.state === 'paused') drawPaused(ctx);
  }

  // Scripted, deterministic states for screenshots: real renders of the game
  // code with a frozen state, reached through the same fields live play uses.
  loadShot(name, seed) {
    this.rng = makeRng(seed);
    this.time = 3.53;
    if (name === 'start') {
      this.state = 'title';
      this.best = 1250;
      this.ambientFallers = [
        { ...makeBooster(this.rng, 90), x: 430, y: 210 },
        { ...makeShip(this.rng, 70), x: 870, y: 130 },
      ];
      this.tower.armY = 330;
      this.tower.armTargetY = 330;
      return;
    }
    if (name === 'play') {
      this.state = 'playing';
      this.score = 1250;
      this.combo = 3;
      this.lives = 3;
      this.caught = 7;
      this.wind = 24;
      this.tower.armY = 330;
      this.tower.armTargetY = 330;
      this.tower.gap = 0;
      this.tower.closeTimerMs = 150;
      this.fallers = [
        { ...makeBooster(this.rng, 150), x: 640, y: 330 },
        { ...makeBooster(this.rng, 150), x: 520, y: 170 },
        { ...makeDebris(this.rng, 170), x: 830, y: 430 },
      ];
      this.particles.catchSparkle(640, 330, true);
      this.particles.update(0.35);
      this.popups.add(640, 272, '+300 PERFECT!', '#ffe9a8', 34);
      this.popups.update(0.2);
      return;
    }
    if (name === 'combo') {
      this.state = 'playing';
      this.score = 3400;
      this.combo = 5;
      this.lives = 3;
      this.caught = 11;
      this.wind = -32;
      this.tower.armY = 400;
      this.tower.armTargetY = 400;
      this.tower.gap = 0.5;
      this.fallers = [
        { ...makeBooster(this.rng, 200), x: 600, y: 400 },
        { ...makeBooster(this.rng, 200), x: 770, y: 150 },
        { ...makeShip(this.rng, 150), x: 470, y: 260 },
        { ...makeDebris(this.rng, 210), x: 910, y: 500 },
      ];
      this.particles.catchSparkle(600, 400, true);
      this.particles.update(0.3);
      this.popups.add(600, 344, '+900 PERFECT!', '#ffe9a8', 34);
      this.popups.update(0.2);
      return;
    }
    if (name === 'victory') {
      this.state = 'victory';
      this.score = 4850;
      this.best = 4850;
      this.caught = GAME.goal;
      this.particles.confetti(420, 200);
      this.particles.confetti(860, 200);
      this.particles.update(0.5);
      return;
    }
    if (name === 'gameover') {
      this.state = 'gameover';
      this.score = 2100;
      this.best = 4850;
      this.caught = 9;
      return;
    }
  }
}
