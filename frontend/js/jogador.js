// --- ESTADO GLOBAL DO JOGADOR ---
let meuNomeStartup = "";
let idSala = "";
let acaoSelecionada = null; // Guarda {id, nome, dimensao, tipo_acao, jogador_nome}
let jogadorSelecionado = null; // Guarda o OBJETO do jogador selecionado
let estadoJogoAtual = {}; // O estado completo vindo do servidor
let acoesSubmetidasLocal = { coletiva: false, individual: false };

// --- Conexão Socket.IO ---
const socket = io();

// --- Seletores do Jogo ---
const gameBoardDiv = document.getElementById("game-board");
const startupCardsContainer = document.getElementById(
    "startup-cards-container"
);
const currentStartupNameSpan = document.getElementById("current-startup-name");
const playerTurnSelectorDiv = document.getElementById("player-turn-selector");
const acoesDisponiveisDiv = document.getElementById("acoes-disponiveis");
const turnoInfoBox = document.getElementById("turno-info");
const actionSelectionArea = document.getElementById("action-selection-area");

// --- Seletores de Submissão ---
const justificativaContainer = document.getElementById(
    "justificativa-container"
);
const justificativaTextarea = document.getElementById("acao-justificativa");
const submitAcaoBtn = document.getElementById("submit-acao-btn");

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

// --- Seletores do Filtro e HUD ---
const dimensaoFiltrosContainer = document.getElementById("dimensao-filtros");
let currentDimensaoFilter = "todos";
const playerHUD = document.getElementById("player-hud");
const hudJogadorImg = document.getElementById("hud-jogador-img");
const hudClasseNome = document.getElementById("hud-classe-nome");
const hudJogadorNome = document.getElementById("hud-jogador-nome");
const hudAfinidadeDesc = document.getElementById("hud-afinidade-desc");

// --- Seletores de Tema ---
const themeToggleBtnGame = document.getElementById("theme-toggle-btn-game");
const THEME_KEY = "empreendedorismoGuruTheme";

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

// --- Funções de Tema (Copiadas) ---
function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-mode", isLight);
    const icon = isLight ? "☀️" : "🌙";
    themeToggleBtnGame.innerText = icon;
    localStorage.setItem(THEME_KEY, theme);
    if (Object.keys(CHART_INSTANCES).length > 0 && estadoJogoAtual.startups) {
        // *** MELHORIA FEEDBACK (Início) ***
        // Chama a nova função para redesenhar TODOS os cards
        renderTodosOsCards(estadoJogoAtual.startups, estadoJogoAtual.fase_atual, estadoJogoAtual.submissoes_pendentes);
        // *** MELHORIA FEEDBACK (Fim) ***
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

// --- Funções de Renderização (Adaptadas para o Jogador) ---

// *** MELHORIA FEEDBACK (Início) ***
// Função "renderMeuCard" foi substituída por "renderTodosOsCards"
function renderTodosOsCards(startups, faseAtual, submissoesPendentes) {
    if (!startups || startups.length === 0) return;
    startupCardsContainer.innerHTML = ""; // Limpa

    startups.forEach(startup => {
        const card = document.createElement("div");
        card.className = "startup-card";
        
        // Adiciona classes de destaque
        if (startup.nome === meuNomeStartup) {
            card.classList.add("meu-card");
        } else {
            card.classList.add("card-oponente");
        }
        
        if (startup.esta_eliminada) card.classList.add("eliminada");

        // Lógica de Status (copiada do mestre.js)
        const submissao = submissoesPendentes[startup.nome];
        let statusTurno = "";

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
                    statusTurno = "<span class='status-pendente'>Aguardando Ação Individual...</span>";
                }
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
        renderRadarChart(startup); // Reutiliza a função de gráfico
    });
}
// *** MELHORIA FEEDBACK (Fim) ***

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

