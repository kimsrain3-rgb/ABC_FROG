/* =====================================================================
   ABC Frog — 개구리 반응 클립 애드온 (★ 테스트 전용, 라이브 미반영)
   - script.js 뒤에 로드. 라이브 script.js는 손대지 않고 전역 함수만 후킹.
   - 정답 파리 먹음(occ) → 5개 동작 중 랜덤 하나 (콤보/빙고 구분 없음)
   - 시작화면 → 손 흔들기 인사
   - 재생 중 기존 개구리 이미지는 숨기고, 끝나면 복귀. 게임(파리)은 안 멈춤.

   정렬: 클립 개구리의 '발/중심'을 게임 개구리의 '발/중심'에 맞춤(연잎 위 정위치).
   빈틈 방지: 클립 첫 프레임이 실제로 뜬 뒤에 기존 개구리를 숨김.
   ===================================================================== */
(function(){
  'use strict';
  var VID_BASE='assets/frog/videos/';
  // 정답 맞출 때마다 아래 5개 중 랜덤 하나 (콤보/빙고 구분 없음)
  var CLIPS=[
    'frog_jump_1_fwd',        // 만세 점프
    'frog_legdance_1_fwd',    // 다리 춤
    'frog_singleleg_1_fwd',   // 한발 춤
    'frog_backdance_long_fwd',// 뒤돌아 춤
    'frog_shakehands_2_fwd'   // 손 흔들기
  ];
  var GREET='frog_shakehands_2_fwd';
  var BODY_FRAC=0.62;          // 표시 크기(클립 세로 중 개구리 몸 비율) — 기존 유지
  var ASPECT=420/578;

  var vid=null, playing=false;
  var vbbCache={};             // 클립별 개구리 bbox(비율) 캐시
  var imgbbCache={};           // 게임 개구리 PNG bbox(비율) 캐시

  function ensureVid(){
    if(vid) return vid;
    vid=document.createElement('video');
    vid.id='frogReactVid';
    vid.muted=true; vid.defaultMuted=true;
    vid.setAttribute('playsinline',''); vid.setAttribute('muted','');
    vid.playsInline=true; vid.preload='auto';
    // z-index 200: 시작화면(.ss=100)·개구리 위. pointer-events:none로 탭 통과(파리 계속 잡힘).
    vid.style.cssText='position:absolute;z-index:200;pointer-events:none;display:none;opacity:0';
    (document.getElementById('gc')||document.body).appendChild(vid);
    return vid;
  }

  // 이미지/비디오의 불투명(개구리) 영역 bbox를 비율로 (cxFrac=가로중심, feetFrac=바닥)
  function opaqueBBox(el, w, h){
    try{
      var sw=80, sh=Math.max(1,Math.round(80*h/w));
      var c=document.createElement('canvas'); c.width=sw; c.height=sh;
      var g=c.getContext('2d'); g.drawImage(el,0,0,sw,sh);
      var d=g.getImageData(0,0,sw,sh).data;
      var minx=sw,miny=sh,maxx=0,maxy=0,f=false;
      for(var y=0;y<sh;y++)for(var x=0;x<sw;x++){
        if(d[(y*sw+x)*4+3]>40){ f=true; if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; }
      }
      if(!f) return null;
      return { cxFrac:(minx+maxx+1)/2/sw, feetFrac:(maxy+1)/sh };
    }catch(e){ return null; }
  }

  // 클립 개구리를 alignEl(게임 개구리) 발/중심에 맞춰 배치
  function place(alignEl, vbb){
    var gc=document.getElementById('gc'); var gr=gc.getBoundingClientRect();
    var r=alignEl.getBoundingClientRect();
    var H=r.height/BODY_FRAC, W=H*ASPECT;
    // 게임 개구리 PNG의 발/중심(비율) — 없으면 중앙/바닥 가정
    var gbb=null;
    if(alignEl.naturalWidth){
      var k='img:'+alignEl.src;
      if(!(k in imgbbCache)) imgbbCache[k]=opaqueBBox(alignEl, alignEl.naturalWidth, alignEl.naturalHeight);
      gbb=imgbbCache[k];
    }
    var gCx    = r.left + (gbb?gbb.cxFrac:0.5)  * r.width;
    var gFeetY = r.top  + (gbb?gbb.feetFrac:1.0) * r.height;
    var vCx    = vbb?vbb.cxFrac:0.5;
    var vFeet  = vbb?vbb.feetFrac:0.86;
    vid.style.width=W+'px'; vid.style.height=H+'px';
    vid.style.left=(gCx-gr.left - vCx*W)+'px';   // 가로중심 정렬
    vid.style.top =(gFeetY-gr.top - vFeet*H)+'px'; // 발 정렬(연잎 위)
  }

  // clip 재생. alignEl=정렬기준(게임 개구리 img), hideEl=숨길 요소(#frog), game=숨쉬기 제어
  function reaction(clip, alignEl, hideEl, game){
    if(!alignEl||!hideEl) return;
    ensureVid();
    playing=true;
    vid.style.opacity='0'; vid.style.display='block';
    var swapped=false, restored=false;
    function swapIn(){                 // 클립이 뜬 뒤 실행 → 그 다음 기존 개구리 숨김(빈틈 없음)
      if(swapped||restored) return; swapped=true;
      var vbb=vbbCache[clip];
      if(!vbb){ vbb=opaqueBBox(vid, vid.videoWidth||420, vid.videoHeight||578); if(vbb) vbbCache[clip]=vbb; }
      place(alignEl, vbb);
      vid.style.opacity='1';
      hideEl.style.visibility='hidden';
      if(game && typeof pauseAnim==='function'){ try{ pauseAnim(); }catch(e){} }
    }
    function restore(){
      if(restored) return; restored=true;
      try{ vid.pause(); }catch(e){}
      vid.style.display='none'; vid.style.opacity='0';
      vid.removeAttribute('src'); try{ vid.load(); }catch(e){}
      hideEl.style.visibility='';
      if(game && typeof resumeAnim==='function'){ try{ resumeAnim(); }catch(e){} }
      playing=false;
    }
    // 첫 프레임이 실제로 그려지면 swapIn (빈틈 방지)
    if(vid.requestVideoFrameCallback){ vid.requestVideoFrameCallback(function(){ swapIn(); }); }
    else { vid.addEventListener('playing', function(){ setTimeout(swapIn,60); }, {once:true}); }
    var guard=setTimeout(restore, 8000);
    vid.onended=function(){ clearTimeout(guard); restore(); };
    vid.onerror=function(){ clearTimeout(guard); restore(); };
    vid.src=VID_BASE+clip+'.webm';
    try{ vid.currentTime=0; }catch(e){}
    var p=vid.play(); if(p&&p.catch) p.catch(function(){ clearTimeout(guard); restore(); });
  }

  function gameFrogImg(){
    return document.querySelector('#frog .frog-img.active') || document.getElementById('frog');
  }

  // ---- 정답 후킹 (occ 래핑): 맞출 때마다 5개 중 랜덤 ----
  if(typeof occ==='function'){
    var _occ=occ;
    window.occ=function(f){
      _occ(f);                                   // 원래 로직(점수·콤보·입벌림) 먼저
      try{
        if(playing) return;                      // 재생 중이면 겹치지 않게 무시
        var clip=CLIPS[Math.floor(Math.random()*CLIPS.length)];
        reaction(clip, gameFrogImg(), document.getElementById('frog'), true);
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
      reaction(GREET, sf, sf, false);
    }catch(e){ console.warn('[frogreact] greet',e); }
  }
  if(document.readyState==='complete') setTimeout(greet,600);
  else window.addEventListener('load',function(){ setTimeout(greet,600); });

  // 디버그(콘솔에서 위치/크기 미세조정)
  window.__frogreact={
    playGame:function(name){ reaction(name||CLIPS[0], gameFrogImg(), document.getElementById('frog'), true); },
    playGreet:function(){ var sf=document.querySelector('.ss .sf'); reaction(GREET, sf, sf, false); },
    set:function(bodyFrac){ if(bodyFrac)BODY_FRAC=bodyFrac; },
    clips:CLIPS
  };
})();
