import { getProductById, addToCart, formatMoney, getPlaceholder } from './store.js';

const root = document.getElementById('productDetail');
const params = new URLSearchParams(location.search);
const id = params.get('id');

init();

async function init() {
  if (!id) {
    root.innerHTML = '<div class="empty-state">Producto no encontrado.</div>';
    return;
  }
  const product = await getProductById(id);
  if (!product) {
    root.innerHTML = '<div class="empty-state">Producto no disponible.</div>';
    return;
  }

  document.title = product.name;
  root.innerHTML = `
    <article class="detail-card">
      <img src="${product.imageUrl || getPlaceholder(product.name)}" alt="${escapeHtml(product.name)}" />
      <div style="padding:16px 6px 6px;">
        <p class="eyebrow">${escapeHtml(product.categorySlug || 'Producto')}</p>
        <h2>${escapeHtml(product.name)}</h2>
        <p class="muted">${escapeHtml(product.description || 'Descripción pendiente.')}</p>
        <p class="price" style="font-size:1.4rem;">${formatMoney(product.price)}</p>
        <div class="detail-actions">
          <button class="primary-btn" id="addBtn">Añadir al carrito</button>
          ${product.payLink ? `<a class="secondary-btn" href="${product.payLink}" target="_blank" rel="noopener noreferrer">Pagar este artículo</a>` : '<div class="notice">Este producto todavía no tiene paylink configurado.</div>'}
        </div>
      </div>
    </article>
  `;

  document.getElementById('addBtn').addEventListener('click', () => {
    addToCart(product);
    document.getElementById('addBtn').textContent = 'Añadido';
  });
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
