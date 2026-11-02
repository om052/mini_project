// Workouts Page
document.addEventListener('DOMContentLoaded', function() {
  if (window.FMUI) {
    window.FMUI.renderLayout('workouts');
  }
  
  const exerciseSelect = document.getElementById('exerciseSelect');
  const quantityInput = document.getElementById('quantityInput');
  const quantityLabel = document.getElementById('quantityLabel');
  const recordBtn = document.getElementById('recordBtn');
  const workoutMsg = document.getElementById('workoutMsg');
  const rewardPreview = document.getElementById('rewardPreview');
  const historyList = document.getElementById('historyList');
  const totalCoinsEl = document.getElementById('totalCoins');
  const totalWorkoutsEl = document.getElementById('totalWorkouts');
  const totalQtyEl = document.getElementById('totalQty');
  
  let exercises = [];
  if (window.FMData) {
    exercises = window.FMData.getExerciseList();
  }
  
  // Populate exercises
  exercises.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex.id;
    opt.textContent = ex.name + ' (' + ex.unit + ')';
    exerciseSelect.appendChild(opt);
  });
  
  function updateLabel() {
    const ex = exercises.find(e => e.id === exerciseSelect.value);
    if (ex) {
      quantityLabel.textContent = 'Quantity (' + ex.unit + ')';
      quantityInput.placeholder = 'Enter ' + ex.unit;
    }
  }
  
  exerciseSelect.addEventListener('change', function() {
    updateLabel();
    updatePreview();
  });
  
  quantityInput.addEventListener('input', updatePreview);
  
  function updatePreview() {
    if (!window.FMData) {
      rewardPreview.textContent = '0';
      return;
    }
    const coins = window.FMData.calculateWorkoutCoins(exerciseSelect.value, quantityInput.value);
    rewardPreview.textContent = coins;
  }
  
  updateLabel();
  updatePreview();
  
  function showMessage(msg, type) {
    workoutMsg.textContent = msg;
    workoutMsg.className = 'alert alert-' + type;
    workoutMsg.style.display = 'block';
    setTimeout(function() {
      workoutMsg.style.display = 'none';
    }, 3000);
  }
  
  function loadStats() {
    if (!window.FMStorage) return;
    const state = window.FMStorage.loadState();
    totalCoinsEl.textContent = Math.floor(state.coins * 100) / 100;
    totalWorkoutsEl.textContent = state.workouts.length;
    let totalQty = 0;
    state.workouts.forEach(w => {
      if (typeof w.quantity === 'number') totalQty += w.quantity;
    });
    totalQtyEl.textContent = Math.floor(totalQty * 100) / 100;
    renderHistory(state.workouts);
  }
  
  function renderHistory(workouts) {
    historyList.innerHTML = '';
    if (!workouts || workouts.length === 0) {
      historyList.innerHTML = '<p style=\"color: var(--text-secondary);\">No workouts yet. Start training!</p>';
      return;
    }
    // Show last 10
    const recent = workouts.slice(-10).reverse();
    recent.forEach(w => {
      const item = document.createElement('div');
      item.className = 'history-item';
      const date = new Date(w.date).toLocaleString();
      item.innerHTML = '<div class=\"history-info\"><div class=\"history-exercise\">' + w.exerciseName + ' - ' + w.quantity + ' ' + w.unit + '</div><div class=\"history-details\">' + date + ' • Demo/Unverified</div></div><div class=\"history-coins\">+' + w.coinsEarned + ' FM</div>';
      historyList.appendChild(item);
    });
  }
  
  recordBtn.addEventListener('click', function() {
    if (!window.FMStorage || !window.FMData) {
      showMessage('Storage not available', 'error');
      return;
    }
    const exId = exerciseSelect.value;
    const ex = exercises.find(e => e.id === exId);
    const qty = quantityInput.value;
    const coinsEarned = window.FMData.calculateWorkoutCoins(exId, qty);
    
    if (coinsEarned <= 0 || isNaN(Number(qty)) || Number(qty) <= 0) {
      showMessage('Invalid quantity. Please enter a valid amount.', 'error');
      return;
    }
    
    // Prevent rapid clicks
    recordBtn.disabled = true;
    setTimeout(function() { recordBtn.disabled = false; }, 1000);
    
    window.FMStorage.updateState(function(state) {
      state.coins = (Number(state.coins) || 0) + coinsEarned;
      state.workouts.push({
        id: Date.now(),
        exerciseId: exId,
        exerciseName: ex ? ex.name : exId,
        quantity: Number(qty),
        unit: ex ? ex.unit : '',
        coinsEarned: coinsEarned,
        date: new Date().toISOString(),
        verified: false,
        demo: true
      });
    });
    
    showMessage('Workout recorded! +' + coinsEarned + ' FM Coins earned (Demo/Unverified)', 'success');
    loadStats();
    quantityInput.value = '';
    updatePreview();
  });
  
  loadStats();
  window.addEventListener('fitness-messer:state-changed', loadStats);
});
