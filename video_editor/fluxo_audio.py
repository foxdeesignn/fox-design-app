from moviepy import AudioFileClip, CompositeAudioClip, concatenate_videoclips
import os
from pydub import AudioSegment
from pydub.silence import detect_nonsilent

class FluxoAudio:
    """
    Fluxo Fox cuida da trilha sonora, mixagem e cortes inteligentes (Jump-Cut).
    """
    def __init__(self):
        self.default_music_volume = 0.1 # 10% do volume original

    def add_background_music(self, video_clip, music_path, volume=None):
        """Adiciona uma música de fundo ao vídeo."""
        if not os.path.exists(music_path):
            print(f"[Fluxo] Música não encontrada: {music_path}. Ignorando.")
            return video_clip

        if volume is None:
            volume = self.default_music_volume

        # Carrega a música e ajusta o volume
        music = AudioFileClip(music_path).with_volume_scaled(volume)
        
        # Faz um loop se a música for menor que o vídeo
        if music.duration < video_clip.duration:
            music = music.loop(duration=video_clip.duration)
        else:
            music = music.subclipped(0, video_clip.duration)

        # Mixa o áudio original com a música
        final_audio = CompositeAudioClip([video_clip.audio, music])
        
        return video_clip.with_audio(final_audio)

    def extract_audio(self, video_clip, temp_path):
        """Extrai o áudio do vídeo para um arquivo temporário."""
        video_clip.audio.write_audiofile(temp_path, codec='pcm_s16le', fps=16000, logger=None)
        return temp_path

    def smart_jump_cut(self, video_clip, min_silence_len=300, silence_thresh=-35, buffer=50):
        """
        Detecta silêncios e remove os 'respiros' e pausas vazias com calibragem Fox V5.1.
        min_silence_len: Reduzido para 300ms para cortes mais agressivos e dinâmicos.
        silence_thresh: Ajustado para -35dB para melhor sensibilidade em áudios de celular.
        buffer: 50ms (mais curto) para evitar respiros residuais.
        """
        print("[Fluxo] Iniciando detecção de silêncios Fox V5.1 (Smart Jump-Cut)...")
        
        # 1. Extrai áudio temporário com nome único baseado no clip
        import uuid
        temp_audio = f"temp_jumpcut_{uuid.uuid4().hex[:6]}.wav"
        video_clip.audio.write_audiofile(temp_audio, codec='pcm_s16le', fps=16000, logger=None)
        
        audio = AudioSegment.from_wav(temp_audio)
        
        # 2. Detecta trechos com som (não silenciosos)
        nonsilent_chunks = detect_nonsilent(audio, min_silence_len=min_silence_len, silence_thresh=silence_thresh)
        
        if not nonsilent_chunks:
            print("[Fluxo] Alerta: O áudio pode estar muito baixo ou o vídeo está sem som. Mantendo original.")
            if os.path.exists(temp_audio): os.remove(temp_audio)
            return video_clip

        # 3. Cria subclips apenas das partes com fala
        print(f"[Fluxo] Detectadas {len(nonsilent_chunks)} partes com fala (Sinal Detectado). Aplicando cortes de elite...")
        clips = []
        for start_ms, end_ms in nonsilent_chunks:
            start_s = max(0, (start_ms - buffer) / 1000.0)
            end_s = min(video_clip.duration, (end_ms + buffer) / 1000.0)
            clips.append(video_clip.subclipped(start_s, end_s))

        # 4. Concatena os clips
        final_video = concatenate_videoclips(clips)
        
        # Limpeza
        if os.path.exists(temp_audio): os.remove(temp_audio)
        
        reducao = video_clip.duration - final_video.duration
        print(f"[Fluxo] Jump-Cut concluído. O vídeo ficou {reducao:.2f} segundos mais curto.")
        return final_video
