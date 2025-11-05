const API_URL = "http://127.0.0.1:5000";
let jogoId = null;
let startups = [];
let acoesDisponiveis = {};
let turnoAtualIndex = 0;
let acoesRealizadasNoTurno = { coletiva: false, individual: null };

// --- Seletores do Jogo ---
const homeScreen = document.getElementById("home-screen");
const setupForm = document.getElementById("setup-form");
const numStartupsInput = document.getElementById("num-startups");
const numJogadoresSelect = document.getElementById("num-jogadores");
const equipesFormsContainer = document.getElementById(
    "equipes-forms-container"
);
const gameSetupDiv = document.getElementById("game-setup");
const gameBoardDiv = document.getElementById("game-board");
const startupCardsContainer = document.getElementById(
    "startup-cards-container"
);
const currentStartupNameSpan = document.getElementById("current-startup-name");
const playerTurnSelectorDiv = document.getElementById("player-turn-selector");
const acoesDisponiveisDiv = document.getElementById("acoes-disponiveis");
const nextTurnBtn = document.getElementById("next-turn-btn");
const logList = document.getElementById("log-list");

// --- Seletores dos Modais ---
const classeModal = document.getElementById("classe-modal");
const classeCard = document.getElementById("classe-card");
const classeCardFront = document.getElementById("classe-card-front");
const classeCardBack = document.getElementById("classe-card-back");

const eventoModal = document.getElementById("evento-modal");
const eventoCard = document.getElementById("evento-card");
const eventoNome = document.getElementById("evento-nome");
const eventoDescricao = document.getElementById("evento-descricao");
const eventoResultado = document.getElementById("evento-resultado");

const fimDeJogoModal = document.getElementById("fim-de-jogo-modal");
const vencedorNome = document.getElementById("vencedor-nome");
const jogarNovamenteBtn = document.getElementById("jogar-novamente-btn");

const verClassesBtn = document.getElementById("ver-classes-btn");
const bibliotecaModal = document.getElementById("biblioteca-modal");
const fecharBibliotecaBtn = document.getElementById("fechar-biblioteca-btn");

// --- Seletores da Navegação por Abas (Setup) ---
const setupNavigation = document.getElementById("setup-navigation");
const prevStepBtn = document.getElementById("prev-step-btn");
const nextStepBtn = document.getElementById("next-step-btn");
const startGameBtn = document.getElementById("start-game-btn");
let currentSetupStep = 0;

// --- Seletores do Filtro de Dimensão ---
const dimensaoFiltrosContainer = document.getElementById("dimensao-filtros");
let currentDimensaoFilter = "todos";

// --- Seletores do HUD do Jogador ---
const playerHUD = document.getElementById("player-hud");
const hudJogadorImg = document.getElementById("hud-jogador-img");
const hudClasseNome = document.getElementById("hud-classe-nome");
const hudJogadorNome = document.getElementById("hud-jogador-nome");
const hudAfinidadeDesc = document.getElementById("hud-afinidade-desc");

// --- Seletores de Salvar/Carregar Jogo ---
const homeNewGameBtn = document.getElementById("home-new-game-btn");
const homeLoadGameBtn = document.getElementById("home-load-game-btn");
const saveGameBtn = document.getElementById("save-game-btn");
const SAVE_KEY = "empreendedorismoGuruSave";

// ATUALIZAÇÃO: Seletores de Tema (Light/Dark Mode)
const themeToggleBtnHome = document.getElementById("theme-toggle-btn-home");
const themeToggleBtnGame = document.getElementById("theme-toggle-btn-game");
const THEME_KEY = "empreendedorismoGuruTheme";

const CHART_INSTANCES = {};

// --- Função de Áudio ---
function playAudio(soundId) {
    try {
        const audio = document.getElementById(soundId);
        if (audio) {
            audio.currentTime = 0; // Rebobina o som
            audio.play();
        }
    } catch (error) {
        console.warn(`Não foi possível tocar o áudio: ${soundId}`, error);
    }
}

// --- Funções de Setup e Jogo ---

