class ProductCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['id', 'name', 'price', 'description', 'image'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const id = this.getAttribute('id') || Date.now();
        const name = this.getAttribute('name') || 'Producto sin nombre';
        const price = this.getAttribute('price') || '0';
        const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
        const description = this.getAttribute('description') || 'Sin descripción';
        const image = this.getAttribute('image') || '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background-color: var(--bg-panel, #1a1a1a);
                    border: 1px solid var(--border-color, #333);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
                    color: var(--text-light, #fff);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                :host(:hover) {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
                    border-color: var(--primary-color, #d4af37);
                }
                .product-card {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .product-image-container {
                    background-color: #ffffff; /* Fondo blanco inmaculado para fusionar fotos JPG */
                    width: 100%;
                    height: 260px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-bottom: 1px solid var(--border-color, #2a2a2a);
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .product-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain; /* Mantiene la botella completa */
                    object-position: center;
                    z-index: 1;
                    mix-blend-mode: multiply; /* Magia: hace transparente el fondo blanco de los JPGs descargados */
                    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                .product-card:hover .product-image {
                    transform: scale(1.15) translateY(-5px);
                }
                .product-details {
                    padding: 25px;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }
                .product-title {
                    font-size: 1.25rem;
                    margin: 0 0 12px 0;
                    color: var(--primary-color, #d4af37);
                    font-weight: 600;
                    line-height: 1.3;
                    transition: color 0.3s;
                }
                .product-price {
                    font-size: 1.3rem;
                    font-weight: bold;
                    margin: 0 0 12px 0;
                    color: var(--text-light, #ffffff);
                }
                .product-desc {
                    font-size: 0.95rem;
                    color: var(--text-muted, #a0a0a0);
                    margin: 0 0 25px 0;
                    line-height: 1.5;
                }
                /* Botón Ghost Premium Dinámico */
                .btn-add {
                    width: 100%;
                    padding: 12px;
                    background-color: transparent;
                    color: var(--primary-color, #d4af37);
                    border: 2px solid var(--primary-color, #d4af37);
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: bold;
                    margin-top: auto;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .btn-add:hover {
                    background-color: var(--primary-color, #d4af37);
                    color: var(--bg-panel, #000);
                    box-shadow: 0 0 15px rgba(0,0,0,0.2); 
                }
                .btn-add:active {
                    transform: scale(0.97);
                }
                .btn-add.added {
                    background-color: #25D366 !important;
                    border-color: #25D366 !important;
                    color: #000 !important;
                }
            </style>
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${image}" alt="${name}" class="product-image" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/500x500/121212/d4af37?text=Sube+tu+Foto';">
                </div>
                <div class="product-details">
                    <h3 class="product-title">${name}</h3>
                    <p class="product-price">${formattedPrice}</p>
                    <p class="product-desc">${description}</p>
                    <button type="button" class="btn-add">🛒 Añadir al Carrito</button>
                </div>
            </div>
        `;

        const btnAdd = this.shadowRoot.querySelector('.btn-add');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('add-to-cart', {
                    detail: { id, name, price, image },
                    bubbles: true,
                    composed: true
                }));
                
                const originalText = btnAdd.innerHTML;
                btnAdd.innerHTML = '✅ ¡Agregado!';
                btnAdd.classList.add('added');
                
                setTimeout(() => {
                    btnAdd.innerHTML = originalText;
                    btnAdd.classList.remove('added');
                }, 1000);
            });
        }
    }
}

customElements.define('product-card', ProductCard);
