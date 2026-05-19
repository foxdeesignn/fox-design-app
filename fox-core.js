// 0. JARVIS Version Control
console.log("JARVIS: Fox Design System v4.0 [MASTER-RESCUE] ativo.");

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw';

// Inicialização Global Imediata
window.supabaseClient = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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
    
    if (!window.supabaseClient) {
        console.error("Supabase não carregado.");
        window.openAuthModal();
        return;
    }

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) {
            const clientPanel = document.getElementById('clientPanel');
            if (clientPanel) clientPanel.classList.add('active');
        } else {
            window.openAuthModal();
        }
    } catch (err) {
        window.openAuthModal();
    }
};

// --- BOOT DO SISTEMA ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("JARVIS: DOM Pronto. Ativando listeners secundários.");

    // Fechar Modais
    const closeAuthBtn = document.getElementById('closeAuthModal');
    if (closeAuthBtn) closeAuthBtn.onclick = window.closeAuthModalFunc;

    const closePanelBtn = document.getElementById('closeClientPanel');
    const clientPanel = document.getElementById('clientPanel');
    if (closePanelBtn && clientPanel) closePanelBtn.onclick = () => clientPanel.classList.remove('active');

    // Troca Login/Cadastro
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

    // Formulário de Login
    const authForm = document.getElementById('authForm');
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
                    ? await window.supabaseClient.auth.signUp({ email, password })
                    : await window.supabaseClient.auth.signInWithPassword({ email, password });
                
                if (res.error) throw res.error;
                window.closeAuthModalFunc();
                if (isSignUp) alert("Conta criada! Verifique seu e-mail.");
            } catch (err) {
                alert("Erro: " + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = isSignUp ? "Criar Conta" : "Entrar";
            }
        };
    }

    // Login Google
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.onclick = async () => {
            await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin + window.location.pathname }
            });
        };
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await window.supabaseClient.auth.signOut();
            window.location.reload();
        };
    }

    // Sistema de Downloads
    const openDownloadsBtn = document.getElementById('openDownloadsBtn');
    if (openDownloadsBtn) {
        openDownloadsBtn.onclick = () => {
            const downloadsModal = document.getElementById('downloadsModal');
            if (downloadsModal) {
                downloadsModal.style.display = 'flex';
                setTimeout(() => downloadsModal.classList.add('active'), 10);
                document.body.style.overflow = 'hidden';
                if (clientPanel) clientPanel.classList.remove('active');
                fetchUserOrders();
            }
        };
    }

    // Watcher de Sessão
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await window.supabaseClient.from('profiles').upsert({ id: session.user.id, updated_at: new Date().toISOString() }, { onConflict: 'id' });
            }
            updateUIForAuth(session?.user);
        });
        
        window.supabaseClient.auth.getUser().then(({ data: { user } }) => {
            updateUIForAuth(user);
        });
    }

    // Inicializa ícones e animações
    if (typeof lucide !== 'undefined') lucide.createIcons();
    revealElements();
});

// --- LÓGICA DE LOJA E DOWNLOADS ---
const DOWNLOAD_LINKS = {
    'pack_fortnite_stream': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Fortnite_Stream_Edition.rar'
};

async function fetchUserOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    ordersList.innerHTML = '<div class="loading-spinner">Buscando ativos...</div>';
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;
        const { data: orders } = await window.supabaseClient.from('orders').select('*').eq('user_email', user.email);
        const finalOrders = orders || [];
        if (user.email === 'foxdeesignn@gmail.com') {
            finalOrders.unshift({ product_id: 'pack_fortnite_stream', product_title: 'Pack Fortnite: Stream Edition (Simulação)', status: 'paid' });
        }
        ordersList.innerHTML = '';
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
window.toggleWishlist = async function(id, title, img) {
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

// --- UTILS ---
const updateUIForAuth = (user) => {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    if (user) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        loginBtn.innerHTML = `<i data-lucide="user-check"></i> <span>${name}</span>`;
    } else {
        loginBtn.innerHTML = `<i data-lucide="user"></i> <span>Entrar</span>`;
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
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) { window.openAuthModal(); return; }
    const { data } = await window.supabaseClient.functions.invoke('create-preference', { body: { product_id: pacoteId, user_email: user.email } });
    if (data?.init_point) window.location.href = data.init_point;
}