function updateTurnoInfo(minhaStartup, faseAtual, minhaSubmissao) {
    currentStartupNameSpan.innerText = minhaStartup.nome;
    justificativaContainer.classList.add("hidden");
    submitAcaoBtn.classList.add("hidden");
    justificativaTextarea.value = "";
    acaoSelecionada = null;
    jogadorSelecionado = null;

    if (faseAtual === "COLETIVA") {
        turnoInfoBox.style.borderColor = "var(--cor-guardiao)"; 
        playerTurnSelectorDiv.innerHTML =
            "<strong>Selecione a Ação Coletiva</strong>";
        hidePlayerHUD();
        if (minhaSubmissao.coletiva) {
            desabilitarControles(
                "Ação Coletiva submetida. Aguardando Mestre..."
            );
        } else {
            habilitarControles(); 
        }
    } else if (faseAtual === "INDIVIDUAL") {
        turnoInfoBox.style.borderColor = "var(--cor-guardiao)"; 
        playerTurnSelectorDiv.innerHTML =
            "<strong>Selecione o Jogador para a Ação Individual:</strong>";
        hidePlayerHUD();

        if (minhaSubmissao.individual) {
            desabilitarControles(
                "Ação Individual submetida. Aguardando Mestre..."
            );
        } else {
            habilitarControles(); 
            minhaStartup.jogadores.forEach((jogador) => {
                const btn = document.createElement("button");
                btn.innerText = jogador.nome;
                btn.disabled = false;
                btn.onclick = () => {
                    playAudio("audio-clique");
                    jogadorSelecionado = jogador; 
                    updatePlayerHUD(jogador);

                    document
                        .querySelectorAll("#player-turn-selector button")
                        .forEach((b) => (b.disabled = true));
                    btn.disabled = false;

                    renderAcoes(minhaStartup, faseAtual, minhaSubmissao);
                };
                playerTurnSelectorDiv.appendChild(btn);
            });
        }
    } else if (faseAtual === "RESOLUCAO") {
        turnoInfoBox.style.borderColor = "var(--cor-cinza)";
        playerTurnSelectorDiv.innerHTML = "";
        hidePlayerHUD();
        desabilitarControles("Resolvendo o turno... Aguarde.");
    }
}

function renderAcoes(minhaStartup, faseAtual, minhaSubmissao) {
    acoesDisponiveisDiv.innerHTML = "";
    if (!minhaStartup || !estadoJogoAtual.acoesDisponiveis) return;

    const acoesFeitasPelaStartup = minhaStartup.acoes_realizadas;
    const filtro = currentDimensaoFilter;

    let afinidade = null;
    let classeCss = null;

    if (faseAtual === "INDIVIDUAL" && jogadorSelecionado) {
        afinidade = jogadorSelecionado.dimensao_afinidade;
        classeCss = `classe-${normalizeClassName(jogadorSelecionado.classe)}`;
    }

    for (const [dimensao, acoes] of Object.entries(
        estadoJogoAtual.acoesDisponiveis
    )) {
        if (filtro !== "todos" && dimensao !== filtro) continue;
        const dimensaoHeader = document.createElement("h5");
        dimensaoHeader.innerText = dimensao.toUpperCase();

        if (faseAtual === "INDIVIDUAL" && jogadorSelecionado) {
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
            btn.onclick = () => selecionarAcao(acao, dimensao, btn);

            let desabilitar = false;

            if (acoesFeitasPelaStartup.includes(acao.nome)) {
                btn.classList.add("acao-realizada");
                desabilitar = true;
            } else if (faseAtual === "RESOLUCAO") {
                desabilitar = true;
            } else if (faseAtual === "COLETIVA" && minhaSubmissao.coletiva) {
                desabilitar = true;
            } else if (
                faseAtual === "INDIVIDUAL" &&
                minhaSubmissao.individual
            ) {
                desabilitar = true;
            } else if (faseAtual === "INDIVIDUAL" && !jogadorSelecionado) {
                btn.classList.add("disabled-by-affinity");
                desabilitar = true;
            } else if (
                faseAtual === "INDIVIDUAL" &&
                jogadorSelecionado &&
                dimensao !== afinidade
            ) {
                btn.classList.add("disabled-by-affinity");
                desabilitar = true;
            }

            btn.disabled = desabilitar;

            if (
                !desabilitar &&
                faseAtual === "INDIVIDUAL" &&
                jogadorSelecionado &&
                dimensao === afinidade
            ) {
                btn.classList.add("highlighted-by-affinity", classeCss);
            }

            acoesDisponiveisDiv.appendChild(btn);
        });
    }
}

