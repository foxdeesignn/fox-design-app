import os
import telebot
from dotenv import load_dotenv

# Carrega ambiente
load_dotenv()

# Credenciais Oficiais do Jarvis @JarvisFoxx_bot
TOKEN = os.environ.get('TELEGRAM_TOKEN', '8578084930:AAHLpOcxO7J3Z-Y4dqoGtOyz5Jsp161ACRI')
CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '7986584156')

def notify_telegram(message):
    """Envia uma notificação nativa para o Telegram do Mestre via @JarvisFoxx_bot."""
    try:
        bot = telebot.TeleBot(TOKEN)
        
        # O bot envia para o chat ID fixo do Mestre (obtido de last_chat_id.txt)
        bot.send_message(CHAT_ID, message, parse_mode='Markdown')
        
        print(f"--- [Jarvis Telegram] Mensagem enviada para o Mestre (ID: {CHAT_ID}) ---")
        return True
            
    except Exception as e:
        print(f"Erro ao enviar Telegram nativo: {e}")
        return False

if __name__ == "__main__":
    notify_telegram("🚀 *Jarvis:* Sistema Fox Design Operacional via @JarvisFoxx_bot!")
