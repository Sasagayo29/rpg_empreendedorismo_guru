import random

ACOES_EMPREENDEDORAS = {
    "equipe": [{"id": "eq1", "nome": "Estabelecimento de Metas"}, {"id": "eq2", "nome": "Definição de Papéis e Responsabilidades"}, {"id": "eq3", "nome": "Criação do Código de Cultura da Startup"}, {"id": "eq4", "nome": "Workshop de Feedback Construtivo"}, {"id": "eq5", "nome": "Mapeamento de Competências (Skill Matrix)"}, {"id": "eq6", "nome": "Plano de Reuniões Eficazes (One-on-Ones)"}, {"id": "eq7", "nome": "Pesquisa de Clima Organizacional"}, {"id": "eq8", "nome": "Desenho do Plano de Onboarding"}, {"id": "eq9", "nome": "Sessão de Resolução de Conflitos"}, {"id": "eq10", "nome": "Apresentação da Visão de Longo Prazo"}],
    "produto": [{"id": "pd1", "nome": "Brainstorming de Funcionalidades (Features)"}, {"id": "pd2", "nome": "Criação de um Protótipo de Baixa Fidelidade"}, {"id": "pd3", "nome": "Sessão de Teste de Usabilidade com Usuários"}, {"id": "pd4", "nome": "Desenvolvimento do MVP (Mínimo Produto Viável)"}, {"id": "pd5", "nome": "Elaboração do Roadmap do Produto"}, {"id": "pd6", "nome": "Análise de Métricas de Engajamento (Analytics)"}, {"id": "pd7", "nome": "Workshop de Design Thinking"}, {"id": "pd8", "nome": "Definição da Proposta Única de Valor (PUV)"}, {"id": "pd9", "nome": "Pesquisa de Tecnologias Emergentes"}, {"id": "pd10", "nome": "Plano de Lançamento (Go-to-Market)"}],
    "mercado": [{"id": "me1", "nome": "Estratégias de Relacionamento"}, {"id": "me2", "nome": "Criação de Personas de Clientes"}, {"id": "me3", "nome": "Análise de Canais de Aquisição (Marketing Digital)"}, {"id": "me4", "nome": "Desenvolvimento de Conteúdo para Redes Sociais"}, {"id": "me5", "nome": "Campanha de E-mail Marketing"}, {"id": "me6", "nome": "Pesquisa de Satisfação de Clientes (NPS)"}, {"id": "me7", "nome": "Definição da Estratégia de Preços (Pricing)"}, {"id": "me8", "nome": "Entrevistas com Clientes Potenciais"}, {"id": "me9", "nome": "Criação de um Pitch de Vendas"}, {"id": "me10", "nome": "Análise da Jornada do Cliente"}],
    "competitividade": [{"id": "ct1", "nome": "Análise de Concorrentes (Benchmarking)"}, {"id": "ct2", "nome": "Análise de SWOT (Forças, Fraquezas, Oportunidades, Ameaças)"}, {"id": "ct3", "nome": "Mapeamento de Tendências de Mercado"}, {"id": "ct4", "nome": "Definição de Diferenciais Competitivos"}, {"id": "ct5", "nome": "Plano de Adaptação a Mudanças (Pivot)"}, {"id": "ct6", "nome": "Análise das 5 Forças de Porter"}, {"id": "ct7", "nome": "Criação de um Plano de Expansão"}, {"id": "ct8", "nome": "Estudo de Barreiras de Entrada no Mercado"}, {"id": "ct9", "nome": "Registro de Propriedade Intelectual (Marca)"}, {"id": "ct10", "nome": "Simulação de Cenários de Crise"}],
    "recursos": [{"id": "re1", "nome": "Estimativa de Custos e Despesas"}, {"id": "re2", "nome": "Mapa de Parceiros Estratégicos"}, {"id": "re3", "nome": "Elaboração do Canvas de Modelo de Negócio"}, {"id": "re4", "nome": "Projeção de Fluxo de Caixa (12 meses)"}, {"id": "re5", "nome": "Pitch para Investidores"}, {"id": "re6", "nome": "Análise de Fontes de Financiamento"}, {"id": "re7", "nome": "Definição de Métricas Chave (KPIs)"}, {"id": "re8", "nome": "Estruturação Jurídica da Empresa"}, {"id": "re9", "nome": "Otimização de Processos (Redução de Custos)"}, {"id": "re10", "nome": "Seleção de Ferramentas e Tecnologias (Stack)"}]
}

