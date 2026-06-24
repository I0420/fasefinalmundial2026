/* FIFA 2026 - CUADRO FINAL */

const TEAM_DATA = {
  "Mexico": { name: "México", code: "mx" }, "South Africa": { name: "Sudáfrica", code: "za" },
  "Czech Republic": { name: "Rep. Checa", code: "cz" }, "South Korea": { name: "Corea del Sur", code: "kr" },
  "Switzerland": { name: "Suiza", code: "ch" }, "Canada": { name: "Canadá", code: "ca" },
  "Qatar": { name: "Catar", code: "qa" }, "Bosnia & Herzegovina": { name: "Bosnia", code: "ba" },
  "Brazil": { name: "Brasil", code: "br" }, "Scotland": { name: "Escocia", code: "gb-sct" },
  "Morocco": { name: "Marruecos", code: "ma" }, "Haiti": { name: "Haití", code: "ht" },
  "Turkey": { name: "Turquía", code: "tr" }, "Paraguay": { name: "Paraguay", code: "py" },
  "USA": { name: "EE.UU.", code: "us" }, "Australia": { name: "Australia", code: "au" },
  "Ivory Coast": { name: "Costa de Marfil", code: "ci" }, "Curaçao": { name: "Curazao", code: "cw" },
  "Ecuador": { name: "Ecuador", code: "ec" }, "Germany": { name: "Alemania", code: "de" },
  "Netherlands": { name: "Países Bajos", code: "nl" }, "Japan": { name: "Japón", code: "jp" },
  "Sweden": { name: "Suecia", code: "se" }, "Tunisia": { name: "Túnez", code: "tn" },
  "Egypt": { name: "Egipto", code: "eg" }, "Belgium": { name: "Bélgica", code: "be" },
  "New Zealand": { name: "Nueva Zelanda", code: "nz" }, "Iran": { name: "Irán", code: "ir" },
  "Uruguay": { name: "Uruguay", code: "uy" }, "Cape Verde": { name: "Cabo Verde", code: "cv" },
  "Spain": { name: "España", code: "es" }, "Saudi Arabia": { name: "Arabia Saudita", code: "sa" },
  "Norway": { name: "Noruega", code: "no" }, "France": { name: "Francia", code: "fr" },
  "Iraq": { name: "Irak", code: "iq" }, "Senegal": { name: "Senegal", code: "sn" },
  "Jordan": { name: "Jordania", code: "jo" }, "Argentina": { name: "Argentina", code: "ar" },
  "Algeria": { name: "Argelia", code: "dz" }, "Austria": { name: "Austria", code: "at" },
  "DR Congo": { name: "R.D. Congo", code: "cd" }, "Portugal": { name: "Portugal", code: "pt" },
  "Colombia": { name: "Colombia", code: "co" }, "Uzbekistan": { name: "Uzbekistán", code: "uz" },
  "Ghana": { name: "Ghana", code: "gh" }, "Panama": { name: "Panamá", code: "pa" },
  "Croatia": { name: "Croacia", code: "hr" }, "England": { name: "Inglaterra", code: "gb-eng" }
};

function teamLabel(key) {
  const d = TEAM_DATA[key];
  return d ? `<span class="fi fi-${d.code}"></span>${d.name}` : key;
}

const LEADERBOARD_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVvvNGujGkfjrkQbiedhJVzNl4va6QMYKCMXE2SG14OE0wAf0vczmzVHP_GMASwqBdWHbuRZI10U2x/pub?gid=481878926&single=true&output=csv';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdmJQA-TDUR_qj4139Ez1rr0PVe87F9iZy08pNFmLjVMgYIxw/formResponse';

let state = { knockout: { userScores: {} } };

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initToolbar();
  renderBracket();
  restoreLocalPrediction();
});

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabId = `tab-${btn.getAttribute('data-tab')}`;
      document.getElementById(tabId).classList.add('active');
      if (btn.getAttribute('data-tab') === 'leaderboard') loadLeaderboard();
    });
  });
}

