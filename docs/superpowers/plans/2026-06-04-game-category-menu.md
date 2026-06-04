# 게임 카테고리 메뉴 (ABC / Word) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 시작화면 버튼 4개(ABC/abc/ABc/🍎)를 학습 내용 기준 게임 카드 2개(ABC / Word)로 바꾸고, ABC 카드는 모드 선택 화면을 거쳐 게임을 시작하도록 한다.

**Architecture:** 게임 로직은 그대로 두고 "메뉴 입구"만 교체한다. 메인(`#ss`)의 버튼을 게임 카드 2개로 바꾸고, 단어 퍼즐 화면(`#wp`)과 동일한 오버레이 방식의 ABC 모드 선택 화면(`#ms`)을 추가한다. 기존 `go()` / `goWordPuzzle()` 함수를 그대로 재사용한다.

**Tech Stack:** 순수 HTML + CSS + Vanilla JS (테스트 프레임워크 없음 → 검증은 브라우저 수동 확인)

**참고 스펙:** `docs/superpowers/specs/2026-06-04-game-category-menu-design.md`

---

## File Structure

| 파일 | 책임 | 변경 |
|---|---|---|
| `index.html` | 화면 구조 | 메인 버튼 → 카드 2개 교체, `#ms` 모드선택 화면 추가, CSS 캐시버전 v28→v29 |
| `style.css` | 디자인 | `.game-card`, `.ms` 화면/타이틀/뒤로 스타일 추가 (기존 `.mbtn` 재사용) |
| `script.js` | 동작 | `goModeSelect()`/`msBack()`/`goMode()` 함수 추가, popstate에 `#ms` 분기 추가 |
| `service-worker.js` | 캐시 | `CACHE_NAME` v7→v8 (업데이트 반영) |

**레이아웃 메모(중요):** 게임 카드 2개는 기존 `.mode-buttons`(가로 flex)를 그대로 써서 **나란히(가로)** 배치한다. 승인된 스케치는 세로 쌓기였지만, 시작화면 개구리 이미지(312px)가 커서 세로로 쌓으면 작은 폰에서 넘칠 수 있어 가로가 더 안전하다. 가로↔세로는 CSS 1줄 차이라 실물 확인 후 쉽게 전환 가능. (실행 시 사용자에게 이 점을 알린다.)

---

## Task 1: 메인 화면 버튼 → 게임 카드 2개로 교체 (index.html)

**Files:**
- Modify: `index.html:34-47` (`.mode-buttons` 블록)

- [ ] **Step 1: `.mode-buttons` 블록 교체**

기존 (34-47행):
```html
    <div class="mode-buttons">
      <button class="mbtn mbtn-abc" onclick="go('ABC')">
        <span class="mbtn-label">ABC</span>
      </button>
      <button class="mbtn mbtn-lower" onclick="go('abc')">
        <span class="mbtn-label">abc</span>
      </button>
      <button class="mbtn mbtn-mix" onclick="go('ABc')">
        <span class="mbtn-label">ABc</span>
      </button>
      <button class="mbtn mbtn-word" onclick="goWordPuzzle()">
        <span class="mbtn-label" id="wordBtnIcon"></span>
      </button>
    </div>
```

교체 후:
```html
    <div class="mode-buttons">
      <button class="game-card card-abc" onclick="goModeSelect()">
        <span class="card-icon"><img src="assets/images/fly_front.png" alt="catch"></span>
        <span class="card-label">ABC</span>
      </button>
      <button class="game-card card-word" onclick="goWordPuzzle()">
        <span class="card-icon" id="wordBtnIcon"></span>
        <span class="card-label">Word</span>
      </button>
    </div>
```

> `id="wordBtnIcon"`는 그대로 유지 → `script.js:1544`의 사과 SVG 주입 코드가 수정 없이 동작한다.

- [ ] **Step 2: CSS 캐시 버전 올리기**

`index.html:15` 수정:
```html
<link rel="stylesheet" href="style.css?v=29">
```
(기존 `?v=28` → `?v=29`)

---

## Task 2: ABC 모드 선택 화면(#ms) 마크업 추가 (index.html)

**Files:**
- Modify: `index.html:55` 뒤 (`#wp` 닫는 `</div>` 다음 줄)

- [ ] **Step 1: `#wp` 블록 바로 다음에 `#ms` 화면 추가**

`index.html`에서 다음 줄을 찾는다 (55행 부근):
```html
    <div class="wp-stage" id="wpStage"></div>
  </div>
```

