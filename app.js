const LEADERBOARD_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVvvNGujGkfjrkQbiedhJVzNl4va6QMYKCMXE2SG14OE0wAf0vczmzVHP_GMASwqBdWHbuRZI10U2x/pub?gid=481878926&single=true&output=csv';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdmJQA-TDUR_qj4139Ez1rr0PVe87F9iZy08pNFmLjVMgYIxw/formResponse';

let state = { knockout: { userScores: {} }, visiblePhases: {} };

function createMatchHTML(match, roundType = 'regular') {
    const h = state.knockout.userScores?.[match.match]?.home ?? '';
    const a = state.knockout.userScores?.[match.match]?.away ?? '';
    
    return `
        <div class="match-card ${roundType === 'final' ? 'final-match' : ''}">
            <div class="team-row">
                <div class="team-info">
                    <span class="flag-placeholder"></span>
                    <span class="team-name">${match.team1.name || match.team1}</span>
                </div>
                <input type="number" class="score" min="0" placeholder="0" value="${h}"
                    oninput="handleScoreChange(${match.match}, 'home', this.value)">
            </div>
            <div class="team-row">
                <div class="team-info">
                    <span class="flag-placeholder"></span>
                    <span class="team-name">${match.team2.name || match.team2}</span>
                </div>
                <input type="number" class="score" min="0" placeholder="0" value="${a}"
                    oninput="handleScoreChange(${match.match}, 'away', this.value)">
            </div>
        </div>
    `;
}

function renderBracket() {
    if (typeof RESULTS === 'undefined' || !RESULTS.knockout) return;

    const matches = RESULTS.knockout.matches;

    // Dieciseisavos
    if (matches.round32 && matches.round32.length > 0) {
        const html = matches.round32.map(m => createMatchHTML(m)).join('');
        document.getElementById('round32').innerHTML = html;
    }

    // Octavos
    if (matches.round16 && matches.round16.length > 0) {
        const html = matches.round16.map(m => createMatchHTML(m)).join('');
        document.getElementById('round16').innerHTML = html;
    }

    // Cuartos
    if (matches.quarterfinals && matches.quarterfinals.length > 0) {
        const html = matches.quarterfinals.map(m => createMatchHTML(m)).join('');
        document.getElementById('quarterfinals').innerHTML = html;
    }

    // Semis
    if (matches.semifinals && matches.semifinals.length > 0) {
        const html = matches.semifinals.map(m => createMatchHTML(m)).join('');
        document.getElementById('semifinals').innerHTML = html;
    }

    // Final
    if (matches.final && matches.final.length > 0) {
        const html = matches.final.map(m => createMatchHTML(m, 'final')).join('');
        document.getElementById('final').innerHTML = html;
    }
}

function handleScoreChange(matchId, side, value) {
    if (!state.knockout.userScores[matchId]) {
        state.knockout.userScores[matchId] = { home: null, away: null };
    }
    state.knockout.userScores[matchId][side] = value !== '' ? parseInt(value, 10) : null;
    saveLocalPrediction();
}

function saveLocalPrediction() {
    const payload = { knockout: state.knockout.userScores, visiblePhases: state.visiblePhases, timestamp: new Date().toISOString() };
    localStorage.setItem('worldCup2026_myPrediction', JSON.stringify(payload));
}

function restoreLocalPrediction() {
    const saved = localStorage.getItem('worldCup2026_myPrediction');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.knockout.userScores = parsed.knockout || {};
            state.visiblePhases = parsed.visiblePhases || {};
            renderBracket();
            updatePhaseVisibility();
        } catch(e) {}
    }
}

function togglePhase(phase) {
    state.visiblePhases[phase] = !state.visiblePhases[phase];
    updatePhaseVisibility();
    saveLocalPrediction();
}

function updatePhaseVisibility() {
    const phaseMap = {
        'round32': 'round32-container',
        'round16': 'round16-container',
        'quarterfinals': 'quarterfinals-container',
        'semifinals': 'semifinals-container',
        'final': 'final-container'
    };

    Object.entries(phaseMap).forEach(([phase, containerId]) => {
        const container = document.getElementById(containerId);
        const btn = document.querySelector(`[data-phase="${phase}"]`);
        
        if (state.visiblePhases[phase]) {
            container.style.display = 'flex';
            btn.classList.add('active');
            btn.textContent = '👁️ Ocultar';
        } else {
            container.style.display = 'none';
            btn.classList.remove('active');
            btn.textContent = '👁️ Ver';
        }
    });
}

