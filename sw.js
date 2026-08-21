// Service Worker simples: guarda em cache os arquivos do site (não os dados
// do orçamento, que sempre vêm ao vivo do Apps Script) para abrir mais rápido
// e funcionar como app instalável.

const CACHE_NAME = 'rancho-novo-v1';
const ARQUIVOS_CACHE = [
  './',
  './index.html',
  './config.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(nomes) {
      return Promise.all(
        nomes.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Nunca guarda em cache as chamadas à API (script.google.com) —
  // preços, feriados e datas ocupadas sempre precisam vir atualizados.
  if (url.indexOf('script.google.com') > -1) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(respostaCache) {
      return respostaCache || fetch(event.request);
    })
  );
});
