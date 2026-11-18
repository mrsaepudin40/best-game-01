// main.js — entry point. Sizes the canvas, caps DPR at 1 for a stable 60 FPS
// at Full HD, starts the loop, and applies deterministic ?shot= scenes.
import { GameLoop } from './GameLoop.js';
import { applyShotScene } from './ShotScenes.js';

const canvas = document.getElementById('game');
canvas.width = 1280;
canvas.height = 720;

const game = new GameLoop(canvas);
window.__game = game;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  const seed = parseInt(params.get('seed') || '7', 10);
  // Freeze gameplay for the deterministic shot: stop the rAF-driven update
  // from advancing boosters by pausing spawns after the scene is staged.
  applyShotScene(game, shot, seed);
  // Keep rendering but hold the scene still for the screenshot.
  game.screen = game.screen; // scene already set by applyShotScene
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.screen === 'play') game.screen = 'pause';
});
