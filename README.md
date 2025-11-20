# 🚀 Empreendedorismo Guru - O Jogo

![Badge em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.dot.io&logoColor=white)

> Um jogo de simulação estratégica multiplayer em tempo real onde startups competem para dominar o mercado, gerenciar recursos e inovar, guiadas por um Mestre de Jogo.

---

## 📸 Screenshots

<div align="center">
  <img width="50%" height="937" alt="image" src="https://github.com/user-attachments/assets/bf034c1e-18a0-4e47-b354-4e20a7f29407" />
  
  <img width="20%" height="860" alt="image" src="https://github.com/user-attachments/assets/f80495d1-e7e2-48bb-bc37-f945bbae7f38" />

</div>

---

## 📋 Sobre o Projeto

**Empreendedorismo Guru** é uma experiência gamificada desenvolvida em Python projetada para ensinar conceitos de gestão, estratégia e trabalho em equipe. O jogo conecta múltiplos jogadores (Startups) e um Mestre (Game Master) em uma sala virtual via WebSocket.

Os jogadores assumem papéis específicos (Classes) dentro de suas startups e devem tomar decisões cruciais em diferentes dimensões do negócio: **Equipe, Produto, Mercado, Competitividade e Recursos**.

---

## ✨ Funcionalidades Principais

### 🎮 Gameplay
* **Multiplayer em Tempo Real:** Conexão instantânea via Flask-SocketIO com atualizações de estado ao vivo.
* **Sistema de Classes RPG:** 5 classes únicas, cada uma com habilidades especiais e afinidades:
    * 🔵 **Líder:** Focado em Equipe.
    * 🟣 **Visionário:** Focado em Produto.
    * 🔴 **Desbravador:** Focado em Mercado.
    * 🟠 **Estrategista:** Focado em Competitividade (Prevenção de riscos).
    * 🟢 **Guardião:** Focado em Recursos (Investimentos).
* **Fases de Jogo:** Turnos estruturados em Ação Individual, Ação Coletiva e Resolução do Mestre.
* **Visualização de Dados:** Gráficos de Radar (Chart.js) para acompanhar o progresso das dimensões da startup.

### 🎨 UI/UX (Interface do Usuário)
* **Design Responsivo Mobile-First:**
    * **Desktop:** HUD com efeito *Glassmorphism* e layout expandido.
    * **Mobile:** Padrão "Action Sheet" (Gaveta de Ações) moderna, maximizando a área de visualização do tabuleiro e evitando cortes de layout.
* **Temas:** Suporte nativo a **Dark Mode** (padrão) e **Light Mode**.
* **Feedback Visual:** Animações de pulso, notificações de toast e transições suaves.
* **Acessibilidade:** Cores distintas para classes e feedbacks claros de erro/sucesso.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:**
    * HTML5 Semântico.
    * CSS3 (Variáveis CSS, Flexbox, Grid, Media Queries, Backdrop-filter).
    * JavaScript (Vanilla ES6+).
    * [Chart.js](https://www.chartjs.org/) (Gráficos de Radar).
* **Backend:**
    * **Python 3.x**.
    * **Flask** (Web Framework).
    * **Flask-SocketIO** (Comunicação WebSocket em tempo real).
    * **QRCode** (Geração de códigos para entrada fácil no lobby).

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* [Python 3.8+](https://www.python.org/) instalado.
* Pip (Gerenciador de pacotes do Python).

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/empreendedorismo-guru.git](https://github.com/seu-usuario/empreendedorismo-guru.git)
    ```

2.  **Acesse a pasta do projeto:**
    ```bash
    cd empreendedorismo-guru/backend
    ```

3.  **Crie um ambiente virtual (Recomendado):**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    ```

4.  **Instale as dependências:**
    ```bash
    pip install flask flask-socketio flask-cors qrcode
    ```

5.  **Inicie o servidor:**
    ```bash
    python app.py
    ```

6.  **Acesse no navegador:**
    * Abra `http://127.0.0.1:5000`.
    * Crie uma sala como **Mestre** em uma aba.
    * Entre como **Jogador** em outras abas (ou escaneie o QR Code com o celular na mesma rede Wi-Fi).

---

## 📖 Guia das Classes

| Classe | Cor | Afinidade | Habilidade Especial | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Líder** | 🔵 Azul | Equipe | *Liderar pelo Exemplo* | Permite refazer uma ação de Equipe no turno. |
| **Visionário** | 🟣 Roxo | Produto | *Iteração Rápida* | Permite refazer uma ação de Produto para buscar inovação. |
| **Desbravador**| 🔴 Vermelho| Mercado | *Marketing Agressivo* | Ganha mercado para si e retira mercado de um oponente. |
| **Estrategista**| 🟠 Laranja | Competitividade | *Análise de Risco* | Anula um evento negativo lançado pelo Mestre. |
| **Guardião** | 🟢 Verde | Recursos | *Rodada de Investimento* | Gera recursos extras sacrificando um pouco da equipe. |

---

## 📂 Estrutura de Pastas

```
├── backend
│   ├── app.py
│   └── guru.py
├── frontend
│   ├── audio
│   │   ├── clique.mp3
│   │   ├── falha.mp3
│   │   ├── sucesso.mp3
│   │   ├── virar-carta.mp3
│   │   └── vitoria.mp3
│   ├── css
│   │   ├── img
│   │   │   ├── portraits
│   │   │   │   ├── desbravador.png
│   │   │   │   ├── estrategista.png
│   │   │   │   ├── guardiao.png
│   │   │   │   ├── lider.png
│   │   │   │   └── visionario.png
│   │   │   └── Logo.svg
│   │   └── style.css
│   ├── js
│   │   ├── iniciar.js
│   │   ├── jogador.js
│   │   ├── lobby.js
│   │   ├── mestre.js
│   │   └── script.js
│   ├── index.html
│   ├── jogador.html
│   ├── lobby.html
│   └── mestre.html
├── README.md
└── requirements.txt

```
---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir *issues* ou enviar *pull requests*.

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3.  Faça o Commit (`git commit -m 'Adicionando nova feature'`).
4.  Faça o Push (`git push origin feature/NovaFeature`).
5.  Abra um Pull Request.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Riquelmy Miyasawa Borges

🔗 [LinkedIn](https://www.linkedin.com/in/riquelmy-miyasawa-borges)

📧 riquelmymiyasawaborges@gmail.com

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.


---
