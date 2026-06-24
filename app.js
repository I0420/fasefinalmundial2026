/* ============================================================
   2026 FIFA World Cup Prediction Game - app.js (SIMPLIFICADO)
   Solo 16avos de final, sin grupos visibles, descarga de pronósticos
   ============================================================ */

/* ── Datos de equipos: nombre en español + código de bandera ── */
const TEAM_DATA = {
  "Mexico":               { name: "México",           code: "mx" },
  "South Africa":         { name: "Sudáfrica",        code: "za" },
  "Czech Republic":       { name: "Rep. Checa",       code: "cz" },
  "South Korea":          { name: "Corea del Sur",    code: "kr" },
  "Switzerland":          { name: "Suiza",            code: "ch" },
  "Canada":               { name: "Canadá",           code: "ca" },
  "Qatar":                { name: "Catar",            code: "qa" },
  "Bosnia & Herzegovina": { name: "Bosnia",           code: "ba" },
  "Brazil":               { name: "Brasil",           code: "br" },
  "Scotland":             { name: "Escocia",          code: "gb-sct" },
  "Morocco":              { name: "Marruecos",        code: "ma" },
  "Haiti":                { name: "Haití",            code: "ht" },
  "Turkey":               { name: "Turquía",          code: "tr" },
  "Paraguay":             { name: "Paraguay",         code: "py" },
  "USA":                  { name: "EE.UU.",           code: "us" },
  "Australia":            { name: "Australia",        code: "au" },
  "Ivory Coast":          { name: "Costa de Marfil",  code: "ci" },
  "Curaçao":              { name: "Curazao",          code: "cw" },
  "Ecuador":              { name: "Ecuador",          code: "ec" },
  "Germany":              { name: "Alemania",         code: "de" },
  "Netherlands":          { name: "Países Bajos",     code: "nl" },
  "Japan":                { name: "Japón",            code: "jp" },
  "Sweden":               { name: "Suecia",           code: "se" },
  "Tunisia":              { name: "Túnez",            code: "tn" },
  "Egypt":                { name: "Egipto",           code: "eg" },
  "Belgium":              { name: "Bélgica",          code: "be" },
  "New Zealand":          { name: "Nueva Zelanda",    code: "nz" },
  "Iran":                 { name: "Irán",             code: "ir" },
  "Uruguay":              { name: "Uruguay",          code: "uy" },
  "Cape Verde":           { name: "Cabo Verde",       code: "cv" },
  "Spain":                { name: "España",           code: "es" },
  "Saudi Arabia":         { name: "Arabia Saudita",   code: "sa" },
  "Norway":               { name: "Noruega",          code: "no" },
  "France":               { name: "Francia",          code: "fr" },
  "Iraq":                 { name: "Irak",             code: "iq" },
  "Senegal":              { name: "Senegal",          code: "sn" },
  "Jordan":               { name: "Jordania",         code: "jo" },
  "Argentina":            { name: "Argentina",        code: "ar" },
  "Algeria":              { name: "Argelia",          code: "dz" },
  "Austria":              { name: "Austria",          code: "at" },
  "DR Congo":             { name: "R.D. Congo",       code: "cd" },
  "Portugal":             { name: "Portugal",         code: "pt" },
  "Colombia":             { name: "Colombia",         code: "co" },
  "Uzbekistan":           { name: "Uzbekistán",       code: "uz" },
  "Ghana":                { name: "Ghana",            code: "gh" },
  "Panama":               { name: "Panamá",           code: "pa" },
  "Croatia":              { name: "Croacia",          code: "hr" },
  "England":              { name: "Inglaterra",       code: "gb-eng" }
};

function teamLabel(key) {
  const d = TEAM_DATA[key];
  if (!d) return key;
  return `<span class="fi fi-${d.code}" style="margin-right:5px;vertical-align:middle;"></span>${d.name}`;
}

const LEADERBOARD_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVvvNGujGkfjrkQbiedhJVzNl4va6QMYKCMXE2SG14OE0wAf0vczmzVHP_GMASwqBdWHbuRZI10U2x/pub?gid=481878926&single=true&output=csv';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdmJQA-TDUR_qj4139Ez1rr0PVe87F9iZy08pNFmLjVMgYIxw/formResponse';

