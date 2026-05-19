// FOX CORE v4.1 - PROTOCOLO DE RESGATE
console.log("JARVIS: Núcleo Fox Iniciado v4.1");

// --- SUPABASE SETUP ---
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw';

try {
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("JARVIS: Supabase Conectado.");
    } else {
        console.error("JARVIS: Erro Crítico - SDK Supabase não encontrado.");
    }
} catch (e) { console.error("JARVIS: Erro na inicialização:", e); }

// --- FUNÇÕES GLOBAIS ---
window.openAuthModal = function() {
    console.log("JARVIS: Abrindo Modal de Login...");
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    } else {
        alert("Erro: Interface de login não encontrada.");
    }
};

window.handleLoginClick = async function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    console.log("JARVIS: Clique detectado no botão Entrar.");
    
    if (!window.supabaseClient) {
        console.warn("JARVIS: Supabase Offline. Forçando abertura do modal.");
        window.openAuthModal();
        return;
    }

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) {
            console.log("JARVIS: Usuário logado:", user.email);
            const panel = document.getElementById('clientPanel');
            if (panel) panel.classList.add('active');
        } else {
            window.openAuthModal();
        }
    } catch (err) {
        window.openAuthModal();
    }
};

// --- LISTENERS DE BOOT ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("JARVIS: DOM Pronto.");

    // Fechar modais
    const closeAuth = document.getElementById('closeAuthModal');
    if (closeAuth) closeAuth.onclick = () => {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; document.body.style.overflow = ''; }, 300);
        }
    };

    const closePanel = document.getElementById('closeClientPanel');
    if (closePanel) closePanel.onclick = () => {
        const panel = document.getElementById('clientPanel');
        if (panel) panel.classList.remove('active');
    };

    // Form de Login
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const btn = document.getElementById('authSubmitBtn');
            btn.disabled = true;
            btn.innerText = "PROCESSANDO...";
            try {
                const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                location.reload();
            } catch (err) {
                alert("Erro: " + err.message);
                btn.disabled = false;
                btn.innerText = "Entrar";
            }
        };
    }

    // Google
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) googleBtn.onclick = () => window.supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });

    // Sincronização de UI
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn && session?.user) {
                loginBtn.innerHTML = `<span>${session.user.email.split('@')[0]}</span>`;
            }
        });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// --- WISHLIST ---
window.toggleWishlist = function(id, title, img) {
    const btn = event ? event.currentTarget : null;
    if (btn) {
        btn.classList.toggle('active');
        btn.classList.add('animate-shake');
        setTimeout(() => btn.classList.remove('animate-shake'), 400);
    }
    console.log("JARVIS: Item toggle wishlist:", id);
};