function renderEquipeForms() {
    const numStartups = parseInt(numStartupsInput.value);
    const numJogadores = parseInt(numJogadoresSelect.value);

    equipesFormsContainer.innerHTML = "";
    setupNavigation.innerHTML = "";
    currentSetupStep = 0;

    for (let i = 0; i < numStartups; i++) {
        const navBtn = document.createElement("button");
        navBtn.type = "button";
        navBtn.className = "setup-nav-btn";
        navBtn.innerText = `Startup ${i + 1}`;
        navBtn.setAttribute("data-step", i);
        navBtn.addEventListener("click", () => navigateToSetupStep(i));
        if (i > 0) navBtn.disabled = true;
        setupNavigation.appendChild(navBtn);

        let jogadoresHtml = "";
        for (let j = 0; j < numJogadores; j++) {
            jogadoresHtml += `
                <div class="form-group">
                    <label for="jogador-nome-${i}-${j}">Jogador ${
                j + 1
            } Nome:</label>
                    <input type="text" id="jogador-nome-${i}-${j}" required>
                    <label for="jogador-classe-${i}-${j}">Classe:</label>
                    <select id="jogador-classe-${i}-${j}">
                        <option value="Líder">Líder</option>
                        <option value="Visionário">Visionário</option>
                        <option value="Desbravador">Desbravador</option>
                        <option value="Estrategista">Estrategista</option>
                        <option value="Guardião">Guardião</option>
                    </select>
                </div>`;
        }

        const equipeHtml = `
            <fieldset data-step="${i}">
                <legend>Configuração da Startup ${i + 1}</legend>
                <div class="form-group">
                    <label for="startup-nome-${i}">Nome da Startup:</label>
                    <input type="text" id="startup-nome-${i}" required>
                </div>
                <div class="form-group">
                    <label for="ideia-negocio-${i}">Ideia de Negócio:</label>
                    <input type="text" id="ideia-negocio-${i}" placeholder="Ex: Um app de delivery para pets" required>
                </div>
                ${jogadoresHtml}
            </fieldset>`;
        equipesFormsContainer.innerHTML += equipeHtml;
    }
    navigateToSetupStep(0);
}

function navigateToSetupStep(stepIndex) {
    const numStartups = parseInt(numStartupsInput.value);
    currentSetupStep = stepIndex;

    document.querySelectorAll(".setup-nav-btn").forEach((btn) => {
        const btnStep = parseInt(btn.getAttribute("data-step"));
        btn.classList.toggle("active", btnStep === stepIndex);
        btn.disabled = btnStep > stepIndex;
    });

    document
        .querySelectorAll("#equipes-forms-container fieldset")
        .forEach((fieldset) => {
            const fieldsetStep = parseInt(fieldset.getAttribute("data-step"));
            fieldset.classList.toggle(
                "active-step",
                fieldsetStep === stepIndex
            );
        });

    prevStepBtn.classList.toggle("hidden", stepIndex === 0);
    nextStepBtn.classList.toggle("hidden", stepIndex === numStartups - 1);
    startGameBtn.classList.toggle("hidden", stepIndex !== numStartups - 1);
}

