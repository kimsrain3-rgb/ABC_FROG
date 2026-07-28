/* ============================================================================
   error-tracker.js — 전역 에러 추적 (GA4 이벤트: game_error)
   ----------------------------------------------------------------------------
   목적: 일부 안드로이드 기기(구형 웹뷰 / Realme 계열 등)에서 게임이 시작조차
         안 되거나 시작 직후 멈추는 문제의 원인을 "데이터로" 파악.

   ★ 게임 로직/그림/소리/레이아웃은 일절 건드리지 않음. 감지 → GA4 전송만 함.
   ★ 이 파일 전체가 try-catch로 감싸져 있어, 추적기가 고장나도 게임은 그대로 돌아감.

   [왜 window.onerror 를 안 쓰고 addEventListener 를 쓰나]
     script.js 3~4줄이 이미 window.onerror 에 자기 핸들러를 "대입"하고 return true
     로 에러를 삼킨다. 여기서 window.onerror 에 또 대입하면 나중에 로드되는
     script.js 가 그대로 덮어써서 무용지물이 된다.
     addEventListener('error', …, true) 로 붙이면 onerror 대입과 별개로 동작하고,
     head 에서 먼저 등록되므로 script.js 보다 먼저 호출된다. → script.js 무수정.

   [잡는 것]
     1) script  : 전역 JS 에러(ErrorEvent) + Promise 미처리 거부 + <script> 로드 실패
     2) video   : <video>/<audio> 재생·로드 실패(webm 코덱 미지원 등) + webm 지원 사전 점검
     3) timeout : 초기 로딩이 10초 안에 안 끝남(= 시작 화면까지 못 감)

   [보내는 값] error_type / error_message / error_where / device_model /
               android_version / webview_version / elapsed_ms

   [폭주 방지] 세션당 총 8건, 유형당 3건, 같은 메시지는 1번만 (GA4 도배 방지)

   [페이지별 사용법]
     - index.html            : 그냥 로드 (error_where 를 화면 상태로 자동 판별)
     - animal.html/dino.html : 로드 전에 window.__ETRK_WHERE='puzzle'
     - test/phonics/…        : 로드 전에 window.__ETRK_WHERE='phonics'
   ========================================================================== */
