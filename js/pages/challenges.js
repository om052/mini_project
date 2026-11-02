// Challenges Page
document.addEventListener('DOMContentLoaded', function() {
  if (window.FMUI) {
    window.FMUI.renderLayout('challenges');
  }
  
  const dailyDiv = document.getElementById('dailyChallenges');
  const weeklyDiv = document.getElementById('weeklyChallenges');
  const completedDiv = document.getElementById('completedChallenges');
  const dailyDate = document.getElementById('dailyDate');
  const weeklyDate = document.getElementById('weeklyDate');
  
  const dailyChallenges = [
    { id: 'd1', title: 'Push-up Power', desc: 'Complete 20 push-ups', type: 'exercise', exercise: 'push-ups', target: 20, reward: 30 },
    { id: 'd2', title: 'Squat Sprint', desc: 'Complete 30 squats', type: 'exercise', exercise: 'squats', target: 30, reward: 25 },
    { id: 'd3', title: 'Cardio Kick', desc: 'Run 1000 meters', type: 'exercise', exercise: 'running', target: 1000, reward: 40 }
  ];
  
  const weeklyChallenges = [
    { id: 'w1', title: 'Workout Warrior', desc: 'Complete 5 workouts this week', type: 'count', target: 5, reward: 100 }
  ];
  
  function getDayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
  }
  
  function getWeekKey() {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return d.getFullYear() + '-W' + week;
  }
  
  dailyDate.textContent = 'Today: ' + new Date().toLocaleDateString();
  weeklyDate.textContent = 'Week: ' + getWeekKey();
  
  function loadChallenges() {
    if (!window.FMStorage) return;
    const state = window.FMStorage.loadState();
    const workouts = state.workouts || [];
    const claimed = state.challenges && state.challenges.claimed ? state.challenges.claimed : [];
    
    // Daily
    dailyDiv.innerHTML = '';
    dailyChallenges.forEach(ch => {
      const dayKey = getDayKey();
      const progressKey = 'd_' + ch.id + '_' + dayKey;
      let current = 0;
      if (ch.type === 'exercise') {
        workouts.forEach(w => {
          if (w.exerciseId === ch.exercise) {
            const wd = new Date(w.date);
            const wdKey = wd.getFullYear() + '-' + (wd.getMonth()+1) + '-' + wd.getDate();
            if (wdKey === dayKey) {
              current += (w.quantity || 0);
            }
          }
        });
      }
      const pct = Math.min(100, (current / ch.target) * 100);
      const completed = current >= ch.target;
      const claimedKey = progressKey + '_claimed';
      const isClaimed = claimed.includes(claimedKey);
      
      const item = document.createElement('div');
      item.className = 'challenge-item';
      item.innerHTML = '<div class=\"challenge-header\"><div class=\"challenge-title\">' + ch.title + '</div><div class=\"challenge-reward\">+' + ch.reward + ' FM Coins</div></div><div class=\"challenge-desc\">' + ch.desc + '</div><div class=\"challenge-progress-info\"><span>Progress: ' + Math.floor(current) + ' / ' + ch.target + '</span><span>' + Math.floor(pct) + '%</span></div><div class=\"progress-bar\"><div class=\"progress-fill\" style=\"width:' + pct + '%\"></div></div><div class=\"challenge-actions\"><button class=\"btn ' + (completed && !isClaimed ? 'btn-success' : 'btn') + '\" data-claim=\"' + claimedKey + '\" data-reward=\"' + ch.reward + '\" ' + (completed && !isClaimed ? '' : 'disabled') + '>' + (isClaimed ? 'Claimed' : (completed ? 'Claim Reward' : 'In Progress')) + '</button></div>';
      dailyDiv.appendChild(item);
    });
    
    // Weekly
    weeklyDiv.innerHTML = '';
    weeklyChallenges.forEach(ch => {
      const weekKey = getWeekKey();
      const progressKey = 'w_' + ch.id + '_' + weekKey;
      let current = 0;
      if (ch.type === 'count') {
        workouts.forEach(w => {
          const wd = new Date(w.date);
          const wonejan = new Date(wd.getFullYear(), 0, 1);
          const wweek = Math.ceil((((wd - wonejan) / 86400000) + wonejan.getDay() + 1) / 7);
          const wkey = wd.getFullYear() + '-W' + wweek;
          if (wkey === weekKey) current++;
        });
      }
      const pct = Math.min(100, (current / ch.target) * 100);
      const completed = current >= ch.target;
      const claimedKey = progressKey + '_claimed';
      const isClaimed = claimed.includes(claimedKey);
      
      const item = document.createElement('div');
      item.className = 'challenge-item';
      item.innerHTML = '<div class=\"challenge-header\"><div class=\"challenge-title\">' + ch.title + '</div><div class=\"challenge-reward\">+' + ch.reward + ' FM Coins</div></div><div class=\"challenge-desc\">' + ch.desc + '</div><div class=\"challenge-progress-info\"><span>Progress: ' + current + ' / ' + ch.target + ' workouts</span><span>' + Math.floor(pct) + '%</span></div><div class=\"progress-bar\"><div class=\"progress-fill\" style=\"width:' + pct + '%\"></div></div><div class=\"challenge-actions\"><button class=\"btn ' + (completed && !isClaimed ? 'btn-success' : 'btn') + '\" data-claim=\"' + claimedKey + '\" data-reward=\"' + ch.reward + '\" ' + (completed && !isClaimed ? '' : 'disabled') + '>' + (isClaimed ? 'Claimed' : (completed ? 'Claim Reward' : 'In Progress')) + '</button></div>';
      weeklyDiv.appendChild(item);
    });
    
    // Completed
    completedDiv.innerHTML = '';
    if (claimed.length === 0) {
      completedDiv.innerHTML = '<p style=\"color: var(--text-secondary);\">No completed challenges yet</p>';
    } else {
      claimed.slice(-5).reverse().forEach(c => {
        const div = document.createElement('div');
        div.className = 'completed-item';
        div.innerHTML = '<span>✅ Challenge Completed</span><span style=\"color:var(--gold);\">Claimed</span>';
        completedDiv.appendChild(div);
      });
    }
  }
  
  document.body.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.claim && !e.target.disabled) {
      const claimKey = e.target.dataset.claim;
      const reward = Number(e.target.dataset.reward) || 0;
      if (!window.FMStorage) return;
      window.FMStorage.updateState(function(state) {
        if (!state.challenges) state.challenges = { daily: [], weekly: [], claimed: [] };
        if (!Array.isArray(state.challenges.claimed)) state.challenges.claimed = [];
        if (state.challenges.claimed.includes(claimKey)) return;
        state.challenges.claimed.push(claimKey);
        state.coins = (Number(state.coins) || 0) + reward;
      });
      e.target.disabled = true;
      e.target.textContent = 'Claimed';
      e.target.className = 'btn';
      loadChallenges();
    }
  });
  
  loadChallenges();
  window.addEventListener('fitness-messer:state-changed', loadChallenges);
});
