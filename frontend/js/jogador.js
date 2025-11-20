let meuNomeStartup = "";
let idSala = "";
let acaoSelecionada = null; 
let jogadorSelecionado = null; 
let estadoJogoAtual = {}; 
let acoesSubmetidasLocal = { coletiva: false, individual: false };
let modoHabilidade = false; 

const socket = io();

const gameBoardDiv = document.getElementById("game-board");
const startupCardsContainer = document.getElementById(
    "startup-cards-container"
);
const currentStartupNameSpan = document.getElementById("current-startup-name");
const playerTurnSelectorDiv = document.getElementById("player-turn-selector");
const acoesDisponiveisDiv = document.getElementById("acoes-disponiveis");
const turnoInfoBox = document.getElementById("turno-info");
const actionSelectionArea = document.getElementById("action-selection-area");

const justificativaContainer = document.getElementById(
    "justificativa-container"
);
const justificativaTextarea = document.getElementById("acao-justificativa");
const submitAcaoBtn = document.getElementById("submit-acao-btn");
const alvoContainer = document.getElementById("alvo-container");
const alvoSelect = document.getElementById("alvo-select"); 
const justificativaBtnCancelar = document.getElementById("justificativa-btn-cancelar");

const dimensaoFiltrosContainer = document.getElementById("dimensao-filtros");
let currentDimensaoFilter = "todos";
const playerHUD = document.getElementById("player-hud");
const hudJogadorImg = document.getElementById("hud-jogador-img");
const hudClasseNome = document.getElementById("hud-classe-nome");
const hudJogadorNome = document.getElementById("hud-jogador-nome");
const hudAfinidadeDesc = document.getElementById("hud-afinidade-desc");
const hudHabilidadeBtn = document.getElementById("hud-habilidade-btn");

const hudToggleBtn = document.getElementById("hud-toggle-btn"); 
const HUD_MINIMIZED_KEY = 'guruHudMinimized';

const themeToggleBtnGame = document.getElementById("theme-toggle-btn-game");

const sidebarTabs = document.querySelector("#jogador-controles .sidebar-tabs");
const acaoPanel = document.getElementById("acao-panel");
const logPanel = document.getElementById("log-panel");
const bibliotecaPanel = document.getElementById("biblioteca-panel");
const jogadorLogList = document.getElementById("jogador-log-list");

const CHART_INSTANCES = {};

function toggleHudMinimize() {
    playerHUD.classList.toggle('minimized');
    const isMinimized = playerHUD.classList.contains('minimized');
    localStorage.setItem(HUD_MINIMIZED_KEY, isMinimized ? 'true' : 'false');
    
    if (hudToggleBtn) {
        hudToggleBtn.querySelector('.icon').innerText = isMinimized ? '▲' : '▼';
    }

    if (acaoPanel && acaoPanel.classList.contains('active')) {
        acoesDisponiveisDiv.scrollTo(0, 0); 
    }
}

function loadHudState() {
    const savedState = localStorage.getItem(HUD_MINIMIZED_KEY);
    if (savedState === 'true') {
        playerHUD.classList.add('minimized');
        if (hudToggleBtn) hudToggleBtn.querySelector('.icon').innerText = '▲';
    } else if (hudToggleBtn) {
        hudToggleBtn.querySelector('.icon').innerText = '▼';
    }
}

function addLogMessage(message, tipo = "log-normal") {
    if (!message || !jogadorLogList) return;
    const li = document.createElement("li");
    li.textContent = message;
    li.className = tipo;
    jogadorLogList.prepend(li);
}

