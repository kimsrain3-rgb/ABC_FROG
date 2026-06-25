# ABC Frog 프로젝트

## 프로젝트 개요
- **이름**: ABC Frog
- **장르**: 키즈 영어 교육 게임 (게임 퍼스트, 교육은 덤)
- **컨셉**: 배고픈 개구리가 연잎 위에서 알파벳 든 파리를 혀로 잡아먹는 게임
- **타겟**: 3~7세 아이들
- **기술 스택**: HTML5 + JS + CSS (index.html / style.css / script.js 분리, 빌드 도구 없음)
- **플랫폼**: 웹(GitHub Pages) + 안드로이드 WebView 앱 래핑 — **프로덕션 라이브**

## GitHub / 노션
- 저장소: https://github.com/kimsrain3-rgb/ABC_FROG (Public)
- 메인 기획서+TODO: 🐸 ABC Frog (notion page_id: 3097112a-ae24-819e-8d27-f1d38f19258d)
- 시리즈 전체 기획: 🎮 게임 아이디어 (page_id: 3097112a-ae24-819b-b5b5-c3ce269888f0)

## 현재 상태 (요약)
- ✅ **프로덕션 정식 출시 / 실유저 300명+ / versionCode 8 라이브** (2026-06-08 기준)
- ✅ 메인 게임(파리잡기 ABC/abc/ABc) + **단어퍼즐(과일) + 엔딩 영상·음성** 라이브
- 🔜 진행 중: **동물 퍼즐**(배경 통째 네모 직소퍼즐 스타일) 설계 — 재료(장면그림)+보상(AI영상 테스트) 대기
- 📜 완료 이력 전체 → **`docs/CHANGELOG.md`**
- ⚠️ **앱은 WebView로 GitHub Pages 실시간 로딩 → `main` push = 즉시 전 유저 반영. 푸시 전 반드시 검증.**

## 현재 파일 구조 (핵심만)
```
ABC_FROG/
├── index.html          ← HTML 뼈대 (+ 캐시버스터 always-fresh 로더)
├── style.css           ← CSS
├── script.js           ← 게임 로직 (파리잡기 + 단어퍼즐)
├── data-word-fruits.js ← 과일 데이터 분리 (※ refactor 브랜치, main 병합 대기)
├── manifest.json / service-worker.js(킬스위치) / privacy-policy.html
├── assets/  images/ · sounds/ · fonts/   ← 실제 파일로 관리 (base64 X)
├── twa-project/        ← 안드로이드 순수 WebView 앱 (Gradle, MainActivity.java)
├── .github/workflows/  ← GitHub Actions (build-aab.yml)
└── docs/               ← CHANGELOG.md 등
```

## 게임 디자인 (참고)
- **핵심 메카닉**: 정답 파리 → "야미야미!" + 알파벳 발음 + 별 + 배 빵빵 / 오답 → "우웩!" + 토하기 / 콤보(야미→야미야미→…) / 개구리 감정 4종(hungry·yummy·yucky·full)
- **캐릭터**: 개구리(메인, 스프라이트 애니), 나비(4프레임), 애벌레(9프레임), 파리(알파벳 타겟)
- **ABC 노래 엔딩 컨셉**: 파리 합창단 + 개구리 지휘자, 호명 시 볼록렌즈 + 반짝임

## 에셋 관리 방침
- 그림/소리는 `assets/`에 실제 파일로 (base64 내장 X)
- 그림 추가/교체 빈번 예정 (러프스케치 → 깔끔한 라인 업그레이드 등)
- 파일명 알아보기 쉽게: `frog_hungry.png`, `fly.png` 등
- ⚠️ **기존 파일을 같은 이름으로 교체하면 캐시됨** → 교체 시 파일명 변경 또는 `?v=` 갱신 (아래 배포/캐시 규칙)

## Google Play 배포 정보
- **패키지명**: com.ggomzipapa.abcfrog
- **현재 버전**: versionCode 8 (프로덕션 라이브)
- **서명키 SHA1**: D7:D4:13:7D:B1:44:7D:00:35:0F:1C:CD:26:18:90:DB:7B:87:68:29
- **서명키 SHA256**: 6F:DE:2D:08:2E:33:E0:B8:C9:E4:20:E4:D2:08:68:41:AC:2F:27:27:53:23:3F:EC:FB:B0:7D:CB:67:06:95:54
- **서명키 위치**: GitHub Secret `KEYSTORE_BASE64` + 로컬 백업 (`/d/1Game_projec/AAB, AAB_KEY/`)
- **개발자 계정 ID**: 8921467846864051720
- **개인정보처리방침**: https://kimsrain3-rgb.github.io/ABC_FROG/privacy-policy.html
- **연락처**: ccomzpapa@naver.com
- **assetlinks.json**: .well-known/assetlinks.json (GitHub Pages 서빙)

