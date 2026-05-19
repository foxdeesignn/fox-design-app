// FOX CORE v4.2 - GESTÃO DE ACESSO MASTER
console.log("JARVIS: Núcleo Fox Iniciado v4.2");

// --- SUPABASE SETUP ---
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw';

try {
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("JARVIS: Conectado ao Supabase.");
    }
} catch (e) { console.error("JARVIS: Erro Supabase SDK:", e); }

// --- FUNÇÕES GLOBAIS ---
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
    console.log("JARVIS: Comando de Acesso acionado.");
    
    if (!window.supabaseClient) { window.openAuthModal(); return; }

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) {
            console.log("JARVIS: Abrindo Painel do Cliente para:", user.email);
            const panel = document.getElementById('clientPanel');
            if (panel) panel.classList.add('active');
        } else {
            window.openAuthModal();
        }
    } catch (err) {
        window.openAuthModal();
    }
};

// --- LOGOUT MASTER ---
window.handleLogout = async function() {
    console.log("JARVIS: Finalizando sessão de elite...");
    if (window.supabaseClient) {
        const btn = document.getElementById('logoutBtn');
        if (btn) btn.innerText = "SAINDO...";
        
        await window.supabaseClient.auth.signOut();
        localStorage.removeItem('fox_wishlist'); // Opcional: limpa desejos ao sair
        window.location.reload();
    }
};

// --- BOOT DO SISTEMA ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("JARVIS: Sistema de Elite Pronto.");

    // Configurar botão de Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = window.handleLogout;

    // Fechar painéis
    const closePanelBtn = document.getElementById('closeClientPanel');
    if (closePanelBtn) closePanelBtn.onclick = () => {
        const panel = document.getElementById('clientPanel');
        if (panel) panel.classList.remove('active');
    };

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
                window.location.reload();
            } catch (err) {
                alert("Falha: " + err.message);
                btn.disabled = false;
                btn.innerText = "Entrar";
            }
        };
    }

    // Google Login
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) googleBtn.onclick = () => {
        window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + window.location.pathname }
        });
    };

    // UI Sincronização
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            const loginBtn = document.getElementById('loginBtn');
            const welcomeText = document.getElementById('userNameDisplay');
            
            if (session?.user) {
                const name = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
                if (loginBtn) loginBtn.innerHTML = `<i data-lucide="user-check"></i> <span>${name}</span>`;
                if (welcomeText) welcomeText.innerText = name;
                
                // Mostrar seção de boas-vindas no painel
                const welcomeSection = document.getElementById('welcomeSection');
                const profileForm = document.getElementById('profileForm');
                if (welcomeSection) welcomeSection.style.display = 'block';
                if (profileForm) profileForm.style.display = 'none';
            } else {
                if (loginBtn) loginBtn.innerHTML = `<i data-lucide="user"></i> <span>Entrar</span>`;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });

        // Check inicial
        window.supabaseClient.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                const name = user.user_metadata?.full_name || user.email.split('@')[0];
                const loginBtn = document.getElementById('loginBtn');
                if (loginBtn) loginBtn.innerHTML = `<i data-lucide="user-check"></i> <span>${name}</span>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }

    // FAQ & Mobile Menu
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.onclick = () => {
            mainNav.classList.toggle('active');
            document.getElementById('navOverlay')?.classList.toggle('active');
        };
    }
});

// --- WISHLIST ---
window.toggleWishlist = function(id, title, img) {
    const btn = event ? event.currentTarget : null;
    if (btn) {
        btn.classList.toggle('active');
        btn.classList.add('animate-shake');
        setTimeout(() => btn.classList.remove('animate-shake'), 400);
    }
};

// --- DOWNLOADS ---
async function fetchUserOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList || !window.supabaseClient) return;
    
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;
        
        const { data: orders } = await window.supabaseClient.from('orders').select('*').eq('user_email', user.email);
        const finalOrders = orders || [];
        
        if (user.email === 'foxdeesignn@gmail.com') {
            finalOrders.unshift({ product_id: 'pack_fortnite_stream', product_title: 'Pack Fortnite (Simulação)', status: 'paid' });
        }
        
        ordersList.innerHTML = finalOrders.length ? '' : '<p style="text-align:center; padding:20px;">Nenhum ativo.</p>';
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
