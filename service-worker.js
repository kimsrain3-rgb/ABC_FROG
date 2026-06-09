const CACHE_NAME = 'abc-frog-v51';

// 오프라인 폴백용 최소 셸만 미리 캐시 (콘텐츠는 항상 네트워크 우선)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // 문서(HTML/페이지 이동)는 브라우저 HTTP 캐시를 무시하고 '항상 새로' 받음 → 폰도 최신 반영
  const isDoc = req.mode === 'navigate' || req.destination === 'document';
  const networkReq = isDoc ? new Request(req.url, { cache: 'no-store' }) : req;

  event.respondWith(
    fetch(networkReq).then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(()=>{});
      }
      return response;
    }).catch(() => {
      // 오프라인 → 캐시에서
      return caches.match(req).then((cached) => {
        if (cached) return cached;
        if (isDoc) return caches.match('./index.html');
      });
    })
  );
});
