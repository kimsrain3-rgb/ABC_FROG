/* ============================================================================
   video-quality.js — 회선 속도에 따라 '보상 영상' 화질을 자동으로 고르는 공용 파일
   ----------------------------------------------------------------------------
   목적: 퍼즐을 다 맞춘 뒤 나오는 보상 영상(2MB급 mp4)을 느린 회선에서 가볍게 준다.
         4g = 원본 / 3g = 650KB판 / 2g·slow-2g = 400KB판

   ★ 게임 로직·그림·소리·레이아웃은 일절 건드리지 않는다. 주소만 바꿔 준다.
   ★ 이 파일 전체가 try-catch로 감싸져 있어, 여기가 고장나도 항상 '원본 주소'가
     그대로 반환된다 = 지금까지의 동작. 새로 나빠지는 경우가 없다.

   [왜 공용 파일인가]
     보상 영상을 트는 곳이 서로 다른 문서에 흩어져 있다(공룡·동물·파닉스는 iframe).
     iframe은 JS가 완전히 분리돼 변수 공유가 안 되므로, 같은 코드를 4번 붙여넣는
     대신 error-tracker.js 처럼 공용 파일 하나를 각 문서가 읽는다.

   [페이지별 로드]
     index.html / animal.html / dino.html : video-quality.js
     phonics/index.html                   : ../video-quality.js   ← 한 칸 위

   [쓰는 법]
     vid.src = bust(__vq.pick(A.video));       // 공룡·동물 (bust = 캐시 날짜표)
     v.src   = __vq.pick(주소) + VID_VER;      // 파닉스

   [비상 스위치]
     아래 FORCE_ORIGINAL 을 true 로 바꾸면 이 파일을 읽는 모든 페이지가 즉시
     원본만 쓴다. 4개 파일을 되돌리지 않고 한 글자로 전체 무력화하는 장치다.

   2026-08-17 최초 작성 (C-2 0단계). 자세한 설계는 docs/C-2-plan.md
   ============================================================================ */
