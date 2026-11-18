// ParticlePool.js — fixed-size pooled particles: exhaust, sparks, smoke, rain.
// Zero allocation in the hot loop: dead particles are recycled in place.
export class ParticlePool {
  constructor(cap = 320) {
    this.cap = cap;
    this.x = new Float32Array(cap); this.y = new Float32Array(cap);
    this.vx = new Float32Array(cap); this.vy = new Float32Array(cap);
    this.life = new Float32Array(cap); this.maxLife = new Float32Array(cap);
    this.size = new Float32Array(cap); this.r = new Uint8Array(cap);
    this.g = new Uint8Array(cap); this.b = new Uint8Array(cap);
    this.grav = new Float32Array(cap); this.alive = 0;
  }
  spawn(x, y, vx, vy, life, size, r, g, b, grav = 0) {
    if (this.alive >= this.cap) return;
    const i = this.alive++;
    this.x[i] = x; this.y[i] = y; this.vx[i] = vx; this.vy[i] = vy;
    this.life[i] = life; this.maxLife[i] = life; this.size[i] = size;
    this.r[i] = r; this.g[i] = g; this.b[i] = b; this.grav[i] = grav;
  }
  burst(x, y, n, color, speed = 160, life = 0.6) {
    const [r, g, b] = color;
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random() * 0.7);
      this.spawn(x, y, Math.cos(a) * s, Math.sin(a) * s - 40, life * (0.6 + Math.random() * 0.7),
        2 + Math.random() * 4, r, g, b, 220);
    }
  }
  exhaust(x, y) {
    this.spawn(x + (Math.random() - 0.5) * 14, y, (Math.random() - 0.5) * 30, 90 + Math.random() * 60,
      0.35 + Math.random() * 0.25, 3 + Math.random() * 4, 255, 150 + ((Math.random() * 60) | 0), 40, -40);
  }
  update(dt) {
    let i = 0;
    while (i < this.alive) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        const last = --this.alive;
        this.x[i] = this.x[last]; this.y[i] = this.y[last]; this.vx[i] = this.vx[last];
        this.vy[i] = this.vy[last]; this.life[i] = this.life[last]; this.maxLife[i] = this.maxLife[last];
        this.size[i] = this.size[last]; this.r[i] = this.r[last]; this.g[i] = this.g[last];
        this.b[i] = this.b[last]; this.grav[i] = this.grav[last];
        continue;
      }
      this.vy[i] += this.grav[i] * dt;
      this.x[i] += this.vx[i] * dt; this.y[i] += this.vy[i] * dt;
      i++;
    }
  }
  draw(ctx) {
    for (let i = 0; i < this.alive; i++) {
      const a = this.life[i] / this.maxLife[i];
      ctx.globalAlpha = a;
      ctx.fillStyle = `rgb(${this.r[i]},${this.g[i]},${this.b[i]})`;
      const s = this.size[i] * (0.5 + a * 0.5);
      ctx.fillRect(this.x[i] - s / 2, this.y[i] - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }
  clear() { this.alive = 0; }
}