function renderTodosOsCards(startups, faseAtual, submissoesPendentes) {
    if (!startups || startups.length === 0) return;
    startupCardsContainer.innerHTML = ""; 

    startups.forEach(startup => {
        const card = document.createElement("div");
        card.className = "startup-card";
        
        if (startup.nome === meuNomeStartup) {
            card.classList.add("meu-card");
        } else {
            card.classList.add("card-oponente");
        }
        
        if (startup.esta_eliminada) card.classList.add("eliminada");

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
                 statusTurno = "<span class='status-pendente'>Aguardando Ação Coletiva...</span>";
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
            <p class="status-container">${statusTurno}</p>
            <p><strong>Ideia:</strong> ${startup.ideia_negocio}</p>
            <div class="radar-chart-container">
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

function updateTurnoInfo(minhaStartup, faseAtual, minhaSubmissao) {
    currentStartupNameSpan.innerText = minhaStartup.nome;
    cancelarAcao(); 
    jogadorSelecionado = null;
    modoHabilidade = false;

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
        
        if (minhaSubmissao.individual || minhaSubmissao.habilidade) {
            const acaoFeita = minhaSubmissao.individual ? "Ação Individual" : "Habilidade";
            desabilitarControles(
                `${acaoFeita} submetida. Aguardando Mestre...`
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

                    
                    document.querySelectorAll("#player-turn-selector button").forEach((b) => b.classList.remove('active'));
                    btn.classList.add('active');

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
        
        if (modoHabilidade) {
            if (jogadorSelecionado.classe === 'Visionário' && dimensao !== 'produto') continue;
            if (jogadorSelecionado.classe === 'Líder' && dimensao !== 'equipe') continue;
        } else if (filtro !== "todos" && dimensao !== filtro) {
            continue; 
        }
        
        const dimensaoHeader = document.createElement("h5");
        dimensaoHeader.innerText = dimensao.toUpperCase();

        if (faseAtual === "INDIVIDUAL" && jogadorSelecionado && !modoHabilidade) {
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
            const acaoJaFeita = acoesFeitasPelaStartup.includes(acao.nome);
            
            if (acaoJaFeita) {
                let ehHabilidadeReutilizavel = false;
                if (modoHabilidade && jogadorSelecionado.classe === 'Visionário' && dimensao === 'produto') {
                    ehHabilidadeReutilizavel = true;
                }
                if (modoHabilidade && jogadorSelecionado.classe === 'Líder' && dimensao === 'equipe') {
                    ehHabilidadeReutilizavel = true;
                }

                if (ehHabilidadeReutilizavel) {
                    btn.classList.add("acao-iteracao"); 
                    desabilitar = false;
                } else {
                    btn.classList.add("acao-realizada");
                    desabilitar = true;
                }
            }
            
            else if (faseAtual === "RESOLUCAO") {
                desabilitar = true;
            }
            else if (faseAtual === "COLETIVA" && minhaSubmissao.coletiva) {
                desabilitar = true;
            }
            else if (faseAtual === "INDIVIDUAL" && (minhaSubmissao.individual || minhaSubmissao.habilidade)) {
                desabilitar = true;
            }
            else if (faseAtual === "INDIVIDUAL" && !jogadorSelecionado) {
                btn.classList.add("disabled-by-affinity");
                desabilitar = true;
            }
            else if (modoHabilidade && (jogadorSelecionado.classe !== 'Visionário' && jogadorSelecionado.classe !== 'Líder')) {
                 desabilitar = true; 
            }
            else if (
                !modoHabilidade &&
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
                !modoHabilidade &&
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

    if (modoHabilidade) {
        tipoAcao = "habilidade";
        nomeJogador = jogadorSelecionado.nome;
    } else if (faseAtual === "COLETIVA") {
        tipoAcao = "coletiva";
        nomeJogador = "Equipa"; 
    } else if (faseAtual === "INDIVIDUAL") {
        tipoAcao = "individual";
        if (!jogadorSelecionado) {
            showPopup('Ação Inválida', 'Por favor, selecione primeiro o jogador que fará a ação individual.', 'aviso'); 
            return;
        }
        nomeJogador = jogadorSelecionado.nome;
    } else {
        return; 
    }

    acoesDisponiveisDiv.querySelectorAll(".acao-button").forEach((b) => (b.disabled = true));
    dimensaoFiltrosContainer.querySelectorAll(".filtro-btn").forEach((b) => (b.disabled = true));
    
    btn.disabled = false;
    btn.classList.add("selected");

    acaoSelecionada = {
        id: acao.id,
        acao_nome: acao.nome,
        nome_startup: meuNomeStartup, 
        dimensao: dimensao,
        tipo_acao: tipoAcao,
        jogador_nome: nomeJogador,
        classe_jogador: jogadorSelecionado ? jogadorSelecionado.classe : null 
    };

    justificativaContainer.classList.remove("hidden");
    justificativaTextarea.value = "";
    justificativaTextarea.focus();
}

function cancelarAcao() {
    playAudio("audio-clique");
    
    justificativaContainer.classList.add("hidden");
    alvoContainer.classList.add("hidden");
    alvoSelect.innerHTML = "";
    
    acaoSelecionada = null;
    
    dimensaoFiltrosContainer.querySelectorAll(".filtro-btn").forEach((b) => (b.disabled = false));
    
    const minhaStartup = estadoJogoAtual.startups.find((s) => s.nome === meuNomeStartup);
    if (minhaStartup) {
        renderAcoes(
            minhaStartup,
            estadoJogoAtual.fase_atual,
            estadoJogoAtual.submissoes_pendentes[meuNomeStartup]
        );
    }
}

function submeterAcao() {
    playAudio("audio-clique"); 
    const justificativa = justificativaTextarea.value;

    if (!acaoSelecionada) {
        showPopup('Erro', 'Nenhuma ação foi selecionada.', 'erro');
        return;
    }
    if (justificativa.trim().length < 5) {
        showPopup('Justificativa Inválida', 'Por favor, escreva uma breve justificativa para a sua ação.', 'aviso'); 
        justificativaTextarea.focus();
        return;
    }
    
    let alvo = null;
    if (modoHabilidade && jogadorSelecionado.classe === 'Desbravador') {
        alvo = alvoSelect.value;
        if (!alvo) {
            showPopup('Ação Incompleta', 'Por favor, escolha um oponente para ser o alvo da habilidade.', 'aviso');
            return;
        }
        acaoSelecionada.alvo = alvo;
        acaoSelecionada.acao_nome = `Marketing Agressivo (Alvo: ${alvo})`;
    }

    socket.emit("submeter_acao", {
        ...acaoSelecionada, 
        id_sala: idSala,
        justificativa: justificativa,
    });

    desabilitarControles("Ação submetida! Aguardando aprovação do Mestre...");
}

function usarHabilidade() {
    if (!jogadorSelecionado) return;

    const classe = jogadorSelecionado.classe;
    let confirmMsg = "";
    let nomeHabilidade = "";
    let acaoId = `habilidade_${classe.toLowerCase()}`;
    let dimensao = jogadorSelecionado.dimensao_afinidade;

    if (classe === 'Guardião') {
        nomeHabilidade = "Rodada de Investimento";
        confirmMsg = "Tem certeza que quer usar 'Rodada de Investimento'?\n\nEfeito: +2 Recursos, -1 Equipe.\n(Deve ser aprovado pelo Mestre)";
    } else if (classe === 'Desbravador') {
        nomeHabilidade = "Marketing Agressivo";
        confirmMsg = "Tem certeza que quer usar 'Marketing Agressivo'?\n\nEfeito: +1 Mercado (para você), -1 Mercado (para um alvo).\n(Deve ser aprovado pelo Mestre)";
    } else if (classe === 'Visionário') {
        nomeHabilidade = "Iteração Rápida";
        confirmMsg = "Tem certeza que quer usar 'Iteração Rápida'?\n\nEfeito: Permite refazer uma ação de 'Produto' já realizada.\n(A ação escolhida deve ser aprovada pelo Mestre)";
    } else if (classe === 'Líder') {
        nomeHabilidade = "Liderar pelo Exemplo";
        confirmMsg = "Tem certeza que quer usar 'Liderar pelo Exemplo'?\n\nEfeito: Permite refazer uma ação de 'Equipe' já realizada.\n(A ação escolhida deve ser aprovada pelo Mestre)";
    } else if (classe === 'Estrategista') {
        nomeHabilidade = "Análise de Risco";
        confirmMsg = "Tem certeza que quer usar 'Análise de Risco'?\n\nEfeito: Gasta sua ação individual para anular o próximo evento negativo neste turno.\n(Deve ser aprovado pelo Mestre)";
    }

    showConfirm('Confirmar Habilidade', confirmMsg, () => { 
        playAudio('audio-clique');
        modoHabilidade = true; 
        
        document.querySelectorAll("#player-turn-selector button").forEach((b) => (b.disabled = true));
        hudHabilidadeBtn.disabled = true;

        if (classe === 'Visionário' || classe === 'Líder') {
            currentDimensaoFilter = (classe === 'Visionário') ? 'produto' : 'equipe';
            document.querySelectorAll(".filtro-btn").forEach((b) => {
                b.classList.toggle("active", b.getAttribute("data-filtro") === currentDimensaoFilter);
                b.disabled = true;
            });
            document.querySelector(`.filtro-${currentDimensaoFilter}`).disabled = false;

            renderAcoes(
                estadoJogoAtual.startups.find(s => s.nome === meuNomeStartup),
                estadoJogoAtual.fase_atual,
                estadoJogoAtual.submissoes_pendentes[meuNomeStartup]
            );
            
        } else {
            actionSelectionArea.classList.add('hidden');
            
            acaoSelecionada = {
                id: acaoId,
                acao_nome: nomeHabilidade, 
                nome_startup: meuNomeStartup, 
                dimensao: dimensao,
                tipo_acao: 'habilidade',
                jogador_nome: jogadorSelecionado.nome,
                classe_jogador: jogadorSelecionado.classe
            };

            justificativaContainer.classList.remove("hidden");
            
            if (classe === 'Desbravador') {
                const oponentes = estadoJogoAtual.startups.filter(s => s.nome !== meuNomeStartup && !s.esta_eliminada);
                alvoSelect.innerHTML = '<option value="">-- Escolha um oponente --</option>';
                oponentes.forEach(op => {
                    alvoSelect.innerHTML += `<option value="${op.nome}">${op.nome}</option>`;
                });
                alvoContainer.classList.remove('hidden');
            }
            
            justificativaTextarea.focus();
        }
    });
}

function desabilitarControles(mensagem) {
    if (turnoInfoBox) {
        turnoInfoBox.innerHTML = `<h2>${mensagem}</h2>`;
    }
    actionSelectionArea.classList.remove('hidden'); 
    alvoContainer.classList.add('hidden'); 
    
    if (acoesDisponiveisDiv) {
        acoesDisponiveisDiv.querySelectorAll(".acao-button").forEach((btn) => {
            btn.disabled = true;
            btn.classList.add("disabled-by-affinity");
        });
    }
    if (dimensaoFiltrosContainer) {
        dimensaoFiltrosContainer.querySelectorAll(".filtro-btn").forEach((btn) => {
            btn.disabled = true;
        });
    }
    if (justificativaContainer) justificativaContainer.classList.add("hidden");
    if (playerTurnSelectorDiv) playerTurnSelectorDiv.innerHTML = "";
    hidePlayerHUD();
}

function habilitarControles() {
    actionSelectionArea.classList.remove('hidden');
    if (dimensaoFiltrosContainer) {
        dimensaoFiltrosContainer.querySelectorAll(".filtro-btn").forEach((btn) => {
            btn.disabled = false;
        });
    }
    console.log("Controles habilitados.");
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
        
        if (modoHabilidade) {
            modoHabilidade = false;
            document.querySelectorAll("#player-turn-selector button").forEach((b) => (b.disabled = false));
        }
        
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

    loadHudState(); 

    hudHabilidadeBtn.classList.remove('hidden');
    if (jogador.habilidade_usada) {
        hudHabilidadeBtn.disabled = true;
        hudHabilidadeBtn.innerText = "Habilidade Usada";
    } else {
        hudHabilidadeBtn.disabled = false;
        let nomeHabilidade = `Usar ${jogador.classe}`; 
        if (jogador.classe === "Líder") nomeHabilidade = "Liderar pelo Exemplo";
        if (jogador.classe === "Guardião") nomeHabilidade = "Rodada de Investimento";
        if (jogador.classe === "Visionário") nomeHabilidade = "Iteração Rápida";
        if (jogador.classe === "Desbravador") nomeHabilidade = "Marketing Agressivo";
        if (jogador.classe === "Estrategista") nomeHabilidade = "Análise de Risco";
        
        hudHabilidadeBtn.innerText = nomeHabilidade;
    }
}

function hidePlayerHUD() {
    playerHUD.classList.add("hidden");
    hudJogadorImg.src = "";
    hudHabilidadeBtn.classList.add('hidden');
}

function setupSidebarTabs() {
    if (!sidebarTabs) return;
    sidebarTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.sidebar-tab-btn');
        if (!btn) return;

        playAudio('audio-clique'); 
        const tabId = btn.dataset.tab; 

        sidebarTabs.querySelectorAll('.sidebar-tab-btn').forEach(b => {
            b.classList.remove('active');
        });
        document.querySelectorAll('#jogador-controles .sidebar-panel').forEach(p => {
            p.classList.remove('active');
        });

        btn.classList.add('active');
        const panel = document.getElementById(`${tabId}-panel`);
        if (panel) {
            panel.classList.add('active');
        }
    });
}


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
    
    renderTodosOsCards(gameState.startups, gameState.fase_atual, gameState.submissoes_pendentes);

    const faseAtual = gameState.fase_atual;
    const minhaSubmissao = gameState.submissoes_pendentes[meuNomeStartup];

    if (jogadorSelecionado) {
        const jogadorAtualizado = minhaStartup.jogadores.find(j => j.nome === jogadorSelecionado.nome);
        if (jogadorAtualizado) {
            jogadorSelecionado = jogadorAtualizado; 
            updatePlayerHUD(jogadorSelecionado);
        }
    }

    updateTurnoInfo(minhaStartup, faseAtual, minhaSubmissao);
    renderAcoes(minhaStartup, faseAtual, minhaSubmissao);

    if (
        faseAtual === "RESOLUCAO" ||
        (faseAtual === "COLETIVA" && minhaSubmissao.coletiva) ||
        (faseAtual === "INDIVIDUAL" && (minhaSubmissao.individual || minhaSubmissao.habilidade))
    ) {
        if (minhaStartup.esta_eliminada) {
            desabilitarControles("A sua startup foi eliminada.");
        } else {
            desabilitarControles("Aguardando o Mestre e outros jogadores...");
        }
    } else {
        habilitarControles();
    }
});

socket.on("log_mensagem", (data) => {
    addLogMessage(data.mensagem, data.tipo);
});

socket.on("evento_subir_de_nivel", async (evento) => {
    console.log("Recebeu evento de subir de nível:", evento);
    await showEventoModal(evento);
});

socket.on("jogo_terminou", (vencedor) => {
    console.log("O jogo terminou! Vencedor:", vencedor);
    showFimDeJogo(vencedor);
});

socket.on("jogo_nao_encontrado", () => {
    showPopup('Erro de Conexão', 'ERRO: O Mestre saiu ou a sala deste jogo não foi encontrada.', 'erro');
    setTimeout(() => window.location.href = "/", 2000);
});

socket.on("erro_jogo", (data) => {
    showPopup('Erro do Servidor', data.mensagem, 'erro'); 
    if (jogadorSelecionado && !jogadorSelecionado.habilidade_usada) {
         hudHabilidadeBtn.disabled = false;
         updatePlayerHUD(jogadorSelecionado);
    }
});

socket.on("acao_recusada", (acaoRecusada) => {
    showPopup('Ação Recusada', `A sua ação "${acaoRecusada.acao_nome}" foi recusada pelo Mestre. Por favor, submeta novamente.`, 'aviso');
    if (acaoRecusada.tipo_acao === "coletiva") {
        acoesSubmetidasLocal.coletiva = false;
    } else {
        acoesSubmetidasLocal.individual = false;
    }
    socket.emit("jogador_pedir_estado", { id_sala: idSala });
});

function iniciarConexaoJogador() {
    loadInitialTheme();
    setupSidebarTabs(); 
    loadHudState(); 

    const urlParams = new URLSearchParams(window.location.search);
    idSala = urlParams.get("sala");
    meuNomeStartup = urlParams.get("startup");

     if (!idSala || !meuNomeStartup) {
        showPopup('Erro', 'Erro: ID da Sala ou nome da Startup em falta. A voltar para o início.', 'erro');
        setTimeout(() => window.location.href = "/", 2000);
        return;
    }

    socket.emit("entrar_sala_jogador", {
        id_sala: idSala,
        nome_startup: meuNomeStartup,
    });

    submitAcaoBtn.addEventListener("click", submeterAcao);
    justificativaBtnCancelar.addEventListener("click", cancelarAcao);
    themeToggleBtnGame.addEventListener("click", toggleTheme);
    hudHabilidadeBtn.addEventListener("click", usarHabilidade);

    if (hudToggleBtn) {
        hudToggleBtn.addEventListener("click", toggleHudMinimize);
    }

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