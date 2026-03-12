import {
  collection, addDoc, doc, getDoc, getDocs, orderBy, query, setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db } from './firebase-config.js';

const DEFAULT_SETTINGS = {
  storeName: 'Mi Catálogo',
  whatsapp: '',
  accentColor: '#7C3AED'
};

const CART_KEY = 'market_catalog_cart_v1';

export async function getSettings() {
  const ref = doc(db, 'settings', 'main');
  const snap = await getDoc(ref);
  if (!snap.exists()) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...snap.data() };
}

export async function saveSettings(payload) {
  return setDoc(doc(db, 'settings', 'main'), {
    ...payload,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getCategories() {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProducts(activeOnly = true) {
  const ref = collection(db, 'products');
  const snap = await getDocs(query(ref, orderBy('createdAt', 'desc')));
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return activeOnly ? items.filter(item => item.active === true) : items;
}

export async function getProductById(id) {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveProduct(payload) {
  return addDoc(collection(db, 'products'), {
    ...payload,
    price: Number(payload.price || 0),
    active: Boolean(payload.active),
    createdAt: serverTimestamp()
  });
}

export async function createOrder(payload) {
  return addDoc(collection(db, 'orders'), {
    ...payload,
    status: 'pendiente',
    source: 'web',
    createdAt: serverTimestamp()
  });
}

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product) {
  const cart = readCart();
  const idx = cart.findIndex(item => item.productId === product.id);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price || 0),
      qty: 1,
      payLink: product.payLink || ''
    });
  }
  writeCart(cart);
}

export function clearCart() {
  writeCart([]);
}

export function formatMoney(value) {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value || 0));
}

export function getPlaceholder(name = 'Producto') {
  return `https://placehold.co/800x800/F4F1FF/6D28D9?text=${encodeURIComponent(name)}`;
}
