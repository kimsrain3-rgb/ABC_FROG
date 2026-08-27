#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ABC Frog — 첫 화면 + 파리잡기를 앱 안에 담는다 (B-3)
#
# 무엇을 하나: 저장소의 웹 파일 중 "첫 화면 + 파리잡기"에 필요한 것만
#   twa-project/app/src/main/assets/web/ 아래로 같은 경로 모양 그대로 복사한다.
#   앱이 켜지면 MainActivity 의 shouldInterceptRequest 가 이 사본을 먼저 쓴다.
#
# 왜 스크립트인가: 손으로 복사하면 무엇이 들어갔는지 아무도 모르게 된다.
#   그림이나 소리를 바꾼 뒤 이 스크립트만 다시 돌리면 앱 사본이 최신이 된다.
#
# ⚠ 이 스크립트는 앱 사본만 갱신한다. 실제 유저에게 가려면 그 다음
#   versionCode 를 올려 AAB 를 새로 빌드하고 심사를 받아야 한다.
#
# 쓰는 법:  bash twa-project/bake-web-assets.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")/.."          # 저장소 루트로
DEST="twa-project/app/src/main/assets/web"

rm -rf "$DEST"
mkdir -p "$DEST"

copy() {                          # copy <상대경로>
  local f="$1"
  [ -f "$f" ] || { echo "  ⚠ 없음(건너뜀): $f"; return 0; }
  mkdir -p "$DEST/$(dirname "$f")"
  cp "$f" "$DEST/$f"
}

echo "── 코드 6개 + manifest ──"
# ⚠ video-prefetch.js 는 index.html 이 안 읽는다(퍼즐·파닉스 전용) → 넣지 않는다.
for f in index.html script.js style.css error-tracker.js frog-reactions.js video-quality.js manifest.json; do copy "$f"; done

echo "── 그림 (webp 만. 원본 png 는 코드가 안 부른다) ──"
for f in assets/frog/images/*.webp assets/bugs/images/*.webp assets/ui/images/*.webp; do copy "$f"; done

echo "── 아이콘 (게임 화면이 실제로 부르는 3개만. 앱/스토어 아이콘은 제외) ──"
copy assets/ui/icons/back_arrow_gold.png      # 뒤로가기 버튼 (style.css)
copy assets/ui/icons/dino_silhouette.png      # 공룡 카드 실루엣 (style.css)
copy assets/ui/icons/insect_silhouette.svg    # Insect 카드 (index.html·script.js)
copy assets/fruit/images/fruit_apple_icon.png # 시작화면 Word 버튼 아이콘 — 첫 화면 필수

echo "── 소리 ──"
for f in assets/abc/sounds/*.mp3; do copy "$f"; done            # 글자 이름 26개
for f in assets/game/sounds/*.mp3; do copy "$f"; done           # 배경음악 + 칭찬 말소리
for f in assets/bugs/sounds/*.mp3; do copy "$f"; done           # 파리 날갯소리·나비 목소리 (파리잡기 필수)
copy assets/frog/sounds/frog_tongue.mp3                          # 혀
copy assets/frog/sounds/alphabet_sparkle.mp3                     # 정답 반짝임

# ⛔ 일부러 안 넣는 것
#   · 영상 전부(assets/frog/videos, assets/*/videos*) — 개구리 반응 클립·엔딩 축하 영상
#   · 퍼즐(과일·동물·공룡) 그림/소리, animal.html, dino.html
#   · 파닉스 전부 — 세트 2·3·4 를 앞으로 만들 예정이라 지금 담으면 구조가 엇갈린다
#   · assets/_original, 원본 png, test/

echo "── 캐시 번호 목록(BAKED.txt) ──"
# ⭐ 이 파일이 "앱에 넣은 사본이 낡았는지"를 판단하는 근거다.
#   코드가 `bgm.mp3?v=20260827` 처럼 캐시 번호를 붙여 부르는 에셋은,
#   앱에 담을 당시의 번호를 여기 적어 둔다.
#   나중에 웹에서 파일을 갈아끼우고 번호를 올리면(?v=20260901) 번호가 안 맞으므로
#   앱은 자기 사본을 버리고 인터넷 것을 받는다. → 캐시 번호가 곧 비상 스위치다.
: > "$DEST/BAKED.txt"
while read -r line; do
  p="${line%%\?v=*}"; v="${line##*\?v=}"
  [ -f "$DEST/$p" ] && echo "$p v=$v" >> "$DEST/BAKED.txt"
done < <(grep -rhoE "assets/[A-Za-z0-9_/.-]+\?v=[0-9]+" \
          index.html script.js style.css frog-reactions.js error-tracker.js video-quality.js \
         | sort -u)
sort -u -o "$DEST/BAKED.txt" "$DEST/BAKED.txt"
sed 's/^/  /' "$DEST/BAKED.txt"

echo
echo "── 결과 ──"
find "$DEST" -type f | wc -l | xargs printf "파일 %s개\n"
du -sb "$DEST" | awk '{printf "합계 %.1f KB (%.2f MB)\n", $1/1024, $1/1048576}'
