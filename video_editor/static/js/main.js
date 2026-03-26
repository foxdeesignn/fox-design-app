function updatePreview() {
    const size = document.getElementById('caption-size').value;
    const pos = document.getElementById('caption-pos').value;
    const color = document.getElementById('caption-color').value;
    const opacity = document.getElementById('caption-opacity').value;
    
    const caption = document.getElementById('preview-caption');
    
    caption.style.fontSize = (size * 0.4) + 'px';
    caption.style.top = (pos * 100) + '%';
    caption.style.color = color;
    caption.style.backgroundColor = `rgba(0,0,0,${opacity})`;
}

async function selectFile(type) {
    const response = await fetch('/select_file', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({type: type})
    });
    const data = await response.json();
    if (data.path) {
        document.getElementById(`${type}-path`).value = data.path;
    }
}

async function startRender() {
    const data = {
        video_path: document.getElementById('video-path').value,
        music_path: document.getElementById('music-path').value,
        output_name: document.getElementById('output-name').value,
        caption_size: document.getElementById('caption-size').value,
        caption_pos: document.getElementById('caption-pos').value,
        caption_opacity: document.getElementById('caption-opacity').value,
        caption_color: document.getElementById('caption-color').value,
        jump_cut: document.getElementById('jump-cut').checked,
        captions: document.getElementById('captions').checked
    };

    if (!data.video_path) {
        alert("Selecione o vídeo fonte, mestre.");
        return;
    }

    await fetch('/start_render', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
}

// Inicia escuta de logs do servidor
const evtSource = new EventSource("/logs");
evtSource.onmessage = function(event) {
    const logBox = document.getElementById('log-box');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = '> ' + event.data;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
};

// Inicializa o preview
updatePreview();
