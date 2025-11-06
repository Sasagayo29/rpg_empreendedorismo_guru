// --- ESTADO GLOBAL DO MESTRE ---
let idSala = "";
let startups = [];
let acoesDisponiveis = {};
let faseAtual = "COLETIVA";
let submissoesPendentes = {};
let filaValidacao = []; // A Fila de Validação
let dadosAcaoPendente = null; // O item ATUAL que está a ser validado

// --- Conexão Socket.IO ---
const socket = io();

// --- Seletores do Jogo ---
const gameBoardDiv = document.getElementById("game-board");
const startupCardsContainer = document.getElementById(
    "startup-cards-container"
);
const currentPhaseNameSpan = document.getElementById("current-phase-name");
const acoesDisponiveisDiv = document.getElementById("acoes-disponiveis");
const logList = document.getElementById("log-list");
const validacaoFilaList = document.getElementById("validacao-fila-list");

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
const bibliotecaModal = document.getElementById("biblioteca-modal");
const fecharBibliotecaBtn = document.getElementById("fechar-biblioteca-btn");

// --- Seletores do Filtro de Dimensão ---
const dimensaoFiltrosContainer = document.getElementById("dimensao-filtros");
let currentDimensaoFilter = "todos";

// --- Seletores do HUD do Jogador ---
const playerHUD = document.getElementById("player-hud");
const hudJogadorImg = document.getElementById("hud-jogador-img");
const hudClasseNome = document.getElementById("hud-classe-nome");
const hudJogadorNome = document.getElementById("hud-jogador-nome");
const hudAfinidadeDesc = document.getElementById("hud-afinidade-desc");

// --- Seletores de Salvar/Controlo ---
const saveGameBtn = document.getElementById("save-game-btn");
const avancarFaseBtn = document.getElementById("avancar-fase-btn");
const resolverTurnoBtn = document.getElementById("resolver-turno-btn");

// --- Seletores de Tema (Light/Dark Mode) ---
const themeToggleBtnGame = document.getElementById("theme-toggle-btn-game");
const THEME_KEY = "empreendedorismoGuruTheme";

// --- Seletores do Modal de Validação ---
const validacaoModal = document.getElementById("validacao-modal");
const validacaoStartupNome = document.getElementById("validacao-startup-nome");
const validacaoAcaoNome = document.getElementById("validacao-acao-nome");
const validacaoJustificativa = document.getElementById(
    "validacao-justificativa"
);
const validacaoBtnAprovar = document.getElementById("validacao-btn-aprovar");
const validacaoBtnRecusar = document.getElementById("validacao-btn-recusar");

// --- Seletores das ABAS ---
const sidebarTabs = document.querySelector(".sidebar-tabs");

const CHART_INSTANCES = {};

// --- Função de Áudio ---
function playAudio(soundId) {
    try {
        const audio = document.getElementById(soundId);
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    } catch (e) {
        console.warn(e);
    }
}

