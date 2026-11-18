// UpgradeShop.js — the between-rounds shop. Twelve upgrades bought with Scrap;
// each purchase is a real choice because Scrap is scarce.
import { UPGRADES } from './GameConfig.js';

export class UpgradeShop {
  constructor() { this.selected = 0; }
  costOf(u, level) { return Math.round(u.cost * (1 + level * 0.6)); }
  buy(state, id) {
    const u = UPGRADES.find((x) => x.id === id);
    if (!u) return false;
    const level = state.upgrades[id] || 0;
    if (level >= u.max) return false;
    const cost = this.costOf(u, level);
    if (state.scrap < cost) return false;
    state.scrap -= cost;
    state.upgrades[id] = level + 1;
    return true;
  }
  draw(ctx, state) {
    ctx.fillStyle = 'rgba(5,10,24,0.88)';
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#f7c873'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('WORKSHOP — SPEND SCRAP', 640, 62);
    ctx.fillStyle = '#d8dee9'; ctx.font = '18px sans-serif';
    ctx.fillText(`Scrap: ${state.scrap}   •   Click an upgrade to buy   •   Press ENTER to continue`, 640, 96);
    const cols = 3, cw = 380, ch = 118, gapX = 24, gapY = 16;
    const x0 = 640 - (cols * cw + (cols - 1) * gapX) / 2;
    const y0 = 130;
    UPGRADES.forEach((u, i) => {
      const level = state.upgrades[u.id] || 0;
      const maxed = level >= u.max;
      const cost = this.costOf(u, level);
      const afford = state.scrap >= cost && !maxed;
      const cx = x0 + (i % cols) * (cw + gapX);
      const cy = y0 + Math.floor(i / cols) * (ch + gapY);
      ctx.fillStyle = afford ? '#1d2f4a' : '#141a26';
      ctx.strokeStyle = afford ? '#f7c873' : '#3a4356'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(u.name, cx + 14, cy + 28);
      ctx.fillStyle = '#aeb8cc'; ctx.font = '13px sans-serif';
      ctx.fillText(u.desc, cx + 14, cy + 52);
      ctx.fillStyle = '#f7c873'; ctx.font = 'bold 15px sans-serif';
      ctx.fillText(maxed ? 'MAXED' : `Lv ${level}/${u.max} — ${cost} Scrap`, cx + 14, cy + 82);
      // Level pips
      for (let p = 0; p < u.max; p++) {
        ctx.fillStyle = p < level ? '#ffb347' : '#3a4356';
        ctx.fillRect(cx + 14 + p * 20, cy + 94, 14, 8);
      }
    });
    ctx.fillStyle = '#7fd4ff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('[ ENTER ]  Next realm', 640, 690);
  }
  click(state, mx, my) {
    const cols = 3, cw = 380, ch = 118, gapX = 24, gapY = 16;
    const x0 = 640 - (cols * cw + (cols - 1) * gapX) / 2;
    const y0 = 130;
    for (let i = 0; i < UPGRADES.length; i++) {
      const cx = x0 + (i % cols) * (cw + gapX);
      const cy = y0 + Math.floor(i / cols) * (ch + gapY);
      if (mx >= cx && mx <= cx + cw && my >= cy && my <= cy + ch) return this.buy(state, UPGRADES[i].id);
    }
    return false;
  }
}
