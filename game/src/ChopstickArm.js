// ChopstickArm.js — the two Mechazilla chopstick arms. They slide along the catch
// line, open and close, and clamp boosters that pass between them.
export class ChopstickArm {
  constructor() {
    this.x = 640;               // centre between the arms
    this.targetX = 640;
    this.width = 150;           // gap between arm tips
    this.reach = 150;           // arm length (visual)
    this.speed = 620;           // px per second
    this.clamp = 0;             // 0 open .. 1 closed, animated
    this.clampTarget = 0;
    this.y = 560;               // catch line height
    this.flash = 0;             // white flash timer after a catch
  }
  applyUpgrades(up, relics) {
    this.width = 150 * (1 + 0.22 * (up.wider || 0)) * (relics.has('titanium') ? 1.15 : 1);
    this.reach = 150 * (1 + 0.18 * (up.longer || 0));
    this.speed = 620 * (1 + 0.20 * (up.servo || 0)) * (relics.has('thrusters') ? 1.15 : 1);
  }
  update(dt, input) {
    if (input.left) this.targetX -= this.speed * dt * 1.4;
    if (input.right) this.targetX += this.speed * dt * 1.4;
    if (input.mouseX != null) this.targetX = input.mouseX;
    const dx = this.targetX - this.x;
    const step = this.speed * dt;
    this.x += Math.abs(dx) <= step ? dx : Math.sign(dx) * step;
    this.x = Math.max(90, Math.min(1190, this.x));
    this.clamp += (this.clampTarget - this.clamp) * Math.min(1, dt * 14);
    if (this.flash > 0) this.flash -= dt;
  }
  // Returns true when a booster body overlaps the catch zone.
  tryCatch(b) {
    const half = this.width / 2;
    const inX = Math.abs(b.x - this.x) < half + b.w / 2 - 6;
    const inY = b.y + b.h / 2 > this.y - 14 && b.y - b.h / 2 < this.y + 26;
    return inX && inY;
  }
  draw(ctx, time) {
    const sway = Math.sin(time * 1.3) * 2;
    const gap = this.width / 2 + (1 - this.clamp) * 26;
    ctx.save();
    ctx.translate(this.x, this.y);
    // Two arms reaching down from the tower top
    for (const side of [-1, 1]) {
      const tipX = side * gap;
      const topX = side * 46;
      const grad = ctx.createLinearGradient(topX, -this.reach, tipX, 0);
      grad.addColorStop(0, '#5a6478'); grad.addColorStop(1, '#c8d2e0');
      ctx.strokeStyle = grad; ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(topX, -this.reach + sway); ctx.lineTo(tipX, -6); ctx.stroke();
      ctx.strokeStyle = '#2b3242'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.moveTo(topX, -this.reach + sway); ctx.lineTo(tipX, -6); ctx.globalAlpha = 0.25; ctx.stroke(); ctx.globalAlpha = 1;
      // Claw tip
      ctx.fillStyle = this.flash > 0 ? '#fff2a8' : '#ffb347';
      ctx.beginPath(); ctx.arc(tipX, 0, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1c2230';
      ctx.beginPath(); ctx.arc(tipX, 0, 5, 0, Math.PI * 2); ctx.fill();
    }
    // Catch-zone glow
    ctx.globalAlpha = 0.20 + 0.10 * Math.sin(time * 4);
    ctx.fillStyle = '#7fd4ff';
    ctx.fillRect(-this.width / 2, -8, this.width, 16);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
