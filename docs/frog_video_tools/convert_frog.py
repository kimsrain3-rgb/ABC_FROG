"""
마젠타 배경 mp4 -> 투명 WebM 변환기 (ABC Frog 개구리 반응 애니메이션용)

처리 순서
  1) 배경색 자동 감지 : 네 모서리 색의 중앙값. 클립마다 배경색이 달라도 알아서 맞춘다.
  2) 이중 키잉       : '거리'와 '색조' 두 기준 중 더 투명한 쪽을 채택
        - 거리 : 배경색과 얼마나 다른가. 부드러운 외곽선을 만든다.
        - 색조 : 마젠타 계열인가. 배경보다 진한 후광(glow)까지 걷어낸다.
                 단 어둡거나(V<0.55) 흐린(S<0.25) 픽셀에는 적용하지 않는다.
                 안 그러면 개구리의 검은 외곽선·눈동자가 마젠타로 오인돼 깎인다.
  3) 배경색 역산     : 경계에 섞인 배경색을 수식으로 벗겨냄 (자주빛 테두리 제거)
                       F = (C - (1-a)*BG) / a
  4) 얼룩 제거       : 원본 배경에 찍힌 갈색 얼룩만 골라 제거
  5) 핑퐁(선택)      : 앞뒤 왕복. 양끝 중복 프레임을 빼 이음매 없이 반복

문턱값 T1은 '배경 변동'보다 크고 '입속 연어색과 배경의 거리'보다 작아야 한다.
크면 입속에 구멍이 뚫리고, 작으면 테두리에 배경색이 남는다.
"""
import os, shutil, subprocess, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage

FFMPEG = r"C:\Users\USER\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"

T0, T1     = 10., 45.   # 거리 기준: 완전투명 / 완전불투명 문턱
H0, H1     = 14., 26.   # 색조 기준: 배경 색조와의 각도차 (도)
MIN_S      = 0.25       # 이보다 흐리면 색조 판정 안 함
MIN_V      = 0.55       # 이보다 어두우면 색조 판정 안 함 (배경은 밝다)
SMUDGE_LUM = 125.       # 이보다 밝은 조각은 반짝이·효과선으로 보고 유지
THICK_DIV  = 72.        # 얼룩 두께 문턱 = 가로폭 / 이 값
HALO_PX    = 6          # 단단한 부분에서 이만큼 떨어진 반투명은 잔상으로 제거
OUT_W      = 420
CRF        = 34


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg 실패:\n{r.stderr[-1500:]}")


def _hsv(rgb):
    x = rgb / 255.
    mx = x.max(axis=2); mn = x.min(axis=2); df = mx - mn
    h = np.zeros_like(mx); r, g, b = x[..., 0], x[..., 1], x[..., 2]
    m = (mx == r) & (df > 0); h[m] = (60 * ((g - b)[m] / df[m]) + 360) % 360
    m = (mx == g) & (df > 0); h[m] = (60 * ((b - r)[m] / df[m]) + 120)
    m = (mx == b) & (df > 0); h[m] = (60 * ((r - g)[m] / df[m]) + 240)
    s = np.where(mx > 0, df / np.maximum(mx, 1e-6), 0)
    return h, s, mx


def detect_bg(frames):
    """네 모서리 색의 중앙값으로 배경색을 추정."""
    pts = []
    for rgb in frames[:12]:
        pts += [rgb[2, 2], rgb[2, -3], rgb[-3, 2], rgb[-3, -3]]
    bg = np.median(np.array(pts), axis=0)
    h, _, _ = _hsv(bg.reshape(1, 1, 3))
    return bg, float(h[0, 0])


def remove_smudges(rgb, a):
    """원본 배경에 찍힌 얼룩 제거. 개구리 본체가 아니고 + 어둡고 + 두꺼운 조각만."""
    solid = a > 0.5
    lbl, n = ndimage.label(solid)
    if n > 1:
        sizes = ndimage.sum(solid, lbl, range(1, n + 1))
        thick_min = rgb.shape[1] / THICK_DIV
        keep = np.ones(n + 1, bool)
        body = int(np.argmax(sizes)) + 1
        for i in range(1, n + 1):
            if i == body or rgb[lbl == i].mean() > SMUDGE_LUM:
                continue                                   # 본체거나 밝음 -> 유지
            if ndimage.distance_transform_edt(lbl == i).max() <= thick_min:
                continue                                   # 얇음 = 움직임 표현선 -> 유지
            keep[i] = False
        a = np.where(keep[lbl], a, 0.)
    near = ndimage.binary_dilation(a > 0.5, iterations=HALO_PX)
    return np.where((a < 0.5) & ~near, 0., a)


