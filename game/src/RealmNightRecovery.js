// RealmNightRecovery.js — Realm 3: Night Recovery. Near-dark sky, sweeping
// searchlights from the tower, stars, low visibility outside the beams.
import { VIEW_W, VIEW_H } from './GameConfig.js';
export class RealmNightRecovery {
  constructor() {
    this.stars = [];
    for (let i = 0; i < 120; i++) this.stars.push({ x: Math.random() * 1280, y: Math.random() * 420, r: Math.random() * 1.6 + 0.4, p: Math.random() * 6 });
  }
  windAt() { return 0; }
  draw(ctx, t, bright) {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, '#050914'); g.addColorStop(0.6, '#0d1b3a'); g.addColorStop(1, '#1c2f5e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    for (const s of this.stars) {
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + s.p));
      ctx.fillStyle = '#dfe8ff';
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;
    // Moon
    ctx.fillStyle = '#e8eefc';
    ctx.beginPath(); ctx.arc(180, 110, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c4cfe8';
    ctx.beginPath(); ctx.arc(168, 100, 8, 0, Math.PI * 2); ctx.arc(192, 122, 6, 0, Math.PI * 2); ctx.fill();
    // Searchlight beams sweeping from the tower
    const beamA = Math.sin(t * 0.55) * 0.7;
    const beamB = Math.sin(t * 0.4 + 2.1) * 0.8;
    for (const a of [beamA, beamB]) {
      ctx.save();
      ctx.translate(640, 600);
      ctx.rotate(a);
      const bg = ctx.createLinearGradient(0, 0, 0, -620);
      bg.addColorStop(0, 'rgba(255,244,180,0.34)'); bg.addColorStop(1, 'rgba(255,244,180,0)');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(190, -620); ctx.lineTo(-190, -620); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#14161f'; ctx.fillRect(0, 600, VIEW_W, 120);
    ctx.fillStyle = '#232733'; ctx.fillRect(0, 600, VIEW_W, 8);
    // Darkness overlay (reduced when the Spotlight Array relic is owned)
    const dark = bright ? 0.18 : 0.45;
    ctx.fillStyle = `rgba(3,6,18,${dark})`; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
