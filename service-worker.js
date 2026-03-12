const CACHE_NAME = 'market-catalog-v1';
const ASSETS = [
  './',
  './index.html',
  './pedido.html',
  './producto.html',
  './admin.html',
  './css/styles.css',
  './css/admin.css',
  './js/firebase-config.js',
  './js/store.js',
  './js/catalog.js',
  './js/product.js',
  './js/checkout.js',
  './js/admin.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
