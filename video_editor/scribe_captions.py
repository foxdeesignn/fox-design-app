import whisper
import os
from moviepy import TextClip, CompositeVideoClip, ColorClip
import numpy as np

class ScribeCaptions:
    """
    Scribe Fox Ultra-HD V6.1: Estética CSS Pro integrada ao Motor de Vídeo.
    """
    def __init__(self, model_size="base"):
        self.model_size = model_size
        self._model = None

    def _get_default_font(self):
        possible_paths = [
            os.path.join(os.environ['LOCALAPPDATA'], 'Microsoft', 'Windows', 'Fonts', 'Montserrat-Bold.ttf'),
            os.path.join(os.environ['WINDIR'], 'Fonts', 'Montserrat-Bold.ttf'),
            os.path.join(os.environ['WINDIR'], 'Fonts', 'arialbd.ttf'),
            os.path.join(os.environ['WINDIR'], 'Fonts', 'arial.ttf')
        ]
        for path in possible_paths:
            if os.path.exists(path): return path
        return "Arial"

    def transcribe(self, audio_path):
        if self._model is None:
            self._model = whisper.load_model(self.model_size)
        result = self._model.transcribe(audio_path, language='pt')
        return result['segments']

    def generate_caption_clips(self, segments, video_size, font_name=None, 
                               font_size=70, color='white', position_y=0.75, 
                               bg_opacity=0.6):
        """
        Gera legendas com estética 'Elite Reels' (CSS Inspired).
        """
        clips = []
        w, h = video_size
        font_path = font_name if font_name and os.path.isabs(font_name) else self._get_default_font()
        y_coord = int(h * position_y)
        
        # Margem de segurança rigorosa (80% da largura)
        max_w = int(w * 0.8)

        for segment in segments:
            text = segment['text'].strip().upper()
            words = text.split()
            if not words: continue
            
            duration = segment['end'] - segment['start']
            word_duration = duration / len(words)
            
            for i, word in enumerate(words):
                start = segment['start'] + (i * word_duration)
                
                try:
                    # 1. TEXTO COM STROKE E PADDING VERTICAL DE ELITE
                    # Aumentamos o tamanho vertical (None -> Height automático + Padding)
                    # O segredo é gerar o texto e depois expandir a margem para não cortar o 'p', 'g', 'y'
                    txt = TextClip(
                        text=word,
                        font_size=font_size,
                        color=color,
                        font=font_path,
                        stroke_color='black',
                        stroke_width=1.5,
                        method='caption',
                        size=(max_w, None),
                        text_align='center'
                    ).with_start(start).with_duration(word_duration)

                    # 2. BOX DE FUNDO COM RESPIRO VERTICAL (PADDING 3D)
                    # Forçamos um 'respiro' na altura (th) para evitar cortes na base das letras
                    tw, th = txt.size
                    pad_x = int(font_size * 0.5)
                    pad_y = int(font_size * 0.4) # Aumentado para proteger a base das letras
                    
                    final_w = ((tw + pad_x) // 2) * 2
                    final_h = ((th + pad_y) // 2) * 2
                    
                    bg = (ColorClip(size=(final_w, final_h), color=(0,0,0))
                          .with_opacity(bg_opacity)
                          .with_start(start)
                          .with_duration(word_duration))

                    # 3. COMPOSIÇÃO FINAL COM ALINHAMENTO SUPERIOR SUTIL
                    # Posicionamos o texto levemente acima do centro do box para dar espaço à base
                    unit = CompositeVideoClip([bg, txt.with_position(('center', 'center'))], size=(final_w, final_h))
                    unit = (unit.with_start(start)
                            .with_duration(word_duration)
                            .with_position(('center', y_coord)))

                    clips.append(unit)
                except Exception as e:
                    print(f"[Scribe] Erro: {e}")
            
        return clips
