// FOX CORE v4.5 - GESTÃO DE CADASTRO ÚNICO
console.log("JARVIS: Núcleo Fox Iniciado v4.5");

// --- SUPABASE SETUP ---
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw';

try {
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("JARVIS: Conectado ao Supabase.");
    }
} catch (e) { console.error("JARVIS: Erro Supabase SDK:", e); }

// --- WISHLIST LOGIC ---
let wishlist = JSON.parse(localStorage.getItem('fox_wishlist')) || [];

window.updateWishlistUI = function() {
    const container = document.getElementById('wishlistContainer');
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = '<p style="color: #666; font-size: 0.75rem; font-style: italic;">Sua lista está vazia.</p>';
    } else {
        container.innerHTML = '';
        wishlist.forEach(item => {
            const div = document.createElement('div');
            div.style = "background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 10px; position: relative; margin-bottom: 10px;";
            div.innerHTML = `
                <img src="${item.img}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                <div style="flex-grow: 1;">
                    <h5 style="margin: 0; font-size: 0.75rem; color: #fff; font-family: 'Sora';">${item.title}</h5>
                    <button onclick="startCheckout('${item.id}')" style="background: none; border: none; color: var(--fox-orange); font-size: 0.65rem; font-weight: 700; cursor: pointer; padding: 0; margin-top: 2px;">COMPRAR AGORA</button>
                </div>
                <button onclick="window.toggleWishlist('${item.id}')" style="background: none; border: none; color: #ff4444; cursor: pointer; opacity: 0.6;"><i data-lucide="x" size="14"></i></button>
            `;
            container.appendChild(div);
        });
    }

    // Atualizar visual das estrelas nos cards da loja
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const match = btn.getAttribute('onclick').match(/'([^']+)'/);
        if (match) {
            const productId = match[1];
            const isFavorited = wishlist.some(i => i.id === productId);
            if (isFavorited) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.toggleWishlist = async function(id, title, img) {
    const btn = event ? event.currentTarget : null;
    
    if (!window.supabaseClient) return;
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
        alert("Fala gamer! Faça login para salvar seus ativos favoritos.");
        window.openAuthModal();
        return;
    }

    if (btn && btn.classList.contains('wishlist-btn')) {
        btn.classList.remove('animate-shake');
        void btn.offsetWidth;
        btn.classList.add('animate-shake');
        setTimeout(() => btn.classList.remove('animate-shake'), 400);
    }

    const index = wishlist.findIndex(item => item.id === id);
    if (index === -1) {
        wishlist.push({ id, title, img });
    } else {
        wishlist.splice(index, 1);
    }

    localStorage.setItem('fox_wishlist', JSON.stringify(wishlist));
    window.updateWishlistUI();
};

// --- FUNÇÕES GLOBAIS DE INTERFACE ---
window.openAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }
};

window.closeAuthModalFunc = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; document.body.style.overflow = ''; }, 300);
    }
};

window.handleLoginClick = async function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!window.supabaseClient) { window.openAuthModal(); return; }

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) {
            const panel = document.getElementById('clientPanel');
            if (panel) {
                panel.classList.add('active');
                window.updateWishlistUI();
            }
        } else {
            window.openAuthModal();
        }
    } catch (err) { window.openAuthModal(); }
};

window.handleLogout = async function() {
    if (window.supabaseClient) {
        const btn = document.getElementById('logoutBtn');
        if (btn) btn.innerText = "SAINDO...";
        await window.supabaseClient.auth.signOut();
        window.location.reload();
    }
};

