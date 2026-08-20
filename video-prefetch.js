/* ============================================================================
   video-prefetch.js — 보상 영상을 '퍼즐 맞추는 동안' 미리 받아두는 공용 파일 (C-3)
   ----------------------------------------------------------------------------
   목적: 지금은 아이가 퍼즐을 **다 맞춘 뒤에야** 보상 영상을 받기 시작한다.
         느린 회선이면 제일 신나는 순간에 화면이 멈춰 있다.
         퍼즐을 맞추는 10~30초 동안 뒤에서 미리 받아두어, 완성하는 순간 바로 나오게 한다.

   ★ 게임 로직·그림·소리·레이아웃은 일절 건드리지 않는다.
   ★ 이 파일 전체가 try-catch 로 감싸져 있다. 여기가 고장나도 '미리받기를 안 한 상태'
     = 지금까지의 동작으로 떨어질 뿐, 새로 나빠지는 경우가 없다.

   ── C-2(video-quality.js)와의 관계 ─────────────────────────────────────────
     video-quality.js  ← C-2. 회선에 맞는 '어느 화질을 줄지' 고른다      (기존)
     video-prefetch.js ← C-3. 그렇게 고른 주소를 '미리 받아둔다'         (이 파일)

     ★ 반드시 __vq.pick() 을 거친 주소를 미리 받아야 한다.
       원본을 받아놓고 400 을 또 받으면 두 배가 된다.
       그래서 이 파일은 **주소를 스스로 조립하지 않는다** — 부르는 쪽이 재생에 쓸
       바로 그 주소를 그대로 넘겨주고, 이 파일은 warm/ready 가 같은 문자열인지 확인만 한다.

     ★ 반드시 video-quality.js **뒤에** 읽는다. __vq 가 없으면 미리받기를 하지 않는다.

   ── 페이지별 로드 ─────────────────────────────────────────────────────────
     animal.html / dino.html : video-prefetch.js
     phonics/index.html      : ../video-prefetch.js     ← 한 칸 위

   ── 내놓는 것 ─────────────────────────────────────────────────────────────
     __vp.warm(url)              그 주소를 미리 받아둔다 (동시에 언제나 1개만)
     __vp.ready(url, opts, go)   재생 직전에 부른다. 받는 중이면 끝난 뒤 go() 를 부른다
     __vp.watch(video,url,opts)  ★ 0단계 전용 — 재는 것만 한다. 동작을 바꾸지 않는다
     __vp.cancel()               화면을 벗어날 때 받던 것을 중단한다
     PREFETCH_ON                 false 한 글자로 전체 무력화 (C-2 의 FORCE_ORIGINAL 자리)

   ── 🔴 이 파일이 존재하는 진짜 이유 — '받는 중에 재생하면 두 배로 받는다' ──
     실측(2026-08-18): fetch 를 시작하고 30ms 뒤(아직 받는 중) 같은 주소로 재생을 시작하면
        fetch 2,031,843 byte + video 2,031,843 byte = 합계 4,063,686 byte
        (파일은 2,475,000 byte — 같은 파일을 처음부터 다시 받는다)
     브라우저는 진행 중인 같은 요청을 합쳐주지 않는다. 아이가 미리받기가 끝나기 전에
     퍼즐을 완성하면 — **느린 회선일수록 그럴 확률이 높다** — 오히려 두 배를 받는다.
     C-3 가 도우려던 바로 그 사람을 가장 크게 해치는 구조다.
     → ready() 가 "다 받았는지 확인하고 재생"을 강제한다. 이것이 C-3 설계의 중심이다.

   ── 단계 ──────────────────────────────────────────────────────────────────
     0단계(지금) : 이 파일 + watch() 로 기준선만 수집. PREFETCH_ON=false, warm() 은 아무도 안 부른다.
     1단계~      : 공룡 → 동물 → 파닉스 순으로 warm()/ready() 를 켠다. 각 단계 test/ → 폰 확인 → 라이브.

   2026-08-20 최초 작성 (C-3 0단계). 자세한 설계는 docs/C-3-plan.md
   ============================================================================ */
