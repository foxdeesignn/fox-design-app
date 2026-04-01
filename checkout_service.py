import os
import mercadopago
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
# Permite que o frontend (HTML/JS) faça requisições para este backend de qualquer lugar
CORS(app, resources={r"/*": {"origins": "*"}})

# Configura o SDK do Mercado Pago com o seu Access Token
mp_access_token = os.getenv("MP_ACCESS_TOKEN")
if not mp_access_token:
    raise ValueError("MP_ACCESS_TOKEN não encontrado no arquivo .env")

sdk = mercadopago.SDK(mp_access_token)

# Catálogo de pacotes (Valores e Nomes reais da Fox Design)
PACOTES = {
    "pacote_iniciante": {
        "title": "Pacote Iniciante Fox",
        "unit_price": 297.00,
        "currency_id": "BRL",
        "quantity": 1
    },
    "pacote_god": {
        "title": "Pacote GOD Elite",
        "unit_price": 457.00,
        "currency_id": "BRL",
        "quantity": 1
    },
    "pacote_premium": {
        "title": "Pacote Premium Fox",
        "unit_price": 897.00,
        "currency_id": "BRL",
        "quantity": 1
    },
    "pacote_ultimate": {
        "title": "Pacote Ultimate Fox Design",
        "unit_price": 1197.00,
        "currency_id": "BRL",
        "quantity": 1
    }
}

@app.route('/create_preference', methods=['POST'])
def create_preference():
    try:
        data = request.json
        pacote_id = data.get('pacote_id')
        
        if pacote_id not in PACOTES:
            return jsonify({"error": "Pacote não encontrado"}), 400

        item = PACOTES[pacote_id]

        # Cria a preferência de pagamento (Checkout Pro)
        preference_data = {
            "items": [
                {
                    "title": item["title"],
                    "quantity": item["quantity"],
                    "currency_id": item["currency_id"],
                    "unit_price": item["unit_price"]
                }
            ],
            "back_urls": {
                "success": "https://foxdeesignn.github.io/fox-design-app/#sucesso",
                "failure": "https://foxdeesignn.github.io/fox-design-app/#erro",
                "pending": "https://foxdeesignn.github.io/fox-design-app/#pendente"
            },
            "auto_return": "approved",
            "statement_descriptor": "FOX DESIGN"
        }

        preference_response = sdk.preference().create(preference_data)
        
        # Mestre, adicionei esta linha para ver o erro real se o Mercado Pago reclamar
        if preference_response["status"] >= 400:
            print(f"ERRO MERCADO PAGO: {preference_response['response']}")
            return jsonify({"error": "Falha na API do Mercado Pago", "details": preference_response["response"]}), preference_response["status"]

        preference = preference_response["response"]
        
        # O link init_point é a URL do Checkout do Mercado Pago
        return jsonify({
            "id": preference["id"],
            "init_point": preference["init_point"]
        }), 200

    except Exception as e:
        print(f"Erro ao criar preferência: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🦊 Servidor de Checkout Fox Design iniciado na porta 5000...")
    app.run(port=5000, debug=True)