// --- BOOT DO SISTEMA ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("JARVIS: Boot v4.5 Master.");

    window.updateWishlistUI();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = window.handleLogout;

    const closePanelBtn = document.getElementById('closeClientPanel');
    if (closePanelBtn) closePanelBtn.onclick = () => document.getElementById('clientPanel')?.classList.remove('active');

    const closeAuthBtn = document.getElementById('closeAuthModal');
    if (closeAuthBtn) closeAuthBtn.onclick = window.closeAuthModalFunc;

    const closeDownloadsBtn = document.getElementById('closeDownloadsModal');
    if (closeDownloadsBtn) {
        closeDownloadsBtn.onclick = () => {
            const modal = document.getElementById('downloadsModal');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);
            }
        };
    }

    // Login Form
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const btn = document.getElementById('authSubmitBtn');
            btn.disabled = true;
            btn.innerText = "AGUARDE...";
            try {
                const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                location.reload();
            } catch (err) { alert(err.message); btn.disabled = false; btn.innerText = "Entrar"; }
        };
    }

    // Google
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) googleBtn.onclick = () => {
        window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + window.location.pathname }
        });
    };

    // Profile Form Save
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('saveProfileBtn');
            const fullName = document.getElementById('profileName').value;
            const phone = document.getElementById('profilePhone').value;
            const instagram = document.getElementById('profileInstagram').value;

            try {
                submitBtn.disabled = true;
                submitBtn.innerText = "SALVANDO...";

                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) throw new Error("Usuário não logado.");

                const { error } = await window.supabaseClient.from('profiles').upsert({
                    id: user.id,
                    full_name: fullName,
                    phone: phone,
                    instagram: instagram,
                    updated_at: new Date().toISOString()
                });

                if (error) throw error;

                // Sucesso: Esconder formulário e mostrar boas-vindas
                alert("Perfil Fox atualizado com sucesso!");
                window.updateUIForAuth(user);

            } catch (err) {
                alert("Erro ao salvar: " + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "Salvar Alterações";
            }
        };
    }

    // UI Watcher
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            window.updateUIForAuth(session?.user);
        });
        window.supabaseClient.auth.getUser().then(({ data: { user } }) => window.updateUIForAuth(user));
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    revealElements();
});

