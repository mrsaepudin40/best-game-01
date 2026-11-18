// MechazillaTower.js — the animated catch tower at the bottom centre. Its arms
// are drawn by ChopstickArm; the tower itself breathes, blinks and recoils.
export class MechazillaTower {
  constructor() { this.recoil = 0; this.blink = 0; }
  onCatch() { this.recoil = 1; }
  update(dt) {
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 4);
    this.blink -= dt;
    if (this.blink < -3.4) this.blink = 0.12;
  }
  draw(ctx, t, sprite) {
    const bob = Math.sin(t * 1.1) * 2 - this.recoil * 6;
    ctx.drawImage(sprite, 640 - 110, 600 - 250 + bob);
    // Status light: green normally, blinking amber
    ctx.fillStyle = this.blink > 0 ? '#ffb347' : '#4ade80';
    ctx.beginPath(); ctx.arc(640, 600 - 228 + bob, 6, 0, Math.PI * 2); ctx.fill();
    // Base pad markings
    ctx.strokeStyle = 'rgba(247,200,115,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(640, 668, 150, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = 'rgba(247,200,115,0.85)';
    ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('MECHAZILLA  •  FLIGHT 15', 640, 700);
  }
}
