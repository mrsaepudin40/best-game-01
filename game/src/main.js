// Bootstrap: canvas setup with devicePixelRatio scaling, the animation loop,
// and the scripted screenshot states (?shot=start|play|combo|victory|gameover
// with an optional &seed=). A live game runs the loop; a shot state renders
// one frozen frame of the real game and stops.

import { VIEW } from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { Game } from './game.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
  canvas.width = Math.floor(VIEW.width * dpr);
  canvas.height = Math.floor(VIEW.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

fitCanvas();
window.addEventListener('resize', fitCanvas);

const sound = new SoundBank();
const input = new Input(canvas);
const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || 7);
const game = new Game(canvas, sound, input, { seed });
window.__chopstickCatch = game;

const shot = params.get('shot');
if (shot) {
  game.loadShot(shot, seed);
  game.render(ctx);
} else {
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    game.update(dt);
    game.render(ctx);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
