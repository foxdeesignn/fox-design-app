// 0. JARVIS Version Control
console.log("JARVIS: Fox Design System v3.2 [STABLE] ativo.");

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

// 2. Initializing Elements & Global Listeners
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

    // LOGIN ACTION
    if (loginBtn) {
        loginBtn.onclick = async (e) => {
            e.preventDefault();
            console.log("JARVIS: Login Triggered.");
            if (supabaseClient) {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (user) {
                    if (clientPanel) clientPanel.classList.add('active');
                } else {
                    window.openAuthModal();
                }
            } else {
                window.openAuthModal();
            }
        };
    }

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

    // Auth Form Logic
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
            submitBtn.innerText = "PROCESSANDO...";

            try {
                let res = isSignUp 
                    ? await supabaseClient.auth.signUp({ email, password })
                    : await supabaseClient.auth.signInWithPassword({ email, password });

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

    // Initial State Check
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

// 7. Store Data & Downloads
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
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const match = btn.getAttribute('onclick').match(/'([^']+)'/);
        if (!match) return;
        if (wishlist.some(i => i.id === match[1])) btn.classList.add('active');
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
    ordersList.innerHTML = '<div class="loading-spinner">Acessando cofre de elite...</div>';
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            ordersList.innerHTML = '<div style="text-align:center; padding: 20px;">Faça login para ver seus ativos.</div>';
            return;
        }
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
            const downloadUrl = DOWNLOAD_LINKS[order.product_id] || '#';
            const card = document.createElement('div');
            card.className = 'order-card';
            card.style = "background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 12px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center; gap: 15px;";
            card.innerHTML = `<div style="width: 50px; height: 50px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i data-lucide="package" style="color: var(--fox-orange); opacity: 0.7;"></i></div><div style="flex-grow: 1;"><h4 style="margin: 0; font-size: 0.9rem; color: #fff; font-family: 'Sora';">${order.product_title || order.product_id}</h4><p style="margin: 3px 0 0; font-size: 0.7rem; color: ${isPaid ? '#00ff88' : '#ffaa00'}; font-weight: 700;">${isPaid ? 'PAGAMENTO APROVADO' : 'AGUARDANDO PAGAMENTO'}</p></div>${isPaid ? `<a href="${downloadUrl}" target="_blank" class="btn-download-mini" style="background: var(--fox-orange); color: #000; padding: 8px 12px; border-radius: 6px; font-family: 'Orbitron'; font-size: 0.65rem; font-weight: 900; text-decoration: none; display: flex; align-items: center; gap: 5px;"><i data-lucide="download" size="12"></i> BAIXAR</a>` : `<button disabled style="background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); padding: 8px 12px; border-radius: 6px; font-family: 'Orbitron'; font-size: 0.65rem; font-weight: 900; border: none;">BLOQUEADO</button>`}`;
            ordersList.appendChild(card);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        ordersList.innerHTML = `<div style="text-align:center; padding: 20px; color: #ff4444;">Erro técnico: ${err.message}</div>`;
    }
}