// --- Funções de Tema (Light/Dark Mode) ---
function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-mode", isLight);
    const icon = isLight ? "☀️" : "🌙";
    themeToggleBtnGame.innerText = icon;
    localStorage.setItem(THEME_KEY, theme);
    if (
        gameBoardDiv.classList.contains("hidden") === false &&
        startups.length > 0
    ) {
        startups.forEach((s) => renderRadarChart(s));
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

function addLogMessage(message, tipo = "log-normal") {
    if (!message) return;
    const li = document.createElement("li");
    li.textContent = message;
    li.className = tipo;
    logList.prepend(li);
}

// --- Funções de Renderização (UI) ---

function updateUI() {
    if (!startups || startups.length === 0) return;
    renderStartupCards();
    updateTurnoInfo();
    renderAcoes();
    updateMestreControls();
    renderFilaValidacao();
}

function renderStartupCards() {
    startupCardsContainer.innerHTML = "";
    startups.forEach((startup, index) => {
        const card = document.createElement("div");
        card.className = "startup-card";
        if (startup.esta_eliminada) card.classList.add("eliminada");

        const submissao = submissoesPendentes[startup.nome];
        let statusTurno = "";

        // *** MELHORIA FEEDBACK (Início) ***
        // Lógica de status aprimorada
        if (faseAtual === "RESOLUCAO") {
             statusTurno = "<span class='status-info'>Turno Resolvido</span>";
        } else if (submissao) {
            if (faseAtual === "COLETIVA") {
                if (submissao.coletiva) {
                    statusTurno = "<span class='status-aprovado'>✔️ Ação Coletiva Aprovada</span>";
                } else {
                    statusTurno = "<span class='status-pendente'>Aguardando Ação Coletiva...</span>";
                }
            } else if (faseAtual === "INDIVIDUAL") {
                if (submissao.individual) {
                    statusTurno = "<span class='status-aprovado'>✔️ Ação Individual Aprovada</span>";
                } else {
                    // Se a coletiva foi feita, mas a individual não
                    statusTurno = "<span class='status-pendente'>Aguardando Ação Individual...</span>";
                }
            }
        } else {
             // Caso de segurança (se 'submissao' for nulo)
             statusTurno = "<span class='status-pendente'>Aguardando Ação...</span>";
        }
        // *** MELHORIA FEEDBACK (Fim) ***

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
            <p class="status-container">${statusTurno}</p> <p><strong>Ideia:</strong> ${startup.ideia_negocio}</p>
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

function updateTurnoInfo() {
    if (!faseAtual) return;
    currentPhaseNameSpan.innerText = faseAtual.replace("_", " ");
    hidePlayerHUD();
}

function renderAcoes() {
    acoesDisponiveisDiv.innerHTML = "";
    if (!startups.length > 0 || !acoesDisponiveis) return;

    const filtro = currentDimensaoFilter;
    const isIndividualPhase = faseAtual === "INDIVIDUAL";
    let afinidade = null;
    let classeCss = null;

    if (isIndividualPhase && !playerHUD.classList.contains("hidden")) {
        const hudClass = playerHUD.className
            .split(" ")
            .find((c) => c.startsWith("classe-"));
        if (hudClass) {
            classeCss = hudClass;
            if (hudClass === "classe-lider") afinidade = "equipe";
            if (hudClass === "classe-visionario") afinidade = "produto";
            if (hudClass === "classe-desbravador") afinidade = "mercado";
            if (hudClass === "classe-estrategista")
                afinidade = "competitividade";
            if (hudClass === "classe-guardiao") afinidade = "recursos";
        }
    }

    for (const [dimensao, acoes] of Object.entries(acoesDisponiveis)) {
        if (filtro !== "todos" && dimensao !== filtro) continue;
        const dimensaoHeader = document.createElement("h5");
        dimensaoHeader.innerText = dimensao.toUpperCase();
        if (isIndividualPhase && afinidade) {
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
            btn.disabled = true;

            const feitaPorAlguem = startups.some((s) =>
                s.acoes_realizadas.includes(acao.nome)
            );
            if (feitaPorAlguem) {
                btn.classList.add("acao-realizada");
            }

            if (isIndividualPhase && afinidade) {
                if (dimensao !== afinidade)
                    btn.classList.add("disabled-by-affinity");
                else btn.classList.add("highlighted-by-affinity", classeCss);
            }

            acoesDisponiveisDiv.appendChild(btn);
        });
    }
}

function updateMestreControls() {
    if (!startups.length || !submissoesPendentes) return;

    const startupsAtivas = startups.filter((s) => !s.esta_eliminada);
    let todasColetivasFeitas = true;
    let todasIndividuaisFeitas = true;

    for (const startup of startupsAtivas) {
        if (
            !submissoesPendentes[startup.nome] ||
            !submissoesPendentes[startup.nome].coletiva
        ) {
            todasColetivasFeitas = false;
        }
        if (
            !submissoesPendentes[startup.nome] ||
            !submissoesPendentes[startup.nome].individual
        ) {
            todasIndividuaisFeitas = false;
        }
    }

    const filaVazia = filaValidacao.length === 0;

    if (faseAtual === "COLETIVA") {
        avancarFaseBtn.classList.toggle(
            "hidden",
            !(todasColetivasFeitas && filaVazia)
        );
        resolverTurnoBtn.classList.add("hidden");
        avancarFaseBtn.innerText = "Iniciar Fase Individual";
    } else if (faseAtual === "INDIVIDUAL") {
        avancarFaseBtn.classList.add("hidden");
        resolverTurnoBtn.classList.toggle(
            "hidden",
            !(todasIndividuaisFeitas && filaVazia)
        );
    } else if (faseAtual === "RESOLUCAO") { 
        resolverTurnoBtn.classList.add("hidden");
        avancarFaseBtn.classList.remove("hidden"); 
        avancarFaseBtn.innerText = "Iniciar Próximo Turno"; 
    } else { 
        avancarFaseBtn.classList.add("hidden");
        resolverTurnoBtn.classList.add("hidden");
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

// --- Lógica de Validação e Turno (Socket.IO) ---

function mostrarModalDeValidacao(acaoData) {
    if (!acaoData) return;

    dadosAcaoPendente = acaoData; 

    validacaoStartupNome.innerText = dadosAcaoPendente.nome_startup;
    validacaoAcaoNome.innerText = dadosAcaoPendente.acao_nome;
    validacaoJustificativa.innerText = dadosAcaoPendente.justificativa;
    validacaoModal.classList.remove("hidden");
    playAudio("audio-virar-carta");

    const startup = startups.find(
        (s) => s.nome === dadosAcaoPendente.nome_startup
    );
    if (startup) {
        const jogador = startup.jogadores.find(
            (j) => j.nome === dadosAcaoPendente.jogador_nome
        );
        if (jogador) updatePlayerHUD(jogador);
    }
}

function renderFilaValidacao() {
    if (!validacaoFilaList) return;

    validacaoFilaList.innerHTML = ""; 

    if (filaValidacao.length === 0) {
        validacaoFilaList.innerHTML = '<li class="fila-item-vazia">Nenhuma ação para validar.</li>';
        return;
    }

    filaValidacao.forEach((acao, index) => {
        const li = document.createElement("li");
        li.className = "fila-item";
        li.innerHTML = `
            <strong>${acao.nome_startup}</strong>
            <div class="tipo-acao">${acao.tipo_acao === 'coletiva' ? 'Ação Coletiva' : 'Ação Individual'}</div>
            <span>${acao.acao_nome}</span>
        `;
        li.setAttribute('data-acao-id', acao.id_unico_acao); 

        li.onclick = (e) => {
            const id_unico = e.currentTarget.getAttribute('data-acao-id');
            const acaoParaValidar = filaValidacao.find(item => item.id_unico_acao === id_unico);
            filaValidacao = filaValidacao.filter(item => item.id_unico_acao !== id_unico);

            if (acaoParaValidar) {
                mostrarModalDeValidacao(acaoParaValidar);
            }
            renderFilaValidacao(); 
        };
        validacaoFilaList.appendChild(li);
    });
}

function handleValidacao(aprovada) {
    if (!dadosAcaoPendente) return;

    playAudio("audio-clique");

    socket.emit("validar_acao", {
        id_sala: idSala,
        acao_data: dadosAcaoPendente,
        aprovada: aprovada,
    });

    validacaoModal.classList.add("hidden");
    dadosAcaoPendente = null;
    hidePlayerHUD();
}

// --- Funções de Modais e HUD (Helpers) ---
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
}
function hideEventoModal() {
    eventoModal.classList.add("hidden");
    eventoCard.classList.remove("is-flipped");
}
function showFimDeJogo(nomeVencedor) {
    playAudio("audio-vitoria");
    vencedorNome.innerText = `A startup "${nomeVencedor}" venceu!`;
    fimDeJogoModal.classList.remove("hidden");
    gameBoardDiv.classList.add("hidden");
    hidePlayerHUD();
    localStorage.removeItem(SAVE_KEY);
}
function normalizeClassName(className) {
    return className
        .toLowerCase()
        .replace("í", "i")
        .replace("ã", "a")
        .replace("á", "a");
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
function saveGame() {
    playAudio("audio-clique");
    alert("Função 'Salvar Jogo' ainda não implementada no modo de servidor.");
}

// --- LÓGICA DAS ABAS (TABS) ---
function setupSidebarTabs() {
    sidebarTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.sidebar-tab-btn');
        if (!btn) return;

        playAudio('audio-clique');

        const tabId = btn.dataset.tab; // "acoes", "fila", ou "log"

        document.querySelectorAll('.sidebar-tab-btn').forEach(b => {
            b.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-panel').forEach(p => {
            p.classList.remove('active');
        });

        btn.classList.add('active');
        
        if (tabId === 'acoes') {
            document.getElementById('acoes-panel').classList.add('active');
        } else if (tabId === 'fila') {
            document.getElementById('fila-panel').classList.add('active');
        } else if (tabId === 'log') {
            document.getElementById('log-panel').classList.add('active');
        }
    });
}


// --- LÓGICA PRINCIPAL DO MESTRE ---

// 1. Listeners do Socket.IO (Ouvindo o Servidor)
socket.on("connect", () => {
    console.log("Mestre conectado ao servidor.");
    
    setupSidebarTabs();

    const urlParams = new URLSearchParams(window.location.search);
    idSala = urlParams.get("sala");
    if (idSala) {
        socket.emit("entrar_sala_mestre", { id_sala: idSala });
    } else {
        alert("Erro: ID da Sala não encontrado. A voltar para o início.");
        window.location.href = "/";
    }
});

socket.on("atualizar_estado", (gameState) => {
    console.log("Estado do jogo recebido:", gameState);
    startups = gameState.startups;
    faseAtual = gameState.fase_atual;
    submissoesPendentes = gameState.submissoes_pendentes;

    if (
        gameState.acoesDisponiveis &&
        (!acoesDisponiveis || Object.keys(acoesDisponiveis).length === 0)
    ) {
        acoesDisponiveis = gameState.acoesDisponiveis;
        setupFiltrosDimensao();
    }

    updateUI();
});

socket.on('fila_validacao_atual', (data) => {
    console.log("Recebida fila de validação completa do servidor:", data.fila);
    filaValidacao = data.fila; 
    renderFilaValidacao();
});

socket.on("acao_submetida", (data) => {
    console.log("Ação submetida recebida, adicionando à fila:", data);

    const jaExiste = filaValidacao.some(item => item.id_unico_acao === data.id_unico_acao);
    if (!jaExiste) {
        filaValidacao.push(data);
        renderFilaValidacao();
    }
});

socket.on("log_mensagem", (data) => {
    addLogMessage(data.mensagem, data.tipo);
});

socket.on("evento_subir_de_nivel", (evento) => {
    console.log("Disparando evento de subir de nível para o Mestre:", evento);
    showEventoModal(evento);
});

socket.on("jogo_terminou", (vencedor) => {
    console.log("O jogo terminou! Vencedor:", vencedor);
    showFimDeJogo(vencedor);
});

socket.on("jogo_nao_encontrado", () => {
    alert("ERRO: O jogo desta sala não foi encontrado no servidor.");
    window.location.href = "/";
});

socket.on("erro_jogo", (data) => {
    alert(`Erro do Servidor: ${data.mensagem}`);
});

// 2. Listeners de UI (Botões)
saveGameBtn.addEventListener("click", saveGame);
themeToggleBtnGame.addEventListener("click", toggleTheme);

avancarFaseBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    socket.emit("mestre_avancar_fase", { id_sala: idSala });
});
resolverTurnoBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    socket.emit("mestre_resolver_turno", { id_sala: idSala });
});

