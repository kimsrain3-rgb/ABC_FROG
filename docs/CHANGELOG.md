# ABC Frog — 변경/완료 이력 (Changelog)

> CLAUDE.md를 가볍게 유지하기 위해, **완료된 작업·옛 버전 기록**은 여기에 보관한다.
> CLAUDE.md엔 "현재 상태(한두 줄) + 살아있는 규칙 + 미완료 TODO"만 남긴다.
> **위쪽 "완료 이력(기능별)"** = 날짜와 무관한 주제별 색인.
> **맨 아래 "작업 일지(날짜별)"** = 세션마다 그날 한 일을 기록. 항상 **파일 맨 끝이 최신** (새 날짜는 파일 맨 아래에 추가).

---

## 완료 이력 (기능별 색인 · 날짜순 아님)

## 초기 구조화 (분리·에셋)
- [x] 단일 index.html → index.html + style.css + script.js 분리
- [x] base64 이미지 → assets/images/ 실제 파일로 분리
- [x] base64 오디오 → assets/sounds/ 실제 파일로 분리
- [x] 에셋 분리 후 게임 정상 작동 테스트

## 메인 게임 (파리잡기)
- [x] ABC(대문자) 모드: 파리 캐릭터 + bg_3
- [x] abc(소문자) 모드: 잠자리 캐릭터 + bg_4
- [x] ABc(혼합) 모드: 거미 캐릭터 + bg_5 + 그루터기 에셋
- [x] 인트로 화면: frog_4a/4b 숨쉬기 애니메이션
- [x] 말풍선 2배 확대 + 개구리 옆 배치 / 소문자 글자 35% 확대
- [x] 튜토리얼 데모: ABC 모드에서만 표시
- [x] 수집판: ABc 모드 랜덤 대소문자 표시

## 배포 인프라
- [x] PWA 설정 (manifest.json + service-worker.js + 앱 아이콘 4종)
- [x] 개인정보처리방침 페이지 (privacy-policy.html, 한/영 토글)
- [x] TWA 프로젝트 구성 → v1.0.4에서 **순수 WebView 앱으로 전환**(TWA 제거)
- [x] GitHub Actions AAB 빌드 워크플로우 (.github/workflows/build-aab.yml)
- [x] 서명 키: GitHub Secret(KEYSTORE_BASE64)으로 고정 키 사용

## Play Console 버전 이력
- [x] 비공개 테스트 업로드 (v2, 1.0.1)
- [x] v1.0.2 안정성 수정 (JS 방어 코딩) — **거부됨**
- [x] v1.0.3 구조적 수정 (WebView폴백, GA4제거, assetlinks, 뒤로가기) — **거부됨**
- [x] v1.0.4 TWA 완전 제거 → 순수 WebView 앱
- [x] v1.0.4 AAB 빌드 & 제출 — 비공개 테스트 통과 (2026-04-09)
- [x] 비공개 테스트 → **프로덕션 정식 출시** (검수 통과)
- [x] **실유저 300명+ 다운로드, versionCode 8 라이브** (2026-06-08 기준)

## 단어퍼즐 (과일)
- [x] 과일 직소퍼즐 (PNG 자동 마스크로 모양대로 자름) + 글자 스펠링
- [x] **엔딩 추가 (2026-06-15, 커밋 c48282e)**: 마지막 과일 완성 → 개구리 과일바구니 영상(`assets/images/frog-baskit.mp4`) + "Thanks friend!" 음성(`Thanks-friend-Yummy-fruit.mp3`) → 마지막 장면 캔버스 정지그림 고정 + 흰 전체화면 + 다시하기. `wpPlayEnding()`
- [x] **엔딩 후속 수정 (2026-06-15~16)**:
  - 뒤로가기 시 음성·9초타이머·영상 정리 누수 → `_wpEndingStop()` 통합정리 (wpBack/popstate/replay)
  - shout 확대 1.5→1.25 → 긴 단어(PINEAPPLE) 끝글자 잘림 해결
  - 엔딩 전환 검은화면 → **덮개 방식**(`.wp-vcover` 불투명 덮개를 영상 위에 씌우고, 진짜 재생 시작 후 제거)으로 차단
