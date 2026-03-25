let cart = JSON.parse(localStorage.getItem('estanco_cart')) || [];

document.addEventListener('add-to-cart', (e) => {
    const product = e.detail;
    
    // Convertir precio a numero de manera segura
    let parsedPrice = 0;
    if (typeof product.price === 'string') {
        parsedPrice = parseFloat(product.price.replace(/[^\d.-]/g, ''));
    } else {
        parsedPrice = parseFloat(product.price);
    }

    const existing = cart.find(item => item.id == product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, price: parsedPrice });
    }
    updateCartUI();
    
    /* Se elimina la apertura automática del carrito para permitir que el 
       usuario siga comprando tranquilamente sin interrupciones visuales en pantalla. */
});

// Actualizar conteo e interfaz
function updateCartUI() {
    localStorage.setItem('estanco_cart', JSON.stringify(cart));
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);

    const itemsContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('btn-checkout');

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
        totalEl.textContent = '$ 0';
        if(checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    if(checkoutBtn) checkoutBtn.style.display = 'block';

    itemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const row = document.createElement('div');
        row.className = 'cart-item';
        
        const imgUrl = item.image ? item.image : 'https://placehold.co/100x100/121212/d4af37?text=Foto';
        
        row.innerHTML = `
            <div class="cart-item-wrapper">
                <div class="cart-item-img-container">
                    <img src="${imgUrl}" alt="${item.name}" class="cart-item-img" onerror="this.onerror=null; this.src='https://placehold.co/100x100/ffffff/d4af37?text=...';">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.price)}</p>
                </div>
            </div>
            <div class="cart-item-controls-flex">
                <button type="button" class="btn-qty" onclick="changeQty(${item.id}, -1)">-</button>
                <span class="cart-item-qty">${item.quantity}</span>
                <button type="button" class="btn-qty" onclick="changeQty(${item.id}, 1)">+</button>
                <button type="button" class="btn-remove ml-5" onclick="removeItem(${item.id})">🗑️</button>
            </div>
        `;
        itemsContainer.appendChild(row);
    });

    totalEl.textContent = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(total);
}

// Controladores de estado global para que llamen desde HTML inline hooks
window.changeQty = function(id, delta) {
    const item = cart.find(i => i.id == id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id != id);
        }
        updateCartUI();
    }
};

window.removeItem = function(id) {
    cart = cart.filter(i => i.id != id);
    updateCartUI();
};

// Modales y botones de cierre
document.addEventListener('DOMContentLoaded', () => {
    // Eventos delegados en body (porque botones pueden cargarse tarde via fetch en header)
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#open-cart-btn')) {
            document.getElementById('cart-modal').classList.add('active');
        }
    });

    document.getElementById('close-cart-btn')?.addEventListener('click', () => {
        document.getElementById('cart-modal').classList.remove('active');
    });

    document.getElementById('close-checkout-btn')?.addEventListener('click', () => {
        document.getElementById('checkout-modal').classList.remove('active');
    });

    document.getElementById('btn-checkout')?.addEventListener('click', () => {
        // Validar que el usuario haya iniciado sesión antes de ir al pago
        const sessionName = localStorage.getItem('userSession');
        if (!sessionName) {
            alert("⚠️ Por favor Inicia Sesión desde el menú para poder finalizar tu compra.");
            window.location.href = "login.html";
            return;
        }

        document.getElementById('cart-modal').classList.remove('active');
        
        // Autocompletar el campo de nombre usando el nombre de la sesión
        const nameField = document.getElementById('chk-name');
        if (nameField) nameField.value = sessionName;
        
        document.getElementById('checkout-modal').classList.add('active');
    });

    // Lógica dinámica para los métodos de pago
    const chkPayment = document.getElementById('chk-payment');
    const panelNequi = document.getElementById('payment-details-nequi');
    const panelCard = document.getElementById('payment-details-card');
    
    if (chkPayment) {
        chkPayment.addEventListener('change', (e) => {
            const val = e.target.value;
            if(panelNequi) panelNequi.style.display = 'none';
            if(panelCard) panelCard.style.display = 'none';
            
            // Remover el bloqueo required de todos
            document.getElementById('chk-phone').required = false;
            document.getElementById('chk-card-num').required = false;
            document.getElementById('chk-card-exp').required = false;
            document.getElementById('chk-card-cvv').required = false;

            if (val === 'Nequi' || val === 'DaviPlata') {
                if(panelNequi) panelNequi.style.display = 'block';
                document.getElementById('chk-phone').required = true;
            } else if (val === 'Tarjeta') {
                if(panelCard) panelCard.style.display = 'block';
                document.getElementById('chk-card-num').required = true;
                document.getElementById('chk-card-exp').required = true;
                document.getElementById('chk-card-cvv').required = true;
            }
        });
    }

    // Envío del Checkout (PDF)
    const checkoutForm = document.getElementById('checkout-form');
    if(checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            generarFacturaPDF();
        });
    }
});

