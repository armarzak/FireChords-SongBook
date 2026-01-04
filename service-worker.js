
const CACHE_NAME = 'songbook-v7.1';

// Основные файлы, необходимые для запуска приложения
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json'
];

// Внешние домены, ресурсы с которых мы кэшируем для работы офлайн
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
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Стратегия для навигации (HTML страница)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/') || caches.match('/index.html');
      })
    );
    return;
  }

  // Стратегия: Сначала кэш, если нет - сеть + кэширование
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // Кэшируем локальные ресурсы (модули .tsx, .ts) и разрешенные внешние библиотеки
        const isLocal = url.origin === self.location.origin;
        const isExternalAllowed = EXTERNAL_URLS.some(d => url.hostname.includes(d));

        if (networkResponse && networkResponse.status === 200 && (isLocal || isExternalAllowed)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        // Офлайн-заглушка для изображений или других ресурсов, если нужно
        return null;
      });
    })
  );
});
