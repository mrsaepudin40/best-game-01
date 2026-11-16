// The dusk scene behind the game: gradient sky, twinkling stars, drifting
// clouds, a low sun glow, and the ocean with moving wave lines. All of it is
// drawn fresh every frame from a seed, so no image files are needed.

import { VIEW, WATERLINE, PALETTE } from './config.js';

export class Background {
  constructor(rng) {
    this.stars = [];
    for (let i = 0; i < 110; i++) {
      this.stars.push({
        x: rng.range(0, VIEW.width),
        y: rng.range(0, 420),
        r: rng.range(0.6, 2.2),
        phase: rng.range(0, Math.PI * 2),
        speed: rng.range(0.6, 2.0),
      });
    }
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: rng.range(0, VIEW.width),
        y: rng.range(60, 300),
        w: rng.range(120, 260),
        speed: rng.range(4, 10),
      });
    }
  }

  draw(ctx, time) {
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW.height);
    sky.addColorStop(0, PALETTE.skyTop);
    sky.addColorStop(0.55, PALETTE.skyMid);
    sky.addColorStop(0.82, PALETTE.skyLow);
    sky.addColorStop(1, PALETTE.oceanDeep);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);

    const glow = ctx.createRadialGradient(1080, 600, 10, 1080, 600, 320);
    glow.addColorStop(0, 'rgba(255, 154, 61, 0.55)');
    glow.addColorStop(1, 'rgba(255, 154, 61, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(700, 260, 580, 460);

    for (const s of this.stars) {
      const tw = 0.45 + 0.55 * Math.sin(time * s.speed + s.phase);
      ctx.globalAlpha = tw;
      ctx.fillStyle = PALETTE.star;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(120, 140, 200, 0.20)';
    for (const c of this.clouds) {
      const cx = ((c.x + time * c.speed) % (VIEW.width + 300)) - 150;
      ctx.beginPath();
      ctx.ellipse(cx, c.y, c.w / 2, 16, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + c.w * 0.22, c.y + 8, c.w / 3, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#0d1530';
    ctx.beginPath();
    ctx.moveTo(0, WATERLINE - 26);
    ctx.quadraticCurveTo(180, WATERLINE - 64, 360, WATERLINE - 30);
    ctx.quadraticCurveTo(520, WATERLINE - 6, 700, WATERLINE - 34);
    ctx.lineTo(1280, WATERLINE - 18);
    ctx.lineTo(1280, WATERLINE);
    ctx.lineTo(0, WATERLINE);
    ctx.closePath();
    ctx.fill();

    const sea = ctx.createLinearGradient(0, WATERLINE, 0, VIEW.height);
    sea.addColorStop(0, PALETTE.oceanTop);
    sea.addColorStop(1, PALETTE.oceanDeep);
    ctx.fillStyle = sea;
    ctx.fillRect(0, WATERLINE, VIEW.width, VIEW.height - WATERLINE);

    ctx.strokeStyle = 'rgba(140, 200, 255, 0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const y = WATERLINE + 12 + i * 14;
      ctx.beginPath();
      for (let x = 0; x <= VIEW.width; x += 32) {
        const yy = y + Math.sin(x * 0.02 + time * 1.4 + i * 1.7) * 3;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }
}
