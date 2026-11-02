// Progress Page
document.addEventListener('DOMContentLoaded', function() {
  if (window.FMUI) {
    window.FMUI.renderLayout('progress');
  }
  
  const pCoins = document.getElementById('pCoins');
  const pWorkouts = document.getElementById('pWorkouts');
  const pQty = document.getElementById('pQty');
  const pStrength = document.getElementById('pStrength');
  const weekChart = document.getElementById('weekChart');
  const exerciseStats = document.getElementById('exerciseStats');
  const recentActivity = document.getElementById('recentActivity');
  const achievements = document.getElementById('achievements');
  
  function loadProgress() {
    if (!window.FMStorage) return;
    const state = window.FMStorage.loadState();
    const workouts = state.workouts || [];
    
    pCoins.textContent = Math.floor(state.coins * 100) / 100;
    pWorkouts.textContent = workouts.length;
    
    let totalQty = 0;
    workouts.forEach(w => {
      if (typeof w.quantity === 'number') totalQty += w.quantity;
    });
    pQty.textContent = Math.floor(totalQty * 100) / 100;
    
    // Warrior strength = coins * 0.1 + workouts * 2
    const strength = Math.floor((state.coins * 0.1 + workouts.length * 2) * 10) / 10;
    pStrength.textContent = strength;
    
    // Weekly chart (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const count = workouts.filter(w => {
        const wd = new Date(w.date);
        return wd.getDate() === d.getDate() && wd.getMonth() === d.getMonth() && wd.getFullYear() === d.getFullYear();
      }).length;
      weekData.push({ day: dayName, count: count });
    }
    weekChart.innerHTML = '';
    const maxCount = Math.max(1, ...weekData.map(x => x.count));
    weekData.forEach(d => {
      const bar = document.createElement('div');
      bar.className = 'week-bar';
      const height = (d.count / maxCount) * 140 + 20;
      bar.innerHTML = '<div class=\"bar-count\">' + d.count + '</div><div class=\"bar\" style=\"height:' + height + 'px;\"></div><div class=\"bar-label\">' + d.day + '</div>';
      weekChart.appendChild(bar);
    });
    
    // Exercise breakdown
    exerciseStats.innerHTML = '';
    if (workouts.length === 0) {
      exerciseStats.innerHTML = '<p style=\"color: var(--text-secondary);\">No workouts yet</p>';
    } else {
      const counts = {};
      workouts.forEach(w => {
        counts[w.exerciseName] = (counts[w.exerciseName] || 0) + (w.quantity || 0);
      });
      Object.keys(counts).sort((a,b) => counts[b] - counts[a]).slice(0, 5).forEach(name => {
        const item = document.createElement('div');
        item.className = 'exercise-item';
        item.innerHTML = '<span class=\"exercise-name\">' + name + '</span><span class=\"exercise-count\">' + counts[name] + '</span>';
        exerciseStats.appendChild(item);
      });
    }
    
    // Recent activity
    recentActivity.innerHTML = '';
    if (workouts.length === 0) {
      recentActivity.innerHTML = '<p style=\"color: var(--text-secondary);\">Start working out to see your progress!</p>';
    } else {
      const recent = workouts.slice(-5).reverse();
      recent.forEach(w => {
        const div = document.createElement('div');
        div.style.cssText = 'padding:0.6rem 0; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between;';
        const date = new Date(w.date).toLocaleDateString();
        div.innerHTML = '<span>' + w.exerciseName + ' ' + w.quantity + ' ' + w.unit + '</span><span style=\"color:var(--gold);\">+' + w.coinsEarned + ' FM • ' + date + '</span>';
        recentActivity.appendChild(div);
      });
    }
    
    // Achievements
    const ach = achievements.querySelectorAll('.achievement');
    if (workouts.length >= 1) ach[0].classList.remove('locked');
    if (workouts.length >= 5) ach[1].classList.remove('locked');
    if (state.coins >= 100) ach[2].classList.remove('locked');
  }
  
  loadProgress();
  window.addEventListener('fitness-messer:state-changed', loadProgress);
});
