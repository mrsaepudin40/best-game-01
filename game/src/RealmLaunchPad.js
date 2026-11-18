// RealmLaunchPad.js — Realm 1: Launch Pad Dawn. Golden sunrise gradient,
// distant launch towers, drifting clouds, calm air.
import { VIEW_W, VIEW_H } from './GameConfig.js';
export class RealmLaunchPad {
  constructor() { this.clouds = []; for (let i = 0; i < 7; i++) this.clouds.push({ x: Math.random() * 1280, y: 60 + Math.random() * 180, s: 0.6 + Math.random() * 0.9, v: 8 + Math.random() * 10 }); }
  windAt(t) { return Math.sin(t * 0.5) * 0.08; }
  draw(ctx, t, sprites) {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, '#2b4a7a'); g.addColorStop(0.55, '#e88a4a'); g.addColorStop(1, '#f7c873');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // Sun
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.arc(1050, 130, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,243,196,0.25)';
    ctx.beginPath(); ctx.arc(1050, 130, 78, 0, Math.PI * 2); ctx.fill();
    // Distant towers (parallax layer 1)
    ctx.fillStyle = 'rgba(40,30,40,0.55)';
    for (const [x, h] of [[120, 180], [260, 240], [980, 200], [1140, 160]]) {
      ctx.fillRect(x, 560 - h, 26, h);
      ctx.fillRect(x - 8, 560 - h - 18, 42, 18);
    }
    // Clouds
    ctx.fillStyle = 'rgba(255,240,220,0.75)';
    for (const c of this.clouds) {
      const cx = ((c.x + t * c.v) % 1400) - 100;
      ctx.beginPath();
      ctx.ellipse(cx, c.y, 70 * c.s, 20 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 40 * c.s, c.y + 6, 46 * c.s, 15 * c.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Ground
    ctx.fillStyle = '#3a2c22'; ctx.fillRect(0, 600, VIEW_W, 120);
    ctx.fillStyle = '#574433'; ctx.fillRect(0, 600, VIEW_W, 8);
    ctx.fillStyle = 'rgba(247,200,115,0.16)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
