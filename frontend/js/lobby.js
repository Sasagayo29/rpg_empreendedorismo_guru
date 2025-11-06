// Conecta-se ao servidor
const socket = io();

// Pega o ID da sala a partir da URL
const urlParams = new URLSearchParams(window.location.search);
const idSala = urlParams.get("sala");

// Seletores
const grid = document.getElementById("qr-code-grid");
const startBtn = document.getElementById("start-game-from-lobby-btn");

let todasEquipesNomes = [];
let equipesConectadas = new Set();

// 1. Verifica se temos dados do lobby no sessionStorage
const lobbyDataJSON = sessionStorage.getItem("lobby_data");
if (lobbyDataJSON) {
    const data = JSON.parse(lobbyDataJSON);
    
    todasEquipesNomes = data.dados_lobby.map(item => item.nome_startup);
    
    // 2. Constrói os QR Codes e os status
    data.dados_lobby.forEach((item) => {
        const div = document.createElement("div");
        div.className = "qr-code-item";
        div.innerHTML = `
            <h3>${item.nome_startup}</h3>
            <img src="${item.qr_code}" alt="QR Code para ${item.nome_startup}" />
            
            <p class="status-lobby" id="status-${item.nome_startup}">
                Aguardando conexão...
            </p>
            
            <p>Ou use o link:</p>
            <a href="${item.url}" target="_blank">${item.url}</a>
        `;
        grid.appendChild(div);
    });

    // 3. Mostra o botão de Iniciar Jogo (desabilitado)
    startBtn.classList.remove("hidden");
    startBtn.disabled = true;

} else {
    grid.innerHTML =
        "<p>Erro ao carregar os dados do lobby. Por favor, volte e crie o jogo novamente.</p>";
}

// 4. Diz ao servidor que o Mestre está nesta sala de lobby
if (idSala) {
    socket.emit("entrar_sala_mestre", { id_sala: idSala });
}

// 5. Adiciona o listener para o botão de iniciar
startBtn.addEventListener("click", () => {
    window.location.href = `/mestre?sala=${idSala}`;
});


// 6. Ouve por jogadores que JÁ estavam conectados
socket.on('status_lobby_atual', (data) => {
    console.log("Recebido status atual do lobby:", data);
    // Limpa o set atual e reconstrói
    equipesConectadas.clear();
    todasEquipesNomes.forEach(nome => {
         if(data.jogadores_conectados.includes(nome)) {
            marcarConectado(nome);
         } else {
            marcarDesconectado(nome, "Aguardando conexão..."); // Reseta quem não está
         }
    });
});

// 7. Ouve por NOVOS jogadores que se conectam
socket.on('jogador_conectou', (data) => {
    console.log("Jogador conectou:", data);
    marcarConectado(data.nome_startup);
});

// *** MELHORIA RECONEXÃO (Início) ***
// 8. Ouve por jogadores que DESCONECTAM
socket.on('jogador_desconectou', (data) => {
    console.log("Jogador desconectou:", data);
    marcarDesconectado(data.nome_startup, "Offline 🔴");
});
// *** MELHORIA RECONEXÃO (Fim) ***

function marcarConectado(nome_startup) {
    if (!todasEquipesNomes.includes(nome_startup)) return;

    equipesConectadas.add(nome_startup);
    const statusEl = document.getElementById(`status-${nome_startup}`);
    if (statusEl) {
        statusEl.textContent = '✔️ Equipe Conectada!';
        statusEl.classList.add('connected');
        statusEl.classList.remove('disconnected'); // Garante que remove o status de erro
    }
    verificarTodosConectados();
}

// *** MELHORIA RECONEXÃO (Início) ***
// Função atualizada para lidar com texto customizado
function marcarDesconectado(nome_startup, mensagem) {
    if (!todasEquipesNomes.includes(nome_startup)) return;

    equipesConectadas.delete(nome_startup);
    const statusEl = document.getElementById(`status-${nome_startup}`);
    if (statusEl) {
        statusEl.textContent = mensagem;
        statusEl.classList.remove('connected');
        
        // Adiciona classe de erro se for desconexão (não apenas aguardando)
        if (mensagem.includes("Offline")) {
            statusEl.classList.add('disconnected');
        }
    }
    verificarTodosConectados();
}
// *** MELHORIA RECONEXÃO (Fim) ***


function verificarTodosConectados() {
    if (equipesConectadas.size === todasEquipesNomes.length) {
        startBtn.disabled = false;
        startBtn.textContent = 'Todos Prontos! Iniciar Jogo';
    } else {
        // *** MELHORIA RECONEXÃO (Início) ***
        // Desabilita o botão se alguém cair
        startBtn.disabled = true;
        startBtn.textContent = 'Aguardando todos os jogadores...';
        // *** MELHORIA RECONEXÃO (Fim) ***
    }
}


// (Opcional) Carrega o tema do Mestre
const THEME_KEY = "empreendedorismoGuruTheme";
const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
if (savedTheme === "light") {
    document.body.classList.add("light-mode");
}