async function iniciarJogo(e) {
    e.preventDefault();
    if (!setupForm.checkValidity()) {
        addLogMessage(
            "Por favor, preencha todos os campos obrigatórios em todas as abas.",
            "log-aviso"
        );
        return;
    }

    playAudio("audio-clique");

    const numStartups = parseInt(numStartupsInput.value);
    const numJogadores = parseInt(numJogadoresSelect.value);
    const equipes = [];
    for (let i = 0; i < numStartups; i++) {
        const jogadores = [];
        for (let j = 0; j < numJogadores; j++) {
            jogadores.push({
                nome: document.getElementById(`jogador-nome-${i}-${j}`).value,
                classe: document.getElementById(`jogador-classe-${i}-${j}`)
                    .value,
            });
        }
        equipes.push({
            nome_startup: document.getElementById(`startup-nome-${i}`).value,
            ideia_negocio: document.getElementById(`ideia-negocio-${i}`).value,
            jogadores: jogadores,
        });
    }

    try {
        const response = await fetch(`${API_URL}/iniciar_jogo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ equipes }),
        });
        const data = await response.json();
        if (data.status === "sucesso") {
            jogoId = data.jogo_id;
            startups = data.dados_jogo;
            acoesDisponiveis = data.acoes_disponiveis;
            gameSetupDiv.classList.add("hidden");
            gameBoardDiv.classList.remove("hidden");

            updateUI();
            setupFiltrosDimensao();
            hidePlayerHUD();
            localStorage.removeItem(SAVE_KEY);
        } else {
            addLogMessage(`Erro: ${data.erro}`, "log-perigo");
        }
    } catch (error) {
        console.error("Erro ao iniciar jogo:", error);
        addLogMessage("Não foi possível conectar ao servidor.", "log-perigo");
    }
}

// --- Funções de Jogo (updateUI, renderStartupCards, etc.) ---

function updateUI() {
    if (!startups || startups.length === 0) return;
    renderStartupCards();
    updateTurnoInfo();
    renderAcoes();
}

function renderStartupCards() {
    startupCardsContainer.innerHTML = "";
    startups.forEach((startup, index) => {
        const card = document.createElement("div");
        card.className = "startup-card";
        if (startup.esta_eliminada) card.classList.add("eliminada");
        if (index === turnoAtualIndex) card.classList.add("active-turn");

        const jogadoresHtml = startup.jogadores
            .map(
                (j) =>
                    `<li class="player-name" 
                        data-nome="${j.nome}" 
                        data-classe="${j.classe}" 
                        data-descricao="${j.descricao}"
                        data-afinidade="${j.dimensao_afinidade}"> 
                        ${j.nome} (${j.classe})
                    </li>`
            )
            .join("");

        card.innerHTML = `
            <h3>${startup.nome} (Nível: ${startup.nivel})</h3>
            <p><strong>Ideia:</strong> ${startup.ideia_negocio}</p>
            <div class="radar-chart-container" style="height: 250px;">
                <canvas id="chart-${startup.nome}"></canvas>
            </div>
            <p><strong>Jogadores:</strong></p>
            <ul>
                ${jogadoresHtml}
            </ul>
        `;
        startupCardsContainer.appendChild(card);
        renderRadarChart(startup);
    });
}

function renderRadarChart(startup) {
    const ctx = document
        .getElementById(`chart-${startup.nome}`)
        .getContext("2d");

    const isLightMode = document.body.classList.contains("light-mode");
    let textColor,
        gridColor,
        pointLabelColor,
        ticksColor,
        ticksBackdrop,
        datasetBackgroundColor,
        datasetBorderColor;

    if (isLightMode) {
        textColor = "#333";
        gridColor = "rgba(0, 0, 0, 0.1)";
        pointLabelColor = "#1e3a8a";
        ticksColor = "#64748b";
        ticksBackdrop = "rgba(255, 255, 255, 0.7)";
        datasetBackgroundColor = "rgba(59, 130, 246, 0.2)";
        datasetBorderColor = "rgb(59, 130, 246)";
    } else {
        textColor = "#e0e0e0";
        gridColor = "rgba(255, 255, 255, 0.2)";
        pointLabelColor = "#e0e0e0";
        ticksColor = "#e0e0e0";
        ticksBackdrop = "rgba(0, 0, 0, 0.5)";
        datasetBackgroundColor = "rgba(var(--cor-lider-rgb), 0.3)";
        datasetBorderColor = "rgb(var(--cor-lider-rgb))";
    }

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
    if (CHART_INSTANCES[startup.nome]) CHART_INSTANCES[startup.nome].destroy();

    CHART_INSTANCES[startup.nome] = new Chart(ctx, {
        type: "radar",
        data: chartData,
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                r: {
                    beginAtZero: true,
                    suggestedMax: 5,
                    suggestedMin: 0,
                    grid: {
                        color: gridColor,
                    },
                    ticks: {
                        color: ticksColor,
                        backdropColor: ticksBackdrop,
                    },
                    pointLabels: {
                        color: pointLabelColor,
                        font: {
                            size: 13,
                            weight: "bold",
                        },
                    },
                },
            },
            elements: {
                line: {
                    tension: 0.1,
                },
            },
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}

function updateTurnoInfo() {
    const startupAtual = startups[turnoAtualIndex];
    if (startupAtual.esta_eliminada) {
        avancarTurno();
        return;
    }

    currentStartupNameSpan.innerText = startupAtual.nome;
    playerTurnSelectorDiv.innerHTML = "<strong>Ação Individual de:</strong> ";
    if (!acoesRealizadasNoTurno.individual) hidePlayerHUD();

    startupAtual.jogadores.forEach((jogador) => {
        const btn = document.createElement("button");
        btn.innerText = jogador.nome;
        btn.disabled = acoesRealizadasNoTurno.individual === jogador.nome;
        btn.onclick = () => {
            playAudio("audio-clique");
            acoesRealizadasNoTurno.individual = jogador.nome;
            updateUI();
            updatePlayerHUD(jogador);
        };
        playerTurnSelectorDiv.appendChild(btn);
    });
    const podeAvancar =
        acoesRealizadasNoTurno.coletiva && acoesRealizadasNoTurno.individual;
    nextTurnBtn.classList.toggle("hidden", !podeAvancar);
}

function renderAcoes() {
    acoesDisponiveisDiv.innerHTML = "";
    const startupAtual = startups[turnoAtualIndex];
    const acoesFeitas = startupAtual.acoes_realizadas;
    const filtro = currentDimensaoFilter;
    const isIndividualTurn =
        acoesRealizadasNoTurno.coletiva && !!acoesRealizadasNoTurno.individual;
    let afinidade = null;
    let classeCss = null;

    if (isIndividualTurn) {
        const nomeJogadorAtivo = acoesRealizadasNoTurno.individual;
        const jogadorAtivo = startupAtual.jogadores.find(
            (j) => j.nome === nomeJogadorAtivo
        );
        if (jogadorAtivo) {
            afinidade = jogadorAtivo.dimensao_afinidade;
            classeCss = `classe-${jogadorAtivo.classe.toLowerCase()}`;
        }
    }

    for (const [dimensao, acoes] of Object.entries(acoesDisponiveis)) {
        if (filtro !== "todos" && dimensao !== filtro) continue;
        const dimensaoHeader = document.createElement("h5");
        dimensaoHeader.innerText = dimensao.toUpperCase();
        if (isIndividualTurn) {
            if (dimensao === afinidade) {
                dimensaoHeader.classList.add(
                    "highlighted-by-affinity",
                    classeCss
                );
            } else {
                dimensaoHeader.classList.add("disabled-by-affinity");
            }
        }
        acoesDisponiveisDiv.appendChild(dimensaoHeader);

        acoes.forEach((acao) => {
            const btn = document.createElement("button");
            btn.innerText = acao.nome;
            btn.className = "acao-button";
            btn.classList.add(`acao-${dimensao}`);
            btn.onclick = () => apresentarAcao(acao.id);

            if (acoesFeitas.includes(acao.nome)) {
                btn.classList.add("acao-realizada");
                btn.disabled = true;
            } else if (isIndividualTurn && dimensao !== afinidade) {
                btn.classList.add("disabled-by-affinity");
                btn.disabled = true;
            } else if (
                acoesRealizadasNoTurno.coletiva &&
                acoesRealizadasNoTurno.individual
            ) {
                btn.disabled = true;
                btn.classList.add("disabled");
            } else if (isIndividualTurn && dimensao === afinidade) {
                btn.classList.add("highlighted-by-affinity", classeCss);
            }
            acoesDisponiveisDiv.appendChild(btn);
        });
    }
}

function setupFiltrosDimensao() {
    dimensaoFiltrosContainer.innerHTML = "";
    const filtros = [
        { id: "todos", nome: "Mostrar Todos", classe: "filtro-todos" },
        { id: "equipe", nome: "Equipe (EQ)", classe: "filtro-equipe" },
        { id: "produto", nome: "Produto (PD)", classe: "filtro-produto" },
        { id: "mercado", nome: "Mercado (ME)", classe: "filtro-mercado" },
        {
            id: "competitividade",
            nome: "Competitividade (CT)",
            classe: "filtro-competitividade",
        },
        { id: "recursos", nome: "Recursos (RE)", classe: "filtro-recursos" },
    ];
    filtros.forEach((filtro) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `filtro-btn ${filtro.classe}`;
        btn.innerText = filtro.nome;
        btn.setAttribute("data-filtro", filtro.id);
        if (filtro.id === currentDimensaoFilter) btn.classList.add("active");
        dimensaoFiltrosContainer.appendChild(btn);
    });
    dimensaoFiltrosContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".filtro-btn");
        if (!btn) return;

        playAudio("audio-clique");

        const filtroId = btn.getAttribute("data-filtro");
        currentDimensaoFilter = filtroId;
        document.querySelectorAll(".filtro-btn").forEach((b) => {
            b.classList.toggle(
                "active",
                b.getAttribute("data-filtro") === filtroId
            );
        });
        renderAcoes();
    });
}

async function apresentarAcao(acaoId) {
    const startupAtual = startups[turnoAtualIndex];
    let tipoAcao, jogadorNome;

    playAudio("audio-clique");

    if (startupAtual.esta_eliminada) {
        addLogMessage(
            `A startup ${startupAtual.nome} está eliminada!`,
            "log-perigo"
        );
        avancarTurno();
        return;
    }
    if (!acoesRealizadasNoTurno.coletiva) {
        tipoAcao = "coletiva";
        jogadorNome = startupAtual.jogadores[0].nome;
    } else if (acoesRealizadasNoTurno.individual) {
        addLogMessage(
            "Você já realizou todas as ações deste turno.",
            "log-aviso"
        );
        return;
    } else {
        tipoAcao = "individual";
        jogadorNome = acoesRealizadasNoTurno.individual;
        if (!jogadorNome) {
            addLogMessage(
                "Por favor, selecione qual jogador fará a ação individual.",
                "log-aviso"
            );
            return;
        }
    }
    try {
        const response = await fetch(`${API_URL}/${jogoId}/apresentar_acao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                startup_id: startupAtual.nome,
                jogador_nome: jogadorNome,
                acao_id: acaoId,
                tipo_acao: tipoAcao,
            }),
        });
        const resultado = await response.json();

        if (resultado.status !== "falha") {
            addLogMessage(resultado.mensagem, "log-normal");
        }

        if (resultado.status === "sucesso") {
            if (tipoAcao === "coletiva") acoesRealizadasNoTurno.coletiva = true;
            await fetchStatus();
            if (resultado.jogo_terminado) {
                showFimDeJogo(resultado.vencedor);
                return;
            }
            if (resultado.subiu_de_nivel) {
                addLogMessage(
                    `A startup ${startupAtual.nome} subiu de nível!`,
                    "log-info"
                );
                if (resultado.evento) {
                    await showEventoModal(resultado.evento);
                    let tipoLogEvento = "log-normal";
                    if (resultado.evento.tipo === "positivo") {
                        tipoLogEvento = "log-sucesso";
                    } else {
                        if (resultado.evento.anulado) {
                            tipoLogEvento = "log-info";
                        } else if (
                            resultado.evento.mensagem_final.includes(
                                "ELIMINADA"
                            )
                        ) {
                            tipoLogEvento = "log-perigo";
                        } else {
                            tipoLogEvento = "log-aviso";
                        }
                    }
                    addLogMessage(
                        resultado.evento.mensagem_final,
                        tipoLogEvento
                    );
                    await fetchStatus();
                }
            }
            if (tipoAcao === "coletiva") {
                renderAcoes();
            }
        }
    } catch (error) {
        console.error("Erro ao apresentar ação:", error);
        addLogMessage("Erro de comunicação com o servidor.", "log-perigo");
    }
}
async function fetchStatus() {
    try {
        const response = await fetch(`${API_URL}/${jogoId}/status`);
        const data = await response.json();
        if (data.status === "sucesso") {
            startups = data.dados_jogo;
            updateUI();
        }
    } catch (error) {
        console.error("Erro ao buscar status:", error);
    }
}

