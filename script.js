// 1. Accordion FAQ
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const body = header.nextElementSibling;
        
        // Fecha outros itens
        document.querySelectorAll('.accordion-item').forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.querySelector('.accordion-body').style.display = 'none';
                otherItem.querySelector('.accordion-header').classList.remove('active');
            }
        });

        // Alterna o atual
        if (body.style.display === 'block') {
            body.style.display = 'none';
            header.classList.remove('active');
        } else {
            body.style.display = 'block';
            header.classList.add('active');
        }
    });
});

// 2. Menu Mobile
const menuToggle = document.getElementById('menuToggle');
const desktopNav = document.querySelector('.desktop-nav');

menuToggle.addEventListener('click', () => {
    if (desktopNav.style.display === 'flex') {
        desktopNav.style.display = 'none';
    } else {
        desktopNav.style.display = 'flex';
        desktopNav.style.flexDirection = 'column';
        desktopNav.style.position = 'absolute';
        desktopNav.style.top = '100%';
        desktopNav.style.left = '0';
        desktopNav.style.width = '100%';
        desktopNav.style.background = 'var(--bg-main)';
        desktopNav.style.padding = '20px';
        desktopNav.style.borderBottom = '1px solid var(--glass-border)';
    }
});

// 3. Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-nav');
    if (window.scrollY > 50) {
        header.style.padding = '15px 0';
        header.style.background = 'rgba(10, 10, 11, 0.95)';
    } else {
        header.style.padding = '20px 0';
        header.style.background = 'rgba(10, 10, 11, 0.8)';
    }
});

