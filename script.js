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
        console.log(`Iniciando checkout para: ${pacoteId}`);
        // Verifica se o usuário está logado
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            console.warn("Usuário não logado ao tentar comprar.");
            alert('Mestre, para garantir o recebimento dos seus ativos, por favor faça login ou crie uma conta antes de comprar.');
            openAuthModal();
            return;
        }

        btn.innerText = "Preparando Checkout...";
        btn.disabled = true;

        // Chama a Edge Function do Supabase
        console.log("Chamando Edge Function: create-preference...");
        const { data, error } = await supabaseClient.functions.invoke('create-preference', {
            body: { 
                product_id: pacoteId,
                user_email: user.email
            }
        });

        if (error) {
            console.error("Erro retornado pela Edge Function:", error);
            throw error;
        }

        console.log("Resposta da Edge Function recebida:", data);

        if (data && data.init_point) {
            console.log("Redirecionando para Mercado Pago:", data.init_point);
            window.location.href = data.init_point;
        } else {
            console.error("Resposta inválida da função (sem init_point):", data);
            throw new Error('Não foi possível gerar o link de pagamento.');
        }

    } catch (error) {
        console.error("ERRO CRÍTICO NO CHECKOUT:", error);
        // Fallback para WhatsApp caso a automação falhe
        const mensagem = encodeURIComponent(`Olá Fox Design! Tentei comprar o ${pacoteId} pelo site, mas ocorreu um erro técnico. Pode me ajudar?`);
        window.location.href = `https://wa.me/5516997149568?text=${mensagem}`;
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
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

// 9. Supabase Authentication Logic
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw'; 

let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase inicializado com sucesso.");
    } else {
        console.error("SDK do Supabase não encontrado. Verifique o link do CDN.");
    }
} catch (e) {
    console.error("Erro ao inicializar Supabase:", e);
}

const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const closeAuthModal = document.getElementById('closeAuthModal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authSwitchText = document.getElementById('authSwitchText');
const switchToSignUp = document.getElementById('switchToSignUp');
const googleLoginBtn = document.getElementById('googleLoginBtn');

// Client Panel Elements
const clientPanel = document.getElementById('clientPanel');
const closeClientPanel = document.getElementById('closeClientPanel');
const logoutBtn = document.getElementById('logoutBtn');
const profileForm = document.getElementById('profileForm');
const avatarClick = document.getElementById('avatarClick');
const avatarInput = document.getElementById('avatarInput');
const panelAvatar = document.getElementById('panelAvatar');

let isSignUp = false;

// Modal & Panel Controls
const openAuthModal = () => {
    if (!authModal) return;
    authModal.style.display = 'flex';
    setTimeout(() => authModal.classList.add('active'), 10);
};

const closeAuthModalFunc = () => {
    if (!authModal) return;
    authModal.classList.remove('active');
    setTimeout(() => authModal.style.display = 'none', 300);
};

const openClientPanel = () => {
    if (clientPanel) clientPanel.classList.add('active');
    loadUserProfile();
};

const closeClientPanelFunc = () => {
    if (clientPanel) clientPanel.classList.remove('active');
};

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const user = supabaseClient.auth.getUser().then(({ data: { user } }) => {
            if (user) openClientPanel();
            else openAuthModal();
        });
    });
}

if (closeAuthModal) closeAuthModal.onclick = closeAuthModalFunc;
if (closeClientPanel) closeClientPanel.onclick = closeClientPanelFunc;

window.onclick = (event) => {
    if (event.target === authModal) closeAuthModalFunc();
};

// Logout
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        if (confirm('Deseja realmente sair da sua conta?')) {
            await supabaseClient.auth.signOut();
            closeClientPanelFunc();
            window.location.reload();
        }
    };
}

// Switch between Login and Sign Up
if (switchToSignUp) {
    switchToSignUp.onclick = () => {
        isSignUp = !isSignUp;
        if (isSignUp) {
            authTitle.innerHTML = 'Crie sua conta <span>Elite</span>';
            authSubtitle.innerText = 'Junte-se à Fox Design e acesse ativos exclusivos.';
            authSubmitBtn.innerText = 'Criar Conta';
            authSwitchText.innerHTML = 'Já tem uma conta? <a href="javascript:void(0)" id="switchToLogin">Fazer login</a>';
            document.getElementById('switchToLogin').onclick = switchToSignUp.onclick;
        } else {
            authTitle.innerHTML = 'Acesse sua <span>Área de Elite</span>';
            authSubtitle.innerText = 'Entre para gerenciar seus ativos e pedidos.';
            authSubmitBtn.innerText = 'Entrar';
            authSwitchText.innerHTML = 'Não tem uma conta? <a href="javascript:void(0)" id="switchToSignUp">Criar conta</a>';
            document.getElementById('switchToSignUp').onclick = switchToSignUp.onclick;
        }
    };
}

