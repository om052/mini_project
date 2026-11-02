// Fitness Messer - Dashboard Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    loadDashboardData();
    setupEventListeners();
}

function setupEventListeners() {
    // Listen for state changes from shared storage
    if (typeof window !== 'undefined') {
        window.addEventListener('fitness-messer:state-changed', function() {
            loadDashboardData();
        });
    }
}

function loadDashboardData() {
    try {
        // Get state from shared storage if available
        let state = {};
        if (typeof getState === 'function') {
            state = getState();
        } else if (typeof window.getState === 'function') {
            state = window.getState();
        } else {
            // Fallback to localStorage
            const savedState = localStorage.getItem('fitnessMesserState');
            if (savedState) {
                state = JSON.parse(savedState);
            }
        }
        
        updateHeader(state);
        updateStats(state);
        updateWelcomeMessage(state);
        updateRecentActivities(state);
        updateSuggestedChallenges(state);
        updateKingdomOverview(state);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showDashboardError();
    }
}

function updateHeader(state) {
    const coinBalance = state.fmCoins || 0;
    const headerCoinEl = document.getElementById('header-coin-balance');
    if (headerCoinEl) {
        headerCoinEl.textContent = coinBalance.toLocaleString();
    }
}

function updateStats(state) {
    const coins = state.fmCoins || 0;
    const strength = state.warriorStrength || 0;
    const workouts = Array.isArray(state.workoutHistory) ? state.workoutHistory.length : 0;
    const level = state.kingdomLevel || 1;
    
    const statsCoinsEl = document.getElementById('stat-coins');
    const statsStrengthEl = document.getElementById('stat-strength');
    const statsWorkoutsEl = document.getElementById('stat-workouts');
    const statsLevelEl = document.getElementById('stat-level');
    
    if (statsCoinsEl) statsCoinsEl.textContent = coins.toLocaleString();
    if (statsStrengthEl) statsStrengthEl.textContent = strength.toLocaleString();
    if (statsWorkoutsEl) statsWorkoutsEl.textContent = workouts.toLocaleString();
    if (statsLevelEl) statsLevelEl.textContent = level.toLocaleString();
}

function updateWelcomeMessage(state) {
    const greetingEl = document.getElementById('welcome-greeting');
    if (greetingEl) {
        const hour = new Date().getHours();
        let timeGreeting = 'Welcome';
        if (hour < 12) timeGreeting = 'Good Morning';
        else if (hour < 18) timeGreeting = 'Good Afternoon';
        else timeGreeting = 'Good Evening';
        
        const username = state.username || 'Warrior';
        greetingEl.textContent = `${timeGreeting}, ${username}!`;
    }
}

function updateRecentActivities(state) {
    const activitiesEl = document.getElementById('recent-activities');
    if (!activitiesEl) return;
    
    const activities = Array.isArray(state.recentActivities) ? state.recentActivities : [];
    
    if (activities.length === 0) {
        activitiesEl.innerHTML = `
            <div class="empty-state">
                <p>No recent activities yet</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Complete your first workout to see activities here!</p>
            </div>
        `;
        return;
    }
    
    activitiesEl.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${getActivityIcon(activity.type)}</div>
            <div class="activity-info">
                <p class="activity-title">${escapeHtml(activity.title || 'Activity')}</p>
                <p class="activity-meta">${formatActivityDate(activity.date)}</p>
            </div>
            <div class="activity-reward">+${activity.reward || 0} 🪙</div>
        </div>
    `).join('');
}

function updateSuggestedChallenges(state) {
    const challengesEl = document.getElementById('suggested-challenges');
    if (!challengesEl) return;
    
    const challenges = Array.isArray(state.suggestedChallenges) ? state.suggestedChallenges : getDefaultChallenges();
    
    challengesEl.innerHTML = challenges.slice(0, 3).map(challenge => `
        <div class="challenge-item">
            <div class="challenge-header">
                <p class="challenge-title">${escapeHtml(challenge.title)}</p>
                <span class="challenge-type">${challenge.type || 'Daily'}</span>
            </div>
            <div class="challenge-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calculateProgress(challenge)}%"></div>
                </div>
            </div>
            <p class="progress-text">${challenge.current || 0}/${challenge.target || 1} completed</p>
        </div>
    `).join('');
}

function updateKingdomOverview(state) {
    const kingdomNameEl = document.getElementById('kingdom-name');
    const kingdomLevelEl = document.getElementById('kingdom-level');
    const buildingCountEl = document.getElementById('building-count');
    const territoryCountEl = document.getElementById('territory-count');
    
    if (kingdomNameEl) kingdomNameEl.textContent = state.kingdomName || 'My Kingdom';
    if (kingdomLevelEl) kingdomLevelEl.textContent = state.kingdomLevel || 1;
    
    const buildings = state.buildings || {};
    const buildingCount = Object.keys(buildings).length;
    if (buildingCountEl) buildingCountEl.textContent = buildingCount;
    
    const territories = state.territories || {};
    const territoryCount = Object.values(territories).filter(t => t.owned).length;
    if (territoryCountEl) territoryCountEl.textContent = territoryCount;
}

function getActivityIcon(type) {
    switch(type) {
        case 'workout': return '💪';
        case 'challenge': return '🎯';
        case 'upgrade': return '⬆️';
        case 'territory': return '🗺️';
        default: return '✨';
    }
}

function formatActivityDate(dateStr) {
    if (!dateStr) return 'Recently';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    } catch {
        return 'Recently';
    }
}

function calculateProgress(challenge) {
    const current = challenge.current || 0;
    const target = challenge.target || 1;
    return Math.min(100, Math.max(0, (current / target) * 100));
}

function getDefaultChallenges() {
    return [
        { title: 'Complete 3 Workouts', type: 'Daily', current: 0, target: 3 },
        { title: 'Earn 100 FM Coins', type: 'Weekly', current: 0, target: 100 },
        { title: 'Upgrade a Building', type: 'Daily', current: 0, target: 1 }
    ];
}

function showDashboardError() {
    const activitiesEl = document.getElementById('recent-activities');
    if (activitiesEl) {
        activitiesEl.innerHTML = `
            <div class="error-state">
                <p>Error loading dashboard data</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Please check console for details</p>
            </div>
        `;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
