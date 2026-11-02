const EXERCISE_REWARDS = {
  'push-ups': { base: 2, unit: 'reps' },
  'squats': { base: 1.5, unit: 'reps' },
  'sit-ups': { base: 1.5, unit: 'reps' },
  'pull-ups': { base: 3, unit: 'reps' },
  'plank': { base: 5, unit: 'seconds' },
  'running': { base: 0.1, unit: 'meters' },
  'cycling': { base: 0.05, unit: 'meters' },
  'jumping jacks': { base: 1, unit: 'reps' }
};

function calculateWorkoutCoins(exerciseId, quantity) {
  const q = Number(quantity);
  if (isNaN(q) || q <= 0) return 0;
  const key = (exerciseId || '').toLowerCase();
  const cfg = EXERCISE_REWARDS[key];
  if (!cfg) return 0;
  let coins = 0;
  if (cfg.unit === 'reps') {
    coins = q * cfg.base;
  } else if (cfg.unit === 'seconds') {
    // plank: base per second? but we said base 5 per second is odd; interpret as 5 coins per 10s? Or just q*base with reasonable cap
    // Keep simple: q seconds * base (small) but cap
    coins = (q / 1) * cfg.base * 0.1; // 5 per 10s? easier: q*0.5 if base 5? Or just q*base/10
    coins = (q * cfg.base) / 10;
  } else if (cfg.unit === 'meters') {
    coins = (q * cfg.base);
  }
  // Apply reasonable limits
  if (coins > 1000) coins = 1000;
  if (coins < 0) coins = 0;
  // Round to reasonable precision
  return Math.round(coins * 100) / 100;
}

function getExerciseList() {
  return [
    { id: 'push-ups', name: 'Push-ups', unit: 'reps' },
    { id: 'squats', name: 'Squats', unit: 'reps' },
    { id: 'sit-ups', name: 'Sit-ups', unit: 'reps' },
    { id: 'pull-ups', name: 'Pull-ups', unit: 'reps' },
    { id: 'plank', name: 'Plank', unit: 'seconds' },
    { id: 'running', name: 'Running', unit: 'meters' },
    { id: 'cycling', name: 'Cycling', unit: 'meters' },
    { id: 'jumping jacks', name: 'Jumping Jacks', unit: 'reps' }
  ];
}

window.FMData = {
  EXERCISE_REWARDS,
  calculateWorkoutCoins,
  getExerciseList
};
