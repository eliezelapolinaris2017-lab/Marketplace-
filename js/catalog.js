import { getCategories, getProducts, getSettings, addToCart, formatMoney, getPlaceholder } from './store.js';

const els = {
  storeName: document.getElementById('storeName'),
  categoryTabs: document.getElementById('categoryTabs'),
  productList: document.getElementById('productList'),
  searchInput: document.getElementById('searchInput')
};

let allProducts = [];
let currentCategory = 'all';

init();

async function init() {
  const [settings, categories, products] = await Promise.all([
    getSettings(), getCategories().catch(() => []), getProducts(true).catch(() => [])
  ]);

  document.title = settings.storeName || 'Catálogo';
  els.storeName.textContent = settings.storeName || 'Mi Catálogo';
  allProducts = products;
  renderTabs(categories.filter(c => c.active !== false));
  renderProducts(products);
  els.searchInput.addEventListener('input', applyFilters);
}

function renderTabs(categories) {
  const tabs = [{ slug: 'all', name: 'Todo' }, ...categories.map(c => ({ slug: c.slug || c.name, name: c.name }))];
  els.categoryTabs.innerHTML = tabs.map(tab => `
    <button class="tab-btn ${tab.slug === 'all' ? 'active' : ''}" data-slug="${tab.slug}">${tab.name}</button>
  `).join('');

  els.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.slug;
      els.categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });
}

function applyFilters() {
  const term = els.searchInput.value.trim().toLowerCase();
  const filtered = allProducts.filter(product => {
    const inCategory = currentCategory === 'all' || (product.categorySlug || '').toLowerCase() === currentCategory.toLowerCase();
    const inSearch = !term || `${product.name} ${product.description || ''}`.toLowerCase().includes(term);
    return inCategory && inSearch;
  });
  renderProducts(filtered);
}

function renderProducts(products) {
  if (!products.length) {
    els.productList.innerHTML = '<div class="empty-state">No hay productos para mostrar.</div>';
    return;
  }

  els.productList.innerHTML = products.map(product => `
    <article class="product-card">
      <a href="./producto.html?id=${product.id}">
        <img src="${product.imageUrl || getPlaceholder(product.name)}" alt="${escapeHtml(product.name)}" />
      </a>
      <div>
        <a href="./producto.html?id=${product.id}"><h3>${escapeHtml(product.name)}</h3></a>
        <p>${escapeHtml(product.description || 'Producto sin descripción todavía.')}</p>
        <div class="price-row">
          <span class="price">${formatMoney(product.price)}</span>
          <button class="primary-btn js-add" data-id="${product.id}">Comprar</button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.js-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = allProducts.find(p => p.id === btn.dataset.id);
      if (!product) return;
      addToCart(product);
      btn.textContent = 'Añadido';
      setTimeout(() => btn.textContent = 'Comprar', 1100);
    });
  });
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