// --- PERFIL E UI ---
window.updateUIForAuth = (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const welcomeSection = document.getElementById('welcomeSection');
    const profileForm = document.getElementById('profileForm');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    if (!loginBtn) return;

    if (user) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        loginBtn.innerHTML = `<i data-lucide="user-check"></i> <span>${name}</span>`;
        
        if (window.supabaseClient) {
            window.supabaseClient.from('profiles').select('*').eq('id', user.id).single().then(({ data: profile }) => {
                if (profile) {
                    if (document.getElementById('profileName')) document.getElementById('profileName').value = profile.full_name || '';
                    if (document.getElementById('profilePhone')) document.getElementById('profilePhone').value = profile.phone || '';
                    if (document.getElementById('profileInstagram')) document.getElementById('profileInstagram').value = profile.instagram || '';

                    // JARVIS: Lógica de Ocultação do Formulário
                    if (profile.full_name && welcomeSection && profileForm) {
                        welcomeSection.style.display = 'block';
                        profileForm.style.display = 'none';
                        if (userNameDisplay) userNameDisplay.innerText = profile.full_name.split(' ')[0];
                    } else {
                        if (welcomeSection) welcomeSection.style.display = 'none';
                        if (profileForm) profileForm.style.display = 'block';
                    }
                }
            });
        }
    } else {
        loginBtn.innerHTML = `<i data-lucide="user"></i> <span>Entrar</span>`;
        if (welcomeSection) welcomeSection.style.display = 'none';
        if (profileForm) profileForm.style.display = 'block';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// --- DOWNLOADS & CHECKOUT ---
const DOWNLOAD_LINKS = {
    'pack_fortnite_stream': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Fortnite_Stream_Edition.rar'
};

const PREVIEW_VIDEOS = {
    'pack_fortnite_stream': 'https://www.youtube.com/embed/rNi7CAwz_oA?autoplay=1',
    'chat_cyberpunk': 'https://www.youtube.com/embed/mPIpPg-fbvc?autoplay=1',
    'subgoal_gta_vi': 'assets/video_gta_vi.webm',
    'subgoal_fortnite': 'assets/video_fortnite.webm',
    'subgoal_arc_riders': 'assets/video_arc_riders.webm',
    'pack_jett_valorant': 'assets/video_jett.webm',
    'pack_killjoy_valorant': 'assets/video_killjoy.webm',
    'pack_raze_valorant': 'assets/video_raze.webm',
    'pack_yoru_valorant': 'assets/video_yoru.mp4',
    'pack_sage_valorant': 'assets/video_sage.mp4',
    'pack_spiderman_miles': 'assets/video_spiderman.mp4',
    'pack_cod_edition': 'https://www.youtube.com/embed/eNNGfvln3dE?autoplay=1',
    'streamdeck_fortnite': 'https://www.youtube.com/embed/HBT3VSOTzrw?autoplay=1',
    'streamdeck_akatsuki': 'https://www.youtube.com/embed/kfgDWZvU84Q?autoplay=1'
};

window.openPreview = function(productId) {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('previewVideo');
    const container = modal?.querySelector('.video-container');
    const videoSrc = PREVIEW_VIDEOS[productId];

    if (modal && container && videoSrc) {
        const isYouTube = videoSrc.includes('youtube.com/embed/');
        
        if (isYouTube) {
            container.innerHTML = `<iframe width="100%" height="100%" src="${videoSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 12px;"></iframe>`;
        } else {
            container.innerHTML = `<video id="previewVideo" controls controlsList="nodownload" autoplay style="width: 100%; height: 100%; object-fit: contain;"><source src="${videoSrc}" type="${videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'}">Seu navegador não suporta vídeos.</video>`;
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    } else {
        alert("Vídeo de demonstração em processamento. Tente novamente em breve!");
    }
};

window.closePreview = function() {
    const modal = document.getElementById('videoModal');
    const container = modal?.querySelector('.video-container');
    if (modal) {
        modal.classList.remove('active');
        if (container) {
            container.innerHTML = ''; // Limpa iframe ou vídeo
        }
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
};

async function fetchUserOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList || !window.supabaseClient) return;
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;
        const { data: orders } = await window.supabaseClient.from('orders').select('*').eq('user_email', user.email);
        const finalOrders = orders || [];
        if (user.email === 'foxdeesignn@gmail.com') finalOrders.unshift({ product_id: 'pack_fortnite_stream', product_title: 'Pack Fortnite (Simulação)', status: 'paid' });
        ordersList.innerHTML = finalOrders.length ? '' : '<p>Nenhum ativo.</p>';
        finalOrders.forEach(order => {
            const isPaid = order.status === 'paid' || order.status === 'approved';
            const card = document.createElement('div');
            card.className = 'order-card';
            card.style = "background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;";
            card.innerHTML = `<div><h4 style="margin:0; color:#fff; font-size:0.9rem;">${order.product_title || order.product_id}</h4><p style="margin:5px 0 0; font-size:0.7rem; color:${isPaid?'#00ff88':'#ffaa00'}; font-weight:700;">${isPaid?'APROVADO':'PENDENTE'}</p></div>`;
            ordersList.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

async function startCheckout(pacoteId) {
    if (!window.supabaseClient) return;
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) { window.openAuthModal(); return; }
    const { data } = await window.supabaseClient.functions.invoke('create-preference', { body: { product_id: pacoteId, user_email: user.email } });
    if (data?.init_point) window.open(data.init_point, '_blank');
}

const openDownloadsBtn = document.getElementById('openDownloadsBtn');
if (openDownloadsBtn) {
    openDownloadsBtn.onclick = () => {
        const downloadsModal = document.getElementById('downloadsModal');
        if (downloadsModal) {
            downloadsModal.style.display = 'flex';
            setTimeout(() => downloadsModal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
            document.getElementById('clientPanel')?.classList.remove('active');
            fetchUserOrders();
        }
    };
}

const revealElements = () => {
    const elements = document.querySelectorAll('.reveal-up, .benefit-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('reveal'); });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
};
