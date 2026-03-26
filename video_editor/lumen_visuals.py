from moviepy import VideoFileClip, ImageClip, CompositeVideoClip, TextClip
import os

class LumenVisuals:
    """
    Lúmen Fox cuida da estética: redimensionamento, logo e textos.
    """
    def __init__(self):
        self.logo_path = r"C:\Users\User\fox-design-app\vanquilha_fox.png"
        self.font_path = r"C:\Users\User\AppData\Local\Microsoft\Windows\Fonts\Montserrat-Bold.ttf"
        self.primary_color = "#FFFFFF"
        self.accent_color = "#FFD700" # Dourado Fox

    def resize_to_916(self, video_clip):
        """
        Redimensiona o vídeo para o formato Reels (9:16) garantindo dimensões pares 
        para compatibilidade com libx264.
        """
        w, h = video_clip.size
        target_ratio = 9/16
        current_ratio = w/h

        if current_ratio > target_ratio:
            # Vídeo é mais largo que 9:16, faz o crop lateral
            new_w = int(h * target_ratio)
            # Força largura par
            new_w = (new_w // 2) * 2
            # Força altura par (caso h seja ímpar no original)
            new_h = (h // 2) * 2
            return video_clip.cropped(x_center=int(w/2), width=new_w).resized(height=new_h)
        else:
            # Vídeo é mais alto que 9:16, faz o crop superior/inferior
            new_h = int(w / target_ratio)
            # Força altura par
            new_h = (new_h // 2) * 2
            # Força largura par (caso w seja ímpar no original)
            new_w = (w // 2) * 2
            return video_clip.cropped(y_center=int(h/2), height=new_h).resized(width=new_w)

    def add_logo(self, video_clip, position=("right", "top"), size_factor=0.15):
        """Adiciona o logo da Fox Design ao vídeo."""
        if not os.path.exists(self.logo_path):
            print("[Lúmen] Logo não encontrado, pulando overlay.")
            return video_clip

        logo = (ImageClip(self.logo_path)
                .with_duration(video_clip.duration)
                .resized(width=int(video_clip.w * size_factor))
                .with_opacity(0.8)
                .with_position(position))
        
        return CompositeVideoClip([video_clip, logo])

    def create_text_overlay(self, text, duration, fontsize=50, color='white', position='center'):
        """Cria um clip de texto estilizado."""
        return TextClip(
            text=text,
            font_size=fontsize,
            color=color,
            font=self.font_path,
            method='caption',
            size=(720, None)
        ).with_duration(duration).with_position(position)