let currentTab = 'predict';
let state = {
  user: '',
  knockout: { userScores: {} }
};

let userKnockout = { userScores: {} };

// ════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initToolbar();
  renderBracket();
  restoreLocalPrediction();
});

// ── TABS ────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabId = `tab-${btn.getAttribute('data-tab')}`;
      document.getElementById(tabId).classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      if (currentTab === 'leaderboard') loadLeaderboard();
    });
  });
}

function initToolbar() {
  const btnReset = document.getElementById('btnReset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('¿Seguro que quieres borrar todos tus pronósticos? No hay vuelta atrás.')) {
        localStorage.removeItem('worldCup2026_myPrediction');
        userKnockout = { userScores: {} };
        state.knockout.userScores = {};
        renderBracket();
        showToast('Todo limpio. Vuelve a empezar.');
      }
    });
  }

  const btnScoringHelp = document.getElementById('btnScoringHelp');
  if (btnScoringHelp) {
    btnScoringHelp.addEventListener('click', () => {
      alert('Sistema de Puntos:\n\n- Marcador exacto: 3 puntos\n- Acertar al ganador (sin marcador exacto): 1 punto\n- Si el partido termina empatado y aciertas el empate: 1 punto extra');
    });
  }

  document.getElementById('btnSubmit').addEventListener('click', () => {
    document.getElementById('nameModal').style.display = 'block';
  });

  document.getElementById('cancelNameSubmit').addEventListener('click', () => {
    document.getElementById('nameModal').style.display = 'none';
  });

  document.getElementById('confirmNameSubmit').addEventListener('click', () => {
    const name = document.getElementById('playerNameInput').value.trim();
    if (!name) { showToast('Por favor, introduce tu nombre', true); return; }
    submitPrediction(name);
  });
}

// ── RENDER BRACKET 16AVOS ───────────────────────────────────
function renderBracket() {
  const container = document.getElementById('bracketContainer');
  if (!container || typeof RESULTS === 'undefined') return;
  container.innerHTML = '';

  const matchesData = RESULTS.knockout.matches.round32 || [];
  if (!matchesData.length) return;

  const bracketDiv = document.createElement('div');
  bracketDiv.className = 'bracket-container';

  // Título
  const title = document.createElement('h2');
  title.className = 'bracket-title';
  title.innerHTML = '🥊 DIECISEISAVOS DE FINAL';
  bracketDiv.appendChild(title);

  // Grid de matchups
  const grid = document.createElement('div');
  grid.className = 'bracket-grid';

  matchesData.forEach((m) => {
    const t1Name = m.team1;
    const t2Name = m.team2;

    const card = document.createElement('div');
    card.className = 'matchup-card';

    const currentHomeScore = state.knockout.userScores?.[m.match]?.home ?? '';
    const currentAwayScore = state.knockout.userScores?.[m.match]?.away ?? '';

    card.innerHTML = `
      <div class="match-number">Partido ${m.match}</div>
      
      <div class="match-team">
        <div class="team-info">${teamLabel(t1Name)}</div>
        <input type="number" class="score-input" min="0" placeholder="0" value="${currentHomeScore}"
          oninput="handleScoreChange(${m.match}, 'home', this.value)">
      </div>

      <div class="vs-divider">vs</div>

      <div class="match-team">
        <input type="number" class="score-input" min="0" placeholder="0" value="${currentAwayScore}"
          oninput="handleScoreChange(${m.match}, 'away', this.value)">
        <div class="team-info">${teamLabel(t2Name)}</div>
      </div>
    `;
    
    grid.appendChild(card);
  });

  bracketDiv.appendChild(grid);
  container.appendChild(bracketDiv);
}

function handleScoreChange(matchId, side, value) {
  if (!state.knockout.userScores) state.knockout.userScores = {};
  if (!state.knockout.userScores[matchId]) state.knockout.userScores[matchId] = { home: null, away: null };
  state.knockout.userScores[matchId][side] = value !== '' ? parseInt(value, 10) : null;
  userKnockout.userScores = state.knockout.userScores;
  saveLocalPredictionSoon();
}

