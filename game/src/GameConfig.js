// GameConfig.js — every tunable number, realm, upgrade and relic definition
// for Chopstick Catch v2. One place to balance the whole game.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const CATCHES_PER_ROUND = 15;
export const MAX_INTEGRITY = 3;
export const FPS_TARGET = 60;

export const REALMS = [
  { id: 0, name: 'LAUNCH PAD DAWN', sub: 'Realm 1 — calm skies, learn the arms',
    sky: ['#2b4a7a', '#e88a4a', '#f7c873'], ground: '#3a2c22', haze: 'rgba(247,200,115,0.16)',
    wind: 0, rain: 0, dark: 0, speed: 1.0, spawnMs: 1150, hazard: 'none',
    boosterKinds: ['standard', 'standard', 'cargo'], boss: 'rogue' },
  { id: 1, name: 'STORM FRONT', sub: 'Realm 2 — wind shear and rain push boosters sideways',
    sky: ['#1c2733', '#3d5a6b', '#7d94a3'], ground: '#232a2e', haze: 'rgba(125,148,163,0.20)',
    wind: 1, rain: 1, dark: 0.12, speed: 1.25, spawnMs: 950, hazard: 'wind',
    boosterKinds: ['standard', 'cargo', 'swift', 'swift'], boss: 'debris' },
  { id: 2, name: 'NIGHT RECOVERY', sub: 'Realm 3 — searchlights only, fast and armored',
    sky: ['#050914', '#0d1b3a', '#1c2f5e'], ground: '#14161f', haze: 'rgba(90,140,255,0.10)',
    wind: 0, rain: 0, dark: 0.45, speed: 1.5, spawnMs: 820, hazard: 'dark',
    boosterKinds: ['swift', 'armored', 'cargo', 'armored'], boss: 'superheavy' },
];

export const BOOSTER_KINDS = {
  standard: { w: 46, h: 96, speed: 150, score: 100, scrap: 10, hp: 1, color: '#d8dee9', flame: '#ff9a3c', label: 'BOOSTER' },
  cargo:    { w: 58, h: 84, speed: 120, score: 150, scrap: 16, hp: 1, color: '#e8c46a', flame: '#ffb347', label: 'CARGO' },
  swift:    { w: 38, h: 88, speed: 235, score: 200, scrap: 14, hp: 1, color: '#7fd4ff', flame: '#4ac8ff', label: 'SWIFT' },
  armored:  { w: 56, h: 104, speed: 110, score: 300, scrap: 24, hp: 2, color: '#9aa7bd', flame: '#ff6b3c', label: 'ARMORED' },
  debris:   { w: 30, h: 30, speed: 190, score: 0, scrap: 0, hp: 1, color: '#8a6f5c', flame: null, label: 'DEBRIS', hazard: true },
};

// Twelve in-run upgrades, bought with Scrap between rounds. cost grows per level.
export const UPGRADES = [
  { id: 'longer',   name: 'Longer Chopsticks', desc: '+18% arm reach per level', max: 3, cost: 30 },
  { id: 'wider',    name: 'Wider Grip', desc: '+22% catch width per level', max: 3, cost: 30 },
  { id: 'magnet',   name: 'Tractor Magnet', desc: 'Pulls nearby boosters toward the arms', max: 3, cost: 40 },
  { id: 'slowmo',   name: 'Slow-Mo Servo', desc: 'Press S: time slows for 3s (longer per level)', max: 3, cost: 45 },
  { id: 'shield',   name: 'Heat Shield', desc: 'Blocks one missed booster per round per level', max: 2, cost: 50 },
  { id: 'double',   name: 'Double Catch', desc: 'Catch 2 boosters at once more often', max: 3, cost: 55 },
  { id: 'servo',     name: 'Servo Speed', desc: '+20% arm move speed per level', max: 3, cost: 25 },
  { id: 'scrap',    name: 'Scrap Salvager', desc: '+25% Scrap from every catch per level', max: 3, cost: 35 },
  { id: 'combo',    name: 'Combo Keeper', desc: 'Combo survives one miss per level', max: 2, cost: 40 },
  { id: 'repair',   name: 'Auto Repair', desc: 'Restore 1 Integrity between rounds per level', max: 2, cost: 45 },
  { id: 'lucky',    name: 'Lucky Rigging', desc: '+12% golden booster chance per level', max: 3, cost: 35 },
  { id: 'brakes',   name: 'Air Brakes', desc: 'Boosters fall 8% slower per level', max: 3, cost: 30 },
];

// Ten meta relics, kept in localStorage across runs. Bought with lifetime Scrap.
export const RELICS = [
  { id: 'titanium', name: 'Titanium Grip', desc: 'Catch width +15% forever', cost: 120 },
  { id: 'thrusters', name: 'Ion Thrusters', desc: 'Arm speed +15% forever', cost: 120 },
  { id: 'charm', name: 'Lucky Charm', desc: 'Golden boosters appear twice as often', cost: 150 },
  { id: 'fuelcell', name: 'Fuel Cell', desc: 'Start every run with +1 Integrity', cost: 180 },
  { id: 'gyro', name: 'Gyro Stabilizer', desc: 'Wind shear halved in Storm Front', cost: 140 },
  { id: 'spotlight', name: 'Spotlight Array', desc: 'Night Recovery is much brighter', cost: 140 },
  { id: 'vault', name: 'Scrap Vault', desc: 'Start every run with 40 Scrap', cost: 100 },
  { id: 'overclock', name: 'Overclock Core', desc: 'Slow-mo lasts +1.5s', cost: 160 },
  { id: 'plating', name: 'Ablative Plating', desc: 'First miss of a run costs nothing', cost: 200 },
  { id: 'beacon', name: 'Recovery Beacon', desc: 'Boss fights: +1 clamp window', cost: 220 },
];

export const MISSIONS = [
  { id: 'm1', text: 'Catch 5 boosters in a row without a miss', check: (s) => s.bestCombo >= 5 },
  { id: 'm2', text: 'Catch a golden booster', check: (s) => s.goldenCaught > 0 },
  { id: 'm3', text: 'Finish Realm 1 without losing Integrity', check: (s) => s.realmClearClean[0] === true },
  { id: 'm4', text: 'Beat a boss', check: (s) => s.bossesBeaten > 0 },
  { id: 'm5', text: 'Reach a x8 combo', check: (s) => s.bestCombo >= 8 },
  { id: 'm6', text: 'Score 5,000 in one run', check: (s) => s.score >= 5000 },
];

export const BOSSES = {
  rogue: { name: 'ROGUE BOOSTER', hp: 3, w: 110, h: 190, speed: 95, color: '#ff5a4e', desc: 'Erratic, fast, armored. Clamp it 3 times!' },
  debris: { name: 'DEBRIS STORM', hp: 4, w: 150, h: 60, speed: 70, color: '#c98a4b', desc: 'A spinning debris wall. Catch its core 4 times!' },
  superheavy: { name: 'SUPER HEAVY', hp: 5, w: 170, h: 260, speed: 55, color: '#b8c4d8', desc: 'Huge, slow, high value. Clamp it 5 times!' },
};
