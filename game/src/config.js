// Tuning constants and palette for Chopstick Catch. One place holds every
// number the game balances on, so difficulty and look are tuned here only.

export const VIEW = { width: 1280, height: 720 };

export const TOWER = { x: 640, top: 56, base: 660, halfWidth: 46 };

export const WATERLINE = 648;

export const ARM = {
  minY: 130,
  maxY: 592,
  length: 212,
  thickness: 16,
  closeMs: 300,
  cooldownMs: 360,
  catchHalfWidth: 80,
  catchHalfHeight: 38,
  perfectHalfWidth: 24,
  perfectHalfHeight: 13,
};

export const GAME = {
  goal: 15,
  lives: 3,
  maxCombo: 5,
  baseFallSpeed: 150,
  fallSpeedPerCatch: 9,
  maxFallSpeed: 400,
  baseSpawnMs: 2200,
  minSpawnMs: 950,
  shipEvery: 5,
  debrisChance: 0.16,
};

export const POINTS = { booster: 100, ship: 300, perfectBonus: 50 };

export const PALETTE = {
  skyTop: '#0a1030',
  skyMid: '#16245c',
  skyLow: '#3a2a63',
  sunGlow: '#ff9a3d',
  star: '#cfe4ff',
  oceanDeep: '#0a2a4d',
  oceanTop: '#155a8a',
  towerDark: '#1a2036',
  towerEdge: '#39456e',
  towerLight: '#4d5c8a',
  armSteel: '#5d6f9e',
  armGlow: '#37e0ff',
  boosterBody: '#dfe6f2',
  boosterBand: '#c33a2e',
  boosterFlame: '#ff9a3d',
  boosterFlameCore: '#ffe9a8',
  shipBody: '#e8ecf5',
  debrisBody: '#4a4a55',
  debrisLight: '#ff4d4d',
  hudPanel: 'rgba(6, 12, 32, 0.72)',
  hudCyan: '#37e0ff',
  hudGold: '#ffc53d',
  hudWhite: '#f2f6ff',
  hudRed: '#ff5a5a',
  hudGreen: '#7dff8a',
};
