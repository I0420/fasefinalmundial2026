const LEADERBOARD_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVvvNGujGkfjrkQbiedhJVzNl4va6QMYKCMXE2SG14OE0wAf0vczmzVHP_GMASwqBdWHbuRZI10U2x/pub?gid=481878926&single=true&output=csv';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdmJQA-TDUR_qj4139Ez1rr0PVe87F9iZy08pNFmLjVMgYIxw/formResponse';

let state = { knockout: { userScores: {} } };

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

    const root = document.getElementById('bracket-root');
    if (!root) return;

    const matches = RESULTS.knockout.matches;
    let htmlContent = '';

    // Dieciseisavos
    if (matches.round32 && matches.round32.length > 0) {
        htmlContent += `<div class="round-column">
            <h3 class="round-title">DIECISEISAVOS</h3>
            ${matches.round32.map(m => createMatchHTML(m)).join('')}
        </div>`;
    }

    // Octavos
    if (matches.round16 && matches.round16.length > 0) {
        htmlContent += `<div class="round-column">
            <h3 class="round-title">OCTAVOS</h3>
            ${matches.round16.map(m => createMatchHTML(m)).join('')}
        </div>`;
    }

    // Cuartos
    if (matches.quarterfinals && matches.quarterfinals.length > 0) {
        htmlContent += `<div class="round-column">
            <h3 class="round-title">CUARTOS</h3>
            ${matches.quarterfinals.map(m => createMatchHTML(m)).join('')}
        </div>`;
    }

    // Semis
    if (matches.semifinals && matches.semifinals.length > 0) {
        htmlContent += `<div class="round-column">
            <h3 class="round-title">SEMIS</h3>
            ${matches.semifinals.map(m => createMatchHTML(m)).join('')}
        </div>`;
    }

    // Final
    if (matches.final && matches.final.length > 0) {
        htmlContent += `<div class="round-column">
            <h3 class="round-title">FINAL</h3>
            ${matches.final.map(m => createMatchHTML(m, 'final')).join('')}
        </div>`;
    }

    root.innerHTML = htmlContent;
}

function handleScoreChange(matchId, side, value) {
    if (!state.knockout.userScores[matchId]) {
        state.knockout.userScores[matchId] = { home: null, away: null };
    }
    state.knockout.userScores[matchId][side] = value !== '' ? parseInt(value, 10) : null;
    saveLocalPrediction();
}

function saveLocalPrediction() {
    const payload = { knockout: state.knockout.userScores, timestamp: new Date().toISOString() };
    localStorage.setItem('worldCup2026_myPrediction', JSON.stringify(payload));
}

function restoreLocalPrediction() {
    const saved = localStorage.getItem('worldCup2026_myPrediction');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.knockout.userScores = parsed.knockout || {};
            renderBracket();
        } catch(e) {}
    }
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

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const isLeaderboard = btn.getAttribute('data-tab') === 'leaderboard';
            document.getElementById('bracket-root').style.display = isLeaderboard ? 'none' : 'flex';
            document.getElementById('leaderboard-section').style.display = isLeaderboard ? 'block' : 'none';
            document.querySelector('.submit-section').style.display = isLeaderboard ? 'none' : 'flex';
            
            if (isLeaderboard) loadLeaderboard();
        });
    });

    // Reset
    document.getElementById('btnReset')?.addEventListener('click', () => {
        if (confirm('¿Borrar todos los pronósticos?')) {
            localStorage.removeItem('worldCup2026_myPrediction');
            state.knockout.userScores = {};
            renderBracket();
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