- [x] **캐시버스터 always-fresh (2026-06-16, 커밋 aad03fb)**: index.html이 `document.write`로 `script.js?b=Date.now()`/`style.css?b=Date.now()` 로드 → 매 실행 최신
- [x] **데이터 분리**: 과일 데이터(WP_WORDS/WP_ORDER) → `data-word-fruits.js` (refactor 브랜치, 검증됨 / main 병합 대기)
- [x] `.gitignore` 정리 (테스트 흔적·PSD·Premiere·스토어자료 제외)

## 완료된 버그 수정 (메인 게임 안정성)
- [x] 🔴 `ptg()` 안전장치(`if(!ax)return`) 누락 → 오디오 없는 기기 혀쏘기 먹통 — 수정/배포
- [x] 🟡 튜토리얼 데모 파리 탭 시 "우웩" 오답 (정답글자 미설정) → `oft`에 `gp!=='playing'` 가드 — 수정/배포
- [x] 🟢 퍼즐 화면 즉시 뒤로가기 시 `buildPuzzle` 0.06초 재시도 루프 안 멈춤(배터리) → `'show'` 가드 — 수정/배포

---

## 작업 일지 (날짜별 · 오래된 것부터, 맨 아래가 최신)

### 2026-06-15
- 단어퍼즐 **엔딩 추가** (커밋 c48282e): 마지막 과일 완성 → 개구리 과일바구니 영상(`frog-baskit.mp4`) + "Thanks friend!" 음성 → 마지막 장면 정지 + 다시하기 (`wpPlayEnding()`)

### 2026-06-16
- **단어퍼즐 엔딩 후속 수정 줄줄이:**
  - 멈춘 영상 미세 떨림 → 마지막 프레임을 **캔버스 정지그림**으로 교체
  - 뒤로가기/popstate/리플레이 시 음성·9초타이머·영상 **정리 누수** → `_wpEndingStop()` 통합 정리
  - 긴 단어(PINEAPPLE) shout 확대 시 **끝글자 잘림** → shout 1.5→1.25
  - 엔딩 전환 **검은화면**(WebView 영상 첫 프레임) → **덮개 방식**(`.wp-vcover` 불투명 덮개, 진짜 재생 시작 후 제거)으로 차단
- **캐시 문제 근본 정리:**
  - `index.html` **always-fresh 로더**(`?b=Date.now()`)로 script.js/css 항상 최신 (커밋 aad03fb)
  - 캐시버스터 버전 범프 + CLAUDE.md "배포/캐시 규칙" 문서화
  - 폰 전달 지연 진단(`build c0616` 표시) — 오래 깔린 기기는 캐시/옛 SW로 며칠 늦을 수 있음 확인. (※ 진단용 표시 라이브에 남아있음 → 확인 후 제거 예정)
- `.gitignore` 정리 (테스트흔적/PSD/Premiere/스토어자료 제외)
- 과일 데이터 분리 `data-word-fruits.js` (refactor 브랜치 — main 병합 대기)
- **동물 퍼즐 설계 합의**: "배경 통째 네모 직소퍼즐" 스타일로 결정 + 이름 스펠링 흐름. 보상(영상)은 **AI영상 테스트 후 결정(대기)**. 코끼리 숲그림 준비됨 / 사자는 배경버전 필요
- CLAUDE.md 슬림화 (185→130줄) + 이 CHANGELOG 분리