function avancarTurno() {
    playAudio("audio-clique");

    const todosIndices = startups.map((_, index) => index);
    const indicesAtivos = todosIndices.filter(
        (index) => !startups[index].esta_eliminada
    );
    if (indicesAtivos.length <= 1) return;
    const indexAtualNoArrayDeAtivos = indicesAtivos.indexOf(turnoAtualIndex);
    const proximoIndexNoArrayDeAtivos =
        (indexAtualNoArrayDeAtivos + 1) % indicesAtivos.length;
    const proximoIndexReal = indicesAtivos[proximoIndexNoArrayDeAtivos];
    turnoAtualIndex = proximoIndexReal;
    acoesRealizadasNoTurno = { coletiva: false, individual: null };
    currentDimensaoFilter = "todos";
    hidePlayerHUD();
    updateUI();
}

function addLogMessage(message, tipo = "log-normal") {
    if (!message) return;
    const li = document.createElement("li");
    li.textContent = message;
    li.className = tipo;
    logList.prepend(li);
}

// --- Funções dos Modais ---
function showClasseModal(jogador) {
    console.log("showClasseModal foi chamada com:", jogador);
    classeCard.className = "flashcard";
    classeCard.classList.remove("is-flipped");
    const classeCor = `classe-${jogador.classe.toLowerCase()}`;
    classeCard.classList.add(classeCor);
    classeCardFront.innerHTML = `<h3>${jogador.classe}</h3><p>${jogador.nome}</p>`;
    classeCardBack.innerHTML = `<h3>${jogador.classe}</h3><p>${jogador.descricao}</p>`;
    classeModal.classList.remove("hidden");
}
function hideClasseModal() {
    classeModal.classList.add("hidden");
    classeCard.classList.remove("is-flipped");
}
classeCard.addEventListener("click", () => {
    playAudio("audio-virar-carta");
    classeCard.classList.toggle("is-flipped");
});
classeModal.addEventListener("click", (e) => {
    if (e.target === classeModal) {
        hideClasseModal();
    }
});
let resolveEventoPromise;
function showEventoModal(evento) {
    eventoCard.className = "flashcard";
    eventoCard.classList.remove("is-flipped");
    eventoNome.innerText = evento.nome;
    eventoDescricao.innerText = evento.descricao;
    let resultadoTexto = "";
    if (evento.tipo === "positivo") {
        eventoCard.classList.add("evento-positivo");
        resultadoTexto = evento.bonus_ativado
            ? "Bônus Ativado!"
            : "Bônus Perdido.";
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
    if (evento.mensagem_final.includes("ELIMINADA")) {
        resultadoTexto = "ELIMINADA!";
        eventoCard.classList.add("evento-negativo");
        playAudio("audio-falha");
    }
    eventoResultado.innerText = resultadoTexto;
    eventoModal.classList.remove("hidden");
    return new Promise((resolve) => {
        resolveEventoPromise = resolve;
    });
}
function hideEventoModal() {
    eventoModal.classList.add("hidden");
    eventoCard.classList.remove("is-flipped");
    if (resolveEventoPromise) {
        resolveEventoPromise();
        resolveEventoPromise = null;
    }
}
eventoCard.addEventListener("click", () => {
    playAudio("audio-virar-carta");
    eventoCard.classList.toggle("is-flipped");
});
eventoModal.addEventListener("click", (e) => {
    if (e.target === eventoModal) {
        hideEventoModal();
    }
});
function showFimDeJogo(nomeVencedor) {
    playAudio("audio-vitoria");

    vencedorNome.innerText = `A startup "${nomeVencedor}" venceu!`;
    fimDeJogoModal.classList.remove("hidden");
    gameBoardDiv.classList.add("hidden");
    hidePlayerHUD();
    localStorage.removeItem(SAVE_KEY);
}
jogarNovamenteBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    location.reload();
});
function showBibliotecaModal() {
    playAudio("audio-virar-carta");
    bibliotecaModal.classList.remove("hidden");
}
function hideBibliotecaModal() {
    bibliotecaModal.classList.add("hidden");
}
verClassesBtn.addEventListener("click", showBibliotecaModal);
fecharBibliotecaBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    hideBibliotecaModal();
});
bibliotecaModal.addEventListener("click", (e) => {
    if (e.target === bibliotecaModal) {
        hideBibliotecaModal();
    }
});

