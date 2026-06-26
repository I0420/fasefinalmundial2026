const TEAM_DATA = {
  "Ecuador": { name: "Ecuador", code: "ec" }, "Argentina": { name: "Argentina", code: "ar" },
  "Spain": { name: "España", code: "es" }, "Colombia": { name: "Colombia", code: "co" },
  "Germany": { name: "Alemania", code: "de" }, "France": { name: "Francia", code: "fr" },
  "Brazil": { name: "Brasil", code: "br" }, "Japan": { name: "Japón", code: "jp" },
  "Mexico": { name: "México", code: "mx" }, "USA": { name: "EE.UU.", code: "us" },
  "England": { name: "Inglaterra", code: "gb-eng" }, "Senegal": { name: "Senegal", code: "sn" },
  "Netherlands": { name: "Países Bajos", code: "nl" }, "Morocco": { name: "Marruecos", code: "ma" },
  "Portugal": { name: "Portugal", code: "pt" }, "Switzerland": { name: "Suiza", code: "ch" },
  "Belgium": { name: "Bélgica", code: "be" }, "Canada": { name: "Canadá", code: "ca" },
  "Croatia": { name: "Croacia", code: "hr" }, "Italy": { name: "Italia", code: "it" },
  "Denmark": { name: "Dinamarca", code: "dk" }, "Czech Republic": { name: "Rep. Checa", code: "cz" },
  "South Korea": { name: "Corea del Sur", code: "kr" }, "Uruguay": { name: "Uruguay", code: "uy" },
  "Poland": { name: "Polonia", code: "pl" }, "Austria": { name: "Austria", code: "at" },
  "Greece": { name: "Grecia", code: "gr" }, "Turkey": { name: "Turquía", code: "tr" },
  "Sweden": { name: "Suecia", code: "se" }, "Norway": { name: "Noruega", code: "no" },
  "Ukraine": { name: "Ucrania", code: "ua" }, "Wales": { name: "Gales", code: "gb-wls" },
  "Scotland": { name: "Escocia", code: "gb-sct" }, "South Africa": { name: "Sudáfrica", code: "za" },
  "Egypt": { name: "Egipto", code: "eg" }, "Australia": { name: "Australia", code: "au" },
  "Qatar": { name: "Catar", code: "qa" }, "Iran": { name: "Irán", code: "ir" },
  "Saudi Arabia": { name: "Arabia Saudita", code: "sa" }, "Tunisia": { name: "Túnez", code: "tn" },
  "Costa Rica": { name: "Costa Rica", code: "cr" }, "Panama": { name: "Panamá", code: "pa" },
  "Jamaica": { name: "Jamaica", code: "jm" }, "Honduras": { name: "Honduras", code: "hn" }
};

const LEADERBOARD_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVvvNGujGkfjrkQbiedhJVzNl4va6QMYKCMXE2SG14OE0wAf0vczmzVHP_GMASwqBdWHbuRZI10U2x/pub?gid=481878926&single=true&output=csv';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdmJQA-TDUR_qj4139Ez1rr0PVe87F9iZy08pNFmLjVMgYIxw/formResponse';

let state = { knockout: { userScores: {} }, visiblePhases: { round32: true } };

function getTeamInfo(teamName) {
    return TEAM_DATA[teamName] || { name: teamName, code: null };
}

function getFlagHTML(teamName) {
    const info = getTeamInfo(teamName);
    if (info.code) {
        return `<span class="fi fi-${info.code}" style="font-size: 1.2rem;"></span>`;
    }
    return '<span class="flag-placeholder"></span>';
}

function createMatchHTML(match, roundType = 'regular') {
    const h = state.knockout.userScores?.[match.match]?.home ?? '';
    const a = state.knockout.userScores?.[match.match]?.away ?? '';
    const winner = state.knockout.userScores?.[match.match]?.knockoutWinner ?? '';
    
    const team1Name = match.team1.name || match.team1;
    const team2Name = match.team2.name || match.team2;
    const team1Info = getTeamInfo(team1Name);
    const team2Info = getTeamInfo(team2Name);
    
    // Detectar si hay empate
    const isDrawn = h !== '' && a !== '' && parseInt(h) === parseInt(a);
    
    return `
        <div class="match-card ${roundType === 'final' ? 'final-match' : ''}" data-match-id="${match.match}">
            <div class="team-row">
                <div class="team-info">
                    ${getFlagHTML(team1Name)}
                    <span class="team-name">${team1Info.name}</span>
                </div>
                <input type="number" class="score" min="0" placeholder="0" value="${h}"
                    oninput="handleScoreChange(${match.match}, 'home', this.value)">
            </div>
            <div class="team-row">
                <div class="team-info">
                    ${getFlagHTML(team2Name)}
                    <span class="team-name">${team2Info.name}</span>
                </div>
                <input type="number" class="score" min="0" placeholder="0" value="${a}"
                    oninput="handleScoreChange(${match.match}, 'away', this.value)">
            </div>
            
            <!-- Selector de ganador en prórroga/penales (solo aparece si hay empate) -->
            <div class="knockout-selector ${isDrawn ? 'active' : 'hidden'}" id="knockout-${match.match}">
                <label class="knockout-label">⏱️ Prórroga/Penales</label>
                <select class="knockout-select" onchange="handleKnockoutWinner(${match.match}, this.value)">
                    <option value="">Selecciona</option>
                    <option value="home" ${winner === 'home' ? 'selected' : ''}>${team1Info.name}</option>
                    <option value="away" ${winner === 'away' ? 'selected' : ''}>${team2Info.name}</option>
                </select>
            </div>
        </div>
    `;
}

