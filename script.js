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