## 알려진 이슈
- 파리 경계 처리 — 화면 밖으로 나가는 버그 반복 발생 이력
- 반응형 전환 — PC(1024px+)/모바일(768px-) 분기점 주의

## 미처리 TODO (미완료만 — 완료분은 docs/CHANGELOG.md)
- [ ] 🟡 나비/애벌레 혀(`isShooting`)와 게임 혀(`ia`) 잠금변수 달라 동시탭 시 혀 겹침 글리치
- [ ] 🟢 파리 먹힐 때 입 위치 고정값(0.5,0.38) — 4~5단계 뚱뚱 개구리 입(0.56)과 어긋남
- [ ] 🟢 `wpSayWord`가 `new Audio()` 직접 사용 → `safeAudio()`로 통일 권장 (위험 낮음)
- [ ] 🟢 `buildPuzzle` 비동기 race(잠재): `_im.onload`가 전역 `wpCurrent` 참조 → 빌드 겹치면 엉뚱한 과일. 실플레이 미발생, 우선순위 낮음. (※ 퍼즐이 '깨진 이미지'면 거의 항상 **로컬 테스트서버 꺼짐**이 원인, 코드버그 아님)
- [ ] ➕ **안드로이드(MainActivity.java)**: 오프라인 시 `onReceivedError` 비어있어 깨진 에러화면 노출 → 안내화면 추가 (Play 업데이트 때 묶어 처리)
- [ ] 🔴🔐 **서명키 비밀번호 교체**: `twa-project/app/build.gradle`에 `abcfrog123` 평문 노출(깃 히스토리 포함). keytool로 비번 변경 → Secret 재등록 → build.gradle 평문 제거(환경변수 참조) → AAB 재빌드. (서명키 자체는 교체 불가, 비번만)
- [ ] 🔵 refactor 브랜치(`data-word-fruits.js` 데이터 분리) main 병합 — 검증 완료, always-fresh 방식과 정합 확인 후 머지
- [ ] 🔵 **동물 퍼즐 시즌1 (친근한 동물 10종)** — **10/10 완성 ✅** (2026-06-25, /test/ 라이브 배포 확인). 배경 통째 직소퍼즐 + 이름 스펠링 + 동물 영상 보상. 코드=`test/current.html`(테스트 배포본)+`proto-animal.html`(원본) 의 `ANIMALS` 배열(둘 동기화). **본게임 미통합**(테스트=고정주소 /test/). 순서:
  1.🐘코끼리 2.🦁사자 3.🐻곰 4.🐰토끼 5.🦝너구리 6.🦒기린 7.🐯호랑이 8.🐱고양이 9.🐶강아지 10.🐨코알라(피날레) — 전부 ✅
  - ※ 펭귄·고래·원숭이 제외, 다람쥐→너구리(2026-06-25 시즌1 재정비). **남은 일**: 출시 전 PNG 5개(곰·토끼·고양이·강아지·너구리) JPG화 + 다음 큰 단계=**본게임 통합**(시작화면 Animal 카드 잠금해제 + script.js 통합 → 실유저 플레이).

## 협업 규칙

### 역할
- **꼼지파파** = 아이디어 + 지시 + 에셋(그림/소리) + 최종 판단
- **Claude** = 실무(코드/구현/파일정리)
- 꼼지파파는 코딩 비전공자 — 기술 용어 최소화, 비유로 설명할 것

### 코드 수정 원칙
- 수정 전 반드시 현재 코드 확인 — 기억에 의존하지 말 것
- 한 번에 하나씩 — 여러 기능을 동시에 바꾸지 말 것
- 변수명/함수명 바꿀 때 참조하는 곳 모두 확인
- 파일 분리/수정 후 게임 기능이 100% 동일하게 작동해야 함

### 테스트 방법 (필수 — 다른 창/세션에서도 이대로)
- **모든 게임 테스트는 고정 주소 하나로 한다**: https://kimsrain3-rgb.github.io/ABC_FROG/test/
- 폰에서 **"홈 화면에 추가"** 해서 앱처럼(전체화면)으로 테스트한다. (브라우저 탭은 주소창 때문에 작아 보임 → 크기가 라이브와 다르게 보이는 것 방지)
- **새 게임(동물·공룡 등)도 이 같은 주소에 내용만 갈아끼운다.** 새 테스트 주소 만들지 말 것.
- **시크릿 탭**이나 **매번 바뀌는 긴 githack 주소** 방식은 쓰지 말 것. (githack은 전체게임에서 "Open the page" 경고+캐시로 깨짐)
- 구현(Claude용): 테스트 환경 = main의 `test/` 폴더(`test/index.html` + `test/script.js`). 후보 코드를 `test/script.js`에 넣고 main에 push → Pages 자동배포. assets/style.css는 라이브 공유(`<base href="../">`), 캐시버스터+서비스워커 자동정리로 항상 최신. 라이브 루트(`/index.html`,`/script.js`)는 안 건드림. 검증 후 진짜 `script.js`에 반영해 라이브 배포.

