// RealmStormFront.js — Realm 2: Storm Front. Wind shear gusts, rain streaks,
// grey-green sky, lightning flashes.
import { VIEW_W, VIEW_H } from './GameConfig.js';
export class RealmStormFront {
  constructor() {
    this.rain = [];
    for (let i = 0; i < 90; i++) this.rain.push({ x: Math.random() * 1280, y: Math.random() * 720, v: 520 + Math.random() * 260 });
    this.flash = 0; this.nextFlash = 6;
  }
  windAt(t) { return Math.sin(t * 1.7) * 0.9 + Math.sin(t * 0.6) * 0.5; }
  update(dt, t) {
    this.nextFlash -= dt;
    if (this.nextFlash <= 0) { this.flash = 0.18; this.nextFlash = 5 + Math.random() * 8; }
    if (this.flash > 0) this.flash -= dt;
    for (const r of this.rain) {
      r.y += r.v * dt; r.x -= 60 * dt;
      if (r.y > 720) { r.y = -10; r.x = Math.random() * 1400; }
    }
  }
  draw(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, '#1c2733'); g.addColorStop(0.6, '#3d5a6b'); g.addColorStop(1, '#7d94a3');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (this.flash > 0) { ctx.fillStyle = `rgba(220,235,255,${this.flash * 2.2})`; ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
    // Storm clouds
    ctx.fillStyle = 'rgba(20,28,36,0.8)';
    for (let i = 0; i < 6; i++) {
      const cx = ((i * 260 + t * -14) % 1500 + 1500) % 1500 - 120;
      ctx.beginPath(); ctx.ellipse(cx, 70 + (i % 3) * 36, 130, 34, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Rain
    ctx.strokeStyle = 'rgba(180,210,235,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const r of this.rain) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 4, r.y + 16); }
    ctx.stroke();
    ctx.fillStyle = '#232a2e'; ctx.fillRect(0, 600, VIEW_W, 120);
    ctx.fillStyle = '#39444a'; ctx.fillRect(0, 600, VIEW_W, 8);
    ctx.fillStyle = 'rgba(125,148,163,0.12)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
