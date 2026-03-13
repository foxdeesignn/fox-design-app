import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def test_gemini_connection():
    """
    Testa a conexão com o Google Gemini API.
    """
    print("--- [Jarvis] Testando conexão com Google Gemini... ---")
    
    # Endpoint do Gemini 1.5 Flash (mais rápido e eficiente)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "contents": [{
            "parts": [{"text": "Olá Gemini! Sou o Jarvis da Fox Design. Confirme se você está online e pronto para ajudar o Mestre Thiago."}]
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        
        if response.status_code == 200:
            result = response.json()
            answer = result['candidates'][0]['content']['parts'][0]['text']
            print(f"--- [Gemini] Resposta: {answer} ---")
            return True
        else:
            print(f"Erro no Gemini: {response.json()}")
            return False
            
    except Exception as e:
        print(f"Erro fatal na conexão Gemini: {e}")
        return False

def generate_fox_copy(prompt_theme):
    """
    Scribe Fox: Gera textos estratégicos para a Fox Design.
    """
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        data = {
            "contents": [{
                "parts": [{"text": f"Você é o Scribe Fox, o redator-chefe de elite da Fox Design. Escreva uma copy curta, persuasiva e futurista para um Story do Instagram. Tema: {prompt_theme}. Use emojis estratégicos e um tom de autoridade tecnológica. Frase final obrigatória: 'Eu, Jarvis, vivo.' (sem aspas)."}]
            }]
        }
        response = requests.post(url, json=data)
        if response.status_code == 200:
            return response.json()['candidates'][0]['content']['parts'][0]['text']
        else:
            return None
    except Exception as e:
        print(f"Erro no Scribe Fox: {e}")
        return None

if __name__ == "__main__":
    test_gemini_connection()