function renderBracket() {
    if (typeof RESULTS === 'undefined' || !RESULTS.knockout) {
        console.log('RESULTS no disponible');
        return;
    }

    const matches = RESULTS.knockout.matches;

    if (matches.round32 && matches.round32.length > 0) {
        const html = matches.round32.map(m => createMatchHTML(m)).join('');
        document.getElementById('round32').innerHTML = html;
    }

    if (matches.round16 && matches.round16.length > 0) {
        const html = matches.round16.map(m => createMatchHTML(m)).join('');
        document.getElementById('round16').innerHTML = html;
    }

    if (matches.quarterfinals && matches.quarterfinals.length > 0) {
        const html = matches.quarterfinals.map(m => createMatchHTML(m)).join('');
        document.getElementById('quarterfinals').innerHTML = html;
    }

    if (matches.semifinals && matches.semifinals.length > 0) {
        const html = matches.semifinals.map(m => createMatchHTML(m)).join('');
        document.getElementById('semifinals').innerHTML = html;
    }

    if (matches.final && matches.final.length > 0) {
        const html = matches.final.map(m => createMatchHTML(m, 'final')).join('');
        document.getElementById('final').innerHTML = html;
    }
}

function handleScoreChange(matchId, side, value) {
    if (!state.knockout.userScores[matchId]) {
        state.knockout.userScores[matchId] = { home: null, away: null, knockoutWinner: null };
    }
    state.knockout.userScores[matchId][side] = value !== '' ? parseInt(value, 10) : null;
    
    // Actualizar visibilidad del selector de prórroga/penales
    updateKnockoutSelectorVisibility(matchId);
    saveLocalPrediction();
}

function handleKnockoutWinner(matchId, value) {
    if (!state.knockout.userScores[matchId]) {
        state.knockout.userScores[matchId] = { home: null, away: null, knockoutWinner: null };
    }
    state.knockout.userScores[matchId].knockoutWinner = value !== '' ? value : null;
    saveLocalPrediction();
}

function updateKnockoutSelectorVisibility(matchId) {
    const scores = state.knockout.userScores[matchId];
    const selector = document.getElementById(`knockout-${matchId}`);
    
    if (!selector) return;
    
    // Validamos que existan ambos scores y que no sean null ni strings vacíos
    const hasHome = scores && scores.home !== null && scores.home !== '';
    const hasAway = scores && scores.away !== null && scores.away !== '';
    
    if (hasHome && hasAway && parseInt(scores.home, 10) === parseInt(scores.away, 10)) {
        // Hay empate confirmado, mostrar selector
        selector.classList.remove('hidden');
        selector.classList.add('active');
    } else {
        // No hay empate o faltan datos, ocultar selector
        selector.classList.add('hidden');
        selector.classList.remove('active');
        
        // Solo limpiamos el ganador si ambos campos tienen datos y NO son iguales
        if (hasHome && hasAway && parseInt(scores.home, 10) !== parseInt(scores.away, 10)) {
            state.knockout.userScores[matchId].knockoutWinner = null;
        }
    }
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
            state.visiblePhases = parsed.visiblePhases || { round32: true };
            renderBracket();
            updatePhaseVisibility();
            // Actualizar visibilidad de selectores después de renderizar
            Object.keys(state.knockout.userScores).forEach(matchId => {
                updateKnockoutSelectorVisibility(parseInt(matchId));
            });
        } catch(e) {
            console.log('Error restoring prediction', e);
        }
    } else {
        updatePhaseVisibility();
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
        
        if (!btn || !container) return;
        
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

function validatePredictions() {
    // Validar que si hay empate, hay ganador seleccionado en prórroga/penales
    for (const [matchId, scores] of Object.entries(state.knockout.userScores)) {
        if (scores.home === scores.away && (scores.home !== null && scores.away !== null)) {
            // Hay empate
            if (!scores.knockoutWinner) {
                showToast(`Partido ${matchId}: Selecciona ganador en prórroga/penales`, true);
                return false;
            }
        }
    }
    return true;
}

function submitPrediction(playerName) {
    // Validar antes de enviar
    if (!validatePredictions()) {
        return;
    }
    
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

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const phase = btn.getAttribute('data-phase');
            togglePhase(phase);
        });
    });

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

    document.getElementById('btnReset')?.addEventListener('click', () => {
        if (confirm('¿Borrar todos los pronósticos?')) {
            localStorage.removeItem('worldCup2026_myPrediction');
            state.knockout.userScores = {};
            state.visiblePhases = { round32: true };
            renderBracket();
            updatePhaseVisibility();
            showToast('Pronósticos limpiados');
        }
    });

    document.getElementById('btnScoringHelp')?.addEventListener('click', () => {
        alert('PUNTUACIÓN:\n\n⚽ Marcador exacto: 3 pts\n🎯 Acertar ganador: 1 pt\n⏱️ Acertar prórroga/penales: +1 pt');
    });

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
