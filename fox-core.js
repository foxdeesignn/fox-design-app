// FOX CORE v4.3 - WISHLIST & ACCESS ENGINE
console.log("JARVIS: Núcleo Fox Iniciado v4.3");

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
    
    // Check Auth
    if (!window.supabaseClient) return;
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
        alert("Fala gamer! Faça login para salvar seus ativos favoritos.");
        window.openAuthModal();
        return;
    }

    // Animation
    if (btn && btn.classList.contains('wishlist-btn')) {
        btn.classList.remove('animate-shake');
        void btn.offsetWidth;
        btn.classList.add('animate-shake');
        setTimeout(() => btn.classList.remove('animate-shake'), 400);
    }

    // Data Update
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
                window.updateWishlistUI(); // Sincroniza ao abrir
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
    console.log("JARVIS: Boot v4.3 Concluído.");

    // Wishlist Init
    window.updateWishlistUI();

    // Listeners
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = window.handleLogout;

    const closePanelBtn = document.getElementById('closeClientPanel');
    if (closePanelBtn) closePanelBtn.onclick = () => document.getElementById('clientPanel')?.classList.remove('active');

    const closeAuthBtn = document.getElementById('closeAuthModal');
    if (closeAuthBtn) closeAuthBtn.onclick = window.closeAuthModalFunc;

    // Login Form
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const btn = document.getElementById('authSubmitBtn');
            btn.disabled = true;
            btn.innerText = "AUTENTICANDO...";
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

    // UI Watcher
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            const loginBtn = document.getElementById('loginBtn');
            if (session?.user) {
                const name = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
                if (loginBtn) loginBtn.innerHTML = `<i data-lucide="user-check"></i> <span>${name}</span>`;
            } else {
                if (loginBtn) loginBtn.innerHTML = `<i data-lucide="user"></i> <span>Entrar</span>`;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    // Mobile Menu
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) menuToggle.onclick = () => {
        document.getElementById('mainNav')?.classList.toggle('active');
        document.getElementById('navOverlay')?.classList.toggle('active');
    };
});

// --- DOWNLOADS & CHECKOUT ---
const DOWNLOAD_LINKS = {
    'pack_fortnite_stream': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Fortnite_Stream_Edition.rar'
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
    if (data?.init_point) window.location.href = data.init_point;
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
