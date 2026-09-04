/* ═══════════════════════════════════════════════════════════════════════════
   파닉스 세트 데이터 — 단어 목록만 들어 있는 파일 (2026-09-04 신설)

   ★ 왜 파일을 나눴나
     세트가 4개로 예정돼 있는데(script.js 의 PH_SETS) 게임 로직과 단어 목록이
     phonics/index.html 한 파일에 섞여 있었다. 그대로 복사하면 게임이 네 벌이 되고
     한 곳을 고칠 때마다 네 번 고쳐야 한다. 동물·공룡 퍼즐이 두 벌로 갈라진 뒤
     과일에 있던 onerror·img_ms·word 가 양쪽 다 빠진 게 그 결과다.
     → 게임은 한 벌, 이 파일의 데이터만 갈아끼운다.

   ★ 이 파일에 넣어도 되는 것 = 객체 선언뿐.
     함수·DOM 조작·소리 재생을 여기 넣지 말 것. 넣는 순간 다시 로직이 섞인다.

   ★ 항목 뜻
     id      … GA4 로 나가는 세트 이름. 보고서에서 세트를 가르는 값이라 바꾸면 통계가 끊긴다
     letters … 그 세트가 다루는 음가(지금은 기록용. 화면 표시는 script.js 의 PH_SETS 가 한다)
     words   … 순서가 곧 진도다. 순서를 바꾸면 GA4 의 word_index 뜻도 같이 바뀐다
       word   … 화면에 뜨는 단어 + 소리·영상 파일명의 앞부분 (word_mat.mp3 / mat_dog.mp4)
       tokens … 글자를 몇 덩어리로 쪼갤지. 없으면 한 글자씩(word.split(''))으로 자동 처리.
                3세트의 ck 처럼 '두 글자가 한 소리'인 경우를 위해 열어 둔 자리다.
                ⚠️ 문자열 배열로 충분하다. 객체형으로 만들지 말 것
       traps  … 함정 글자(정답에 없는 조각). 지금은 전부 비어 있다
       videos … 완성 영상. 파일명 = 단어_이것.mp4 (예: mat_dog.mp4). **배열 순서대로** 재생한다.
                없는 영상은 조용히 건너뛴다 → 에셋이 아직이어도 안전하다
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';
window.PHONICS_SETS = {

  /* ── 세트 1 : s a t p i n ── 2026-08-12 라이브 공개. 아래 6개는 옛 WORDS 배열을
       순서·내용 그대로 옮긴 것이다(주석 포함). 한 글자도 바꾸지 않았다. ── */
  1: {
    id: 'satpin',
    letters: ['s','a','t','p','i','n'],
    words: [
      // sit — 2026-08-10 에 sat 에서 바꿈. sat 은 과거형이라 3~7세에 안 맞는다.
      //   "앉아 있는" 영상은 sit 에도 그대로 맞으므로 영상 3편은 파일명만 바꿔 재활용(sat_* → sit_*).
      //   음가도 s·a·t → s·i·t 로 바뀐다(phoneme_i.mp3 는 이미 있던 satpin 6종에 포함).
      {word:'sit', traps:[], videos:['dog','cat','raccoon']},
      {word:'pat', traps:[], videos:['dog','rabbit','mother_kid']},
      {word:'nap', traps:[], videos:['owl','sloth','baby']},      // pat 과 같은 짜임 — 동물 둘 먼저, 사람(아기)으로 마무리
      // pan 은 '사물'이라 앞 세 단어(동작)와 짜임이 다르다. 사물을 먼저 딱 보여줘 뜻을 심고(pan_pan),
      // 그 다음 쓰는 장면 둘로 활기차게 마무리. pan_pan 은 거의 정지 화면이라 끝에 두면 밋밋해진다.
      {word:'pan', traps:[], videos:['pan','rabbit','cat']},
      // sip — 아기 동물들이 머그컵으로 마시는 장면. 작은→큰 순서로, 가장 친숙한 북극곰으로 마무리.
      // ⚠️ 이 3편은 **그림체가 앞 네 단어(수채화 그림책풍)와 다르다**(3D 렌더). 사장님 확인 대기 중.
      {word:'sip', traps:[], videos:['harpseal','penguin','polarbear']},
      // tap — 재생 순서는 **이 배열 순서**다(파일명 가나다순 아님). 사장님 지시 순서: 토끼(도입) → 고양이 → 강아지.
      //   토끼가 책상 앞에서 조용히 시작해 뜻을 심고, 그 뒤 "자는 아기를 톡톡 깨우는" 같은 짜임 둘로 마무리.
      //   (pan 과 같은 원리 — 조용한 도입 먼저, 활기찬 장면으로 끝냄)
      {word:'tap', traps:[], videos:['rabbit','cat','dog']}
    ]
  },

  /* ── 세트 2 : m d g o c k ── 준비 중. **아직 잠겨 있다**(script.js 의 PH_SETS 2번 open:false).
       ⚠️ 영상이 있는 단어는 지금 mat 하나뿐이다. 나머지 다섯은 videos 를 빈 배열로 뒀다 —
          코드가 없는 영상을 건너뛰므로 글자 맞추기·음가·통발음까지는 그대로 돌아가고,
          영상만 안 나온 채 다음 단어로 넘어간다.
       ⚠️ 단어를 열려면 단어마다 **통발음(word_*.mp3) + 보상 영상 3편**이 필요하다.
          지금 있는 것: word_mat.mp3 / mat_mat.mp4 · mat_dog.mp4 · mat_kid.mp4
       ⚠️ 새 영상을 넣으면 화질 티어 2벌(videos_650/ · videos_400/)도 같이 만들 것 — 안 그러면
          느린 회선에서 원본이 그대로 나가 무거워진다(CLAUDE.md C-2 항목). ── */
  2: {
    id: 'set2',
    letters: ['m','d','g','o','c','k'],
    words: [
      {word:'mat', tokens:['m','a','t'], traps:[], videos:['mat','dog','kid']},
      {word:'dog', tokens:['d','o','g'], traps:[], videos:[]},
      {word:'cat', tokens:['c','a','t'], traps:[], videos:[]},
      {word:'mop', tokens:['m','o','p'], traps:[], videos:[]},
      {word:'dig', tokens:['d','i','g'], traps:[], videos:[]},
      {word:'kid', tokens:['k','i','d'], traps:[], videos:[]}
    ]
  }

};
