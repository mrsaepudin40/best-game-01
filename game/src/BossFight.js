// BossFight.js — the three realm bosses. Each drifts across the sky; the player
// clamps it with the chopsticks when it crosses the catch line. HP hits to win.
import { BOSSES } from './GameConfig.js';

export class BossFight {
  constructor() { this.active = false; this.boss = null; this.x = 640; this.y = -200; this.dir = 1; this.t = 0; }
  start(kind) {
    const def = BOSSES[kind];
    this.boss = { kind, name: def.name, hp: def.hp, maxHp: def.hp, w: def.w, h: def.h, speed: def.speed, color: def.color, desc: def.desc };
    this.active = true; this.x = 640; this.y = 120; this.dir = 1; this.t = 0;
    return this.boss;
  }
  update(dt, armX, arm) {
    if (!this.active) return null;
    this.t += dt;
    const b = this.boss;
    // Boss weaves side to side and slowly descends toward the catch line, then rises.
    this.x += this.dir * b.speed * (1 + Math.sin(this.t * 0.7) * 0.6) * dt;
    if (this.x < 140) { this.x = 140; this.dir = 1; }
    if (this.x > 1140) { this.x = 1140; this.dir = -1; }
    this.y = 150 + Math.sin(this.t * 0.9) * 90 + (1 - b.hp / b.maxHp) * 120;
    // Clamp: boss centre inside the arm gap while near the catch line.
    if (this.y > 430 && Math.abs(this.x - armX) < arm.width / 2 + b.w / 4) {
      b.hp--;
      arm.clampTarget = 1; arm.flash = 0.4;
      setTimeout(() => { arm.clampTarget = 0; }, 220);
      this.y = 130; // knocked back up
      if (b.hp <= 0) { this.active = false; return 'beaten'; }
      return 'hit';
    }
    return null;
  }
  draw(ctx, time) {
    if (!this.active) return;
    const b = this.boss;
    ctx.save();
    ctx.translate(this.x, this.y + Math.sin(time * 3) * 4);
    ctx.rotate(Math.sin(this.t * 1.4) * 0.08);
    const grad = ctx.createLinearGradient(-b.w / 2, 0, b.w / 2, 0);
    grad.addColorStop(0, '#5a6478'); grad.addColorStop(0.4, b.color); grad.addColorStop(1, '#3a4356');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -b.h / 2);
    ctx.quadraticCurveTo(b.w / 2, -b.h / 4, b.w / 2, 0);
    ctx.lineTo(b.w / 2, b.h / 2 - 20); ctx.lineTo(0, b.h / 2);
    ctx.lineTo(-b.w / 2, b.h / 2 - 20); ctx.lineTo(-b.w / 2, 0);
    ctx.quadraticCurveTo(-b.w / 2, -b.h / 4, 0, -b.h / 2);
    ctx.fill();
    ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#0e1a2e';
    ctx.beginPath(); ctx.arc(0, -b.h / 4, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff3b30';
    ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(b.name, 0, -b.h / 2 - 12);
    // HP pips
    for (let i = 0; i < b.maxHp; i++) {
      ctx.fillStyle = i < b.hp ? '#ff5a4e' : '#3a4356';
      ctx.fillRect(-b.maxHp * 14 + i * 28, b.h / 2 - 34, 22, 8);
    }
    // Exhaust flame
    ctx.fillStyle = 'rgba(255,140,50,0.85)';
    ctx.beginPath();
    ctx.moveTo(-16, b.h / 2); ctx.quadraticCurveTo(0, b.h / 2 + 44 + Math.sin(time * 22) * 10, 16, b.h / 2);
    ctx.fill();
    ctx.restore();
  }
}
