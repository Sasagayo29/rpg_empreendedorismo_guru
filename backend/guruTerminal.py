import random
import time  # Adicionando a biblioteca time para simular o tempo de resposta

# 1. CLASSE STARTUP


class Startup:
    def __init__(self, nome, jogadores):
        self.nome = nome
        self.jogadores = jogadores
        self.nivel_equipe = 0
        self.nivel_produto = 0
        self.nivel_mercado = 0
        self.nivel_competitividade = 0
        self.nivel_recursos = 0
        self.xp = 0
        self.nivel_total = 1

    def mostrar_status(self):
        print(f"\n--- Status da Startup '{self.nome}' ---")
        print(f"Nível Atual: {self.nivel_total}")
        print(f"XP: {self.xp}")
        print(f"Pilar Equipe: Nível {self.nivel_equipe}")
        print(f"Pilar Produto: Nível {self.nivel_produto}")
        print(f"Pilar Mercado: Nível {self.nivel_mercado}")
        print(f"Pilar Competitividade: Nível {self.nivel_competitividade}")
        print(f"Pilar Recursos: Nível {self.nivel_recursos}")
        print("---------------------------------------")

    def avancar_pilar(self, pilar, xp_ganho):
        if pilar == "equipe":
            self.nivel_equipe += 1
        elif pilar == "produto":
            self.nivel_produto += 1
        elif pilar == "mercado":
            self.nivel_mercado += 1
        elif pilar == "competitividade":
            self.nivel_competitividade += 1
        elif pilar == "recursos":
            self.nivel_recursos += 1

        self.xp += xp_ganho
        print(
            f"Parabéns! O pilar de {pilar} subiu de nível! Você ganhou {xp_ganho} XP.")

        if self.xp >= self.nivel_total * 10:
            self.nivel_total += 1
            self.xp = 0
            print(
                f"\nUAU! Sua startup {self.nome} atingiu o NÍVEL {self.nivel_total}!")
            return True
        return False

    def checar_falencia(self):
        return any(
            getattr(self, f"nivel_{pilar}") < 0 for pilar in ["equipe", "produto", "mercado", "competitividade", "recursos"]
        )


# 2. CLASSE JOGADOR
class Jogador:
    def __init__(self, nome, tipo):
        self.nome = nome
        self.tipo = tipo
        self.pilar_foco = self.definir_foco()

    def __str__(self):
        return f"Nome: {self.nome} | Tipo: {self.tipo} | Foco: {self.pilar_foco.capitalize()}"

    def definir_foco(self):
        tipos = {
            "Líder": "equipe",
            "Visionário": "produto",
            "Desbravador": "mercado",
            "Estrategista": "competitividade",
            "Guardião": "recursos",
        }
        return tipos.get(self.tipo, "geral")