### 2026-06-18
- 폰에서 **엔딩 검은화면 사라진 것 확인** → 덮개 방식 수정 정상 작동 + 웹 푸시 전달도 정상(하루 뒤 자연 반영). "앱 업데이트 필요/캐시 영영 얼음" 걱정은 기우였음
- 진단용 `build c0616` 표시 제거
- **동물 퍼즐 프로토타입(`proto-animal.html`, 코끼리 1마리) 다듬기** — 본게임 과일퍼즐과 통일 + 엔딩 영상:
  - 폰트/스펠링 스타일 통일: Fredoka `<link>` 추가(독립파일이라 빠져 Comic Sans 폴백됐었음), `.wl` 스타일·글자 반짝임(`wpSparkle`) 이식
  - **스펠링 속도 — 핵심**: `letter_*.mp3`에 발음 앞뒤 묵음이 큼(앞 110~340 / 발음 320~550 / 뒤 180~326ms). Web Audio 디코드 후 RMS로 발음 구간 자동감지→묵음 잘라낸 부분만 재생, 발음 끝나면 `LETTER_GAP`(90ms)만 쉼. ELEPHANT **8.4초→5.3초** (발음·음정 그대로). 첫 터치에 글자 미리 디코드. ※"고정간격 240ms"는 음성 겹쳐 뭉개져 폐기.
  - 💡 이 묵음 자동제거 방식은 **본게임 과일퍼즐 스펠링(`wpComplete`, 아직 SPEED=3.0/onended라 ~8초)에도 적용하면 빨라짐** → 추후 검토
  - **완성 후 동물 영상 엔딩**(과일 `wpPlayEnding` 방식): 퍼즐완성→스펠링→단어외치기→그 동물 영상→(마지막 동물만) 다시하기. `ANIMAL_ORDER`/`VIDEO` 구조로 다중동물 대비. 영상은 **자체 소리 재생**(막히면 음소거 폴백). `object-fit:cover`로 양옆 흰여백 제거.
  - **엔딩 전환 흰화면 스침 제거**: 과일퍼즐의 흰 덮개(`.wp-vcover`) 방식 대신 → **영상 opacity:0→첫 실제 프레임에 페이드인**(로딩 중엔 완성된 퍼즐이 보임). ※과일퍼즐도 이 방식으로 바꾸면 흰화면 안 스칠 듯
  - 밑그림(`.ghost`) opacity 0.20→0.30 ("너무 연하다" 의견)
  - 영상 파일 `assets/images/elefant_movie.mp4`(2.2MB) 추가. ⚠️ **아직 git 미반영**: `elefant_movie.mp4`, `Animal-lion.png`(다음=사자), `sound_elefant.mp3`, proto-animal.html 등. 파일 철자 제각각 주의(animal_elifant1 / sound_elefant / elefant_movie)
  - 다음: ①사자 추가→다중동물 구조 ②proto를 본게임 index.html/script.js 통합+에셋 커밋 ③묵음제거 스펠링 과일퍼즐 적용 검토

### 2026-06-22
- **동물 퍼즐 다중동물 구조 완성 + 3종(사자·코끼리·코알라)** — 아직 `proto-animal.html`(독립 파일), 본게임 미통합. 작업은 `animal-proto` 브랜치에만.
  - **다중동물 리팩터**: 코끼리 하드코딩 → `ANIMALS` 배열(key/word/title/img/video/say/sound/ghost/alignY). `buildAnimal()`로 동물 바뀔 때마다 재빌드, 드래그는 전역 `PZ` 1회 등록. 완성→스펠링→단어외치기→그 동물 영상→다음 동물 자동진행, **마지막 동물(코알라) 영상 뒤에만 다시하기**.
  - **순서 = 계획 10종 목록 순서**(사자1→코끼리2→…→코알라10), 만든 순서 아님. 코알라가 피날레. (안정성 우선 — [[feedback_stable_approach]])
  - 코알라·사자 에셋 추가(각 그림+영상+음성). 단어음성: 동물별 mp3 있으면 재생, 없으면 TTS 폴백.
  - **영상 용량 교훈**: 크기=비트레이트×길이(해상도 아님). 코알라 10.7MB→(해상도만 낮춰 5.5MB, 안 줆)→**비트레이트 낮춰 2.45MB**. 목표 동물당 ~2MB / H.264. (사자 2.48MB·코끼리 2.1MB)
  - **동물별 밑그림 투명도(ghost)**: 밝은 그림은 묻혀 보임 → 코알라만 0.42(사자·코끼리 0.30).
  - **동물별 세로위치(alignY)** 신설: 세로 긴 그림이 가운데크롭 시 발 잘림 → 사자 `alignY=0.62`(발 보이되 머리 위 헤드룸). 폰비율(390×844) Playwright 스크린샷으로 구도 검증.
