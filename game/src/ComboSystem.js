// ComboSystem.js — combo multiplier, best combo, and mission hooks.
export class ComboSystem {
  constructor() { this.combo = 0; this.best = 0; this.timer = 0; this.multiplier = 1; }
  reset() { this.combo = 0; this.best = 0; this.timer = 0; this.multiplier = 1; }
  onCatch() {
    this.combo++;
    if (this.combo > this.best) this.best = this.combo;
    this.timer = 4;
    this.multiplier = 1 + Math.floor(this.combo / 3) * 0.5;
    return this.multiplier;
  }
  onMiss(shield) {
    if (shield > 0) return 'shielded';
    this.combo = 0; this.multiplier = 1; this.timer = 0;
    return 'lost';
  }
  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) { this.combo = 0; this.multiplier = 1; }
    }
  }
  label() {
    if (this.combo < 2) return '';
    return `COMBO x${this.combo}  (${this.multiplier.toFixed(1)}x score)`;
  }
}
