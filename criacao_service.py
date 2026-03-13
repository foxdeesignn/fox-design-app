import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def generate_ai_image(prompt):
    """
    Gera uma imagem usando o modelo DALL-E 3 da OpenAI.
    """
    print(f"--- [Lúmen Fox] Iniciando geração da imagem: '{prompt}' ---")
    
    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    
    data = {
        "model": "dall-e-3",
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
        "quality": "hd",
        "style": "vivid"
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        
        if response.status_code == 200:
            image_url = response.json()['data'][0]['url']
            print(f"--- [Lúmen Fox] Imagem gerada com sucesso! ---")
            return image_url
        else:
            print(f"Erro na OpenAI: {response.json()}")
            return None
            
    except Exception as e:
        print(f"Erro fatal na geração: {e}")
        return None

if __name__ == "__main__":
    # Teste rápido
    prompt_fox = "A sleek, futuristic robotic fox with orange and white metallic plating, glowing cyan eyes, and intricate mechanical joints. Cinematic lighting, hyper-realistic, 8k resolution, minimalist dark background, professional design studio aesthetic."
    link = generate_ai_image(prompt_fox)
    if link:
        print(f"\nMESTRE, AQUI ESTÁ O LINK DA SUA RAPOSA ROBÔ:\n{link}")