- **폰 테스트 = githack 브랜치 배포**: `raw.githack.com/.../animal-proto/proto-animal.html` (Public repo라 PC꺼도·집밖에서도 접속). 단 브랜치URL은 CDN캐시로 늦음 → **커밋SHA 박은 URL이 항상 최신**. main/라이브 게임 영향 0 (proto는 독립파일).
- **10종 동물 목록 확정 기록**(CLAUDE.md + 메모리 [[동물 퍼즐 10종 목록]]): 사자/코끼리/기린/호랑이/곰/토끼/원숭이/펭귄/고래/코알라 + 각 문구. 진행 **3/10**.
- 설치 플러그인 10개 **보안 점검 — 전부 정상**(외부통신·자격증명 접근·난독화 실행 없음). 공식+bkit+superpowers.
- ⚠️ IP 변동 주의: 로컬주소 192.168.0.6→0.7 바뀜(공유기 재할당). ⚠️ 미반영: proto 및 동물 에셋은 `animal-proto` 브랜치에만(main 아님). 옛 `Animal-lion.png`는 미사용(실사용=`animal_lion.jpg`).
- 다음: ④기린·호랑이 등 나머지 7종 에셋 추가 ⑤충분히 모이면 본게임 통합 ⑥출시 전 영상 용량 점검
- **(이어서) 🦒 기린 추가 → 진행 4/10** (순서: 사자→코끼리→**기린**→코알라):
  - 에셋: `animal_giraffe.jpg` / `Giraffe_movie.mp4`(2.53MB) / `sound_giraffe.mp3`. ⚠️ 영상 파일명 **대문자 G** — githack/GitHub은 대소문자 구분하니 코드도 정확히 `Giraffe_movie.mp4`.
  - **기린 구도(alignY)**: 목이 길어 머리+발 동시표시 불가. 처음 0.20(얼굴 보이나 머리 위 답답) → 꼼지파파 요청대로 **0.00(최대 아래)** = 머리 위 잎사귀 헤드룸 ~15%, 다리는 더 잘림(의도). alignY=0이 그림 맨위까지 보여주는 한계. 폰비율(390×844) Playwright 스크린샷으로 잡음.
- **🐨 코알라 영상 교체**: 새 `koala.mp4`(2.52MB)로, 옛 `coala_movie.mp4` git rm + 안쓰는 `Koala_movie.mp4` 삭제 → 코알라 영상 1개로 정리. 코드 video 경로도 `koala.mp4`로 변경. (새 파일이 2개 올라와 있어 어느 걸 쓸지 확인 후 진행)
- ⚠️ **영상 길이 주의**: 기린·코알라 새 영상은 **10초**(다른 동물 ~5초보다 김) → 출시 전 5초로 통일 고려.
- 💡 **githack 커밋URL 캐시 교훈**: 매 push마다 커밋SHA 박힌 새 URL을 써야 최신. 옛 북마크/브랜치URL은 그 시점 영상이 박혀 있어 "옛 영상 나온다" 착시 발생. (실제로 그 일 있었고 새 커밋URL로 해결)

### 2026-06-24
- **과일 퍼즐 스펠링 속도 개선 → 라이브 반영** (실유저 적용): 동물 퍼즐의 '글자음성 앞뒤 묵음 자동제거(Web Audio)' 방식을 `script.js` `wpComplete`에 이식. APPLE ~5초→3.7초, STRAWBERRY ~10초→6.8초. (`wpLoadLetter` 추가, LETTER_GAP=90). index.html이 `script.js?b=Date.now()`라 버전범프 불필요.
- **바나나 "3조각" 소동 → 라이브는 정상(6조각)**: 라이브 github.io == main(diff 0) 확인, `wpBspCut(바나나)` 직접 측정=6조각, 로컬 렌더도 라이브 앱과 동일. 사장님이 본 3조각은 **githack 전체게임의 "Open the page" 인터스티셜 + 캐시** 때문이었음(코드 버그 아님).
- ⭐ **고정 테스트 환경 구축** (CLAUDE.md "테스트 방법" 규칙 추가): 주소 하나 `https://kimsrain3-rgb.github.io/ABC_FROG/test/` 로 통일.
  - 구조: main의 `test/` 폴더. `test/index.html`=**런처**(`current.html?b=Date.now()`로 이동 → 아이콘 누를 때마다 항상 최신, 캐시문제 0). `test/current.html`=실제 테스트 콘텐츠. `test/manifest.json`=PWA(display:fullscreen).
  - **홈화면 추가 시 전체화면**(앱과 동일 크기). 브라우저 탭은 주소창 때문에 작아 보임(측정상 라이브 웹과 픽셀 동일). assets/css는 `<base href="../">`로 라이브 공유. 서비스워커/캐시 자동정리.
  - **githack은 전체게임에 폐기** — 경고 인터스티셜+SW캐시로 깨짐. (단일파일엔 됐었지만 Pages /test/로 통일)