function selecionarAcao(acao, dimensao, btn) {
    playAudio("audio-clique");

    const faseAtual = estadoJogoAtual.fase_atual;
    let tipoAcao, nomeJogador;

    if (faseAtual === "COLETIVA") {
        tipoAcao = "coletiva";
        nomeJogador = "Equipa"; 
    } else if (faseAtual === "INDIVIDUAL") {
        tipoAcao = "individual";
        if (!jogadorSelecionado) {
            alert(
                "Por favor, selecione primeiro o jogador que fará a ação individual."
            );
            return;
        }
        nomeJogador = jogadorSelecionado.nome;
    } else {
        return; 
    }

    document.querySelectorAll(".acao-button.selected").forEach((b) => {
        b.classList.remove("selected");
    });
    btn.classList.add("selected");

    acaoSelecionada = {
        id: acao.id,
        nome: acao.nome,
        dimensao: dimensao,
        tipo_acao: tipoAcao,
        jogador_nome: nomeJogador,
    };

    justificativaContainer.classList.remove("hidden");
    submitAcaoBtn.classList.remove("hidden");
    justificativaTextarea.value = "";
    justificativaTextarea.focus();
}

function submeterAcao() {
    playAudio("audio-clique");
    const justificativa = justificativaTextarea.value;

    if (!acaoSelecionada) {
        alert("Erro: Nenhuma ação foi selecionada.");
        return;
    }
    if (justificativa.trim().length < 5) {
        alert("Por favor, escreva uma breve justificativa para a sua ação.");
        justificativaTextarea.focus();
        return;
    }

    if (acaoSelecionada.tipo_acao === "coletiva") {
        acoesSubmetidasLocal.coletiva = true;
    } else {
        acoesSubmetidasLocal.individual = true;
    }

    socket.emit("submeter_acao", {
        id_sala: idSala,
        nome_startup: meuNomeStartup,
        acao_id: acaoSelecionada.id,
        acao_nome: acaoSelecionada.nome,
        dimensao: acaoSelecionada.dimensao,
        justificativa: justificativa,
        tipo_acao: acaoSelecionada.tipo_acao,
        jogador_nome: acaoSelecionada.jogador_nome,
    });

    desabilitarControles("Ação submetida! Aguardando aprovação do Mestre...");
}

// Funções para desabilitar/habilitar a UI
function desabilitarControles(mensagem) {
    if (turnoInfoBox) {
        turnoInfoBox.innerHTML = `<h2>${mensagem}</h2>`;
    }
    if (acoesDisponiveisDiv) {
        acoesDisponiveisDiv.querySelectorAll(".acao-button").forEach((btn) => {
            btn.disabled = true;
            btn.classList.add("disabled-by-affinity");
        });
    }
    if (justificativaContainer) justificativaContainer.classList.add("hidden");
    if (submitAcaoBtn) submitAcaoBtn.classList.add("hidden");
    if (playerTurnSelectorDiv) playerTurnSelectorDiv.innerHTML = "";
    hidePlayerHUD();
}

function habilitarControles() {
    console.log("Controlos habilitados.");
}

