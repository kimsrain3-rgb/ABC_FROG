/* =====================================================================
   ABC Frog — 개구리 반응 클립 애드온 (★ 테스트 전용, 라이브 미반영)
   - script.js 뒤에 로드된다. 라이브 script.js는 손대지 않고 전역 함수만 후킹.
   - 정답 파리 먹음(occ) → 만세/다리/한발 중 랜덤 재생
   - 콤보 터짐(cm>=3, BINGO) → 뒤돌아 춤
   - 시작화면 → 손 흔들기 인사
   - 재생 중 기존 개구리 이미지는 숨기고, 끝나면 복귀. 게임(파리)은 안 멈춤.
   ===================================================================== */
(function(){
  'use strict';
  var VID_BASE='assets/frog/videos/';
  var CLIPS={
    correct:['frog_jump_1_fwd','frog_legdance_1_fwd','frog_singleleg_1_fwd'],
    combo:'frog_backdance_long_fwd',
    greet:'frog_shakehands_2_fwd'
  };
  // ▼ 위치/크기 보정값 (개구리를 기존 개구리와 비슷하게 맞추는 값 — 필요시 조정)
  var BODY_FRAC=0.62;   // 클립 캔버스 세로 중 개구리 몸이 차지하는 비율(작을수록 크게 표시)
  var Y_OFFSET =0.02;   // 세로 미세조정(비디오 높이 대비, +면 아래로)
  var ASPECT   =420/578;

  var vid=null, playing=false;

  function ensureVid(){
    if(vid) return vid;
    vid=document.createElement('video');
    vid.id='frogReactVid';
    vid.muted=true; vid.defaultMuted=true;
    vid.setAttribute('playsinline',''); vid.setAttribute('muted','');
    vid.playsInline=true; vid.preload='auto';
    // z-index 200: 시작화면(.ss=100)·개구리보다 위. pointer-events:none로 탭은 통과(파리 계속 잡힘).
    vid.style.cssText='position:absolute;z-index:200;pointer-events:none;display:none';
    var gc=document.getElementById('gc')||document.body;
    gc.appendChild(vid);
    return vid;
  }

  // 개구리 요소(el) 위에, 개구리 크기에 맞춰 비디오 배치
  function positionOver(el){
    var gc=document.getElementById('gc')||document.body;
    var r=el.getBoundingClientRect(), gr=gc.getBoundingClientRect();
    var H=r.height/BODY_FRAC;      // 캔버스 여백 보정 → 표시 높이
    var W=H*ASPECT;
    var cx=r.left-gr.left+r.width/2;
    var cy=r.top -gr.top +r.height/2;
    vid.style.width=W+'px'; vid.style.height=H+'px';
    vid.style.left=(cx-W/2)+'px';
    vid.style.top =(cy-H/2+Y_OFFSET*H)+'px';
  }

  // clip 재생. target=얹을 개구리 요소. game=true면 게임 개구리 숨쉬기 정지/복구.
  function playReaction(clip, target, game){
    if(!target) return;
    ensureVid();
    positionOver(target);
    var prevVis=target.style.visibility;
    var restored=false;
    function restore(){
      if(restored) return; restored=true;
      try{ vid.pause(); }catch(e){}
      vid.style.display='none';
      vid.removeAttribute('src'); try{ vid.load(); }catch(e){}
      target.style.visibility=prevVis;
      if(game && typeof resumeAnim==='function'){ try{ resumeAnim(); }catch(e){} }
      playing=false;
    }
    playing=true;
    target.style.visibility='hidden';            // 기존 개구리 숨김
    if(game && typeof pauseAnim==='function'){ try{ pauseAnim(); }catch(e){} }
    vid.src=VID_BASE+clip+'.webm';
    vid.style.display='block';
    var guard=setTimeout(restore,7000);          // ended 누락 대비 안전복구
    vid.onended=function(){ clearTimeout(guard); restore(); };
    vid.onerror=function(){ clearTimeout(guard); restore(); };
    try{ vid.currentTime=0; }catch(e){}
    var p=vid.play();
    if(p&&p.catch) p.catch(function(){ clearTimeout(guard); restore(); });
  }

  // ---- 정답/콤보 후킹 (occ 래핑) ----
  if(typeof occ==='function'){
    var _occ=occ;
    window.occ=function(f){
      _occ(f);                                   // 원래 로직(점수·콤보·입벌림) 먼저
      try{
        if(playing) return;                      // 재생 중이면 겹치지 않게 무시
        var clip=(typeof cm!=='undefined'&&cm>=3)
          ? CLIPS.combo                          // 콤보 터짐 → 뒤돌아 춤
          : CLIPS.correct[Math.floor(Math.random()*CLIPS.correct.length)];
        playReaction(clip, document.getElementById('frog'), true);
      }catch(e){ console.warn('[frogreact] occ hook',e); }
    };
  }

  // ---- 시작화면 인사 (손 흔들기) ----
  function greet(){
    try{
      var ss=document.getElementById('ss');
      var sf=document.querySelector('.ss .sf');
      if(!ss||!sf) return;
      if(getComputedStyle(ss).display==='none') return;  // 시작화면일 때만
      playReaction(CLIPS.greet, sf, false);
    }catch(e){ console.warn('[frogreact] greet',e); }
  }
  if(document.readyState==='complete') setTimeout(greet,600);
  else window.addEventListener('load',function(){ setTimeout(greet,600); });

  // 디버그용 전역(테스트에서 콘솔로 위치 미세조정 가능)
  window.__frogreact={
    play:function(name,game){ playReaction(name, document.getElementById(game===false?null:'frog')||document.querySelector('.ss .sf'), game!==false); },
    set:function(bodyFrac,yOff){ if(bodyFrac)BODY_FRAC=bodyFrac; if(yOff!=null)Y_OFFSET=yOff; },
    clips:CLIPS
  };
})();
