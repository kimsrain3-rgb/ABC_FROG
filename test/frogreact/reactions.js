/* =====================================================================
   ABC Frog — 개구리 반응 클립 애드온 (★ 테스트 전용, 라이브 미반영)
   - script.js 뒤에 로드. 라이브 script.js는 손대지 않고 전역 함수만 후킹.
   - 정답 파리 먹음(occ) → 5개 동작 중 랜덤 하나 (콤보/빙고 구분 없음)
   - 시작화면 → 손 흔들기 인사 (앱 켜질 때 딱 1번, 화면 바뀌면 즉시 정지)
   - 재생 중 기존 개구리 이미지는 숨기고, 끝나면 복귀. 게임(파리)은 안 멈춤.

   ★ 안전 원칙: 반응 클립이 어떤 이유로 실패/정지하더라도, 화면에서 개구리가
   아예 사라지는 상황은 절대 없게 한다. (감시 타이머가 항상 앉은 개구리를 되살림)
   ===================================================================== */
(function(){
  'use strict';
  var VID_BASE='assets/frog/videos/';
  var CLIPS=[
    'frog_jump_1_fwd',        // 만세 점프
    'frog_legdance_1_fwd',    // 다리 춤
    'frog_singleleg_1_fwd',   // 한발 춤
    'frog_backdance_long_fwd',// 뒤돌아 춤
    'frog_shakehands_2_fwd'   // 손 흔들기
  ];
  var GREET='frog_shakehands_2_fwd';
  var BODY_FRAC=0.62;
  var ASPECT=420/578;

  var vid=null;
  var playing=false;
  var tok=0;               // 재생 토큰: stale 콜백 무효화
  var hiddenEl=null;       // 지금 숨겨둔 개구리(있으면 감시 대상)
  var hiddenGame=false;    // 그 숨김이 게임 개구리였나(숨쉬기 복구용)
  var lastCt=-1, stall=0;  // 정지(stall) 감지
  var watchOn=false;
  var vbbCache={}, imgbbCache={};

  // ── 진단용 로그(원인 추적) ──
  var LOG=[];
  function log(ev, extra){
    try{
      var f=document.getElementById('frog');
      LOG.push({ ev:ev, tok:tok, playing:playing, hiddenEl:hiddenEl?(hiddenEl.id||hiddenEl.className):null,
                 frogVis:f?f.style.visibility:'?', vidDisp:vid?vid.style.display:'?', vidPaused:vid?vid.paused:'?',
                 vidCt:vid?+(vid.currentTime||0).toFixed(2):'?', extra:extra||'' });
      if(LOG.length>200) LOG.shift();
    }catch(e){}
  }

  function ensureVid(){
    if(vid) return vid;
    vid=document.createElement('video');
    vid.id='frogReactVid';
    vid.muted=true; vid.defaultMuted=true;
    vid.setAttribute('playsinline',''); vid.setAttribute('muted','');
    vid.playsInline=true; vid.preload='auto';
    vid.style.cssText='position:absolute;z-index:200;pointer-events:none;display:none;opacity:0';
    (document.getElementById('gc')||document.body).appendChild(vid);
    return vid;
  }

  // 반응 종료 = 무조건 개구리 복구 + 비디오 정리. 어디서 불려도 안전(멱등).
  function endReaction(){
    log('endReaction:in');
    tok++;                                   // 진행 중 콜백 전부 무효화
    if(vid){
      try{ vid.pause(); }catch(e){}
      vid.onended=null; vid.onerror=null; vid.onstalled=null;
      vid.loop=false;
      vid.style.display='none'; vid.style.opacity='0';
      try{ vid.removeAttribute('src'); vid.load(); }catch(e){}
    }
    if(hiddenEl){ try{ hiddenEl.style.visibility=''; }catch(e){} }   // ★ 개구리 되살리기
    var wasGame=hiddenGame;
    hiddenEl=null; hiddenGame=false; playing=false; lastCt=-1; stall=0;
    if(wasGame && typeof resumeAnim==='function'){ try{ resumeAnim(); }catch(e){} }
  }

  // ★ 감시 타이머: 개구리를 숨긴 동안 비디오가 '실제로 보이고 재생 중'이 아니면 즉시 복구.
  function startWatch(){
    if(watchOn) return; watchOn=true;
    setInterval(function(){
      if(!hiddenEl) return;                  // 숨긴 개구리 있을 때만 감시
      var bad = !vid || vid.style.display==='none' || vid.style.opacity==='0'
                || vid.paused || vid.error || !vid.videoWidth;
      if(bad){ log('watchdog:bad→restore'); endReaction(); return; }
      // ★ 재생 중이어도 '개구리를 실제로 안 그리는'(빈/투명) 프레임이면 즉시 앉은 개구리 복구.
      //   → 개구리가 화면에서 사라지는 상황을 원천 차단.
      if(!frameHasContent()){ log('watchdog:blank→restore'); endReaction(); return; }
      if(!vid.ended){                         // 정지(프레임 안 넘어감) 감지
        if(Math.abs((vid.currentTime||0)-lastCt)<0.001) stall++; else stall=0;
        lastCt=vid.currentTime||0;
        if(stall>=3){ log('watchdog:stall→restore'); endReaction(); }        // ~360ms 정지 → 복구
      }
    }, 120);
  }

  // ★ 비디오가 지금 '개구리(불투명 픽셀)'를 실제로 그리고 있는지 확인.
  //   재생(playing)만으로는 부족 — 재생 중이어도 빈/투명 프레임이면 화면엔 아무것도 안 보임.
  //   그 경우 앉은 개구리를 숨기면 '둘 다 안 보임'이 됨 → 이 함수로 실제 내용을 확인해 방지.
  var _fc=null;
  function frameHasContent(){
    if(!vid || !vid.videoWidth) return false;
    // ★ 화면에 실제로 보이는 CSS 크기도 확인 — 0x0(또는 아주 작음)이면 눈엔 안 보이므로 '빈 것'으로 판정.
    var rr=vid.getBoundingClientRect();
    if(rr.width<2 || rr.height<2) return false;
    try{
      if(!_fc){ _fc=document.createElement('canvas'); }
      var sw=36, sh=Math.max(1,Math.round(36*(vid.videoHeight||578)/(vid.videoWidth||420)));
      _fc.width=sw; _fc.height=sh;
      var g=_fc.getContext('2d'); g.clearRect(0,0,sw,sh); g.drawImage(vid,0,0,sw,sh);
      var d=g.getImageData(0,0,sw,sh).data, op=0;
      for(var i=3;i<d.length;i+=4){ if(d[i]>40){ if(++op>=8) return true; } }
      return false;
    }catch(e){ return true; }   // 캔버스를 못 읽으면(보안 등) 있다고 가정(예전 동작 유지)
  }

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

  // 클립 개구리를 sizeEl(크기/위치 기준) 기준으로 배치. imgEl로 발/중심 보정.
  //   ★ sizeEl은 '숨길 대상 컨테이너'(#frog / .sf)를 쓴다 — 이건 display가 아니라 visibility로만
  //     숨기므로 숨긴 뒤에도 rect가 유효(0x0이 안 됨). 활성 이미지는 setFrame으로 display:none이
  //     될 수 있어 0x0으로 측정되므로 크기 기준으로 쓰지 않는다.
  //   ★ 반환 false = 유효 크기를 못 재서 배치 실패 → 호출부는 개구리를 숨기지 말 것.
  function place(sizeEl, imgEl, clip){
    var gc=document.getElementById('gc'); var gr=gc.getBoundingClientRect();
    var r=sizeEl.getBoundingClientRect();
    if(!(r.width>1) || !(r.height>1)) return false;      // 크기 0/비정상 → 실패
    var H=r.height/BODY_FRAC, W=H*ASPECT;
    if(!(W>1) || !(H>1)) return false;
    // 발/중심 보정용 개구리 PNG bbox — display:none이어도 drawImage로 측정 가능.
    var img=(imgEl && imgEl.naturalWidth) ? imgEl : null;
    if(!img){ var cs=document.querySelectorAll('#frog .frog-img'); for(var i=0;i<cs.length;i++){ if(cs[i].naturalWidth){ img=cs[i]; break; } } }
    var gbb=null;
    if(img){ var k='img:'+img.src; if(!(k in imgbbCache)) imgbbCache[k]=opaqueBBox(img, img.naturalWidth, img.naturalHeight); gbb=imgbbCache[k]; }
    var vbb=vbbCache[clip];
    if(!vbb){ vbb=opaqueBBox(vid, vid.videoWidth||420, vid.videoHeight||578); if(vbb) vbbCache[clip]=vbb; }
    var gCx=r.left+(gbb?gbb.cxFrac:0.5)*r.width;
    var gFeetY=r.top+(gbb?gbb.feetFrac:1.0)*r.height;
    var vCx=vbb?vbb.cxFrac:0.5, vFeet=vbb?vbb.feetFrac:0.86;
    vid.style.width=W+'px'; vid.style.height=H+'px';
    vid.style.left=(gCx-gr.left - vCx*W)+'px';
    vid.style.top =(gFeetY-gr.top - vFeet*H)+'px';
    return true;
  }

  // clip 재생. alignEl=정렬 기준 개구리, hideEl=숨길 요소, game=게임 개구리 여부.
  function playClip(clip, alignEl, hideEl, game){
    if(!alignEl||!hideEl) return;
    ensureVid(); startWatch();
    log('playClip:in', clip+' game='+game);
    endReaction();                            // 이전 것 확실히 정리(개구리 복구 포함)
    var my=++tok;
    playing=true; lastCt=-1; stall=0;
    vid.loop=false; vid.style.opacity='0'; vid.style.display='block';

    // 유효한 프레임이 실제로 그려졌을 때만 개구리를 숨긴다(빈/stale 프레임엔 안 숨김).
    function trySwap(){
      if(my!==tok) return true;               // 무효화됨 → 중단
      if(vid.error) return true;
      if(!vid.videoWidth || (vid.currentTime||0)<=0) return false;  // 아직 유효 프레임 아님
      // ★ 배치(크기/위치)를 '숨기기 전에' 한다. 크기 기준은 컨테이너(hideEl).
      //   크기 0이면 place가 false → 영상 안 만들고, 개구리도 안 숨긴 채 재시도(개구리 유지).
      if(!place(hideEl, alignEl, clip)) return false;
      if(!frameHasContent()) return false;    // 빈/투명 프레임 or 화면 CSS 0크기면 숨기지 않음
      vid.style.opacity='1';
      hideEl.style.visibility='hidden';       // ★ 이제서야(제대로 보이는 게 확인된 뒤) 기존 개구리 숨김
      hiddenEl=hideEl; hiddenGame=game;
      if(game && typeof pauseAnim==='function'){ try{ pauseAnim(); }catch(e){} }
      log('trySwap:hid', clip);
      return true;
    }
    if(vid.requestVideoFrameCallback){
      var rvfc=function(){ if(my!==tok) return; if(!trySwap()) vid.requestVideoFrameCallback(rvfc); };
      vid.requestVideoFrameCallback(rvfc);
    } else {
      var tries=0;
      var poll=setInterval(function(){ if(my!==tok||trySwap()||++tries>60) clearInterval(poll); }, 40);
    }

    vid.onended =function(){ if(my===tok) endReaction(); };
    vid.onerror =function(){ if(my===tok) endReaction(); };   // 실패해도 개구리는 복구됨
    vid.onstalled=function(){ /* 감시 타이머가 처리 */ };
    vid.src=VID_BASE+clip+'.webm';
    try{ vid.currentTime=0; }catch(e){}
    var p=vid.play();
    if(p&&p.catch) p.catch(function(){ if(my===tok) endReaction(); });  // 재생 거부 시도 복구
  }

  function gameFrogImg(){
    return document.querySelector('#frog .frog-img.active') || document.getElementById('frog');
  }

  // ---- 정답 후킹 (occ 래핑): 맞출 때마다 5개 중 랜덤 ----
  if(typeof occ==='function'){
    var _occ=occ;
    window.occ=function(f){
      _occ(f);
      try{
        if(playing){ log('occ:SKIP(playing)'); return; }
        var clip=CLIPS[Math.floor(Math.random()*CLIPS.length)];
        log('occ:fire', 'cm='+(typeof cm!=='undefined'?cm:'?'));
        playClip(clip, gameFrogImg(), document.getElementById('frog'), true);
      }catch(e){ console.warn('[frogreact] occ hook',e); try{ endReaction(); }catch(_){} }
    };
  }

  // ---- 시작화면 인사 (손 흔들기, 딱 1번) ----
  var greeted=false;
  function greet(){
    try{
      if(greeted) return;
      var ss=document.getElementById('ss');
      var sf=document.querySelector('.ss .sf');
      if(!ss||!sf) return;
      if(getComputedStyle(ss).display==='none') return;   // 시작화면일 때만
      greeted=true;
      playClip(GREET, sf, sf, false);
    }catch(e){ console.warn('[frogreact] greet',e); try{ endReaction(); }catch(_){} }
  }
  if(document.readyState==='complete') setTimeout(greet,600);
  else window.addEventListener('load',function(){ setTimeout(greet,600); });

  // ---- 화면 전환 시 인트로 손흔들기(및 어떤 반응이든) 확실히 정지·제거 ----
  // 시작화면을 벗어나는 버튼들을 감싸서, 넘어가기 전에 반응을 끝낸다.
  ['goModeSelect','goWordCat','goMode','goWordPuzzle','goAnimalPuzzle','goDinoPuzzle'].forEach(function(fn){
    if(typeof window[fn]==='function'){
      var orig=window[fn];
      window[fn]=function(){ try{ endReaction(); }catch(e){} return orig.apply(this,arguments); };
    }
  });
  // 보강: 시작화면이 사라졌는데 시작 개구리를 숨긴 채면(인사 진행 중 전환) 즉시 정리.
  setInterval(function(){
    if(hiddenEl && !hiddenGame){
      var ss=document.getElementById('ss');
      if(ss && getComputedStyle(ss).display==='none') endReaction();
    }
  }, 200);

  /* =====================================================================
     파리(글자) 잡을 때 '화려한 반짝' 효과 (★ 테스트: 첫 게임 앞 N글자만)
     - 원본 slp()(작은 금색 글자, 1초)를 후킹해 앞 N번만 화려하게 교체.
     - ① 크기 3배(원래 peak 96px → 288px)  ② 금빛 shimmer  ③ 금가루 낙하  ④ 반짝 효과음
     - N번 지나면 원래 효과로 복귀. 확정되면 N을 크게(전체 적용).
     ===================================================================== */
  var FANCY_LETTERS = 5;                 // 첫 게임에서 이 개수만 화려하게
  var fancyLeft = FANCY_LETTERS;
  var sparkleSnd;
  function playSparkle(){
    try{
      if(sparkleSnd===undefined){ sparkleSnd=new Audio('test/frogreact/alphabet_sparkle.mp3'); sparkleSnd.preload='auto'; }
      if(sparkleSnd){ sparkleSnd.currentTime=0; var p=sparkleSnd.play(); if(p&&p.catch)p.catch(function(){}); }
    }catch(e){ sparkleSnd=false; }
  }
  // 효과용 CSS 주입(테스트 페이지에만)
  (function injectFxCss(){
    var css=''
      +'.fx-lpop{position:absolute;font-weight:900;font-size:240px;line-height:1;z-index:60;pointer-events:none;'
      +'will-change:transform,opacity;color:#FFE14D;'
      +'animation:fxLpop 1.15s cubic-bezier(.2,.85,.3,1) forwards, fxShine .32s ease-in-out infinite}'
      +'@keyframes fxLpop{0%{opacity:0;transform:translate(-50%,0) scale(.5) rotate(-8deg)}'
      +'16%{opacity:1;transform:translate(-50%,-30px) scale(1.2) rotate(5deg)}'      /* peak 288px */
      +'55%{opacity:1;transform:translate(-50%,-80px) scale(1.14) rotate(-3deg)}'
      +'100%{opacity:0;transform:translate(-50%,-175px) scale(1) rotate(0)}}'
      +'@keyframes fxShine{0%,100%{color:#FFF3B0;text-shadow:0 0 12px #FFD700,0 0 26px #FFB300,4px 5px 0 #E68A00}'
      +'50%{color:#FFE14D;text-shadow:0 0 26px #FFEA00,0 0 54px #FFC400,0 0 80px #FFB300,4px 5px 0 #C77700}}'
      +'.fx-dust{position:absolute;border-radius:50%;z-index:59;pointer-events:none;will-change:transform,opacity;'
      +'background:radial-gradient(circle at 35% 35%,#FFF7CC,#FFD24D 45%,#E6A800 100%);box-shadow:0 0 6px #FFD700;'
      +'animation:fxDust 1s ease-in forwards}'
      +'@keyframes fxDust{0%{opacity:1;transform:translate(-50%,-50%) translate(0,0) scale(1)}70%{opacity:.9}'
      +'100%{opacity:0;transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(.3)}}';
    var s=document.createElement('style'); s.setAttribute('data-frogreact','fx'); s.textContent=css;
    (document.head||document.documentElement).appendChild(s);
  })();

  function fancyLetterPop(l,x,y){
    try{
      var host=document.getElementById('gc')||document.body;
      var el=document.createElement('div'); el.className='fx-lpop'; el.textContent=l;
      el.style.left=x+'px'; el.style.top=y+'px';
      host.appendChild(el);
      setTimeout(function(){ el.remove(); }, 1250);
      // 금가루 낙하 파티클
      var n=16;
      for(var i=0;i<n;i++){
        var d=document.createElement('div'); d.className='fx-dust';
        var dx=(Math.random()*2-1)*80;          // 좌우 ±80
        var dy=55+Math.random()*130;            // 아래로 55~185 (떨어짐)
        var dur=0.7+Math.random()*0.6;
        var sz=5+Math.random()*8;
        d.style.left=x+'px'; d.style.top=y+'px';
        d.style.width=sz+'px'; d.style.height=sz+'px';
        d.style.setProperty('--dx', dx+'px'); d.style.setProperty('--dy', dy+'px');
        d.style.animationDuration=dur+'s'; d.style.animationDelay=(Math.random()*0.18)+'s';
        host.appendChild(d);
        (function(dd,ms){ setTimeout(function(){ dd.remove(); }, ms); })(d, dur*1000+400);
      }
      playSparkle();
    }catch(e){ console.warn('[frogreact] fancyLetterPop',e); }
  }

  // slp 후킹: 앞 N글자만 화려하게, 그 뒤엔 원래 효과.
  if(typeof slp==='function'){
    var _slp=slp;
    window.slp=function(l,x,y){
      try{
        if(fancyLeft>0){ fancyLeft--; fancyLetterPop(l,x,y); return; }
      }catch(e){ console.warn('[frogreact] slp hook',e); }
      _slp(l,x,y);
    };
  }

  // 디버그
  window.__frogreact={
    playGame:function(name){ playClip(name||CLIPS[0], gameFrogImg(), document.getElementById('frog'), true); },
    playGreet:function(){ var sf=document.querySelector('.ss .sf'); playClip(GREET, sf, sf, false); },
    stop:endReaction,
    set:function(bodyFrac){ if(bodyFrac)BODY_FRAC=bodyFrac; },
    fancyDemo:function(l,x,y){ fancyLetterPop(l||'A', x||(window.innerWidth/2), y||(window.innerHeight*0.4)); },
    resetFancy:function(n){ fancyLeft=(n==null?FANCY_LETTERS:n); return fancyLeft; },
    fancyLeft:function(){ return fancyLeft; },
    clips:CLIPS,
    state:function(){ var f=document.getElementById('frog'); var af=document.querySelector('#frog .frog-img.active');
      return { playing:playing, tok:tok, hiddenEl:hiddenEl?(hiddenEl.id||hiddenEl.className):null,
        frogVis:f?getComputedStyle(f).visibility:'?', frogInline:f?f.style.visibility:'?',
        activeImg:af?af.id:null, activeImgDisp:af?getComputedStyle(af).display:'?',
        vidDisp:vid?vid.style.display:'?', vidOpacity:vid?vid.style.opacity:'?', vidPaused:vid?vid.paused:'?' }; },
    log:function(){ return LOG.slice(); },
    clearLog:function(){ LOG.length=0; }
  };
})();
