from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from guru import Jogo, ACOES_EMPREENDEDORAS
import random

jogos_ativos = {}

app = Flask(__name__, static_folder='../Frontend',
            template_folder='../Frontend')
CORS(app)


@app.route('/')
def home():
    return send_from_directory(app.template_folder, 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


@app.route('/iniciar_jogo', methods=['POST'])
def iniciar_jogo():
    dados_recebidos = request.get_json()
    dados_equipes = dados_recebidos.get("equipes")

    if not dados_equipes:
        return jsonify({"erro": "Dados de equipe faltando"}), 400

    jogo = Jogo()
    status_inicial = jogo.iniciar_jogo(dados_equipes)
    jogo_id = str(random.randint(10000, 99999))
    jogos_ativos[jogo_id] = jogo

    return jsonify({
        "status": "sucesso",
        "jogo_id": jogo_id,
        "dados_jogo": status_inicial,
        "acoes_disponiveis": ACOES_EMPREENDEDORAS
    }), 200


@app.route('/<string:jogo_id>/status')
def get_status(jogo_id):
    jogo = jogos_ativos.get(jogo_id)
    if not jogo:
        return jsonify({"status": "erro", "mensagem": "Jogo não encontrado."}), 404

    return jsonify({
        "status": "sucesso",
        "dados_jogo": [s.get_status() for s in jogo.startups]
    }), 200


@app.route('/<string:jogo_id>/apresentar_acao', methods=['POST'])
def apresentar_acao(jogo_id):
    jogo = jogos_ativos.get(jogo_id)
    if not jogo:
        return jsonify({"status": "erro", "mensagem": "Jogo não encontrado."}), 404

    dados = request.get_json()
    startup_id = dados.get("startup_id")
    jogador_nome = dados.get("jogador_nome")
    acao_id = dados.get("acao_id")
    tipo_acao = dados.get("tipo_acao")

    resultado = jogo.apresentar_acao(
        startup_id, jogador_nome, acao_id, tipo_acao)

    return jsonify(resultado), 200


@app.route('/<string:jogo_id>/sortear_evento_manual', methods=['POST'])
def sortear_evento_manual(jogo_id):
    jogo = jogos_ativos.get(jogo_id)
    if not jogo:
        return jsonify({"status": "erro", "mensagem": "Jogo não encontrado."}), 404

    dados = request.get_json()
    startup_id = dados.get("startup_id")
    startup = jogo.get_startup_by_name(startup_id)
    if not startup:
        return jsonify({"status": "erro", "mensagem": "Startup não encontrada."}), 404

    evento = jogo.disparar_evento(startup, manual=True)

    return jsonify({
        "status": "sucesso",
        "mensagem": f"Evento manual sorteado para {startup_id}.",
        "evento": evento
    }), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
