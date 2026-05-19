// 0. JARVIS Version Control
console.log("JARVIS: Fox Design System v3.4 [MASTER] ativo.");

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw';
window.supabaseClient = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// 1. Core Functions & Modals
window.openAuthModal = () => {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }
};

window.closeAuthModalFunc = () => {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
};

// 2. Global Actions
window.handleLoginClick = async (e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log("JARVIS: Login Global Action Triggered.");
    const clientPanel = document.getElementById('clientPanel');
    
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
                if (clientPanel) clientPanel.classList.add('active');
            } else {
                window.openAuthModal();
            }
        } catch (err) {
            console.error("JARVIS: Auth Error:", err);
            window.openAuthModal();
        }
    } else {
        window.openAuthModal();
    }
};

// 3. Main Boot
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const navOverlay = document.getElementById('navOverlay');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const closeClientPanel = document.getElementById('closeClientPanel');
    const clientPanel = document.getElementById('clientPanel');
    const closeDownloadsModal = document.getElementById('closeDownloadsModal');
    const downloadsModal = document.getElementById('downloadsModal');
    const openDownloadsBtn = document.getElementById('openDownloadsBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const authForm = document.getElementById('authForm');
    const switchToSignUp = document.getElementById('switchToSignUp');

    // Attach Login Action
    if (loginBtn) loginBtn.onclick = window.handleLoginClick;

    // Navigation
    const toggleMenu = () => {
        if (mainNav && navOverlay) {
            mainNav.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        }
    };
    if (menuToggle) menuToggle.onclick = toggleMenu;
    if (navOverlay) navOverlay.onclick = toggleMenu;

    // Modal Closers
    if (closeAuthModal) closeAuthModal.onclick = window.closeAuthModalFunc;
    if (closeClientPanel && clientPanel) closeClientPanel.onclick = () => clientPanel.classList.remove('active');
    if (closeDownloadsModal && downloadsModal) {
        closeDownloadsModal.onclick = () => {
            downloadsModal.style.display = 'none';
            downloadsModal.classList.remove('active');
            document.body.style.overflow = '';
        };
    }

    // Downloads
    if (openDownloadsBtn) {
        openDownloadsBtn.onclick = () => {
            if (downloadsModal) {
                downloadsModal.style.display = 'flex';
                setTimeout(() => downloadsModal.classList.add('active'), 10);
                document.body.style.overflow = 'hidden';
                if (clientPanel) clientPanel.classList.remove('active');
                fetchUserOrders();
            }
        };
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            if (supabaseClient) {
                await supabaseClient.auth.signOut();
                window.location.reload();
            }
        };
    }

    // Auth Logic
    if (googleLoginBtn) {
        googleLoginBtn.onclick = async () => {
            if (supabaseClient) {
                await supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.origin + window.location.pathname }
                });
            }
        };
    }

    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const submitBtn = document.getElementById('authSubmitBtn');
            const isSignUp = submitBtn.innerText.toLowerCase().includes('criar');
            submitBtn.disabled = true;
            submitBtn.innerText = "AGUARDE...";
            try {
                let res = isSignUp 
                    ? await supabaseClient.auth.signUp({ email, password })
                    : await supabaseClient.auth.signInWithPassword({ email, password });
                if (res.error) throw res.error;
                window.closeAuthModalFunc();
                if (isSignUp) alert("Verifique seu e-mail para ativar a conta.");
            } catch (err) {
                alert("Erro: " + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = isSignUp ? "Criar Conta" : "Entrar";
            }
        };
    }

    if (switchToSignUp) {
        switchToSignUp.onclick = () => {
            const title = document.getElementById('authTitle');
            const btn = document.getElementById('authSubmitBtn');
            const linkText = document.getElementById('authSwitchText');
            if (btn.innerText === "Entrar") {
                title.innerHTML = "Crie sua Conta <span>Fox</span>";
                btn.innerText = "Criar Conta";
                linkText.innerHTML = 'Já tem uma conta? <a href="javascript:void(0)" id="switchToSignUp">Fazer Login</a>';
            } else {
                title.innerHTML = "Acesse sua Área <span>Fox Store</span>";
                btn.innerText = "Entrar";
                linkText.innerHTML = 'Não tem uma conta? <a href="javascript:void(0)" id="switchToSignUp">Criar conta</a>';
            }
        };
    }

    // Supabase Watcher
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await supabaseClient.from('profiles').upsert({
                    id: session.user.id,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
            }
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

    revealElements();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// 4. Store & Wishlist System
const DOWNLOAD_LINKS = {
    'pack_fortnite_stream': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Fortnite_Stream_Edition.rar',
    'streamdeck_fortnite': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Fortnite_Stream_Deck.zip',
    'streamdeck_akatsuki': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Akatsuki_Stream_Deck.zip',
    'pack_jett_valorant': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Jett_Valorant.zip',
    'pack_raze_valorant': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Raze_Valorant.zip',
    'chat_cyberpunk': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Chat_Cyberpunk_Fox.zip'
};

let wishlist = JSON.parse(localStorage.getItem('fox_wishlist')) || [];

function updateWishlistUI() {
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
                    <h5 style="margin: 0; font-size: 0.75rem; color: #fff;">${item.title}</h5>
                    <button onclick="startCheckout('${item.id}')" style="background: none; border: none; color: var(--fox-orange); font-size: 0.65rem; font-weight: 700; cursor: pointer; padding: 0;">COMPRAR</button>
                </div>
                <button onclick="window.toggleWishlist('${item.id}')" style="background: none; border: none; color: #ff4444; cursor: pointer; opacity: 0.6;"><i data-lucide="x" size="14"></i></button>
            `;
            container.appendChild(div);
        });
    }
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (wishlist.some(i => i.id === productId)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.toggleWishlist = function(id, title, img) {
    const btn = event ? event.currentTarget : null;
    const index = wishlist.findIndex(item => item.id === id);
    if (btn && btn.classList.contains('wishlist-btn')) {
        btn.classList.remove('animate-shake');
        void btn.offsetWidth;
        btn.classList.add('animate-shake');
        setTimeout(() => btn.classList.remove('animate-shake'), 400);
    }
    if (index === -1) wishlist.push({ id, title, img });
    else wishlist.splice(index, 1);
    localStorage.setItem('fox_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
};

async function fetchUserOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    ordersList.innerHTML = '<div class="loading-spinner">Buscando ativos...</div>';
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;
        const { data: orders } = await supabaseClient.from('orders').select('*').eq('user_email', user.email);
        const finalOrders = orders || [];
        if (user.email === 'foxdeesignn@gmail.com' || user.email === 'tsobralpbmk1@gmail.com') {
            finalOrders.unshift({ product_id: 'pack_fortnite_stream', product_title: 'Pack Fortnite: Stream Edition (Simulação)', status: 'paid' });
        }
        if (finalOrders.length === 0) {
            ordersList.innerHTML = '<div style="text-align:center; padding: 20px;">Nenhum ativo encontrado.</div>';
            return;
        }
        ordersList.innerHTML = '';
        finalOrders.forEach(order => {
            const isPaid = order.status === 'paid' || order.status === 'approved';
            const card = document.createElement('div');
            card.className = 'order-card';
            card.style = "background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 12px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center; gap: 15px;";
            card.innerHTML = `
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0; font-size: 0.9rem; color: #fff;">${order.product_title || order.product_id}</h4>
                    <p style="margin: 3px 0 0; font-size: 0.7rem; color: ${isPaid ? '#00ff88' : '#ffaa00'};">${isPaid ? 'APROVADO' : 'PENDENTE'}</p>
                </div>
                ${isPaid ? `<a href="${DOWNLOAD_LINKS[order.product_id] || '#'}" target="_blank" class="btn-download-mini" style="background: var(--fox-orange); color: #000; padding: 8px 12px; border-radius: 6px; font-size: 0.65rem; font-weight: 900; text-decoration: none;">BAIXAR</a>` : ''}
            `;
            ordersList.appendChild(card);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) { console.error(err); }
}

// 5. Supabase & Auth Initialization
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw';
let supabaseClient = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const updateUIForAuth = (user, customAvatar = null) => {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    const welcomeSection = document.getElementById('welcomeSection');
    const profileForm = document.getElementById('profileForm');
    if (user) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        loginBtn.innerHTML = `<i data-lucide="user-check"></i> <span>${name}</span>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        supabaseClient.from('profiles').select('*').eq('id', user.id).single().then(({ data: profile }) => {
            if (profile) {
                if (document.getElementById('profileName')) document.getElementById('profileName').value = profile.full_name || '';
                if (profile.full_name && welcomeSection && profileForm) {
                    welcomeSection.style.display = 'block';
                    profileForm.style.display = 'none';
                    if (document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').innerText = profile.full_name.split(' ')[0];
                }
            }
        });
    } else {
        loginBtn.innerHTML = `<i data-lucide="user"></i> <span>Entrar</span>`;
        if (welcomeSection) welcomeSection.style.display = 'none';
        if (profileForm) profileForm.style.display = 'block';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// 6. Checkout & Animations
async function startCheckout(pacoteId) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) { window.openAuthModal(); return; }
        const { data, error } = await supabaseClient.functions.invoke('create-preference', { body: { product_id: pacoteId, user_email: user.email } });
        if (data?.init_point) window.location.href = data.init_point;
    } catch (error) { alert("Erro no checkout."); }
}

const revealElements = () => {
    const elements = document.querySelectorAll('.benefit-card, .section-subtitle, .reveal-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('reveal'); });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
};