// --- Funções de Ajuda (Copiadas) ---
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

        const minhaStartup = estadoJogoAtual.startups.find(
            (s) => s.nome === meuNomeStartup
        );
        
        renderAcoes(
            minhaStartup,
            estadoJogoAtual.fase_atual,
            estadoJogoAtual.submissoes_pendentes[meuNomeStartup]
        );
    });
}
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
    if (e.target === classeModal) hideClasseModal();
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
    if (e.target === eventoModal) hideEventoModal();
});
function showFimDeJogo(nomeVencedor) {
    playAudio("audio-vitoria");
    vencedorNome.innerText = `A startup "${nomeVencedor}" venceu!`;
    fimDeJogoModal.classList.remove("hidden");
    gameBoardDiv.classList.add("hidden");
    hidePlayerHUD();
}
jogarNovamenteBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    window.location.href = "/";
});
function showBibliotecaModal() {
    playAudio("audio-virar-carta");
    bibliotecaModal.classList.remove("hidden");
}
function hideBibliotecaModal() {
    bibliotecaModal.classList.add("hidden");
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
// --- FIM DAS FUNÇÕES DE AJUDA ---

// --- LÓGICA PRINCIPAL DO JOGADOR ---

// 1. Ouvir por atualizações de estado do servidor
socket.on("atualizar_estado", (gameState) => {
    console.log("Estado do jogo recebido:", gameState);
    estadoJogoAtual = gameState; 

    if (
        gameState.acoesDisponiveis &&
        dimensaoFiltrosContainer.innerHTML.trim().length === 0 
    ) {
        setupFiltrosDimensao();
    }

    const minhaStartup = gameState.startups.find(
        (s) => s.nome === meuNomeStartup
    );
    if (!minhaStartup) {
        console.error("Não foi possível encontrar os dados desta startup.");
        return;
    }
    
    // *** MELHORIA FEEDBACK (Início) ***
    // Chama a nova função para renderizar TODOS os cards
    renderTodosOsCards(gameState.startups, gameState.fase_atual, gameState.submissoes_pendentes);
    // *** MELHORIA FEEDBACK (Fim) ***

    const faseAtual = gameState.fase_atual;
    const minhaSubmissao = gameState.submissoes_pendentes[meuNomeStartup];

    updateTurnoInfo(minhaStartup, faseAtual, minhaSubmissao);
    renderAcoes(minhaStartup, faseAtual, minhaSubmissao);

    if (
        faseAtual === "RESOLUCAO" ||
        (faseAtual === "COLETIVA" && minhaSubmissao.coletiva) ||
        (faseAtual === "INDIVIDUAL" && minhaSubmissao.individual)
    ) {
        // Se a minha startup foi eliminada, mostra uma mensagem diferente
        if (minhaStartup.esta_eliminada) {
            desabilitarControles("A sua startup foi eliminada.");
        } else {
            desabilitarControles("Aguardando o Mestre e outros jogadores...");
        }
    } else {
        habilitarControles();
    }
});

// 2. Ouvir por eventos específicos
socket.on("evento_subir_de_nivel", async (evento) => {
    console.log("Recebeu evento de subir de nível:", evento);
    await showEventoModal(evento);
});

// 3. Ouvir pelo fim do jogo
socket.on("jogo_terminou", (vencedor) => {
    console.log("O jogo terminou! Vencedor:", vencedor);
    showFimDeJogo(vencedor);
});

// 4. Ouvir por erros
socket.on("jogo_nao_encontrado", () => {
    alert("ERRO: O Mestre saiu ou a sala deste jogo não foi encontrada.");
    window.location.href = "/";
});

// 5. NOVO: Ouvir por ação recusada
socket.on("acao_recusada", (acaoRecusada) => {
    alert(
        `A sua ação "${acaoRecusada.acao_nome}" foi recusada pelo Mestre. Por favor, submeta novamente.`
    );
    if (acaoRecusada.tipo_acao === "coletiva") {
        acoesSubmetidasLocal.coletiva = false;
    } else {
        acoesSubmetidasLocal.individual = false;
    }
    socket.emit("jogador_pedir_estado", { id_sala: idSala });
});

// --- INICIALIZAÇÃO DO JOGADOR ---
function iniciarConexaoJogador() {
    loadInitialTheme();

    const urlParams = new URLSearchParams(window.location.search);
    idSala = urlParams.get("sala");
    meuNomeStartup = urlParams.get("startup");

    if (!idSala || !meuNomeStartup) {
        alert(
            "Erro: ID da Sala ou nome da Startup em falta. A voltar para o início."
        );
        window.location.href = "/";
        return;
    }

    socket.emit("entrar_sala_jogador", {
        id_sala: idSala,
        nome_startup: meuNomeStartup,
    });

    submitAcaoBtn.addEventListener("click", submeterAcao);
    themeToggleBtnGame.addEventListener("click", toggleTheme);

    // Listeners dos Modais
    fecharBibliotecaBtn.addEventListener("click", () => {
        playAudio("audio-clique");
        hideBibliotecaModal();
    });
    bibliotecaModal.addEventListener("click", (e) => {
        if (e.target === bibliotecaModal) hideBibliotecaModal();
    });
    console.log("Anexando listener de delegação ao startupCardsContainer.");
    startupCardsContainer.addEventListener("click", (e) => {
        const playerLi = e.target.closest(".player-name");
        if (playerLi) {
            const jogadorInfo = playerLi.dataset;
            showClasseModal(jogadorInfo);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    iniciarConexaoJogador();
});