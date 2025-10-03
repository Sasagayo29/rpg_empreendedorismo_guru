# 🧠 Empreendedorismo Guru Web


**Empreendedorismo Guru** é um jogo web educacional interativo que simula a jornada de startups em ambientes empreendedores. O objetivo é ensinar conceitos como tomada de decisão, trabalho em equipe e planejamento estratégico de forma gamificada.

<img src="frontend/css/img/Logo.svg" alt="Logo do Jogo" width="150" />

---

## 🚀 Visão Geral

- Monte equipes de startups com jogadores e ideias de negócio;
- Atribua classes empreendedoras como **Líder**, **Visionário**, **Desbravador**;
- Execute **ações coletivas e individuais** por turno;
- Acompanhe o progresso via **gráficos radar**;
- Receba feedbacks e eventos durante o jogo.

---

## 🛠️ Tecnologias Utilizadas

- ### Frontend:

- HTML, CSS, JavaScript
- **Visualização de Dados**: [Chart.js](https://www.chartjs.org/)
- **Backend esperado**: API REST (ex: Flask/Python)
- **Ambiente de desenvolvimento local**: Python ou qualquer servidor HTTP simples
- ### Backend

- Python 3.x
- Flask
- Flask-CORS


---

## 📁 Estrutura de Diretórios

````
├── frontend
│ ├── css/
│ ├── js/
│ ├── img/
│ └── index.html
├── backend
│ ├── guru.py
│ └── app.py ← (servidor Flask)
└── README.md
````

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge etc.)
- Backend rodando em `http://127.0.0.1:5000` (veja abaixo)
- Python 3 (para rodar servidor local simples, se desejar)

## Executando o frontend

### 1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/empreendedorismo-guru.git
cd empreendedorismo-guru/frontend
````
### 2. Instale as dependências do backend

Certifique-se de ter o Python 3.x instalado.
````
cd backend
pip install flask flask-cors
````
Ou use um ambiente virtual:
````
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
pip install flask flask-cors
````

### 3. Inicie o backend:

```
python app.py
````

O backend estará disponível em:
`http://127.0.0.1:5000`

### 4. Abra o Frontend

#### Opção 1: Abrir diretamente

Abra o arquivo frontend/index.html no navegador.

#### Opção 2: Rodar um servidor local (opcional)

Se quiser usar um servidor estático:
````
cd frontend
python -m http.server 8000
````
Depois acesse: `http://localhost:8000`

## 🔗 Endpoints da API (Flask)

| Método | Rota                               | Descrição                               |
| ------ | ---------------------------------- | --------------------------------------- |
| GET    | `/`                                | Retorna o HTML principal                |
| POST   | `/iniciar_jogo`                    | Inicia um novo jogo                     |
| GET    | `/<jogo_id>/status`                | Retorna o status atual do jogo          |
| POST   | `/<jogo_id>/apresentar_acao`       | Envia uma ação (coletiva ou individual) |
| POST   | `/<jogo_id>/sortear_evento_manual` | Sorteia um evento manualmente           |

## 🧪 Exemplo de JSON para /iniciar_jogo
````
{
  "equipes": [
    {
      "nome_startup": "TechPet",
      "ideia_negocio": "App de delivery para pets",
      "jogadores": [
        { "nome": "Alice", "classe": "Líder" },
        { "nome": "Bob", "classe": "Estrategista" },
        { "nome": "Carol", "classe": "Visionário" }
      ]
    }
  ]
}
````

## 🚀 Funcionalidades

- ✅ Configurar startups e equipes
- ✅ Ações empreendedoras: coletivas e individuais
- ✅ Gráficos radar com evolução das dimensões
- ✅ Log de eventos do jogo
- ✅ Sorteio manual de eventos
- ✅ Backend em Flask com rotas RESTful

---

## 🧪 Exemplos de Classes Empreendedoras

- Líder

- Visionário

- Desbravador

- Estrategista

- Guardião

## 📸 Imagens

Você pode adicionar capturas de tela aqui futuramente.

## 📄 Licença

Este projeto está sob a licença MIT
.

## 👨‍💻 Autor

Riquelmy Miyasawa Borges

🔗 [LinkedIn](https://www.linkedin.com/in/riquelmy-miyasawa-borges)

📧 riquelmymiyasawaborges@gmail.com

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.


---
