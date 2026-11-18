// HudDisplay.js — score, Scrap, combo, Integrity hearts, realm progress,
// boss bar, FPS meter, and transient banners. Pure drawing, no state of its own.
import { CATCHES_PER_ROUND } from './GameConfig.js';

export class HudDisplay {
  draw(ctx, s, fps, showFps) {
    // Top bar
    ctx.fillStyle = 'rgba(5,10,24,0.72)';
    ctx.fillRect(0, 0, 1280, 54);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`SCORE ${s.score}`, 16, 34);
    ctx.fillStyle = '#f7c873'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`SCRAP ${s.scrap}`, 210, 33);
    // Combo lives on its own row under the score so it never collides
    // with the centred realm title.
    ctx.fillStyle = '#7fd4ff'; ctx.font = 'bold 16px sans-serif';
    ctx.fillText(s.combo.label(), 16, 78);
    // Realm + progress
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d8dee9'; ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${s.realmName}  •  ROUND ${s.realm + 1}/3`, 640, 24);
    const pw = 260, px = 640 - pw / 2;
    ctx.fillStyle = '#2b3242'; ctx.fillRect(px, 32, pw, 10);
    ctx.fillStyle = '#4ade80'; ctx.fillRect(px, 32, pw * Math.min(1, s.caughtThisRound / CATCHES_PER_ROUND), 10);
    ctx.fillStyle = '#d8dee9'; ctx.font = '13px sans-serif';
    ctx.fillText(`Caught ${s.caughtThisRound}/${CATCHES_PER_ROUND}`, 640, 50);
    // Integrity hearts (right)
    ctx.textAlign = 'right'; ctx.font = 'bold 20px sans-serif';
    let hearts = '';
    for (let i = 0; i < s.maxIntegrity; i++) hearts += i < s.integrity ? '♥ ' : '♡ ';
    ctx.fillStyle = '#ff5a6e'; ctx.fillText(hearts, 1264, 34);
    if (showFps) {
      ctx.fillStyle = fps >= 55 ? '#4ade80' : '#ffb347';
      ctx.font = 'bold 14px monospace'; ctx.textAlign = 'right';
      ctx.fillText(`${fps.toFixed(0)} FPS`, 1264, 78);
    }
    // Boss bar (s.boss is the BossFight; the boss def lives on .boss)
    if (s.bossActive && s.boss && s.boss.boss) {
      const bb = s.boss.boss;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff5a4e'; ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`BOSS — ${bb.name}`, 640, 92);
      ctx.fillStyle = '#2b3242'; ctx.fillRect(490, 100, 300, 12);
      ctx.fillStyle = '#ff5a4e'; ctx.fillRect(490, 100, 300 * (bb.hp / bb.maxHp), 12);
    }
    // Banner
    if (s.banner && s.bannerT > 0) {
      ctx.globalAlpha = Math.min(1, s.bannerT * 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff'; ctx.font = 'bold 38px sans-serif';
      ctx.fillText(s.banner, 640, 300);
      ctx.globalAlpha = 1;
    }
    // Slow-mo vignette
    if (s.slowMo > 0) {
      ctx.strokeStyle = 'rgba(127,212,255,0.8)'; ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 1270, 710);
      ctx.fillStyle = '#7fd4ff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('SLOW-MO', 16, 100);
    }
  }
}
