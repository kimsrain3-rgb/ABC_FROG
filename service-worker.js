// ⚠️ 서비스워커 '킬스위치' — 더 이상 캐시하지 않음.
// 기존에 등록돼 있던 서비스워커가 이 파일로 업데이트되면, 스스로 ① 모든 캐시 삭제
// ② 자기 등록 해제 ③ 열린 화면 새로고침 → 캐시 층이 사라져 앱이 항상 서버 최신을 직접 로드.
// (옛 버전 박제/먹통 자가 복구. index.html은 더 이상 register() 하지 않으므로 재등록 루프 없음.)
self.addEventListener('install', function(){ self.skipWaiting(); });

self.addEventListener('activate', function(event){
  event.waitUntil(
    self.clients.claim()                                      // 즉시 제어권 확보(열린 화면에 바로 적용)
      .then(function(){ return caches.keys(); })
      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })  // 모든 캐시 삭제
      .catch(function(){})
      .then(function(){ return self.clients.matchAll({ type: 'window' }); })
      .then(function(clientsArr){ (clientsArr || []).forEach(function(c){ try { c.navigate(c.url); } catch (e) {} }); })  // 화면 새로고침 → 최신 로드
      .catch(function(){})
      .then(function(){ return self.registration.unregister(); })  // 자기 등록 해제(정리)
      .catch(function(){})
  );
});

// 혹시 이 SW가 잠깐 제어 중이어도 캐시 절대 안 씀 — 항상 네트워크(최신)
self.addEventListener('fetch', function(event){
  event.respondWith(fetch(event.request).catch(function(){ return new Response('', { status: 504 }); }));
});
