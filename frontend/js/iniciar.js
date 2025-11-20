const socket = io();

const homeScreen = document.getElementById("home-screen");
const homeNewGameBtn = document.getElementById("home-new-game-btn");
const gameSetupDiv = document.getElementById("game-setup");
const setupForm = document.getElementById("setup-form");

const equipesFormsContainer = document.getElementById(
    "equipes-forms-container"
);
const setupNavigation = document.getElementById("setup-navigation");
const prevStepBtn = document.getElementById("prev-step-btn");
const nextStepBtn = document.getElementById("next-step-btn");
const startGameBtn = document.getElementById("start-game-btn");
let currentSetupStep = 0;

const verClassesBtn = document.getElementById("ver-classes-btn");
const bibliotecaModal = document.getElementById("biblioteca-modal");
const fecharBibliotecaBtn = document.getElementById("fechar-biblioteca-btn");
const themeToggleBtnHome = document.getElementById("theme-toggle-btn-home");
const THEME_KEY = "empreendedorismoGuruTheme";

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


function renderEquipeForms() {
    const numStartupsEl = document.getElementById("num-startups");
    const numJogadoresEl = document.getElementById("num-jogadores");
    const numStartups = numStartupsEl ? parseInt(numStartupsEl.value) : 2;
    const numJogadores = numJogadoresEl ? parseInt(numJogadoresEl.value) : 3;

    equipesFormsContainer.innerHTML = "";
    setupNavigation.innerHTML = "";
    currentSetupStep = 0;
    const configHtml = `
        <fieldset data-step="0">
            <legend>Configuração Geral</legend>
            <div class="setup-config-bar">
                <div class="form-group">
                    <label for="num-startups">Número de Startups:</label>
                    <input type="number" id="num-startups" min="1" max="4" value="${numStartups}" />
                </div>
                <div class="form-group">
                    <label for="num-jogadores">Jogadores por Equipe:</label>
                    <select id="num-jogadores">
                        <option value="3" ${numJogadores === 3 ? 'selected' : ''}>3 Jogadores</option>
                        <option value="4" ${numJogadores === 4 ? 'selected' : ''}>4 Jogadores</option>
                    </select>
                </div>
            </div>
        </fieldset>
    `;
    equipesFormsContainer.innerHTML += configHtml;

    const configNavBtn = document.createElement("button");
    configNavBtn.type = "button";
    configNavBtn.className = "setup-nav-btn";
    configNavBtn.innerText = "Config. Geral";
    configNavBtn.setAttribute("data-step", 0);
    configNavBtn.addEventListener("click", () => navigateToSetupStep(0));
    setupNavigation.appendChild(configNavBtn);

    for (let i = 0; i < numStartups; i++) {
        const navBtn = document.createElement("button");
        navBtn.type = "button";
        navBtn.className = "setup-nav-btn";
        navBtn.innerText = `Startup ${i + 1}`;
        navBtn.setAttribute("data-step", i + 1); 
        navBtn.addEventListener("click", () => navigateToSetupStep(i + 1));
        navBtn.disabled = true; 
        setupNavigation.appendChild(navBtn);

        let jogadoresHtml = "";
        for (let j = 0; j < numJogadores; j++) {
            jogadoresHtml += `
                <div class="form-group">
                    <label for="jogador-nome-${i}-${j}">Jogador ${j + 1} Nome:</label>
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
            <fieldset data-step="${i + 1}"> <legend>Configuração da Startup ${i + 1}</legend>
                <div class="form-group"><label for="startup-nome-${i}">Nome da Startup:</label><input type="text" id="startup-nome-${i}" required></div>
                <div class="form-group"><label for="ideia-negocio-${i}">Ideia de Negócio:</label><input type="text" id="ideia-negocio-${i}" placeholder="Ex: Um app de delivery para pets" required></div>
                ${jogadoresHtml}
            </fieldset>`;
        equipesFormsContainer.innerHTML += equipeHtml;
    }

    document.getElementById("num-startups").addEventListener("change", renderEquipeForms);
    document.getElementById("num-jogadores").addEventListener("change", renderEquipeForms);

    navigateToSetupStep(0);
}

function navigateToSetupStep(stepIndex) {
    const numStartups = parseInt(document.getElementById("num-startups").value);
    const totalSteps = numStartups + 1; 
    
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
    nextStepBtn.classList.toggle("hidden", stepIndex === totalSteps - 1);
    startGameBtn.classList.toggle("hidden", stepIndex !== totalSteps - 1);
}

async function criarLobby(e) {
    e.preventDefault();
    if (!setupForm.checkValidity()) {
        alert(
            "Por favor, preencha todos os campos obrigatórios em todas as abas."
        );
        return;
    }
    playAudio("audio-clique");

    const numStartups = parseInt(document.getElementById("num-startups").value);
    const numJogadores = parseInt(document.getElementById("num-jogadores").value);
    
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

    console.log("Enviando dados para o servidor para criar o jogo...");
    socket.emit("iniciar_jogo", { equipes: equipes });
}

socket.on("jogo_criado", (data) => {
    console.log("Jogo criado com sucesso!", data);
    sessionStorage.setItem("lobby_data", JSON.stringify(data));
    window.location.href = `/lobby?sala=${data.id_sala}`;
});

socket.on("erro_jogo", (data) => {
    console.error("Erro do servidor:", data.mensagem);
    alert(`Erro ao criar o jogo: ${data.mensagem}`);
});

homeNewGameBtn.addEventListener("click", () => {
    playAudio("audio-clique");
    homeScreen.classList.add("hidden");
    gameSetupDiv.classList.remove("hidden");
});


setupForm.addEventListener("submit", criarLobby);

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

    if (currentSetupStep === 0 || allValid) {
        navigateToSetupStep(currentSetupStep + 1);
    }
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

renderEquipeForms();
loadInitialTheme();