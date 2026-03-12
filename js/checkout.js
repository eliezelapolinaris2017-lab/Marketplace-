import { readCart, clearCart, formatMoney, createOrder } from './store.js';

const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const form = document.getElementById('checkoutForm');

const cart = readCart();
renderCart();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cart.length) {
    alert('El carrito está vacío.');
    return;
  }

  const fd = new FormData(form);
  const payload = {
    customerName: String(fd.get('customerName') || '').trim(),
    customerPhone: String(fd.get('customerPhone') || '').trim(),
    notes: String(fd.get('notes') || '').trim(),
    items: cart,
    subtotal: total(),
    total: total()
  };

  try {
    await createOrder(payload);

    if (cart.length === 1 && cart[0].payLink) {
      clearCart();
      location.href = cart[0].payLink;
      return;
    }

    clearCart();
    alert('Pedido registrado. Para carritos múltiples puedes cerrar el cobro por WhatsApp o generar un enlace manual.');
    location.href = './index.html';
  } catch (error) {
    console.error(error);
    alert('No se pudo registrar el pedido. Verifica reglas de Firestore.');
  }
});

function renderCart() {
  if (!cart.length) {
    cartItemsEl.innerHTML = '<div class="empty-state">No hay productos en el carrito.</div>';
    cartTotalEl.textContent = formatMoney(0);
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <div class="muted small">Cantidad: ${item.qty}</div>
      </div>
      <strong>${formatMoney(item.price * item.qty)}</strong>
    </div>
  `).join('');

  cartTotalEl.textContent = formatMoney(total());
}

function total() {
  return cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
