// 0. JARVIS Version Control
console.log("JARVIS: Fox Design System v4.0 [OFFICIAL-STABLE] ativo.");

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw';

// Inicialização Global Robusta
window.getSupabase = () => {
    if (window.supabaseClient) return window.supabaseClient;
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return window.supabaseClient;
    }
    return null;
};

// --- FUNÇÕES GLOBAIS DE INTERFACE ---
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

window.handleLoginClick = async (e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log("JARVIS: Clique de Login detectado.");
    const client = window.getSupabase();
    
    if (!client) {
        console.error("Erro: Supabase SDK não carregado.");
        window.openAuthModal(); // Abre o modal mesmo assim para não travar a UI
        return;
    }

    try {
        const { data: { user } } = await client.auth.getUser();
        if (user) {
            const clientPanel = document.getElementById('clientPanel');
            if (clientPanel) clientPanel.classList.add('active');
        } else {
            window.openAuthModal();
        }
    } catch (err) {
        console.error("Erro na autenticação:", err);
        window.openAuthModal();
    }
};

// --- BOOT DO SISTEMA ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("JARVIS: Boot iniciado.");

    // Registro de Listeners de Fechamento
    const setupClosers = () => {
        const closeAuthBtn = document.getElementById('closeAuthModal');
        if (closeAuthBtn) closeAuthBtn.onclick = window.closeAuthModalFunc;

        const closePanelBtn = document.getElementById('closeClientPanel');
        const clientPanel = document.getElementById('clientPanel');
        if (closePanelBtn && clientPanel) closePanelBtn.onclick = () => clientPanel.classList.remove('active');

        const closeDownloadsBtn = document.getElementById('closeDownloadsModal');
        const downloadsModal = document.getElementById('downloadsModal');
        if (closeDownloadsBtn && downloadsModal) {
            closeDownloadsBtn.onclick = () => {
                downloadsModal.style.display = 'none';
                downloadsModal.classList.remove('active');
                document.body.style.overflow = '';
            };
        }
    };

    // Alternância Login/Cadastro
    const setupAuthSwitch = () => {
        const switchToSignUp = document.getElementById('switchToSignUp');
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
    };

    // Formulário de Login
    const setupAuthForm = () => {
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.onsubmit = async (e) => {
                e.preventDefault();
                const client = window.getSupabase();
                if (!client) return;

                const email = document.getElementById('authEmail').value;
                const password = document.getElementById('authPassword').value;
                const submitBtn = document.getElementById('authSubmitBtn');
                const isSignUp = submitBtn.innerText.toLowerCase().includes('criar');

                submitBtn.disabled = true;
                submitBtn.innerText = "AGUARDE...";

                try {
                    let res = isSignUp 
                        ? await client.auth.signUp({ email, password })
                        : await client.auth.signInWithPassword({ email, password });
                    
                    if (res.error) throw res.error;
                    window.closeAuthModalFunc();
                    if (isSignUp) alert("Verifique seu e-mail.");
                } catch (err) {
                    alert("Erro: " + err.message);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerText = isSignUp ? "Criar Conta" : "Entrar";
                }
            };
        }
    };

    // Login Google
    const setupGoogleLogin = () => {
        const googleBtn = document.getElementById('googleLoginBtn');
        if (googleBtn) {
            googleBtn.onclick = async () => {
                const client = window.getSupabase();
                if (client) {
                    await client.auth.signInWithOAuth({
                        provider: 'google',
                        options: { redirectTo: window.location.origin + window.location.pathname }
                    });
                }
            };
        }
    };

    // Logout
    const setupLogout = () => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = async () => {
                const client = window.getSupabase();
                if (client) {
                    await client.auth.signOut();
                    window.location.reload();
                }
            };
        }
    };

    // Inicialização
    setupClosers();
    setupAuthSwitch();
    setupAuthForm();
    setupGoogleLogin();
    setupLogout();

    const openDownloadsBtn = document.getElementById('openDownloadsBtn');
    if (openDownloadsBtn) {
        openDownloadsBtn.onclick = () => {
            const downloadsModal = document.getElementById('downloadsModal');
            if (downloadsModal) {
                downloadsModal.style.display = 'flex';
                setTimeout(() => downloadsModal.classList.add('active'), 10);
                document.body.style.overflow = 'hidden';
                const clientPanel = document.getElementById('clientPanel');
                if (clientPanel) clientPanel.classList.remove('active');
                fetchUserOrders();
            }
        };
    }

    // Watcher de Sessão
    const client = window.getSupabase();
    if (client) {
        client.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await client.from('profiles').upsert({ id: session.user.id, updated_at: new Date().toISOString() }, { onConflict: 'id' });
            }
            updateUIForAuth(session?.user);
        });
        client.auth.getUser().then(({ data: { user } }) => updateUIForAuth(user));
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    revealElements();
});