// 4. Scroll Reveal for Benefit Cards, Subtitles, Images and Stats
const revealElements = () => {
    const elements = document.querySelectorAll('.benefit-card, .section-subtitle, .reveal-up, .influencer-stats');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                
                // Se for a seção de estatísticas, inicia o contador
                if (entry.target.classList.contains('influencer-stats')) {
                    startCounter('project-counter', 400, 2000);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
};

// 5. Counter Logic
const startCounter = (id, target, duration) => {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerText = Math.floor(progress * target);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// 6. Mercado Pago Checkout Integration
async function startCheckout(pacoteId) {
    const btn = event.target;
    const originalText = btn.innerText;
    
    try {
        btn.innerText = "Processando...";
        btn.disabled = true;

        // Faz a requisição para o nosso backend local
        // Nota: Em produção, mude 'localhost:5000' para a URL do seu servidor real
        const response = await fetch('http://localhost:5000/create_preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pacote_id: pacoteId })
        });

        const data = await response.json();

        if (data.init_point) {
            // Redireciona o cliente para o checkout seguro do Mercado Pago
            window.location.href = data.init_point;
        } else {
            // Se o Mercado Pago falhar (ex: Token não homologado), redireciona para o WhatsApp
            console.warn("Mercado Pago indisponível, redirecionando para WhatsApp...");
            const mensagem = encodeURIComponent(`Olá Fox Design! Quero fechar o ${pacoteId.replace('_', ' ').toUpperCase()} que vi no site.`);
            window.location.href = `https://wa.me/5516997149568?text=${mensagem}`;
        }

    } catch (error) {
        console.error("Erro no Checkout:", error);
        // Fallback total para WhatsApp
        const mensagem = encodeURIComponent(`Olá! Tentei iniciar um pedido do ${pacoteId} pelo site, pode me ajudar?`);
        window.location.href = `https://wa.me/5516997149568?text=${mensagem}`;
    }
}

// 7. Spotlight Effect Pointer Sync
const syncPointer = (e) => {
    const { clientX: x, clientY: y } = e;
    const xp = (x / window.innerWidth).toFixed(2);
    const yp = (y / window.innerHeight).toFixed(2);
    
    document.documentElement.style.setProperty('--x', x.toFixed(2));
    document.documentElement.style.setProperty('--y', y.toFixed(2));
    document.documentElement.style.setProperty('--xp', xp);
    document.documentElement.style.setProperty('--yp', yp);
};

document.addEventListener('pointermove', syncPointer);

// 4. Lógica da Loja e Previews
function openPreview(productId) {
    const videoUrls = {
        'subgoal_gta_vi': 'assets/video_gta_vi.webm',
        'subgoal_fortnite': 'assets/video_fortnite.webm',
        'subgoal_arc_riders': 'assets/video_arc_riders.webm',
        'subgoal_grenade': 'assets/video_grenade.mp4'
    };

    const videoUrl = videoUrls[productId];
    
    if (videoUrl) {
        // Criar ou pegar o modal de preview
        let modal = document.getElementById('preview-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'preview-modal';
            modal.style = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.9); display: flex; align-items: center;
                justify-content: center; z-index: 10000; backdrop-filter: blur(10px);
            `;
            modal.onclick = () => { modal.style.display = 'none'; modal.innerHTML = ''; };
            document.body.appendChild(modal);
        }

        // Detectar o tipo do vídeo pela extensão
        const isWebm = videoUrl.endsWith('.webm');
        const mimeType = isWebm ? 'video/webm' : 'video/mp4';

        modal.innerHTML = `
            <div style="position: relative; width: 95%; max-width: 1100px; aspect-ratio: 16/9; background: #000; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.9);">
                <video autoplay controls style="width: 100%; height: 100%; display: block;">
                    <source src="${videoUrl}?v=1.2" type="${mimeType}">
                    Seu navegador não suporta vídeos.
                </video>
                <button id="close-modal-btn" style="
                    position: absolute; top: 20px; right: 20px; 
                    width: 40px; height: 40px; border-radius: 50%; 
                    background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);
                    color: #fff; cursor: pointer; display: flex; 
                    align-items: center; justify-content: center; 
                    font-family: 'Orbitron', sans-serif; font-size: 1.2rem;
                    transition: all 0.3s; z-index: 10001; backdrop-filter: blur(5px);
                ">✕</button>
            </div>
            <style>
                #close-modal-btn:hover {
                    background: var(--fox-orange) !important;
                    color: #000 !important;
                    transform: rotate(90deg) scale(1.1);
                    box-shadow: 0 0 20px var(--fox-orange-glow);
                    border-color: var(--fox-orange);
                }
            </style>
        `;
        modal.style.display = 'flex';

        // Fechar pelo botão ou clicando fora
        const closeBtn = document.getElementById('close-modal-btn');
        closeBtn.onclick = (e) => { e.stopPropagation(); closeModal(); };
        modal.onclick = () => closeModal();

        function closeModal() {
            modal.style.display = 'none';
            modal.innerHTML = '';
        }
    } else {
        alert("Vídeo de demonstração em breve!");
    }
}

// 8. Store Notification Popup Logic
const showStorePopup = () => {
    // Verifica se o usuário já fechou o popup nesta sessão
    if (sessionStorage.getItem('storePopupClosed')) return;

    const popup = document.createElement('div');
    popup.className = 'store-popup';
    popup.innerHTML = `
        <div class="store-popup-icon">
            <i data-lucide="shopping-bag"></i>
        </div>
        <div class="store-popup-info">
            <h4>FOX STORE</h4>
            <p>Novos ativos de elite disponíveis. Explore agora!</p>
        </div>
        <div class="store-popup-close" id="closeStorePopup">✕</div>
    `;

    document.body.appendChild(popup);
    lucide.createIcons();

    // Delay para aparecer
    setTimeout(() => {
        popup.classList.add('active');
    }, 3000);

    // Redirecionar para a loja ao clicar (exceto no fechar)
    popup.addEventListener('click', (e) => {
        if (e.target.id === 'closeStorePopup') {
            e.stopPropagation();
            popup.classList.remove('active');
            sessionStorage.setItem('storePopupClosed', 'true');
            return;
        }
        window.location.href = 'loja.html';
    });
};

// Executa assim que o DOM estiver pronto e garante execução se já carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        revealElements();
        showStorePopup();
    });
} else {
    revealElements();
    showStorePopup();
}
