// Fitness Messer - Kingdom View Page JavaScript

const buildings = [
    {
        id: 1,
        name: 'Royal Castle',
        icon: '🏰',
        description: 'The center of power and governance for your kingdom.',
        baseCost: 100,
        costMultiplier: 1.5
    },
    {
        id: 2,
        name: 'Barracks',
        icon: '⚔️',
        description: 'Trains and houses your warrior forces.',
        baseCost: 50,
        costMultiplier: 1.4
    },
    {
        id: 3,
        name: 'Training Ground',
        icon: '🏋️',
        description: 'Improves the strength and skills of your warriors.',
        baseCost: 40,
        costMultiplier: 1.3
    },
    {
        id: 4,
        name: 'Farm',
        icon: '🌾',
        description: 'Provides resources and sustenance for your kingdom.',
        baseCost: 30,
        costMultiplier: 1.3
    },
    {
        id: 5,
        name: 'Treasury',
        icon: '💰',
        description: 'Stores and protects your kingdom\'s wealth.',
        baseCost: 60,
        costMultiplier: 1.5
    },
    {
        id: 6,
        name: 'Workshop',
        icon: '🔨',
        description: 'Crafts equipment and improves your kingdom\'s technology.',
        baseCost: 45,
        costMultiplier: 1.4
    }
];

let selectedBuilding = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeKingdomView();
});

function initializeKingdomView() {
    renderBuildings();
    setupEventListeners();
    loadKingdomData();
}

function setupEventListeners() {
    const btnUpgrade = document.getElementById('btn-upgrade');
    if (btnUpgrade) {
        btnUpgrade.addEventListener('click', handleUpgrade);
    }
    
    // Listen for state changes
    if (typeof window !== 'undefined') {
        window.addEventListener('fitness-messer:state-changed', function() {
            loadKingdomData();
            renderBuildings();
            if (selectedBuilding) {
                updateBuildingDetails(selectedBuilding);
            }
        });
    }
}

function renderBuildings() {
    const gridEl = document.getElementById('buildings-grid');
    if (!gridEl) return;
    
    gridEl.innerHTML = buildings.map(building => {
        const level = getBuildingLevel(building.id);
        return `
            <div class="building-plot" 
                 data-building-id="${building.id}"
                 tabindex="0"
                 role="button"
                 aria-label="Building ${building.name}">
                <span class="building-icon">${building.icon}</span>
                <p class="building-name">${escapeHtml(building.name)}</p>
                <span class="building-level">Level ${level}</span>
            </div>
        `;
    }).join('');
    
    // Add click and keyboard event listeners
    gridEl.querySelectorAll('.building-plot').forEach(plot => {
        plot.addEventListener('click', function() {
            const buildingId = parseInt(this.getAttribute('data-building-id'));
            selectBuilding(buildingId);
        });
        
        plot.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const buildingId = parseInt(this.getAttribute('data-building-id'));
                selectBuilding(buildingId);
            }
        });
    });
}

function selectBuilding(buildingId) {
    // Remove previous selection
    document.querySelectorAll('.building-plot').forEach(p => p.classList.remove('selected'));
    
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;
    
    selectedBuilding = building;
    
    // Mark as selected
    const plot = document.querySelector(`.building-plot[data-building-id="${buildingId}"]`);
    if (plot) {
        plot.classList.add('selected');
    }
    
    updateBuildingDetails(building);
    clearKingdomFeedback();
}

function updateBuildingDetails(building) {
    document.getElementById('selected-building-name').textContent = building.name;
    document.getElementById('selected-building-desc').textContent = building.description;
    
    const level = getBuildingLevel(building.id);
    const cost = calculateUpgradeCost(building, level);
    
    const contentEl = document.getElementById('building-details-content');
    contentEl.innerHTML = `
        <div class="panel-row">
            <span class="panel-label">Current Level</span>
            <span class="panel-value">${level}</span>
        </div>
        <div class="panel-row">
            <span class="panel-label">Building Type</span>
            <span class="panel-value">${building.name}</span>
        </div>
        <div class="panel-row">
            <span class="panel-label">Next Level</span>
            <span class="panel-value">${level + 1}</span>
        </div>
    `;
    
    const upgradeSection = document.getElementById('upgrade-section');
    const upgradeCostEl = document.getElementById('upgrade-cost');
    const btnUpgrade = document.getElementById('btn-upgrade');
    
    if (upgradeSection && upgradeCostEl) {
        upgradeSection.style.display = 'block';
        upgradeCostEl.textContent = cost.toLocaleString();
        
        // Check if player can afford
        let state = {};
        if (typeof getState === 'function') {
            state = getState();
        } else if (typeof window.getState === 'function') {
            state = window.getState();
        }
        
        const coins = state.fmCoins || 0;
        if (btnUpgrade) {
            if (coins >= cost) {
                btnUpgrade.disabled = false;
                btnUpgrade.textContent = '⬆️ Upgrade Building';
            } else {
                btnUpgrade.disabled = true;
                btnUpgrade.textContent = '❌ Insufficient Coins';
            }
        }
    }
}

