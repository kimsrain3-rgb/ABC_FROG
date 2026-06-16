# ABC Frog — 변경/완료 이력 (Changelog)

> CLAUDE.md를 가볍게 유지하기 위해, **완료된 작업·옛 버전 기록**은 여기에 보관한다.
> CLAUDE.md엔 "현재 상태(한두 줄) + 살아있는 규칙 + 미완료 TODO"만 남긴다.

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

## 완료된 버그 수정 (2026-06-11 코드점검에서 발견)
- [x] 🔴 `ptg()` 안전장치(`if(!ax)return`) 누락 → 오디오 없는 기기 혀쏘기 먹통 — 수정/배포
- [x] 🟡 튜토리얼 데모 파리 탭 시 "우웩" 오답 (정답글자 미설정) → `oft`에 `gp!=='playing'` 가드 — 수정/배포
- [x] 🟢 퍼즐 화면 즉시 뒤로가기 시 `buildPuzzle` 0.06초 재시도 루프 안 멈춤(배터리) → `'show'` 가드 — 수정/배포