BARALHO_DE_EVENTOS = [
    {"tipo": "negativo", "nome": "Conflito de Visões", "descricao": "Diferentes visões entre os sócios sobre a direção estratégica levaram a um impasse interno.", "efeito": {"equipe": -1}, "anulavel_por": {"classe": "Líder", "acao": "Estabelecimento de Metas"}},
    {"tipo": "negativo", "nome": "Orçamento Subestimado", "descricao": "A startup subestimou gravemente o orçamento para a operação, gerando um aperto financeiro.", "efeito": {"recursos": -1}, "anulavel_por": {"classe": "Guardião", "acao": "Estimativa de Custos e Despesas"}},
    {"tipo": "negativo", "nome": "Bug Crítico no Produto", "descricao": "Um bug inesperado no produto principal está causando insatisfação geral nos clientes.", "efeito": {"produto": -1}, "anulavel_por": {"classe": "Visionário", "acao": "Sessão de Teste de Usabilidade com Usuários"}},
    {"tipo": "negativo", "nome": "Marketing Viral... do Concorrente", "descricao": "Seu principal concorrente lançou uma campanha de marketing brilhante que ofuscou sua marca.", "efeito": {"mercado": -1}, "anulavel_por": {"classe": "Desbravador", "acao": "Análise de Canais de Aquisição (Marketing Digital)"}},
    {"tipo": "negativo", "nome": "Mudança na Legislação", "descricao": "Uma nova lei no seu setor aumenta a burocracia e os custos operacionais.", "efeito": {"competitividade": -1}, "anulavel_por": {"classe": "Estrategista", "acao": "Simulação de Cenários de Crise"}},
    {"tipo": "positivo", "nome": "Parceria Estratégica", "descricao": "Uma parceria mutuamente benéfica foi formada, compartilhando recursos e conhecimento.", "efeito": {"competitividade": 1}, "condicao": {"classe": "Guardião", "acao": "Mapa de Parceiros Estratégicos"}},
    {"tipo": "positivo", "nome": "Cinco Estrelas", "descricao": "Sua startup recebeu uma onda de avaliações de cinco estrelas, fortalecendo a marca.", "efeito": {"mercado": 1}, "condicao": {"classe": "Desbravador", "acao": "Estratégias de Relacionamento"}},
    {"tipo": "positivo", "nome": "Talento Inesperado", "descricao": "Você conseguiu contratar um profissional excepcional que está impulsionando a equipe.", "efeito": {"equipe": 1}, "condicao": {"classe": "Líder", "acao": "Definição de Papéis e Responsabilidades"}},
    {"tipo": "positivo", "nome": "Investimento Anjo", "descricao": "Um investidor anjo viu potencial no seu negócio e aportou um capital inesperado.", "efeito": {"recursos": 1}, "condicao": {"classe": "Guardião", "acao": "Pitch para Investidores"}},
    {"tipo": "positivo", "nome": "Inovação de Ruptura", "descricao": "Sua equipe teve uma ideia genial que simplifica e melhora drasticamente o produto.", "efeito": {"produto": 1}, "condicao": {"classe": "Visionário", "acao": "Workshop de Design Thinking"}},
    {"tipo": "negativo", "nome": "Burnout na Equipe", "descricao": "A pressão por resultados levou membros chave da equipe à exaustão, diminuindo a produtividade.", "efeito": {"equipe": -1}, "anulavel_por": {"classe": "Líder", "acao": "Pesquisa de Clima Organizacional"}},
    {"tipo": "negativo", "nome": "Feedback Negativo Viral", "descricao": "Um cliente influente publicou uma crítica negativa sobre seu produto que ganhou muita visibilidade.", "efeito": {"mercado": -1}, "anulavel_por": {"classe": "Desbravador", "acao": "Estratégias de Relacionamento"}},
    {"tipo": "negativo", "nome": "Dívida Técnica Urgente", "descricao": "Soluções rápidas no código inicial agora cobram seu preço, exigindo uma refatoração que atrasa novas funcionalidades.", "efeito": {"produto": -2}, "anulavel_por": {"classe": "Visionário", "acao": "Elaboração do Roadmap do Produto"}},
    {"tipo": "negativo", "nome": "Aumento no Custo de Aquisição", "descricao": "Os canais de marketing ficaram mais caros, tornando mais difícil atrair novos clientes com o mesmo orçamento.", "efeito": {"recursos": -1}, "anulavel_por": {"classe": "Guardião", "acao": "Análise de Canais de Aquisição (Marketing Digital)"}},
    {"tipo": "negativo", "nome": "Concorrente Recebe Aporte", "descricao": "Seu principal concorrente acaba de receber uma grande rodada de investimentos e está intensificando as operações.", "efeito": {"competitividade": -1}, "anulavel_por": {"classe": "Estrategista", "acao": "Análise de Concorrentes (Benchmarking)"}},
    {"tipo": "negativo", "nome": "Perda de Dados", "descricao": "Uma falha no servidor corrompeu dados importantes, exigindo tempo e recursos para recuperação.", "efeito": {"recursos": -1, "produto": -1}, "anulavel_por": {"classe": "Guardião", "acao": "Seleção de Ferramentas e Tecnologias (Stack)"}},
    {"tipo": "positivo", "nome": "Destaque na Mídia", "descricao": "Um portal de notícias publicou uma matéria elogiosa sobre sua startup, gerando publicidade gratuita e credibilidade.", "efeito": {"mercado": 2}, "condicao": {"classe": "Desbravador", "acao": "Criação de um Pitch de Vendas"}},
    {"tipo": "positivo", "nome": "Descoberta de um Growth Hack", "descricao": "Sua equipe descobriu uma maneira inovadora e de baixo custo para acelerar o crescimento de usuários.", "efeito": {"produto": 1, "mercado": 1}, "condicao": {"classe": "Visionário", "acao": "Análise de Métricas de Engajamento (Analytics)"}},
    {"tipo": "positivo", "nome": "Convite para Aceleração", "descricao": "Sua startup foi selecionada para um prestigiado programa de aceleração, ganhando mentoria e networking.", "efeito": {"recursos": 1, "competitividade": 1}, "condicao": {"classe": "Estrategista", "acao": "Pitch para Investidores"}},
    {"tipo": "positivo", "nome": "Processo Otimizado", "descricao": "A implementação de uma nova ferramenta de gestão aumentou a produtividade de toda a equipe.", "efeito": {"equipe": 1}, "condicao": {"classe": "Líder", "acao": "Otimização de Processos (Redução de Custos)"}},
    {"tipo": "positivo", "nome": "Parceria com Universidade", "descricao": "Uma universidade local propôs uma parceria para pesquisa, trazendo novas ideias e talentos para o seu produto.", "efeito": {"produto": 1, "recursos": 1}, "condicao": {"classe": "Guardião", "acao": "Mapa de Parceiros Estratégicos"}},
    {"tipo": "positivo", "nome": "Concorrente Encerra Operações", "descricao": "Um de seus concorrentes diretos anunciou que está fechando, abrindo uma nova fatia de mercado para você.", "efeito": {"competitividade": 2}, "condicao": {"classe": "Estrategista", "acao": "Análise de Concorrentes (Benchmarking)"}},
]

