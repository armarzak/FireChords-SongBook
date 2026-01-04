
const CACHE_NAME = 'songbook-v6.0';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Ресурсы, которые мы кешируем "на лету"
const EXTERNAL_URLS = [
  'cdn.tailwindcss.com',
  'esm.sh',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Игнорируем не-GET запросы
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Для навигации всегда возвращаем index.html, если нет сети
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2. Стратегия Cache-First для внешних библиотек и статики
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // Кешируем только успешные ответы
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !EXTERNAL_URLS.some(d => url.hostname.includes(d))) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Если совсем беда, пытаемся найти хоть что-то в кеше
        return caches.match(event.request);
      });
    })
  );
});
