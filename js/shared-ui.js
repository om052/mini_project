function createNav(activePage) {
  const nav = document.createElement('nav');
  nav.className = 'sidebar';
  nav.innerHTML = 
    <div class="nav-header">
      <h2>Fitness Messer</h2>
      <div class="tagline">Let's Build Empire With Exercise</div>
    </div>
    <ul class="nav-links">
      <li><a href="../index.html" class="">Dashboard</a></li>
      <li><a href="kingdom-map.html" class="">Kingdom Map</a></li>
      <li><a href="kingdom-view.html" class="">Kingdom View</a></li>
      <li><a href="workouts.html" class="">Workouts</a></li>
      <li><a href="progress.html" class="">Progress</a></li>
      <li><a href="challenges.html" class="">Challenges</a></li>
      <li><a href="sabha.html" class="">Sabha</a></li>
      <li><a href="army.html" class="">Army</a></li>
      <li><a href="profile.html" class="">Profile</a></li>
      <li><a href="settings.html" class="">Settings</a></li>
    </ul>
    <div class="nav-footer">
      <div class="coin-display">FM Coins: <span id="nav-coin">0</span></div>
    </div>
  ;
  return nav;
}

function updateNavCoins() {
  try {
    const state = window.FMStorage ? window.FMStorage.loadState() : null;
    const el = document.getElementById('nav-coin');
    if (el && state) el.textContent = Math.floor(state.coins * 100) / 100;
  } catch (e) {}
}

function renderLayout(activePage) {
  const app = document.getElementById('app') || document.body;
  // If using app container
  if (document.getElementById('app')) {
    const existingNav = app.querySelector('.sidebar');
    if (existingNav) existingNav.remove();
    const nav = createNav(activePage);
    app.insertBefore(nav, app.firstChild);
  } else {
    // wrap body content if needed - simple approach
    const nav = createNav(activePage);
    document.body.insertBefore(nav, document.body.firstChild);
  }
  updateNavCoins();
  window.addEventListener('fitness-messer:state-changed', updateNavCoins);
}

window.FMUI = {
  createNav,
  updateNavCoins,
  renderLayout
};