- **브랜치 정리**: 흩어진 동물 퍼즐 작업(animal-proto)을 **main으로 통합**(proto-animal.html 5종 + 에셋). CLAUDE.md/스크립트가 브랜치마다 달라 헷갈리던 것 해소 → 앞으로 **main에서만 작업**. (fruit-spelling 변경도 라이브 반영 완료)
- **동물 퍼즐을 /test/에 올림** (과일게임 대신). proto-animal.html → test/current.html(+base/PWA).
- **🔧 자동번역 버그 수정**: 폰 브라우저가 `lang="en"` 페이지를 한국어로 자동번역 → 영어 스펠링 글자(G-I-R-A-F-F-E)가 한글로 나옴. → `lang="ko" translate="no"` + `<meta name="google" content="notranslate">`. (라이브 게임은 원래 lang="ko"라 무사했음)
- **🐻 곰 추가 → 진행 6/10** (사자·코끼리·기린·호랑이·곰·코알라). alignY=0.50. ⚠️ 곰·호랑이 이미지 PNG(3MB대) — 출시 전 JPG화 권장(코알라/기린/코끼리는 JPG).
- **🔧 조각 가림 버그 수정**: 안 맞춘 조각을 맞춰진 조각 위로 끌면 밑으로 숨던 문제. 원인=`.piece` 기본 z-index 없음(auto)+non-snap 드롭 시 ''리셋(맞춤10보다 아래). → **과일 퍼즐 방식**(`.piece` 기본 20, 드래그 999, 맞춤 10, non-snap도 20)으로 통일 → 안 맞춘 조각 항상 위.
- 남은 동물: 🐰토끼 🐵원숭이 🐧펭귄 🐋고래 (4종). 다음: 에셋 받아 추가 → 충분히 모이면 **본게임 통합**(시작화면 Animal 카드 잠금해제, script.js에 통합) → 실유저 플레이.