// Lógica de jsPDF
function generarFacturaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const nombre = document.getElementById('chk-name').value;
    const documento = document.getElementById('chk-doc').value;
    const direccion = document.getElementById('chk-addr').value;
    let metodoPago = document.getElementById('chk-payment').value;
    
    if (metodoPago === 'Nequi' || metodoPago === 'DaviPlata') {
        const phone = document.getElementById('chk-phone').value;
        metodoPago += ` (Cel: ${phone})`;
    } else if (metodoPago === 'Tarjeta') {
        const cardNum = document.getElementById('chk-card-num').value;
        const last4 = cardNum.slice(-4);
        metodoPago += ` (**** ${last4})`;
    }

    const fecha = new Date().toLocaleString();

    // Instanciar PDF
    let currentY = 20;

    try {
        const logoVisible = document.querySelector('.header-logo');
        if (logoVisible && logoVisible.complete && logoVisible.naturalWidth > 0) {
            const proporcionHeight = logoVisible.naturalHeight / logoVisible.naturalWidth;
            const anchoLogo = 110; 
            const altoLogo = anchoLogo * proporcionHeight;
            const posX = 105 - (anchoLogo / 2); 
            
            doc.addImage(logoVisible, posX, 10, anchoLogo, altoLogo);
            currentY = 10 + altoLogo + 12; 
        }
    } catch (err) {
        console.warn('Nota: Logo no cargado en PDF debido a las reglas de CORS locales', err);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55); 
    doc.text('Estanco Ortega', 105, currentY, null, null, 'center');
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Factura de Venta #${documento}`, 105, currentY + 10, null, null, 'center');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 105, currentY + 18, null, null, 'center');
    
    let yPos = currentY + 32;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Fecha: ${fecha}`, 15, yPos);
    doc.text(`Cliente: ${nombre}`, 15, yPos + 7);
    doc.text(`NIT/CC: ${documento}`, 15, yPos + 14);
    doc.text(`Dirección: ${direccion}`, 15, yPos + 21);
    doc.text(`Método de Pago: ${metodoPago}`, 15, yPos + 28);

    let cLine = yPos + 35;
    doc.line(15, cLine, 195, cLine);

    doc.setFont("helvetica", "bold");
    doc.text("CANT.", 15, cLine + 7);
    doc.text("PRODUCTO", 35, cLine + 7);
    doc.text("V. UNIT.", 140, cLine + 7);
    doc.text("SUBTOTAL", 170, cLine + 7);

    doc.line(15, cLine + 10, 195, cLine + 10);

    doc.setFont("helvetica", "normal");
    let y = cLine + 17;
    let totalFactura = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        totalFactura += subtotal;

        const valUnit = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.price);
        const valSubt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotal);

        doc.text(item.quantity.toString(), 15, y);
        doc.text(item.name.substring(0, 45), 35, y); 
        doc.text(valUnit, 140, y);
        doc.text(valSubt, 170, y);
        
        y += 8;
    });

    doc.line(15, y, 195, y);
    y += 10;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(212, 175, 55);
    const totalFinal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalFactura);
    doc.text(`TOTAL A PAGAR: ${totalFinal}`, 195, y, null, null, "right");

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Gracias por elegir Estanco Ortega. ¡Salud!", 105, y+20, null, null, "center");

   
    doc.save(`Factura_Ortega_${documento}.pdf`);

    cart = [];
    localStorage.removeItem('estanco_cart');
    updateCartUI();
    document.getElementById('checkout-form').reset();
    document.getElementById('checkout-modal').classList.remove('active');
    alert("¡Pago simulado exitosamente! La factura en PDF ha sido generada y descargada.");
}
