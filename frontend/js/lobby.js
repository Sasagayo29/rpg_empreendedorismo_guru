const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const idSala = urlParams.get("sala");

const grid = document.getElementById("qr-code-grid");
const startBtn = document.getElementById("start-game-from-lobby-btn");

let todasEquipesNomes = [];
let equipesConectadas = new Set();

const lobbyDataJSON = sessionStorage.getItem("lobby_data");
if (lobbyDataJSON) {
    const data = JSON.parse(lobbyDataJSON);
    
    todasEquipesNomes = data.dados_lobby.map(item => item.nome_startup);
    
    data.dados_lobby.forEach((item) => {
        const div = document.createElement("div");
        div.className = "qr-code-item";

        const jogadoresHtml = item.jogadores.map(jogador => {
            return `<li class="lobby-player-item">${jogador.nome} (${jogador.classe})</li>`;
        }).join('');

        div.innerHTML = `
            <h3>${item.nome_startup}</h3>
            
            <div class="lobby-card-content">
                <div class="lobby-qr-code">
                    <img src="${item.qr_code}" alt="QR Code para ${item.nome_startup}" />
                    <a href="${item.url}" target="_blank">Link de Convite</a>
                </div>
                <div class="lobby-player-list">
                    <h4>Jogadores:</h4>
                    <ul>
                        ${jogadoresHtml}
                    </ul>
                </div>
            </div>
            <p class="status-lobby" id="status-${item.nome_startup}">
                Aguardando conexão...
            </p>
        `;
        grid.appendChild(div);
    });

    startBtn.classList.remove("hidden");
    startBtn.disabled = true;

} else {
    grid.innerHTML =
        "<p>Erro ao carregar os dados do lobby. Por favor, volte e crie o jogo novamente.</p>";
}

if (idSala) {
    socket.emit("entrar_sala_mestre", { id_sala: idSala });
}

startBtn.addEventListener("click", () => {
    window.location.href = `/mestre?sala=${idSala}`;
});


socket.on('status_lobby_atual', (data) => {
    console.log("Recebido status atual do lobby:", data);
    equipesConectadas.clear();
    todasEquipesNomes.forEach(nome => {
         if(data.jogadores_conectados.includes(nome)) {
            marcarConectado(nome);
         } else {
            marcarDesconectado(nome, "Aguardando conexão..."); 
         }
    });
});

socket.on('jogador_conectou', (data) => {
    console.log("Jogador conectou:", data);
    marcarConectado(data.nome_startup);
});

socket.on('jogador_desconectou', (data) => {
    console.log("Jogador desconectou:", data);
    marcarDesconectado(data.nome_startup, "Offline 🔴");
});


function marcarConectado(nome_startup) {
    if (!todasEquipesNomes.includes(nome_startup)) return;

    equipesConectadas.add(nome_startup);
    const statusEl = document.getElementById(`status-${nome_startup}`);
    if (statusEl) {
        statusEl.textContent = '✔️ Equipe Conectada!';
        statusEl.classList.add('connected');
        statusEl.classList.remove('disconnected'); 
    }
    verificarTodosConectados();
}

function marcarDesconectado(nome_startup, mensagem) {
    if (!todasEquipesNomes.includes(nome_startup)) return;

    equipesConectadas.delete(nome_startup);
    const statusEl = document.getElementById(`status-${nome_startup}`);
    if (statusEl) {
        statusEl.textContent = mensagem;
        statusEl.classList.remove('connected');
        
        if (mensagem.includes("Offline")) {
            statusEl.classList.add('disconnected');
        }
    }
    verificarTodosConectados();
}


function verificarTodosConectados() {
    if (equipesConectadas.size === todasEquipesNomes.length) {
        startBtn.disabled = false;
        startBtn.textContent = 'Todos Prontos! Iniciar Jogo';
    } else {
        startBtn.disabled = true;
        startBtn.textContent = 'Aguardando todos os jogadores...';
    }
}


const THEME_KEY = "empreendedorismoGuruTheme";
const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
if (savedTheme === "light") {
    document.body.classList.add("light-mode");
}