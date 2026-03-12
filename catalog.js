import {
  getCategories,
  getProducts,
  getSettings,
  addToCart,
  formatMoney,
  getPlaceholder
} from './store.js';

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
  try {
    const [settings, categories, products] = await Promise.all([
      getSettings(),
      getCategories(),
      getProducts(true)
    ]);

    console.log('SETTINGS:', settings);
    console.log('CATEGORIES:', categories);
    console.log('PRODUCTS:', products);

    document.title = settings.storeName || 'Catálogo';
    if (els.storeName) {
      els.storeName.textContent = settings.storeName || 'Mi Catálogo';
    }

    allProducts = Array.isArray(products) ? products : [];

    renderTabs(
      Array.isArray(categories)
        ? categories.filter(c => c.active !== false)
        : []
    );

    renderProducts(allProducts);

    if (els.searchInput) {
      els.searchInput.addEventListener('input', applyFilters);
    }
  } catch (error) {
    console.error('Error cargando catálogo:', error);
    if (els.productList) {
      els.productList.innerHTML = `
        <div class="empty-state">
          Error cargando productos. Revisa reglas de Firebase, colección products y consola.
        </div>
      `;
    }
  }
}

function renderTabs(categories) {
  if (!els.categoryTabs) return;

  const tabs = [
    { slug: 'all', name: 'Todo' },
    ...categories.map(c => ({
      slug: String(c.slug || c.name || '').trim(),
      name: c.name || 'Categoría'
    })).filter(tab => tab.slug)
  ];

  els.categoryTabs.innerHTML = tabs.map(tab => `
    <button
      class="tab-btn ${tab.slug === currentCategory ? 'active' : ''}"
      data-slug="${escapeHtml(tab.slug)}"
      type="button"
    >
      ${escapeHtml(tab.name)}
    </button>
  `).join('');

  els.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.slug || 'all';

      els.categoryTabs.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
      });

      btn.classList.add('active');
      applyFilters();
    });
  });
}

function applyFilters() {
  const term = (els.searchInput?.value || '').trim().toLowerCase();

  const filtered = allProducts.filter(product => {
    const productCategory = String(product.categorySlug || '').trim().toLowerCase();
    const inCategory =
      currentCategory === 'all' ||
      productCategory === String(currentCategory).trim().toLowerCase();

    const searchableText = `${product.name || ''} ${product.description || ''}`.toLowerCase();
    const inSearch = !term || searchableText.includes(term);

    return inCategory && inSearch;
  });

  renderProducts(filtered);
}

function renderProducts(products) {
  if (!els.productList) return;

  if (!products.length) {
    els.productList.innerHTML = '<div class="empty-state">No hay productos para mostrar.</div>';
    return;
  }

  els.productList.innerHTML = products.map(product => `
    <article class="product-card">
      <a href="./producto.html?id=${encodeURIComponent(product.id)}">
        <img
          src="${escapeAttribute(product.imageUrl || getPlaceholder(product.name || 'Producto'))}"
          alt="${escapeAttribute(product.name || 'Producto')}"
          loading="lazy"
        />
      </a>

      <div>
        <a href="./producto.html?id=${encodeURIComponent(product.id)}">
          <h3>${escapeHtml(product.name || 'Producto')}</h3>
        </a>

        <p>${escapeHtml(product.description || 'Producto sin descripción todavía.')}</p>

        <div class="price-row">
          <span class="price">${formatMoney(product.price)}</span>
          <button
            class="primary-btn js-add"
            data-id="${escapeAttribute(product.id)}"
            type="button"
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  `).join('');

  els.productList.querySelectorAll('.js-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = allProducts.find(p => p.id === btn.dataset.id);
      if (!product) return;

      addToCart(product);
      btn.textContent = 'Añadido';

      setTimeout(() => {
        btn.textContent = 'Comprar';
      }, 1100);
    });
  });
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function escapeAttribute(value = '') {
  return String(value).replace(/"/g, '&quot;');
}