BARALHO_DE_CONDICOES = [
    {"id": "c1", "nome": "Turno Normal", "descricao": "O mercado está estável. Todas as ações valem 1 ponto.", "efeito": {}},
    {"id": "c2", "nome": "Boom Tecnológico", "descricao": "Novas tecnologias emergem! Ações de 'Produto' valem +2 pontos este turno.", "efeito": {"dimensao": "produto", "pontos": 2}},
    {"id": "c3", "nome": "Alta Demanda de Mercado", "descricao": "Os clientes estão procurando soluções! Ações de 'Mercado' valem +2 pontos este turno.", "efeito": {"dimensao": "mercado", "pontos": 2}},
    {"id": "c4", "nome": "Crise Econômica", "descricao": "Investidores estão cautelosos! Ações de 'Recursos' valem 0 pontos este turno.", "efeito": {"dimensao": "recursos", "pontos": 0}},
    {"id": "c5", "nome": "Guerra de Talentos", "descricao": "Encontrar bons profissionais está difícil! Ações de 'Equipe' valem 0 pontos este turno.", "efeito": {"dimensao": "equipe", "pontos": 0}},
    {"id": "c6", "nome": "Mercado Saturado", "descricao": "A competição está acirrada! Ações de 'Competitividade' valem +2 pontos este turno.", "efeito": {"dimensao": "competitividade", "pontos": 2}}
]


