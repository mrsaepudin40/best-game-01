// SaveData.js — high score, lifetime Scrap, owned relics and mission progress
// in localStorage. A failed read never reports zero progress as a crash.
const KEY = 'chopstick-catch-v2-save';
export function loadSave() {
  const fallback = { best: 0, lifetimeScrap: 0, relics: [], missionsDone: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const d = JSON.parse(raw);
    return {
      best: d.best | 0, lifetimeScrap: d.lifetimeScrap | 0,
      relics: Array.isArray(d.relics) ? d.relics : [],
      missionsDone: Array.isArray(d.missionsDone) ? d.missionsDone : [],
    };
  } catch (e) { return fallback; }
}
export function storeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      best: save.best, lifetimeScrap: save.lifetimeScrap,
      relics: [...save.relics], missionsDone: save.missionsDone,
    }));
  } catch (e) { /* storage full or blocked — the run still plays */ }
}