### 2026-06-25
- **🎉 동물 퍼즐 시즌1 10종 전부 완성 (10/10)** — `test/current.html`(테스트 배포본) + `proto-animal.html`(원본) 동기화, main 푸시 → `/test/` 라이브 배포 확인(에셋 200). 아직 **본게임 미통합**(시제품, /test/에서만 플레이).
  - **🐰 토끼 추가**: alignY=0.50, **ghost=0.42**(흰토끼라 밑그림이 묻혀서 진하게).
  - **🐱 고양이 / 🐶 강아지 추가**: 둘 다 alignY=0.50.
  - **🦝 너구리 추가(마지막 #5)**: alignY=0.50, ghost=0.30. 영상 `raccoon_movie.mp4`(7.9초 720×1280), 발음 `sound_raccoon.mp3`(~1초). 구도=머리 위 포도 헤드룸 + 줄무늬 꼬리·발 보임. ⚠️ 이미지 파일명 오타 수정(`anmal_raccoon.png`→`animal_raccoon.png`).
  - **[중요] 시즌1 최종 명단 재정비**: 펭귄·고래·**원숭이** 제외(원래 코드엔 펭귄·고래 없었음), **다람쥐→너구리** 변경, **코알라 유지(피날레)**. → 최종 순서: 🐘코끼리·🦁사자·🐻곰·🐰토끼·🦝너구리·🦒기린·🐯호랑이·🐱고양이·🐶강아지·🐨코알라(피날레). (CLAUDE.md TODO + 메모리 [[동물 퍼즐 10종 목록]] 동기화)
  - **확인 절차**: 코드 바꾸기 전에 현재 동물 목록 먼저 보고드리고 → "진행해" 받은 뒤 재정비(안정성 우선 [[feedback_stable_approach]]). 폰비율(390×844) Playwright 스크린샷으로 동물별 구도 검증.
- ⚠️ **출시 전 남은 일**: ① PNG 이미지 5개(곰·토끼·고양이·강아지·너구리) → JPG화(용량↓). ② **본게임 통합**(시작화면 Animal 카드 잠금해제 + script.js 통합) → 실유저 플레이. ③ 일부 영상 길이(기린·코알라 10초, 너구리 7.9초) ~5초로 통일 고려.
- **🐱 고양이 영상 교체 + ⭐ 테스트 에셋 캐시버스터 추가**:
  - 고양이 영상을 새 `cat_movie.mp4`로 교체(**같은 파일명 덮어쓰기**, 2.41MB). 라이브 영상 크기=로컬과 일치 확인.
  - **문제**: 같은 파일명으로 에셋을 덮어쓰면 폰/브라우저 캐시가 옛 파일을 보여줌(이 프로젝트의 반복 이슈, [배포·캐시 규칙] 참고). always-fresh 로더는 코드(js/css)만 커버, 영상/그림/소리는 plain 경로(`vid.src=A.video` 등)라 캐시됨.
  - **해결(테스트 전용)**: `test/current.html`에 `bust(u)` 헬퍼 추가 → 영상·그림(밑그림 포함)·소리 로드 시 `?cb=<페이지로드시각>` 자동 부착. **페이지 1회 로드당 토큰 1개**(세션 내 1회만 다운로드, 런처로 새로 들어오면 새 토큰=새로 받음). → **앞으로 같은 이름으로 에셋만 갈아끼우면 코드 수정 없이 /test/에서 항상 최신.**
  - ⚠️ `bust`는 **/test/ 전용**. 본게임 통합 시엔 실유저가 매번 영상 재다운 안 받게 라이브용 캐시 방식(파일명/`?v=`) 별도 적용. proto-animal.html(원본)엔 미적용.

### 2026-06-29
- **GA4 분석: 과일 vs 동물 퍼즐 구분값(`category`) 추가** (시즌2 콘텐츠 결정용 데이터). 그동안 `word_puzzle_complete`엔 과일만 집계되고 **동물 완성은 아예 미집계**라 비교 불가였음 → 해결.
  - 과일(`script.js`): `goWordPuzzle`의 `word_puzzle_open`, `wpComplete`의 `word_puzzle_complete`에 `category:'fruit'` 추가.
  - 동물 열기: `animal_puzzle_open` → `word_puzzle_open`+`category:'animal'`로 **이름 통일**(과거 과일 데이터와 같은 이벤트에서 category로 갈라 비교 가능하게. 결정: 사장님). 기존 `animal_puzzle_open`은 더 안 보냄.
  - 동물 완성(신규): `animal.html`은 별도 iframe이라 부모(본게임)의 gtag를 못 부름 → 완성 순간 `parent.postMessage({t:'animal_done',key})` 전송, `script.js`에 message 리스너 추가해 `word_puzzle_complete`+`category:'animal',word:key` 기록. (GA 코드는 본게임 한 곳에만 유지 — 기존 `animal_puzzle_open`도 부모에서 쏘던 방식과 일관.)
  - **테스트 방식 결정**: 분석 신호만 추가(게임 화면·동작 변화 0, 전부 try-catch라 깨질 위험 0)라 /test/ 미러(=script.js 2개로 갈라지는 옛 드리프트 문제 재발) 대신 **본게임 파일에 바로 반영 + GA4 실시간 검증**으로 진행(사장님 결정). 커밋 `15eddb8`.
  - ⏳ **남은 일**: ① 폰에서 실제 게임으로 과일1·동물1 플레이 → GA4 실시간에서 `category=fruit/animal` 확인. ② GA4 관리 > 맞춤정의에서 `category`를 **맞춤 측정기준(이벤트 범위)** 으로 등록해야 일반 보고서에서 비교표가 보임(등록 후 ~24h). 클로드가 화면 보며 도울 예정.