// ATUALIZAÇÃO: normalizeClassName agora corrige 'á'
function normalizeClassName(className) {
    return className
        .toLowerCase()
        .replace("í", "i") // Corrige "Líder" -> "lider"
        .replace("ã", "a") // Corrige "Guardião" -> "guardiao"
        .replace("á", "a"); // Corrige "Visionário" -> "visionario"
}
function updatePlayerHUD(jogador) {
    if (!jogador) {
        hidePlayerHUD();
        return;
    }
    const classeLimpa = normalizeClassName(jogador.classe);
    const imgPath = `/css/img/portraits/${classeLimpa}.png`;
    hudJogadorImg.src = imgPath;
    playerHUD.className = "";
    const classeCor = `classe-${classeLimpa}`;
    playerHUD.classList.add(classeCor);
    hudClasseNome.innerText = jogador.classe;
    hudJogadorNome.innerText = jogador.nome;
    const afinidade = jogador.dimensao_afinidade;
    const afinidadeCapitalizada =
        afinidade.charAt(0).toUpperCase() + afinidade.slice(1);
    hudAfinidadeDesc.innerText = `Afinidade: ${afinidadeCapitalizada}`;
    playerHUD.classList.remove("hidden");
}
function hidePlayerHUD() {
    playerHUD.classList.add("hidden");
    hudJogadorImg.src = "";
}

