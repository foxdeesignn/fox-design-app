from flask import Flask, render_template, request, jsonify, Response
import os
import threading
import json
import time
from tkinter import filedialog, Tk
from moviepy import VideoFileClip, CompositeVideoClip
from guardiao_system import GuardiaoFox
from lumen_visuals import LumenVisuals
from scribe_captions import ScribeCaptions
from fluxo_audio import FluxoAudio

app = Flask(__name__)

# Fila de logs para o frontend
execution_logs = []

def add_log(message):
    execution_logs.append(f"[{time.strftime('%H:%M:%S')}] {message}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/select_file', methods=['POST'])
def select_file():
    file_type = request.json.get('type')
    root = Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    
    if file_type == 'video':
        path = filedialog.askopenfilename(filetypes=[("Vídeos", "*.mp4 *.mov *.avi")])
    else:
        path = filedialog.askopenfilename(filetypes=[("Áudio", "*.mp3 *.wav")])
    
    root.destroy()
    return jsonify({'path': path})

@app.route('/start_render', methods=['POST'])
def start_render():
    data = request.json
    threading.Thread(target=process_video, args=(data,), daemon=True).start()
    return jsonify({'status': 'started'})

@app.route('/logs')
def get_logs():
    def generate():
        while True:
            if execution_logs:
                log = execution_logs.pop(0)
                yield f"data: {log}\n\n"
            else:
                time.sleep(0.5)
    return Response(generate(), mimetype='text/event-stream')

def get_desktop_path():
    """Busca o caminho real da Área de Trabalho, lidando com OneDrive e Windows redirecionados."""
    # Tenta via registro/shell (método mais confiável no Windows)
    import ctypes
    from ctypes import wintypes
    CSIDL_DESKTOP = 0x0000
    _SHGetFolderPath = ctypes.windll.shell32.SHGetFolderPathW
    _SHGetFolderPath.argtypes = [wintypes.HWND, ctypes.c_int, wintypes.HANDLE, wintypes.DWORD, wintypes.W_PSTR]
    
    path_buf = ctypes.create_unicode_buffer(wintypes.MAX_PATH)
    _SHGetFolderPath(None, CSIDL_DESKTOP, None, 0, path_buf)
    return path_buf.value

def process_video(data):
    try:
        input_file = data.get('video_path')
        output_name = data.get('output_name', 'reels_fox_web.mp4')
        # Sanitiza nome do arquivo (remove caracteres que o Windows odeia)
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            output_name = output_name.replace(char, '')
        
        music_path = data.get('music_path')
        
        # Estilos
        c_size = int(data.get('caption_size', 75))
        c_color = data.get('caption_color', '#FFFFFF')
        c_pos = float(data.get('caption_pos', 0.75))
        c_opacity = float(data.get('caption_opacity', 0.6))
        
        add_log(f"MAESTRO: INICIANDO PRODUÇÃO WEB ELITE")
        
        guardiao = GuardiaoFox(os.getcwd())
        lumen = LumenVisuals()
        fluxo = FluxoAudio()
        
        add_log(f"LÚMEN: CARREGANDO VÍDEO FONTE...")
        clip = VideoFileClip(input_file)
        clip = lumen.resize_to_916(clip)
        
        if data.get('jump_cut'):
            add_log("FLOW: APLICANDO SMART JUMP-CUT...")
            clip = fluxo.smart_jump_cut(clip)
            add_log(f"FLOW: VÍDEO OTIMIZADO PARA {clip.duration:.2f}s")

        final_clips = [clip]
        
        if data.get('captions'):
            scribe = ScribeCaptions()
            temp_audio = guardiao.get_temp_path("scribe_web.wav")
            add_log("SCRIBE: EXTRAINDO ÁUDIO PARA IA...")
            fluxo.extract_audio(clip, temp_audio)
            add_log("SCRIBE: TRANSCREVENDO IA WHISPER...")
            segments = scribe.transcribe(temp_audio)
            add_log("SCRIBE: GERANDO LEGENDAS ULTRA-HD...")
            captions = scribe.generate_caption_clips(
                segments, clip.size, 
                font_size=c_size, 
                color=c_color, 
                position_y=c_pos, 
                bg_opacity=c_opacity
            )
            final_clips.extend(captions)

        clip_final = CompositeVideoClip(final_clips)
        
        if music_path:
            add_log("FLUXO: MIXANDO TRILHA SONORA...")
            clip_final = fluxo.add_background_music(clip_final, music_path)

        # LOCALIZA DESKTOP DE FORMA ROBUSTA
        desktop = get_desktop_path()
        out_p = os.path.join(desktop, output_name)
        
        add_log(f"MAESTRO: RENDERIZANDO PARA: {out_p}")
        
        # Usamos um nome de arquivo de áudio temporário único por renderização
        import uuid
        temp_audio_file = f"temp-audio-{uuid.uuid4().hex[:6]}.m4a"
        
        clip_final.write_videofile(
            out_p, 
            codec="libx264", 
            audio_codec="aac", 
            bitrate="25M", 
            preset="slower", 
            ffmpeg_params=["-pix_fmt", "yuv420p"], 
            temp_audiofile=temp_audio_file,
            remove_temp=True,
            logger=None, 
            fps=30
        )
        
        add_log(f"MISSÃO CUMPRIDA: {out_p}")
        guardiao.cleanup_temp()

    except Exception as e:
        add_log(f"ERRO CRÍTICO: {str(e)}")

if __name__ == '__main__':
    print("FOX DESIGN: SERVIDOR MAESTRO WEB ONLINE EM http://127.0.0.1:5000")
    app.run(port=5000, debug=False)
