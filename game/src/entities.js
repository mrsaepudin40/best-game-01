// Falling objects: boosters, the Ship upper stage, and satellite debris.
// Each carries its own position, speed, drift and kind; the game spawns them
// and the tower catches them. Everything is drawn procedurally on canvas.

import { TOWER, WATERLINE, POINTS } from './config.js';

export function makeBooster(rng, fallSpeed) {
  return {
    kind: 'booster',
    x: TOWER.x + rng.range(-200, 200),
    y: -90,
    vy: fallSpeed * rng.range(0.9, 1.1),
    width: 34,
    height: 96,
    swayPhase: rng.range(0, Math.PI * 2),
    swayAmp: rng.range(4, 12),
    flameFlicker: rng.range(0, Math.PI * 2),
    points: POINTS.booster,
  };
}

export function makeShip(rng, fallSpeed) {
  return {
    kind: 'ship',
    x: TOWER.x + rng.range(-180, 180),
    y: -120,
    vy: fallSpeed * 0.72,
    width: 52,
    height: 130,
    swayPhase: rng.range(0, Math.PI * 2),
    swayAmp: rng.range(3, 8),
    flameFlicker: rng.range(0, Math.PI * 2),
    points: POINTS.ship,
  };
}

export function makeDebris(rng, fallSpeed) {
  return {
    kind: 'debris',
    x: TOWER.x + rng.range(-300, 300),
    y: -70,
    vy: fallSpeed * rng.range(1.0, 1.25),
    width: 44,
    height: 40,
    swayPhase: rng.range(0, Math.PI * 2),
    swayAmp: rng.range(10, 26),
    flameFlicker: 0,
    spin: rng.range(-0.9, 0.9),
    angle: rng.range(0, Math.PI * 2),
    points: 0,
  };
}

export function updateFaller(f, dt, wind, time) {
  f.y += f.vy * dt;
  // A booster guides itself back to the tower as it falls — that is the real
  // Mechazilla catch: the player's skill is the timing of the close, not
  // luck about where the booster happens to land. The Ship steers slower and
  // heavier; debris does not steer at all, which is also how you tell it apart.
  let steer = 0;
  if (f.kind === 'booster') steer = (TOWER.x - f.x) * 0.9;
  else if (f.kind === 'ship') steer = (TOWER.x - f.x) * 0.5;
  const cap = f.kind === 'ship' ? 120 : 200;
  const vx = Math.max(
    -cap,
    Math.min(cap, steer + wind + Math.sin(time * 0.9 + f.swayPhase) * f.swayAmp),
  );
  f.x += vx * dt;
  if (f.kind === 'debris') f.angle += f.spin * dt;
  f.x = Math.max(60, Math.min(1220, f.x));
}

export function drawFlame(ctx, x, y, width, time, flicker) {
  const len = width * 1.5 * (0.85 + 0.3 * Math.sin(time * 31 + flicker));
  const grad = ctx.createLinearGradient(x, y, x, y + len);
  grad.addColorStop(0, '#ffe9a8');
  grad.addColorStop(0.45, '#ff9a3d');
  grad.addColorStop(1, 'rgba(255, 90, 20, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.5, y);
  ctx.lineTo(x + width * 0.5, y);
  ctx.lineTo(x, y + len);
  ctx.closePath();
  ctx.fill();
}

function drawBoosterBody(ctx, f, time) {
  const { x, y, width, height } = f;
  const grad = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
  grad.addColorStop(0, '#8b96ad');
  grad.addColorStop(0.35, '#dfe6f2');
  grad.addColorStop(0.65, '#f4f7fc');
  grad.addColorStop(1, '#7c88a3');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height / 2, width, height, 8);
  ctx.fill();
  ctx.fillStyle = '#c33a2e';
  ctx.fillRect(x - width / 2, y - height / 2 + 18, width, 10);
  ctx.fillStyle = '#2c3550';
  ctx.fillRect(x - width / 2 - 6, y - height / 2 + 6, 6, 22);
  ctx.fillRect(x + width / 2, y - height / 2 + 6, 6, 22);
  ctx.fillStyle = '#39456e';
  ctx.fillRect(x - width / 2, y + height / 2 - 14, width, 6);
  drawFlame(ctx, x, y + height / 2, width * 0.7, time, f.flameFlicker);
}

function drawShipBody(ctx, f, time) {
  const { x, y, width, height } = f;
  const grad = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
  grad.addColorStop(0, '#9aa5bd');
  grad.addColorStop(0.4, '#e8ecf5');
  grad.addColorStop(1, '#8b96ad');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y - height / 2 + 26);
  ctx.quadraticCurveTo(x - width / 2, y - height / 2 - 14, x, y - height / 2 - 14);
  ctx.quadraticCurveTo(x + width / 2, y - height / 2 - 14, x + width / 2, y - height / 2 + 26);
  ctx.lineTo(x + width / 2, y + height / 2);
  ctx.lineTo(x - width / 2, y + height / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#20242e';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x - width / 2 + 4, y - height / 2 + 30 + i * 8, width - 8, 3);
  }
  ctx.fillStyle = '#c33a2e';
  ctx.fillRect(x - width / 2, y + height / 2 - 18, width, 8);
  drawFlame(ctx, x, y + height / 2, width * 0.6, time, f.flameFlicker);
}

function drawDebrisBody(ctx, f, time) {
  const { x, y } = f;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(f.angle);
  ctx.fillStyle = '#4a4a55';
  ctx.beginPath();
  ctx.moveTo(-22, -8);
  ctx.lineTo(-8, -20);
  ctx.lineTo(14, -14);
  ctx.lineTo(22, 2);
  ctx.lineTo(10, 18);
  ctx.lineTo(-12, 16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2c2c36';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#6a6a78';
  ctx.fillRect(-14, -4, 16, 4);
  const blink = Math.sin(time * 9) > 0;
  ctx.fillStyle = blink ? '#ff4d4d' : '#7a2020';
  ctx.beginPath();
  ctx.arc(12, -8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawFaller(ctx, f, time) {
  if (f.kind === 'booster') drawBoosterBody(ctx, f, time);
  else if (f.kind === 'ship') drawShipBody(ctx, f, time);
  else drawDebrisBody(ctx, f, time);
}

export function fallerPastWaterline(f) {
  return f.y - f.height / 2 > WATERLINE;
}
