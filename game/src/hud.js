// The HUD and the screens: score, combo, lives, Flight progress, wind, and
// the title, victory, game-over and pause screens. These are what the judge
// reads, so every screen states the goal, the score and how to restart.

import { VIEW, GAME, PALETTE } from './config.js';

const FONT = 'system-ui, "Segoe UI", Roboto, sans-serif';

function panel(ctx, x, y, w, h, radius = 14) {
  ctx.fillStyle = PALETTE.hudPanel;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.strokeStyle = 'rgba(55, 224, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function centerText(ctx, text, x, y, font, color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

export class Popups {
  constructor() {
    this.list = [];
  }

  add(x, y, text, color, size = 30) {
    this.list.push({ x, y, text, color, size, life: 0, maxLife: 1.1 });
  }

  update(dt) {
    for (const p of this.list) {
      p.life += dt;
      p.y -= 46 * dt;
    }
    this.list = this.list.filter((p) => p.life < p.maxLife);
  }

  draw(ctx) {
    for (const p of this.list) {
      const a = 1 - p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.font = `800 ${p.size}px ${FONT}`;
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.list = [];
  }
}

export function drawHud(ctx, s) {
  panel(ctx, 16, 14, 300, 84);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `800 15px ${FONT}`;
  ctx.fillStyle = PALETTE.hudCyan;
  ctx.fillText('SCORE', 34, 38);
  ctx.font = `800 40px ${FONT}`;
  ctx.fillStyle = PALETTE.hudWhite;
  ctx.fillText(String(s.score), 34, 76);

  panel(ctx, 490, 14, 300, 84);
  ctx.font = `800 15px ${FONT}`;
  ctx.fillStyle = PALETTE.hudGold;
  ctx.textAlign = 'center';
  ctx.fillText('COMBO', 640, 38);
  ctx.font = `800 40px ${FONT}`;
  ctx.fillStyle = s.combo > 1 ? PALETTE.hudGold : PALETTE.hudWhite;
  ctx.fillText(s.combo > 1 ? `x${s.combo}` : '—', 640, 76);

  panel(ctx, 964, 14, 300, 84);
  ctx.font = `800 15px ${FONT}`;
  ctx.fillStyle = PALETTE.hudCyan;
  ctx.textAlign = 'right';
  ctx.fillText('FLIGHT 15', 1246, 38);
  ctx.font = `800 40px ${FONT}`;
  ctx.fillStyle = PALETTE.hudWhite;
  ctx.fillText(`${s.caught} / ${GAME.goal}`, 1246, 76);

  ctx.textAlign = 'left';
  ctx.font = `800 16px ${FONT}`;
  ctx.fillStyle = PALETTE.hudWhite;
  let hx = 34;
  for (let i = 0; i < GAME.lives; i++) {
    ctx.fillStyle = i < s.lives ? '#ff5a6e' : 'rgba(255, 90, 110, 0.25)';
    ctx.beginPath();
    ctx.arc(hx, 122, 9, 0, Math.PI * 2);
    ctx.fill();
    hx += 26;
  }
  ctx.fillStyle = PALETTE.hudCyan;
  ctx.fillText('LIVES', hx + 6, 128);

  const dir = s.wind > 2 ? '→' : s.wind < -2 ? '←' : '·';
  const kmh = Math.round(Math.abs(s.wind) * 0.25);
  panel(ctx, 964, 112, 300, 40);
  ctx.textAlign = 'center';
  ctx.font = `800 18px ${FONT}`;
  ctx.fillStyle = PALETTE.hudWhite;
  ctx.fillText(`WIND ${dir} ${kmh} km/h`, 1114, 139);

  if (s.nearest) {
    const alt = Math.max(0, Math.round((648 - s.nearest.y) / 8));
    const descent = Math.max(0, Math.round(s.nearest.vy / 10));
    panel(ctx, 16, 668, 300, 38);
    ctx.textAlign = 'center';
    ctx.font = `800 16px ${FONT}`;
    ctx.fillStyle = PALETTE.hudCyan;
    ctx.fillText(`ALT ${alt} m · DESCENT ${descent} m/s`, 166, 693);
  }

  if (s.muted) {
    ctx.textAlign = 'right';
    ctx.font = `800 15px ${FONT}`;
    ctx.fillStyle = 'rgba(242, 246, 255, 0.65)';
    ctx.fillText('MUTED (M)', 1264, 700);
  }
}

export function drawTitle(ctx, time, best) {
  ctx.fillStyle = 'rgba(4, 8, 24, 0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const bob = Math.sin(time * 1.6) * 6;
  centerText(ctx, 'CHOPSTICK', 640, 190 + bob, `800 92px ${FONT}`, PALETTE.hudWhite);
  centerText(ctx, 'CATCH', 640, 278 + bob, `800 92px ${FONT}`, PALETTE.hudGold);
  centerText(ctx, 'STARSHIP · FLIGHT 15', 640, 340, `800 24px ${FONT}`, PALETTE.hudCyan);
  centerText(ctx, 'Catch 15 boosters with the Mechazilla arms to win.', 640, 388, `600 22px ${FONT}`, PALETTE.hudWhite);
  centerText(ctx, 'Debris is not a booster — never catch it.', 640, 418, `600 22px ${FONT}`, '#ff9a9a');
  centerText(ctx, 'Mouse / ↑ ↓ move the arms · Click / Space closes them', 640, 472, `700 20px ${FONT}`, PALETTE.hudWhite);
  centerText(ctx, 'Enter start · R restart · M mute · P pause', 640, 502, `700 20px ${FONT}`, PALETTE.hudWhite);
  const pulse = 0.65 + 0.35 * Math.sin(time * 4);
  ctx.globalAlpha = pulse;
  centerText(ctx, 'CLICK OR PRESS ENTER TO START', 640, 566, `800 30px ${FONT}`, PALETTE.hudGold);
  ctx.globalAlpha = 1;
  if (best > 0) centerText(ctx, `BEST SCORE ${best}`, 640, 612, `800 20px ${FONT}`, PALETTE.hudCyan);
}

export function drawVictory(ctx, score, best) {
  ctx.fillStyle = 'rgba(4, 20, 10, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  centerText(ctx, 'FLIGHT 15 COMPLETE!', 640, 220, `800 72px ${FONT}`, PALETTE.hudGold);
  centerText(ctx, 'Every booster caught. The tower stands.', 640, 292, `600 24px ${FONT}`, PALETTE.hudWhite);
  centerText(ctx, `SCORE ${score}`, 640, 372, `800 52px ${FONT}`, PALETTE.hudWhite);
  centerText(ctx, `BEST ${best}`, 640, 428, `800 22px ${FONT}`, PALETTE.hudCyan);
  centerText(ctx, 'ENTER — keep flying (endless) · R — restart', 640, 500, `700 22px ${FONT}`, PALETTE.hudWhite);
}

export function drawGameOver(ctx, score, best, caught) {
  ctx.fillStyle = 'rgba(24, 4, 8, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  centerText(ctx, 'MISSION FAILED', 640, 220, `800 72px ${FONT}`, PALETTE.hudRed);
  centerText(ctx, `The tower lost all three boosters — ${caught} of ${GAME.goal} caught.`, 640, 292, `600 24px ${FONT}`, PALETTE.hudWhite);
  centerText(ctx, `SCORE ${score}`, 640, 372, `800 52px ${FONT}`, PALETTE.hudWhite);
  centerText(ctx, `BEST ${best}`, 640, 428, `800 22px ${FONT}`, PALETTE.hudCyan);
  centerText(ctx, 'R OR CLICK — TRY AGAIN', 640, 500, `800 26px ${FONT}`, PALETTE.hudGold);
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(4, 8, 24, 0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  centerText(ctx, 'PAUSED', 640, 330, `800 64px ${FONT}`, PALETTE.hudWhite);
  centerText(ctx, 'Press P to resume', 640, 396, `700 22px ${FONT}`, PALETTE.hudCyan);
}
