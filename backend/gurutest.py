import random

# Base de dados de Ações Empreendedoras
# ATUALIZAÇÃO: As 50 ações agora têm nomes e objetivos estratégicos reais.
ACOES_EMPREENDEDORAS = {
    "equipe": [
        {"id": "eq1", "nome": "Estabelecimento de Metas (OKR)"},
        {"id": "eq2", "nome": "Definição de Papéis e Responsabilidades"},
        {"id": "eq3", "nome": "Criação do Código de Cultura da Startup"},
        {"id": "eq4", "nome": "Workshop de Feedback Construtivo"},
        {"id": "eq5", "nome": "Mapeamento de Competências (Skill Matrix)"},
        {"id": "eq6", "nome": "Plano de Reuniões Eficazes (One-on-Ones)"},
        {"id": "eq7", "nome": "Pesquisa de Clima Organizacional"},
        {"id": "eq8", "nome": "Desenho do Plano de Onboarding"},
        {"id": "eq9", "nome": "Sessão de Resolução de Conflitos"},
        {"id": "eq10", "nome": "Apresentação da Visão de Longo Prazo"}
    ],
    "produto": [
        {"id": "pd1", "nome": "Brainstorming de Funcionalidades (Features)"},
        {"id": "pd2", "nome": "Criação de um Protótipo de Baixa Fidelidade"},
        {"id": "pd3", "nome": "Sessão de Teste de Usabilidade com Usuários"},
        {"id": "pd4",
            "nome": "Desenvolvimento do MVP (Mínimo Produto Viável)"},
        {"id": "pd5", "nome": "Elaboração do Roadmap do Produto"},
        {"id": "pd6",
            "nome": "Análise de Métricas de Engajamento (Analytics)"},
        {"id": "pd7", "nome": "Workshop de Design Thinking"},
        {"id": "pd8", "nome": "Definição da Proposta Única de Valor (PUV)"},
        {"id": "pd9", "nome": "Pesquisa de Tecnologias Emergentes"},
        {"id": "pd10", "nome": "Plano de Lançamento (Go-to-Market)"}
    ],
    "mercado": [
        {"id": "me1", "nome": "Estratégias de Relacionamento (CRM)"},
        {"id": "me2", "nome": "Criação de Personas de Clientes"},
        {"id": "me3",
            "nome": "Análise de Canais de Aquisição (Marketing Digital)"},
        {"id": "me4", "nome": "Desenvolvimento de Conteúdo para Redes Sociais"},
        {"id": "me5", "nome": "Campanha de E-mail Marketing"},
        {"id": "me6", "nome": "Pesquisa de Satisfação de Clientes (NPS)"},
        {"id": "me7", "nome": "Definição da Estratégia de Preços (Pricing)"},
        {"id": "me8", "nome": "Entrevistas com Clientes Potenciais"},
        {"id": "me9", "nome": "Criação de um Pitch de Vendas"},
        {"id": "me10", "nome": "Análise da Jornada do Cliente"}
    ],
    "competitividade": [
        {"id": "ct1", "nome": "Análise de Concorrentes (Benchmarking)"},
        {"id": "ct2",
            "nome": "Análise SWOT (Forças, Fraquezas, Oportunidades, Ameaças)"},
        {"id": "ct3", "nome": "Mapeamento de Tendências de Mercado"},
        {"id": "ct4", "nome": "Definição de Diferenciais Competitivos"},
        {"id": "ct5", "nome": "Plano de Adaptação a Mudanças (Pivot)"},
        {"id": "ct6", "nome": "Análise das 5 Forças de Porter"},
        {"id": "ct7", "nome": "Criação de um Plano de Expansão"},
        {"id": "ct8", "nome": "Estudo de Barreiras de Entrada no Mercado"},
        {"id": "ct9", "nome": "Registro de Propriedade Intelectual (Marca)"},
        {"id": "ct10", "nome": "Simulação de Cenários de Crise"}
    ],
    "recursos": [
        {"id": "re1", "nome": "Estimativa de Custos e Despesas"},
        {"id": "re2", "nome": "Mapa de Parceiros Estratégicos"},
        {"id": "re3", "nome": "Elaboração do Canvas de Modelo de Negócio"},
        {"id": "re4", "nome": "Projeção de Fluxo de Caixa (12 meses)"},
        {"id": "re5", "nome": "Pitch para Investidores"},
        {"id": "re6", "nome": "Análise de Fontes de Financiamento"},
        {"id": "re7", "nome": "Definição de Métricas Chave (KPIs)"},
        {"id": "re8", "nome": "Estruturação Jurídica da Empresa"},
        {"id": "re9", "nome": "Otimização de Processos (Redução de Custos)"},
        {"id": "re10", "nome": "Seleção de Ferramentas e Tecnologias (Stack)"}
    ]
}
# Ações específicas mencionadas no manual para anular eventos (garantindo que elas existam na lista acima)
ACOES_EMPREENDEDORAS["equipe"][0]["nome"] = "Estabelecimento de Metas"
ACOES_EMPREENDEDORAS["recursos"][0]["nome"] = "Estimativa de Custos e Despesas"
ACOES_EMPREENDEDORAS["recursos"][1]["nome"] = "Mapa de Parceiros Estratégicos"
ACOES_EMPREENDEDORAS["mercado"][0]["nome"] = "Estratégias de Relacionamento"


