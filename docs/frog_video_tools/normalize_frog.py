"""
5개 클립의 개구리 '몸 크기'를 똑같이 맞추고 같은 크기 캔버스로 정규화한다.
- 개구리 배(크림색 몸통) 너비를 기준으로 배율을 정함 (팔 자세에 안 흔들림)
- 크롭 없음: 축소+투명여백(패딩)만 → 손이 추가로 잘리지 않음
- 모든 클립이 같은 캔버스 크기 → 게임에서 하나의 박스에 그대로 얹으면 크기 일치

TARGET_BELLY: 목표 배 너비(px). 만세/다리/한발(기존 ~113px)에 맞춤.
"""
import os, shutil, subprocess, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage
from convert_frog import FFMPEG, OUT_W, CRF, detect_bg, key_and_despill

TARGET_BELLY = 113.0
MARGIN       = 1.10     # 캔버스에 10% 여백
V    = r"D:\1Game_projec\ABC_FROG\assets\frog\videos"
OUT  = r"D:\1Game_projec\_frog_preview"
SRC8 = r"C:\Users\USER\Downloads\개구리_춤추는_장면_영상_202607201458.mp4"


def run(a):
    r = subprocess.run(a, capture_output=True, text=True)
    if r.returncode: raise RuntimeError(r.stderr[-1500:])


def belly_width(rgb):
    m = (rgb[..., 0] > 200) & (rgb[..., 1] > 215) & (rgb[..., 2] > 170) & (rgb[..., 2] < 240)
    lbl, n = ndimage.label(m)
    if n == 0: return None
    sz = ndimage.sum(m, lbl, range(1, n + 1)); i = int(np.argmax(sz)) + 1
    if sz[i - 1] < rgb.shape[0] * rgb.shape[1] * 0.004: return None
    xs = np.where(lbl == i)[1]
    return xs.max() - xs.min()


def key_clip(src, cut, cache):
    """모든 프레임을 키잉해 RGBA PNG로 캐시. (belly_median, content_bbox, [png경로]) 반환."""
    os.makedirs(cache, exist_ok=True)
    tmp = tempfile.mkdtemp()
    run([FFMPEG, "-y", "-v", "error", *cut, "-i", src, "-f", "image2", os.path.join(tmp, "%04d.png")])
    fs = sorted(os.listdir(tmp))
    raw = [np.array(Image.open(os.path.join(tmp, f)).convert("RGB")).astype(float) for f in fs]
    bg, bgh = detect_bg(raw)
    bellies = []; L = T = 10**9; R = B = 0; paths = []
    for i, rgb in enumerate(raw):
        F, a = key_and_despill(rgb, bg, bgh)
        bw = belly_width(rgb)
        if bw: bellies.append(bw)
        bb = Image.fromarray((a * 255).astype(np.uint8)).point(lambda v: 255 if v > 40 else 0).getbbox()
        if bb: L=min(L,bb[0]); T=min(T,bb[1]); R=max(R,bb[2]); B=max(B,bb[3])
        p = os.path.join(cache, f"{i:04d}.png")
        Image.fromarray(np.dstack([F, a * 255]).astype(np.uint8), "RGBA").save(p)
        paths.append(p)
    shutil.rmtree(tmp, ignore_errors=True)
    # 중앙값이 아니라 85%값: 뒤돌아춤처럼 몸을 돌려 배가 좁아지는 프레임에
    # 중앙값이 끌려내려가 과대 확대되는 것을 막는다 (정면일 때의 실제 배 크기 반영).
    return float(np.percentile(bellies, 85)), (L, T, R, B), paths


CLIPS = [  # (이름, 소스, ffmpeg컷, 핑퐁여부)
    ("frog_backdance_long", SRC8, ["-ss", "3.70", "-t", "1.85"], False),
    ("frog_jump_1",       os.path.join(V, "frog_jump_1.mp4"), [], True),
    ("frog_legdance_1",   os.path.join(V, "frog_legdance_1.mp4"), [], True),
    ("frog_singleleg_1",  os.path.join(V, "frog_singleleg_1.mp4"), [], True),
    ("frog_shakehands_2", os.path.join(V, "frog_shakehands_2.mp4"), [], True),
]

if __name__ == "__main__":
    root = tempfile.mkdtemp(prefix="frognorm_")
    try:
        # --- Pass 1: 키잉 + 배 너비/내용 bbox 측정 ---
        meta = {}
        for name, src, cut, pp in CLIPS:
            belly, bbox, paths = key_clip(src, cut, os.path.join(root, name))
            scale = TARGET_BELLY / belly
            L, T, R, B = bbox
            meta[name] = dict(scale=scale, sw=(R - L) * scale, sh=(B - T) * scale, paths=paths, pp=pp)
            print(f"[측정] {name}: 배{belly:.0f}px 배율{scale:.3f} 스케일후내용 {(R-L)*scale:.0f}x{(B-T)*scale:.0f}")

        # --- 공통 캔버스 = 스케일 후 최대 내용 + 여백 (짝수) ---
        CW = int(max(m["sw"] for m in meta.values()) * MARGIN) // 2 * 2
        CH = int(max(m["sh"] for m in meta.values()) * MARGIN) // 2 * 2
        print(f"\n[캔버스] {CW}x{CH} (모든 클립 공통)\n")

        # --- Pass 2: 스케일 + 중앙 배치 + 인코딩 ---
        for name, src, cut, pp in CLIPS:
            m = meta[name]; s = m["scale"]
            seqdir = os.path.join(root, name + "_seq"); os.makedirs(seqdir)
            rendered = []
            for i, p in enumerate(m["paths"]):
                im = Image.open(p)
                im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
                canvas = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
                canvas.alpha_composite(im, ((CW - im.width) // 2, (CH - im.height) // 2))
                op = os.path.join(seqdir, f"r{i:04d}.png"); canvas.save(op); rendered.append(op)

            def encode(order, dst):
                enc = os.path.join(root, "enc"); shutil.rmtree(enc, ignore_errors=True); os.makedirs(enc)
                for j, q in enumerate(order): shutil.copy(q, os.path.join(enc, f"f{j:04d}.png"))
                run([FFMPEG, "-y", "-v", "error", "-framerate", "24", "-i", os.path.join(enc, "f%04d.png"),
                     "-vf", f"scale={OUT_W}:-2,format=yuva420p", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
                     "-auto-alt-ref", "0", "-b:v", "0", "-crf", str(CRF), "-row-mt", "1", dst])

            encode(rendered, os.path.join(OUT, name + "_fwd.webm"))
            msg = f"{name}  순방향 {len(rendered)}"
            if pp:
                order = rendered + rendered[-2:0:-1]
                encode(order, os.path.join(OUT, name + "_pingpong.webm"))
                msg += f" / 핑퐁 {len(order)}"
            print(msg + "프레임")
    finally:
        shutil.rmtree(root, ignore_errors=True)
