import os
import sys
import whisper
from moviepy import TextClip, ColorClip, CompositeVideoClip

def debug_scribe():
    print("--- DEBUG DE EMERGÊNCIA: SCRIBE FOX ---")
    
    # 1. Teste de Fonte (Caminho que validamos antes)
    font_path = os.path.join(os.environ['LOCALAPPDATA'], 'Microsoft', 'Windows', 'Fonts', 'Montserrat-Bold.ttf')
    if not os.path.exists(font_path):
        font_path = os.path.join(os.environ['WINDIR'], 'Fonts', 'arialbd.ttf')
    
    print(f"[DEBUG] Usando fonte: {font_path}")

    try:
        # 2. Teste de Geração de TextClip Simples (Sem Efeitos)
        print("[DEBUG] Testando TextClip básico...")
        txt = TextClip(
            text="TESTE FOX",
            font_size=80,
            color='white',
            font=font_path,
            method='label'
        ).with_duration(2)
        print("[OK] TextClip básico gerado.")

        # 3. Teste de Efeito POP (Suspeito de erro)
        print("[DEBUG] Testando Efeito POP...")
        def zoom(t):
            return 1 + 0.3 * t # Simples zoom linear para teste
        
        try:
            # MoviePy v2: resized aceita função de t
            txt_pop = txt.resized(lambda t: zoom(t))
            print("[OK] Efeito POP (resized) aplicado com sucesso.")
        except Exception as e:
            print(f"[FALHA] Erro no efeito POP: {e}")

        # 4. Teste de Composição
        print("[DEBUG] Testando Composição...")
        bg = ColorClip(size=(720, 1280), color=(0,0,0), duration=2)
        final = CompositeVideoClip([bg, txt.with_position('center')])
        final.write_videofile("debug_captions.mp4", fps=24, logger=None)
        print("[OK] Vídeo de debug gerado em debug_captions.mp4")

    except Exception as e:
        print(f"[ERRO CRÍTICO] Falha no processo: {e}")

if __name__ == "__main__":
    debug_scribe():
