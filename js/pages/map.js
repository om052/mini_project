// Fitness Messer - Kingdom Map Page JavaScript

const territories = [
    {
        id: 1,
        name: 'Royal Capital',
        icon: '👑',
        status: 'locked',
        level: 1,
        population: 5000,
        resources: 'Gold, Gems',
        description: 'The heart of the realm, seat of royal power.'
    },
    {
        id: 2,
        name: 'Warrior Highlands',
        icon: '⛰️',
        status: 'free',
        level: 2,
        population: 2500,
        resources: 'Iron, Training Grounds',
        description: 'Harsh mountains where warriors are forged.'
    },
    {
        id: 3,
        name: 'Golden Forest',
        icon: '🌲',
        status: 'free',
        level: 2,
        population: 3000,
        resources: 'Wood, Herbs',
        description: 'Ancient forest rich in natural resources.'
    },
    {
        id: 4,
        name: 'Crystal Lake',
        icon: '💎',
        status: 'free',
        level: 3,
        population: 1500,
        resources: 'Crystals, Water',
        description: 'Mystical lake with magical crystal formations.'
    },
    {
        id: 5,
        name: 'Training Valley',
        icon: '🏋️',
        status: 'free',
        level: 1,
        population: 2000,
        resources: 'Training Facilities',
        description: 'Perfect grounds for honing combat skills.'
    },
    {
        id: 6,
        name: 'Ancient Fortress',
        icon: '🏰',
        status: 'locked',
        level: 4,
        population: 1000,
        resources: 'Defense, Artifacts',
        description: 'Ruins of an ancient stronghold, waiting to be reclaimed.'
    }
];

let selectedTerritory = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeKingdomMap();
});

function initializeKingdomMap() {
    renderTerritories();
    setupEventListeners();
    updateTerritoryOwnershipFromState();
}

function setupEventListeners() {
    const btnInspect = document.getElementById('btn-inspect');
    const btnVisit = document.getElementById('btn-visit');
    const btnJoin = document.getElementById('btn-join');
    
    if (btnInspect) {
        btnInspect.addEventListener('click', handleInspect);
    }
    if (btnVisit) {
        btnVisit.addEventListener('click', handleVisit);
    }
    if (btnJoin) {
        btnJoin.addEventListener('click', handleJoin);
    }
    
    // Listen for state changes
    if (typeof window !== 'undefined') {
        window.addEventListener('fitness-messer:state-changed', function() {
            updateTerritoryOwnershipFromState();
            renderTerritories();
            if (selectedTerritory) {
                updateTerritoryDetails(selectedTerritory);
            }
        });
    }
}