validacaoBtnAprovar.addEventListener("click", () => handleValidacao(true));
validacaoBtnRecusar.addEventListener("click", () => handleValidacao(false));
validacaoModal.addEventListener("click", (e) => {
    if (e.target === validacaoModal) {
        validacaoModal.classList.add("hidden");
        if (dadosAcaoPendente) {
             filaValidacao.unshift(dadosAcaoPendente); 
             dadosAcaoPendente = null;
             renderFilaValidacao();
        }
        hidePlayerHUD();
    }
});

// Modais de Ajuda (Biblioteca e Flip)
fecharBibliotecaBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    hideBibliotecaModal();
});
bibliotecaModal.addEventListener("click", (e) => {
    if (e.target === bibliotecaModal) hideBibliotecaModal();
});
classeCard.addEventListener("click", () => {
    playAudio("audio-virar-carta");
    classeCard.classList.toggle("is-flipped");
});
classeModal.addEventListener("click", (e) => {
    if (e.target === classeModal) hideClasseModal();
});
eventoCard.addEventListener("click", () => {
    playAudio("audio-virar-carta");
    eventoCard.classList.toggle("is-flipped");
});
eventoModal.addEventListener("click", (e) => {
    if (e.target === eventoModal) hideEventoModal();
});
jogarNovamenteBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    window.location.href = "/";
});
console.log("Anexando listener de delegação ao startupCardsContainer.");
startupCardsContainer.addEventListener("click", (e) => {
    const playerLi = e.target.closest(".player-name");
    if (playerLi) {
        const jogadorInfo = playerLi.dataset;
        showClasseModal(jogadorInfo);
    }
});

// --- Inicialização ---
loadInitialTheme();
// (setupFiltrosDimensao é chamado pelo 'atualizar_estado')