# 3. CLASSE JOGO
class Jogo:
    def __init__(self):
        self.startups = []
        self.pilares = ["equipe", "produto",
                        "mercado", "competitividade", "recursos"]
        self.tarefas = {
            "equipe": [
                {"desafio": "Qual a capital do Brasil?",
                    "resposta": "brasília", "xp": 10},
                {"desafio": "Quanto é 7 x 8?", "resposta": "56", "xp": 15}
            ],
            "produto": [
                {"desafio": "Você precisa de um nome para seu aplicativo de meditação. Qual nome sugere?",
                    "resposta": "calm", "xp": 12},
                {"desafio": "Qual funcionalidade você adicionaria a um app de delivery para atrair mais clientes?",
                    "resposta": "desconto", "xp": 15}
            ],
            "mercado": [
                {"desafio": "Para vender um produto de skincare vegano, quem é seu público-alvo?",
                    "resposta": "jovens", "xp": 10},
                {"desafio": "Qual a melhor rede social para um e-commerce de roupas?",
                    "resposta": "instagram", "xp": 12}
            ],
            "competitividade": [
                {"desafio": "Sua principal concorrente reduziu o preço. Você deve: (a) manter o seu preço, (b) reduzir o seu preço?", "resposta": "a", "xp": 15},
                {"desafio": "Sua empresa tem uma tecnologia única. O que a torna diferente?",
                    "resposta": "inovação", "xp": 20}
            ],
            "recursos": [
                {"desafio": "Sua receita é R$1000 e seu custo é R$600. Qual o lucro?",
                    "resposta": "400", "xp": 10},
                {"desafio": "Você recebeu R$2000 em investimentos. Se cada sócio tem 25% da empresa, quanto dinheiro cada um 'teoricamente' investiu?", "resposta": "500", "xp": 15}
            ]
        }
        self.eventos = {
            "positivo": [
                {"nome": "Parceria Estratégica", "descricao": "Uma grande empresa quer fazer uma parceria! Ganhe 1 nível no pilar 'Mercado' e 1 em 'Competitividade'.",
                    "efeito": ["mercado", "competitividade"], "tipo_efeito": "ganhar_nivel"},
                {"nome": "Investimento Anjo", "descricao": "Um investidor acreditou no seu projeto! Ganhe 50 XP extras.",
                    "efeito": 50, "tipo_efeito": "ganhar_xp"},
                {"nome": "Reconhecimento de Mercado", "descricao": "Sua startup foi destaque na mídia. Ganhe 1 nível no pilar 'Recursos'.",
                    "efeito": ["recursos"], "tipo_efeito": "ganhar_nivel"},
            ],
            "negativo": [
                {"nome": "Crise Financeira", "descricao": "O mercado entrou em recessão. Perca 1 nível em 'Recursos' e 1 em 'Mercado'.",
                    "efeito": ["recursos", "mercado"], "tipo_efeito": "perder_nivel"},
                {"nome": "Problemas de Equipe", "descricao": "Um membro importante da equipe saiu. Perca 1 nível em 'Equipe'!",
                    "efeito": ["equipe"], "tipo_efeito": "perder_nivel"},
                {"nome": "Concorrência Forte", "descricao": "Um concorrente lançou um produto superior. Perca 20 XP!",
                    "efeito": 20, "tipo_efeito": "perder_xp"},
            ]
        }
        self.missoes = [
            {
                "nome": "Lançamento de Produto",
                "descricao": "Prepare o lançamento do seu primeiro grande produto. Requer um Visionário na equipe e nível de Produto >= 1.",
                "requisitos": {"tipo_jogador": "Visionário", "pilar": "produto", "nivel_min": 1},
                "desafio": {"pergunta": "Qual a principal métrica para medir o sucesso do lançamento de um produto (a) Receita, (b) Número de usuários ativos, (c) Número de downloads?", "resposta": "b"},
                "recompensa": {"tipo_recompensa": "xp_e_nivel", "xp": 50, "pilares": ["produto", "mercado"]}
            },
            {
                "nome": "Rodada de Investimento",
                "descricao": "Apresente sua startup a um grupo de investidores para conseguir capital. Requer um Guardião na equipe e nível de Recursos >= 1.",
                "requisitos": {"tipo_jogador": "Guardião", "pilar": "recursos", "nivel_min": 1},
                "desafio": {"pergunta": "Qual o principal indicador financeiro de um investimento em startup? (a) ROI (retorno sobre o investimento), (b) Lucro, (c) Fluxo de caixa?", "resposta": "a"},
                "recompensa": {"tipo_recompensa": "xp_e_nivel", "xp": 75, "pilares": ["recursos"]}
            }
        ]
        self.eventos_especiais = {
            2: {
                "nome": "Feira de Tecnologia Local",
                "pergunta": "Sua startup ganhou um estande em uma feira. Você irá focar em: (a) Atrair público e visibilidade ou (b) Fazer contatos para futuras parcerias?",
                "opcoes": {
                    "a": {"msg": "Você se destacou e ganhou mídia. Ganhe 1 nível em 'Mercado'!", "efeito": "ganhar_nivel", "pilares": ["mercado"]},
                    "b": {"msg": "Você fez contatos valiosos. Ganhe 1 nível em 'Recursos' e 'Equipe'!", "efeito": "ganhar_nivel", "pilares": ["recursos", "equipe"]}
                }
            },
            4: {
                "nome": "Rodada de Investimento de Destaque",
                "pergunta": "Um grupo de investidores está interessado. Você precisa responder a uma pergunta de alto nível. (a) Qual a margem de lucro de sua empresa? (b) Qual o seu plano de crescimento para os próximos 5 anos?",
                "opcoes": {
                    "a": {"msg": "Sua resposta impressionou! Ganhe 2 níveis em 'Recursos'.", "efeito": "ganhar_nivel", "pilares": ["recursos", "recursos"]},
                    "b": {"msg": "Os investidores não se convenceram. Perca 2 níveis em 'Recursos'.", "efeito": "perder_nivel", "pilares": ["recursos", "recursos"]}
                }
            }
        }
        self.eventos_executados = []
        self.ataques_competitivos = {
            "guerra_de_precos": {
                "nome": "Guerra de Preços",
                "custo": 30,
                "pilar_alvo": "recursos",
                "efeito": -1,
                "msg": "Sua startup iniciou uma guerra de preços. O concorrente perdeu 1 nível no pilar de Recursos!"
            },
            "ataque_hacker": {
                "nome": "Ataque Hacker",
                "custo": 30,
                "pilar_alvo": "produto",
                "efeito": -1,
                "msg": "Você realizou um ataque hacker no produto de um rival. O concorrente perdeu 1 nível no pilar de Produto!"
            }
        }

    # NOVO: Eventos Finais de Mercado
    def checar_e_executar_evento_de_mercado(self):
        if len(self.startups) == 2:
            print("\n>>> EVENTO DE MERCADO: Cenário de Fusão e Aquisição! <<<")
            startup1 = self.startups[0]
            startup2 = self.startups[1]

            # Escolhe o tipo de evento (Fusão ou Aquisição)
            tipo_evento = random.choice(["fusao", "aquisicao"])

            if tipo_evento == "fusao":
                print(
                    f"O mercado sugere uma fusão entre '{startup1.nome}' e '{startup2.nome}'.")
                voto_fusao = input("Vocês aceitam a fusão? (s/n) ").lower()
                if voto_fusao == 's':
                    print(
                        "A fusão foi aceita! As duas startups se unem para criar um gigante de mercado.")
                    # Soma os níveis e XP
                    for pilar in self.pilares:
                        nivel_final = getattr(
                            startup1, f"nivel_{pilar}") + getattr(startup2, f"nivel_{pilar}")
                        setattr(startup1, f"nivel_{pilar}", nivel_final)
                    startup1.xp += startup2.xp
                    startup1.nivel_total = startup1.nivel_total + startup2.nivel_total
                    self.startups.remove(startup2)
                    self.finalizar_jogo_sucesso(startup1)
                    return True
                else:
                    print("A fusão foi recusada. A guerra continua!")

            elif tipo_evento == "aquisicao":
                if startup1.xp > startup2.xp:
                    comprador = startup1
                    comprado = startup2
                else:
                    comprador = startup2
                    comprado = startup1

                print(
                    f"A startup '{comprador.nome}' fez uma oferta para adquirir a startup '{comprado.nome}'!")
                voto_aquisicao = input(
                    "Vocês aceitam a oferta? (s/n) ").lower()
                if voto_aquisicao == 's':
                    print(
                        "Oferta aceita! A startup '{comprado.nome}' foi adquirida.")
                    self.startups.remove(comprado)
                    self.finalizar_jogo_sucesso(comprador)
                    return True
                else:
                    print("Oferta recusada. A batalha continua!")
        return False

    def iniciar_jogo(self):
        print("--------------------------------------")
        print(" Bem-vindo ao Empreendedorismo Guru!")
        print(" Modulo Competitivo ativado!")
        print("--------------------------------------")

        num_startups = int(input("Quantas startups participarão? (1-4) "))
        for i in range(num_startups):
            print(f"\n--- Configurando Startup {i+1} ---")
            nome_startup = input("Qual o nome da sua startup? ")
            num_jogadores = int(
                input(f"Quantos jogadores para a startup {nome_startup}? (1-5) "))

            jogadores_startup = []
            tipos_disponiveis = ["Líder", "Visionário",
                                 "Desbravador", "Estrategista", "Guardião"]

            for j in range(num_jogadores):
                nome_jogador = input(f"Nome do Jogador {j+1}: ")
                print(f"Escolha o tipo de empreendedor para {nome_jogador}:")
                for k, tipo in enumerate(tipos_disponiveis):
                    print(f"{k+1}. {tipo}")

                while True:
                    try:
                        escolha_tipo = int(
                            input("Digite o número da sua escolha: ")) - 1
                        tipo_escolhido = tipos_disponiveis.pop(escolha_tipo)
                        jogadores_startup.append(
                            Jogador(nome_jogador, tipo_escolhido))
                        break
                    except (ValueError, IndexError):
                        print(
                            "Escolha inválida. Por favor, digite um número da lista.")

            self.startups.append(Startup(nome_startup, jogadores_startup))

        print("\n--- Jogo Configurado com Sucesso! ---")
        for startup in self.startups:
            startup.mostrar_status()
            print("\nJogadores:")
            for jogador in startup.jogadores:
                print(f"- {jogador}")
            print("---------------------------------------")

    def loop_principal(self):
        while len(self.startups) > 1:
            startups_ativas = self.startups[:]
            for startup in startups_ativas:
                if startup.checar_falencia():
                    continue

                # NOVO: Checa eventos de mercado no início de cada turno
                if len(self.startups) <= 2 and self.checar_e_executar_evento_de_mercado():
                    return  # O jogo termina aqui

                print(f"\n======================================")
                print(f"É o turno da startup '{startup.nome}'!")
                print(f"======================================")

                if self.checar_e_executar_evento_especial(startup):
                    startup.mostrar_status()
                    if startup.checar_falencia():
                        self.finalizar_jogo_falencia(startup)
                        self.startups.remove(startup)
                    continue

                print("Escolha uma ação para o seu time:")
                print("1. Trabalhar nos pilares")
                print("2. Embarcar em uma missão")
                print("3. Atacar uma startup rival")

                try:
                    escolha_acao = int(
                        input("Digite o número da sua escolha: "))

                    if escolha_acao == 1:
                        self.acao_pilar(startup)
                    elif escolha_acao == 2:
                        self.acao_missao(startup)
                    elif escolha_acao == 3:
                        self.acao_atacar_rival(startup)
                    else:
                        print("Escolha inválida. Tente novamente.")
                        continue

                    if len(startup.jogadores) > 1:
                        self.oferecer_investimento_xp_multiplayer(startup)
                    else:
                        self.oferecer_investimento_xp_solo(startup)

                    startup.mostrar_status()

                    if startup.checar_falencia():
                        self.finalizar_jogo_falencia(startup)
                        self.startups.remove(startup)

                except (ValueError, IndexError):
                    print("Escolha inválida. Por favor, digite um número da lista.")
                    continue

            if len(self.startups) == 1:
                self.finalizar_jogo_sucesso(self.startups[0])
                break

    def acao_pilar(self, startup):
        print("\nEscolha um pilar para trabalhar:")
        for i, pilar in enumerate(self.pilares):
            print(f"{i+1}. {pilar.capitalize()}")

        escolha = int(input("Digite o número da sua escolha: ")) - 1
        pilar_escolhido = self.pilares[escolha]

        jogador_escolhido = self.selecionar_jogador(startup)

        tarefa_aleatoria = random.choice(self.tarefas[pilar_escolhido])
        self.executar_tarefa(
            pilar_escolhido, tarefa_aleatoria, jogador_escolhido, startup)

    def acao_atacar_rival(self, startup_atacante):
        if startup_atacante.xp < 30:
            print(
                f"Você precisa de 30 XP para realizar um ataque. Você tem apenas {startup_atacante.xp} XP.")
            return

        rivais_disponiveis = [
            s for s in self.startups if s.nome != startup_atacante.nome]

        if not rivais_disponiveis:
            print("Não há rivais para atacar no momento.")
            return

        print("\n--- Escolha um Ataque Competitivo ---")
        for i, ataque in enumerate(self.ataques_competitivos.values()):
            print(f"{i+1}. {ataque['nome']} (Custo: {ataque['custo']} XP)")
        print("0. Voltar ao menu principal")

        try:
            escolha_ataque = int(input("Digite o número do ataque: ")) - 1
            if escolha_ataque == -1:
                return

            lista_ataques = list(self.ataques_competitivos.values())
            ataque_escolhido = lista_ataques[escolha_ataque]

            print(f"\nRealizando um '{ataque_escolhido['nome']}'...")
            startup_atacante.xp -= ataque_escolhido['custo']

            alvo = random.choice(rivais_disponiveis)

            pilar_alvo_nivel = getattr(
                alvo, f"nivel_{ataque_escolhido['pilar_alvo']}")
            setattr(alvo, f"nivel_{ataque_escolhido['pilar_alvo']}",
                    pilar_alvo_nivel + ataque_escolhido['efeito'])

            print(
                f"O ataque foi bem sucedido! A startup '{alvo.nome}' foi atingida.")
            print(ataque_escolhido['msg'])

        except (ValueError, IndexError):
            print("Escolha inválida. Nenhuma ação tomada.")
            return

    def acao_missao(self, startup):
        missoes_disponiveis = [
            m for m in self.missoes if self.checar_requisitos_missao(m, startup)]

        if not missoes_disponiveis:
            print(
                "Não há missões disponíveis no momento. Trabalhe nos pilares para liberar novas missões!")
            return

        print("\n--- Missões Disponíveis ---")
        for i, missao in enumerate(missoes_disponiveis):
            print(f"{i+1}. {missao['nome']}: {missao['descricao']}")

        print("0. Voltar ao menu principal")

        try:
            escolha_missao = int(
                input("Escolha uma missão para embarcar: ")) - 1
            if escolha_missao == -1:
                return

            missao_selecionada = missoes_disponiveis[escolha_missao]
            self.executar_missao(missao_selecionada, startup)

        except (ValueError, IndexError):
            print("Escolha inválida. Nenhuma ação tomada.")

    def checar_requisitos_missao(self, missao, startup):
        requisitos = missao['requisitos']

        tem_jogador_necessario = any(
            j.tipo == requisitos['tipo_jogador'] for j in startup.jogadores)

        pilar_necessario = getattr(startup, f"nivel_{requisitos['pilar']}")
        nivel_minimo = requisitos['nivel_min']

        if tem_jogador_necessario and pilar_necessario >= nivel_minimo:
            return True
        return False

    def executar_missao(self, missao, startup):
        print(f"\n-- Embarcando na missão: {missao['nome']} --")

        print(f"Desafio: {missao['desafio']['pergunta']}")
        resposta_usuario = input("Sua resposta: ").lower()

        if resposta_usuario == missao['desafio']['resposta']:
            print("Sucesso! Missão completa! Sua equipe mostrou grande expertise.")
            recompensa = missao['recompensa']
            self.aplicar_recompensa_missao(recompensa, startup)
        else:
            print("Missão falhou. A equipe não estava preparada para o desafio.")
            startup.xp = max(0, startup.xp - 10)
            print("Sua startup perdeu 10 XP.")

    def aplicar_recompensa_missao(self, recompensa, startup):
        if recompensa['tipo_recompensa'] == "xp_e_nivel":
            startup.xp += recompensa['xp']
            print(f"Você ganhou {recompensa['xp']} XP.")
            for pilar in recompensa['pilares']:
                setattr(startup, f"nivel_{pilar}", getattr(
                    startup, f"nivel_{pilar}") + 1)
                print(f"O pilar de {pilar.capitalize()} subiu de nível!")

    def selecionar_jogador(self, startup):
        if len(startup.jogadores) > 1:
            print("\nQuem irá liderar esta tarefa?")
            for i, jogador in enumerate(startup.jogadores):
                print(f"{i+1}. {jogador.nome} ({jogador.tipo})")

            escolha_jogador = int(input("Digite o número do jogador: ")) - 1
            return startup.jogadores[escolha_jogador]
        else:
            return startup.jogadores[0]

    def executar_tarefa(self, pilar, tarefa, jogador, startup):
        print(f"\n-- Desafio no pilar de {pilar.capitalize()} --")
        print(f"Liderado por {jogador.nome} ({jogador.tipo}).")

        print(f"Desafio: {tarefa['desafio']}")

        resposta_usuario = input("Sua resposta: ")

        if resposta_usuario.lower() == tarefa['resposta'].lower():
            print(
                "Resposta correta! Sua equipe demonstrou grande capacidade de resolver problemas.")
            xp_ganho = tarefa['xp']

            if jogador.pilar_foco == pilar:
                bonus = 5
                xp_ganho += bonus
                print(f"Habilidade especial ativada! +{bonus} XP de bônus.")

            subiu_de_nivel = startup.avancar_pilar(pilar, xp_ganho)
            if subiu_de_nivel:
                self.disparar_evento_aleatorio(startup)
        else:
            print(
                f"Resposta incorreta. A equipe precisa se alinhar melhor. A resposta era '{tarefa['resposta']}'.")
            print("Nenhum XP foi ganho neste turno.")

    def checar_e_executar_evento_especial(self, startup):
        if startup.nivel_total in self.eventos_especiais and startup.nivel_total not in self.eventos_executados:
            evento = self.eventos_especiais[startup.nivel_total]
            print(f"\n>>> EVENTO ESPECIAL: {evento['nome'].upper()} <<<")
            print(f"Descrição: {evento['pergunta']}")

            try:
                escolha = input("Digite sua escolha (a ou b): ").lower()
                if escolha in evento['opcoes']:
                    resultado = evento['opcoes'][escolha]
                    print(f"\n{resultado['msg']}")
                    if resultado['efeito'] == "ganhar_nivel":
                        for pilar in resultado['pilares']:
                            setattr(startup, f"nivel_{pilar}", getattr(
                                startup, f"nivel_{pilar}") + 1)
                            print(
                                f"O pilar de {pilar.capitalize()} subiu de nível!")
                    elif resultado['efeito'] == "perder_nivel":
                        for pilar in resultado['pilares']:
                            setattr(startup, f"nivel_{pilar}", getattr(
                                startup, f"nivel_{pilar}") - 1)
                            print(
                                f"O pilar de {pilar.capitalize()} perdeu de nível!")

                    self.eventos_executados.append(startup.nivel_total)
                    return True
                else:
                    print("Escolha inválida. O evento não teve efeito.")
            except:
                print("Escolha inválida. O evento não teve efeito.")

        return False

    def oferecer_investimento_xp_solo(self, startup):
        pilares_em_risco = [pilar for pilar in self.pilares if getattr(
            startup, f"nivel_{pilar}") < 1]

        if pilares_em_risco and startup.xp >= 20:
            print("\n--- AVISO: PILAR(ES) EM NÍVEL CRÍTICO! ---")
            print("Sua startup pode estar em risco de falência.")
            print(
                f"Você tem {startup.xp} XP. O custo para subir um nível é de 20 XP.")

            for i, pilar in enumerate(pilares_em_risco):
                print(
                    f"{i+1}. Salvar o pilar de {pilar.capitalize()} (nível atual: {getattr(startup, f'nivel_{pilar}')})")

            print("0. Não investir agora.")

            try:
                escolha = int(input("Escolha um pilar para investir seu XP: "))

                if escolha > 0 and escolha <= len(pilares_em_risco):
                    pilar_escolhido = pilares_em_risco[escolha - 1]
                    startup.xp -= 20
                    setattr(startup, f"nivel_{pilar_escolhido}", getattr(
                        startup, f"nivel_{pilar_escolhido}") + 1)
                    print(
                        f"\nXP investido! O pilar de {pilar_escolhido.capitalize()} subiu para o nível {getattr(startup, f'nivel_{pilar_escolhido}')}.")
                elif escolha == 0:
                    print("Decisão estratégica: não investir agora.")
                else:
                    print("Escolha inválida. Nenhuma ação tomada.")
            except (ValueError, IndexError):
                print("Escolha inválida. Nenhuma ação tomada.")

    def oferecer_investimento_xp_multiplayer(self, startup):
        pilares_em_risco = [pilar for pilar in self.pilares if getattr(
            startup, f"nivel_{pilar}") < 1]

        if not pilares_em_risco or startup.xp < 20:
            return

        print("\n--- AVISO: PILAR(ES) EM NÍVEL CRÍTICO! ---")
        print("Sua startup pode estar em risco de falência.")
        print(
            f"Você tem {startup.xp} XP. O custo para subir um nível é de 20 XP.")

        print("\nAgora, a equipe deve votar se investirá XP para salvar a startup!")

        votos_sim = 0
        votos_nao = 0

        for i, pilar in enumerate(pilares_em_risco):
            print(
                f"{i+1}. Pilar de {pilar.capitalize()} (nível atual: {getattr(startup, f'nivel_{pilar}')})")

        pilar_escolhido_para_voto = None
        while True:
            try:
                escolha_pilar = int(
                    input("Qual pilar está em maior risco? Digite o número para votação: ")) - 1
                pilar_escolhido_para_voto = pilares_em_risco[escolha_pilar]
                break
            except (ValueError, IndexError):
                print("Escolha inválida. Por favor, digite um número da lista.")

        for jogador in startup.jogadores:
            while True:
                voto = input(
                    f"\n{jogador.nome} ({jogador.tipo}), você vota 'Sim' para investir ou 'Não'? ").lower()
                if voto == "sim":
                    votos_sim += 1
                    break
                elif voto == "não" or voto == "nao":
                    votos_nao += 1
                    break
                else:
                    print("Resposta inválida. Digite 'sim' ou 'não'.")

        print(f"\n--- Resultado da Votação ---")
        print(f"Votos 'Sim': {votos_sim}")
        print(f"Votos 'Não': {votos_nao}")

        if votos_sim > votos_nao:
            startup.xp -= 20
            setattr(startup, f"nivel_{pilar_escolhido_para_voto}", getattr(
                startup, f"nivel_{pilar_escolhido_para_voto}") + 1)
            print(f"\nDecisão da equipe: INVESTIR!")
            print(
                f"20 XP foram gastos para salvar o pilar de {pilar_escolhido_para_voto.capitalize()}, que subiu para o nível {getattr(startup, f'nivel_{pilar_escolhido_para_voto}')}.")
        else:
            print("\nDecisão da equipe: NÃO INVESTIR. (Empate ou maioria para 'Não').")
            print("O risco de falência continua...")

    def disparar_evento_aleatorio(self, startup):
        tipo_evento = "positivo" if random.random() < 0.5 else "negativo"
        evento = random.choice(self.eventos[tipo_evento])

        print(f"\n>>> UMA CARTA DE EVENTO SURGE! <<<")
        print(f"Nome do Evento: {evento['nome']}")
        print(evento['descricao'])

        if evento["tipo_efeito"] == "ganhar_xp":
            startup.xp += evento["efeito"]
        elif evento["tipo_efeito"] == "perder_xp":
            startup.xp = max(0, startup.xp - evento["efeito"])
        elif evento["tipo_efeito"] == "ganhar_nivel":
            for pilar in evento["efeito"]:
                setattr(startup, f"nivel_{pilar}", getattr(
                    startup, f"nivel_{pilar}") + 1)
        elif evento["tipo_efeito"] == "perder_nivel":
            for pilar in evento["efeito"]:
                setattr(startup, f"nivel_{pilar}", getattr(
                    startup, f"nivel_{pilar}") - 1)

    def finalizar_jogo_sucesso(self, startup_vencedora):
        print("\n-------------------------------------")
        print("FIM DO JOGO!")
        print(
            f"🎉 Parabéns! A startup '{startup_vencedora.nome}' é a grande vencedora! 🎉")
        startup_vencedora.mostrar_status()
        print("Sua equipe superou todas as outras e se tornou a nova líder de mercado!")
        print("-------------------------------------")

    def finalizar_jogo_falencia(self, startup_falida):
        print("\n-------------------------------------")
        print("FIM DO JOGO!")
        print(
            f"💔 A startup '{startup_falida.nome}' não superou os desafios e faliu. 💔")
        startup_falida.mostrar_status()
        print("-------------------------------------")


# --- Execução do Jogo ---
if __name__ == "__main__":
    jogo = Jogo()
    jogo.iniciar_jogo()
    jogo.loop_principal()

    if len(jogo.startups) == 1:
        jogo.finalizar_jogo_sucesso(jogo.startups[0])
    elif len(jogo.startups) == 0:
        print("\n-------------------------------------")
        print("FIM DO JOGO!")
        print("Todas as startups faliram. Não há vencedores.")
        print("-------------------------------------")
