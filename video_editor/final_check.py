import os
import sys
from moviepy import TextClip
import time

def final_check():
    print("--- VERIFICAÇÃO FINAL FOX DESIGN ---")
    
    # Caminho que encontramos anteriormente
    font_path = os.path.join(os.environ['LOCALAPPDATA'], 'Microsoft', 'Windows', 'Fonts', 'Montserrat-Bold.ttf')
    
    if not os.path.exists(font_path):
        # Fallback para caminho do Windows\Fonts
        font_path = os.path.join(os.environ['WINDIR'], 'Fonts', 'Montserrat-Bold.ttf')

    print(f"Testando fonte: {font_path}")
    
    try:
        if os.path.exists(font_path):
            txt = TextClip(text="FOX ELITE", font_size=50, color='white', font=font_path)
            print("[OK] Scribe Fox agora consegue renderizar texto com Montserrat!")
        else:
            print("[AVISO] Fonte Montserrat não encontrada nos caminhos padrão. Tentando Arial...")
            txt = TextClip(text="FOX ELITE", font_size=50, color='white', font="C:\\Windows\\Fonts\\arial.ttf")
            print("[OK] Renderizado com Arial (Fallback).")
    except Exception as e:
        print(f"[ERRO] Falha persistente: {e}")

if __name__ == "__main__":
    final_check()
