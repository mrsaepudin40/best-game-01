// RelicVault.js — meta progression. Relics are bought with lifetime Scrap and
// persist in localStorage, so every run makes the next one stronger.
import { RELICS } from './GameConfig.js';

export class RelicVault {
  constructor() { this.selected = 0; }
  buy(state, id) {
    const r = RELICS.find((x) => x.id === id);
    if (!r || state.relics.has(id)) return false;
    if (state.lifetimeScrap < r.cost) return false;
    state.lifetimeScrap -= r.cost;
    state.relics.add(id);
    return true;
  }
  draw(ctx, state) {
    ctx.fillStyle = 'rgba(5,10,24,0.92)';
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#c9a7ff'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('RELIC VAULT — PERMANENT POWER', 640, 62);
    ctx.fillStyle = '#d8dee9'; ctx.font = '18px sans-serif';
    ctx.fillText(`Lifetime Scrap: ${state.lifetimeScrap}   •   Relics stay forever   •   Press R or ESC to go back`, 640, 96);
    const cols = 2, cw = 560, ch = 96, gapX = 30, gapY = 14;
    const x0 = 640 - (cols * cw + (cols - 1) * gapX) / 2;
    const y0 = 130;
    RELICS.forEach((r, i) => {
      const owned = state.relics.has(r.id);
      const afford = state.lifetimeScrap >= r.cost && !owned;
      const cx = x0 + (i % cols) * (cw + gapX);
      const cy = y0 + Math.floor(i / cols) * (ch + gapY);
      ctx.fillStyle = owned ? '#2a1f4a' : afford ? '#1d2f4a' : '#141a26';
      ctx.strokeStyle = owned ? '#c9a7ff' : afford ? '#f7c873' : '#3a4356'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText((owned ? '★ ' : '☆ ') + r.name, cx + 14, cy + 30);
      ctx.fillStyle = '#aeb8cc'; ctx.font = '14px sans-serif';
      ctx.fillText(r.desc, cx + 14, cy + 56);
      ctx.fillStyle = '#f7c873'; ctx.font = 'bold 15px sans-serif';
      ctx.fillText(owned ? 'OWNED' : `${r.cost} Scrap`, cx + 14, cy + 82);
    });
    ctx.fillStyle = '#7fd4ff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('[ R ]  Back to title', 640, 690);
  }
  click(state, mx, my) {
    const cols = 2, cw = 560, ch = 96, gapX = 30, gapY = 14;
    const x0 = 640 - (cols * cw + (cols - 1) * gapX) / 2;
    const y0 = 130;
    for (let i = 0; i < RELICS.length; i++) {
      const cx = x0 + (i % cols) * (cw + gapX);
      const cy = y0 + Math.floor(i / cols) * (ch + gapY);
      if (mx >= cx && mx <= cx + cw && my >= cy && my <= cy + ch) return this.buy(state, RELICS[i].id);
    }
    return false;
  }
}
