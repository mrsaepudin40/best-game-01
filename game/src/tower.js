// The Mechazilla tower and its chopstick arms. The arms slide up and down
// the tower and snap shut on command; the catch test decides whether a
// falling object is caught, perfect, or missed entirely.

import { TOWER, ARM, PALETTE } from './config.js';

export class Tower {
  constructor() {
    this.armY = 300;
    this.armTargetY = 300;
    this.gap = 1;
    this.closeTimerMs = 0;
    this.cooldownTimerMs = 0;
    this.shake = 0;
  }

  requestClose() {
    if (this.cooldownTimerMs > 0 || this.closeTimerMs > 0) return false;
    this.closeTimerMs = ARM.closeMs;
    this.cooldownTimerMs = ARM.closeMs + ARM.cooldownMs;
    return true;
  }

  isClosed() {
    return this.gap < 0.35;
  }

  addShake(amount) {
    this.shake = Math.min(14, this.shake + amount);
  }

  update(dt, pointerY, keyDir, pointerSeen) {
    if (pointerSeen) this.armTargetY = pointerY;
    if (keyDir !== 0) this.armTargetY += keyDir * 460 * dt;
    this.armTargetY = Math.max(ARM.minY, Math.min(ARM.maxY, this.armTargetY));
    const ease = 1 - Math.exp(-dt * 14);
    this.armY += (this.armTargetY - this.armY) * ease;

    if (this.closeTimerMs > 0) {
      this.closeTimerMs -= dt * 1000;
      this.gap = Math.max(0, this.gap - dt * 14);
    } else {
      this.gap = Math.min(1, this.gap + dt * 4.5);
    }
    if (this.cooldownTimerMs > 0) this.cooldownTimerMs -= dt * 1000;
    this.shake = Math.max(0, this.shake - dt * 26);
  }

  catchSlot() {
    const half = ARM.catchHalfWidth;
    const open = this.gap * 46;
    return {
      x0: TOWER.x - half - open,
      x1: TOWER.x + half + open,
      y0: this.armY - ARM.catchHalfHeight,
      y1: this.armY + ARM.catchHalfHeight,
    };
  }

  isPerfect(f) {
    return (
      Math.abs(f.x - TOWER.x) <= ARM.perfectHalfWidth &&
      Math.abs(f.y - this.armY) <= ARM.perfectHalfHeight
    );
  }

  drawColumn(ctx, time) {
    const { x, top, base, halfWidth } = TOWER;

    const grad = ctx.createLinearGradient(x - halfWidth, 0, x + halfWidth, 0);
    grad.addColorStop(0, PALETTE.towerDark);
    grad.addColorStop(0.5, PALETTE.towerLight);
    grad.addColorStop(1, PALETTE.towerDark);
    ctx.fillStyle = grad;
    ctx.fillRect(x - halfWidth, top, halfWidth * 2, base - top);

    ctx.strokeStyle = PALETTE.towerEdge;
    ctx.lineWidth = 3;
    for (let y = top + 40; y < base - 20; y += 56) {
      ctx.beginPath();
      ctx.moveTo(x - halfWidth, y);
      ctx.lineTo(x + halfWidth, y + 28);
      ctx.moveTo(x + halfWidth, y);
      ctx.lineTo(x - halfWidth, y + 28);
      ctx.stroke();
    }
    ctx.fillStyle = PALETTE.towerEdge;
    for (const py of [top + 90, top + 230, top + 370, top + 510]) {
      ctx.fillRect(x - halfWidth - 14, py, halfWidth * 2 + 28, 10);
    }

    const beacon = Math.sin(time * 4) > 0;
    ctx.fillStyle = beacon ? '#ff5a5a' : '#7a2020';
    ctx.beginPath();
    ctx.arc(x, top - 10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.towerDark;
    ctx.fillRect(x - 4, top - 4, 8, 8);
  }

  drawArms(ctx) {
    const { x } = TOWER;
    const open = this.gap * 46;
    const y = this.armY;
    const halfLen = ARM.length;
    const t = ARM.thickness;

    ctx.fillStyle = PALETTE.armSteel;
    ctx.strokeStyle = PALETTE.towerEdge;
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? x - halfLen : x + open + 4;
      const x1 = side < 0 ? x - open - 4 : x + halfLen;
      ctx.beginPath();
      ctx.roundRect(Math.min(x0, x1), y - t / 2, Math.abs(x1 - x0), t, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = PALETTE.armGlow;
      ctx.fillRect(Math.min(x0, x1) + 6, y - 2, Math.abs(x1 - x0) - 12, 4);
      ctx.fillStyle = PALETTE.armSteel;
    }

    ctx.fillStyle = '#20263c';
    ctx.beginPath();
    ctx.roundRect(x - 30, y - t / 2 - 10, 60, t + 20, 6);
    ctx.fill();

    if (this.isClosed()) {
      ctx.strokeStyle = 'rgba(55, 224, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(x - ARM.catchHalfWidth, y - ARM.catchHalfHeight, ARM.catchHalfWidth * 2, ARM.catchHalfHeight * 2);
      ctx.setLineDash([]);
    }
  }
}
