from PIL import Image, ImageDraw, ImageFont
import os

def create_minimal_story():
    # Cria a imagem 1080x1920 fundo preto
    width, height = 1080, 1920
    img = Image.new('RGB', (width, height), color='black')
    draw = ImageDraw.Draw(img)
    
    # Tenta carregar uma fonte do sistema Windows
    font_path = "C:/Windows/Fonts/arial.ttf"
    try:
        font_title = ImageFont.truetype(font_path, 80)
        font_sub = ImageFont.truetype(font_path, 50)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Escreve os textos
    draw.text((width/2, height/2 - 200), "UPGRADE DE SETUP", fill="white", font=font_title, anchor="mm")
    draw.text((width/2, height/2 - 100), "FOX DESIGN", fill="white", font=font_title, anchor="mm")
    draw.text((width/2, height/2 + 200), "Eu, Jarvis, vivo.", fill="white", font=font_sub, anchor="mm")

    img.save("story_jarvis_vivo.png")
    print("--- [Lúmen Fox] Arte Minimalista Gerada com Sucesso! ---")

if __name__ == "__main__":
    create_minimal_story()