(function () {
  'use strict';

  // ── 비상 스위치 ────────────────────────────────────────────────────────────
  // true = 회선 판정을 무시하고 무조건 원본. 문제가 생기면 이것만 켜면 된다.
  var FORCE_ORIGINAL = false;

  // ── 티어별 폴더 이름 ──────────────────────────────────────────────────────
  // 원본은 videos/ 그대로 두고, 티어만 별도 폴더로 추가한다(파일명은 원본과 동일).
  var TIER_DIR = { '650': 'videos_650', '400': 'videos_400' };

  /* ── 허용목록 ───────────────────────────────────────────────────────────────
     ⚠️ 이게 이 파일에서 가장 중요한 부분이다.
     개구리 액션 클립(webm)이 보상 영상과 같은 assets/frog/videos/ 에 살고 있다.
     그래서 주소에 '/videos/' 가 있다고 무조건 바꾸면 게임 중에 쓰는 짧은 클립까지
     엉뚱한 폴더로 보내 버린다. 아래 목록에 정확히 걸리는 주소만 바꾸고,
     그 밖의 주소는 손대지 않고 그대로 반환한다.
     (2026-08-17 퍼즐 조각 bust(IMG) 누락 사고의 교훈 — 같은 파일을 쓰는 모든
      경로를 봐야 한다. 여기선 반대로, 안 건드릴 것을 확실히 안 건드리게 한다.)  */
  var ALLOW = [
    'assets/dino/videos/',
    'assets/animal/videos/',
    'assets/phonics/videos/'
  ];
  // 과일은 폴더가 아니라 이 파일 하나만 대상(같은 폴더의 webm 은 제외).
  // ※ 2026-08-18 현재 과일은 적용 대상에서 제외됐다(docs/C-2-plan.md 결정 ①).
  //   목록에 남겨두면 나중에 켤 때 이 파일만 정확히 걸린다.
  var ALLOW_FILE = ['assets/frog/videos/frog-baskit.mp4'];

  // ── 회선 판정 (페이지 열릴 때 1회만) ──────────────────────────────────────
  // 재생 중에 회선이 흔들려도 영상이 바뀌지 않게 결과를 고정한다.
  function detect() {
    // 1) 주소 강제 스위치 — 검증·폰 확인용. ?vq=400 / ?vq=650 / ?vq=4g
    //    iframe 은 자기 주소에 안 붙으므로 부모(최상위) 주소까지 본다.
    try {
      var qs = '' + location.search;
      try { if (window.top && window.top !== window) qs += '' + window.top.location.search; } catch (e) {}
      var m = /[?&]vq=(4g|650|400)\b/.exec(qs);
      if (m) return (m[1] === '4g') ? '4g' : m[1];
    } catch (e) {}

    var c = null;
    try { c = navigator.connection || navigator.mozConnection || navigator.webkitConnection; } catch (e) {}
    if (!c) return '4g';                       // 미지원(iOS 사파리·파이어폭스) = 원본

    // 2) 데이터 절약 모드를 켠 사람은 회선과 무관하게 가장 가볍게
    try { if (c.saveData === true) return '400'; } catch (e) {}

    // 3) 회선 등급
    try {
      switch (c.effectiveType) {
        case '2g':
        case 'slow-2g': return '400';
        case '3g':      return '650';
        case '4g':      return '4g';
      }
    } catch (e) {}

    return '4g';                               // 값이 없거나 모르는 값 = 원본
  }

  var tier = '4g';
  try { tier = FORCE_ORIGINAL ? '4g' : detect(); } catch (e) { tier = '4g'; }

  /* ── pick(url) ─────────────────────────────────────────────────────────────
     허용목록에 걸리는 보상 영상 주소만 티어 폴더로 바꿔 돌려준다.
     - 원본 티어('4g')면 아무것도 안 바꾼다
     - 목록에 없는 주소(개구리 webm, 그림, 소리 등)는 그대로 반환
     - 빈 값·예외는 받은 것을 그대로 반환 (절대 undefined 를 내지 않는다)      */
  function pick(url) {
    try {
      if (!url || typeof url !== 'string') return url;
      if (tier === '4g') return url;
      var dir = TIER_DIR[tier];
      if (!dir) return url;

      var i, base;
      for (i = 0; i < ALLOW.length; i++) {
        if (url.indexOf(ALLOW[i]) !== -1) {
          // 예: assets/dino/videos/x.mp4 → assets/dino/videos_650/x.mp4
          return url.replace(ALLOW[i], ALLOW[i].replace(/videos\/$/, dir + '/'));
        }
      }
      for (i = 0; i < ALLOW_FILE.length; i++) {
        if (url.indexOf(ALLOW_FILE[i]) !== -1) {
          base = ALLOW_FILE[i].replace(/\/videos\/[^/]+$/, '/' + dir + '/');
          return url.replace(ALLOW_FILE[i], base + ALLOW_FILE[i].split('/').pop());
        }
      }
      return url;                              // 목록 밖 = 손대지 않음
    } catch (e) {
      return url;
    }
  }

  /* ── original(url) ─────────────────────────────────────────────────────────
     티어 주소를 원본 주소로 되돌린다. 티어 파일이 없을 때 폴백에 쓴다.
     (dino.html 의 영상 error 핸들러가 이걸로 한 번 재시도한다)               */
  function original(url) {
    try {
      if (!url || typeof url !== 'string') return url;
      return url.replace(/\/videos_(?:650|400)\//g, '/videos/');
    } catch (e) {
      return url;
    }
  }

  try {
    window.__vq = {
      tier: tier,                    // '4g' | '650' | '400'
      pick: pick,
      original: original,
      forced: FORCE_ORIGINAL
    };
  } catch (e) {}
})();
