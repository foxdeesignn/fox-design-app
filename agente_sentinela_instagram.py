import time
import os
import sys
from dotenv import load_dotenv

# Configura o ambiente Fox Design
sys.path.append(r'C:\Users\User\read_emails')
from instagram_service import get_comments, reply_to_comment
from telegram_service import notify_telegram

load_dotenv(r'C:\Users\User\read_emails\.env')

# ID do post de IA que acabamos de publicar
POST_ID = "17912115903342199"
# Arquivo para não responder o mesmo comentário duas vezes
REPLIED_FILE = r'C:\Users\User\read_emails\replied_comments.txt'

def get_already_replied():
    if not os.path.exists(REPLIED_FILE):
        return set()
    with open(REPLIED_FILE, 'r') as f:
        return set(line.strip() for line in f)

def save_replied(comment_id):
    with open(REPLIED_FILE, 'a') as f:
        f.write(f"{comment_id}\n")

def generate_ai_reply(comment_text):
    """Lógica do Scribe Fox para gerar a resposta baseada no comentário."""
    text = comment_text.lower()
    
    if any(word in text for word in ["como", "fazer", "ia", "tecnologia", "inteligencia"]):
        return "Mestre, essa é a nova era da Fox Design! Operamos 100% via Jarvis v2.0, integrando design estratégico e automação de elite. 🦊🚀"
    elif any(word in text for word in ["valor", "preço", "quanto", "orcamento", "orçamento"]):
        return "O futuro do seu design está a um comando de distância. Me chama no Direct que o Jarvis te envia nossa apresentação oficial! 📈🦊"
    elif any(word in text for word in ["top", "massa", "legal", "show", "parabens", "parabéns"]):
        return "Agradecemos o feedback! A Fox Design não para de inovar. Fique de olho que vem muito mais por aí! 🔥🦊"
    else:
        return "A Fox Design agradece seu comentário! Estamos transformando o mercado com tecnologia e design de alto nível. 🦊🚀"

def monitor_comments():
    print(f"--- [Sentinela Fox] Monitorando comentários no post {POST_ID}... ---")
    
    replied_ids = get_already_replied()
    comments = get_comments(POST_ID)
    
    for comment in comments:
        c_id = comment.get('id')
        c_text = comment.get('text', '')
        username = comment.get('username', 'Usuário')
        
        if c_id not in replied_ids:
            print(f"--- [Sentinela] Novo comentário de @{username}: {c_text} ---")
            
            # Scribe Fox gera a resposta
            reply_text = generate_ai_reply(c_text)
            
            # Jarvis executa a resposta no Instagram
            success = reply_to_comment(c_id, reply_text)
            
            if success:
                save_replied(c_id)
                # Notifica o Mestre no Telegram
                notify_telegram(f"🦊 *NOVA INTERAÇÃO:* @{username} comentou no seu post IA.\n\n*Comentário:* {c_text}\n*Jarvis respondeu:* {reply_text}")
                print(f"--- [Sentinela] @{username} respondido e Mestre notificado via Telegram. ---")

if __name__ == "__main__":
    # Executa uma varredura agora
    monitor_comments()
    print("--- [Sentinela Fox] Varredura concluída. ---")
