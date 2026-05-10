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
const mainNav = document.getElementById('mainNav');
const navOverlay = document.getElementById('navOverlay');
const loginBtn = document.getElementById('loginBtn');

const toggleMenu = () => {
    mainNav.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
};

if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
if (navOverlay) navOverlay.addEventListener('click', toggleMenu);

// 3. Login Modal Logic
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const switchToSignUp = document.getElementById('switchToSignUp');
const authTitle = document.getElementById('authTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authSwitchText = document.getElementById('authSwitchText');

let isSignUp = false;

const openModal = () => {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const closeModal = () => {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
};

if (loginBtn) loginBtn.addEventListener('click', openModal);
if (closeAuthModal) closeAuthModal.addEventListener('click', closeModal);

if (switchToSignUp) {
    switchToSignUp.addEventListener('click', () => {
        isSignUp = !isSignUp;
        authTitle.innerHTML = isSignUp ? 'Crie sua <span>Conta Fox</span>' : 'Acesse sua <span>Área Fox Store</span>';
        authSubmitBtn.innerText = isSignUp ? 'Criar Conta' : 'Entrar';
        authSwitchText.innerHTML = isSignUp ? 'Já tem uma conta? <a href="javascript:void(0)" id="switchToSignUp">Entrar</a>' : 'Não tem uma conta? <a href="javascript:void(0)" id="switchToSignUp">Criar conta</a>';
        
        // Re-bind event listener because we replaced the innerHTML
        document.getElementById('switchToSignUp').addEventListener('click', arguments.callee);
    });
}

// 3. Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-nav');
    if (window.scrollY > 50) {
        header.style.padding = '10px 0';
        header.style.background = 'rgba(10, 10, 11, 0.95)';
    } else {
        header.style.padding = '15px 0';
        header.style.background = 'rgba(10, 10, 11, 0.85)';
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
    // Busca o botão se possível, mas não trava se não achar
    const btn = document.querySelector(`button[onclick*="${pacoteId}"]`);
    const originalText = btn ? btn.innerText : "COMPRAR";
    
    try {
        console.log(`Iniciando checkout para: ${pacoteId}`);
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            alert('Fala gamer! para garantir o recebimento dos seus produtos, por favor faça login ou crie uma conta antes de comprar.');
            openAuthModal();
            return;
        }

        if (btn) {
            btn.innerText = "Preparando Checkout...";
            btn.disabled = true;
        }

        console.log("Chamando Edge Function: create-preference...");
        const { data, error } = await supabaseClient.functions.invoke('create-preference', {
            body: { 
                product_id: pacoteId,
                user_email: user.email
            }
        });

        if (error) throw error;

        // --- REGISTRO DO PEDIDO NO SUPABASE ---
        // Tabela de Preços Sincronizada para Registro
        const productPrices = {
            'subgoal_gta_vi': 29.90, 'subgoal_fortnite': 29.90, 'subgoal_arc_riders': 29.90, 'subgoal_grenade': 29.90,
            'pack_jett_valorant': 59.90, 'pack_killjoy_valorant': 59.90, 'pack_raze_valorant': 59.90,
            'pacote_iniciante': 297.00, 'pacote_god': 457.00, 'pacote_premium': 897.00, 'pacote_ultimate': 1197.00
        };

        const amount = productPrices[pacoteId] || 0;

        // Registra a intenção de compra antes de sair do site
        const { error: orderError } = await supabaseClient
            .from('orders')
            .insert([
                { 
                    user_id: user.id, 
                    product_id: pacoteId, 
                    status: 'pending',
                    amount: amount
                }
            ]);
        
        if (orderError) {
            console.error("Erro ao registrar pedido pendente:", orderError);
            // Se o erro for sobre a coluna amount não existir, tentamos total_price
            if (orderError.message.includes('column "amount" does not exist')) {
                 await supabaseClient.from('orders').insert([{ user_id: user.id, product_id: pacoteId, status: 'pending', total_price: amount }]);
            } else {
                alert("AVISO JARVIS: O pagamento será gerado, mas houve um erro ao registrar no seu histórico: " + orderError.message);
            }
        }

        if (data && data.init_point) {
            window.location.href = data.init_point;
        } else {
            throw new Error('O Mercado Pago não devolveu um link de pagamento válido.');
        }

    } catch (error) {
        console.error("ERRO NO CHECKOUT:", error);
        
        let errorDetail = error.message;
        if (error.context && error.context.json && error.context.json.error) {
            errorDetail = error.context.json.error;
        }

        alert(`❌ ERRO NO SISTEMA DE VENDAS:\n\nDetalhe: ${errorDetail}\n\nO site NÃO irá redirecionar. Por favor, verifique se o Access Token do Mercado Pago foi salvo corretamente nos Secrets do Supabase.`);
        
    } finally {
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
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

// Somente ativa se o dispositivo tiver ponteiro preciso (mouse)
if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', syncPointer);
}

// 4. Lógica da Loja e Previews
function openPreview(productId) {
    const videoUrls = {
        'subgoal_gta_vi': 'assets/video_gta_vi.webm',
        'subgoal_fortnite': 'assets/video_fortnite.webm',
        'subgoal_arc_riders': 'assets/video_arc_riders.webm',
        'subgoal_grenade': 'assets/video_grenade.mp4',
        'pack_jett_valorant': 'assets/video_jett.webm',
        'pack_killjoy_valorant': 'assets/video_killjoy.webm',
        'pack_raze_valorant': 'assets/video_raze.webm'
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
const openDownloadsBtn = document.getElementById('openDownloadsBtn');
const downloadsModal = document.getElementById('downloadsModal');
const closeDownloadsModal = document.getElementById('closeDownloadsModal');
const ordersList = document.getElementById('ordersList');

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

const openDownloadsModal = () => {
    if (!downloadsModal) return;
    downloadsModal.style.display = 'flex';
    setTimeout(() => downloadsModal.classList.add('active'), 10);
    loadUserOrders();
};

const closeDownloadsModalFunc = () => {
    if (!downloadsModal) return;
    downloadsModal.classList.remove('active');
    setTimeout(() => downloadsModal.style.display = 'none', 300);
};

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        supabaseClient.auth.getUser().then(({ data: { user } }) => {
            if (user) openClientPanel();
            else openAuthModal();
        });
    });
}

if (closeAuthModal) closeAuthModal.onclick = closeAuthModalFunc;
if (closeClientPanel) closeClientPanel.onclick = closeClientPanelFunc;
if (openDownloadsBtn) openDownloadsBtn.onclick = () => {
    closeClientPanelFunc();
    openDownloadsModal();
};
if (closeDownloadsModal) closeDownloadsModal.onclick = closeDownloadsModalFunc;

window.onclick = (event) => {
    if (event.target === authModal) closeAuthModalFunc();
    if (event.target === downloadsModal) closeDownloadsModalFunc();
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

// Member Area - Load Orders
const loadUserOrders = async () => {
    if (!ordersList) return;
    ordersList.innerHTML = '<div class="loading-spinner">Buscando seus ativos de elite...</div>';

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        ordersList.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar pedidos: ${error.message}</p>`;
        return;
    }

    if (!orders || orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i data-lucide="shopping-cart" size="48"></i>
                <p>Você ainda não possui produtos adquiridos.</p>
                <a href="loja.html" class="btn btn-primary" style="margin-top:15px; display:inline-block;">Explorar Loja</a>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const productNames = {
        'subgoal_gta_vi': 'Meta de Subs: GTA VI Edition',
        'subgoal_fortnite': 'Meta de Subs: Fortnite Edition',
        'subgoal_arc_riders': 'Meta de Subs: Arc Riders Vision',
        'subgoal_grenade': 'Meta de Subs: Grenade Edition',
        'pack_jett_valorant': 'Pack Jett: Valorant Edition',
        'pack_killjoy_valorant': 'Pack Killjoy: Valorant Edition',
        'pack_raze_valorant': 'Pack Raze: Valorant Edition',
        'pacote_iniciante': 'Pacote Iniciante Fox',
        'pacote_god': 'Pacote GOD Fox',
        'pacote_premium': 'Pacote Premium Fox',
        'pacote_ultimate': 'Pacote Ultimate Fox'
    };

    ordersList.innerHTML = '';
    orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('pt-BR');
        const card = document.createElement('div');
        card.className = 'order-card';
        
        const productName = productNames[order.product_id] || order.product_id;
        const statusClass = order.status === 'approved' ? 'status-approved' : 'status-pending';
        const statusText = order.status === 'approved' ? 'Aprovado' : 'Pendente';

        card.innerHTML = `
            <div class="order-info">
                <h4>${productName}</h4>
                <p>Data: ${date} | Pedido: #${order.id.split('-')[0].toUpperCase()}</p>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            ${order.status === 'approved' ? `
                <button onclick="requestFile('${order.id}', '${productName}')" class="btn-request">
                    SOLICITAR ARQUIVOS
                </button>
            ` : ''}
        `;
        ordersList.appendChild(card);
    });
};