# Baralho completo de eventos
BARALHO_DE_EVENTOS = [
    {"tipo": "negativo", "nome": "Conflito de Visões", "descricao": "Diferentes visões entre os sócios sobre a direção estratégica levaram a um impasse interno.",
        "efeito": {"equipe": -1}, "anulavel_por": {"classe": "Líder", "acao": "Estabelecimento de Metas"}},
    {"tipo": "negativo", "nome": "Orçamento Subestimado", "descricao": "A startup subestimou gravemente o orçamento necessário para a operação, gerando um aperto financeiro.",
        "efeito": {"recursos": -1}, "anulavel_por": {"classe": "Guardião", "acao": "Estimativa de Custos e Despesas"}},
    {"tipo": "negativo", "nome": "Bug Crítico no Produto", "descricao": "Um bug inesperado no produto principal está causando insatisfação geral nos clientes.",
        "efeito": {"produto": -1}, "anulavel_por": {"classe": "Visionário", "acao": "Sessão de Teste de Usabilidade com Usuários"}},
    {"tipo": "negativo", "nome": "Campanha de Marketing Viral... do Concorrente", "descricao": "Seu principal concorrente lançou uma campanha de marketing brilhante que ofuscou sua marca.",
        "efeito": {"mercado": -1}, "anulavel_por": {"classe": "Desbravador", "acao": "Análise de Canais de Aquisição (Marketing Digital)"}},
    {"tipo": "negativo", "nome": "Mudança na Legislação", "descricao": "Uma nova lei no seu setor de atuação aumenta a burocracia e os custos operacionais.",
        "efeito": {"competitividade": -1}, "anulavel_por": {"classe": "Estrategista", "acao": "Simulação de Cenários de Crise"}},
    {"tipo": "positivo", "nome": "Parceria Estratégica", "descricao": "Uma parceria mutuamente benéfica foi formada, compartilhando recursos e conhecimento.",
        "efeito": {"competitividade": 1}, "condicao": {"classe": "Guardião", "acao": "Mapa de Parceiros Estratégicos"}},
    {"tipo": "positivo", "nome": "Cinco Estrelas", "descricao": "Sua startup recebeu uma onda de avaliações de cinco estrelas, fortalecendo a marca.",
        "efeito": {"mercado": 1}, "condicao": {"classe": "Desbravador", "acao": "Estratégias de Relacionamento"}},
    {"tipo": "positivo", "nome": "Talento Inesperado", "descricao": "Você conseguiu contratar um profissional excepcional que está impulsionando a equipe.",
        "efeito": {"equipe": 1}, "condicao": {"classe": "Líder", "acao": "Definição de Papéis e Responsabilidades"}},
    {"tipo": "positivo", "nome": "Investimento Anjo", "descricao": "Um investidor anjo viu potencial no seu negócio e aportou um capital inesperado.",
        "efeito": {"recursos": 1}, "condicao": {"classe": "Guardião", "acao": "Pitch para Investidores"}},
    {"tipo": "positivo", "nome": "Inovação de Ruptura", "descricao": "Sua equipe teve uma ideia genial que simplifica e melhora drasticamente o produto.",
        "efeito": {"produto": 1}, "condicao": {"classe": "Visionário", "acao": "Workshop de Design Thinking"}},
]


class Jogador:
    def __init__(self, nome, classe):
        self.nome = nome
        self.classe = classe
        self.dimensao_afinidade = self.definir_afinidade()

    def get_info(self):
        return {
            "nome": self.nome,
            "classe": self.classe,
            "dimensao_afinidade": self.dimensao_afinidade
        }

    def definir_afinidade(self):
        afinidades = {
            "Líder": "equipe",
            "Visionário": "produto",
            "Desbravador": "mercado",
            "Estrategista": "competitividade",
            "Guardião": "recursos",
        }
        return afinidades.get(self.classe)


class Startup:
    def __init__(self, nome, jogadores):
        self.nome = nome
        self.jogadores = jogadores
        self.dimensoes = {
            "equipe": 1,
            "produto": 1,
            "mercado": 1,
            "competitividade": 1,
            "recursos": 1
        }
        self.nivel = 1
        self.acoes_realizadas = []

    def get_status(self):
        return {
            "nome": self.nome,
            "nivel": self.nivel,
            "dimensoes": self.dimensoes,
            "jogadores": [j.get_info() for j in self.jogadores],
            "acoes_realizadas": self.acoes_realizadas
        }

    def aplicar_ponto(self, dimensao, pontos=1):
        if dimensao in self.dimensoes:
            self.dimensoes[dimensao] += pontos

    def checar_evolucao_nivel(self):
        pontuacoes = list(self.dimensoes.values())
        primeira_pontuacao = pontuacoes[0]

        if all(score == primeira_pontuacao for score in pontuacoes):
            if primeira_pontuacao > self.nivel:
                self.nivel = primeira_pontuacao
                return True
        return False


