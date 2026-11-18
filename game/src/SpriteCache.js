// SpriteCache.js — pre-rendered offscreen sprites. The hot loop only drawImages
// them, so 60 FPS at 1920x1080 costs almost nothing per frame.
import { BOOSTER_KINDS } from './GameConfig.js';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function buildBoosterSprite(kind, golden = false) {
  const k = BOOSTER_KINDS[kind];
  const pad = 26;
  const c = makeCanvas(k.w + pad * 2, k.h + pad * 2 + 34);
  const g = c.getContext('2d');
  const x = pad, y = pad;
  // Body
  const grad = g.createLinearGradient(x, y, x + k.w, y);
  const base = golden ? '#ffd94a' : k.color;
  grad.addColorStop(0, '#5a6478'); grad.addColorStop(0.35, base); grad.addColorStop(1, '#3a4356');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(x + k.w / 2, y);
  g.quadraticCurveTo(x + k.w, y + 14, x + k.w, y + 34);
  g.lineTo(x + k.w, y + k.h - 18);
  g.lineTo(x + k.w / 2, y + k.h);
  g.lineTo(x, y + k.h - 18);
  g.lineTo(x, y + 34);
  g.quadraticCurveTo(x, y + 14, x + k.w / 2, y);
  g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 2; g.stroke();
  // Fins
  g.fillStyle = golden ? '#e8a91c' : '#8a94a8';
  g.beginPath(); g.moveTo(x, y + k.h - 26); g.lineTo(x - 12, y + k.h - 2); g.lineTo(x, y + k.h - 6); g.fill();
  g.beginPath(); g.moveTo(x + k.w, y + k.h - 26); g.lineTo(x + k.w + 12, y + k.h - 2); g.lineTo(x + k.w, y + k.h - 6); g.fill();
  // Window + stripe
  g.fillStyle = '#0e1a2e';
  g.beginPath(); g.arc(x + k.w / 2, y + 34, 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = golden ? '#ff8a00' : '#ff5a3c';
  g.fillRect(x, y + 52, k.w, 6);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.font = 'bold 9px sans-serif'; g.textAlign = 'center';
  g.fillText(golden ? 'GOLD' : k.label, x + k.w / 2, y + 70);
  // Flame (animated by scaling at draw time; base flame baked here)
  if (k.flame) {
    const fg = g.createLinearGradient(0, y + k.h, 0, y + k.h + 34);
    fg.addColorStop(0, '#fff2a8'); fg.addColorStop(0.5, k.flame); fg.addColorStop(1, 'rgba(255,80,20,0)');
    g.fillStyle = fg;
    g.beginPath();
    g.moveTo(x + k.w / 2 - 10, y + k.h - 2);
    g.quadraticCurveTo(x + k.w / 2, y + k.h + 34, x + k.w / 2 + 10, y + k.h - 2);
    g.fill();
  }
  return c;
}

export function buildTowerSprite() {
  const c = makeCanvas(220, 260);
  const g = c.getContext('2d');
  // Mechazilla tower: dark steel lattice with amber lights
  g.fillStyle = '#2b3242';
  g.beginPath(); g.moveTo(70, 260); g.lineTo(84, 40); g.lineTo(136, 40); g.lineTo(150, 260); g.closePath(); g.fill();
  g.strokeStyle = '#4a5568'; g.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const y = 60 + i * 34;
    g.beginPath(); g.moveTo(76, y); g.lineTo(144, y + 34); g.moveTo(144, y); g.lineTo(76, y + 34); g.stroke();
  }
  g.fillStyle = '#1c2230'; g.fillRect(58, 18, 104, 30);
  g.fillStyle = '#ffb347';
  for (let i = 0; i < 4; i++) g.fillRect(66 + i * 26, 28, 14, 10);
  g.fillStyle = '#3a4356'; g.fillRect(40, 250, 140, 10);
  return c;
}

export class SpriteCache {
  constructor() {
    this.map = new Map();
    for (const kind of Object.keys(BOOSTER_KINDS)) {
      this.map.set(kind, buildBoosterSprite(kind, false));
      this.map.set(kind + ':gold', buildBoosterSprite(kind, true));
    }
    this.map.set('tower', buildTowerSprite());
  }
  get(key) { return this.map.get(key); }
}