def key_and_despill(rgb, bg, bgh):
    d = np.sqrt(((rgb - bg) ** 2).sum(axis=2))
    a_dist = np.clip((d - T0) / (T1 - T0), 0, 1)

    h, s, v = _hsv(rgb)
    hd = np.abs((h - bgh + 180) % 360 - 180)               # 배경 색조와의 각도차
    a_hue = np.clip((hd - H0) / (H1 - H0), 0, 1)
    a_hue = np.where((s < MIN_S) | (v < MIN_V), 1.0, a_hue)

    a = remove_smudges(rgb, np.minimum(a_dist, a_hue))
    A = a[..., None]
    F = np.where(A > 0.02, (rgb - (1 - A) * bg) / np.maximum(A, 0.02), rgb)
    return np.clip(F, 0, 255), a


def convert(src, dst, pingpong=False, ss=None, t=None):
    """원본 프레임 비율 그대로 배경만 제거한다 (크롭 없음).

    화면 비율은 게임에서 개구리만 얹으므로 필요 없고, 좌우를 자르면 손이 잘리므로
    아무 크롭도 하지 않는다. 워터마크("Veo")는 배경과 비슷한 반투명 마젠타라
    배경 제거만으로 함께 사라지므로 별도 처리 불필요.
    """
    tmp = tempfile.mkdtemp(prefix="frogconv_")
    try:
        cut = []
        if ss is not None: cut += ["-ss", str(ss)]
        if t  is not None: cut += ["-t",  str(t)]
        run([FFMPEG, "-y", "-v", "error", *cut, "-i", src,
             "-f", "image2", os.path.join(tmp, "s%04d.png")])
        srcs = sorted(f for f in os.listdir(tmp) if f.startswith("s"))
        if not srcs:
            raise RuntimeError("프레임 추출 실패")

        raw = [np.array(Image.open(os.path.join(tmp, f)).convert("RGB")).astype(float) for f in srcs]
        bg, bgh = detect_bg(raw)

        frames = []
        for i, rgb in enumerate(raw):
            F, a = key_and_despill(rgb, bg, bgh)   # 원본 프레임 그대로, 크롭 없음
            out = os.path.join(tmp, f"k{i:04d}.png")
            Image.fromarray(np.dstack([F, a * 255]).astype(np.uint8), "RGBA").save(out)
            frames.append(out)

        # 핑퐁: 0..N-1 간 뒤 N-2..1 로 복귀 (양끝 중복 제거 -> 반복해도 이음매 없음)
        order = frames + frames[-2:0:-1] if pingpong else frames
        seq = os.path.join(tmp, "seq"); os.makedirs(seq)
        for i, p in enumerate(order):
            shutil.copy(p, os.path.join(seq, f"f{i:04d}.png"))

        # -2 -> 짝수로 맞춤. 원본 비율 유지, 가로만 OUT_W로 축소(세로 자동)
        run([FFMPEG, "-y", "-v", "error", "-framerate", "24",
             "-i", os.path.join(seq, "f%04d.png"),
             "-vf", f"scale={OUT_W}:-2,format=yuva420p",
             "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0",
             "-b:v", "0", "-crf", str(CRF), "-row-mt", "1", dst])
        return len(order), tuple(int(v) for v in bg)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    V   = r"D:\1Game_projec\ABC_FROG\assets\frog\videos"
    OUT = r"D:\1Game_projec\_frog_preview"
    SRC8 = r"C:\Users\USER\Downloads\개구리_춤추는_장면_영상_202607201458.mp4"

    # 뒤돌아 춤: 원본 8초 영상의 3.70~5.55초. 회전 동작이라 핑퐁 불가(순방향만).
    n, bg = convert(SRC8, os.path.join(OUT, "frog_backdance_long_fwd.webm"),
                    ss=3.70, t=1.85)
    print(f"frog_backdance_long_fwd  {n}프레임  배경{bg}")

    # 나머지: 각자 mp4 원본 비율 그대로. 크롭 없음 → 손 안 잘림.
    for name in ["frog_jump_1", "frog_legdance_1", "frog_singleleg_1", "frog_shakehands_2"]:
        mp4 = os.path.join(V, name + ".mp4")
        a, bg = convert(mp4, os.path.join(OUT, name + "_fwd.webm"))
        b, _  = convert(mp4, os.path.join(OUT, name + "_pingpong.webm"), pingpong=True)
        print(f"{name}  순방향 {a}프레임 / 핑퐁 {b}프레임  배경{bg}")
