# Google Flow 개구리 클립 프롬프트 템플릿

ABC Frog 반응 애니메이션용 mp4를 Flow(Veo)로 뽑을 때 쓰는 프롬프트 모음.
배경 제거·투명 변환은 `convert_frog.py`가 처리하므로, **원본이 잘 나오게** 하는 게 목표.

---

## 왜 이 규칙들인가 (작업 중 실제로 겪은 문제)

| 규칙 | 안 지키면 생기는 문제 | 언제 겪었나 |
|---|---|---|
| **카메라 뒤로(zoomed out) + 여백 넉넉히** | 손·발이 프레임 밖으로 나가 잘림 | shakehands_2 |
| **천천히 부드러운 동작** | 빠른 동작에 모션 블러 → 윤곽에 배경색 번져서 못 지움 | handswing(짧은) |
| **정면 유지, 돌지 말 것** | 뒤돌면 뒤통수만 보이고, 회전은 반복재생 불가 | backdance |
| **발밑 그림자 없음** | 배경에 그림자 얼룩 → 개구리에 붙으면 못 지움 | shakehands_1 |
| **완전 단색 배경, 후광(glow) 없음** | 캐릭터 둘레 광채가 남아 분홍 구름처럼 보임 | shakehands_2 |
| **쨍한 마젠타(고채도)** | 배경색이 개구리 입속(연어색)과 가까우면 입에 구멍 뚫림 | jump, legdance |

> 배경색은 스크립트가 자동 감지하므로 정확한 hex를 맞출 필요는 없다.
> 다만 **밝고 쨍한 마젠타일수록** 개구리 색과 멀어져서 키잉이 안전하다.

---

## A. 이번 재촬영 — 손 흔들기 (frog_shakehands 재생성)

**Flow에 참조 이미지(기존 개구리)를 첨부한 뒤 아래 프롬프트 입력:**

```
A cute 2D flat cartoon frog character, identical in design to the reference image,
standing and gently waving one hand in a friendly greeting, facing the camera the whole time.

FRAMING (most important): full body always fully visible. Camera pulled back and zoomed out
so the entire frog — head, both arms, both hands, feet — stays well inside the frame at all times,
with generous empty margin on all four sides. Even when the arm swings wide, the hand must never
touch or cross the edge of the frame. Keep the character centered and small-ish within the shot.

MOTION: slow, smooth, gentle waving. No fast or sudden movements, no spinning, no turning around —
the frog stays facing forward.

BACKGROUND: solid flat magenta (#FF00FF), completely uniform. No gradient, no lighting, no glow,
no drop shadow, no ground shadow under the feet, no sparkles that touch the background edges.

STYLE: clean 2D vector-style illustration, bold dark outlines, matching the reference exactly.
Loopable, 2-3 seconds.
```

**한국어 요지**: 참조 이미지 그대로의 개구리가 정면 보며 한 손을 **천천히 부드럽게** 흔든다.
**카메라를 뒤로 빼서** 온몸·두 손·발이 항상 프레임 안, 사방 여백 넉넉히. 배경은 완전 단색
마젠타(그라데이션·조명·후광·발밑 그림자 전부 없음).

---

## B. 재사용 템플릿 (앞으로 모든 클립)

`{{동작}}` 부분만 바꿔서 쓰면 됨.

```
A cute 2D flat cartoon frog character, identical in design to the reference image,
{{ACTION — e.g. "jumping up and down happily" / "clapping both hands" / "nodding and smiling"}},
facing the camera.

FRAMING (most important): full body always fully visible. Camera zoomed out with generous empty
margin on all four sides, so the entire frog — head, both arms, both hands, feet — never touches
the frame edge, even at the widest point of the motion. Keep the character centered and small
enough that nothing gets cut off.

MOTION: slow, smooth, gentle. No fast/sudden moves, no motion blur, no spinning or turning away
from the camera.

BACKGROUND: solid flat magenta (#FF00FF), perfectly uniform. No gradient, no lighting, no glow,
no shadow of any kind (including under the feet).

STYLE: clean 2D vector illustration, bold dark outlines, exactly matching the reference. 2-3 seconds.
```

### 동작(ACTION) 예시 모음
| 용도 | ACTION 문구 |
|---|---|
| 정답/칭찬 | `raising both arms in a cheer, big happy smile` |
| 축하 | `jumping up and down happily` |
| 인사/대기 | `gently waving one hand, facing forward` |
| 박수 | `clapping both hands together softly` |
| 끄덕임 | `nodding its head and smiling warmly` |

### 체크리스트 (Flow에서 뽑은 뒤)
- [ ] 손·발이 프레임 안에 다 들어왔나 (제일 중요)
- [ ] 동작이 느리고 블러가 없나
- [ ] 정면을 보고 있나 (뒤돌지 않았나)
- [ ] 발밑에 그림자 얼룩이 없나
- [ ] 배경이 균일한 단색인가 (둘레에 후광 없나)

> 워터마크("Veo")는 Flow에서 못 없앰 → 변환 스크립트가 잘라내니 신경 안 써도 됨.
