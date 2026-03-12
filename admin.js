import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { auth } from './firebase-config.js';
import { getProducts, getSettings, saveProduct, saveSettings, formatMoney } from './store.js';

const loginForm = document.getElementById('loginForm');
const settingsForm = document.getElementById('settingsForm');
const productForm = document.getElementById('productForm');
const authPanel = document.getElementById('authPanel');
const adminPanel = document.getElementById('adminPanel');
const productPanel = document.getElementById('productPanel');
const adminProductList = document.getElementById('adminProductList');
const logoutBtn = document.getElementById('logoutBtn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(loginForm);
  try {
    await signInWithEmailAndPassword(auth, fd.get('email'), fd.get('password'));
  } catch (error) {
    console.error(error);
    alert('Login falló. Revisa email, password y Auth en Firebase.');
  }
});

logoutBtn.addEventListener('click', async () => {
  try { await signOut(auth); } catch {}
});

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(settingsForm);
  try {
    await saveSettings({
      storeName: String(fd.get('storeName') || '').trim(),
      whatsapp: String(fd.get('whatsapp') || '').trim(),
      accentColor: String(fd.get('accentColor') || '#7C3AED').trim()
    });
    alert('Ajustes guardados.');
  } catch (error) {
    console.error(error);
    alert('No se pudieron guardar los ajustes.');
  }
});

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(productForm);
  const payload = {
    name: String(fd.get('name') || '').trim(),
    price: Number(fd.get('price') || 0),
    categorySlug: String(fd.get('categorySlug') || '').trim(),
    payLink: String(fd.get('payLink') || '').trim(),
    imageUrl: String(fd.get('imageUrl') || '').trim(),
    description: String(fd.get('description') || '').trim(),
    active: fd.get('active') === 'on'
  };

  try {
    await saveProduct(payload);
    productForm.reset();
    productForm.querySelector('[name="active"]').checked = true;
    await loadProducts();
    alert('Producto guardado.');
  } catch (error) {
    console.error(error);
    alert('No se pudo guardar el producto. Verifica reglas y Firestore.');
  }
});

onAuthStateChanged(auth, async (user) => {
  const logged = Boolean(user);
  authPanel.classList.toggle('hidden', logged);
  adminPanel.classList.toggle('hidden', !logged);
  productPanel.classList.toggle('hidden', !logged);
  logoutBtn.classList.toggle('hidden', !logged);

  if (logged) {
    await hydrateAdmin();
  }
});

async function hydrateAdmin() {
  const settings = await getSettings().catch(() => ({}));
  settingsForm.storeName.value = settings.storeName || '';
  settingsForm.whatsapp.value = settings.whatsapp || '';
  settingsForm.accentColor.value = settings.accentColor || '#7C3AED';
  await loadProducts();
}

async function loadProducts() {
  const products = await getProducts(false).catch(() => []);
  if (!products.length) {
    adminProductList.innerHTML = '<div class="empty-state">Todavía no hay productos.</div>';
    return;
  }
  adminProductList.innerHTML = products.map(item => `
    <article class="admin-item">
      <div class="admin-item-head">
        <strong>${escapeHtml(item.name)}</strong>
        <span class="badge ${item.active ? 'success' : ''}">${item.active ? 'Activo' : 'Inactivo'}</span>
      </div>
      <div class="admin-meta">${escapeHtml(item.categorySlug || 'sin categoría')} · ${formatMoney(item.price)}</div>
      <div class="admin-meta">${item.payLink ? 'Con paylink' : 'Sin paylink'} · ${item.imageUrl ? 'Con imagen' : 'Sin imagen'}</div>
    </article>
  `).join('');
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
