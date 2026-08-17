/* =====================================================================
   ABC Frog — 개구리 반응 클립 애드온
   ★ 이 파일은 라이브다 — index.html 이 script.js 뒤에서 로드한다. 고치면 즉시 전 유저 반영.
     (2026-07-21 커밋 a8dfd11 로 공개. 예전 "테스트 전용, 라이브 미반영" 주석은 사실과 달라
      2026-08-10 에 바로잡음 — 그 주석 때문에 라이브 파일을 테스트 파일로 오해할 뻔했다.)
   - script.js 뒤에 로드. 라이브 script.js는 손대지 않고 전역 함수만 후킹.
   - 정답 파리 먹음(occ) → 5개 동작 중 랜덤 하나 (콤보/빙고 구분 없음)
   - 시작화면 인사(손 흔들기)는 **끔**(2026-08-10). 시작화면엔 앉은 개구리만 나온다.
     액션 클립은 게임 안에서만 재생. (아래 GREET_ON 참고 — 코드는 지우지 않고 예약만 막음)
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
  // occ은 '혀가 파리에 닿는 순간'에 불림. 여기서 바로 춤추면 혀로 입에 가져와 먹는 과정이 생략돼 어색.
  // → 혀 수축(occ+~300ms)·파리 먹음완료(occ+~350ms) 뒤인 REACTION_DELAY 후에 춤 시작.
  var REACTION_DELAY = 380;              // ms — 먹은 직후 자연스럽게 이어지게(너무 늦지 않게)
  var reactionScheduled = false;
  function scheduleReaction(clip){       // 먹은 뒤(REACTION_DELAY) 춤 시작 (occ/데모 공용)
    if(playing || reactionScheduled) return;
    reactionScheduled=true;
    setTimeout(function(){
      reactionScheduled=false;
      if(playing) return;
      if(typeof gp!=='undefined' && gp!=='playing' && gp!=='tutorial') return;
      playClip(clip, gameFrogImg(), document.getElementById('frog'), true);
    }, REACTION_DELAY);
  }
  if(typeof occ==='function'){
    var _occ=occ;
    window.occ=function(f){
      _occ(f);
      try{
        if(typeof removeFinger==='function') removeFinger(true);   // 첫 정답 잡으면 손가락 안내 종료
        scheduleReaction(CLIPS[Math.floor(Math.random()*CLIPS.length)]);
      }catch(e){ console.warn('[frogreact] occ hook',e); reactionScheduled=false; try{ endReaction(); }catch(_){} }
    };
  }

  // ===== 온보딩① 튜토리얼 데모(개구리가 A 자동으로 먹는 장면)에도 춤 + 글자 샤르링 =====
  // 데모는 occ 대신 shoot 콜백에서 직접 먹기효과만 함 → shoot을 감싸 데모(gp==='tutorial')일 때 효과 추가.
  var DEMO_CLIPS=['frog_jump_1_fwd','frog_legdance_1_fwd','frog_singleleg_1_fwd'];  // 데모용 짧은 춤
  if(typeof shoot==='function'){
    var _shoot=shoot;
    window.shoot=function(tx,ty,cb){
      var isDemo=(typeof gp!=='undefined' && gp==='tutorial');
      _shoot(tx,ty,function(){
        if(cb){ try{ cb(); }catch(e){} }
        if(isDemo){
          try{
            var L=(typeof displayLetter==='function')?displayLetter('A'):'A';
            if(typeof window.slp==='function') window.slp(L, tx, ty);                 // 글자 샤르링(금빛+금가루+소리)
            scheduleReaction(DEMO_CLIPS[Math.floor(Math.random()*DEMO_CLIPS.length)]); // 춤
          }catch(e){ console.warn('[frogreact] demo hook',e); }
        }
      });
    };
  }

  // ===== 온보딩② 게임 시작 시 첫 정답 파리를 손가락(👆)으로 가리키기 =====
  var fingerEl=null, fingerRAF=null, fingerActive=false, fingerDone=false;
  function findCorrectFly(){
    try{
      if(typeof fl==='undefined' || typeof ct==='undefined' || !ct) return null;
      var C=String(ct).toUpperCase();
      for(var i=0;i<fl.length;i++){ var f=fl[i];
        if(f && f.letter && String(f.letter).toUpperCase()===C && f.el && f.el.parentNode) return f; }
    }catch(e){}
    return null;
  }
  function removeFinger(markDone){
    fingerActive=false;
    if(fingerRAF){ cancelAnimationFrame(fingerRAF); fingerRAF=null; }
    if(fingerEl){ try{ fingerEl.remove(); }catch(e){} fingerEl=null; }
    if(markDone) fingerDone=true;
  }
  function startFingerGuide(){
    if(fingerDone || fingerActive) return;
    var tries=0;
    (function waitFly(){
      if(fingerDone || fingerActive) return;
      if(typeof gp!=='undefined' && gp!=='playing'){ if(++tries<80) setTimeout(waitFly,150); return; }  // 아직 게임 전이면 대기
      var f=findCorrectFly();
      if(!f){ if(++tries<80) setTimeout(waitFly,150); return; }                                          // 파리 아직 없으면 대기
      fingerActive=true;
      fingerEl=document.createElement('div'); fingerEl.className='fx-finger'; fingerEl.textContent='👆';
      (document.getElementById('gc')||document.body).appendChild(fingerEl);
      var gc=document.getElementById('gc'), miss=0;
      (function loop(){
        if(!fingerActive) return;
        if(typeof gp!=='undefined' && gp!=='playing'){ removeFinger(true); return; }
        var cfly=findCorrectFly();
        if(cfly){
          miss=0; fingerEl.style.display='';
          var r=cfly.el.getBoundingClientRect(), gr=gc.getBoundingClientRect();
          fingerEl.style.left=(r.left-gr.left+r.width/2)+'px';
          fingerEl.style.top =(r.top-gr.top+r.height*0.92)+'px';   // 파리 바로 아래에서 위(파리)를 가리킴
        } else {
          // 정답 파리가 잠깐 안 보임(경계 밖 등) → 손가락만 잠깐 숨기고 계속 대기(영구 제거 X)
          fingerEl.style.display='none';
          if(++miss>240){ removeFinger(true); return; }            // 4초 넘게 없으면 종료
        }
        fingerRAF=requestAnimationFrame(loop);
      })();
      setTimeout(function(){ if(fingerActive) removeFinger(true); }, 12000);   // 안전 타임아웃(안 잡으면)
    })();
  }
  // "Tap the letter" 음성이 나올 때(게임 시작) 손가락 안내 시작. 첫 판만(잡으면 종료·재등장 안 함).
  if(typeof playVoice==='function'){
    var _pv=playVoice;
    window.playVoice=function(k){
      var r; try{ r=_pv(k); }catch(e){}
      try{ if(k==='tap_the_letter') startFingerGuide(); }catch(e){}
      return r;
    };
  }
  if(typeof owc==='function'){          // 오답 눌러도 손가락 안내 종료
    var _owc=owc;
    window.owc=function(f){ try{ removeFinger(true); }catch(e){} return _owc(f); };
  }

  // ---- 시작화면 인사 (손 흔들기, 딱 1번) ----
  var greeted=false;
  var greetTimer=null;      // 예약된 인사 타이머 ID (취소용)
  var leftStart=false;      // 시작화면을 벗어났는가 — 한 번 true면 인사는 영구 취소

  // ★ 시작화면 위에 다른 화면이 떠 있는가?
  //   .wc(퍼즐메뉴)/.ms(모드선택)/.wp(과일퍼즐)는 .ss 를 '덮기만' 하고 display:none 으로 만들지 않는다.
  //   → .ss 의 display 만 보면 "시작화면을 벗어났다"를 알 수 없다. (겹침 버그의 원인이었음)
  //   동물·공룡 퍼즐은 iframe 오버레이라 iframe 존재로 판정.
  function otherScreenOpen(){
    try{
      var ids=['ms','wc','wp','ps'];        // ps = 파닉스 세트 메뉴(2026-08-13). 없는 폰이면 getElementById 가 null 이라 그냥 건너뜀
      for(var i=0;i<ids.length;i++){
        var el=document.getElementById(ids[i]);
        if(el && getComputedStyle(el).display!=='none') return true;
      }
      if(document.querySelector('iframe[src*="animal.html"],iframe[src*="dino.html"],iframe[src*="phonics/"]')) return true;
      return false;
    }catch(e){ return false; }
  }

  // 화면 전환 시 호출: ①아직 시작 안 한 인사 예약을 취소 ②재생 중인 반응을 정리.
  // 몇 번을 불러도 안전(멱등) — 중복 클릭·빠른 연속 전환 대비.
  function cancelGreeting(){
    leftStart=true;
    if(greetTimer){ try{ clearTimeout(greetTimer); }catch(e){} greetTimer=null; }
    try{ endReaction(); }catch(e){}
  }

  function greet(){
    greetTimer=null;                                     // 이 타이머는 소진됨
    try{
      if(greeted || leftStart) return;                   // 이미 했거나 시작화면을 벗어났으면 중단
      if(otherScreenOpen()) return;                      // 다른 화면이 떠 있으면 중단 → webm 요청·재생 자체를 안 함
      var ss=document.getElementById('ss');
      var sf=document.querySelector('.ss .sf');
      if(!ss||!sf) return;
      if(getComputedStyle(ss).display==='none') return;   // 시작화면일 때만
      greeted=true;
      playClip(GREET, sf, sf, false);
    }catch(e){ console.warn('[frogreact] greet',e); try{ endReaction(); }catch(_){} }
  }
  // ★ 시작화면 인사 끔 (2026-08-10, 사장님 지시)
  //   "첫 화면에는 앉은 개구리만" — 액션 클립(손흔들기 포함 5종)은 게임 안에서만 재생한다.
  //   손흔들기 webm 은 게임 중 반응 5종 중 하나로 계속 쓰이므로 파일은 그대로 둔다.
  //   되살리려면 GREET_ON=true 로만 바꾸면 됨 — 아래 예약 코드는 지우지 않고 그대로 보존.
  //   ※ greet()/cancelGreeting()/otherScreenOpen() 도 그대로 남겨둠. 화면 전환 래퍼가 부르는
  //     cancelGreeting() 은 '재생 중인 반응 정리'(endReaction) 역할도 겸하므로 빼면 안 된다.
  var GREET_ON=false;
  if(GREET_ON){
    // load 는 '모든 이미지까지' 받은 뒤라 느린 기기에선 수 초 뒤일 수 있다.
    // 그 사이 유저가 이미 다른 화면으로 갔으면(leftStart) 예약 자체를 걸지 않는다.
    if(document.readyState==='complete') greetTimer=setTimeout(greet,600);
    else window.addEventListener('load',function(){ if(!leftStart) greetTimer=setTimeout(greet,600); });
  }

  // ---- 화면 전환 시 인트로 손흔들기(및 어떤 반응이든) 확실히 정지·제거 ----
  // 시작화면을 벗어나는 버튼들을 감싸서, 넘어가기 전에 반응 정리 + 인사 예약 취소.
  ['goModeSelect','goWordCat','goMode','goWordPuzzle','goAnimalPuzzle','goDinoPuzzle','goPhonics'].forEach(function(fn){
    if(typeof window[fn]==='function'){
      var orig=window[fn];
      window[fn]=function(){ try{ cancelGreeting(); }catch(e){} return orig.apply(this,arguments); };
    }
  });
  // 보강: 시작화면을 벗어났는데 시작 개구리를 숨긴 채면(인사 진행 중 전환) 즉시 정리.
  setInterval(function(){
    if(hiddenEl && !hiddenGame){
      var ss=document.getElementById('ss');
      if((ss && getComputedStyle(ss).display==='none') || otherScreenOpen()) endReaction();
    }
  }, 200);

  /* =====================================================================
     파리(글자) 잡을 때 '화려한 반짝' 효과 (★ 테스트: 첫 게임 앞 N글자만)
     - 원본 slp()(작은 금색 글자, 1초)를 후킹해 앞 N번만 화려하게 교체.
     - ① 크기 3배(원래 peak 96px → 288px)  ② 금빛 shimmer  ③ 금가루 낙하  ④ 반짝 효과음
     - N번 지나면 원래 효과로 복귀. 확정되면 N을 크게(전체 적용).
     ===================================================================== */
  var FANCY_ALL = true;                  // ★ true = 모든 글자에 화려한 효과 (false면 앞 N글자만)
  var FANCY_LETTERS = 5;                 // FANCY_ALL=false일 때 앞 몇 글자만 화려하게
  var fancyLeft = FANCY_LETTERS;
  var sparkleSnd, SOUND_DUR = 2.55;      // 글자 애니 길이를 이 소리 길이에 정확히 맞춤(로드되면 실측값)
  function ensureSnd(){
    if(sparkleSnd===undefined){
      try{
        sparkleSnd=new Audio('assets/frog/sounds/alphabet_sparkle.mp3?v=1'); sparkleSnd.preload='auto';  // ?v=2 = +30% 볼륨 버전(캐시 무효화)
        sparkleSnd.addEventListener('loadedmetadata', function(){ if(sparkleSnd && sparkleSnd.duration>0.1) SOUND_DUR=sparkleSnd.duration; });
      }catch(e){ sparkleSnd=false; }
    }
    return sparkleSnd;
  }
  function playSparkle(){
    try{ var a=ensureSnd(); if(a){ a.currentTime=0; var p=a.play(); if(p&&p.catch)p.catch(function(){}); } }catch(e){}
  }
  // ★ 2026-08-17 첫 화면에서 미리 받지 않는다.
  //   이 소리는 '파리를 잡을 때'만 난다(아래 slp 후킹 → fancyLetterPop → playSparkle).
  //   전엔 여기서 바로 ensureSnd() 를 불러 **첫 화면에서 49KB 를 받았다** — 첫 화면은 완전 무음이라 순수 낭비였다.
  //   script.js 의 소리 지연 로딩(2026-08-15)과 같은 방식으로 **게임에 들어갈 때** 받는다.
  //   ※ playSparkle() 이 ensureSnd() 를 부르므로 이 예열이 실패해도 소리는 난다(첫 글자만 조금 늦을 수 있음).
  //     예열을 두는 이유: ①첫 글자 소리가 늦지 않게 ②SOUND_DUR(글자 애니 길이)을 실측값으로 확보.
  ['goModeSelect','go'].forEach(function(fn){
    // goModeSelect = 실제 게임보다 한 탭 앞(아이가 ABC/abc/ABc 고르는 동안 도착) — script.js 의 preloadFrogImgs 와 같은 자리
    // go          = 모드선택을 건너뛰고 들어오는 길(뒤로가기 복귀 등) 대비 보장용
    if(typeof window[fn]==='function'){
      var orig=window[fn];
      window[fn]=function(){ try{ ensureSnd(); }catch(e){} return orig.apply(this,arguments); };
    }
  });
  // 효과용 CSS 주입(테스트 페이지에만)
  (function injectFxCss(){
    var css=''
      +'.fx-lpop{position:absolute;font-weight:900;font-size:240px;line-height:1;z-index:60;pointer-events:none;'
      +'will-change:transform,opacity;color:#FFE14D}'   /* 애니는 JS가 인라인으로(길이=소리 길이) */
      /* 소리 내내 연속으로: 작게 시작→커지며 위로 떠오르고→서서히 투명해져 끝에 완전히 사라짐. 최대 scale 1.2(=288px) */
      +'@keyframes fxLpop{'
      +'0%{opacity:0;transform:translate(-50%,0) scale(.35) rotate(-6deg)}'
      +'6%{opacity:1;transform:translate(-50%,-14px) scale(.5) rotate(3deg)}'        /* 소리 시작과 함께 등장 */
      +'55%{opacity:.72;transform:translate(-50%,-125px) scale(.9) rotate(-2deg)}'   /* 계속 커지며 상승, 서서히 옅어짐 */
      +'100%{opacity:0;transform:translate(-50%,-235px) scale(1.2) rotate(0)}}'     /* 끝: 최대 288px + 완전 투명 */
      +'@keyframes fxShine{0%,100%{color:#FFF3B0;text-shadow:0 0 12px #FFD700,0 0 26px #FFB300,4px 5px 0 #E68A00}'
      +'50%{color:#FFE14D;text-shadow:0 0 26px #FFEA00,0 0 54px #FFC400,0 0 80px #FFB300,4px 5px 0 #C77700}}'
      +'.fx-dust{position:absolute;border-radius:50%;z-index:59;pointer-events:none;will-change:transform,opacity;'
      +'background:radial-gradient(circle at 35% 35%,#FFF7CC,#FFD24D 45%,#E6A800 100%);box-shadow:0 0 6px #FFD700;'
      +'animation:fxDust 1s ease-in forwards}'
      +'@keyframes fxDust{0%{opacity:1;transform:translate(-50%,-50%) translate(0,0) scale(1)}70%{opacity:.9}'
      +'100%{opacity:0;transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(.3)}}'
      // 온보딩 손가락(👆): 정답 파리 아래에서 위아래 까딱이며 가리킴
      +'.fx-finger{position:absolute;font-size:58px;line-height:1;z-index:75;pointer-events:none;'
      +'filter:drop-shadow(0 3px 3px rgba(0,0,0,.45));animation:fxFinger .8s ease-in-out infinite}'
      +'@keyframes fxFinger{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,11px)}}';
    var s=document.createElement('style'); s.setAttribute('data-frogreact','fx'); s.textContent=css;
    (document.head||document.documentElement).appendChild(s);
  })();

  function fancyLetterPop(l,x,y){
    try{
      var host=document.getElementById('gc')||document.body;
      playSparkle();                                  // ★ 소리 먼저 시작
      var dur=(SOUND_DUR>0.3?SOUND_DUR:2.55);         // 글자 생존시간 = 소리 길이
      var el=document.createElement('div'); el.className='fx-lpop'; el.textContent=l;
      el.style.left=x+'px'; el.style.top=y+'px';
      // ★ 애니 길이를 소리 길이에 맞춤(소리와 함께 시작해 함께 끝남). 셰인은 그대로.
      el.style.animation='fxLpop '+dur+'s linear forwards, fxShine .32s ease-in-out infinite';
      host.appendChild(el);
      setTimeout(function(){ el.remove(); }, dur*1000+150);
      // 금가루 낙하 파티클
      // 금가루(별가루) — 우수수 쏟아지게 풍성히
      var n=44;                                    // 개수↑ (게임 부담 없는 선)
      for(var i=0;i<n;i++){
        var d=document.createElement('div'); d.className='fx-dust';
        var dx=(Math.random()*2-1)*140;            // 좌우 ±140 (더 넓게)
        var dy=45+Math.random()*300;               // 아래로 45~345 (거리 다양)
        var ddur=0.6+Math.random()*1.0;            // 0.6~1.6s (속도 다양)
        var delay=Math.random()*0.55;              // 0~0.55s 시차 → 우수수 쏟아짐
        var sz=3+Math.random()*Math.random()*15;   // 3~18px, 작은 게 많고 큰 게 섞임
        d.style.left=x+'px'; d.style.top=y+'px';
        d.style.width=sz+'px'; d.style.height=sz+'px';
        d.style.setProperty('--dx', dx+'px'); d.style.setProperty('--dy', dy+'px');
        d.style.animationDuration=ddur+'s'; d.style.animationDelay=delay+'s';
        host.appendChild(d);
        (function(dd,ms){ setTimeout(function(){ dd.remove(); }, ms); })(d, (delay+ddur)*1000+300);
      }
    }catch(e){ console.warn('[frogreact] fancyLetterPop',e); }
  }

  // slp 후킹: FANCY_ALL이면 모든 글자를 화려하게, 아니면 앞 N글자만. 화려효과 실패 시 원래 효과로 폴백.
  if(typeof slp==='function'){
    var _slp=slp;
    window.slp=function(l,x,y){
      try{
        if(FANCY_ALL || fancyLeft>0){ if(!FANCY_ALL) fancyLeft--; fancyLetterPop(l,x,y); return; }
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