function initToolbar() {
  document.getElementById('btnReset')?.addEventListener('click', () => {
    if (confirm('¿Borrar pronósticos?')) {
      localStorage.removeItem('worldCup2026_myPrediction');
      state.knockout.userScores = {};
      renderBracket();
      showToast('Pronósticos limpiados');
    }
  });

  document.getElementById('btnScoringHelp')?.addEventListener('click', () => {
    alert('PUNTUACIÓN:\n\n⚽ Marcador exacto: 3 pts\n🎯 Acertar ganador: 1 pt');
  });

  document.getElementById('btnSubmit').addEventListener('click', () => {
    document.getElementById('nameModal').style.display = 'block';
  });

  document.getElementById('cancelNameSubmit').addEventListener('click', () => {
    document.getElementById('nameModal').style.display = 'none';
  });

  document.getElementById('confirmNameSubmit').addEventListener('click', () => {
    const name = document.getElementById('playerNameInput').value.trim();
    if (!name) { showToast('Ingresa tu nombre', true); return; }
    submitPrediction(name);
  });
}

function renderBracket() {
  const container = document.getElementById('bracketMatches');
  if (!container || typeof RESULTS === 'undefined') return;

  let html = '';

  // ROUND 32 (16avos)
  const round32 = RESULTS.knockout.matches.round32 || [];
  if (round32.length > 0) {
    html += `<div class="bracket-column">
      <div class="bracket-column-title">16avos</div>`;
    round32.forEach(m => {
      const h = state.knockout.userScores?.[m.match]?.home ?? '';
      const a = state.knockout.userScores?.[m.match]?.away ?? '';
      html += `
        <div class="match-box">
          <div class="match-header">Partido ${m.match}</div>
          <div class="match-team">
            <span class="team-name">${teamLabel(m.team1)}</span>
            <input type="number" class="team-score" min="0" placeholder="0" value="${h}"
              oninput="handleScoreChange(${m.match}, 'home', this.value)">
          </div>
          <div class="match-divider">vs</div>
          <div class="match-team">
            <input type="number" class="team-score" min="0" placeholder="0" value="${a}"
              oninput="handleScoreChange(${m.match}, 'away', this.value)">
            <span class="team-name">${teamLabel(m.team2)}</span>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  // ROUND 16 (8avos)
  const round16 = RESULTS.knockout.matches.round16 || [];
  if (round16.length > 0) {
    html += `<div class="bracket-column">
      <div class="bracket-column-title">8avos</div>`;
    round16.forEach(m => {
      const h = state.knockout.userScores?.[m.match]?.home ?? '';
      const a = state.knockout.userScores?.[m.match]?.away ?? '';
      const t1 = getTeamForMatch(m.match, 'home') || m.team1;
      const t2 = getTeamForMatch(m.match, 'away') || m.team2;
      html += `
        <div class="match-box">
          <div class="match-header">Partido ${m.match}</div>
          <div class="match-team">
            <span class="team-name">${teamLabel(t1)}</span>
            <input type="number" class="team-score" min="0" placeholder="0" value="${h}"
              oninput="handleScoreChange(${m.match}, 'home', this.value)">
          </div>
          <div class="match-divider">vs</div>
          <div class="match-team">
            <input type="number" class="team-score" min="0" placeholder="0" value="${a}"
              oninput="handleScoreChange(${m.match}, 'away', this.value)">
            <span class="team-name">${teamLabel(t2)}</span>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  // QUARTERFINALS (Cuartos)
  const quarters = RESULTS.knockout.matches.quarterfinals || [];
  if (quarters.length > 0) {
    html += `<div class="bracket-column">
      <div class="bracket-column-title">Cuartos</div>`;
    quarters.forEach(m => {
      const h = state.knockout.userScores?.[m.match]?.home ?? '';
      const a = state.knockout.userScores?.[m.match]?.away ?? '';
      const t1 = getTeamForMatch(m.match, 'home') || m.team1;
      const t2 = getTeamForMatch(m.match, 'away') || m.team2;
      html += `
        <div class="match-box">
          <div class="match-header">Partido ${m.match}</div>
          <div class="match-team">
            <span class="team-name">${teamLabel(t1)}</span>
            <input type="number" class="team-score" min="0" placeholder="0" value="${h}"
              oninput="handleScoreChange(${m.match}, 'home', this.value)">
          </div>
          <div class="match-divider">vs</div>
          <div class="match-team">
            <input type="number" class="team-score" min="0" placeholder="0" value="${a}"
              oninput="handleScoreChange(${m.match}, 'away', this.value)">
            <span class="team-name">${teamLabel(t2)}</span>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  // SEMIFINALS (Semis)
  const semis = RESULTS.knockout.matches.semifinals || [];
  if (semis.length > 0) {
    html += `<div class="bracket-column">
      <div class="bracket-column-title">Semis</div>`;
    semis.forEach(m => {
      const h = state.knockout.userScores?.[m.match]?.home ?? '';
      const a = state.knockout.userScores?.[m.match]?.away ?? '';
      const t1 = getTeamForMatch(m.match, 'home') || m.team1;
      const t2 = getTeamForMatch(m.match, 'away') || m.team2;
      html += `
        <div class="match-box">
          <div class="match-header">Partido ${m.match}</div>
          <div class="match-team">
            <span class="team-name">${teamLabel(t1)}</span>
            <input type="number" class="team-score" min="0" placeholder="0" value="${h}"
              oninput="handleScoreChange(${m.match}, 'home', this.value)">
          </div>
          <div class="match-divider">vs</div>
          <div class="match-team">
            <input type="number" class="team-score" min="0" placeholder="0" value="${a}"
              oninput="handleScoreChange(${m.match}, 'away', this.value)">
            <span class="team-name">${teamLabel(t2)}</span>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  // FINAL
  const final = RESULTS.knockout.matches.final || [];
  if (final.length > 0) {
    html += `<div class="bracket-column">
      <div class="bracket-column-title">Final</div>`;
    final.forEach(m => {
      const h = state.knockout.userScores?.[m.match]?.home ?? '';
      const a = state.knockout.userScores?.[m.match]?.away ?? '';
      const t1 = getTeamForMatch(m.match, 'home') || m.team1;
      const t2 = getTeamForMatch(m.match, 'away') || m.team2;
      const winner = h > a ? t1 : a > h ? t2 : null;
      html += `
        <div class="match-box">
          <div class="match-header">Partido ${m.match}</div>
          <div class="match-team">
            <span class="team-name">${teamLabel(t1)}</span>
            <input type="number" class="team-score" min="0" placeholder="0" value="${h}"
              oninput="handleScoreChange(${m.match}, 'home', this.value)">
          </div>
          <div class="match-divider">vs</div>
          <div class="match-team">
            <input type="number" class="team-score" min="0" placeholder="0" value="${a}"
              oninput="handleScoreChange(${m.match}, 'away', this.value)">
            <span class="team-name">${teamLabel(t2)}</span>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  // WINNER
  html += `<div class="bracket-column">
    <div class="bracket-column-title">Campeón</div>
    <div class="winner-box">
      <div class="winner-label">🏆</div>
      <div class="winner-team" id="winnerName">Pendiente</div>
    </div>
  </div>`;

  container.innerHTML = html;
}

function getTeamForMatch(matchId, side) {
  return null; // Implementar lógica si es necesario
}

function handleScoreChange(matchId, side, value) {
  if (!state.knockout.userScores[matchId]) state.knockout.userScores[matchId] = { home: null, away: null };
  state.knockout.userScores[matchId][side] = value !== '' ? parseInt(value, 10) : null;
  saveLocalPredictionSoon();
}

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

  fetch(FORM_URL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  })
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
    console.error(err);
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

function saveLocalPredictionSoon() {
  const payload = {
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
      renderBracket();
    } catch(e) { console.error(e); }
  }
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
  const container = document.getElementById('leaderboardContent');
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