// --- LÓGICA DE NEGÓCIO ---
const DOWNLOAD_LINKS = {
    'pack_fortnite_stream': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Fortnite_Stream_Edition.rar',
    'streamdeck_fortnite': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Fortnite_Stream_Deck.zip',
    'streamdeck_akatsuki': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Akatsuki_Stream_Deck.zip',
    'pack_jett_valorant': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Jett_Valorant.zip',
    'pack_raze_valorant': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Raze_Valorant.zip',
    'chat_cyberpunk': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Chat_Cyberpunk_Fox.zip'
};

async function fetchUserOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    ordersList.innerHTML = '<div class="loading-spinner">Buscando ativos...</div>';
    try {
        const client = window.getSupabase();
        if (!client) return;
        const { data: { user } } = await client.auth.getUser();
        if (!user) return;
        const { data: orders } = await client.from('orders').select('*').eq('user_email', user.email);
        const finalOrders = orders || [];
        if (user.email === 'foxdeesignn@gmail.com' || user.email === 'tsobralpbmk1@gmail.com') {
            finalOrders.unshift({ product_id: 'pack_fortnite_stream', product_title: 'Pack Fortnite: Stream Edition (Simulação)', status: 'paid' });
        }
        ordersList.innerHTML = finalOrders.length ? '' : '<div style="text-align:center; padding: 20px;">Nenhum ativo encontrado.</div>';
        finalOrders.forEach(order => {
            const isPaid = order.status === 'paid' || order.status === 'approved';
            const card = document.createElement('div');
            card.className = 'order-card';
            card.style = "background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 12px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;";
            card.innerHTML = `<div><h4 style="margin:0; color:#fff;">${order.product_title || order.product_id}</h4><p style="margin:5px 0 0; font-size:0.7rem; color:${isPaid?'#00ff88':'#ffaa00'};">${isPaid?'APROVADO':'PENDENTE'}</p></div>
            ${isPaid ? `<a href="${DOWNLOAD_LINKS[order.product_id] || '#'}" target="_blank" style="background:var(--fox-orange); color:#000; padding:8px 12px; border-radius:6px; font-weight:900; text-decoration:none; font-size:0.6rem;">BAIXAR</a>`:''}`;
            ordersList.appendChild(card);
        });
    } catch (e) { ordersList.innerHTML = "Erro ao carregar."; }
}

// --- WISHLIST ---
let wishlist = JSON.parse(localStorage.getItem('fox_wishlist')) || [];
window.toggleWishlist = function(id, title, img) {
    const btn = event ? event.currentTarget : null;
    const index = wishlist.findIndex(item => item.id === id);
    if (btn) {
        btn.classList.remove('animate-shake');
        void btn.offsetWidth;
        btn.classList.add('animate-shake');
    }
    if (index === -1) wishlist.push({ id, title, img });
    else wishlist.splice(index, 1);
    localStorage.setItem('fox_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
};

function updateWishlistUI() {
    const container = document.getElementById('wishlistContainer');
    if (!container) return;
    container.innerHTML = wishlist.length ? '' : '<p style="color: #666; font-size: 0.75rem;">Lista vazia.</p>';
    wishlist.forEach(item => {
        const div = document.createElement('div');
        div.style = "display:flex; align-items:center; gap:10px; margin-bottom:10px; background:rgba(255,255,255,0.03); padding:10px; border-radius:8px;";
        div.innerHTML = `<img src="${item.img}" style="width:30px; height:30px; border-radius:4px; object-fit:cover;">
        <div style="flex-grow:1;"><h5 style="margin:0; font-size:0.7rem; color:#fff;">${item.title}</h5></div>
        <button onclick="window.toggleWishlist('${item.id}')" style="background:none; border:none; color:#ff4444; cursor:pointer;">&times;</button>`;
        container.appendChild(div);
    });
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (wishlist.some(i => i.id === productId)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// --- PERFIL E UI ---
const updateUIForAuth = (user) => {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    const welcomeSection = document.getElementById('welcomeSection');
    const profileForm = document.getElementById('profileForm');
    if (user) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        loginBtn.innerHTML = `<i data-lucide="user-check"></i> <span>${name}</span>`;
        const client = window.getSupabase();
        if (client) {
            client.from('profiles').select('*').eq('id', user.id).single().then(({ data: profile }) => {
                if (profile) {
                    if (document.getElementById('profileName')) document.getElementById('profileName').value = profile.full_name || '';
                    if (profile.full_name && welcomeSection && profileForm) {
                        welcomeSection.style.display = 'block';
                        profileForm.style.display = 'none';
                        if (document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').innerText = profile.full_name.split(' ')[0];
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
    updateWishlistUI();
};

const revealElements = () => {
    const elements = document.querySelectorAll('.benefit-card, .section-subtitle, .reveal-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('reveal'); });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
};

async function startCheckout(pacoteId) {
    const client = window.getSupabase();
    if (!client) return;
    const { data: { user } } = await client.auth.getUser();
    if (!user) { window.openAuthModal(); return; }
    const { data } = await client.functions.invoke('create-preference', { body: { product_id: pacoteId, user_email: user.email } });
    if (data?.init_point) window.location.href = data.init_point;
}