// ── ENVÍO ──────────────────────────────────────────────────
function submitPrediction(playerName) {
  showLoading(true, "Enviando pronóstico...");

  const payload = {
    user: playerName,
    timestamp: new Date().toISOString(),
    knockout: state.knockout.userScores
  };

  const formData = new FormData();
  formData.append("entry.1597300776", playerName);
  formData.append("entry.1633537385", "FASE_ELIMINATORIA");
  formData.append("entry.634416458", JSON.stringify(state.knockout.userScores));

  // 1. Enviar a Google Form
  fetch(FORM_URL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  })
  .then(() => {
    showLoading(false);
    document.getElementById('nameModal').style.display = 'none';
    localStorage.setItem('worldCup2026_myPrediction', JSON.stringify(payload));
    
    // 2. Descargar pronóstico como JSON
    downloadPrediction(playerName, payload);
    
    showToast('✅ ¡Pronóstico enviado y descargado!');
    triggerConfetti();
  })
  .catch(err => {
    showLoading(false);
    console.error(err);
    showToast("Error al enviar. Intenta de nuevo.", true);
  });
}

// ── DESCARGA DE PRONÓSTICO ─────────────────────────────────
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

function saveLocalPredictionSoon() {
  const payload = {
    user: state.user,
    knockout: state.knockout.userScores,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('worldCup2026_myPrediction', JSON.stringify(payload));
}

function restoreLocalPrediction() {
  const saved = localStorage.getItem('worldCup2026_myPrediction');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.knockout.userScores = parsed.knockout || {};
      userKnockout.userScores = state.knockout.userScores;
      renderBracket();
    } catch(e) { console.error(e); }
  }
}

function showLoading(show, text = 'Cargando...') {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  document.getElementById('loadingText').innerText = text;
  overlay.style.display = show ? 'flex' : 'none';
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
  if (!container) return;
  container.innerHTML = '🎉⚽🎉⚽🎉 ¡CÁTEDRA SENTADA! ⚽🎉⚽🎉⚽';
  setTimeout(() => container.innerHTML = '', 5000);
}

// ── LEADERBOARD ────────────────────────────────────────────
async function loadLeaderboard() {
  const container = document.getElementById('leaderboardContent');
  container.innerHTML = `
    <div class="lb-loading">
      <span class="ball-spinner" style="font-size:2rem;">&#9917;</span>
      <p>Cargando ranking...</p>
    </div>`;

  try {
    const res = await fetch(LEADERBOARD_CSV_URL + '&cachebust=' + Date.now());
    const text = await res.text();
    const rows = text.trim().split('\n').filter(row => {
      const name = (row.split(',')[0] || '').replace(/^"|"$/g, '').trim().toLowerCase();
      return name && name !== 'nombre' && name !== 'name' && name !== 'jugador';
    });

    if (!rows.length || rows[0].trim() === '') {
      container.innerHTML = '<p class="note-text" style="margin-top:20px;">Aún no hay datos en el ranking.</p>';
      return;
    }

    const players = rows
      .map(row => {
        const cols = row.split(',');
        return {
          name: (cols[0] || '').replace(/^"|"$/g, '').trim(),
          pts:  parseInt((cols[1] || '0').replace(/^"|"$/g, '').trim(), 10) || 0
        };
      })
      .filter(p => p.name)
      .sort((a, b) => b.pts - a.pts);

    const medals  = ['🥇', '🥈', '🥉'];
    const classes = ['lb-first', 'lb-second', 'lb-third'];

    const rows_html = players.map((p, i) => `
      <div class="lb-row ${classes[i] || ''}" data-player="${encodeURIComponent(p.name)}">
        <span class="lb-pos">${medals[i] || `<span class="lb-num">${i + 1}</span>`}</span>
        <span class="lb-name">${p.name}</span>
        <span class="lb-pts">${p.pts}<small> pts</small></span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="lb-header-info">
        <span class="lb-total">${players.length} participantes</span>
        <span class="lb-updated">Actualizado al abrir esta pestaña</span>
      </div>
      <div class="leaderboard-table">${rows_html}</div>
    `;

  } catch (e) {
    container.innerHTML = `
      <p class="note-text" style="color:var(--error-color);margin-top:20px;">
        ⚠️ Error al cargar el ranking. Verifica tu conexión e intenta de nuevo.
      </p>`;
    console.error('Leaderboard error:', e);
  }
}
