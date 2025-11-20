let idSala = "";
let startups = [];
let acoesDisponiveis = {};
let faseAtual = "COLETIVA";
let submissoesPendentes = {};
let filaValidacao = [];
let dadosAcaoPendente = null;
let connectionStatus = new Set(); 
const socket = io();

const gameBoardDiv = document.getElementById("game-board");
const startupCardsContainer = document.getElementById(
    "startup-cards-container"
);
const currentPhaseNameSpan = document.getElementById("current-phase-name");
const acoesDisponiveisDiv = document.getElementById("acoes-disponiveis");
const logList = document.getElementById("log-list");
const validacaoFilaList = document.getElementById("validacao-fila-list");

const marketConditionDisplay = document.getElementById("market-condition-display");
const marketConditionName = document.getElementById("market-condition-name");
const marketConditionDesc = document.getElementById("market-condition-desc");

const dimensaoFiltrosContainer = document.getElementById("dimensao-filtros");
let currentDimensaoFilter = "todos";

const playerHUD = document.getElementById("player-hud");

const saveGameBtn = document.getElementById("save-game-btn");
const avancarFaseBtn = document.getElementById("avancar-fase-btn");
const resolverTurnoBtn = document.getElementById("resolver-turno-btn");
const themeToggleBtnGame = document.getElementById("theme-toggle-btn-game");

const validacaoModal = document.getElementById("validacao-modal");
const validacaoBtnAprovar = document.getElementById("validacao-btn-aprovar");
const validacaoBtnRecusar = document.getElementById("validacao-btn-recusar");

const sidebarTabs = document.querySelector(".sidebar-tabs");

const CHART_INSTANCES = {};


function addLogMessage(message, tipo = "log-normal") {
    if (!message || !logList) return;
    const li = document.createElement("li");
    li.textContent = message;
    li.className = tipo;
    logList.prepend(li);
}

function renderCondicaoMercado(condicao) {
    if (!marketConditionDisplay) return; 
    if (!condicao || condicao.id === 'c1') {
        marketConditionDisplay.classList.add('hidden');
    } else {
        marketConditionName.innerText = `Condição de Mercado: ${condicao.nome}`;
        marketConditionDesc.innerText = condicao.descricao;
        marketConditionDisplay.classList.remove('hidden');
    }
}

function updateUI() {
    if (!startups || startups.length === 0) return;
    renderStartupCards();
    updateTurnoInfo();
    renderAcoes();
    updateMestreControls();
    renderFilaValidacao();
}

