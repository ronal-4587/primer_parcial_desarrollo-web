document.addEventListener('DOMContentLoaded', () => {
    // Advertencia de protocolo file:// (Doble Clic)
    if (window.location.protocol === 'file:') {
        alert("⚠️ ALERTA: Estás abriendo el HTML haciendo doble clic (file://). Para que la página cargue los productos, DEBES abrirla usando la extensión 'Live Server' de VS Code.");
    }

    // 1. Cargar fragmentos HTML 
    loadFragments();


    // 2. Cargar datos JSON e inyectar productos usando <template> y Web Components
    loadProducts();
});

async function loadFragments() {
    try {
        const [headerRes, sidebarRes, footerRes] = await Promise.all([
            fetch('./components/header.html'),
            fetch('./components/sidebar.html'),
            fetch('./components/footer.html')
        ]);

        if (!headerRes.ok || !sidebarRes.ok || !footerRes.ok) {
            throw new Error('No se encontraron los componentes HTML.');
        }

        const headerHtml = await headerRes.text();
        const sidebarHtml = await sidebarRes.text();
        const footerHtml = await footerRes.text();

        document.getElementById('header-container').innerHTML = headerHtml;
        document.getElementById('sidebar-container').innerHTML = sidebarHtml;
        document.getElementById('footer-container').innerHTML = footerHtml;

        // Inicializar interactividad de los fragmentos una vez cargados
        initSidebarEvents();
        initLogoutEvent();
        initThemeToggle();
        if (typeof updateCartUI === 'function') updateCartUI();
    } catch (error) {
        console.error('Error cargando fragmentos:', error);
        document.getElementById('header-container').innerHTML = '<h2 style="color:var(--error-color); padding: 20px;">[Error: Componentes no cargados. Usa Live Server]</h2>';
    }
}

function initSidebarEvents() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');

    if (menuBtn && sidebar && overlay && closeBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });

        closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
        
        // Cerrar el menú automáticamente al hacer clic en un enlace de navegación
        const navLinks = sidebar.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
}

function initLogoutEvent() {
    const logoutBtn = document.getElementById('logout-btn');
    const hasSession = localStorage.getItem('userSession');

    if (logoutBtn) {
        if (hasSession) {
            logoutBtn.innerHTML = '🚪 Cerrar Sesión';
            logoutBtn.style.color = 'var(--error-color)';
            logoutBtn.style.borderColor = 'var(--error-color)';
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('userSession');
                window.location.reload();
            });
        } else {
            logoutBtn.innerHTML = '👤 Iniciar Sesión';
            logoutBtn.style.color = 'var(--primary-color)';
            logoutBtn.style.borderColor = 'var(--primary-color)';
            logoutBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    }
}

function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const root = document.documentElement;
            const temp = root.getAttribute('data-theme');
            const nuevoTema = temp === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', nuevoTema);
            localStorage.setItem('estanco_theme', nuevoTema);
        });
    }
}

async function loadProducts() {
    const container = document.getElementById('products-container');
    const template = document.getElementById('product-template');

    try {
        const response = await fetch('./data/products.json');

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - No se pudo ubicar el archivo data/products.json`);
        }

        const products = await response.json();

        // Limpiar contenedor 
        if (container) container.innerHTML = '';

        products.forEach(product => {
            // Clonar contenido del template
            const clone = template.content.cloneNode(true);

            // Buscar el web component instanciado dentro del clone
            const productCard = clone.querySelector('product-card');

            if (productCard) {
                // Setear atributos pasando data del JSON
                productCard.setAttribute('id', product.id);
                productCard.setAttribute('name', product.name);
                productCard.setAttribute('price', product.price);
                productCard.setAttribute('description', product.description || 'Sin descripción');
                productCard.setAttribute('image', product.image);
            }

            // Inyectar en el DOM principal
            if (container) container.appendChild(clone);
        });
    } catch (error) {
        console.error('Error cargando productos JSON:', error);

        let errorMsg = `Error detallado: ${error.message}`;
        if (window.location.protocol === 'file:') {
            errorMsg = '⚠️ ERROR DE CORS (Carga Bloqueada): Por seguridad, el navegador no permite usar fetch() en archivos locales (haciendo doble clic).<br><br><b>SOLUCIÓN:</b> En VS Code, haz clic derecho en el <b>index.html</b> y elige "Open with Live Server".';
        }

        if (container) {
            container.innerHTML = `<div style="grid-column: 1/-1; padding: 2rem; border: 2px dashed var(--error-color); color: var(--error-color); text-align: center; border-radius: 8px; font-size: 1.1rem; line-height: 1.5;">${errorMsg}</div>`;
        }
    }
}
