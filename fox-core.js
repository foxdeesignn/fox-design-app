// 0. JARVIS Version Control
console.log("JARVIS: Fox Design System v3.1 ativo.");

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
const logoutBtn = document.getElementById('logoutBtn');
const openDownloadsBtn = document.getElementById('openDownloadsBtn');

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

const closeClientPanel = document.getElementById('closeClientPanel');
const clientPanel = document.getElementById('clientPanel');
if (closeClientPanel && clientPanel) {
    closeClientPanel.onclick = () => {
        clientPanel.classList.remove('active');
    };
}

const closeDownloadsModal = document.getElementById('closeDownloadsModal');
const downloadsModal = document.getElementById('downloadsModal');
if (closeDownloadsModal && downloadsModal) {
    closeDownloadsModal.onclick = () => {
        downloadsModal.style.display = 'none';
        downloadsModal.classList.remove('active');
        document.body.style.overflow = '';
    };
}

// Global Click for Logout Button
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        console.log("JARVIS: Finalizando sessão...");
        if (supabaseClient) {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error("JARVIS: Erro ao sair:", error.message);
            }
            window.location.reload();
        }
    });
}

// Global Click for Downloads Button
// 7. Client Area & Downloads
const DOWNLOAD_LINKS = {
    'pack_fortnite_stream': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Fortnite_Stream_Edition.rar',
    'streamdeck_fortnite': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Fortnite_Stream_Deck.zip',
    'streamdeck_akatsuki': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Akatsuki_Stream_Deck.zip',
    'pack_jett_valorant': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Jett_Valorant.zip',
    'pack_raze_valorant': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Pack_Raze_Valorant.zip',
    'chat_cyberpunk': 'https://github.com/foxdeesignn/fox-design-app/raw/main/downloads/Chat_Cyberpunk_Fox.zip'
};

