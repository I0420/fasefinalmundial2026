// Datos simulados de la fase final (Configuración de llaves)
const tournamentData = {
    leftBracket: {
        octavos: [
            { id: 1, team1: { name: "ECUADOR", score: 2 }, team2: { name: "ESTADOS UNIDOS", score: 1 } },
            { id: 2, team1: { name: "ARGENTINA", score: 3 }, team2: { name: "FRANCIA", score: 2 } },
            { id: 3, team1: { name: "ESPAÑA", score: 1 }, team2: { name: "ALEMANIA", score: 0 } },
            { id: 4, team1: { name: "BRASIL", score: 4 }, team2: { name: "JAPÓN", score: 1 } }
        ],
        cuartos: [
            { id: 5, team1: { name: "ECUADOR", score: 1 }, team2: { name: "ARGENTINA", score: 2 } },
            { id: 6, team1: { name: "ESPAÑA", score: 1 }, team2: { name: "BRASIL", score: 2 } }
        ],
        semifinal: [
            { id: 7, team1: { name: "ARGENTINA", score: 2 }, team2: { name: "BRASIL", score: 1 } }
        ]
    },
    rightBracket: {
        octavos: [
            { id: 8, team1: { name: "INGLATERRA", score: 3 }, team2: { name: "SENEGAL", score: 0 } },
            { id: 9, team1: { name: "PAÍSES BAJOS", score: 2 }, team2: { name: "MARRUECOS", score: 1 } },
            { id: 10, team1: { name: "PORTUGAL", score: 2 }, team2: { name: "SUIZA", score: 1 } },
            { id: 11, team1: { name: "ITALIA", score: 0 }, team2: { name: "MÉXICO", score: 1 } }
        ],
        cuartos: [
            { id: 12, team1: { name: "INGLATERRA", score: 1 }, team2: { name: "PAÍSES BAJOS", score: 2 } },
            { id: 13, team1: { name: "PORTUGAL", score: 3 }, team2: { name: "MÉXICO", score: 0 } }
        ],
        semifinal: [
            { id: 14, team1: { name: "PAÍSES BAJOS", score: 0 }, team2: { name: "PORTUGAL", score: 1 } }
        ]
    },
    finals: {
        final: { id: 15, team1: { name: "ARGENTINA", score: "-" }, team2: { name: "PORTUGAL", score: "-" } },
        tercerPuesto: { id: 16, team1: { name: "BRASIL", score: "-" }, team2: { name: "PAÍSES BAJOS", score: "-" } }
    }
};

// Función para crear el HTML de una tarjeta de partido
function createMatchHTML(match, extraClass = '') {
    return `
        <div class="match-card ${extraClass}">
            <div class="team-row">
                <div class="team-info">
                    <span class="flag-placeholder"></span>
                    <span class="team-name">${match.team1.name}</span>
                </div>
                <span class="score">${match.team1.score}</span>
            </div>
            <div class="team-row">
                <div class="team-info">
                    <span class="flag-placeholder"></span>
                    <span class="team-name">${match.team2.name}</span>
                </div>
                <span class="score">${match.team2.score}</span>
            </div>
        </div>
    `;
}

// Función principal para renderizar todo el cuadro
function renderBracket() {
    const root = document.getElementById('bracket-root');
    if (!root) return;

    let htmlContent = '';

    // 1. Renderizar Lado Izquierdo (Octavos -> Cuartos -> Semis)
    htmlContent += `<div class="round-column">${tournamentData.leftBracket.octavos.map(m => createMatchHTML(m)).join('')}</div>`;
    htmlContent += `<div class="round-column">${tournamentData.leftBracket.cuartos.map(m => createMatchHTML(m)).join('')}</div>`;
    htmlContent += `<div class="round-column">${tournamentData.leftBracket.semifinal.map(m => createMatchHTML(m)).join('')}</div>`;

    // 2. Renderizar Centro (Trofeo, Gran Final y Tercer Puesto)
    htmlContent += `
        <div class="center-stage">
            <div class="trophy-container">
                <div class="trophy-mock">🏆</div>
            </div>
            
            <h3>Gran Final</h3>
            ${createMatchHTML(tournamentData.finals.final, 'final-match')}
            
            <h3>Tercer Puesto</h3>
            ${createMatchHTML(tournamentData.finals.tercerPuesto, 'third-place-match')}
        </div>
    `;

    // 3. Renderizar Lado Derecho (Semis <- Cuartos <- Octavos)
    htmlContent += `<div class="round-column">${tournamentData.rightBracket.semifinal.map(m => createMatchHTML(m)).join('')}</div>`;
    htmlContent += `<div class="round-column">${tournamentData.rightBracket.cuartos.map(m => createMatchHTML(m)).join('')}</div>`;
    htmlContent += `<div class="round-column">${tournamentData.rightBracket.octavos.map(m => createMatchHTML(m)).join('')}</div>`;

    root.innerHTML = htmlContent;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', renderBracket);