function renderTerritories() {
    const gridEl = document.getElementById('territories-grid');
    if (!gridEl) return;
    
    gridEl.innerHTML = territories.map(territory => {
        const isLocked = territory.status === 'locked';
        const statusClass = isLocked ? 'status-locked' : (territory.status === 'claimed' ? 'status-claimed' : 'status-free');
        const statusText = isLocked ? 'Locked' : (territory.status === 'claimed' ? 'Claimed' : 'Free');
        
        return `
            <div class="territory-marker ${isLocked ? 'locked' : ''}" 
                 data-territory-id="${territory.id}"
                 tabindex="0"
                 role="button"
                 aria-label="Territory ${territory.name}">
                <span class="territory-icon">${territory.icon}</span>
                <p class="territory-name">${escapeHtml(territory.name)}</p>
                <span class="territory-status ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');
    
    // Add click and keyboard event listeners
    gridEl.querySelectorAll('.territory-marker').forEach(marker => {
        marker.addEventListener('click', function() {
            const territoryId = parseInt(this.getAttribute('data-territory-id'));
            selectTerritory(territoryId);
        });
        
        marker.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const territoryId = parseInt(this.getAttribute('data-territory-id'));
                selectTerritory(territoryId);
            }
        });
    });
}

function selectTerritory(territoryId) {
    // Remove previous selection
    document.querySelectorAll('.territory-marker').forEach(m => m.classList.remove('selected'));
    
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return;
    
    // Check if locked
    if (territory.status === 'locked') {
        showFeedback('This territory is locked and cannot be accessed yet!', 'error');
        selectedTerritory = null;
        updateActionButtons();
        document.getElementById('selected-territory-name').textContent = territory.name;
        document.getElementById('territory-details-content').innerHTML = `
            <p style="color: var(--text-secondary); text-align: center;">This territory is currently locked. Complete more challenges to unlock it!</p>
        `;
        return;
    }
    
    selectedTerritory = territory;
    
    // Mark as selected
    const marker = document.querySelector(`.territory-marker[data-territory-id="${territoryId}"]`);
    if (marker) {
        marker.classList.add('selected');
    }
    
    updateTerritoryDetails(territory);
    updateActionButtons();
    clearFeedback();
}

function updateTerritoryDetails(territory) {
    document.getElementById('selected-territory-name').textContent = territory.name;
    
    const contentEl = document.getElementById('territory-details-content');
    contentEl.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value">${territory.status === 'claimed' ? 'Claimed' : 'Available'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Level</span>
            <span class="detail-value">${territory.level}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Population</span>
            <span class="detail-value">${territory.population.toLocaleString()}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Resources</span>
            <span class="detail-value">${territory.resources}</span>
        </div>
        <div style="margin-top: 1rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.875rem;">${territory.description}</p>
        </div>
    `;
}

function updateActionButtons() {
    const btnInspect = document.getElementById('btn-inspect');
    const btnVisit = document.getElementById('btn-visit');
    const btnJoin = document.getElementById('btn-join');
    
    if (!selectedTerritory) {
        if (btnInspect) btnInspect.disabled = true;
        if (btnVisit) btnVisit.disabled = true;
        if (btnJoin) btnJoin.disabled = true;
        return;
    }
    
    if (btnInspect) btnInspect.disabled = false;
    if (btnVisit) btnVisit.disabled = false;
    
    if (btnJoin) {
        if (selectedTerritory.status === 'claimed') {
            btnJoin.disabled = true;
            btnJoin.textContent = '✓ Already Claimed';
        } else if (selectedTerritory.status === 'locked') {
            btnJoin.disabled = true;
            btnJoin.textContent = '🔒 Locked';
        } else {
            btnJoin.disabled = false;
            btnJoin.textContent = '🏴 Join Territory';
        }
    }
}

function handleInspect() {
    if (!selectedTerritory) return;
    showFeedback(`🔍 Inspecting ${selectedTerritory.name}... Scouting reports show it's suitable for expansion!`, 'success');
}

function handleVisit() {
    if (!selectedTerritory) return;
    showFeedback(`👁️ Visiting ${selectedTerritory.name}... The terrain looks favorable for your kingdom!`, 'success');
}

function handleJoin() {
    if (!selectedTerritory) return;
    
    if (selectedTerritory.status === 'claimed') {
        showFeedback('You have already claimed this territory!', 'error');
        return;
    }
    
    if (selectedTerritory.status === 'locked') {
        showFeedback('This territory is locked!', 'error');
        return;
    }
    
    // Check if already claimed in state
    let state = {};
    if (typeof getState === 'function') {
        state = getState();
    } else if (typeof window.getState === 'function') {
        state = window.getState();
    }
    
    const territories = state.territories || {};
    if (territories[selectedTerritory.id] && territories[selectedTerritory.id].owned) {
        showFeedback('You have already claimed this territory!', 'error');
        selectedTerritory.status = 'claimed';
        renderTerritories();
        updateActionButtons();
        return;
    }
    
    // Attempt to join territory
    try {
        if (typeof addTerritory === 'function') {
            const result = addTerritory(selectedTerritory.id, selectedTerritory.name);
            if (result && result.success) {
                selectedTerritory.status = 'claimed';
                renderTerritories();
                updateActionButtons();
                showFeedback(`🎉 Successfully claimed ${selectedTerritory.name}! Your empire expands!`, 'success');
            } else {
                showFeedback(result.message || 'Failed to claim territory!', 'error');
            }
        } else if (typeof window.addTerritory === 'function') {
            const result = window.addTerritory(selectedTerritory.id, selectedTerritory.name);
            if (result && result.success) {
                selectedTerritory.status = 'claimed';
                renderTerritories();
                updateActionButtons();
                showFeedback(`🎉 Successfully claimed ${selectedTerritory.name}! Your empire expands!`, 'success');
            } else {
                showFeedback(result.message || 'Failed to claim territory!', 'error');
            }
        } else {
            // Fallback
            if (!state.territories) state.territories = {};
            state.territories[selectedTerritory.id] = {
                id: selectedTerritory.id,
                name: selectedTerritory.name,
                owned: true,
                claimedAt: new Date().toISOString()
            };
            if (typeof saveState === 'function') {
                saveState(state);
            } else if (typeof window.saveState === 'function') {
                window.saveState(state);
            }
            selectedTerritory.status = 'claimed';
            renderTerritories();
            updateActionButtons();
            showFeedback(`🎉 Successfully claimed ${selectedTerritory.name}! Your empire expands!`, 'success');
        }
    } catch (error) {
        console.error('Error joining territory:', error);
        showFeedback('Error claiming territory. Please try again.', 'error');
    }
}

function updateTerritoryOwnershipFromState() {
    let state = {};
    if (typeof getState === 'function') {
        state = getState();
    } else if (typeof window.getState === 'function') {
        state = window.getState();
    }
    
    const territoriesState = state.territories || {};
    territories.forEach(territory => {
        if (territoriesState[territory.id] && territoriesState[territory.id].owned) {
            territory.status = 'claimed';
        }
    });
}

function showFeedback(message, type) {
    const feedbackEl = document.getElementById('transaction-feedback');
    if (!feedbackEl) return;
    
    feedbackEl.textContent = message;
    feedbackEl.className = `transaction-feedback feedback-${type}`;
    feedbackEl.style.display = 'block';
    
    setTimeout(() => {
        feedbackEl.style.display = 'none';
    }, 4000);
}

function clearFeedback() {
    const feedbackEl = document.getElementById('transaction-feedback');
    if (feedbackEl) {
        feedbackEl.style.display = 'none';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