class Jogo:
    def __init__(self):
        self.startups = []
        self.acoes = ACOES_EMPREENDEDORAS
        self.baralho = []
        self.descarte = []
        self.reiniciar_baralho()

    def reiniciar_baralho(self):
        cartas_para_embaralhar = self.descarte if self.descarte else BARALHO_DE_EVENTOS.copy()
        self.descarte = []
        self.baralho = cartas_para_embaralhar
        random.shuffle(self.baralho)

    def comprar_carta(self):
        if not self.baralho:
            self.reiniciar_baralho()
        carta = self.baralho.pop()
        self.descarte.append(carta)
        return carta

    def iniciar_jogo(self, dados_equipes):
        self.startups = []
        for equipe in dados_equipes:
            nome_startup = equipe.get("nome_startup")
            dados_jogadores = equipe.get("jogadores")
            lista_jogadores = [Jogador(j.get("nome"), j.get(
                "classe")) for j in dados_jogadores]
            self.startups.append(Startup(nome_startup, lista_jogadores))
        return [s.get_status() for s in self.startups]

    def get_startup_by_name(self, name):
        return next((s for s in self.startups if s.nome == name), None)

    def apresentar_acao(self, startup_id, jogador_nome, acao_id, tipo_acao):
        startup = self.get_startup_by_name(startup_id)
        if not startup:
            return {"status": "erro", "mensagem": "Startup não encontrada."}

        dimensao_acao = None
        acao_obj = None
        for dim, acoes in self.acoes.items():
            for acao in acoes:
                if acao["id"] == acao_id:
                    dimensao_acao = dim
                    acao_obj = acao
                    break
            if dimensao_acao:
                break

        if not dimensao_acao:
            return {"status": "erro", "mensagem": "Ação não encontrada."}

        if tipo_acao == 'individual':
            jogador = next(
                (j for j in startup.jogadores if j.nome == jogador_nome), None)
            if not jogador:
                return {"status": "erro", "mensagem": "Jogador não encontrado."}
            if jogador.dimensao_afinidade != dimensao_acao:
                return {"status": "falha", "mensagem": f"Ação inválida. A dimensão '{dimensao_acao}' não é a de afinidade do jogador {jogador.nome} ({jogador.dimensao_afinidade})."}

        startup.aplicar_ponto(dimensao_acao)
        if acao_obj['nome'] not in startup.acoes_realizadas:
            startup.acoes_realizadas.append(acao_obj['nome'])

        subiu_de_nivel = startup.checar_evolucao_nivel()
        evento_sorteado = None
        if subiu_de_nivel:
            evento_sorteado = self.disparar_evento(startup)

        return {
            "status": "sucesso",
            "mensagem": f"Ação '{acao_obj['nome']}' apresentada! +1 ponto em '{dimensao_acao}'.",
            "subiu_de_nivel": subiu_de_nivel,
            "evento": evento_sorteado
        }

    def disparar_evento(self, startup, manual=False):
        evento = self.comprar_carta()
        evento_resultado = evento.copy()
        evento_resultado["mensagem_final"] = f"Evento: {evento['nome']} - {evento['descricao']}"

        if evento['tipo'] == 'negativo':
            anulado = False
            if any(j.classe == evento['anulavel_por']['classe'] for j in startup.jogadores):
                anulado = True
                evento_resultado[
                    "mensagem_final"] += f"\nEfeito NEGADO pela presença de um {evento['anulavel_por']['classe']}!"
            elif evento['anulavel_por']['acao'] in startup.acoes_realizadas:
                anulado = True
                evento_resultado[
                    "mensagem_final"] += f"\nEfeito NEGADO pela realização da ação '{evento['anulavel_por']['acao']}'!"

            if not anulado:
                for dimensao, valor in evento['efeito'].items():
                    startup.aplicar_ponto(dimensao, valor)
                evento_resultado[
                    "mensagem_final"] += f"\nEfeito aplicado: {list(evento['efeito'].keys())[0]} perdeu 1 ponto."
            evento_resultado['anulado'] = anulado

        elif evento['tipo'] == 'positivo':
            condicao_atendida = False
            if any(j.classe == evento['condicao']['classe'] for j in startup.jogadores):
                condicao_atendida = True
            elif evento['condicao']['acao'] in startup.acoes_realizadas:
                condicao_atendida = True

            if condicao_atendida:
                for dimensao, valor in evento['efeito'].items():
                    startup.aplicar_ponto(dimensao, valor)
                evento_resultado[
                    "mensagem_final"] += f"\nBônus ativado! Efeito aplicado: {list(evento['efeito'].keys())[0]} ganhou 1 ponto."
            else:
                evento_resultado["mensagem_final"] += "\nA equipe não cumpriu os requisitos para se beneficiar deste evento."
            evento_resultado['bonus_ativado'] = condicao_atendida

        return evento_resultado
