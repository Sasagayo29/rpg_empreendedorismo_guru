# Empreendedorismo Guru Web

![Empreendedorismo Guru Web](https://static.wixstatic.com/media/b7931b_d2a505f381844b24a27edcba212a56bf~mv2.png/v1/fill/w_264,h_151,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Logomarca%20Alternativa%20Empreendedorismo%20Guru.png)

Um RPG de negócios multiplayer baseado no jogo educacional "Empreendedorismo Guru". [cite_start]Este projeto é uma adaptação digital e interativa que busca simular a jornada de criação e gestão de uma startup, com foco em aprendizado e tomada de decisão estratégica.

O jogo foi projetado para ser uma ferramenta dinâmica no processo de ensino-aprendizagem em disciplinas de Empreendedorismo, Gestão ou Negócios, promovendo a participação ativa dos estudantes.

## ✨ Funcionalidades

* **Criação de Jogo Flexível:** Configure uma partida com múltiplas startups (equipes) e defina o número de jogadores por equipe (3 ou 4). 
* **Classes de Empreendedor:** Cada jogador escolhe uma das cinco classes distintas (Líder, Visionário, Desbravador, Estrategista e Guardião), cada uma com uma afinidade especial a uma das dimensões do negócio. [cite: 26, 148]
* **Cinco Dimensões de Gestão:** As startups evoluem em cinco pilares fundamentais: Equipe, Produto, Mercado, Competitividade e Recursos. 
* **Ações Empreendedoras Estratégicas:** O progresso é alcançado através da execução de 50 ações empreendedoras detalhadas, que representam tarefas e decisões reais do mundo dos negócios.
* **Sistema de Turnos e Níveis:** O jogo opera em turnos, onde cada equipe realiza uma ação coletiva e uma individual. Uma startup só avança de nível quando todas as cinco dimensões atingem uma pontuação equilibrada, simulando a necessidade de uma gestão holística.
* **Baralho de Eventos:** Ao subir de nível, um evento aleatório (positivo ou negativo) é sorteado de um baralho com mais de 20 cartas, introduzindo a incerteza e a necessidade de adaptação, elementos centrais no empreendedorismo. 
* **Dashboard Visual:** A interface apresenta um gráfico de radar para cada startup, permitindo uma visualização clara e instantânea do estado de desenvolvimento de suas cinco dimensões.

## 💻 Tecnologias Utilizadas

* **Backend:** Python 3, Flask
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
* **Bibliotecas:**
    * `Flask-Cors` para comunicação entre backend e frontend.
    * `Chart.js` для рендеринга динамических радарных диаграмм.

## 🚀 Como Executar o Projeto

Para rodar o projeto em sua máquina local, siga os passos abaixo.

1.  **Clone o Repositório**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd [NOME_DA_PASTA_DO_PROJETO]
    ```

2.  **Configure o Ambiente Backend**
    * É recomendado criar um ambiente virtual:
        ```bash
        python -m venv venv
        source venv/bin/activate  # No Windows: venv\Scripts\activate
        ```
    * Instale as dependências:
        ```bash
        pip install Flask Flask-Cors
        ```

3.  **Inicie o Servidor Backend**
    * Navegue até a pasta do backend e execute o `app.py`:
        ```bash
        cd Backend
        python app.py
        ```
    * O servidor estará rodando em `http://127.0.0.1:5000`.

4.  **Abra o Frontend**
    * Abra o arquivo `Frontend/index.html` diretamente no seu navegador de preferência (Google Chrome, Firefox, etc.).

O jogo estará pronto para ser configurado e jogado!

## 룰 Como Jogar

1.  Na tela inicial, defina o número de startups (equipes) e de jogadores por equipe.
2.  Preencha o nome da startup, a ideia de negócio e o nome e classe de cada jogador.
3.  Clique em "Iniciar Jogo".
4.  A startup da vez terá seu card destacado.
5.  **Ação Coletiva:** A equipe escolhe e clica em uma ação de qualquer uma das cinco dimensões para executar.
6.  **Ação Individual:** A equipe seleciona um dos jogadores clicando no botão com seu nome. Depois, escolhe e clica em uma ação que **obrigatoriamente** corresponda à dimensão de afinidade daquele jogador.
7.  Após as duas ações, o botão "Próximo Turno" ficará disponível.
8.  Evolua todas as dimensões de forma equilibrada para subir de nível e boa sorte com os eventos!

## 📂 Estrutura do Projeto

````bash
/Empreendedorismo-Guru-Web
|-- /Backend
|   |-- app.py      # Servidor Flask e rotas da API
|   |-- guru.py     # Lógica principal do jogo (classes, regras, eventos)
|-- /Frontend
|   |-- index.html  # Estrutura da página principal
|   |-- css/   
|       ├── style.css   # Folha de estilos
|   |-- js/
|       ├── script.js   # Lógica do cliente, interações e renderização
|-- README.md       # Este arquivo
````
## 🔮 Próximos Passos

O projeto possui uma base sólida, mas ainda há espaço para melhorias e novas funcionalidades:

-   [ ] **Reativar a "Carta de Classe":** Implementar um modal funcional que aparece ao clicar no nome de um jogador, exibindo os detalhes de sua classe.
-   [ ] **Tela de Fim de Jogo:** Criar uma tela de vitória para a última startup restante ou uma tela de empate.
-   [ ] **Salvar/Carregar Jogo:** Implementar um sistema para salvar o estado de um jogo e poder continuá-lo depois.
-   [ ] **Melhorias Visuais:** Adicionar mais elementos gráficos e animações para aumentar a imersão.