function renderStartupCards() {
    if (!startupCardsContainer) return;
    startupCardsContainer.innerHTML = "";
    startups.forEach((startup) => {
        const card = document.createElement("div");
        card.className = "startup-card";
        if (startup.esta_eliminada) card.classList.add("eliminada");

        const isConnected = connectionStatus.has(startup.nome);
        const statusIndicator = isConnected
            ? '<span class="status-icon online" title="Online">🟢</span>'
            : '<span class="status-icon offline" title="Offline">🔴</span>';

        const submissao = submissoesPendentes[startup.nome];
        let statusTurno = "";

        if (faseAtual === "RESOLUCAO") {
             statusTurno = "<span class='status-info'>Turno Resolvido</span>";
        } else if (submissao) {
            if (faseAtual === "INDIVIDUAL" && submissao.habilidade) {
                statusTurno = "<span class='status-aprovado'>✔️ Habilidade Aprovada</span>";
            } else if (faseAtual === "INDIVIDUAL" && submissao.individual) {
                statusTurno = "<span class='status-aprovado'>✔️ Ação Individual Aprovada</span>";
            } else if (faseAtual === "COLETIVA" && submissao.coletiva) {
                statusTurno = "<span class='status-aprovado'>✔️ Ação Coletiva Aprovada</span>";
            } else if (faseAtual === "INDIVIDUAL" && !submissao.individual) {
                statusTurno = "<span class='status-pendente'>Aguardando Ação Individual...</span>";
            } else if (faseAtual === "COLETIVA" && !submissao.coletiva) {
                 statusTurno = "<span class='status-pendente'>Aguardando Ação...</span>";
            }
        } else {
             statusTurno = "<span class='status-pendente'>Aguardando Ação...</span>";
        }

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
                        <h3>${statusIndicator} ${startup.nome} (Nível: ${startup.nivel})</h3>
            <p class="status-container">${statusTurno}</p>
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

function updateTurnoInfo() {
    if (!faseAtual || !currentPhaseNameSpan) return;
    currentPhaseNameSpan.innerText = faseAtual.replace("_", " ");
    hidePlayerHUD();
}

function renderAcoes() {
    if (!acoesDisponiveisDiv) return;
    acoesDisponiveisDiv.innerHTML = "";
    if (!startups.length > 0 || !acoesDisponiveis) return;

    const filtro = currentDimensaoFilter;
    const isIndividualPhase = faseAtual === "INDIVIDUAL";
    let afinidade = null;
    let classeCss = null;

    if (isIndividualPhase && playerHUD && !playerHUD.classList.contains("hidden")) {
        const hudClass = playerHUD.className
            .split(" ")
            .find((c) => c.startsWith("classe-"));
        if (hudClass) {
            classeCss = hudClass;
            if (hudClass === "classe-lider") afinidade = "equipe";
            if (hudClass === "classe-visionario") afinidade = "produto";
            if (hudClass === "classe-desbravador") afinidade = "mercado";
            if (hudClass === "classe-estrategista") afinidade = "competitividade";
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
    if (!startups.length || !submissoesPendentes || !avancarFaseBtn || !resolverTurnoBtn) return;

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
            (!submissoesPendentes[startup.nome].individual && !submissoesPendentes[startup.nome].habilidade) 
        ) {
            todasIndividuaisFeitas = false;
        }
    }

    const filaVazia = filaValidacao.length === 0;

    if (faseAtual === "COLETIVA") {
        avancarFaseBtn.classList.toggle("hidden", !(todasColetivasFeitas && filaVazia));
        resolverTurnoBtn.classList.add("hidden");
        avancarFaseBtn.innerText = "Iniciar Fase Individual";
    } else if (faseAtual === "INDIVIDUAL") {
        avancarFaseBtn.classList.add("hidden");
        resolverTurnoBtn.classList.toggle("hidden", !(todasIndividuaisFeitas && filaVazia));
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
    if (!dimensaoFiltrosContainer) return;
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


function mostrarModalDeValidacao(acaoData) {
    if (!acaoData || !validacaoModal) return;

    dadosAcaoPendente = acaoData;

    document.getElementById("validacao-startup-nome").innerText = acaoData.nome_startup || "N/A";
    document.getElementById("validacao-acao-nome").innerText = acaoData.acao_nome || "N/A";
    document.getElementById("validacao-justificativa").innerText = acaoData.justificativa || "N/A";
    
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
            <div class="tipo-acao">${acao.tipo_acao === 'coletiva' ? 'Ação Coletiva' : (acao.tipo_acao === 'habilidade' ? 'Habilidade' : 'Ação Individual')}</div>
            <span>${acao.acao_nome}</span>
        `;
        li.setAttribute('data-acao-id', acao.id_unico_acao);

        li.onclick = (e) => {
            const id_unico = e.currentTarget.getAttribute('data-acao-id');
            const acaoParaValidar = filaValidacao.find(item => item.id_unico_acao === id_unico);
            filaValidacao = filaValidacao.filter(item => item.id_unico_acao !== id_unico);
            renderFilaValidacao();

            if (acaoParaValidar) {
                mostrarModalDeValidacao(acaoParaValidar);
            }
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

    if (validacaoModal) {
        validacaoModal.classList.add("hidden");
    }
    dadosAcaoPendente = null;
    hidePlayerHUD();
}
function updatePlayerHUD(jogador) {
    if (!jogador || !playerHUD) {
        hidePlayerHUD();
        return;
    }
    const classeLimpa = normalizeClassName(jogador.classe);
    const imgPath = `/css/img/portraits/${classeLimpa}.png`;
    document.getElementById("hud-jogador-img").src = imgPath;
    playerHUD.className = "";
    const classeCor = `classe-${classeLimpa}`;
    playerHUD.classList.add(classeCor);
    document.getElementById("hud-classe-nome").innerText = jogador.classe;
    document.getElementById("hud-jogador-nome").innerText = jogador.nome;
    const afinidade = jogador.dimensao_afinidade;
    const afinidadeCapitalizada =
        afinidade.charAt(0).toUpperCase() + afinidade.slice(1);
    document.getElementById("hud-afinidade-desc").innerText = `Afinidade: ${afinidadeCapitalizada}`;
    playerHUD.classList.remove("hidden");
}

function hidePlayerHUD() {
    if (playerHUD) {
        playerHUD.classList.add("hidden");
        const img = document.getElementById("hud-jogador-img");
        if (img) img.src = "";
    }
}

function saveGame() {
    playAudio("audio-clique");
    showPopup('Info', 'Função \'Salvar Jogo\' ainda não implementada no modo de servidor.', 'info');
}

function setupSidebarTabs() {
    if (!sidebarTabs) return;
    sidebarTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.sidebar-tab-btn');
        if (!btn) return;

        playAudio('audio-clique');

        const tabId = btn.dataset.tab; 

        document.querySelectorAll('.sidebar-tab-btn').forEach(b => {
            b.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-panel').forEach(p => {
            p.classList.remove('active');
        });

        btn.classList.add('active');
        
        const acoesPanel = document.getElementById('acoes-panel');
        const filaPanel = document.getElementById('fila-panel');
        const logPanel = document.getElementById('log-panel');

        if (tabId === 'acoes' && acoesPanel) {
            acoesPanel.classList.add('active');
        } else if (tabId === 'fila' && filaPanel) {
            filaPanel.classList.add('active');
        } else if (tabId === 'log' && logPanel) {
            logPanel.classList.add('active');
        }
    });
}

socket.on("connect", () => {
    console.log("Mestre conectado ao servidor.");
    
    setupSidebarTabs(); 

    const urlParams = new URLSearchParams(window.location.search);
    idSala = urlParams.get("sala");
    if (idSala) {
        socket.emit("entrar_sala_mestre", { id_sala: idSala });
    } else {
        showPopup('Erro', 'Erro: ID da Sala não encontrado. A voltar para o início.', 'erro'); // Função global
        setTimeout(() => window.location.href = "/", 2000);
    }
});

socket.on("atualizar_estado", (gameState) => {
    console.log("Estado do jogo recebido:", gameState);
    startups = gameState.startups;
    faseAtual = gameState.fase_atual;
    submissoesPendentes = gameState.submissoes_pendentes;

    renderCondicaoMercado(gameState.condicao_mercado_atual);

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

socket.on('status_lobby_atual', (data) => {
    console.log("Recebido status de conexão inicial:", data.jogadores_conectados);
    connectionStatus = new Set(data.jogadores_conectados);
    if (startups.length > 0) {
        renderStartupCards();
    }
});

socket.on('jogador_conectou', (data) => {
    console.log("Jogador conectou:", data.nome_startup);
    connectionStatus.add(data.nome_startup);
    if (startups.length > 0) {
        renderStartupCards();
    }
});

socket.on('jogador_desconectou', (data) => {
    console.log("Jogador desconectou:", data.nome_startup);
    connectionStatus.delete(data.nome_startup);
    if (startups.length > 0) {
        renderStartupCards();
    }
});

socket.on("jogo_terminou", (vencedor) => {
    console.log("O jogo terminou! Vencedor:", vencedor);
    showFimDeJogo(vencedor);
});

socket.on("jogo_nao_encontrado", () => {
    showPopup('Erro de Conexão', 'ERRO: O jogo desta sala não foi encontrado no servidor.', 'erro'); 
    setTimeout(() => window.location.href = "/", 2000);
});

socket.on("erro_jogo", (data) => {
    showPopup('Erro do Servidor', data.mensagem, 'erro');
});

if (saveGameBtn) saveGameBtn.addEventListener("click", saveGame);
if (themeToggleBtnGame) themeToggleBtnGame.addEventListener("click", toggleTheme);

if (avancarFaseBtn) {
    avancarFaseBtn.addEventListener("click", () => {
        playAudio("audio-clique");
        socket.emit("mestre_avancar_fase", { id_sala: idSala });
    });
}
if (resolverTurnoBtn) {
    resolverTurnoBtn.addEventListener("click", () => {
        playAudio("audio-clique");
        socket.emit("mestre_resolver_turno", { id_sala: idSala });
    });
}

if (validacaoBtnAprovar) validacaoBtnAprovar.addEventListener("click", () => handleValidacao(true));
if (validacaoBtnRecusar) validacaoBtnRecusar.addEventListener("click", () => handleValidacao(false));

if (validacaoModal) {
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
}

if (startupCardsContainer) {
    startupCardsContainer.addEventListener("click", (e) => {
        const playerLi = e.target.closest(".player-name");
        if (playerLi) {
            const jogadorInfo = playerLi.dataset;
            showClasseModal(jogadorInfo);
        }
    });
}

loadInitialTheme();