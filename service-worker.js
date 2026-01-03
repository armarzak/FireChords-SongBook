
const CACHE_NAME = 'songbook-v2.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts'
];

// При установке кешируем основные файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Стратегия Stale-While-Revalidate:
// Сначала отдаем из кеша, но параллельно идем в сеть за обновлением.
self.addEventListener('fetch', (event) => {
  // Игнорируем не-GET запросы (например, плагины браузера или аналитику)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Если запрос успешен, сохраняем/обновляем его в кеше
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Если сети нет, cachedResponse уже вернется из внешнего промиса
        });

        // Возвращаем кешированный ответ немедленно, либо ждем сеть если в кеше пусто
        return cachedResponse || fetchPromise;
      });
    })
  );
});
