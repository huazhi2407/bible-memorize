// Service Worker for PWA
const CACHE_NAME = 'bible-memorize-v4';
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
  const url = new URL(event.request.url);
  
  // 不攔截資源文件（讓瀏覽器直接從服務器獲取）
  if (url.pathname.startsWith('/assets/')) {
    return; // 不處理，讓瀏覽器直接獲取
  }
  
  // 不緩存圖標文件（如果不存在）
  if (url.pathname.includes('icon-')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 404 })));
    return;
  }
  
  // 首頁與 index.html：網路優先（先取最新，部署後不用強制重新整理）
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || new Response('Not Found', { status: 404 })))
    );
    return;
  }
  // manifest.json：可沿用快取
  if (url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request).catch(() => new Response('Not Found', { status: 404 })))
    );
    return;
  }
  // 其他請求（如 API）不攔截，由瀏覽器直接發送
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
