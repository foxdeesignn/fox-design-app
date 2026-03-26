import os
import argparse
from moviepy import VideoFileClip, CompositeVideoClip
from guardiao_system import GuardiaoFox
from lumen_visuals import LumenVisuals
from scribe_captions import ScribeCaptions
from fluxo_audio import FluxoAudio

def main():
    parser = argparse.ArgumentParser(description="Fox Design Video Editor - Orchestrated by Maestro Fox")
    parser.add_argument("--input", required=True, help="Caminho do vídeo original")
    parser.add_argument("--music", help="Caminho da música de fundo (opcional)")
    parser.add_argument("--captions", action="store_true", help="Gerar legendas automáticas com Scribe Fox")
    parser.add_argument("--logo", action="store_true", help="Adicionar logo da Fox Design")
    parser.add_argument("--output", help="Nome do arquivo de saída")
    
    args = parser.parse_args()

    # 1. Inicia o Guardião
    guardiao = GuardiaoFox(os.getcwd())
    guardiao.validate_file(args.input)
    
    # 2. Inicia os Especialistas
    lumen = LumenVisuals()
    fluxo = FluxoAudio()
    
    # 3. Processamento Principal
    print(f"\n[Maestro] Iniciando edição do vídeo: {args.input}")
    clip = VideoFileClip(args.input)
    
    # 3.1 Redimensionamento (Lúmen)
    clip = lumen.resize_to_916(clip)
    print("[Lúmen] Redimensionamento para 9:16 concluído.")

    # 3.2 Legendas (Scribe)
    final_clips = [clip]
    if args.captions:
        scribe = ScribeCaptions()
        temp_audio = guardiao.get_temp_path("temp_audio.wav")
        fluxo.extract_audio(clip, temp_audio)
        segments = scribe.transcribe(temp_audio)
        caption_clips = scribe.generate_caption_clips(segments, clip.size)
        final_clips.extend(caption_clips)
        print(f"[Scribe] {len(caption_clips)} legendas geradas.")

    # Monta o vídeo com legendas antes do áudio final
    clip_with_captions = CompositeVideoClip(final_clips)

    # 3.3 Música de Fundo (Fluxo)
    if args.music:
        guardiao.validate_file(args.music)
        clip_with_captions = fluxo.add_background_music(clip_with_captions, args.music)
        print(f"[Fluxo] Trilha sonora adicionada.")

    # 3.4 Logo Fox (Lúmen)
    if args.logo:
        clip_with_captions = lumen.add_logo(clip_with_captions)
        print("[Lúmen] Branding Fox Design aplicado.")

    # 4. Exportação
    output_name = args.output if args.output else f"edit_{os.path.basename(args.input)}"
    output_path = guardiao.get_output_path(output_name)
    
    print(f"\n[Maestro] Renderizando vídeo final em: {output_path}")
    clip_with_captions.write_videofile(output_path, codec="libx264", audio_codec="aac")
    
    # 5. Finalização (Guardião)
    guardiao.cleanup_temp()
    print("\n[Maestro] Operação concluída com sucesso! Fox Design na vanguarda.")

if __name__ == "__main__":
    main()