function requestFile(orderId, productName) {
    const msg = encodeURIComponent(`Olá Fox Design! Gostaria de receber os arquivos do meu pedido #${orderId.split('-')[0].toUpperCase()} (${productName}) que adquiri no site.`);
    window.open(`https://wa.me/5516997149568?text=${msg}`, '_blank');
}

// Switch between Login and Sign Up
if (switchToSignUp) {
    switchToSignUp.onclick = () => {
        isSignUp = !isSignUp;
        if (isSignUp) {
            authTitle.innerHTML = 'Crie sua conta na <span>Fox Store</span>';
            authSubtitle.innerText = 'Junte-se à Fox Design e acesse ativos exclusivos.';
            authSubmitBtn.innerText = 'Criar Conta';
            authSwitchText.innerHTML = 'Já tem uma conta? <a href="javascript:void(0)" id="switchToLogin">Fazer login</a>';
            document.getElementById('switchToLogin').onclick = switchToSignUp.onclick;
        } else {
            authTitle.innerHTML = 'Acesse sua <span>Área Fox Store</span>';
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
                console.log("Tentando realizar cadastro para:", email);
                result = await supabaseClient.auth.signUp({ email, password });
            } else {
                console.log("Tentando realizar login para:", email);
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            }

            if (result.error) {
                console.error("Erro retornado pelo Supabase:", result.error);
                throw result.error;
            }

            if (isSignUp) {
                if (result.data.user && result.data.session) {
                    alert('Bem-vindo à Fox Store! Sua conta foi criada e o acesso liberado.');
                    closeAuthModalFunc();
                } else {
                    alert('Conta criada! Verifique seu e-mail para confirmar o cadastro (caso não receba, tente logar diretamente).');
                }
            } else {
                closeAuthModalFunc();
            }
        } catch (error) {
            console.error("ERRO NO PROCESSO DE AUTH:", error);
            alert('Erro: ' + (error.message || 'Falha na comunicação com o servidor de e-mail.'));
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

        // Limite de 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert('A foto de perfil deve ter no máximo 2MB.');
            avatarInput.value = '';
            return;
        }

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
