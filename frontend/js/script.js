const THEME_KEY = "empreendedorismoGuruTheme";

let confirmCallback = null;

const popupModal = document.getElementById("popup-modal");
const popupTitle = document.getElementById("popup-title");
const popupMessage = document.getElementById("popup-message");
const popupButtons = document.getElementById("popup-buttons");
const popupContent = popupModal ? popupModal.querySelector('.popup-content') : null;

const classeModal = document.getElementById("classe-modal");
const classeCardElement = document.getElementById('classe-card');

const eventoModal = document.getElementById("evento-modal");
const eventoCardElement = document.getElementById('evento-card');

const fimDeJogoModal = document.getElementById("fim-de-jogo-modal");
const jogarNovamenteBtn = document.getElementById("jogar-novamente-btn");

const bibliotecaModal = document.getElementById("biblioteca-modal");
const fecharBibliotecaBtn = document.getElementById("fechar-biblioteca-btn");


function playAudio(soundId) {
    try {
        const audio = document.getElementById(soundId);
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    } catch (e) {
        console.warn(`Falha ao tocar áudio [${soundId}]:`, e);
    }
}

function showPopup(title, message, type = 'aviso') {
    if (!popupModal) return; 
    popupTitle.innerText = title;
    popupMessage.innerText = message;
    
    popupContent.className = 'popup-content'; 
    if (type === 'erro') popupContent.classList.add('tipo-erro');
    else if (type === 'sucesso') popupContent.classList.add('tipo-sucesso');
    else if (type === 'aviso') popupContent.classList.add('tipo-avo');

    popupButtons.innerHTML = '<button id="popup-btn-ok" class="button-aprovar">OK</button>';
    
    popupModal.classList.remove('hidden');
    
    const okBtn = document.getElementById('popup-btn-ok');
    okBtn.focus();
    
    okBtn.onclick = () => {
        popupModal.classList.add('hidden');
    };
}

function showConfirm(title, message, onConfirm) {
    if (!popupModal) return; 
    popupTitle.innerText = title;
    popupMessage.innerText = message;
    popupContent.className = 'popup-content tipo-aviso';
    
    popupButtons.innerHTML = `
        <button id="popup-btn-cancel" class="button-secondary">Cancelar</button>
        <button id="popup-btn-confirm" class="button-aprovar">Confirmar</button>
    `;
    
    confirmCallback = onConfirm;
    
    popupModal.classList.remove('hidden');
    
    const cancelBtn = document.getElementById('popup-btn-cancel');
    const confirmBtn = document.getElementById('popup-btn-confirm');
    
    confirmBtn.focus();
    
    cancelBtn.onclick = () => {
        popupModal.classList.add('hidden');
        confirmCallback = null;
    };
    confirmBtn.onclick = () => {
        popupModal.classList.add('hidden');
        if (confirmCallback) {
            confirmCallback();
        }
        confirmCallback = null;
    };
}

if (popupModal) {
    popupModal.addEventListener('click', (e) => {
        if (e.target === popupModal) {
            popupModal.classList.add('hidden');
            confirmCallback = null;
        }
    });
}

function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-mode", isLight);
    
    const icon = isLight ? "☀️" : "🌙";
    const themeBtnGame = document.getElementById("theme-toggle-btn-game");
    const themeBtnHome = document.getElementById("theme-toggle-btn-home");
    
    if (themeBtnGame) themeBtnGame.innerText = icon;
    if (themeBtnHome) themeBtnHome.innerText = icon;

    localStorage.setItem(THEME_KEY, theme);
    
    if (typeof CHART_INSTANCES !== 'undefined' && Object.keys(CHART_INSTANCES).length > 0) {
        if (typeof estadoJogoAtual !== 'undefined' && estadoJogoAtual.startups) {
            estadoJogoAtual.startups.forEach(s => renderRadarChart(s));
        }
        else if (typeof startups !== 'undefined' && startups.length > 0) {
            startups.forEach(s => renderRadarChart(s));
        }
    }
}

function toggleTheme() {
    playAudio("audio-clique");
    const currentTheme = document.body.classList.contains("light-mode")
        ? "light"
        : "dark";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(newTheme);
}

function loadInitialTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(savedTheme);
}

