import os
import sys
import whisper
from moviepy import VideoFileClip, TextClip, ColorClip
import time

def diagnose():
    print("--- DIAGNÓSTICO FOX DESIGN VIDEO EDITOR ---")
    
    # 1. Teste de Dependências
    try:
        import moviepy
        print(f"[OK] MoviePy versão: {moviepy.__version__}")
    except Exception as e:
        print(f"[ERRO] Falha ao importar MoviePy: {e}")

    # 2. Teste de Whisper (IA do Scribe)
    try:
        print("[Scribe] Testando carregamento do modelo Whisper 'base'...")
        start = time.time()
        model = whisper.load_model("base")
        print(f"[OK] Whisper carregado em {time.time() - start:.2f}s")
    except Exception as e:
        print(f"[ERRO] Falha no Whisper: {e}")

    # 3. Teste de TextClip (Lúmen/Scribe)
    try:
        print("[Lúmen/Scribe] Testando geração de TextClip (requer ImageMagick)...")
        # Tentando sintaxe MoviePy 2.0
        txt = TextClip(text="FOX TEST", font_size=50, color='white', font='Arial')
        print("[OK] TextClip gerado com sucesso.")
    except Exception as e:
        print(f"[ERRO] Falha no TextClip: {e}")
        print("DICA: Verifique se o ImageMagick está instalado e configurado no PATH.")

    # 4. Teste de Escrita de Vídeo
    try:
        print("[Maestro] Testando renderização de vídeo curto (1s)...")
        clip = ColorClip(size=(640, 480), color=(246, 14, 90), duration=1) # Cor Fox Pink
        clip.write_videofile("test_diagnostic.mp4", fps=24, logger=None)
        print("[OK] Renderização de teste concluída.")
        if os.path.exists("test_diagnostic.mp4"):
            os.remove("test_diagnostic.mp4")
    except Exception as e:
        print(f"[ERRO] Falha na renderização: {e}")

if __name__ == "__main__":
    diagnose()