(function () {
  'use strict';

  /* ── 비상 스위치 ──────────────────────────────────────────────────────────
     false = 미리받기를 전혀 하지 않는다(= 지금까지의 동작). 재는 것만 계속한다.
     ★ 0단계에서는 false 로 둔다 — 미리받기 '전'의 기준선을 며칠 쌓기 위해서다.
       기준선 없이 1단계를 켜면 "얼마나 좋아졌는가"를 영영 알 수 없다.
       (메모리 규칙: 고치기 전/후를 같이 재기)
     ★ 1단계 이후 문제가 생기면 이 한 글자만 false 로 되돌리면 모든 화면에서 즉시 멈춘다.
       그때도 C-2(__vq)는 그대로 돌아 영상은 여전히 회선에 맞게 가볍다.                */
  var PREFETCH_ON = false;

  // ── 지금 미리받고 있는 것 (언제나 최대 1개) ────────────────────────────────
  //  {url, ctrl, t0, state:'busy'|'ok'|'fail', waiters:[]}
  var cur = null;

  // ── 데이터 절약 모드 판정 (확정 ① — 절약하겠다는 사람의 데이터로 투기하지 않는다) ──
  //  미리받기는 본질적으로 '안 볼 수도 있는 것을 미리 받는' 투기다.
  //  이 사람은 C-2 로 이미 400 티어를 받으므로 '덜 나쁜 상태'가 이미 확보돼 있다.
  function isSaveData() {
    try {
      var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return !!(c && c.saveData === true);
    } catch (e) { return false; }
  }

  /* ── GA4 기록 ──────────────────────────────────────────────────────────────
     ★ 기록은 부가 기능이다. gtag 가 없거나 차단돼도 게임은 그대로 돌아가야 한다.
       전부 try-catch 로 감싸고 실패하면 조용히 포기한다.
     공룡·동물·파닉스는 iframe 이라 자체 GA 태그가 없다 → 부모 창의 gtag 를 쓴다.
     (video-quality.js / error-tracker.js 와 같은 방식)                          */
  function findGtag() {
    try { if (typeof window.gtag === 'function') return window.gtag; } catch (e) {}
    try {
      if (window.parent && window.parent !== window && typeof window.parent.gtag === 'function') {
        return window.parent.gtag;
      }
    } catch (e) {}
    return null;
  }
  function send(name, params) {
    try {
      var g = findGtag();
      if (!g) return false;
      g('event', name, params);
      return true;
    } catch (e) { return false; }
  }
  function tierNow() {
    try { return (window.__vq && window.__vq.tier) ? window.__vq.tier : 'none'; } catch (e) { return 'none'; }
  }

  /* ── cancel() ──────────────────────────────────────────────────────────────
     화면을 벗어나거나 다음 퍼즐로 넘어갈 때 부른다.
     받던 것을 중단해 다음 화면의 그림과 회선을 다투지 않게 한다.
     ★ 기다리던 ready() 가 있으면 먼저 풀어준다 — 안 그러면 재생이 영영 시작되지 않는다. */
  function cancel() {
    try {
      var c = cur;
      cur = null;
      if (!c) return;
      if (c.state === 'busy') {
        c.state = 'fail';
        try { if (c.ctrl && c.ctrl.abort) c.ctrl.abort(); } catch (e) {}
        flush(c);
      }
    } catch (e) {}
  }

  function flush(c) {
    try {
      var w = c.waiters || [];
      c.waiters = [];
      for (var i = 0; i < w.length; i++) { try { w[i](); } catch (e) {} }
    } catch (e) {}
  }

  /* ── warm(url) ─────────────────────────────────────────────────────────────
     그 주소를 미리 받아둔다. 받은 내용은 버린다 — 목적은 '브라우저 캐시에 올려두는 것'이다.
     ★ 동시에 언제나 1개만. 새로 부르면 앞엣것은 중단한다(계획서 2.3 — 1개가 정확히 맞는 수).
     ★ url 은 부르는 쪽이 '재생에 쓸 바로 그 주소'를 그대로 넘긴다. 여기서 조립하지 않는다.
     하지 않는 경우: 스위치 off / 데이터 절약 모드 / __vq 없음 / fetch 미지원 / 빈 주소     */
  function warm(url) {
    try {
      if (!PREFETCH_ON) return;
      if (!url || typeof url !== 'string') return;
      if (isSaveData()) return;
      if (!window.__vq) return;                 // C-2 가 없으면 티어 판정이 없다 = 미리받기 안 함
      if (typeof fetch !== 'function') return;  // 아주 오래된 WebView

      if (cur && cur.url === url && cur.state !== 'fail') return;   // 이미 같은 것을 받는 중/받아둠
      cancel();                                                     // 다른 것을 받는 중이면 중단

      var ctrl = null;
      try { if (typeof AbortController === 'function') ctrl = new AbortController(); } catch (e) {}
      var c = { url: url, ctrl: ctrl, t0: Date.now(), state: 'busy', waiters: [] };
      cur = c;

      var opt = { credentials: 'same-origin' };
      try { if (ctrl) opt.signal = ctrl.signal; } catch (e) {}

      fetch(url, opt).then(function (res) {
        // 본문을 끝까지 읽어야 '다 받은' 것이다. 읽은 내용은 그대로 버린다(RAM 에 안 들고 있는다).
        if (!res || !res.ok) throw new Error('bad');
        return res.arrayBuffer();
      }).then(function () {
        if (cur !== c) return;                  // 그 사이 취소됐거나 다른 것으로 바뀜
        c.state = 'ok';
        flush(c);
      })['catch'](function () {
        if (cur !== c) return;
        c.state = 'fail';
        flush(c);
      });
    } catch (e) {
      try { cur = null; } catch (e2) {}
    }
  }

  /* ── watch(video, url, opts) ───────────────────────────────────────────────
     ★ 재는 것만 한다. 동작을 바꾸지 않는다.
     video.src 를 넣은 직후에 부르면, '재생 준비가 될 때까지' 걸린 시간(ready_ms)을 재서
     GA4 로 보낸다. 아이가 실제로 기다린 시간이다.

     [왜 바이트가 아니라 시간인가]
       브라우저는 <video> 가 몇 바이트를 받았는지 안 알려준다.
       PerformanceResourceTiming 이 <video> 를 기록할 때도 있고 안 할 때도 있다(실측).
       그래서 바이트는 검증 수단으로 쓸 수 없다. 어차피 우리가 신경 쓰는 것도
       바이트가 아니라 '기다림'이다. (계획서 4.0)

     [기준선 — PC 크롬, 같은 파일·같은 회선 실측]
       미리받기 성공 후 재생 : 44 / 47 / 55ms
       미리받기 없이 재생    : 255 / 265 / 299ms      ← 0단계가 쌓는 값이 이쪽이다
       5배 이상 갈린다. 느린 회선일수록 차이는 훨씬 커진다.

     opts = { puzzle:'dino'|'animal'|'phonics', result, wait_ms, lead_ms }
       0단계에서는 result 를 안 넘긴다 → 스위치 상태를 보고 'off' 로 채운다.        */
  function watch(video, url, opts) {
    try {
      if (!video || !video.addEventListener) return;
      opts = opts || {};

      var t0 = Date.now();
      var fired = false;
      var safety = 0;

      function detach() {
        try { video.removeEventListener('canplaythrough', hit); } catch (e) {}
        try { video.removeEventListener('playing', hit); } catch (e) {}
        try { video.removeEventListener('error', bail); } catch (e) {}
        try { if (safety) clearTimeout(safety); } catch (e) {}
      }
      function hit() {
        if (fired) return;
        fired = true;
        detach();
        try {
          send('video_prefetch', {
            result: opts.result || (PREFETCH_ON ? 'miss' : 'off'),
            ready_ms: Date.now() - t0,               // ★ 아이가 실제로 기다린 시간
            wait_ms: opts.wait_ms | 0,               // ready() 가 미리받기를 기다린 시간
            lead_ms: opts.lead_ms | 0,               // 미리받기 시작 → 재생 요청 (창의 크기)
            puzzle: opts.puzzle || 'unknown',
            tier: tierNow()
          });
        } catch (e) {}
      }
      function bail() {
        // 영상이 실패하면 재는 것을 조용히 그만둔다.
        // 실패 자체는 C-2 의 video_fallback 이 이미 따로 보고하고 있고,
        // 여기서 엉뚱하게 큰 ready_ms 를 보내면 중앙값이 망가진다.
        if (fired) return;
        fired = true;
        detach();
      }

      video.addEventListener('canplaythrough', hit);
      video.addEventListener('playing', hit);        // canplaythrough 가 안 오는 기기 대비
      video.addEventListener('error', bail);
      // 아무 일도 안 일어나면 듣기만 남는다 → 2분 뒤 조용히 정리(값은 안 보낸다)
      safety = setTimeout(bail, 120000);
    } catch (e) {}
  }

  /* ── ready(url, opts, go) ──────────────────────────────────────────────────
     🔴 C-3 의 핵심. 재생 직전에 부른다.

       받아둔 게 있다      → 그대로 진행 (캐시에서 즉시)            result=hit
       아직 받는 중이다    → ★ 그 요청이 끝날 때까지 기다린 뒤 진행  result=wait
       미리받기를 안 했다  → 그대로 진행 (지금 동작과 동일)          result=miss
       미리받기가 실패했다 → 그대로 진행 (C-2 원본 폴백이 받아준다)  result=fail
       주소가 다르다       → 🔴 그대로 진행하되 GA4 에 신고          result=mismatch

     "기다리는 게 손해 아닌가" — 아니다. 미리받기는 더 일찍 시작했으므로 기다려도
     남은 양이 항상 더 적다. 반대로 안 기다리면 처음부터 다시 받는다(위 실측 4.06MB).

     ★ go 는 '기다릴 게 없으면 동기적으로' 부른다 — 재생 시작 타이밍을 바꾸지 않기 위해서다.
     ★ go 안에서 video.src 를 넣고, 그 직후 watch() 가 걸리도록 opts.video 를 넘기면
       ready_ms 측정까지 한 번에 끝난다.                                            */
  function ready(url, opts, go) {
    opts = opts || {};
    var t0 = Date.now();

    function run(result, waitMs, leadMs) {
      try {
        if (opts.video) {
          watch(opts.video, url, {
            puzzle: opts.puzzle, result: result,
            wait_ms: waitMs | 0, lead_ms: leadMs | 0
          });
        }
      } catch (e) {}
      try { if (go) go(); } catch (e) { throw e; }   // 재생은 무슨 일이 있어도 진행한다
    }

    try {
      if (!PREFETCH_ON) { run('off', 0, 0); return; }
      if (isSaveData())  { run('savedata', 0, 0); return; }

      var c = cur;
      if (!c) { run('miss', 0, 0); return; }

      if (c.url !== url) {
        // 🔴 미리 받아둔 주소와 재생 주소가 다르다 = 원본과 티어를 둘 다 받고 있을 수 있다.
        //   주소를 만드는 함수를 한 개만 두면 일어날 수 없는 일이다(계획서 4.2-①).
        //   그래도 조용히 두 배 받지 말고 신고하게 한다 — 라이브에서 즉시 드러난다.
        run('mismatch', 0, 0);
        return;
      }

      var lead = Date.now() - c.t0;
      if (c.state === 'ok')   { run('hit', 0, lead); return; }
      if (c.state === 'fail') { run('fail', 0, lead); return; }

      // 아직 받는 중 → 끝날 때까지 기다린다. 이것이 '두 배 받기'를 막는 자리다.
      c.waiters.push(function () {
        run('wait', Date.now() - t0, lead);
      });
    } catch (e) {
      // 무슨 일이 있어도 재생은 진행한다
      try { if (go) go(); } catch (e2) {}
    }
  }

  try {
    window.__vp = {
      warm: warm,
      ready: ready,
      watch: watch,          // ★ 0단계 전용 — 재기만 한다
      cancel: cancel,
      on: PREFETCH_ON        // 지금 켜져 있는지 (읽기 전용 표시)
    };
  } catch (e) {}
})();