(function () {
  'use strict';
  try {
    if (window.__ETRK) return;            // 중복 로드 방지
    window.__ETRK = true;

    var GA_ID = 'G-VEN3PCFXXL';           // index.html 과 동일한 측정 ID
    var T0 = Date.now();                  // 앱 시작 시각 (elapsed_ms 기준점)
    var INIT_TIMEOUT = 10000;             // 초기 로딩 감시 10초
    var MAX_TOTAL = 8, MAX_PER_TYPE = 3, MSG_MAX = 100;  // GA4 파라미터 값 상한이 100자

    var FIXED = null;                     // 페이지가 지정한 고정 error_where
    try { FIXED = window.__ETRK_WHERE || null; } catch (e) {}
    var MAIN = !FIXED;                    // 고정값이 없으면 = 루트 index.html(본 게임)

    var sent = 0, perType = {}, seen = {}, pending = [], gaLoading = false;

    /* ── 기기 정보 (UserAgent 파싱) ──────────────────────────────────────── */
    function ua() { try { return navigator.userAgent || ''; } catch (e) { return ''; } }

    // "Linux; Android 13; RMX3085 Build/TP1A…; wv)" → "RMX3085"
    function deviceModel() {
      try {
        var m = /Android\s+[\d._]+;\s*([^;)]+)/.exec(ua());
        if (!m) return 'unknown';
        return m[1].replace(/\s+Build\/.*$/, '').trim() || 'unknown';
      } catch (e) { return 'unknown'; }
    }
    function androidVersion() {
      try { var m = /Android\s+([\d._]+)/.exec(ua()); return m ? m[1] : 'unknown'; }
      catch (e) { return 'unknown'; }
    }
    // Chrome/112.0.5615.136 → "112.0.5615.136"  (앱 웹뷰면 "…+wv" 표시)
    function webviewVersion() {
      try {
        var m = /Chrome\/([\d.]+)/.exec(ua());
        var v = m ? m[1] : 'unknown';
        if (/;\s*wv\)/.test(ua())) v += '+wv';
        return v;
      } catch (e) { return 'unknown'; }
    }

    /* ── 지금 어느 화면인지 (읽기만 함 — 게임 상태를 바꾸지 않음) ────────── */
    function whereNow() {
      try {
        if (FIXED) return FIXED;
        if (document.querySelector('iframe[src*="animal.html"],iframe[src*="dino.html"]')) return 'puzzle';
        var wp = document.getElementById('wp');
        if (wp && wp.classList && wp.classList.contains('show')) return 'puzzle';
        // gp 는 script.js 의 게임 진행 상태('start'→'tutorial'/'playing')
        try { if (typeof gp !== 'undefined' && gp !== 'start') return 'alphabet'; } catch (e) {}
        return 'init';
      } catch (e) { return 'init'; }
    }

    /* ── GA4 전송 ────────────────────────────────────────────────────────── */
    function findGtag() {
      try { if (typeof window.gtag === 'function') return window.gtag; } catch (e) {}
      // 퍼즐(iframe)처럼 자체 GA 태그가 없는 페이지는 부모 창의 gtag 사용 (동일 출처)
      try {
        if (window.parent && window.parent !== window && typeof window.parent.gtag === 'function') {
          return window.parent.gtag;
        }
      } catch (e) {}
      return null;
    }
    function flush() {
      try {
        var g = findGtag(); if (!g) return;
        while (pending.length) { g('event', 'game_error', pending.shift()); }
      } catch (e) {}
    }
    // GA 태그가 아예 없는 페이지(파닉스 등)에서만, 에러가 실제로 났을 때 1회 주입.
    // send_page_view:false → 기존 GA4 지표(방문수 등)를 건드리지 않음.
    function loadGtag(p) {
      try {
        pending.push(p);
        if (gaLoading) return;
        gaLoading = true;
        window.dataLayer = window.dataLayer || [];
        if (typeof window.gtag !== 'function') {
          window.gtag = function () { window.dataLayer.push(arguments); };
        }
        window.gtag('js', new Date());
        window.gtag('config', GA_ID, {
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          send_page_view: false
        });
        var s = document.createElement('script');
        s.async = true;
        s.setAttribute('data-etrk', '1');   // 이 태그의 로드 실패는 추적 대상에서 제외
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        (document.head || document.documentElement).appendChild(s);
        flush();                           // 스텁이 dataLayer 에 쌓아두므로 지금 비워도 됨
      } catch (e) {}
    }
    function emit(p) {
      try {
        var g = findGtag();
        if (g) { g('event', 'game_error', p); return; }
        loadGtag(p);
      } catch (e) {}
    }

    function shortUrl(u) {
      try {
        u = String(u || '');
        u = u.split('?')[0];                       // 캐시버스터(?b=…) 제거
        var i = u.lastIndexOf('/');
        return i >= 0 ? u.slice(i + 1) : u;        // 파일명만
      } catch (e) { return ''; }
    }

    function send(type, msg, whereOverride) {
      try {
        if (sent >= MAX_TOTAL) return;
        perType[type] = (perType[type] || 0) + 1;
        if (perType[type] > MAX_PER_TYPE) return;
        var m = String(msg == null ? '' : msg).slice(0, MSG_MAX);
        var key = type + '|' + m;
        if (seen[key]) return;                     // 같은 에러 반복(루프) 도배 방지
        seen[key] = 1;
        sent++;
        emit({
          error_type: type,
          error_message: m,
          error_where: whereOverride || whereNow(),
          device_model: deviceModel(),
          android_version: androidVersion(),
          webview_version: webviewVersion(),
          elapsed_ms: Date.now() - T0
        });
      } catch (e) {}
    }

    /* ── 1) 전역 JS 에러 + 리소스(video/script) 로드 실패 ────────────────── */
    // capture=true 라야 <video>/<script> 처럼 버블링 안 하는 리소스 에러도 잡힌다.
    window.addEventListener('error', function (ev) {
      try {
        var t = ev && ev.target;
        if (t && t !== window && t.tagName) {       // ← 리소스 로드 실패
          if (t.getAttribute && t.getAttribute('data-etrk')) return;
          var tag = String(t.tagName).toUpperCase();
          var src = shortUrl(t.currentSrc || t.src || '');
          if (tag === 'VIDEO' || tag === 'AUDIO') {
            var code = '';
            try { if (t.error) code = ' code=' + t.error.code; } catch (e2) {}
            send('video', tag.toLowerCase() + '_fail' + code + ': ' + src);
          } else if (tag === 'SCRIPT') {
            send('script', 'script_load_fail: ' + src);
          }
          return;                                   // 그림(img) 등은 무시 (노이즈 방지)
        }
        var msg = (ev && ev.message) || 'unknown';
        var at = '';
        try { if (ev && ev.filename) at = ' @' + shortUrl(ev.filename) + ':' + (ev.lineno || 0); } catch (e3) {}
        send('script', msg + at);
      } catch (e) {}
    }, true);

    /* ── 1-b) 처리 안 된 Promise 거부 ────────────────────────────────────── */
    // script.js 도 이 이벤트를 듣고 preventDefault() 하지만, 우리가 먼저 등록되어
    // 먼저 호출되고, preventDefault 는 다른 리스너를 막지 않는다.
    window.addEventListener('unhandledrejection', function (ev) {
      try {
        var r = ev && ev.reason, m = 'unknown';
        try { m = (r && (r.message || r.name)) || String(r); } catch (e2) {}
        send('script', 'promise: ' + m);
      } catch (e) {}
    });

    /* ── 2) webm 지원 사전 점검 (개구리 반응 클립이 구형 웹뷰에서 되는지) ── */
    // 재생 실패는 위 error 리스너로도 잡히지만, 코덱 미지원은 "조용히" 실패할 수
    // 있어 한 번 직접 물어본다. 지원되면 아무것도 보내지 않음.
    function probeWebm() {
      try {
        var v = document.createElement('video');
        if (!v || !v.canPlayType) { send('video', 'webm_probe: no canPlayType', 'init'); return; }
        var vp9 = v.canPlayType('video/webm; codecs="vp9"');
        var vp8 = v.canPlayType('video/webm; codecs="vp8"');
        if (!vp9 && !vp8) send('video', 'webm_unsupported (vp9/vp8 both empty)', 'init');
      } catch (e) {}
    }

    /* ── 3) 초기 로딩 감시(10초) ─────────────────────────────────────────── */
    function cssOK() {
      try {
        var ss = document.styleSheets;
        for (var i = 0; i < ss.length; i++) {
          if (String(ss[i].href || '').indexOf('style.css') >= 0) return true;
        }
        return false;
      } catch (e) { return false; }
    }
    function ready() {
      try {
        if (document.readyState === 'loading') return false;
        if (!MAIN) return true;                                    // 하위 페이지는 로드 완료면 OK
        if (typeof window.goModeSelect !== 'function') return false; // script.js 실행 완료 신호
        return !!document.getElementById('ss');                     // 시작 화면 존재
      } catch (e) { return true; }        // 판단 불가 → 오탐 방지로 '정상' 취급
    }
    function watchdog() {
      try {
        if (ready()) return;
        // 앱을 백그라운드로 내렸다 온 경우는 정상적으로 느릴 수 있어 제외
        try { if (document.hidden) return; } catch (e2) {}
        var why = 'rs=' + document.readyState +
                  ' script=' + (typeof window.goModeSelect === 'function' ? 1 : 0) +
                  ' ss=' + (document.getElementById('ss') ? 1 : 0) +
                  ' css=' + (cssOK() ? 1 : 0);
        send('timeout', 'init_timeout ' + why, 'init');
      } catch (e) {}
    }

    try { setTimeout(watchdog, INIT_TIMEOUT); } catch (e) {}
    try { setTimeout(probeWebm, 3000); } catch (e) {}   // 시작 직후 부하 피해 3초 뒤 1회

    /* 수동 확인용(콘솔에서 __etrkTest() 호출 시 테스트 이벤트 전송) */
    try { window.__etrkTest = function (t, m) { send(t || 'script', m || 'manual_test'); }; } catch (e) {}

  } catch (e) { /* 추적기 자체 오류는 무시 — 게임에 영향 주지 않음 */ }
})();
