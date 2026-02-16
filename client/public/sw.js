// Service Worker for PWA
const CACHE_NAME = 'bible-memorize-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // 只緩存存在的資源，忽略 404 錯誤
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.log(`Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  // 不緩存圖標文件（如果不存在）
  if (event.request.url.includes('icon-')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 404 })));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 返回緩存或網絡請求
        return response || fetch(event.request).catch(() => {
          // 如果網絡請求失敗，返回 404
          return new Response('Not Found', { status: 404 });
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
      .then(() => self.clients.claim())
  );
});