// 8. Supabase & UI Updates
const SUPABASE_URL = 'https://pnewkedxkqdhplhfkrij.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZXdrZWR4a3FkaHBsaGZrcmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDM0MTEsImV4cCI6MjA5Mzc3OTQxMX0.EBhhXQ9uVZEINEv8zgI3mmvZpKeueu4jw7u2VXhW_rw'; 
let supabaseClient = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const updateUIForAuth = (user, customAvatar = null) => {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    const welcomeSection = document.getElementById('welcomeSection');
    const profileForm = document.getElementById('profileForm');
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (user) {
        const avatar = customAvatar || user.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp';
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        loginBtn.innerHTML = `<img src="${avatar}" style="width:25px; height:25px; border-radius:50%; margin-right:8px; vertical-align: middle; object-fit: cover;"> ${name}`;
        const panelAvatar = document.getElementById('panelAvatar');
        if (panelAvatar) panelAvatar.src = avatar;
        supabaseClient.from('profiles').select('*').eq('id', user.id).single().then(({ data: profile }) => {
            if (profile) {
                document.getElementById('profileName').value = profile.full_name || '';
                document.getElementById('profilePhone').value = profile.phone || '';
                document.getElementById('profileInstagram').value = profile.instagram || '';
                if (profile.full_name && profile.instagram && welcomeSection && profileForm) {
                    welcomeSection.style.display = 'block';
                    profileForm.style.display = 'none';
                    if (userNameDisplay) userNameDisplay.innerText = profile.full_name.split(' ')[0];
                }
            }
        });
    } else {
        loginBtn.innerHTML = `<i data-lucide="user"></i> <span>Entrar</span>`;
        if (welcomeSection) welcomeSection.style.display = 'none';
        if (profileForm) profileForm.style.display = 'block';
    }
};

const profileFormElement = document.getElementById('profileForm');
if (profileFormElement) {
    profileFormElement.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('saveProfileBtn');
        const fullName = document.getElementById('profileName').value;
        const phone = document.getElementById('profilePhone').value;
        const instagram = document.getElementById('profileInstagram').value;
        try {
            submitBtn.disabled = true;
            submitBtn.innerText = "SALVANDO...";
            const { data: { user } } = await supabaseClient.auth.getUser();
            const { error } = await supabaseClient.from('profiles').upsert({
                id: user.id, full_name: fullName, phone: phone, instagram: instagram, updated_at: new Date().toISOString()
            });
            if (error) throw error;
            document.getElementById('welcomeSection').style.display = 'block';
            profileFormElement.style.display = 'none';
            document.getElementById('userNameDisplay').innerText = fullName.split(' ')[0];
            alert("Perfil Fox atualizado!");
        } catch (err) {
            alert("Erro: " + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Salvar Alterações";
        }
    };
}

async function startCheckout(pacoteId) {
    const btn = document.querySelector(`button.btn-buy-mini[onclick*="${pacoteId}"]`) || document.querySelector(`button[onclick*="startCheckout('${pacoteId}')"]`);
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) { alert('Faça login antes de comprar.'); window.openAuthModal(); return; }
        if (btn) { btn.disabled = true; btn.innerHTML = 'PROCESSANDO...'; }
        const { data, error } = await supabaseClient.functions.invoke('create-preference', { body: { product_id: pacoteId, user_email: user.email } });
        if (error || (data && data.error)) throw new Error(error?.message || data.error);
        if (data?.init_point) window.location.href = data.init_point;
    } catch (error) {
        alert(`Erro no checkout: ${error.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = 'COMPRAR'; }
    }
}

function closePreview() {
    const modal = document.getElementById('preview-modal');
    if (modal) { modal.innerHTML = ""; modal.style.display = 'none'; }
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
        const closeBtn = `<button onclick="closePreview()" style="position: absolute; top: 20px; right: 20px; color: white; background: rgba(0,0,0,0.5); border: none; font-size: 2rem; cursor: pointer; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10001; transition: 0.3s;">✕</button>`;
        if (isYouTube) {
            modal.innerHTML = `<div style="position: relative; width: 95%; max-width: 1100px; aspect-ratio: 16/9;"><iframe width="100%" height="100%" src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 20px;"></iframe>${closeBtn}</div>`;
        } else {
            modal.innerHTML = `<div style="position: relative; width: 95%; max-width: 1100px; aspect-ratio: 16/9;"><video autoplay controls style="width: 100%; height: 100%; border-radius: 20px;"><source src="${videoUrl}" type="${videoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'}"></video>${closeBtn}</div>`;
        }
        modal.style.display = 'flex';
    }
}

// Reveal Logic
const revealElements = () => {
    const elements = document.querySelectorAll('.benefit-card, .section-subtitle, .reveal-up, .influencer-stats');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
};