// Handle Form Submission
if (authForm && supabaseClient) {
    authForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;

        authSubmitBtn.disabled = true;
        authSubmitBtn.innerText = isSignUp ? 'Criando...' : 'Entrando...';

        try {
            let result;
            if (isSignUp) {
                result = await supabaseClient.auth.signUp({ email, password });
            } else {
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            }

            if (result.error) throw result.error;

            if (isSignUp) {
                alert('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
            } else {
                closeAuthModalFunc();
            }
        } catch (error) {
            alert('Erro: ' + error.message);
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.innerText = isSignUp ? 'Criar Conta' : 'Entrar';
        }
    };
}

// Google Login
if (googleLoginBtn && supabaseClient) {
    googleLoginBtn.onclick = async () => {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) alert('Erro ao entrar com Google: ' + error.message);
    };
}

// Profile Logic
const loadUserProfile = async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    // Busca dados na tabela profiles
    const { data: profile, error } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
    
    if (profile) {
        document.getElementById('profileName').value = profile.full_name || '';
        document.getElementById('profilePhone').value = profile.phone || '';
        document.getElementById('profileInstagram').value = profile.instagram || '';
        if (profile.avatar_url) panelAvatar.src = profile.avatar_url;
    } else {
        // Se não houver perfil, tenta pegar do metadata do Google
        document.getElementById('profileName').value = user.user_metadata?.full_name || '';
        if (user.user_metadata?.avatar_url) panelAvatar.src = user.user_metadata.avatar_url;
    }
};

if (profileForm) {
    profileForm.onsubmit = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabaseClient.auth.getUser();
        const updates = {
            id: user.id,
            full_name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
            instagram: document.getElementById('profileInstagram').value,
            updated_at: new Date()
        };

        const { error } = await supabaseClient.from('profiles').upsert(updates);
        if (error) alert('Erro ao salvar perfil: ' + error.message);
        else alert('Perfil atualizado com sucesso!');
    };
}

// Avatar Upload
if (avatarClick) avatarClick.onclick = () => avatarInput.click();

if (avatarInput) {
    avatarInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const { data: { user } } = await supabaseClient.auth.getUser();
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // Upload para o Storage
            let { error: uploadError } = await supabaseClient.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;

            // Pega URL pública
            const { data: { publicUrl } } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);

            // Atualiza tabela profiles
            const { error: updateError } = await supabaseClient.from('profiles').upsert({
                id: user.id,
                avatar_url: publicUrl,
                updated_at: new Date()
            });
            if (updateError) throw updateError;

            panelAvatar.src = publicUrl;
            updateUIForAuth(user, publicUrl);
            alert('Foto de perfil atualizada!');

        } catch (error) {
            alert('Erro no upload: ' + error.message);
        }
    };
}

// Check Auth State and Update UI
const updateUIForAuth = (user, customAvatar = null) => {
    if (user) {
        if (loginBtn) {
            const avatar = customAvatar || user.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp';
            const name = user.user_metadata?.full_name || user.email.split('@')[0];
            loginBtn.innerHTML = `<img id="navAvatar" src="${avatar}" style="width:25px; height:25px; border-radius:50%; margin-right:8px; vertical-align: middle; object-fit: cover;"> ${name}`;
            loginBtn.onclick = (e) => {
                e.preventDefault();
                openClientPanel();
            };
        }
    } else {
        if (loginBtn) {
            loginBtn.innerText = 'Entrar';
            loginBtn.onclick = (e) => {
                e.preventDefault();
                openAuthModal();
            };
        }
    }
};

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateUIForAuth(session?.user);
    });

    // Initial check
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            // Busca avatar customizado antes de atualizar UI
            supabaseClient.from('profiles').select('avatar_url').eq('id', user.id).single()
                .then(({ data }) => updateUIForAuth(user, data?.avatar_url));
        } else {
            updateUIForAuth(null);
        }
    });
}

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
