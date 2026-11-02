const STORAGE_KEY = 'fitnessMesser.v1';

const defaultState = {
  user: {
    name: 'Warrior',
    joinedAt: Date.now()
  },
  coins: 0,
  workouts: [],
  challenges: {
    daily: [],
    weekly: [],
    claimed: []
  },
  kingdom: {},
  army: {},
  settings: {}
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveState(defaultState);
      return JSON.parse(JSON.stringify(defaultState));
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      saveState(defaultState);
      return JSON.parse(JSON.stringify(defaultState));
    }
    // Merge with defaults to be safe
    const merged = JSON.parse(JSON.stringify(defaultState));
    if (parsed.user) merged.user = { ...merged.user, ...parsed.user };
    if (typeof parsed.coins === 'number') merged.coins = parsed.coins;
    if (Array.isArray(parsed.workouts)) merged.workouts = parsed.workouts;
    if (parsed.challenges) {
      merged.challenges.daily = Array.isArray(parsed.challenges.daily) ? parsed.challenges.daily : [];
      merged.challenges.weekly = Array.isArray(parsed.challenges.weekly) ? parsed.challenges.weekly : [];
      merged.challenges.claimed = Array.isArray(parsed.challenges.claimed) ? parsed.challenges.claimed : [];
    }
    if (parsed.kingdom) merged.kingdom = parsed.kingdom;
    if (parsed.army) merged.army = parsed.army;
    if (parsed.settings) merged.settings = parsed.settings;
    return merged;
  } catch (e) {
    console.error('Failed to load state', e);
    try { saveState(defaultState); } catch (_) {}
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Notify other pages
    try {
      window.dispatchEvent(new CustomEvent('fitness-messer:state-changed'));
    } catch (_) {}
    return true;
  } catch (e) {
    console.error('Failed to save state', e);
    return false;
  }
}

function updateState(mutator) {
  const state = loadState();
  if (typeof mutator === 'function') {
    mutator(state);
  }
  saveState(state);
  return state;
}

function resetDemoData() {
  saveState(JSON.parse(JSON.stringify(defaultState)));
  return loadState();
}

// Expose minimal API
window.FMStorage = {
  loadState,
  saveState,
  updateState,
  resetDemoData,
  STORAGE_KEY
};
