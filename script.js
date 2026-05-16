// 0. JARVIS Version Control
console.log("JARVIS: Fox Design System v2.1 ativo.");

// 1. Core Functions
const openAuthModal = () => {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    } else {
        console.error("JARVIS: Modal de autenticação não encontrado no DOM.");
    }
};

const closeAuthModalFunc = () => {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
};

// 2. Initializing Elements
const loginBtn = document.getElementById('loginBtn');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const navOverlay = document.getElementById('navOverlay');
const authForm = document.getElementById('authForm');
const switchToSignUp = document.getElementById('switchToSignUp');
const googleLoginBtn = document.getElementById('googleLoginBtn');

// 3. Navigation Listeners
const toggleMenu = () => {
    if (mainNav && navOverlay) {
        mainNav.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    }
};

if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
if (navOverlay) navOverlay.addEventListener('click', toggleMenu);

// Global Click for Login Button
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("JARVIS: Botão Entrar clicado.");
        
        // Verifica se o usuário já está logado via Supabase
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            supabaseClient.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    const clientPanel = document.getElementById('clientPanel');
                    if (clientPanel) clientPanel.classList.add('active');
                } else {
                    openAuthModal();
                }
            });
        } else {
            openAuthModal();
        }
    });
}

const closeAuthModal = document.getElementById('closeAuthModal');
if (closeAuthModal) closeAuthModal.onclick = closeAuthModalFunc;

// 4. Accordion FAQ
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const body = header.nextElementSibling;
        document.querySelectorAll('.accordion-item').forEach(otherItem => {
            if (otherItem !== item) {
                const otherBody = otherItem.querySelector('.accordion-body');
                if (otherBody) otherBody.style.display = 'none';
                otherItem.querySelector('.accordion-header').classList.remove('active');
            }
        });
        if (body.style.display === 'block') {
            body.style.display = 'none';
            header.classList.remove('active');
        } else {
            body.style.display = 'block';
            header.classList.add('active');
        }
    });
});

// 5. Scroll Effects
window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-nav');
    if (header) {
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.background = 'rgba(10, 10, 11, 0.95)';
        } else {
            header.style.padding = '15px 0';
            header.style.background = 'rgba(10, 10, 11, 0.85)';
        }
    }
});

// 6. Reveal Animations
const revealElements = () => {
    const elements = document.querySelectorAll('.benefit-card, .section-subtitle, .reveal-up, .influencer-stats');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                if (entry.target.classList.contains('influencer-stats')) {
                    const counter = document.getElementById('project-counter');
                    if (counter) startCounter('project-counter', 400, 2000);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    elements.forEach(el => observer.observe(el));
};

const startCounter = (id, target, duration) => {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerText = Math.floor(progress * target);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
};

// 7. Supabase & Auth Logic
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw'; 

let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) { console.error("JARVIS: Erro Supabase:", e); }

const updateUIForAuth = (user, customAvatar = null) => {
    if (!loginBtn) return;
    if (user) {
        const avatar = customAvatar || user.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp';
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        loginBtn.innerHTML = `<img src="${avatar}" style="width:25px; height:25px; border-radius:50%; margin-right:8px; vertical-align: middle; object-fit: cover;"> ${name}`;
    } else {
        loginBtn.innerHTML = `<i data-lucide="user"></i> <span>Entrar</span>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateUIForAuth(session?.user);
    });
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            supabaseClient.from('profiles').select('avatar_url').eq('id', user.id).single()
                .then(({ data }) => updateUIForAuth(user, data?.avatar_url));
        } else {
            updateUIForAuth(null);
        }
    });
}

// 8. Store Functions (Checkout/Preview)
async function startCheckout(pacoteId) {
    const btn = document.querySelector(`button[onclick*="${pacoteId}"]`);
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert('Fala gamer! Faça login antes de comprar.');
            openAuthModal();
            return;
        }
        if (btn) btn.disabled = true;
        const { data, error } = await supabaseClient.functions.invoke('create-preference', {
            body: { product_id: pacoteId, user_email: user.email }
        });
        if (error) throw error;
        if (data?.init_point) window.location.href = data.init_point;
    } catch (error) {
        alert("Erro no sistema de vendas. Tente novamente em instantes.");
    } finally {
        if (btn) btn.disabled = false;
    }
}

function openPreview(productId) {
    const videoUrls = {
        'subgoal_gta_vi': 'assets/video_gta_vi.webm',
        'subgoal_fortnite': 'assets/video_fortnite.webm',
        'subgoal_arc_riders': 'assets/video_arc_riders.webm',
        'subgoal_grenade': 'assets/video_grenade.mp4',
        'pack_jett_valorant': 'assets/video_jett.webm',
        'pack_killjoy_valorant': 'assets/video_killjoy.webm',
        'pack_raze_valorant': 'assets/video_raze.webm',
        'pack_yoru_valorant': 'https://www.youtube.com/embed/ceYAm7PlT04?autoplay=1',
        'chat_cyberpunk': 'https://www.youtube.com/embed/mPIpPg-fbvc?autoplay=1'
    };
    const videoUrl = videoUrls[productId];
    if (videoUrl) {
        let modal = document.getElementById('preview-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'preview-modal';
            modal.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(10px);";
            document.body.appendChild(modal);
        }
        
        const isYouTube = videoUrl.includes('youtube.com/embed/');
        const isWebm = videoUrl.endsWith('.webm');
        
        if (isYouTube) {
            modal.innerHTML = `<div style="position: relative; width: 95%; max-width: 1100px; aspect-ratio: 16/9;"><iframe width="100%" height="100%" src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 20px;"></iframe><button onclick="this.parentElement.parentElement.style.display='none'" style="position: absolute; top: 20px; right: 20px; color: white; background: rgba(0,0,0,0.5); border: none; font-size: 2rem; cursor: pointer; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">✕</button></div>`;
        } else {
            modal.innerHTML = `<div style="position: relative; width: 95%; max-width: 1100px; aspect-ratio: 16/9;"><video autoplay controls style="width: 100%; height: 100%; border-radius: 20px;"><source src="${videoUrl}" type="${isWebm ? 'video/webm' : 'video/mp4'}"></video><button onclick="this.parentElement.parentElement.style.display='none'" style="position: absolute; top: 20px; right: 20px; color: white; background: rgba(0,0,0,0.5); border: none; font-size: 2rem; cursor: pointer; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">✕</button></div>`;
        }
        modal.style.display = 'flex';
    }
}

// 9. Boot
window.addEventListener('DOMContentLoaded', () => {
    revealElements();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
