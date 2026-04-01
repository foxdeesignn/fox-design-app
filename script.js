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

// Executa assim que o DOM estiver pronto e garante execução se já carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealElements);
} else {
    revealElements();
}