function normalizeClassName(className) {
    if (typeof className !== 'string') return '';
    return className
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function renderRadarChart(startup) {
    const canvas = document.getElementById(`chart-${startup.nome}`);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const isLightMode = document.body.classList.contains("light-mode");
    const textColor = isLightMode ? "#333" : "#e0e0e0";
    const gridColor = isLightMode
        ? "rgba(0, 0, 0, 0.1)"
        : "rgba(255, 255, 255, 0.2)";
    const pointLabelColor = isLightMode ? "#1e3a8a" : "#e0e0e0";
    const ticksColor = isLightMode ? "#64748b" : "#e0e0e0";
    const ticksBackdrop = isLightMode
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(0, 0, 0, 0.5)";
    const datasetBackgroundColor = isLightMode
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(var(--cor-lider-rgb), 0.3)";
    const datasetBorderColor = isLightMode
        ? "rgb(59, 130, 246)"
        : "rgb(var(--cor-lider-rgb))";

    const chartData = {
        labels: Object.keys(startup.dimensoes).map(
            (d) => d.charAt(0).toUpperCase() + d.slice(1)
        ),
        datasets: [
            {
                label: `Nível das Dimensões`,
                data: Object.values(startup.dimensoes),
                fill: true,
                backgroundColor: datasetBackgroundColor,
                borderColor: datasetBorderColor,
                pointBackgroundColor: datasetBorderColor,
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: datasetBorderColor,
            },
        ],
    };
    
    if (typeof CHART_INSTANCES !== 'undefined') {
        if (CHART_INSTANCES[startup.nome]) CHART_INSTANCES[startup.nome].destroy();
        CHART_INSTANCES[startup.nome] = new Chart(ctx, {
            type: "radar",
            data: chartData,
            options: {
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                    r: {
                        beginAtZero: true,
                        suggestedMax: 5,
                        suggestedMin: 0,
                        grid: { color: gridColor },
                        ticks: { color: ticksColor, backdropColor: ticksBackdrop },
                        pointLabels: {
                            color: pointLabelColor,
                            font: { size: 13, weight: "bold" },
                        },
                    },
                },
                elements: { line: { tension: 0.1 } },
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    }
}

function showClasseModal(jogador) {
    const classeCard = document.getElementById("classe-card");
    const classeCardFront = document.getElementById("classe-card-front");
    const classeCardBack = document.getElementById("classe-card-back");
    if (!classeCard || !classeCardFront || !classeCardBack) return; 
    
    console.log("showClasseModal foi chamada com:", jogador);
    classeCard.className = "flashcard";
    classeCard.classList.remove("is-flipped");
    
    const classeCor = `classe-${normalizeClassName(jogador.classe)}`;
    classeCard.classList.add(classeCor);
    classeCardFront.innerHTML = `<h3>${jogador.classe}</h3><p>${jogador.nome}</p>`;
    classeCardBack.innerHTML = `<h3>${jogador.classe}</h3><p>${jogador.descricao}</p>`;
    if (classeModal) classeModal.classList.remove("hidden");
}

function hideClasseModal() {
    if (classeModal) classeModal.classList.add("hidden");
    if (classeCardElement) classeCardElement.classList.remove("is-flipped");
}

if (classeModal) {
    classeModal.addEventListener("click", (e) => {
        if (e.target === classeModal) hideClasseModal();
    });
}
if (classeCardElement) {
    classeCardElement.addEventListener("click", () => {
        playAudio("audio-virar-carta");
        classeCardElement.classList.toggle("is-flipped");
    });
}

let resolveEventoPromise;
function showEventoModal(evento) {
    const eventoCard = document.getElementById("evento-card");
    const eventoNome = document.getElementById("evento-nome");
    const eventoDescricao = document.getElementById("evento-descricao");
    const eventoResultado = document.getElementById("evento-resultado");
    if (!eventoCard || !eventoNome || !eventoDescricao || !eventoResultado) return; 

    eventoCard.className = "flashcard";
    eventoCard.classList.remove("is-flipped");

    eventoNome.innerText = evento.nome;
    eventoDescricao.innerText = evento.descricao;
    let resultadoTexto = "";
    
    if (evento.tipo === "positivo") {
        eventoCard.classList.add("evento-positivo");
        resultadoTexto = evento.bonus_ativado ? "Bônus Ativado!" : "Bônus Perdido.";
        playAudio("audio-sucesso");
    } else {
        if (evento.anulado) {
            eventoCard.classList.add("evento-anulado");
            resultadoTexto = "Efeito Anulado!";
            playAudio("audio-sucesso");
        } else {
            eventoCard.classList.add("evento-negativo");
            resultadoTexto = "Efeito Aplicado!";
            playAudio("audio-falha");
        }
    }
    
    if (evento.mensagem_final && evento.mensagem_final.includes("ELIMINADA")) {
        resultadoTexto = "ELIMINADA!";
        eventoCard.classList.add("evento-negativo");
        playAudio("audio-falha");
    }
    
    eventoResultado.innerText = resultadoTexto;
    if (eventoModal) eventoModal.classList.remove("hidden");
    
    return new Promise((resolve) => {
        resolveEventoPromise = resolve;
    });
}

function hideEventoModal() {
    if (eventoModal) eventoModal.classList.add("hidden");
    if (eventoCardElement) eventoCardElement.classList.remove("is-flipped");
    
    if (resolveEventoPromise) {
        resolveEventoPromise();
        resolveEventoPromise = null;
    }
}

if (eventoModal) {
    eventoModal.addEventListener("click", (e) => {
        if (e.target === eventoModal) hideEventoModal();
    });
}
if (eventoCardElement) {
    eventoCardElement.addEventListener("click", () => {
        playAudio("audio-virar-carta");
        eventoCardElement.classList.toggle("is-flipped");
    });
}

function showFimDeJogo(nomeVencedor) {
    const vencedorNome = document.getElementById("vencedor-nome");
    const gameBoard = document.getElementById("game-board");

    if (!vencedorNome || !fimDeJogoModal || !gameBoard) return;
    
    playAudio("audio-vitoria");
    vencedorNome.innerText = `A startup "${nomeVencedor}" venceu!`;
    fimDeJogoModal.classList.remove("hidden");
    gameBoard.classList.add("hidden");
    
    const hud = document.getElementById("player-hud");
    if (hud) hud.classList.add("hidden");
}

if (jogarNovamenteBtn) {
    jogarNovamenteBtn.addEventListener("click", () => {
        playAudio("audio-clique");
        window.location.href = "/";
    });
}

if (fecharBibliotecaBtn) {
    fecharBibliotecaBtn.addEventListener("click", () => {
        playAudio("audio-clique");
        if (bibliotecaModal) bibliotecaModal.classList.add("hidden");
    });
}
if (bibliotecaModal) {
    bibliotecaModal.addEventListener("click", (e) => {
        if (e.target === bibliotecaModal) bibliotecaModal.classList.add("hidden");
    });
}