function getBuildingLevel(buildingId) {
    let state = {};
    if (typeof getState === 'function') {
        state = getState();
    } else if (typeof window.getState === 'function') {
        state = window.getState();
    }
    
    const buildings = state.buildings || {};
    return buildings[buildingId] ? (buildings[buildingId].level || 1) : 1;
}

function calculateUpgradeCost(building, currentLevel) {
    return Math.floor(building.baseCost * Math.pow(building.costMultiplier, currentLevel));
}

function handleUpgrade() {
    if (!selectedBuilding) return;
    
    const level = getBuildingLevel(selectedBuilding.id);
    const cost = calculateUpgradeCost(selectedBuilding, level);
    
    let state = {};
    if (typeof getState === 'function') {
        state = getState();
    } else if (typeof window.getState === 'function') {
        state = window.getState();
    }
    
    const coins = state.fmCoins || 0;
    
    if (coins < cost) {
        showKingdomFeedback('❌ Insufficient coins to upgrade this building!', 'error');
        return;
    }
    
    try {
        // Use shared storage transaction if available
        if (typeof upgradeBuilding === 'function') {
            const result = upgradeBuilding(selectedBuilding.id, cost);
            if (result && result.success) {
                showKingdomFeedback(`✅ ${selectedBuilding.name} upgraded to Level ${level + 1}!`, 'success');
                renderBuildings();
                updateBuildingDetails(selectedBuilding);
                loadKingdomData();
            } else {
                showKingdomFeedback(result.message || 'Upgrade failed!', 'error');
            }
        } else if (typeof window.upgradeBuilding === 'function') {
            const result = window.upgradeBuilding(selectedBuilding.id, cost);
            if (result && result.success) {
                showKingdomFeedback(`✅ ${selectedBuilding.name} upgraded to Level ${level + 1}!`, 'success');
                renderBuildings();
                updateBuildingDetails(selectedBuilding);
                loadKingdomData();
            } else {
                showKingdomFeedback(result.message || 'Upgrade failed!', 'error');
            }
        } else {
            // Fallback implementation
            if (!state.buildings) state.buildings = {};
            state.buildings[selectedBuilding.id] = {
                id: selectedBuilding.id,
                name: selectedBuilding.name,
                level: level + 1,
                upgradedAt: new Date().toISOString()
            };
            state.fmCoins = coins - cost;
            
            if (typeof saveState === 'function') {
                saveState(state);
            } else if (typeof window.saveState === 'function') {
                window.saveState(state);
            }
            
            showKingdomFeedback(`✅ ${selectedBuilding.name} upgraded to Level ${level + 1}!`, 'success');
            renderBuildings();
            updateBuildingDetails(selectedBuilding);
            loadKingdomData();
        }
    } catch (error) {
        console.error('Error upgrading building:', error);
        showKingdomFeedback('Error upgrading building. Please try again.', 'error');
    }
}

function loadKingdomData() {
    try {
        let state = {};
        if (typeof getState === 'function') {
            state = getState();
        } else if (typeof window.getState === 'function') {
            state = window.getState();
        }
        
        const coins = state.fmCoins || 0;
        const coinBalanceEl = document.getElementById('kingdom-coin-balance');
        if (coinBalanceEl) {
            coinBalanceEl.textContent = coins.toLocaleString();
        }
        
        const kingdomLevel = state.kingdomLevel || 1;
        const kvKingdomLevelEl = document.getElementById('kv-kingdom-level');
        if (kvKingdomLevelEl) kvKingdomLevelEl.textContent = kingdomLevel;
        
        const buildings = state.buildings || {};
        const buildingCount = Object.keys(buildings).length;
        const kvBuildingCountEl = document.getElementById('kv-building-count');
        if (kvBuildingCountEl) kvBuildingCountEl.textContent = buildingCount;
        
        // Calculate total upgrades
        let totalUpgrades = 0;
        Object.values(buildings).forEach(b => {
            totalUpgrades += (b.level || 1) - 1;
        });
        const kvTotalUpgradesEl = document.getElementById('kv-total-upgrades');
        if (kvTotalUpgradesEl) kvTotalUpgradesEl.textContent = totalUpgrades;
        
        const territories = state.territories || {};
        const territoryCount = Object.values(territories).filter(t => t.owned).length;
        const kvTerritoryCountEl = document.getElementById('kv-territory-count');
        if (kvTerritoryCountEl) kvTerritoryCountEl.textContent = territoryCount;
    } catch (error) {
        console.error('Error loading kingdom data:', error);
    }
}

function showKingdomFeedback(message, type) {
    const feedbackEl = document.getElementById('kingdom-transaction-feedback');
    if (!feedbackEl) return;
    
    feedbackEl.textContent = message;
    feedbackEl.className = `transaction-feedback feedback-${type}`;
    feedbackEl.style.display = 'block';
    
    setTimeout(() => {
        feedbackEl.style.display = 'none';
    }, 4000);
}

function clearKingdomFeedback() {
    const feedbackEl = document.getElementById('kingdom-transaction-feedback');
    if (feedbackEl) {
        feedbackEl.style.display = 'none';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