그 `</div>`(=`#wp` 닫힘) **다음 줄**에 아래를 삽입:
```html

  <!-- ABC 모드 선택 화면 (파리 잡기 글자 모드 고르기) -->
  <div class="ms" id="ms">
    <button class="ms-back" onclick="msBack()">‹</button>
    <h2 class="ms-title">Which letter?</h2>
    <div class="ms-buttons">
      <button class="mbtn mbtn-abc" onclick="goMode('ABC')"><span class="mbtn-label">ABC</span></button>
      <button class="mbtn mbtn-lower" onclick="goMode('abc')"><span class="mbtn-label">abc</span></button>
      <button class="mbtn mbtn-mix" onclick="goMode('ABc')"><span class="mbtn-label">ABc</span></button>
    </div>
  </div>
```

> 모드 버튼 3개는 기존 `.mbtn-abc/.mbtn-lower/.mbtn-mix` 스타일을 그대로 재사용한다.

---

## Task 3: 카드 & 모드선택 화면 디자인 추가 (style.css)

**Files:**
- Modify: `style.css:124` 뒤 (`.mbtn-word .mbtn-label svg{...}` 줄 다음)

- [ ] **Step 1: `.mbtn-word .mbtn-label svg{...}`(124행) 다음에 새 스타일 추가**

```css
/* === 게임 카드 (메인 메뉴) === */
.game-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:150px;padding:22px 16px;font-family:'Fredoka',cursive;font-weight:bold;border:4px solid rgba(0,0,0,.2);border-radius:28px;cursor:pointer;transition:all .15s;box-shadow:0 6px 0 rgba(0,0,0,.2),0 8px 20px rgba(0,0,0,.3)}
.game-card:active{transform:translateY(4px);box-shadow:0 2px 0 rgba(0,0,0,.2),0 4px 10px rgba(0,0,0,.3)}
.game-card .card-icon{width:76px;height:76px;display:flex;align-items:center;justify-content:center}
.game-card .card-icon img{width:100%;height:100%;object-fit:contain}
.game-card .card-icon svg{width:66px;height:66px;display:block}
.game-card .card-label{font-size:28px;letter-spacing:2px;line-height:1;color:#fff;text-shadow:1px 2px 0 rgba(0,0,0,.18)}
.card-abc{background:linear-gradient(180deg,#81C784,#4CAF50);border-color:#388E3C}
.card-word{background:linear-gradient(180deg,#FFB74D,#FF7043);border-color:#E64A19}

/* === ABC 모드 선택 화면 === */
.ms{position:absolute;inset:0;background:linear-gradient(180deg,#4CAF50,#2E7D32);display:none;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:115}
.ms.show{display:flex}
.ms-back{position:absolute;top:16px;left:16px;width:48px;height:48px;border-radius:50%;border:none;background:rgba(0,0,0,.18);color:#fff;font-size:34px;line-height:1;font-family:'Fredoka',cursive;cursor:pointer;display:flex;align-items:center;justify-content:center;padding-bottom:4px;z-index:5}
.ms-back:active{transform:scale(.92)}
.ms-title{font-size:30px;color:#FFEB3B;text-shadow:2px 2px 0 #F57F17,3px 3px 0 rgba(0,0,0,.2);margin-bottom:6px}
.ms-buttons{display:flex;flex-direction:column;gap:18px;align-items:center}
.ms-buttons .mbtn{min-width:160px}
```

> `.ms`의 `z-index:115`는 `#wp`(120)보다 낮고 `#ss`(100)보다 높다 — 메인 위에 덮이되 퍼즐과 충돌 없음.

---

## Task 4: 모드선택 동작 + 뒤로가기 처리 (script.js)

**Files:**
- Modify: `script.js:1304` 뒤 (`wpBack()` 함수 다음)
- Modify: `script.js:1555` 부근 (popstate 핸들러 내부)

- [ ] **Step 1: `wpBack()` 함수(1304행) 다음 줄에 모드선택 함수 3개 추가**

기존 1304행:
```js
function wpBack(){ document.getElementById('wp').classList.remove('show'); try{SND_BGM.pause();}catch(e){} }
```

그 다음 줄에 추가:
```js

// === ABC 모드 선택 화면 ===
function goModeSelect(){ try{document.getElementById('ms').classList.add('show');}catch(e){} }
function msBack(){ try{document.getElementById('ms').classList.remove('show');}catch(e){} }
function goMode(mode){ try{document.getElementById('ms').classList.remove('show');}catch(e){} go(mode); }
```

