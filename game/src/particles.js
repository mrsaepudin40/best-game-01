// Particles: catch sparkles, explosion fireballs, smoke, and victory
// confetti. One list, one update, one draw; everything fades on its own.

export class Particles {
  constructor() {
    this.list = [];
  }

  burst(x, y, opts) {
    const count = opts.count ?? 24;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (opts.speed ?? 260) * (0.35 + Math.random() * 0.85);
      this.list.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (opts.up ?? 60),
        life: 0,
        maxLife: (opts.life ?? 0.8) * (0.6 + Math.random() * 0.7),
        size: (opts.size ?? 5) * (0.6 + Math.random() * 0.8),
        color: opts.colors[Math.floor(Math.random() * opts.colors.length)],
        gravity: opts.gravity ?? 320,
        drag: opts.drag ?? 0.98,
      });
    }
  }

  explosion(x, y) {
    this.burst(x, y, {
      count: 42,
      speed: 340,
      life: 1.0,
      size: 7,
      colors: ['#ff9a3d', '#ffc53d', '#ff5a2a', '#8a8f9e', '#5a5f6e'],
      gravity: 260,
    });
    this.burst(x, y, {
      count: 16,
      speed: 120,
      life: 1.6,
      size: 12,
      colors: ['rgba(120, 125, 140, 0.5)', 'rgba(90, 95, 110, 0.4)'],
      gravity: -40,
      up: 30,
    });
  }

  catchSparkle(x, y, perfect) {
    this.burst(x, y, {
      count: perfect ? 36 : 20,
      speed: perfect ? 300 : 200,
      life: 0.7,
      size: perfect ? 6 : 4,
      colors: perfect
        ? ['#ffe9a8', '#37e0ff', '#ffffff', '#ffc53d']
        : ['#37e0ff', '#9ff3ff', '#ffffff'],
      gravity: 180,
    });
  }

  confetti(x, y) {
    this.burst(x, y, {
      count: 90,
      speed: 380,
      life: 2.2,
      size: 6,
      colors: ['#ffc53d', '#37e0ff', '#ff5a8a', '#7dff8a', '#ffffff'],
      gravity: 200,
      up: 160,
    });
  }

  update(dt) {
    for (const p of this.list) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= p.drag;
      p.vy *= p.drag;
    }
    this.list = this.list.filter((p) => p.life < p.maxLife);
  }

  draw(ctx) {
    for (const p of this.list) {
      const a = 1 - p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.list = [];
  }
}
