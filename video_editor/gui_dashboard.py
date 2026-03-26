import tkinter as tk
from tkinter import ttk, filedialog, messagebox, font, colorchooser
import threading
import os
import glob
from moviepy import VideoFileClip, CompositeVideoClip
from guardiao_system import GuardiaoFox
from lumen_visuals import LumenVisuals
from scribe_captions import ScribeCaptions
from fluxo_audio import FluxoAudio

# --- PALETA FOX DESIGN ---
COLOR_BG_MAIN = "#0A0A0B"
COLOR_BG_SEC = "#121214"
COLOR_FOX_PINK = "#f60e5a"
COLOR_TEXT_PRI = "#E0E0E0"
COLOR_TEXT_SEC = "#888888"
COLOR_WHITE = "#FFFFFF"

class FoxEditorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("FOX DESIGN | MAESTRO V5.1 - SYNC EDITION")
        self.root.geometry("1100x950")
        self.root.configure(bg=COLOR_BG_MAIN)
        
        # Mapeamento de Fontes
        self.font_map = self._get_font_map()
        self.available_font_names = sorted(list(self.font_map.keys()))
        
        self.font_main = "Montserrat" if "Montserrat" in str(font.families()) else "Segoe UI"
        self.font_display = "Orbitron" if "Orbitron" in str(font.families()) else "Impact"
        
        # Variáveis
        self.video_path = tk.StringVar()
        self.music_path = tk.StringVar()
        self.output_name = tk.StringVar(value="reels_sync_fox.mp4")
        self.add_logo_var = tk.BooleanVar(value=True)
        self.add_captions_var = tk.BooleanVar(value=True)
        self.jump_cut_var = tk.BooleanVar(value=True)
        
        # Estilo Scribe (Elite)
        self.caption_size = tk.IntVar(value=75)
        self.caption_color = tk.StringVar(value="#FFFFFF")
        self.caption_pos_y = tk.DoubleVar(value=0.75)
        self.caption_bg_opacity = tk.DoubleVar(value=0.6)
        
        default_font = "Montserrat Bold" if "Montserrat Bold" in self.font_map else (self.available_font_names[0] if self.available_font_names else "Arial")
        self.selected_font_name = tk.StringVar(value=default_font)
        
        self._setup_styles()
        self._setup_ui()
        self.update_preview()

    def _get_font_map(self):
        font_paths = [os.path.join(os.environ['WINDIR'], 'Fonts'), os.path.join(os.environ['LOCALAPPDATA'], 'Microsoft', 'Windows', 'Fonts')]
        mapping = {}
        for folder in font_paths:
            if not os.path.exists(folder): continue
            for ext in ('*.ttf', '*.otf'):
                for file_path in glob.glob(os.path.join(folder, ext)):
                    name = os.path.splitext(os.path.basename(file_path))[0].replace('-', ' ').replace('_', ' ')
                    mapping[name] = file_path
        if not mapping: mapping["Arial"] = "arial.ttf"
        return mapping

    def _setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("TFrame", background=COLOR_BG_MAIN)
        style.configure("Fox.Horizontal.TProgressbar", troughcolor=COLOR_BG_SEC, background=COLOR_FOX_PINK, thickness=12)

    def _setup_ui(self):
        # HEADER
        header = tk.Frame(self.root, bg=COLOR_BG_SEC, height=80)
        header.pack(fill="x")
        tk.Label(header, text="FOX DESIGN", font=(self.font_display, 22, "bold"), bg=COLOR_BG_SEC, fg=COLOR_WHITE).pack(side="left", padx=40)
        tk.Label(header, text="SYNC V5.1", font=(self.font_main, 8, "bold"), bg=COLOR_BG_SEC, fg=COLOR_FOX_PINK).pack(side="right", padx=40)

        # MAIN LAYOUT
        content = tk.Frame(self.root, bg=COLOR_BG_MAIN)
        content.pack(fill="both", expand=True, padx=30, pady=20)

        left_pane = tk.Frame(content, bg=COLOR_BG_MAIN, width=600)
        left_pane.pack(side="left", fill="both", expand=True)

        right_pane = tk.Frame(content, bg=COLOR_BG_MAIN, width=400)
        right_pane.pack(side="right", fill="both", padx=(30, 0))

        # --- CONTROLES ---
        self._create_section_label(left_pane, "01. MATERIAL BRUTO")
        self._create_input_box(left_pane, self.video_path, "VÍDEO", self._select_video)
        self._create_input_box(left_pane, self.music_path, "ÁUDIO", self._select_music)

        self._create_section_label(left_pane, "02. ESTILO SCRIBE SYNC")
        style_box = tk.Frame(left_pane, bg=COLOR_BG_SEC, padx=20, pady=20)
        style_box.pack(fill="x", pady=10)

        # Sliders
        tk.Label(style_box, text="TAMANHO DA LEGENDA", bg=COLOR_BG_SEC, fg=COLOR_TEXT_SEC, font=(self.font_main, 8, "bold")).pack(anchor="w")
        tk.Scale(style_box, from_=40, to=200, variable=self.caption_size, orient="horizontal", bg=COLOR_BG_SEC, fg=COLOR_WHITE, highlightthickness=0, command=lambda e: self.update_preview()).pack(fill="x", pady=(0, 10))

        tk.Label(style_box, text="POSIÇÃO VERTICAL (Y)", bg=COLOR_BG_SEC, fg=COLOR_TEXT_SEC, font=(self.font_main, 8, "bold")).pack(anchor="w")
        tk.Scale(style_box, from_=0.0, to=1.0, resolution=0.01, variable=self.caption_pos_y, orient="horizontal", bg=COLOR_BG_SEC, fg=COLOR_WHITE, highlightthickness=0, command=lambda e: self.update_preview()).pack(fill="x", pady=(0, 10))

        tk.Label(style_box, text="OPACIDADE DO FUNDO", bg=COLOR_BG_SEC, fg=COLOR_TEXT_SEC, font=(self.font_main, 8, "bold")).pack(anchor="w")
        tk.Scale(style_box, from_=0.0, to=1.0, resolution=0.1, variable=self.caption_bg_opacity, orient="horizontal", bg=COLOR_BG_SEC, fg=COLOR_WHITE, highlightthickness=0, command=lambda e: self.update_preview()).pack(fill="x", pady=(0, 10))

        # Checkboxes
        check_row = tk.Frame(style_box, bg=COLOR_BG_SEC)
        check_row.pack(fill="x", pady=10)
        self._create_checkbox(check_row, "JUMP-CUT", self.jump_cut_var).pack(side="left", padx=(0, 20))
        self._create_checkbox(check_row, "LEGENDAS", self.add_captions_var).pack(side="left", padx=(0, 20))
        self._create_checkbox(check_row, "LOGO FOX", self.add_logo_var).pack(side="left")

        # Cor e Fonte
        row_c = tk.Frame(style_box, bg=COLOR_BG_SEC)
        row_c.pack(fill="x", pady=10)
        tk.Button(row_c, text="COR DA FONTE", command=self._pick_color, bg=COLOR_FOX_PINK, fg=COLOR_WHITE, font=(self.font_main, 8, "bold"), relief="flat", padx=10).pack(side="left")
        self.color_ind = tk.Label(row_c, width=2, bg=self.caption_color.get())
        self.color_ind.pack(side="left", padx=10)
        ttk.Combobox(row_c, textvariable=self.selected_font_name, values=self.available_font_names, width=25).pack(side="right")

        # RENDER
        self._create_section_label(left_pane, "03. PRODUÇÃO FINAL")
        tk.Entry(left_pane, textvariable=self.output_name, bg=COLOR_BG_SEC, fg=COLOR_FOX_PINK, font=(self.font_main, 12, "bold"), bd=10, relief="flat").pack(fill="x", pady=5)
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(left_pane, variable=self.progress_var, maximum=100, style="Fox.Horizontal.TProgressbar")
        self.progress_bar.pack(fill="x", pady=20)
        self.btn_render = tk.Button(left_pane, text="GERAR REELS SINCRONIZADO", command=self._start_render, bg=COLOR_FOX_PINK, fg=COLOR_WHITE, font=(self.font_display, 18, "bold"), relief="flat", pady=20)
        self.btn_render.pack(fill="x")

        # PREVIEW
        tk.Label(right_pane, text="SIMULADOR PREVIEW", bg=COLOR_BG_MAIN, fg=COLOR_FOX_PINK, font=(self.font_display, 10, "bold")).pack(pady=(0, 10))
        self.canv = tk.Canvas(right_pane, width=320, height=568, bg="#050505", highlightthickness=1, highlightbackground=COLOR_BG_SEC)
        self.canv.pack()
        self.pre_bg = self.canv.create_rectangle(40, 410, 280, 450, fill="black", stipple="gray50", outline="")
        self.pre_txt = self.canv.create_text(160, 430, text="EXEMPLO FOX", font=("Arial", 18, "bold"), fill="white", width=240, justify="center")

        self.status_box = tk.Text(self.root, height=6, bg="#050505", fg=COLOR_FOX_PINK, font=("Consolas", 10), padx=20, pady=10)
        self.status_box.pack(fill="x", side="bottom")

    def update_preview(self, *args):
        y = self.caption_pos_y.get() * 568
        size = int(self.caption_size.get() * 0.35)
        color = self.caption_color.get()
        opacity = int(self.caption_bg_opacity.get() * 100)
        stipple = "gray50" if opacity > 30 else "gray25" if opacity > 10 else ""
        self.canv.coords(self.pre_bg, 40, y - size - 5, 280, y + size + 5)
        self.canv.itemconfig(self.pre_bg, stipple=stipple if opacity > 0 else "")
        self.canv.coords(self.pre_txt, 160, y)
        self.canv.itemconfig(self.pre_txt, font=(self.font_main, size, "bold"), fill=color)
        self.color_ind.config(bg=color)

    def _pick_color(self):
        c = colorchooser.askcolor()[1]
        if c: self.caption_color.set(c); self.update_preview()

    def _create_section_label(self, p, t):
        tk.Label(p, text=t, font=(self.font_main, 9, "bold"), bg=COLOR_BG_MAIN, fg=COLOR_TEXT_SEC).pack(anchor="w", pady=(15, 0))

    def _create_input_box(self, p, v, t, c):
        box = tk.Frame(p, bg=COLOR_BG_SEC); box.pack(fill="x", pady=5)
        tk.Entry(box, textvariable=v, bg=COLOR_BG_SEC, fg=COLOR_WHITE, font=(self.font_main, 9), bd=10, relief="flat").pack(side="left", fill="x", expand=True)
        tk.Button(box, text=t, command=c, bg=COLOR_FOX_PINK, fg=COLOR_WHITE, font=(self.font_main, 8, "bold"), relief="flat", padx=15).pack(side="right", fill="y")

    def _create_checkbox(self, parent, text, var):
        return tk.Checkbutton(parent, text=text, variable=var, bg=COLOR_BG_SEC, fg=COLOR_TEXT_PRI, selectcolor=COLOR_BG_MAIN, activebackground=COLOR_BG_SEC, font=(self.font_main, 8, "bold"))

    def log(self, t, p=None):
        self.status_box.insert(tk.END, f"> {t}\n"); self.status_box.see(tk.END)
        if p is not None: self.progress_var.set(p)
        self.root.update_idletasks()

    def _select_video(self):
        f = filedialog.askopenfilename(); 
        if f: self.video_path.set(f); self.log(f"VÍDEO CARREGADO: {os.path.basename(f)}")

    def _select_music(self):
        f = filedialog.askopenfilename(); 
        if f: self.music_path.set(f); self.log(f"TRILHA CARREGADA: {os.path.basename(f)}")

    def _start_render(self):
        if not self.video_path.get(): return
        self.btn_render.config(state="disabled", text="MAESTRO RENDERIZANDO...")
        threading.Thread(target=self._render_process, daemon=True).start()

    def _render_process(self):
        try:
            input_file = self.video_path.get()
            output_file = self.output_name.get()
            font_path = self.font_map.get(self.selected_font_name.get(), "Arial")
            
            c_size = self.caption_size.get()
            c_color = self.caption_color.get()
            c_pos = self.caption_pos_y.get()
            c_opacity = self.caption_bg_opacity.get()

            guardiao = GuardiaoFox(os.getcwd())
            lumen = LumenVisuals()
            fluxo = FluxoAudio()
            
            self.log(f"MAESTRO: CARREGANDO VÍDEO FONTE", 5)
            clip = VideoFileClip(input_file)
            clip = lumen.resize_to_916(clip)
            
            # --- 1. JUMP-CUT PRIMEIRO (OPCIONAL) ---
            if self.jump_cut_var.get():
                self.log("FLOW: REMOVENDO RESPIROS E SILÊNCIOS...", 15)
                clip = fluxo.smart_jump_cut(clip)
                self.log(f"FLOW: JUMP-CUT OK. NOVA DURAÇÃO: {clip.duration:.2f}s", 25)

            final_clips = [clip]
            
            # --- 2. LEGENDA SEGUNDO (VÍDEO JÁ CORTADO) ---
            if self.add_captions_var.get():
                scribe = ScribeCaptions()
                temp_audio = guardiao.get_temp_path("scribe_final.wav")
                self.log("SCRIBE: EXTRAINDO ÁUDIO PARA TRANSCRIÇÃO...", 40)
                fluxo.extract_audio(clip, temp_audio)
                self.log("SCRIBE: TRANSCREVENDO IA WHISPER (SINCRONIZADA)...", 55)
                segments = scribe.transcribe(temp_audio)
                self.log(f"SCRIBE: GERANDO LEGENDAS ULTRA-HD", 70)
                captions = scribe.generate_caption_clips(segments, clip.size, font_name=font_path, font_size=c_size, color=c_color, position_y=c_pos, bg_opacity=c_opacity)
                final_clips.extend(captions)

            clip_final = CompositeVideoClip(final_clips)
            
            if self.music_path.get():
                clip_final = fluxo.add_background_music(clip_final, self.music_path.get())

            if self.add_logo_var.get():
                clip_final = lumen.add_logo(clip_final)

            out_p = os.path.join(os.path.expanduser("~"), "Desktop", output_file)
            self.log("MAESTRO: RENDERIZANDO COM BITRATE DE ELITE (25M)...", 90)
            
            clip_final.write_videofile(
                out_p, 
                codec="libx264", 
                audio_codec="aac", 
                bitrate="25M", 
                preset="slower", 
                ffmpeg_params=["-pix_fmt", "yuv420p"], 
                logger=None, 
                fps=30
            )
            
            self.log(f"MISSÃO CUMPRIDA: {out_p}", 100)
            messagebox.showinfo("FOX DESIGN", f"VÍDEO SINCRONIZADO PRONTO!\nSalvo em: {out_p}")
        except Exception as e:
            self.log(f"ERRO: {str(e)}")
            messagebox.showerror("ERRO", str(e))
        finally:
            self.btn_render.config(state="normal", text="GERAR REELS SINCRONIZADO")

if __name__ == "__main__":
    root = tk.Tk()
    app = FoxEditorApp(root)
    root.mainloop()