> `goMode()`는 모드선택 오버레이를 닫고 기존 `go()`를 호출한다. `go()`가 `#ss`를 숨기므로 게임이 정상 표시된다.

- [ ] **Step 2: popstate 핸들러에 `#ms` 분기 추가**

`script.js`에서 다음 블록(1550-1555행)을 찾는다:
```js
  if(wp&&wp.classList.contains('show')){
    wp.classList.remove('show');
    try{SND_BGM.pause();}catch(_){}
    history.pushState(null,null,location.href);
    return;
  }
```

그 닫는 `}` **다음 줄**에 삽입:
```js
  var ms=document.getElementById('ms');
  if(ms&&ms.classList.contains('show')){
    ms.classList.remove('show');
    history.pushState(null,null,location.href);
    return;
  }
```

> 안드로이드 뒤로가기 시 모드선택 화면이 열려 있으면 먼저 닫고 메인으로 복귀 (WebView 안정성).

---

## Task 5: 캐시 버전 올리기 (service-worker.js)

**Files:**
- Modify: `service-worker.js:1`

- [ ] **Step 1: `CACHE_NAME` 버전 올리기**

```js
const CACHE_NAME = 'abc-frog-v8';
```
(기존 `'abc-frog-v7'` → `'abc-frog-v8'`. 설치된 앱/PWA에서 변경된 화면이 갱신되도록.)

---

## Task 6: 브라우저 수동 검증 + 커밋

- [ ] **Step 1: 로컬에서 게임 실행 후 확인**

로컬 서버 실행:
```bash
cd "d:/1Game_projec/ABC_FROG" && python -m http.server 8000
```
브라우저에서 `http://localhost:8000` 열고 (개발자도구로 모바일 세로 화면 권장) 아래 체크:

검증 체크리스트 (스펙 8장 성공 기준):
- [ ] 메인에 카드 2개(ABC / Word)가 보인다
- [ ] **ABC 카드** → "Which letter?" 모드선택 화면이 뜬다
- [ ] 모드선택의 `ABC` → 기존처럼 대문자 파리잡기 시작 (배경 bg_1)
- [ ] 모드선택의 `abc` → 소문자 잠자리 모드 시작 (배경 bg_4)
- [ ] 모드선택의 `ABc` → 혼합 거미 모드 시작 (배경 bg_5)
- [ ] 모드선택의 `‹` 버튼 → 메인으로 복귀
- [ ] **Word 카드** → 과일 퍼즐이 기존과 동일하게 시작
- [ ] 브라우저 콘솔에 에러(빨간 글씨) 없음

- [ ] **Step 2: 문제 없으면 커밋**

```bash
cd "d:/1Game_projec/ABC_FROG"
git add index.html style.css script.js service-worker.js
git commit -m "feat: 시작화면을 게임 카테고리 카드(ABC/Word)로 개편

- 메인 버튼 4개 → 게임 카드 2개(ABC 알파벳 / Word 단어)
- ABC 카드 → 모드 선택 화면(#ms) → 파리잡기 ABC/abc/ABc
- Word 카드 → 기존 과일 퍼즐 그대로
- popstate에 #ms 분기 추가, CSS/SW 캐시 버전 갱신
- 게임 로직 변경 없음 (메뉴 입구만 교체)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 3: GitHub push (사용자 확인 후)**

```bash
git push origin main
```

> CLAUDE.md "작업 완료 3종 세트": ① 코드수정 → ② push → ③ 노션 TODO 체크. push 후 노션 업데이트는 사용자와 함께.

---

## Self-Review 결과
- **스펙 커버리지:** 스펙 4.1(메인 카드)=Task1, 4.2(#ms)=Task2·3·4, 4.3(퍼즐 무변경)=Task1에서 goWordPuzzle 유지, 4.4(popstate)=Task4 Step2. 전부 커버됨.
- **타입/이름 일관성:** `goModeSelect`/`msBack`/`goMode` 3개 함수명이 HTML onclick(Task1·2)과 JS 정의(Task4)에서 일치. `wordBtnIcon` id 유지로 기존 주입 코드 호환.
- **placeholder:** 없음. 모든 코드 블록은 실제 내용.
- **레이아웃 메모:** 카드 가로배치(승인 스케치는 세로) — 실행 시 사용자에게 고지하고 실물 확인 후 전환 가능하도록 명시함.
