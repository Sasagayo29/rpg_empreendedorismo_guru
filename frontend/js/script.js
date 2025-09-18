const API_URL = "http://127.0.0.1:5000";
let jogoId = null;
let startups = [];
let acoesDisponiveis = {};
let turnoAtualIndex = 0;
let acoesRealizadasNoTurno = { coletiva: false, individual: null };

const setupForm = document.getElementById("setup-form");
const numStartupsInput = document.getElementById("num-startups");
// ATUALIZAÇÃO: Novo seletor
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

const CHART_INSTANCES = {};

// ATUALIZAÇÃO: A função de renderizar agora também reage à mudança de jogadores
function renderEquipeForms() {
    const numStartups = parseInt(numStartupsInput.value);
    const numJogadores = parseInt(numJogadoresSelect.value); // Pega o número de jogadores
    equipesFormsContainer.innerHTML = "";
    for (let i = 0; i < numStartups; i++) {
        // Gera os campos de jogador dinamicamente
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
            <fieldset>
                <legend>Startup ${i + 1}</legend>
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
}

// ATUALIZAÇÃO: A função de iniciar o jogo agora envia os novos dados
async function iniciarJogo(e) {
    e.preventDefault();
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
            ideia_negocio: document.getElementById(`ideia-negocio-${i}`).value, // Envia a ideia
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
        } else {
            addLogMessage(`Erro: ${data.erro}`);
        }
    } catch (error) {
        console.error("Erro ao iniciar jogo:", error);
        addLogMessage("Não foi possível conectar ao servidor.");
    }
}

function updateUI() {
    if (!startups || startups.length === 0) return;
    renderStartupCards();
    updateTurnoInfo();
    renderAcoes();
}

// ATUALIZAÇÃO: O card da startup agora mostra a Ideia de Negócio
function renderStartupCards() {
    startupCardsContainer.innerHTML = "";
    startups.forEach((startup, index) => {
        const card = document.createElement("div");
        card.className = "startup-card";
        if (index === turnoAtualIndex) card.classList.add("active-turn");
        card.innerHTML = `
            <h3>${startup.nome} (Nível: ${startup.nivel})</h3>
            <p><strong>Ideia:</strong> ${startup.ideia_negocio}</p>
            <div class="radar-chart-container">
                <canvas id="chart-${startup.nome}"></canvas>
            </div>
            <p><strong>Jogadores:</strong></p>
            <ul>
                ${startup.jogadores
                    .map((j) => `<li>${j.nome} (${j.classe})</li>`)
                    .join("")}
            </ul>
        `;
        startupCardsContainer.appendChild(card);
        renderRadarChart(startup);
    });
}

// (Restante do arquivo script.js sem alterações)
function renderRadarChart(startup) {
    const ctx = document
        .getElementById(`chart-${startup.nome}`)
        .getContext("2d");
    const chartData = {
        labels: Object.keys(startup.dimensoes).map(
            (d) => d.charAt(0).toUpperCase() + d.slice(1)
        ),
        datasets: [
            {
                label: `Nível das Dimensões`,
                data: Object.values(startup.dimensoes),
                fill: true,
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                borderColor: "rgb(59, 130, 246)",
                pointBackgroundColor: "rgb(59, 130, 246)",
            },
        ],
    };
    if (CHART_INSTANCES[startup.nome]) CHART_INSTANCES[startup.nome].destroy();
    CHART_INSTANCES[startup.nome] = new Chart(ctx, {
        type: "radar",
        data: chartData,
        options: {
            elements: { line: { tension: 0.1 } },
            scales: { r: { beginAtZero: true, suggestedMax: 5 } },
        },
    });
}
function updateTurnoInfo() {
    const startupAtual = startups[turnoAtualIndex];
    currentStartupNameSpan.innerText = startupAtual.nome;
    playerTurnSelectorDiv.innerHTML = "<strong>Ação Individual de:</strong> ";
    startupAtual.jogadores.forEach((jogador) => {
        const btn = document.createElement("button");
        btn.innerText = jogador.nome;
        btn.disabled = acoesRealizadasNoTurno.individual === jogador.nome;
        btn.onclick = () => {
            acoesRealizadasNoTurno.individual = jogador.nome;
            updateUI();
        };
        playerTurnSelectorDiv.appendChild(btn);
    });
    const podeAvancar =
        acoesRealizadasNoTurno.coletiva && acoesRealizadasNoTurno.individual;
    nextTurnBtn.classList.toggle("hidden", !podeAvancar);
}
function renderAcoes() {
    acoesDisponiveisDiv.innerHTML = "";
    for (const [dimensao, acoes] of Object.entries(acoesDisponiveis)) {
        const dimensaoHeader = document.createElement("h5");
        dimensaoHeader.innerText = dimensao.toUpperCase();
        acoesDisponiveisDiv.appendChild(dimensaoHeader);
        acoes.forEach((acao) => {
            const btn = document.createElement("button");
            btn.innerText = acao.nome;
            btn.className = "acao-button";
            btn.onclick = () => apresentarAcao(acao.id);
            if (
                acoesRealizadasNoTurno.coletiva &&
                acoesRealizadasNoTurno.individual
            ) {
                btn.disabled = true;
                btn.classList.add("disabled");
            }
            acoesDisponiveisDiv.appendChild(btn);
        });
    }
}
async function apresentarAcao(acaoId) {
    const startupAtual = startups[turnoAtualIndex];
    let tipoAcao, jogadorNome;
    if (!acoesRealizadasNoTurno.coletiva) {
        tipoAcao = "coletiva";
        jogadorNome = startupAtual.jogadores[0].nome;
    } else if (acoesRealizadasNoTurno.individual) {
        addLogMessage("Você já realizou todas as ações deste turno.");
        return;
    } else {
        tipoAcao = "individual";
        jogadorNome = acoesRealizadasNoTurno.individual;
        if (!jogadorNome) {
            addLogMessage(
                "Por favor, selecione qual jogador fará a ação individual."
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
        addLogMessage(resultado.mensagem);
        if (resultado.status === "sucesso") {
            if (tipoAcao === "coletiva") acoesRealizadasNoTurno.coletiva = true;
            if (resultado.subiu_de_nivel) {
                addLogMessage(`A startup ${startupAtual.nome} subiu de nível!`);
                if (resultado.evento) {
                    addLogMessage(resultado.evento.mensagem_final);
                }
            }
            await fetchStatus();
        }
    } catch (error) {
        console.error("Erro ao apresentar ação:", error);
        addLogMessage("Erro de comunicação com o servidor.");
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
    turnoAtualIndex = (turnoAtualIndex + 1) % startups.length;
    acoesRealizadasNoTurno = { coletiva: false, individual: null };
    updateUI();
}
function addLogMessage(message) {
    if (!message) return;
    const li = document.createElement("li");
    li.textContent = message;
    logList.prepend(li);
}
numStartupsInput.addEventListener("change", renderEquipeForms);
numJogadoresSelect.addEventListener("change", renderEquipeForms);
setupForm.addEventListener("submit", iniciarJogo);
nextTurnBtn.addEventListener("click", avancarTurno);
renderEquipeForms();