class Jogador:
    def __init__(self, nome, classe):
        self.nome = nome
        self.classe = classe
        self.dimensao_afinidade = self.definir_afinidade()
        self.descricao = self.definir_descricao()
        self.habilidade_usada = False 

    def get_info(self):
        return {
            "nome": self.nome,
            "classe": self.classe,
            "dimensao_afinidade": self.dimensao_afinidade,
            "descricao": self.descricao,
            "habilidade_usada": self.habilidade_usada
        }

    def definir_afinidade(self):
        afinidades = {"Líder": "equipe", "Visionário": "produto", "Desbravador": "mercado",
                      "Estrategista": "competitividade", "Guardião": "recursos"}
        return afinidades.get(self.classe)

    def definir_descricao(self):
        descricoes = {
            "Líder": "Possuem um talento especial para manter equipes motivadas e produtivas. Sua liderança promove a harmonia, a colaboração e contribui para o desenvolvimento pessoal dos colaboradores.",
            "Visionário": "Destacados por sua grande criatividade e habilidade para dominar novas tecnologias. Inspiram suas equipes a 'pensar fora da caixa' e mantêm um foco constante no aprimoramento dos produtos e serviços.",
            "Desbravador": "Empreendedores dotados de uma capacidade de comunicação excepcional. Têm um talento especial para identificar e atrair clientes, transmitindo com eficácia os valores e vantagens da empresa.",
            "Estrategista": "Notáveis por sua percepção apurada, habilidade em antecipar cenários futuros e adaptar a empresa às mudanças. Buscam ativamente informações que possam beneficiar o negócio.",
            "Guardião": "Se distinguem por sua excepcional capacidade de raciocínio lógico. São especialistas em otimizar o uso de recursos e excelentes na construção de argumentos para captar investimentos."
        }
        return descricoes.get(self.classe, "Classe desconhecida.")


class Startup:
    def __init__(self, nome, jogadores, ideia_negocio):
        self.nome = nome
        self.ideia_negocio = ideia_negocio
        self.jogadores = jogadores
        self.dimensoes = {"equipe": 1, "produto": 1,
                          "mercado": 1, "competitividade": 1, "recursos": 1}
        self.nivel = 1
        self.acoes_realizadas = []
        self.esta_eliminada = False
        self.buffs = {"analise_de_risco": False} 

    def get_status(self):
        return {
            "nome": self.nome, 
            "ideia_negocio": self.ideia_negocio, 
            "nivel": self.nivel, 
            "dimensoes": self.dimensoes, 
            "jogadores": [j.get_info() for j in self.jogadores], 
            "acoes_realizadas": self.acoes_realizadas,
            "esta_eliminada": self.esta_eliminada,
            "buffs": self.buffs
        }
    
    def get_jogador_by_name(self, nome_jogador):
        return next((j for j in self.jogadores if j.nome == nome_jogador), None)

    def eliminar_startup(self):
        self.esta_eliminada = True
        self.nivel = 0
        self.dimensoes = {dim: 0 for dim in self.dimensoes}

    def aplicar_ponto(self, dimensao, pontos=1):
        if dimensao in self.dimensoes and not self.esta_eliminada:
            if pontos == 0:
                return
            self.dimensoes[dimensao] += pontos
            if self.dimensoes[dimensao] <= 0:
                self.eliminar_startup()

    def checar_evolucao_nivel(self):
        if self.esta_eliminada:
            return False
        pontuacoes = list(self.dimensoes.values())
        if all(score == pontuacoes[0] for score in pontuacoes) and pontuacoes[0] > self.nivel:
            self.nivel = pontuacoes[0]
            return True
        return False


