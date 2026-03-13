import requests
import os
import time
from dotenv import load_dotenv

load_dotenv() # Carrega localmente se existir

# Configurações da Meta (Instagram API)
PAGE_ID = os.environ.get("INSTAGRAM_PAGE_ID")
ACCESS_TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
API_VERSION = "v19.0"

def send_ig_message(recipient_id, message_text):
    """
    Envia uma mensagem direta via Instagram Messaging API.
    Atenção: O recipient_id é o IGSID (ID do usuário no Instagram).
    """
    try:
        url = f"https://graph.facebook.com/{API_VERSION}/{PAGE_ID}/messages"
        
        params = {
            "recipient": {"id": recipient_id},
            "message": {"text": message_text},
            "access_token": ACCESS_TOKEN
        }
        
        response = requests.post(url, json=params)
        
        if response.status_code == 200:
            print("--- DM enviada com sucesso no Instagram! ---")
            return True
        else:
            print(f"Erro no Instagram: {response.json()}")
            return False
            
    except Exception as e:
        print(f"Erro ao enviar DM: {e}")
        return False

def publish_ig_post(image_url, caption):
    """
    Publica uma imagem no feed do Instagram da Fox Design.
    image_url: Link público da imagem.
    caption: Texto da publicação.
    """
    try:
        # 1. Cria o container de mídia
        url_container = f"https://graph.facebook.com/{API_VERSION}/{os.getenv('INSTAGRAM_BUSINESS_ID')}/media"
        params_container = {
            "image_url": image_url,
            "caption": caption,
            "access_token": ACCESS_TOKEN
        }
        
        resp_container = requests.post(url_container, json=params_container)
        
        if resp_container.status_code == 200:
            creation_id = resp_container.json().get("id")
            
            # 2. Publica o container (Publish Media)
            url_publish = f"https://graph.facebook.com/{API_VERSION}/{os.getenv('INSTAGRAM_BUSINESS_ID')}/media_publish"
            params_publish = {
                "creation_id": creation_id,
                "access_token": ACCESS_TOKEN
            }
            
            resp_publish = requests.post(url_publish, json=params_publish)
            
            if resp_publish.status_code == 200:
                print(f"--- POST PUBLICADO COM SUCESSO! Link do Post: https://www.instagram.com/p/{resp_publish.json().get('id')} ---")
                return True
            else:
                print(f"Erro ao publicar: {resp_publish.json()}")
                return False
        else:
            print(f"Erro ao criar container: {resp_container.json()}")
            return False
            
    except Exception as e:
        print(f"Erro fatal na publicação: {e}")
        return False

def wait_for_media_processing(creation_id):
    """
    Aguardar até que o vídeo seja processado pela Meta.
    """
    url = f"https://graph.facebook.com/{API_VERSION}/{creation_id}"
    params = {
        "fields": "status_code",
        "access_token": ACCESS_TOKEN
    }
    
    print(f"--- [Jarvis] Monitorando processamento da mídia (ID: {creation_id})... ---")
    
    for _ in range(20): # Tenta por até 10 minutos (20 * 30s)
        try:
            response = requests.get(url, params=params)
            status = response.json().get("status_code")
            
            if status == "FINISHED":
                print("--- [Jarvis] Processamento Concluído! ---")
                return True
            elif status == "ERROR":
                print(f"--- [Jarvis] Erro no processamento da Meta: {response.json()} ---")
                return False
            
            print(f"--- [Jarvis] Status: {status}. Aguardando mais 30s... ---")
            time.sleep(30)
        except Exception as e:
            print(f"Erro ao verificar status: {e}")
            return False
    
    return False

def publish_ig_story(media_url, is_video=False):
    """
    Publica um Story no Instagram da Fox Design com monitoramento de status.
    """
    try:
        # 1. Cria o container de mídia para Story
        url_container = f"https://graph.facebook.com/{API_VERSION}/{os.getenv('INSTAGRAM_BUSINESS_ID')}/media"
        params_container = {
            "media_type": "STORIES",
            "access_token": ACCESS_TOKEN
        }
        
        if is_video:
            params_container["video_url"] = media_url
        else:
            params_container["image_url"] = media_url
            
        resp_container = requests.post(url_container, json=params_container)
        
        if resp_container.status_code == 200:
            creation_id = resp_container.json().get("id")
            
            # Aguarda o processamento independente de ser vídeo ou imagem pesada
            if not wait_for_media_processing(creation_id):
                print("--- [Jarvis] Falha: A mídia demorou demais ou deu erro na Meta. ---")
                return False
            
            # 2. Publica o container (Publish Media)
            url_publish = f"https://graph.facebook.com/{API_VERSION}/{os.getenv('INSTAGRAM_BUSINESS_ID')}/media_publish"
            params_publish = {
                "creation_id": creation_id,
                "access_token": ACCESS_TOKEN
            }
            
            resp_publish = requests.post(url_publish, json=params_publish)
            
            if resp_publish.status_code == 200:
                print(f"--- STORY PUBLICADO COM SUCESSO! ID: {resp_publish.json().get('id')} ---")
                return True
            else:
                print(f"Erro ao publicar Story: {resp_publish.json()}")
                return False
        else:
            print(f"Erro ao criar container de Story: {resp_container.json()}")
            return False
            
    except Exception as e:
        print(f"Erro fatal na publicação do Story: {e}")
        return False

def get_comments(media_id):
    """Retorna a lista de comentários de uma mídia específica."""
    try:
        url = f"https://graph.facebook.com/{API_VERSION}/{media_id}/comments"
        params = {"access_token": ACCESS_TOKEN}
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            return response.json().get("data", [])
        else:
            print(f"Erro ao buscar comentários: {response.json()}")
            return []
    except Exception as e:
        print(f"Erro fatal ao buscar comentários: {e}")
        return []

def reply_to_comment(comment_id, message_text):
    """Responde a um comentário específico no Instagram."""
    try:
        url = f"https://graph.facebook.com/{API_VERSION}/{comment_id}/replies"
        params = {
            "message": message_text,
            "access_token": ACCESS_TOKEN
        }
        response = requests.post(url, json=params)
        
        if response.status_code == 200:
            print(f"--- [Jarvis] Resposta enviada com sucesso ao comentário {comment_id}! ---")
            return True
        else:
            print(f"Erro ao responder comentário: {response.json()}")
            return False
    except Exception as e:
        print(f"Erro fatal ao responder: {e}")
        return False

if __name__ == "__main__":


    if "SUA_PAGE_ID" in PAGE_ID:
        print("Mestre, você precisa configurar a Page ID e o Token no seu .env primeiro.")
    else:
        # Teste de envio
        send_ig_message("ID_DO_DESTINATARIO_AQUI", "Olá da Fox Design via Jarvis!")