// --- Funções de Salvar/Carregar Jogo ---
function saveGame() {
    playAudio("audio-clique");

    const saveState = {
        startups: startups,
        turnoAtualIndex: turnoAtualIndex,
        acoesRealizadasNoTurno: acoesRealizadasNoTurno,
        jogoId: jogoId,
        acoesDisponiveis: acoesDisponiveis,
        currentDimensaoFilter: currentDimensaoFilter,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
    alert("Jogo salvo com sucesso!");
}
function loadGame() {
    playAudio("audio-clique");

    const savedStateJSON = localStorage.getItem(SAVE_KEY);
    if (!savedStateJSON) {
        alert("Nenhum jogo salvo encontrado.");
        return;
    }
    const savedState = JSON.parse(savedStateJSON);
    startups = savedState.startups;
    turnoAtualIndex = savedState.turnoAtualIndex;
    acoesRealizadasNoTurno = savedState.acoesRealizadasNoTurno;
    jogoId = savedState.jogoId;
    acoesDisponiveis = savedState.acoesDisponiveis;
    currentDimensaoFilter = savedState.currentDimensaoFilter || "todos";
    gameSetupDiv.classList.add("hidden");
    homeScreen.classList.add("hidden");
    gameBoardDiv.classList.remove("hidden");
    updateUI();
    setupFiltrosDimensao();
    if (acoesRealizadasNoTurno.individual) {
        const startupAtual = startups[turnoAtualIndex];
        const jogador = startupAtual.jogadores.find(
            (j) => j.nome === acoesRealizadasNoTurno.individual
        );
        if (jogador) updatePlayerHUD(jogador);
    }
    addLogMessage("Jogo carregado com sucesso!", "log-info");
}
function checkSavedGame() {
    if (localStorage.getItem(SAVE_KEY)) {
        homeLoadGameBtn.classList.remove("hidden");
    }
}

// ATUALIZAÇÃO: Funções de Tema Light/Dark
function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-mode", isLight);
    const icon = isLight ? "☀️" : "🌙";
    themeToggleBtnHome.innerText = icon;
    themeToggleBtnGame.innerText = icon;
    localStorage.setItem(THEME_KEY, theme);
    if (gameBoardDiv.classList.contains("hidden") === false) {
        updateUI(); // Força o redesenho dos gráficos
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
    const savedTheme = localStorage.getItem(THEME_KEY) || "dark"; // Padrão é 'dark'
    applyTheme(savedTheme);
}
// --- Fim da atualização ---

// --- Listeners Iniciais ---
numStartupsInput.addEventListener("change", () => {
    currentSetupStep = 0;
    renderEquipeForms();
});
numJogadoresSelect.addEventListener("change", () => {
    currentSetupStep = 0;
    renderEquipeForms();
});
nextTurnBtn.addEventListener("click", avancarTurno);
setupForm.addEventListener("submit", iniciarJogo);
nextStepBtn.addEventListener("click", () => {
    playAudio("audio-clique");

    const fieldsetAtual = document.querySelector(
        `fieldset[data-step="${currentSetupStep}"]`
    );
    const inputs = fieldsetAtual.querySelectorAll("input[required]");
    let allValid = true;
    inputs.forEach((input) => {
        if (!input.checkValidity()) {
            allValid = false;
            input.reportValidity();
        }
    });
    if (allValid) {
        navigateToSetupStep(currentSetupStep + 1);
    }
});
prevStepBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    navigateToSetupStep(currentSetupStep - 1);
});
saveGameBtn.addEventListener("click", saveGame);

homeLoadGameBtn.addEventListener("click", loadGame);
homeNewGameBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    homeScreen.classList.add("hidden");
    gameSetupDiv.classList.remove("hidden");
});

themeToggleBtnHome.addEventListener("click", toggleTheme);
themeToggleBtnGame.addEventListener("click", toggleTheme);

console.log("Anexando listener de delegação ao startupCardsContainer.");
startupCardsContainer.addEventListener("click", (e) => {
    console.log("CLIQUE DETETADO DENTRO DO CONTAINER! O alvo foi:", e.target);
    const playerLi = e.target.closest(".player-name");
    if (playerLi) {
        console.log("SUCESSO: O alvo era um .player-name:", playerLi.dataset);
        const jogadorInfo = playerLi.dataset;
        showClasseModal(jogadorInfo);
    } else {
        console.log(
            "FALHA: O alvo clicado NÃO era ou não continha um .player-name."
        );
    }
});

// --- Inicialização ---
renderEquipeForms();
checkSavedGame();
loadInitialTheme();