class Jogo:
    def __init__(self):
        self.startups = []
        self.acoes = ACOES_EMPREENDEDORAS
        self.baralho = []
        self.descarte = []
        self.reiniciar_baralho()
        self.jogo_terminado = False
        self.vencedor = None
        self.fase_atual = "COLETIVA" 
        self.submissoes_pendentes = {} 
        self.condicao_mercado_atual = BARALHO_DE_CONDICOES[0]

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

    def sortear_condicao_mercado(self):
        nova_condicao = random.choice(BARALHO_DE_CONDICOES[1:]) 
        self.condicao_mercado_atual = nova_condicao
        return nova_condicao

    def iniciar_jogo(self, dados_equipes):
        self.startups = []
        self.jogo_terminado = False
        self.vencedor = None
        self.fase_atual = "COLETIVA"
        self.submissoes_pendentes = {}
        self.condicao_mercado_atual = BARALHO_DE_CONDICOES[0] 
        
        for equipe in dados_equipes:
            nome_startup = equipe.get("nome_startup")
            ideia_negocio = equipe.get("ideia_negocio", "Não definida")
            dados_jogadores = equipe.get("jogadores")
            lista_jogadores = [Jogador(j.get("nome"), j.get(
                "classe")) for j in dados_jogadores]
            nova_startup = Startup(nome_startup, lista_jogadores, ideia_negocio)
            self.startups.append(nova_startup)
            self.submissoes_pendentes[nome_startup] = {"coletiva": None, "individual": None, "habilidade": None}

        return [s.get_status() for s in self.startups]

    def avancar_fase(self):
        """Avança o estado do jogo de uma fase para a próxima."""
        if self.fase_atual == "COLETIVA":
            self.fase_atual = "INDIVIDUAL"
        elif self.fase_atual == "INDIVIDUAL":
            self.fase_atual = "RESOLUCAO"
        elif self.fase_atual == "RESOLUCAO":
            self.fase_atual = "COLETIVA"
            self.limpar_submissoes_pendentes() 
            self.sortear_condicao_mercado()
        
        return self.fase_atual

    def limpar_submissoes_pendentes(self):
        """Limpa as submissões pendentes E OS BUFFS para todas as startups ativas."""
        for startup in self.startups:
            if not startup.esta_eliminada:
                self.submissoes_pendentes[startup.nome] = {"coletiva": None, "individual": None, "habilidade": None}
                startup.buffs = {"analise_de_risco": False}

    def get_startup_by_name(self, name):
        return next((s for s in self.startups if s.nome == name), None)

    def get_status_completo(self):
        """Retorna o estado completo do jogo para o frontend."""
        return {
            "startups": [s.get_status() for s in self.startups],
            "acoesDisponiveis": self.acoes,
            "fase_atual": self.fase_atual,
            "submissoes_pendentes": self.submissoes_pendentes, 
            "jogo_terminado": self.jogo_terminado,
            "vencedor": self.vencedor.nome if self.vencedor else None,
            "condicao_mercado_atual": self.condicao_mercado_atual
        }

    def registrar_acao_aprovada(self, acao_data):
        """Guarda uma ação aprovada pelo Mestre, pronta para a resolução."""
        nome_startup = acao_data['nome_startup']
        tipo_acao = acao_data['tipo_acao'] 
        
        if nome_startup not in self.submissoes_pendentes:
            return {"status": "erro", "mensagem": "Startup não encontrada nas submissões."}
            
        if tipo_acao == 'habilidade':
            startup = self.get_startup_by_name(nome_startup)
            if startup:
                jogador = startup.get_jogador_by_name(acao_data['jogador_nome'])
                if jogador and not jogador.habilidade_usada:
                    jogador.habilidade_usada = True
                else:
                    return {"status": "erro", "mensagem": "Habilidade já usada ou jogador não encontrado."}
            
            self.submissoes_pendentes[nome_startup]['habilidade'] = acao_data
            
        elif tipo_acao == 'individual':
             self.submissoes_pendentes[nome_startup][tipo_acao] = acao_data
        elif tipo_acao == 'coletiva':
             self.submissoes_pendentes[nome_startup][tipo_acao] = acao_data
        
        return {"status": "sucesso", "mensagem": f"Ação {tipo_acao} de {nome_startup} registada."}


    def resolver_turno_completo(self):
        """Executa todas as ações pendentes, aplica pontos e dispara eventos."""
        
        if self.fase_atual != "INDIVIDUAL":
            return {"status": "erro", "mensagem": "Não é a fase de resolução (a fase atual não é INDIVIDUAL)."}

        logs = []
        eventos = []
        
        tipos_de_acao = ["habilidade", "coletiva", "individual"]
        
        for tipo in tipos_de_acao:
            for nome_startup, acoes in self.submissoes_pendentes.items():
                acao_data = acoes.get(tipo)
                if not acao_data:
                    continue 

                startup = self.get_startup_by_name(nome_startup)
                if not startup or startup.esta_eliminada:
                    continue

                acao_id = acao_data.get('id') 
                if not acao_id:
                    if tipo != 'habilidade': 
                        logs.append(f"Erro: Ação {acao_data.get('acao_nome')} da {nome_startup} não continha um 'id'.")
        
                if tipo == 'habilidade':
                    classe_jogador = acao_data.get('classe_jogador')
                    log_msg = ""
                    
                    if classe_jogador == 'Guardião':
                        startup.aplicar_ponto('recursos', 2)
                        startup.aplicar_ponto('equipe', -1)
                        log_msg = f"({nome_startup}) {acao_data['jogador_nome']} usou 'Rodada de Investimento'! (+2 Recursos, -1 Equipe)"
                        
                    elif classe_jogador == 'Desbravador':
                        alvo_nome = acao_data.get('alvo')
                        alvo_startup = self.get_startup_by_name(alvo_nome)
                        if alvo_startup and not alvo_startup.esta_eliminada:
                            startup.aplicar_ponto('mercado', 1)
                            alvo_startup.aplicar_ponto('mercado', -1)
                            log_msg = f"({nome_startup}) {acao_data['jogador_nome']} usou 'Marketing Agressivo'! (+1 Mercado) | ({alvo_nome}) perdeu 1 de Mercado."
                        else:
                            log_msg = f"({nome_startup}) {acao_data['jogador_nome']} usou 'Marketing Agressivo', mas o alvo era inválido. Apenas +1 Mercado foi ganho."
                            startup.aplicar_ponto('mercado', 1) 
                            
                    elif classe_jogador == 'Visionário':
                        dimensao_acao, acao_obj = self.find_acao_by_id(acao_id)
                        if dimensao_acao == 'produto' and acao_obj:
                            startup.aplicar_ponto('produto', 1) 
                            log_msg = f"({nome_startup}) {acao_data['jogador_nome']} usou 'Iteração Rápida' em '{acao_obj['nome']}'! (+1 Produto)"
                        else:
                             log_msg = f"({nome_startup}) {acao_data['jogador_nome']} usou 'Iteração Rápida' mas falhou."
                    
                    elif classe_jogador == 'Líder':
                        dimensao_acao, acao_obj = self.find_acao_by_id(acao_id)
                        if dimensao_acao == 'equipe' and acao_obj:
                            startup.aplicar_ponto('equipe', 1) 
                            log_msg = f"({nome_startup}) {acao_data['jogador_nome']} usou 'Liderar pelo Exemplo' em '{acao_obj['nome']}'! (+1 Equipe)"
                        else:
                             log_msg = f"({nome_startup}) {acao_data['jogador_nome']} usou 'Liderar pelo Exemplo' mas falhou."
                    
                    elif classe_jogador == 'Estrategista':
                        startup.buffs["analise_de_risco"] = True 
                        log_msg = f"({nome_startup}) {acao_data['jogador_nome']} usou 'Análise de Risco'! A startup está protegida do próximo evento negativo neste turno."
                    
                    if log_msg:
                        logs.append({"mensagem": log_msg, "tipo": "log-sucesso"})
                    
                    continue 
                
                dimensao_acao, acao_obj = self.find_acao_by_id(acao_id)
                
                if not dimensao_acao:
                    logs.append(f"Erro: Ação {acao_data.get('acao_nome')} não encontrada.")
                    continue

                if acao_obj['nome'] not in startup.acoes_realizadas:
                    pontos_a_aplicar = 1 
                    condicao = self.condicao_mercado_atual.get("efeito", {})
                    if condicao.get("dimensao") == dimensao_acao:
                        pontos_a_aplicar = condicao.get("pontos", 1)
                    
                    startup.aplicar_ponto(dimensao_acao, pontos_a_aplicar)
                    startup.acoes_realizadas.append(acao_obj['nome'])
                    
                    log_efeito = ""
                    if pontos_a_aplicar > 1:
                        log_efeito = f" (Bônus de Mercado! +{pontos_a_aplicar} pontos)"
                    elif pontos_a_aplicar == 0:
                        log_efeito = " (Crise de Mercado! 0 pontos)"
                    else:
                        log_efeito = f" (+{pontos_a_aplicar} ponto)"
                    
                    logs.append({
                        "mensagem": f"Ação '{acao_obj['nome']}' (de {acao_data['jogador_nome']}) da {nome_startup} foi resolvida!{log_efeito} em '{dimensao_acao}'.",
                        "tipo": "log-normal"
                    })
                else:
                     logs.append({
                        "mensagem": f"Ação '{acao_obj['nome']}' (de {nome_startup}) já foi realizada. Nenhum ponto ganho.",
                        "tipo": "log-aviso"
                    })

        for startup in self.startups:
            if startup.esta_eliminada:
                continue

            subiu_de_nivel = startup.checar_evolucao_nivel()
            if subiu_de_nivel:
                logs.append({
                    "mensagem": f"A startup {startup.nome} subiu de nível!",
                    "tipo": "log-info"
                })
                evento = self.disparar_evento(startup) 
                if evento:
                    eventos.append({"startup_nome": startup.nome, "evento": evento})
                    
                    tipo_log_evento = "log-normal"
                    if evento['tipo'] == 'positivo': tipo_log_evento = "log-sucesso"
                    elif evento.get('anulado'): tipo_log_evento = "log-info"
                    elif "ELIMINADA" in evento['mensagem_final']: tipo_log_evento = "log-perigo"
                    else: tipo_log_evento = "log-aviso"
                    
                    logs.append({"mensagem": f"({startup.nome}) {evento['mensagem_final']}", "tipo": tipo_log_evento})

        startups_ativas = [s for s in self.startups if not s.esta_eliminada]
        
        if len(startups_ativas) == 1 and not self.jogo_terminado:
            self.jogo_terminado = True
            self.vencedor = startups_ativas[0]
            eventos = [] 
        
        for startup in startups_ativas:
            if startup.nivel == 5 and not self.jogo_terminado:
                self.jogo_terminado = True
                self.vencedor = startup
                eventos = []
                break
        
        self.avancar_fase()

        return {
            "status": "sucesso",
            "logs": logs,
            "eventos": eventos,
            "jogo_terminado": self.jogo_terminado,
            "vencedor": self.vencedor.nome if self.vencedor else None
        }

    def find_acao_by_id(self, acao_id):
        """Helper para encontrar uma ação e sua dimensão pelo ID."""
        for dim, lista_acoes in self.acoes.items():
            for acao in lista_acoes:
                if acao["id"] == acao_id:
                    return dim, acao
        return None, None

    def disparar_evento(self, startup): 
        evento = self.comprar_carta()
        evento_resultado = evento.copy()
        evento_resultado["mensagem_final"] = f"Evento: {evento['nome']} - {evento['descricao']}"

        if evento['tipo'] == 'negativo':
            anulado = False
            
            if startup.buffs.get("analise_de_risco"):
                anulado = True
                startup.buffs["analise_de_risco"] = False 
                evento_resultado["mensagem_final"] += f"\nEfeito NEGADO pela habilidade 'Análise de Risco' do Estrategista!"
            
            elif any(j.classe == evento['anulavel_por']['classe'] for j in startup.jogadores):
                anulado = True
                evento_resultado["mensagem_final"] += f"\nEfeito NEGADO pela presença de um {evento['anulavel_por']['classe']}!"
            elif evento['anulavel_por']['acao'] in startup.acoes_realizadas:
                anulado = True
                evento_resultado["mensagem_final"] += f"\nEfeito NEGADO pela realização da ação '{evento['anulavel_por']['acao']}'!"

            if not anulado:
                for dimensao, valor in evento['efeito'].items():
                    startup.aplicar_ponto(dimensao, valor)
                
                if startup.esta_eliminada:
                    evento_resultado["mensagem_final"] += f"\nDesastre! A startup {startup.nome} não resistiu ao impacto e foi ELIMINADA!"
                else:
                    evento_resultado["mensagem_final"] += f"\nEfeito aplicado: {list(evento['efeito'].keys())[0]} perdeu {abs(sum(evento['efeito'].values()))} ponto(s)."
            
            evento_resultado['anulado'] = anulado

        elif evento['tipo'] == 'positivo':
            condicao_atendida = any(j.classe == evento['condicao']['classe']
                                    for j in startup.jogadores) or evento['condicao']['acao'] in startup.acoes_realizadas

            if condicao_atendida:
                for dimensao, valor in evento['efeito'].items():
                    startup.aplicar_ponto(dimensao, valor)
                evento_resultado["mensagem_final"] += f"\nBônus ativado! Efeito aplicado: {list(evento['efeito'].keys())[0]} ganhou {sum(evento['efeito'].values())} ponto(s)."
            else:
                evento_resultado["mensagem_final"] += "\nA equipe não cumpriu os requisitos para se beneficiar deste evento."
            evento_resultado['bonus_ativado'] = condicao_atendida

        return evento_resultado