function submitPrediction(playerName) {
    showLoading(true, "Enviando pronóstico...");
    const payload = { user: playerName, timestamp: new Date().toISOString(), knockout: state.knockout.userScores };
    const formData = new FormData();
    formData.append("entry.1597300776", playerName);
    formData.append("entry.1633537385", "FASE_ELIMINATORIA");
    formData.append("entry.634416458", JSON.stringify(state.knockout.userScores));

    fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData })
    .then(() => {
        showLoading(false);
        document.getElementById('nameModal').style.display = 'none';
        localStorage.setItem('worldCup2026_myPrediction', JSON.stringify(payload));
        downloadPrediction(playerName, payload);
        showToast('✅ ¡Pronóstico enviado y descargado!');
        triggerConfetti();
    })
    .catch(err => { 
        showLoading(false); 
        showToast("Error al enviar", true); 
    });
}

function downloadPrediction(playerName, payload) {
    const dataStr = JSON.stringify(payload, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pronostico_${playerName}_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function showLoading(show, text = 'Cargando...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        document.getElementById('loadingText').innerText = text;
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showToast(msg, isError = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function triggerConfetti() {
    const container = document.getElementById('confettiContainer');
    if (container) {
        container.innerHTML = '🎉⚽🎉 ¡CAMPEÓN! 🎉⚽🎉';
        setTimeout(() => container.innerHTML = '', 5000);
    }
}

async function loadLeaderboard() {
    const section = document.getElementById('leaderboard-section');
    const container = document.getElementById('leaderboardContent');
    
    section.style.display = 'block';
    container.innerHTML = '<div class="lb-loading"><span class="ball-spinner">⚽</span><p>Cargando ranking...</p></div>';
    
    try {
        const res = await fetch(LEADERBOARD_CSV_URL + '&cachebust=' + Date.now());
        const text = await res.text();
        const rows = text.trim().split('\n').filter(row => {
            const name = (row.split(',')[0] || '').replace(/^"|"$/g, '').trim().toLowerCase();
            return name && name !== 'nombre' && name !== 'name';
        });
        
        if (!rows.length) { 
            container.innerHTML = '<p class="note-text">Sin datos aún</p>'; 
            return; 
        }
        
        const players = rows.map(row => {
            const cols = row.split(',');
            return { 
                name: (cols[0] || '').replace(/^"|"$/g, '').trim(), 
                pts: parseInt((cols[1] || '0').replace(/^"|"$/g, '').trim(), 10) || 0 
            };
        }).filter(p => p.name).sort((a, b) => b.pts - a.pts);
        
        const medals = ['🥇', '🥈', '🥉'];
        const html = players.map((p, i) => `
            <div class="lb-row">
                <span class="lb-pos">${medals[i] || (i+1)}</span>
                <span class="lb-name">${p.name}</span>
                <span class="lb-pts">${p.pts}</span>
            </div>
        `).join('');
        
        container.innerHTML = `<div class="leaderboard-table">${html}</div>`;
    } catch (e) {
        container.innerHTML = '<p class="note-text" style="color: #e74c3c;">Error cargando ranking</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderBracket();
    restoreLocalPrediction();

    // Toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const phase = btn.getAttribute('data-phase');
            togglePhase(phase);
        });
    });

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const isBracket = btn.getAttribute('data-tab') === 'bracket';
            document.getElementById('bracket-section').style.display = isBracket ? 'flex' : 'none';
            document.getElementById('leaderboard-section').style.display = isBracket ? 'none' : 'block';
            document.querySelector('.submit-section').style.display = isBracket ? 'flex' : 'none';
            
            if (!isBracket) loadLeaderboard();
        });
    });

    // Reset
    document.getElementById('btnReset')?.addEventListener('click', () => {
        if (confirm('¿Borrar todos los pronósticos?')) {
            localStorage.removeItem('worldCup2026_myPrediction');
            state.knockout.userScores = {};
            state.visiblePhases = {};
            renderBracket();
            updatePhaseVisibility();
            showToast('Pronósticos limpiados');
        }
    });

    // Scoring Help
    document.getElementById('btnScoringHelp')?.addEventListener('click', () => {
        alert('PUNTUACIÓN:\n\n⚽ Marcador exacto: 3 pts\n🎯 Acertar ganador: 1 pt');
    });

    // Submit
    document.getElementById('btnSubmit')?.addEventListener('click', () => {
        document.getElementById('nameModal').style.display = 'flex';
    });

    document.getElementById('cancelNameSubmit')?.addEventListener('click', () => {
        document.getElementById('nameModal').style.display = 'none';
    });

    document.getElementById('confirmNameSubmit')?.addEventListener('click', () => {
        const name = document.getElementById('playerNameInput').value.trim();
        if (!name) { 
            showToast('Ingresa tu nombre', true); 
            return; 
        }
        submitPrediction(name);
    });
});