// 7.1 Wishlist System
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
            div.style = "background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 10px; position: relative;";
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

    // Atualizar estrelas nos cards
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const match = btn.getAttribute('onclick').match(/'([^']+)'/);
        if (!match) return;
        const productId = match[1];
        const isFavorited = wishlist.some(i => i.id === productId);
        
        if (isFavorited) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.toggleWishlist = function(id, title, img) {
    // Tenta capturar o botão que disparou o evento
    const btn = event ? event.currentTarget : null;
    const index = wishlist.findIndex(item => item.id === id);
    
    // Animação de tremor
    if (btn && btn.classList.contains('wishlist-btn')) {
        btn.classList.remove('animate-shake');
        void btn.offsetWidth; // Trigger reflow
        btn.classList.add('animate-shake');
        setTimeout(() => btn.classList.remove('animate-shake'), 400);
    }

    if (index === -1) {
        wishlist.push({ id, title, img });
    } else {
        wishlist.splice(index, 1);
    }
    localStorage.setItem('fox_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
};

// Inicializar UI de Wishlist no boot
window.addEventListener('DOMContentLoaded', () => {
    updateWishlistUI();
});

async function fetchUserOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    ordersList.innerHTML = '<div class="loading-spinner">Acessando cofre de elite...</div>';

    try {
        console.log("JARVIS: Iniciando busca de pedidos...");
        
        if (!supabaseClient) {
            console.error("JARVIS: Erro Crítico - Supabase não inicializado.");
            throw new Error("Sistema de dados indisponível.");
        }

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        
        if (authError || !user) {
            console.warn("JARVIS: Usuário não autenticado.");
            ordersList.innerHTML = '<div style="text-align:center; padding: 20px;">Faça login para ver seus ativos.</div>';
            return;
        }

        console.log("JARVIS: Usuário logado:", user.email);

        // Busca real no Supabase
        const { data: orders, error: dbError } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('user_email', user.email);

        if (dbError) {
            console.error("JARVIS: Erro na consulta ao banco:", dbError);
            // Se der erro no banco, mas for o Mestre, a gente continua para mostrar a simulação
            if (user.email !== 'foxdeesignn@gmail.com') throw dbError;
        }

        const finalOrders = orders || [];

        // JARVIS: Atalho INFALÍVEL de visualização para o Mestre
        if (user.email === 'foxdeesignn@gmail.com' || user.email === 'tsobralpbmk1@gmail.com') {
            console.log("JARVIS: Aplicando atalho de desenvolvedor...");
            finalOrders.unshift({
                product_id: 'pack_fortnite_stream',
                product_title: 'Pack Fortnite: Stream Edition (Simulação)',
                status: 'paid'
            });
        }

        if (finalOrders.length === 0) {
            ordersList.innerHTML = '<div style="text-align:center; padding: 20px;">Nenhum ativo encontrado no seu histórico.</div>';
            return;
        }

        ordersList.innerHTML = ''; 

        finalOrders.forEach(order => {
            const isPaid = order.status === 'paid' || order.status === 'approved';
            const downloadUrl = DOWNLOAD_LINKS[order.product_id] || '#';
            
            const card = document.createElement('div');
            card.className = 'order-card';
            card.style = "background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 12px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center; gap: 15px;";
            
            card.innerHTML = `
                <div style="width: 50px; height: 50px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="package" style="color: var(--fox-orange); opacity: 0.7;"></i>
                </div>
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0; font-size: 0.9rem; color: #fff; font-family: 'Sora';">${order.product_title || order.product_id}</h4>
                    <p style="margin: 3px 0 0; font-size: 0.7rem; color: ${isPaid ? '#00ff88' : '#ffaa00'}; font-weight: 700;">
                        ${isPaid ? 'PAGAMENTO APROVADO' : 'AGUARDANDO PAGAMENTO'}
                    </p>
                </div>
                ${isPaid ? `
                    <a href="${downloadUrl}" target="_blank" class="btn-download-mini" style="background: var(--fox-orange); color: #000; padding: 8px 12px; border-radius: 6px; font-family: 'Orbitron'; font-size: 0.65rem; font-weight: 900; text-decoration: none; display: flex; align-items: center; gap: 5px;">
                        <i data-lucide="download" size="12"></i> BAIXAR
                    </a>
                ` : `
                    <button disabled style="background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); padding: 8px 12px; border-radius: 6px; font-family: 'Orbitron'; font-size: 0.65rem; font-weight: 900; border: none;">
                        BLOQUEADO
                    </button>
                `}
            `;
            ordersList.appendChild(card);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch (err) {
        console.error("JARVIS: Falha na Área de Membros:", err);
        ordersList.innerHTML = `<div style="text-align:center; padding: 20px; color: #ff4444; font-size: 0.8rem;">
            ERRO TÉCNICO: ${err.message || "Falha na conexão com o servidor."}<br>
            <span style="font-size: 0.7rem; color: #888;">Tente recarregar a página.</span>
        </div>`;
    }
}

if (openDownloadsBtn) {
    openDownloadsBtn.addEventListener('click', () => {
        if (downloadsModal) {
            downloadsModal.style.display = 'flex';
            setTimeout(() => downloadsModal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
            if (clientPanel) clientPanel.classList.remove('active');
            
            // JARVIS: Carregar pedidos reais do Supabase
            fetchUserOrders();
        }
    });
}

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
    
    const welcomeSection = document.getElementById('welcomeSection');
    const profileForm = document.getElementById('profileForm');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (user) {
        const avatar = customAvatar || user.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp';
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        loginBtn.innerHTML = `<img src="${avatar}" style="width:25px; height:25px; border-radius:50%; margin-right:8px; vertical-align: middle; object-fit: cover;"> ${name}`;
        
        // Preencher campos do painel lateral
        const panelAvatar = document.getElementById('panelAvatar');
        const profileName = document.getElementById('profileName');
        const profilePhone = document.getElementById('profilePhone');
        const profileInstagram = document.getElementById('profileInstagram');
        
        if (panelAvatar) panelAvatar.src = avatar;

        // JARVIS: Buscar dados reais do perfil para decidir o que mostrar
        supabaseClient.from('profiles').select('*').eq('id', user.id).single().then(({ data: profile }) => {
            if (profile) {
                if (profileName) profileName.value = profile.full_name || '';
                if (profilePhone) profilePhone.value = profile.phone || '';
                if (profileInstagram) profileInstagram.value = profile.instagram || '';

                // Se já tem nome e instagram, oculta o formulário e mostra boas-vindas
                if (profile.full_name && profile.instagram && welcomeSection && profileForm) {
                    welcomeSection.style.display = 'block';
                    profileForm.style.display = 'none';
                    if (userNameDisplay) userNameDisplay.innerText = profile.full_name.split(' ')[0];
                } else {
                    if (welcomeSection) welcomeSection.style.display = 'none';
                    if (profileForm) profileForm.style.display = 'block';
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

// Lógica de Salvamento de Perfil
const profileFormElement = document.getElementById('profileForm');
if (profileFormElement) {
    profileFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('saveProfileBtn');
        const fullName = document.getElementById('profileName').value;
        const phone = document.getElementById('profilePhone').value;
        const instagram = document.getElementById('profileInstagram').value;

        if (!supabaseClient) return;

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "SALVANDO...";
            }

            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado.");

            const { error } = await supabaseClient.from('profiles').upsert({
                id: user.id,
                full_name: fullName,
                phone: phone,
                instagram: instagram,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;

            // Sucesso: Atualiza UI para modo "Boas-vindas"
            const welcomeSection = document.getElementById('welcomeSection');
            const userNameDisplay = document.getElementById('userNameDisplay');
            
            if (welcomeSection) welcomeSection.style.display = 'block';
            if (profileFormElement) profileFormElement.style.display = 'none';
            if (userNameDisplay) userNameDisplay.innerText = fullName.split(' ')[0];

            alert("Perfil Fox atualizado com sucesso de elite!");

        } catch (err) {
            console.error("JARVIS: Erro ao salvar perfil:", err);
            alert("Erro ao salvar: " + err.message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Salvar Alterações";
            }
        }
    });
}

// Funções de Autenticação
const loginWithGoogle = async () => {
    if (!supabaseClient) return;
    console.log("JARVIS: Iniciando login via Google...");
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        if (error) throw error;
    } catch (err) {
        console.error("JARVIS: Erro no login Google:", err.message);
        alert("Erro ao conectar com Google: " + err.message);
    }
};

// Listeners do Modal de Autenticação
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', loginWithGoogle);
}

if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const submitBtn = document.getElementById('authSubmitBtn');
        const isSignUp = submitBtn.innerText.toLowerCase().includes('criar');

        submitBtn.disabled = true;
        submitBtn.innerText = isSignUp ? "CRIANDO CONTA..." : "ENTRANDO...";

        try {
            let res;
            if (isSignUp) {
                res = await supabaseClient.auth.signUp({ email, password });
            } else {
                res = await supabaseClient.auth.signInWithPassword({ email, password });
            }

            if (res.error) throw res.error;
            
            closeAuthModalFunc();
            if (isSignUp) alert("Conta criada! Verifique seu e-mail para confirmar (se necessário) ou faça login.");
        } catch (err) {
            alert("Erro: " + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = isSignUp ? "Criar Conta" : "Entrar";
        }
    });
}

if (switchToSignUp) {
    switchToSignUp.addEventListener('click', () => {
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
    });
}

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            console.log(`JARVIS: Evento ${event} detectado. Garantindo registro do perfil...`);
            
            // Registra o login básico se o perfil não existir ou para atualizar data
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

// 8. Store Functions (Checkout/Preview)
async function startCheckout(pacoteId) {
    // Seletor mais específico para evitar capturar o botão de preview
    const btn = document.querySelector(`button.btn-buy-mini[onclick*="${pacoteId}"]`) || 
                document.querySelector(`button[onclick*="startCheckout('${pacoteId}')"]`);
    
    try {
        console.log(`JARVIS: Iniciando checkout para o produto: ${pacoteId}`);
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            alert('Fala gamer! Faça login antes de comprar.');
            openAuthModal();
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i data-lucide="loader" class="refreshing"></i> PROCESSANDO...';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        const productIdSanitized = pacoteId.trim().toLowerCase();
        const { data, error } = await supabaseClient.functions.invoke('create-preference', {
            body: { product_id: productIdSanitized, user_email: user.email }
        });

        if (error) {
            console.error("JARVIS: Erro retornado pela Edge Function:", error);
            throw new Error(error.message || "Erro na Edge Function");
        }

        if (data && data.error) {
            console.error("JARVIS: Erro lógico na função:", data.error);
            throw new Error(data.error);
        }

        if (data && data.init_point) {
            console.log("JARVIS: Link de pagamento gerado com sucesso!");
            window.location.href = data.init_point;
        } else {
            throw new Error("Link de pagamento não recebido do servidor.");
        }

    } catch (error) {
        console.error("JARVIS: Erro Crítico no Checkout:", error);
        alert(`Erro no sistema de vendas: ${error.message}\n\nPor favor, informe este erro ao suporte: suportefoxdesignn@gmail.com`);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'COMPRAR';
        }
    }
}

function closePreview() {
    const modal = document.getElementById('preview-modal');
    if (modal) {
        modal.innerHTML = ""; // Limpa o conteúdo (para parar áudio de iframes e vídeos)
        modal.style.display = 'none';
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
        'pack_yoru_valorant': 'assets/video_yoru.mp4',
        'pack_sage_valorant': 'assets/video_sage.mp4',
        'pack_spiderman_miles': 'assets/video_spiderman.mp4',
        'streamdeck_fortnite': 'https://www.youtube.com/embed/HBT3VSOTzrw?autoplay=1',
        'streamdeck_akatsuki': 'https://www.youtube.com/embed/kfgDWZvU84Q?autoplay=1',
        'chat_cyberpunk': 'https://www.youtube.com/embed/mPIpPg-fbvc?autoplay=1',
        'pack_fortnite_stream': 'https://www.youtube.com/embed/rNi7CAwz_oA?autoplay=1'
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
        
        let closeBtn = `<button onclick="closePreview()" style="position: absolute; top: 20px; right: 20px; color: white; background: rgba(0,0,0,0.5); border: none; font-size: 2rem; cursor: pointer; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10001; transition: 0.3s;">✕</button>`;

        if (isYouTube) {
            modal.innerHTML = `<div style="position: relative; width: 95%; max-width: 1100px; aspect-ratio: 16/9;"><iframe width="100%" height="100%" src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 20px;"></iframe>${closeBtn}</div>`;
        } else {
            modal.innerHTML = `<div style="position: relative; width: 95%; max-width: 1100px; aspect-ratio: 16/9;"><video autoplay controls style="width: 100%; height: 100%; border-radius: 20px;"><source src="${videoUrl}" type="${isWebm ? 'video/webm' : 'video/mp4'}"></video>${closeBtn}</div>`;
        }
        modal.style.display = 'flex';
    }
}

// 9. Boot
window.addEventListener('DOMContentLoaded', () => {
    revealElements();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
