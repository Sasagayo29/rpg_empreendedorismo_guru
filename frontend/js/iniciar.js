// --- Conecta-se ao servidor Socket.IO ---
// (Ele conecta-se automaticamente ao servidor que serviu a página)
const socket = io();

// --- Seletores da Página de Início ---
const homeScreen = document.getElementById("home-screen");
const homeNewGameBtn = document.getElementById("home-new-game-btn");
const gameSetupDiv = document.getElementById("game-setup");
const setupForm = document.getElementById("setup-form");

// Seletores do Setup
const numStartupsInput = document.getElementById("num-startups");
const numJogadoresSelect = document.getElementById("num-jogadores");
const equipesFormsContainer = document.getElementById(
    "equipes-forms-container"
);
const setupNavigation = document.getElementById("setup-navigation");
const prevStepBtn = document.getElementById("prev-step-btn");
const nextStepBtn = document.getElementById("next-step-btn");
const startGameBtn = document.getElementById("start-game-btn");
let currentSetupStep = 0;

// Seletores dos Modais e Tema
const verClassesBtn = document.getElementById("ver-classes-btn");
const bibliotecaModal = document.getElementById("biblioteca-modal");
const fecharBibliotecaBtn = document.getElementById("fechar-biblioteca-btn");
const themeToggleBtnHome = document.getElementById("theme-toggle-btn-home");
const THEME_KEY = "empreendedorismoGuruTheme";

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
    themeToggleBtnHome.innerText = icon;
    localStorage.setItem(THEME_KEY, theme);
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

// --- Funções de Setup (Copiadas e Adaptadas) ---
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
                        <option value="Líder">Líder</option><option value="Visionário">Visionário</option><option value="Desbravador">Desbravador</option><option value="Estrategista">Estrategista</option><option value="Guardião">Guardião</option>
                    </select>
                </div>`;
        }
        const equipeHtml = `
            <fieldset data-step="${i}">
                <legend>Configuração da Startup ${i + 1}</legend>
                <div class="form-group"><label for="startup-nome-${i}">Nome da Startup:</label><input type="text" id="startup-nome-${i}" required></div>
                <div class="form-group"><label for="ideia-negocio-${i}">Ideia de Negócio:</label><input type="text" id="ideia-negocio-${i}" placeholder="Ex: Um app de delivery para pets" required></div>
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

// --- Função de Início (A Lógica Principal) ---
async function criarLobby(e) {
    e.preventDefault();
    if (!setupForm.checkValidity()) {
        alert(
            "Por favor, preencha todos os campos obrigatórios em todas as abas."
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

    // 1. Envia os dados de setup para o servidor via Socket.IO
    console.log("Enviando dados para o servidor para criar o jogo...");
    socket.emit("iniciar_jogo", { equipes: equipes });
}

// --- Listeners do Socket.IO ---
socket.on("jogo_criado", (data) => {
    console.log("Jogo criado com sucesso!", data);
    // 2. O servidor respondeu com o ID da sala e os dados do lobby.
    // 3. Vamos guardar os dados do lobby no sessionStorage (para a próxima página)
    //    e redirecionar o Mestre para a página do lobby.
    sessionStorage.setItem("lobby_data", JSON.stringify(data));
    window.location.href = `/lobby?sala=${data.id_sala}`;
});

socket.on("erro_jogo", (data) => {
    console.error("Erro do servidor:", data.mensagem);
    alert(`Erro ao criar o jogo: ${data.mensagem}`);
});

// --- Listeners de UI (Setup e Modais) ---
homeNewGameBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    homeScreen.classList.add("hidden");
    gameSetupDiv.classList.remove("hidden");
});
numStartupsInput.addEventListener("change", renderEquipeForms);
numJogadoresSelect.addEventListener("change", renderEquipeForms);
setupForm.addEventListener("submit", criarLobby); // Mudado de iniciarJogo para criarLobby
nextStepBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    // Validação simples
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
    if (allValid) navigateToSetupStep(currentSetupStep + 1);
});
prevStepBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    navigateToSetupStep(currentSetupStep - 1);
});
themeToggleBtnHome.addEventListener("click", toggleTheme);
verClassesBtn.addEventListener("click", () => {
    playAudio("audio-virar-carta");
    bibliotecaModal.classList.remove("hidden");
});
fecharBibliotecaBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    bibliotecaModal.classList.add("hidden");
});
bibliotecaModal.addEventListener("click", (e) => {
    if (e.target === bibliotecaModal) bibliotecaModal.classList.add("hidden");
});

// --- Inicialização ---
renderEquipeForms();
loadInitialTheme();