### Google Play 제출 규칙 (필수 준수)
**절대 "검토 시작"을 바로 누르지 말 것!** 반드시 프리 런치 보고서를 먼저 확인한다.
1. AAB 빌드 (GitHub Actions → Build AAB)
2. Play Console → 비공개 테스트 → AAB 업로드
3. **"저장"만** 누르기 (❌ "검토 시작" 누르지 말기)
4. **사전 출시 보고서(프리 런치 보고서)** 결과 확인 (몇 시간~하루)
5. 크래시 없음 확인 → **그때 "검토 시작"** 누르기
6. 크래시 있으면 → 로그 확인 → 수정 → 1번부터 다시

### Google Play 안정성 규칙 (WebView 앱 — 필수 준수)
순수 WebView 앱이라 **JS 에러 = 앱 크래시 = 심사 거부.** 방어적 프로그래밍 필수.
1. **전역 에러 핸들러 유지** — `window.onerror` + `unhandledrejection`(script.js 최상단). 절대 제거 금지
2. **Audio는 반드시 `safeAudio()` 사용** — `new Audio()` 직접 호출 금지 (실패 시 더미 객체 반환 래퍼)
3. **SpeechSynthesis는 try-catch 필수** — `sp()` 안에서 처리. TTS 없는 기기 크래시 방지
4. **AudioContext 사용 전 null 체크** — `ea()` 후 `if(!ax) return;` 패턴 유지 (`pt`,`psg`,`pbr`)
5. **게임 루프(`gl`) try-catch 유지** — `uf()` 호출 감싸 한 프레임 에러가 전체 루프 안 멈추게
6. **브라우저 API 사용 전 존재 확인** — `'speechSynthesis' in window`, `window.AudioContext||window.webkitAudioContext` 등
7. **새 기능 추가 시** — `.play()`,`.speak()`,DOM API 등 실패 가능한 호출은 항상 `.catch(()=>{})` 또는 try-catch

### 배포 / 캐시 규칙 (필수 준수)
> 앱이 WebView(`setCacheMode(LOAD_DEFAULT)`)로 GitHub Pages를 로드 → 캐시 때문에 "수정했는데 폰엔 옛 코드"가 반복됐던 영역. **방법이 아니라 목적을 지킬 것.**
1. **목적(불변)**: 푸시하면 **유저가 반드시 최신을 받아야 한다.** 현재 방법 = `index.html`이 `document.write`로 `script.js?b=Date.now()`/`style.css?b=Date.now()` 붙여 **매 실행 always-fresh** 로드. **이 로더를 정적 `?v=`로 되돌리지 말 것.** 더 나은 방법으로 바꾸려면 새 방법도 "푸시 후 최신 보장" + **실제 폰 검증** 통과해야 함.
2. **그림·소리 교체 주의**: always-fresh는 **코드(js/css)만** 커버. 이미지/사운드를 **같은 파일명으로 교체**하면 여전히 캐시됨 → 파일명 변경 또는 `?v=` 갱신. (새 파일명 추가는 OK)
3. **검증은 반드시 실제 폰에서**: 캐시는 여러 겹 — "한 겹 막았다 = 다 막았다" 아님. 로컬 강력새로고침은 캐시를 숨김 → 최종 검증은 **실제 폰 앱 완전종료→재시작** 후. (※ 오래 깔린 기기는 캐시/옛 서비스워커로 며칠 늦게 반영될 수 있음. 즉시 100% 보장하려면 MainActivity에 캐시 무력화 넣어 Play 업데이트 — 1회성)

### 세션 시작 프로토콜
1. 이 CLAUDE.md 읽기 (자동)
2. git pull로 최신 코드 확인
3. 코드 확인 → 실제 구현 상태 파악
4. 사용자에게 현재 상태 요약 + 오늘 작업 방향 확인

### 작업 완료 시
1. 코드 수정 완료
2. git commit & push (script.js/style.css 고쳤으면 배포/캐시 규칙 확인)
3. **완료 기록은 `docs/CHANGELOG.md`의 "작업 일지(날짜별)"에 그날 한 일 한 줄 추가.** CLAUDE.md "현재 상태"는 한두 줄만 갱신 (← CLAUDE.md 비대화 방지)

### 의사결정
- 기획 방향 변경 → 반드시 사용자 확인 후 진행
- 버그 수정, 코드 정리 → Claude가 바로 진행 가능
- 새 기능 추가 → 사용자와 범위 합의 후 진행

### 문서 관리 원칙
- CLAUDE.md = **살아있는 규칙 + 현재 상태(요약) + 미완료 TODO**만. 길이를 짧게 유지(규칙이 묻히지 않게).
- 완료 이력·옛 버전 → `docs/CHANGELOG.md`
- 규칙이 **코드로 강제되면**(예: 캐시 always-fresh) CLAUDE.md엔 핵심 한 줄만, 자세한 건 코드/메모리에
