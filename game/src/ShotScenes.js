// ShotScenes.js — deterministic ?shot= scenes for screenshots. Each scene sets
// a fixed seed and a fixed simulated time, then marks window.__shotReady.
import { SeededRandom } from './SeededRandom.js';

export function applyShotScene(game, shot, seed) {
  const rng = new SeededRandom(seed || 7);
  game.shotMode = true;
  game.time = 6.5;
  if (shot === 'title' || shot === 'start') {
    game.screen = 'title';
    game.time = 2.0;
  } else if (shot === 'play') {
    game.screen = 'play';
    game.startRunSilent(seed);
    // Pre-place boosters mid-fall at fixed positions
    game.spawner.boosters.length = 0;
    const spots = [[300, 180, 'standard'], [520, 90, 'cargo'], [760, 240, 'swift'], [980, 140, 'standard'], [640, 320, 'armored']];
    for (const [x, y, kind] of spots) {
      const b = game.spawner.spawnOne(0, {}, new Set());
      b.x = x; b.y = y; b.kind = kind; b.t = 1.2;
    }
    game.score = 2450; game.scrap = 86; game.caughtThisRound = 9;
    game.combo.combo = 5; game.combo.best = 5; game.combo.multiplier = 1.5;
    game.arm.x = 640; game.arm.targetX = 640;
    game.particles.burst(640, 500, 18, [127, 212, 255]);
  } else if (shot === 'boss' || shot === 'combo') {
    game.screen = 'play';
    game.startRunSilent(seed);
    game.realm = 1;
    game.score = 8120; game.scrap = 210; game.caughtThisRound = 15;
    game.combo.combo = 8; game.combo.best = 8; game.combo.multiplier = 2;
    game.boss.start('debris');
    game.boss.x = 700; game.boss.y = 380; game.boss.t = 2;
    game.spawner.boosters.length = 0;
    const b = game.spawner.spawnOne(1, {}, new Set());
    b.x = 420; b.y = 200; b.golden = true; b.kind = 'standard';
    game.arm.x = 700; game.arm.targetX = 700;
    game.particles.burst(700, 420, 30, [255, 200, 80], 240, 0.9);
    game.setBanner('BOSS — DEBRIS STORM!');
  } else if (shot === 'victory') {
    game.screen = 'victory';
    game.score = 12480; game.caughtTotal = 45; game.bossesBeaten = 3;
    game.bestCombo = 9; game.goldenCaught = 4; game.scrap = 340;
    game.missionsDone = new Set(['m1', 'm2', 'm4', 'm5']);
    game.save.best = 12480;
  }
  // Let one frame render, then signal readiness.
  requestAnimationFrame(() => { window.__shotReady = true; });
}
