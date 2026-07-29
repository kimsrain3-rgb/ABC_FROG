
// === 전역 에러 핸들러 (TWA 크래시 방지) ===
window.onerror=function(msg,src,line,col,err){console.warn('Error caught:',msg);return true;};
window.addEventListener('unhandledrejection',function(e){e.preventDefault();console.warn('Promise rejected:',e.reason);});

// === 인트로 개구리 숨쉬기 ===
(function(){const f=document.querySelector('.ss .sf');if(!f)return;let t=false;setInterval(()=>{t=!t;f.src='assets/frog/images/frog_4'+(t?'b':'a')+'.png'},800);})();

// === 디버그 도구 ===
// debugStage(4) → 4단계로 점프
// debugMouth() → 입 위치에 빨간점 표시
// debugSet(x,y) → 현재 단계의 입 위치 비율 변경 (예: debugSet(0.50, 0.25))
const _mouthX=[0,0.50,0.50,0.50,0.56,0.56];
const _mouthY=[0,0.38,0.36,0.34,0.37,0.33];
window.debugStage=function(stage){
  if(stage<1||stage>5){console.log('1~5 사이 숫자');return;}
  const counts=[0,0,6,11,16,21];
  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  col.clear();
  for(let i=0;i<counts[stage];i++) col.add(letters[i]);
  frogStage=stage;
  setFrame('open');
  console.log('단계 '+stage+' (open 포즈) | mouthX='+_mouthX[stage]+' mouthY='+_mouthY[stage]);
  debugMouth();
};
window.debugMouth=function(){
  let dot=document.getElementById('debug-dot');
  if(!dot){dot=document.createElement('div');dot.id='debug-dot';dot.style.cssText='position:absolute;width:12px;height:12px;background:red;border-radius:50%;z-index:9999;pointer-events:none;border:2px solid white';gc.appendChild(dot);}
  const fr=frog.getBoundingClientRect(),cr=gc.getBoundingClientRect();
  const sx=fr.left+fr.width*_mouthX[frogStage]-cr.left;
  const sy=fr.top+fr.height*_mouthY[frogStage]-cr.top;
  dot.style.left=(sx-6)+'px';dot.style.top=(sy-6)+'px';dot.style.display='block';
  console.log('빨간점 위치: X='+_mouthX[frogStage]+' Y='+_mouthY[frogStage]);
};
window.debugSet=function(x,y){
  _mouthX[frogStage]=x;_mouthY[frogStage]=y;
  debugMouth();
  console.log('단계 '+frogStage+' 입 위치 → X='+x+' Y='+y);
};

// === 사운드 에셋 (안전 로딩) ===
function safeAudio(src){try{var a=new Audio(src);a.onerror=function(){};return a;}catch(e){return {play:function(){return Promise.resolve()},pause:function(){},cloneNode:function(){return this},volume:0,currentTime:0,loop:false,onerror:null,onended:null};}}
const SND_FLY1=safeAudio('assets/bugs/sounds/fly_buzz1.mp3');
const SND_FLY2=safeAudio('assets/bugs/sounds/fly_buzz2.mp3');
const SND_FROG=safeAudio('assets/frog/sounds/frog_tongue.mp3');
const SND_BGM=safeAudio('assets/game/sounds/bgm.mp3');
SND_BGM.loop=true;SND_BGM.volume=0.25;
SND_FLY1.volume=0.5;SND_FLY2.volume=0.5;
SND_FROG.volume=0.5;

let bgmStarted=false;
function startBGM(){if(!bgmStarted){SND_BGM.play().catch(()=>{});bgmStarted=true;}}

// 앱을 닫거나 배경으로 보낼 때(홈버튼/멀티태스킹/화면끔) 모든 소리 정지 — WebView에서 앱 닫아도 BGM이 계속 나오는 문제 방지.
// 화면이 다시 보이면, 멈추기 전 재생 중이던 BGM만 다시 켬.
var _bgmWasPlaying=false;
function _pauseAllSound(){
  try{ _bgmWasPlaying = !SND_BGM.paused; }catch(e){ _bgmWasPlaying=false; }
  try{ SND_BGM.pause(); }catch(e){}
  try{ document.querySelectorAll('video,audio').forEach(function(m){ try{m.pause();}catch(e){} }); }catch(e){}
  try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
}
document.addEventListener('visibilitychange',function(){
  if(document.hidden){ _pauseAllSound(); }
  else if(_bgmWasPlaying){ try{ SND_BGM.play().catch(function(){}); }catch(e){} }
});
window.addEventListener('pagehide',_pauseAllSound);

function playFlyBuzz(){
  const s=[SND_FLY1,SND_FLY2][Math.floor(Math.random()*2)];
  const c=s.cloneNode();c.volume=0.4+Math.random()*0.2;
  c.currentTime=Math.random()*3;
  c.play().catch(()=>{});
  setTimeout(()=>c.pause(),800+Math.random()*1500);
}
function playFrogSound(){
  const c=SND_FROG.cloneNode();c.volume=0.5;
  c.currentTime=0;c.play().catch(()=>{});
  setTimeout(()=>c.pause(),1500);
}

let frogBGInterval;
function startFrogBG(){function loop(){playFrogSound();frogBGInterval=setTimeout(loop,8000+Math.random()*12000);}setTimeout(loop,5000);}

let flyBuzzInterval;
function startFlyBuzz(){function loop(){playFlyBuzz();flyBuzzInterval=setTimeout(loop,3000+Math.random()*4000);}loop();}
function stopFlyBuzz(){if(flyBuzzInterval)clearTimeout(flyBuzzInterval);}

const FLY_IMGS={
  left:["assets/bugs/images/fly_left.png","assets/bugs/images/fly_left2.png"],
  right:["assets/bugs/images/fly_right.png","assets/bugs/images/fly_right2.png"],
  front:["assets/bugs/images/fly_front.png","assets/bugs/images/fly_front2.png"]
};
const DRAGONFLY_IMGS={
  left:["assets/bugs/images/dregon1.png","assets/bugs/images/dregon1-1.png"],
  right:["assets/bugs/images/dregon2.png","assets/bugs/images/dregon2-1.png"],
  front:["assets/bugs/images/dregon1.png","assets/bugs/images/dregon1-1.png"]
};
const SPIDER_IMGS=["assets/bugs/images/spider1.png","assets/bugs/images/spider1-1.png"];
const DIRS=['left','right','front'];

const PHRASES=[
  {text:'I wanna eat {L}',vk:'i_wanna_eat'},
  {text:'Give me {L}',vk:'give_me'},
  {text:'Where is {L}',vk:'where_is'},
  {text:'I NEED {L}',vk:'i_need'},
  {text:'Find {L} for me',vk:'find'},
  {text:'{L} looks SO yummy',vk:'looks_so_yummy'},
  {text:'Gimme {L}',vk:'gimme'},
  {text:'Bring me {L}',vk:'bring_me'},
  {text:'{L} please',vk:'please_v'},
  {text:"I'm SO hungry for {L}",vk:'im_so_hungry'}
];


const LETTER_SOUND={
  A:'the letter A',B:'bee',C:'see',D:'dee',E:'ee',F:'ef',G:'jee',
  H:'aitch',I:'eye',J:'jay',K:'kay',L:'el',M:'mmm',N:'en',
  O:'oh',P:'pee',Q:'cue',R:'are',S:'ess',T:'tee',U:'you',
  V:'vee',W:'double you',X:'ex',Y:'why',Z:'zee'
};

const BUTTERFLY_FRAMES=[
  'assets/bugs/images/butterfly_frame1.png',
  'assets/bugs/images/butterfly_frame2.png'
];

// 나비 (파리 사이 날아다님)
let bfEl=null;
let bfX=0.3,bfY=0.3;
let bfVx=0.003,bfVy=0.002;
let bfFrame=0;
let bfTapCount=0;

const BF_PHRASES=[
  "Hmph!","Don't touch!","Excuse me!","How rude!",
  "Go away!","I'm beautiful!","Not interested!","Ugh!"
];
const BF_ANGRY=[
  "I SAID DON'T TOUCH!","You're SO annoying!","LEAVE ME ALONE!","That's IT!"
];

function initButterfly(){
  bfEl=document.createElement('div');
  bfEl.id='butterfly';
  bfEl.style.cssText='position:absolute;width:14vmin;z-index:15;cursor:pointer;';
  
  for(var i=0;i<2;i++){
    var im=document.createElement('img');
    im.src=BUTTERFLY_FRAMES[i];
    im.style.cssText='width:100%;display:'+(i===0?'block':'none')+';pointer-events:none;';
    im.className='bf-frame';
    bfEl.appendChild(im);
  }
  for(var i=0;i<2;i++){
    var sim=document.createElement('img');
    sim.src=BUTTERFLY_SHOCK[i];
    sim.style.cssText='width:150%;margin-left:-25%;display:none;pointer-events:none;';
    sim.className='bf-shock';
    bfEl.appendChild(sim);
  }
  
  var bfShocked=false;
  var shockFrame=0;
  var shockTimer=null;
  var shockSwap=null;
  
  function showShock(){
    bfShocked=true;
    var norms=bfEl.querySelectorAll('.bf-frame');
    for(var j=0;j<norms.length;j++) norms[j].style.display='none';
    var shks=bfEl.querySelectorAll('.bf-shock');
    shks[0].style.display='block';
    shockSwap=setInterval(function(){
      for(var j=0;j<shks.length;j++) shks[j].style.display='none';
      shockFrame=(shockFrame+1)%2;
      shks[shockFrame].style.display='block';
    },100);
    bfEl.style.animation='bfShake 0.1s infinite';
  }
  
  function hideShock(){
    bfShocked=false;
    if(shockSwap){clearInterval(shockSwap);shockSwap=null;}
    bfEl.style.animation='';
    var shks=bfEl.querySelectorAll('.bf-shock');
    for(var j=0;j<shks.length;j++) shks[j].style.display='none';
    var norms=bfEl.querySelectorAll('.bf-frame');
    norms[0].style.display='block';
  }
  
  bfEl.addEventListener('pointerdown',function(e){
    e.stopPropagation();
    if(isShooting) return;
    bfTapCount++;
    
    var gcRect=gc.getBoundingClientRect();
    var bfRect=bfEl.getBoundingClientRect();
    var targetX=bfRect.left-gcRect.left+bfRect.width/2;
    var targetY=bfRect.top-gcRect.top+bfRect.height/2;
    
    var frogDiv=document.querySelector('.frog');
    var frogRect=frogDiv.getBoundingClientRect();
    var startX=frogRect.left-gcRect.left+frogRect.width*_mouthX[frogStage];
    var startY=frogRect.top-gcRect.top+frogRect.height*_mouthY[frogStage];
    
    isShooting=true;
    setFrame('open');
    pauseAnim();
    
    var tongue=document.getElementById('tng');
    var gcH=gc.offsetHeight;
    var dx=targetX-startX;
    var dy=targetY-startY;
    var dist=Math.sqrt(dx*dx+dy*dy);
    var ang=Math.atan2(dx,-dy)*180/Math.PI;
    tongue.style.transition='none';
    tongue.style.left=startX+'px';
    tongue.style.top='auto';
    tongue.style.bottom=(gcH-startY)+'px';
    tongue.style.height='0px';
    tongue.style.opacity='1';
    tongue.style.transform='translateX(-50%) rotate('+ang+'deg)';
    tongue.style.transformOrigin='bottom center';
    requestAnimationFrame(function(){
      tongue.style.transition='height 0.13s ease-out';
      tongue.style.height=dist+'px';
    });
    
    setTimeout(function(){
      showShock();
      
      var phrase;
      if(bfTapCount>=3){
        phrase=BF_ANGRY[Math.floor(Math.random()*BF_ANGRY.length)];
      } else {
        phrase=BF_PHRASES[Math.floor(Math.random()*BF_PHRASES.length)];
      }
      sb('\u{1F98B} '+phrase,1500,'#E65100');
      playBfVoice();
      
      tongue.style.transition='height 0.1s ease-in';
      tongue.style.height='0px';
      setTimeout(function(){
        tongue.style.opacity='0';
        isShooting=false;
        setFrame('a');
        resumeAnim();
      },200);
      
      setTimeout(function(){
        hideShock();
        if(bfTapCount>=3){
          bfVx=(Math.random()>0.5?1:-1)*0.02;
          bfVy=-0.015;
          setTimeout(function(){
            bfVx=(Math.random()-0.5)*0.006;
            bfVy=(Math.random()-0.5)*0.004;
            bfTapCount=0;
          },2000);
        } else {
          bfVx=(Math.random()>0.5?1:-1)*0.012;
          bfVy=(Math.random()-0.5)*0.008;
          setTimeout(function(){
            bfVx=(Math.random()-0.5)*0.006;
            bfVy=(Math.random()-0.5)*0.004;
          },500);
        }
      },1200);
    },260);
  });
  
  gc.appendChild(bfEl);
  
  setInterval(function(){
    if(bfShocked) return;
    var frames=bfEl.querySelectorAll('.bf-frame');
    for(var j=0;j<frames.length;j++) frames[j].style.display='none';
    bfFrame=(bfFrame+1)%2;
    frames[bfFrame].style.display='block';
  },250);
  
  bfX=0.2+Math.random()*0.5;
  bfY=0.15+Math.random()*0.25;
  setInterval(updateButterfly,30);
}

function updateButterfly(){
  if(!bfEl)return;
  const cW=gc.clientWidth, cH=gc.clientHeight;
  
  // 부드러운 방향 변경
  if(Math.random()<0.02){
    bfVx+=(Math.random()-0.5)*0.003;
    bfVy+=(Math.random()-0.5)*0.002;
  }
  
  // 속도 제한 (파리보다 느리고 우아하게)
  const maxV=0.005;
  bfVx=Math.max(-maxV,Math.min(maxV,bfVx));
  bfVy=Math.max(-maxV,Math.min(maxV,bfVy));
  
  bfX+=bfVx;
  bfY+=bfVy;
  
  // 경계 반사 (나비 크기 고려)
  var bfW=bfEl.offsetWidth||cW*0.14;
  var bfH=bfEl.offsetHeight||cW*0.1;
  var maxX=(cW-bfW)/cW;
  var maxY=(cH*0.5-bfH)/cH;
  if(bfX<0.02){bfX=0.02;bfVx=Math.abs(bfVx);}
  if(bfX>maxX){bfX=maxX;bfVx=-Math.abs(bfVx);}
  if(bfY<0.02){bfY=0.02;bfVy=Math.abs(bfVy);}
  if(bfY>maxY){bfY=maxY;bfVy=-Math.abs(bfVy);}
  
  // 위치 적용
  bfEl.style.left=(bfX*cW)+'px';
  bfEl.style.top=(bfY*cH)+'px';
  
  // 이동 방향으로 머리 회전 (scaleX로 좌우 + 약간 기울기)
  const angle=Math.atan2(bfVy,bfVx)*180/Math.PI;
  const flipX=bfVx<0?'scaleX(-1)':'scaleX(1)';
  const tilt=Math.max(-15,Math.min(15,bfVy*2000));
  bfEl.style.transform=flipX+' rotate('+tilt+'deg)';
}

const VOICE={
  where_is:safeAudio('assets/game/sounds/voice_where_is.mp3'),
  find_for_me:safeAudio('assets/game/sounds/voice_find_for_me.mp3'),
  i_see:safeAudio('assets/game/sounds/voice_i_see.mp3'),
  tap:safeAudio('assets/game/sounds/voice_tap.mp3'),
  can_you_see:safeAudio('assets/game/sounds/voice_can_you_see.mp3'),
  help_me_find:safeAudio('assets/game/sounds/voice_help_me_find.mp3'),
  look:safeAudio('assets/game/sounds/voice_look.mp3'),
  over_there:safeAudio('assets/game/sounds/voice_over_there.mp3'),
  catch_v:safeAudio('assets/game/sounds/voice_catch_v.mp3'),
  congrats:safeAudio('assets/game/sounds/voice_congrats.mp3'),
  you_did_it:safeAudio('assets/game/sounds/voice_you_did_it.mp3'),
  hooray:safeAudio('assets/game/sounds/voice_hooray.mp3'),
  tap_the_letter:safeAudio('assets/game/sounds/voice_tap_the_letter.mp3'),
  excellent:safeAudio('assets/game/sounds/voice_excellent.mp3'),
  good_job:safeAudio('assets/game/sounds/voice_good_job.mp3'),
  nice:safeAudio('assets/game/sounds/voice_nice.mp3'),
  awesome:safeAudio('assets/game/sounds/voice_awesome.mp3'),
  great_catch:safeAudio('assets/game/sounds/voice_great_catch.mp3'),
  youre_a_genius:safeAudio('assets/game/sounds/voice_youre_a_genius.mp3'),
  thats_right:safeAudio('assets/game/sounds/voice_thats_right.mp3'),
  amazing:safeAudio('assets/game/sounds/voice_amazing.mp3'),
  well_done:safeAudio('assets/game/sounds/voice_well_done.mp3'),
  super:safeAudio('assets/game/sounds/voice_super.mp3'),
  fantastic:safeAudio('assets/game/sounds/voice_fantastic.mp3'),
  you_got_it:safeAudio('assets/game/sounds/voice_you_got_it.mp3'),
  perfect:safeAudio('assets/game/sounds/voice_perfect.mp3'),
  brilliant:safeAudio('assets/game/sounds/voice_brilliant.mp3'),
  way_to_go:safeAudio('assets/game/sounds/voice_way_to_go.mp3'),
  bingo:safeAudio('assets/game/sounds/voice_bingo.mp3'),
  yummy:safeAudio('assets/game/sounds/voice_yummy.mp3'),
  yummy_yummy:safeAudio('assets/game/sounds/voice_yummy_yummy.mp3'),
  i_wanna_eat:safeAudio('assets/game/sounds/voice_i_wanna_eat.mp3'),
  give_me:safeAudio('assets/game/sounds/voice_give_me.mp3'),
  i_need:safeAudio('assets/game/sounds/voice_i_need.mp3'),
  find:safeAudio('assets/game/sounds/voice_find.mp3'),
  looks_so_yummy:safeAudio('assets/game/sounds/voice_looks_so_yummy.mp3'),
  gimme:safeAudio('assets/game/sounds/voice_gimme.mp3'),
  bring_me:safeAudio('assets/game/sounds/voice_bring_me.mp3'),
  please_v:safeAudio('assets/game/sounds/voice_please_v.mp3'),
  im_so_hungry:safeAudio('assets/game/sounds/voice_im_so_hungry.mp3'),
  im_hungry:safeAudio('assets/game/sounds/voice_im_hungry.mp3'),
  im_so_full:safeAudio('assets/game/sounds/voice_im_so_full.mp3'),
};
function playVoice(k,vol){var v=VOICE[k];if(!v)return;v.currentTime=0;v.volume=vol||0.8;v.play().catch(function(){});}

const SND_WOOWECK=safeAudio('assets/game/sounds/wooweck.mp3');
const BF_VOICES=[
  safeAudio('assets/bugs/sounds/butterfly_voice1.mp3'),
  safeAudio('assets/bugs/sounds/butterfly_voice2.mp3')
];
let bfVoiceIdx=0;
function playBfVoice(){
  var v=BF_VOICES[bfVoiceIdx];
  v.currentTime=0;v.volume=0.8;v.play().catch(function(){});
  bfVoiceIdx=(bfVoiceIdx+1)%2;
}

const BUTTERFLY_SHOCK=[
  'assets/bugs/images/butterfly_shock1.png',
  'assets/bugs/images/butterfly_shock2.png'
];

const CATERPILLAR_FRAMES=[
  'assets/bugs/images/caterpillar_frame1.png',
  'assets/bugs/images/caterpillar_frame2.png',
  'assets/bugs/images/caterpillar_frame3.png',
  'assets/bugs/images/caterpillar_frame4.png',
  'assets/bugs/images/caterpillar_frame5.png'
];

// 애벌레 (연잎 위)
let caterpillarFrame=0;
let caterpillarTapCount=0;
const BUG_PHRASES=[
  "Don't touch me!","Stop it!","Go away!","I'm busy!",
  "Not now!","Ugh, leave me alone!","Hey! Quit it!","Buzz off!"
];
const BUG_ANGRY=[
  "I said STOP!","Are you serious?!","ENOUGH!","AAAARGH!!"
];

function initCaterpillar(){
  // 애벌레 전용 연잎 (기존 연잎 이미지 재사용)
  const mainLeaf=document.querySelector('.lilypad img');
  const cLeaf=document.createElement('div');
  cLeaf.className='caterpillar-leaf';
  cLeaf.style.cssText='position:absolute;bottom:28%;right:3%;width:18vmin;z-index:6;pointer-events:none;';
  const leafImg=document.createElement('img');
  leafImg.src=mainLeaf.src;
  leafImg.style.cssText='width:100%;opacity:0.85;';
  cLeaf.appendChild(leafImg);
  gc.appendChild(cLeaf);
  
  const cDiv=document.createElement('div');
  cDiv.id='caterpillar';
  cDiv.style.cssText='position:absolute;bottom:31%;right:7%;width:8vmin;z-index:7;cursor:pointer;transition:transform 0.1s;';
  
  // 5프레임 img
  for(let i=0;i<5;i++){
    const im=document.createElement('img');
    im.src=CATERPILLAR_FRAMES[i];
    im.style.cssText='width:100%;display:'+(i===0?'block':'none')+';pointer-events:none;transform:scaleX(-1);';
    im.className='cp-frame';
    im.dataset.idx=i;
    cDiv.appendChild(im);
  }
  
  // 터치 이벤트
  cDiv.addEventListener('pointerdown',function(e){
    e.stopPropagation();
    if(isShooting) return;
    caterpillarTapCount++;
    
    // 혀 발사
    isShooting=true;
    setFrame('open');
    pauseAnim();
    
    var gcRect=gc.getBoundingClientRect();
    var bugRect=cDiv.getBoundingClientRect();
    var targetX=bugRect.left-gcRect.left+bugRect.width/2;
    var targetY=bugRect.top-gcRect.top+bugRect.height/2;
    
    var frogDiv=document.querySelector('.frog');
    var frogRect=frogDiv.getBoundingClientRect();
    var startX=frogRect.left-gcRect.left+frogRect.width*_mouthX[frogStage];
    var startY=frogRect.top-gcRect.top+frogRect.height*_mouthY[frogStage];
    
    var tongue=document.getElementById('tng');
    var gcH=gc.offsetHeight;
    var dx=targetX-startX;
    var dy=targetY-startY;
    var dist=Math.sqrt(dx*dx+dy*dy);
    var ang=Math.atan2(dx,-dy)*180/Math.PI;
    tongue.style.transition='none';
    tongue.style.left=startX+'px';
    tongue.style.top='auto';
    tongue.style.bottom=(gcH-startY)+'px';
    tongue.style.height='0px';
    tongue.style.opacity='1';
    tongue.style.transform='translateX(-50%) rotate('+ang+'deg)';
    tongue.style.transformOrigin='bottom center';
    requestAnimationFrame(function(){
      tongue.style.transition='height 0.13s ease-out';
      tongue.style.height=dist+'px';
    });
    
    // 혀 도착 → 떨림 + 대사
    setTimeout(function(){
      // 떨림
      cDiv.style.animation='bfShake 0.1s infinite';
      
      var phrase;
      if(caterpillarTapCount>=3){
        phrase=BUG_ANGRY[Math.floor(Math.random()*BUG_ANGRY.length)];
      } else {
        phrase=BUG_PHRASES[Math.floor(Math.random()*BUG_PHRASES.length)];
      }
      sb('\u{1F41B} '+phrase,1500,'#E65100');
      sp(phrase,0.9);
      
      // 혀 복귀
      tongue.style.transition='height 0.1s ease-in';
      tongue.style.height='0px';
      setTimeout(function(){
        tongue.style.opacity='0';
        isShooting=false;
        setFrame('a');
        resumeAnim();
      },200);
      
      // 1.2초 후 떨림 해제 + 도망
      setTimeout(function(){
        cDiv.style.animation='';
        if(caterpillarTapCount>=3){
          cDiv.style.transition='transform 0.5s, opacity 0.5s';
          cDiv.style.transform='translateX(200%) rotate(30deg)';
          cDiv.style.opacity='0';
          setTimeout(function(){
            cDiv.style.transition='transform 1s, opacity 1s';
            cDiv.style.transform='translateX(0) rotate(0deg)';
            cDiv.style.opacity='1';
            caterpillarTapCount=0;
          },3000);
        }
      },1200);
    },260);
  });
  
  gc.appendChild(cDiv);
  
  // 꿈틀꿈틀 애니메이션 (프레임 스왑)
  setInterval(()=>{
    const frames=cDiv.querySelectorAll('.cp-frame');
    frames.forEach(f=>f.style.display='none');
    caterpillarFrame=(caterpillarFrame+1)%5;
    frames[caterpillarFrame].style.display='block';
  },200);
}

const LETTER_AUDIO={
  A:'assets/abc/sounds/letter_a.mp3',
  B:'assets/abc/sounds/letter_b.mp3',
  C:'assets/abc/sounds/letter_c.mp3',
  D:'assets/abc/sounds/letter_d.mp3',
  E:'assets/abc/sounds/letter_e.mp3',
  F:'assets/abc/sounds/letter_f.mp3',
  G:'assets/abc/sounds/letter_g.mp3',
  H:'assets/abc/sounds/letter_h.mp3',
  I:'assets/abc/sounds/letter_i.mp3',
  J:'assets/abc/sounds/letter_j.mp3',
  K:'assets/abc/sounds/letter_k.mp3',
  L:'assets/abc/sounds/letter_l.mp3',
  M:'assets/abc/sounds/letter_m.mp3',
  N:'assets/abc/sounds/letter_n.mp3',
  O:'assets/abc/sounds/letter_o.mp3',
  P:'assets/abc/sounds/letter_p.mp3',
  Q:'assets/abc/sounds/letter_q.mp3',
  R:'assets/abc/sounds/letter_r.mp3',
  S:'assets/abc/sounds/letter_s.mp3',
  T:'assets/abc/sounds/letter_t.mp3',
  U:'assets/abc/sounds/letter_u.mp3',
  V:'assets/abc/sounds/letter_v.mp3',
  W:'assets/abc/sounds/letter_w.mp3',
  X:'assets/abc/sounds/letter_x.mp3',
  Y:'assets/abc/sounds/letter_y.mp3',
  Z:'assets/abc/sounds/letter_z.mp3'
};

// 알파벳 mp3 재생 함수
let letterPlayers={};
function playLetter(l,cb){
  const key=l.toUpperCase();
  const src=LETTER_AUDIO[key];
  if(!src)return;
  if(!letterPlayers[key]){letterPlayers[key]=safeAudio(src);}
  const a=letterPlayers[key];
  a.currentTime=0;
  a.volume=1;
  if(cb)a.onended=cb;
  a.play().catch(()=>{});
}

function spLetter(l,r=0.7){sp(LETTER_SOUND[l.toUpperCase()]||l,r);}

const CHEERS=[
  {t:'Good job!',vk:'good_job'},{t:'Nice!',vk:'nice'},{t:'Awesome!',vk:'awesome'},
  {t:'Great catch!',vk:'great_catch'},{t:"You're a genius!",vk:'youre_a_genius'},
  {t:"That's right!",vk:'thats_right'},{t:'Amazing!',vk:'amazing'},
  {t:'Well done!',vk:'well_done'},{t:'Super!',vk:'super'},
  {t:'Fantastic!',vk:'fantastic'},{t:'You got it!',vk:'you_got_it'},
  {t:'Perfect!',vk:'perfect'},{t:'Brilliant!',vk:'brilliant'},
  {t:'Way to go!',vk:'way_to_go'},{t:'Excellent!',vk:'excellent'}
];
function getCheer(){return CHEERS[Math.floor(Math.random()*CHEERS.length)];}

const NUDGES=[
  {text:'Where is {L}?',vk:'where_is'},
  {text:'Find {L} for me!',vk:'find_for_me'},
  {text:'I see {L}!',vk:'i_see'},
  {text:'Tap {L}!',vk:'tap'},
  {text:'{L}! {L}!',vk:null},
  {text:'Can you see {L}?',vk:'can_you_see'},
  {text:'Help me find {L}!',vk:'help_me_find'},
  {text:'Look! {L}!',vk:'look'},
  {text:'Over there! {L}!',vk:'over_there'},
  {text:'Catch {L}!',vk:'catch_v'}
];
let nudgeCount=0;
function getNudge(letter){
  nudgeCount++;
  if(nudgeCount%5===0) return {text:"I'm hungry~",vk:null};
  const n=NUDGES[Math.floor(Math.random()*NUDGES.length)];
  return {text:n.text.replace(/\{L\}/g,letter),vk:n.vk};
}


function getPhrase(letter){var p=PHRASES[Math.floor(Math.random()*PHRASES.length)];return {text:p.text.replace(/\{L\}/g,letter),vk:p.vk};}

const AC=window.AudioContext||window.webkitAudioContext;
let ax;
function ea(){try{if(!ax&&AC)ax=new AC();if(ax&&ax.state==='suspended')ax.resume();}catch(e){console.warn('AudioContext error:',e);}}
function pt(f,d,t='sine',v=.3){ea();if(!ax)return;const o=ax.createOscillator(),g=ax.createGain();o.type=t;o.frequency.setValueAtTime(f,ax.currentTime);g.gain.setValueAtTime(v,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+d);o.connect(g);g.connect(ax.destination);o.start();o.stop(ax.currentTime+d)}
function psg(){ea();if(!ax)return;const o=ax.createOscillator(),g=ax.createGain();o.type='sine';o.frequency.setValueAtTime(80,ax.currentTime);o.frequency.exponentialRampToValueAtTime(40,ax.currentTime+.3);o.frequency.exponentialRampToValueAtTime(90,ax.currentTime+.5);o.frequency.exponentialRampToValueAtTime(35,ax.currentTime+.8);g.gain.setValueAtTime(.08,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+.8);o.connect(g);g.connect(ax.destination);o.start();o.stop(ax.currentTime+.8)}
function py(){[0,100,200].forEach((d,i)=>setTimeout(()=>pt(523+i*100,.15,'sine',.25),d))}
function pk(){pt(200,.1,'sawtooth',.2);setTimeout(()=>pt(150,.15,'sawtooth',.25),100);setTimeout(()=>pt(100,.3,'sawtooth',.15),200)}
function ptg(){ea();if(!ax)return;const o=ax.createOscillator(),g=ax.createGain();o.type='sine';o.frequency.setValueAtTime(800,ax.currentTime);o.frequency.exponentialRampToValueAtTime(200,ax.currentTime+.15);g.gain.setValueAtTime(.15,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+.15);o.connect(g);g.connect(ax.destination);o.start();o.stop(ax.currentTime+.15)}
function pbr(){ea();if(!ax)return;const o=ax.createOscillator(),g=ax.createGain();o.type='sawtooth';o.frequency.setValueAtTime(120,ax.currentTime);o.frequency.exponentialRampToValueAtTime(60,ax.currentTime+.4);g.gain.setValueAtTime(.08,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+.5);o.connect(g);g.connect(ax.destination);o.start();o.stop(ax.currentTime+.5)}
function psu(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>pt(f,.2,'sine',.2),i*80))}
function sp(t,r=1.1,onStart){try{if('speechSynthesis'in window&&speechSynthesis){const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=r;u.pitch=1.8;u.volume=1;if(onStart)u.onstart=onStart;u.onerror=function(){};speechSynthesis.speak(u)}}catch(e){console.warn('TTS unavailable');}}

const L='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const L_LOWER='abcdefghijklmnopqrstuvwxyz';
let gameMode='ABC';
let frogStage=1;
let isShooting=false;
let col=new Set(),sc=0,cm=0,fl=[],ct='';
let gp='start',ia=false,fid=0,rc=0,it=null;
let animPaused=false;

const gc=document.getElementById('gc');
const frog=document.getElementById('frog');
const tng=document.getElementById('tng');
const bbl=document.getElementById('bbl');
const cbd=document.getElementById('cb');
const scd=document.getElementById('sc');
const fc=document.getElementById('fc');
const cb2=document.getElementById('cb2');

// 파리 날갯짓
let fs=false;
setInterval(()=>{fs=!fs;document.querySelectorAll('.fly').forEach(e=>{if(e.classList.contains('spider')){const f1=e.querySelector('.spider-f1'),f2=e.querySelector('.spider-f2');if(f1&&f2){f1.style.display=fs?'none':'block';f2.style.display=fs?'block':'none';}return;}const d=e.dataset.dir||'front';const imgs=gameMode==='abc'?DRAGONFLY_IMGS:FLY_IMGS;const img=e.querySelector('.fly-sprite');if(img)img.src=imgs[d][fs?1:0]})},120);

// === 개구리 프레임 전환 ===
// === mode display helpers ===
function displayLetter(l){
  const upper=l.toUpperCase();
  if(gameMode==='abc') return upper.toLowerCase();
  if(gameMode==='ABc' && mixSlotLetters[upper]) return mixSlotLetters[upper];
  return upper;
}
function displayTarget(){
  if(gameMode==='abc') return ct.toLowerCase();
  if(gameMode==='ABc' && mixSlotLetters[ct]) return mixSlotLetters[ct];
  return ct;
}

// === 5-stage frog ===
function getStageFromCount(){
  const n=col.size;
  if(n<=5) return 1;
  if(n<=10) return 2;
  if(n<=15) return 3;
  if(n<=20) return 4;
  return 5;
}
function updateFrogStage(){
  const newStage=getStageFromCount();
  if(newStage!==frogStage){
    frogStage=newStage;
    setFrame('a');
  }
}

const allFrogImgs = document.querySelectorAll('.frog-img');
allFrogImgs.forEach(img=>{img.style.display='none';img.classList.remove('active');});
frogStage=4;
const initFrog=document.getElementById('fs4a');
if(initFrog){initFrog.style.display='block';initFrog.classList.add('active');}
let currentFrogEl=initFrog||null;
function setFrame(pose){
  // pose: 'a', 'b', 'open', 'yuck'
  const suffix = pose==='open' ? 'o' : pose==='yuck' ? 'y' : pose;
  const targetId = 'fs'+frogStage+suffix;
  const el=document.getElementById(targetId);
  if(!el) return;
  const prev=currentFrogEl;
  el.style.display='block';el.classList.add('active');
  currentFrogEl=el;
  if(prev && prev!==el){prev.style.display='none';prev.classList.remove('active');}
}

// === 숨쉬기 애니메이션 (1초 주기) ===
let breatheInterval;
function startBreathe(){
  breatheInterval = setInterval(()=>{
    if(animPaused || ia) return;
    // base → breathe → base
    setFrame('b');
    const cr=document.getElementById('crown');if(cr)cr.style.top='1.5%';
    setTimeout(()=>{
      if(!animPaused && !ia) setFrame('a');
      const cr2=document.getElementById('crown');if(cr2)cr2.style.top='1%';
    }, 400);
  }, 1000);
}

// === 눈 깜빡임 (비활성화 - 새 스프라이트에 깜빡임 프레임 없음) ===
let blinkTimeout;
function scheduleBlink(){}

function pauseAnim(){ animPaused = true;  }
function resumeAnim(){ animPaused = false; setFrame('a');  }

let mixSlotLetters={};
function icb(){
  cb2.innerHTML='';
  mixSlotLetters={};
  let letters;
  if(gameMode==='ABc'){
    // ABc 모드: 각 칸마다 랜덤으로 대/소문자 배정
    letters=L.split('').map(c=>{
      const pick=Math.random()<0.5?c:c.toLowerCase();
      mixSlotLetters[c]=pick;
      return pick;
    });
  } else {
    letters = ((gameMode==='abc') ? L_LOWER : L).split('');
  }
  for(let i=0;i<26;i++){
    const s=document.createElement('div');
    s.className='slot';
    s.id='s'+L[i];
    s.textContent=letters[i];
    cb2.appendChild(s);
  }
}

function grl(n,m){
  const used=new Set(fl.map(f=>f.letter));
  used.add(m);
  let pool=L.split('').filter(l=>!used.has(l));
  let r=[m];
  for(let i=0;i<n-1&&pool.length;i++){
    const x=Math.floor(Math.random()*pool.length);
    r.push(pool[x]);pool.splice(x,1);
  }
  for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]}
  return r;
}
function pnt(){const u=L.split('').filter(l=>!col.has(l)&&l!==ct);if(!u.length){const u2=L.split('').filter(l=>!col.has(l));if(!u2.length){stc();return null}return u2[Math.floor(Math.random()*u2.length)]}return u[Math.floor(Math.random()*u.length)]}

function cf(l,t,sx,sy){
  if(fl.some(f=>f.letter===l))return fl.find(f=>f.letter===l);
  const id=fid++;const e=document.createElement('div');
  e.className='fly';
  const dl=displayLetter(l);const lowerCls=dl!==dl.toUpperCase()?' lower':'';const roundCls='acemnorsuvwxzpq'.includes(dl)?' round':'';
  if(gameMode==='ABc'){
    e.classList.add('spider');
    e.innerHTML='<div class="spider-web"></div><img class="fly-sprite spider-sprite spider-f1" src="'+SPIDER_IMGS[0]+'"><img class="fly-sprite spider-sprite spider-f2" src="'+SPIDER_IMGS[1]+'" style="display:none"><div class="fly-letter'+lowerCls+roundCls+'">'+dl+'</div><div class="fly-slime">💧</div>';
    e.dataset.dir='front';
  } else {
    const dir=DIRS[Math.floor(Math.random()*3)];e.dataset.dir=dir;const imgs=gameMode==='abc'?DRAGONFLY_IMGS:FLY_IMGS;
    e.innerHTML='<img class="fly-sprite" src="'+imgs[dir][0]+'"><div class="fly-letter'+lowerCls+roundCls+'">'+dl+'</div><div class="fly-slime">💧</div>';
  }
  const cW=gc.offsetWidth||400,cH=gc.offsetHeight||700;
  let x,y;
  if(gameMode==='ABc'){
    // 거미: 화면 가로 넓게 퍼뜨리고, 위쪽에서 시작
    x=sx||(cW*0.05+Math.random()*(cW*0.75));
    y=sy||(cH*0.02+Math.random()*(cH*0.08));
  } else {
    x=sx||(cW*0.02+Math.random()*(cW*0.55));
    y=sy||(cH*0.05+Math.random()*(cH*0.25));
  }
  e.style.left=x+'px';e.style.top=y+'px';
  e.addEventListener('click',ev=>{ev.stopPropagation();oft(id)});
  e.addEventListener('touchstart',ev=>{ev.preventDefault();ev.stopPropagation();oft(id)},{passive:false});
  fc.appendChild(e);
  if(gameMode==='ABc'){
    // 거미: 상하 움직임 + 좌우 흔들림 파라미터
    const o={id,letter:l,isTarget:t,el:e,x,y,vx:0,vy:0.8+Math.random()*0.6,slimy:false,
      spider:true,baseX:x,swayPhase:Math.random()*Math.PI*2,swaySpeed:0.02+Math.random()*0.015,swayAmp:15+Math.random()*20,goingDown:true};
    fl.push(o);return o;
  }
  const o={id,letter:l,isTarget:t,el:e,x,y,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*1.5,slimy:false};
  fl.push(o);return o;
}
function rf(id){const i=fl.findIndex(f=>f.id===id);if(i!==-1){fl[i].el.remove();fl.splice(i,1)}}
function raf(){fl.forEach(f=>f.el.remove());fl=[]}
function uf(){
  const cW=gc.offsetWidth||400,cH=gc.offsetHeight||700,mY=cH*.35;
  fl.forEach(f=>{
    const fw=f.el.offsetWidth||cW*0.2;
    const fh=f.el.offsetHeight||cH*0.15;
    if(f.spider){
      // 거미: 상하로 내려왔다 올라감 + 좌우 흔들림
      if(f.goingDown){
        f.y+=f.vy;
        if(f.y>mY){f.goingDown=false;}
      } else {
        f.y-=f.vy;
        if(f.y<5){f.goingDown=true;}
      }
      // 좌우 흔들림 (사인파)
      f.swayPhase+=f.swaySpeed;
      f.x=f.baseX+Math.sin(f.swayPhase)*f.swayAmp;
      // 경계 처리
      if(f.x<0)f.x=0;
      if(f.x>cW-fw)f.x=cW-fw;
      f.el.style.left=f.x+'px';f.el.style.top=f.y+'px';
      // 거미줄 길이 업데이트 (거미 위치까지 줄 늘이기)
      const web=f.el.querySelector('.spider-web');
      if(web) web.style.height=f.y+'px';
      return;
    }
    f.x+=f.vx;f.y+=f.vy;
    if(f.x<0){f.x=0;f.vx*=-1}
    if(f.x>cW-fw){f.x=cW-fw;f.vx*=-1}
    if(f.y<0){f.y=0;f.vy*=-1}
    if(f.y>mY){f.y=mY;f.vy*=-1}
    if(Math.random()<.02)f.vx+=(Math.random()-.5);
    if(Math.random()<.02)f.vy+=(Math.random()-.5)*.8;
    f.vx=Math.max(-2.5,Math.min(2.5,f.vx));f.vy=Math.max(-2,Math.min(2,f.vy));
    f.el.style.left=f.x+'px';f.el.style.top=f.y+'px';
  });
}

function sb(t,d=1500,c){
  // 타겟 글자를 오렌지색으로 하이라이트
  const target=typeof ct!=='undefined'?displayTarget():'';
  if(target&&t.length>4&&t.includes(target)){
    bbl.innerHTML=t.replace(new RegExp('\\b'+target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g'),'<span style="color:#FF6F00;font-size:120%">'+target+'</span>');
  }else{
    bbl.textContent=t;
  }
  bbl.classList.remove('bbl-left','bbl-right','bbl-round');
  // 짧은 텍스트(이모지+글자 4자 이하)면 둥근 모양
  if(t.length<=4) bbl.classList.add('bbl-round');
  
  // 파리 위치 분석 → 비어있는 쪽에 배치
  const cW=gc.offsetWidth;
  let leftCount=0,rightCount=0;
  fl.forEach(f=>{
    if(f.x < cW/2) leftCount++;
    else rightCount++;
  });
  const side = leftCount <= rightCount ? 'bbl-left' : 'bbl-right';
  bbl.classList.add(side);
  
  bbl.classList.add('show');
  bbl.style.color=c||'#333';
  // 개구리 기준 배치 (PC/태블릿: 옆, 모바일: 머리 위)
  const fr=document.getElementById('frog');
  if(fr){
    const frRect=fr.getBoundingClientRect();
    const gcRect=gc.getBoundingClientRect();
    const frogTop=frRect.top-gcRect.top;
    const isWide=gc.offsetWidth>500||window.innerWidth>768;
    if(isWide){
      // PC/태블릿: 개구리 옆 중간에 배치 (파리/개구리와 안 겹치게)
      const frogBottom=frogTop+frRect.height*0.45;
      bbl.style.bottom='auto';
      bbl.style.top=frogBottom+'px';
    }else{
      // 모바일: 개구리 머리 위
      bbl.style.top='auto';
      const isRound=bbl.classList.contains('bbl-round');
      bbl.style.bottom=(gc.offsetHeight-frogTop-(isRound?50:5))+'px';
    }
  }
  setTimeout(()=>bbl.classList.remove('show'),d);
}
function bs(x,y,n=6){const em=['⭐','✨','🌟','💫','🎉','🎵'];for(let i=0;i<n;i++){const s=document.createElement('div');s.className='starburst';s.textContent=em[i%em.length];s.style.left=x+'px';s.style.top=y+'px';const a=(Math.PI*2/n)*i,d=60+Math.random()*40;s.style.setProperty('--tx',Math.cos(a)*d+'px');s.style.setProperty('--ty',Math.sin(a)*d+'px');gc.appendChild(s);setTimeout(()=>s.remove(),800)}}
function slp(l,x,y){const p=document.createElement('div');p.className='lpop';p.textContent=l;p.style.left=x+'px';p.style.top=y+'px';p.style.color='#FFD700';p.style.textShadow='3px 3px 0 #FF6F00';gc.appendChild(p);setTimeout(()=>p.remove(),1000)}

function shoot(tx,ty,cb){
  ia=true;pauseAnim();ptg();setFrame('open');
  const fr=frog.getBoundingClientRect(),cr=gc.getBoundingClientRect();
  // 입 중앙 위치 (gc 기준) - 단계별 입 위치 비율 (debugSet으로 조정 가능)
  const sx=fr.left+fr.width*_mouthX[frogStage]-cr.left;
  const sy=fr.top+fr.height*_mouthY[frogStage]-cr.top;
  // 파리까지 벡터
  const dx=tx-sx,dy=ty-sy;
  const dist=Math.sqrt(dx*dx+dy*dy);
  // 각도 (0=위, 시계방향 양수)
  const ang=Math.atan2(dx,-dy)*(180/Math.PI);
  // 혀 위치: bottom 기준으로 입 위치에 고정
  const gcH=gc.offsetHeight;
  tng.style.transition='none';
  tng.style.left=sx+'px';
  tng.style.top='auto';
  tng.style.bottom=(gcH-sy)+'px';
  tng.style.height='0px';
  tng.style.opacity='1';
  tng.style.transform='translateX(-50%) rotate('+ang+'deg)';
  tng.style.transformOrigin='bottom center';
  // 혀 늘어나기 (bottom 고정, 위로 성장)
  requestAnimationFrame(()=>{
    tng.style.transition='height 0.13s ease-out';
    tng.style.height=dist+'px';
  });
  // 파리 도달 → 콜백 → 혀 수축
  setTimeout(()=>{
    cb();
    setTimeout(()=>{
      tng.style.transition='height 0.1s ease-in';
      tng.style.height='0px';
      setTimeout(()=>{tng.style.opacity='0';ia=false;setFrame('a');resumeAnim();},120);
    },80);
  },180);
}

function occ(f){
  clearRit();
  cm++;sc+=10*cm;scd.textContent='🌟 '+sc;
  var fx=f.x+f.el.offsetWidth/2,fy=f.y+f.el.offsetHeight/2;
  col.add(f.letter);var s=document.getElementById('s'+f.letter);if(s)s.classList.add('got');
  updateFrogStage();
  bs(fx,fy,8);slp(displayLetter(f.letter),fx,fy);py();setFrame('open');
  
  // 파리를 개구리 입으로 끌고가기
  var fr=frog.getBoundingClientRect(),cr=gc.getBoundingClientRect();
  var mouthX=fr.left-cr.left+fr.width*0.5;
  var mouthY=fr.top-cr.top+fr.height*0.38;
  var flyEl=f.el;
  var fi=fl.findIndex(x=>x.id===f.id);
  if(fi!==-1) fl.splice(fi,1);
  flyEl.style.transition='all 0.3s ease-in';
  flyEl.style.left=mouthX+'px';
  flyEl.style.top=mouthY+'px';
  flyEl.style.transform='scale(0.2)';
  flyEl.style.opacity='0.5';
  setTimeout(function(){flyEl.remove()},350);
  
  if(cm>=3){sb('🎉 BINGO 🎉',2000,'#E65100');psu();frog.className='frog dancing';setTimeout(function(){frog.className='frog'},1200);playVoice('bingo')}
  else if(cm>=2){sb('😋 Yummy Yummy',1500,'#FF6F00');playVoice('yummy_yummy')}
  else{sb('😋 Yummy',1200,'#FF8F00');playVoice('yummy')}
  var cheer=getCheer();setTimeout(function(){sb('🎉 '+cheer.t,1500,'#FF6F00');playVoice(cheer.vk)},800);
  if(cm>=2){cbd.textContent='🔥 '+cm+' combo!';cbd.classList.add('show');setTimeout(function(){cbd.classList.remove('show')},1500)}
  setTimeout(function(){resumeAnim();frog.className='frog';snr()},2800);
}

function owc(f){
  cm=0;pk();sb('🤢 Yucky!',1200,'#D32F2F');SND_WOOWECK.currentTime=0;SND_WOOWECK.volume=1.0;SND_WOOWECK.play().catch(function(){});
  setTimeout(()=>{
    pauseAnim();
    setFrame('yuck')
    frog.className='frog shaking';
    setTimeout(()=>{frog.className='frog';resumeAnim()},1300);
  },220);
  f.slimy=true;f.el.classList.remove('sparkle');f.el.classList.add('slimy');
  f.vx=(Math.random()-.5)*5;f.vy=-3-Math.random()*2;rit();
}

function oft(id){
  if(ia||gp!=='playing')return;ea();rit();
  const f=fl.find(x=>x.id===id);if(!f)return;
  const isMatch = f.letter.toUpperCase()===ct.toUpperCase();
  pauseAnim();setFrame('open');
  setTimeout(()=>shoot(f.x+f.el.offsetWidth/2,f.y+f.el.offsetHeight/2,()=>{if(isMatch)occ(f);else owc(f)}),150);
}

function snr(){raf();rc++;ct=pnt();if(!ct)return;
pauseAnim();setFrame('a');
const dTarget=displayTarget();
const phrase=getPhrase(dTarget);
sb(phrase.text,2500,'#2E7D32');
playVoice(phrase.vk);
// MP3 끝난 후 알파벳 재생
var pv=VOICE[phrase.vk];
if(pv){pv.onended=function(){playLetter(ct);pv.onended=null;};}
else{setTimeout(function(){playLetter(ct);},1000);}
setTimeout(()=>{
  resumeAnim();
  const n=Math.min(3+Math.floor(rc/5),5);const ls=grl(n,ct);
  ls.forEach((l,i)=>setTimeout(()=>{
    const f=cf(l,l===ct);
    // 반짝임은 5초 후에 힌트로
    if(l===ct){
      setTimeout(()=>{
        if(f.el&&f.el.parentNode){
          const letterEl=f.el.querySelector('.fly-letter');
          if(letterEl)letterEl.classList.add('flash');
        }
      },7000);
    }
  },i*200));
  // 1.5초 후 글자 한번 외침, 그 다음 rit 패턴 시작
  setTimeout(()=>{
    if(gp==='playing'&&!ia&&ct){
      const ls2=LETTER_SOUND[ct]||ct;
      psg();sb(displayTarget(),1500,'#E65100');playLetter(ct);
    }
    rit();
  },1500);
},2000);
}

let ritTimers=[];
function clearRit(){clearTimeout(it);ritTimers.forEach(t=>clearTimeout(t));ritTimers=[];}
function rit(){clearRit();it=setTimeout(()=>{if(gp!=='playing'||ia||!ct)return;
  const ls=LETTER_SOUND[ct]||ct;
  function callThree(){
    if(gp!=='playing'||ia||!ct)return;
    for(let i=0;i<3;i++){
      ritTimers.push(setTimeout(()=>{
        if(gp!=='playing'||ia||!ct)return;
        psg();sb(displayTarget(),1500,'#E65100');playLetter(ct);
      },i*2000));
    }
    // 3번(0,2,4초) 끝난 후 4초 뒤 반복
    ritTimers.push(setTimeout(()=>{callThree()},4000+2*2000));
  }
  callThree();
},3000);}

function stc(){
  raf();clearRit();
  // BGM 페이드아웃
  let bgmFade=setInterval(()=>{if(SND_BGM.volume>0.03)SND_BGM.volume-=0.03;else{SND_BGM.pause();clearInterval(bgmFade);}},100);
  
  pbr();sb("😊 I'm SO full~ BURP!!",3000,'#2E7D32');playVoice('im_so_full');
  
  // 폭죽 함수
  function firework(x,y,count,colors){
    for(let i=0;i<count;i++){
      const s=document.createElement('div');
      const c=colors[Math.floor(Math.random()*colors.length)];
      const size=3+Math.random()*5;
      s.style.cssText='position:absolute;left:'+x+'px;top:'+y+'px;width:'+size+'px;height:'+size+'px;background:'+c+';border-radius:50%;z-index:100;pointer-events:none;box-shadow:0 0 6px '+c;
      gc.appendChild(s);
      const ang=Math.random()*Math.PI*2;
      const spd=2+Math.random()*6;
      const dx=Math.cos(ang)*spd,dy=Math.sin(ang)*spd;
      let ox=0,oy=0,op=1;
      function ani(){ox+=dx;oy+=dy+0.15;op-=0.012;
        s.style.transform='translate('+ox+'px,'+oy+'px)';s.style.opacity=op;
        if(op>0)requestAnimationFrame(ani);else s.remove();}
      setTimeout(()=>requestAnimationFrame(ani),Math.random()*200);
    }
  }
  
  
  
  const cW=gc.offsetWidth,cH=gc.offsetHeight;
  const fwColors=['#FF1744','#FF9100','#FFEA00','#00E676','#2979FF','#D500F9','#FF4081','#00BCD4'];
  
  // 1단계: 개구리 트림 + 첫 폭죽
  setTimeout(()=>{
    firework(cW*0.5,cH*0.3,40,fwColors);
    psu();
  },500);
  
  // 2단계: 연속 폭죽 (여러 위치)
  setTimeout(()=>{
    firework(cW*0.2,cH*0.2,30,fwColors);
    firework(cW*0.8,cH*0.25,30,fwColors);
    psu();
  },1500);
  
  setTimeout(()=>{
    firework(cW*0.5,cH*0.15,35,fwColors);
    firework(cW*0.3,cH*0.35,25,fwColors);
    firework(cW*0.7,cH*0.3,25,fwColors);
  },2500);
  
  setTimeout(()=>{
    sb('WELL DONE!',4000,'#D500F9');
    playVoice('congrats');
  },3500);
  
  // 4단계: 대형 폭죽 연타
  setTimeout(()=>{
    for(let i=0;i<5;i++){
      setTimeout(()=>{
        firework(cW*(0.15+Math.random()*0.7),cH*(0.1+Math.random()*0.3),45,fwColors);
        psu();
      },i*400);
    }
  },4500);
  
  // 5단계: 왕관 + 최종 메시지
  setTimeout(()=>{
    const crown=document.createElement('div');
    crown.style.cssText='position:absolute;left:52%;top:1%;transform:translateX(-50%);font-size:8vmin;z-index:100;pointer-events:none;animation:crownBounce 0.5s ease-out;';
    crown.id='crown';
    setTimeout(()=>{crown.style.animation='none';},500);
    crown.textContent='👑';
    frog.appendChild(crown);
    
    sb('🏆 ALPHABET MASTER!! 👑',5000,'#FF6F00');
    playVoice('you_did_it');
    
    // 개구리 댄스
    frog.className='frog dancing';
    
    // 마지막 대형 폭죽
    for(let i=0;i<8;i++){
      setTimeout(()=>{
        firework(cW*(0.1+Math.random()*0.8),cH*(0.05+Math.random()*0.35),50,fwColors);
      },i*300);
    }
  },7000);
  
  // 6단계: 곤충 환호 텍스트
  setTimeout(()=>{
    const hooray=document.createElement('div');
    hooray.style.cssText='position:absolute;left:50%;top:20%;transform:translateX(-50%);font-size:6vmin;font-weight:bold;color:#FFD600;z-index:100;pointer-events:none;text-shadow:2px 2px 4px rgba(0,0,0,0.5);text-align:center;animation:crownBounce 0.8s ease-out;';
    hooray.innerHTML='🎊 HOORAY 🎊';
    gc.appendChild(hooray);
    playVoice('hooray');
  },9000);
  
  // GA4 완료 이벤트 + 인앱 리뷰
  try{gtag('event','game_complete',{game_mode:gameMode});}catch(e){}
  setTimeout(()=>{try{if(window.AndroidBridge)AndroidBridge.requestReview();}catch(e){}},10000);

  // 다시하기 버튼
  setTimeout(()=>{
    const btn=document.createElement('button');
    btn.textContent='PLAY AGAIN';
    btn.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:3vmin 8vmin;font-size:5vmin;font-weight:bold;color:#fff;background:linear-gradient(135deg,#FF6F00,#FF9800);border:none;border-radius:12vmin;cursor:pointer;z-index:110;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
    btn.onclick=function(){location.reload();};
    gc.appendChild(btn);
  },11000);
}

function tut(){
  gp='tutorial';sb("🥺 I'm hungry~",2000,'#555');playVoice('im_hungry');psg();
  setTimeout(()=>{
    // 인트로 데모: 파리 자동 잡아먹기 (수집 안 함)
    const df=cf('A',true,gc.offsetWidth*0.35,gc.offsetHeight*0.2);
    setTimeout(()=>{pauseAnim();setFrame('open');setTimeout(()=>{
      shoot(df.x+df.el.offsetWidth/2,df.y+df.el.offsetHeight/2,()=>{
        // 데모라서 occ 대신 직접 효과만
        rf(df.id);bs(df.x+55,df.y+55,6);
        sb('😋 Yummy!',1200,'#FF8F00');playVoice('yummy');
        setFrame('open');py();
        setTimeout(()=>{
          resumeAnim();
          sb('👆 Tap the letter!',2000,'#2E7D32');playVoice('tap_the_letter');
          setTimeout(()=>{
            gp='playing';
            snr();
          },2000);
        },1500);
      });},500);},800);
  },2500);
}

function gl(){try{uf();}catch(e){console.warn('Game loop error:',e);}requestAnimationFrame(gl)}
function go(mode){
  gameMode=mode||'ABC';
  try{gtag('event','game_start',{game_mode:gameMode});}catch(e){}
  // 모드별 배경 + 색감 전환
  const gc=document.getElementById('gc');
  gc.classList.remove('mode-abc','mode-ABc');
  if(gameMode==='abc'){
    document.body.style.background="url('assets/ui/images/bg_4.png') center bottom/cover no-repeat";
    document.body.style.backgroundColor="#87CEEB";
    gc.classList.add('mode-abc');
  } else if(gameMode==='ABc'){
    document.body.style.background="url('assets/ui/images/bg_5.png') center/cover no-repeat";
    document.body.style.backgroundColor="#2a3a1a";
    gc.classList.add('mode-ABc');
  } else {
    document.body.style.background="url('assets/ui/images/bg_1.png') center/cover no-repeat";
    document.body.style.backgroundColor="#2D6B5E";
  }
  frogStage=1;setFrame('a');
  ea();
  // 오디오 시작
  SND_BGM.volume=0.25;SND_BGM.loop=true;
  SND_BGM.play().catch(()=>{});
  bgmStarted=true;
  startFlyBuzz();startFrogBG();initCaterpillar();initButterfly();
  document.getElementById('ss').style.opacity='0';setTimeout(()=>{document.getElementById('ss').style.display='none';icb();startBreathe();scheduleBlink();gl();if(gameMode==='ABC'){tut()}else{gp='playing';sb('👆 Tap the letter!',2000,'#2E7D32');playVoice('tap_the_letter');snr()}},500)}
try{document.addEventListener('touchmove',function(e){e.preventDefault();},{passive:false});}catch(e){}

// === 단어 퍼즐 (그림 조각 맞추기) ===
// 그림은 외부 이미지 없이 내장 SVG로 그린다 (단일 소스)
// 사과 그림(좌표계 200x200, 배경 투명)
function appleArt(){return `
  <path d="M104 46 C 120 24, 150 24, 158 36 C 150 58, 120 60, 104 46 Z" fill="#66BB6A"/>
  <path d="M104 46 C 122 38, 142 34, 156 36" stroke="#43A047" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M100 52 C 98 38, 96 30, 102 22" stroke="#795548" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M100 60 C 86 48, 60 46, 46 62 C 30 80, 30 120, 48 150 C 62 172, 84 178, 100 168 C 116 178, 138 172, 152 150 C 170 120, 170 80, 154 62 C 140 46, 114 48, 100 60 Z" fill="#EF5350"/>
  <path d="M100 60 C 116 48, 140 46, 154 62 C 170 80, 170 120, 152 150 C 138 172, 116 178, 100 168 Z" fill="#E53935" opacity="0.5"/>
  <ellipse cx="68" cy="92" rx="12" ry="18" fill="#fff" opacity="0.4" transform="rotate(-20 68 92)"/>`;}
// 밑그림(연한 실루엣) — 같은 모양을 단색 연한 색으로
function appleSil(){return `
  <path d="M104 46 C 120 24, 150 24, 158 36 C 150 58, 120 60, 104 46 Z" fill="#CDBBAC"/>
  <path d="M100 52 C 98 38, 96 30, 102 22" stroke="#CDBBAC" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M100 60 C 86 48, 60 46, 46 62 C 30 80, 30 120, 48 150 C 62 172, 84 178, 100 168 C 116 178, 138 172, 152 150 C 170 120, 170 80, 154 62 C 140 46, 114 48, 100 60 Z" fill="#CDBBAC"/>`;}
// 사과 외곽선(점선/클립용)
const APPLE_BODY='M100 60 C 86 48, 60 46, 46 62 C 30 80, 30 120, 48 150 C 62 172, 84 178, 100 168 C 116 178, 138 172, 152 150 C 170 120, 170 80, 154 62 C 140 46, 114 48, 100 60 Z';

// 오렌지
function orangeArt(){return `
  <path d="M100 52 C 99 42, 98 36, 105 32" stroke="#8D6E63" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M106 36 C 122 22, 146 26, 152 36 C 142 52, 118 52, 106 36 Z" fill="#66BB6A"/>
  <path d="M106 36 C 124 30, 140 30, 150 36" stroke="#43A047" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="100" cy="114" r="62" fill="#FFA726"/>
  <path d="M100 52 A62 62 0 0 1 100 176 Z" fill="#FB8C00" opacity="0.28"/>
  <circle cx="100" cy="114" r="62" fill="none" stroke="#F57C00" stroke-width="2" opacity="0.25"/>
  <ellipse cx="76" cy="94" rx="13" ry="19" fill="#fff" opacity="0.32" transform="rotate(-20 76 94)"/>`;}
function orangeSil(){return `
  <path d="M106 36 C 122 22, 146 26, 152 36 C 142 52, 118 52, 106 36 Z" fill="#CDBBAC"/>
  <circle cx="100" cy="114" r="62" fill="#CDBBAC"/>`;}
const ORANGE_BODY='M38 114 a62 62 0 1 0 124 0 a62 62 0 1 0 -124 0 Z';

// 바나나
const BANANA_BODY='M46 152 C 26 106, 66 50, 130 50 C 148 50, 160 58, 162 70 C 148 62, 128 66, 110 74 C 72 92, 58 126, 70 150 C 78 164, 98 168, 116 160 C 92 178, 58 174, 46 152 Z';
function bananaArt(){return `
  <path d="${BANANA_BODY}" fill="#FFD740"/>
  <path d="M46 152 C 58 166, 80 172, 100 168 C 78 168, 66 158, 64 142 C 58 118, 70 92, 92 76 C 64 92, 44 124, 46 152 Z" fill="#F9A825" opacity="0.45"/>
  <path d="M130 50 C 140 46, 150 48, 158 56" stroke="#6D4C41" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="48" cy="154" r="5" fill="#6D4C41"/>`;}
function bananaSil(){return `<path d="${BANANA_BODY}" fill="#CDBBAC"/>`;}

// 포도
const GRAPE_BODY='M100 54 C 134 54, 158 76, 158 108 C 158 142, 130 178, 100 178 C 70 178, 42 142, 42 108 C 42 76, 66 54, 100 54 Z';
function grapeArt(){return `
  <path d="M100 56 C 100 44, 102 36, 110 30" stroke="#6D4C41" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M110 34 C 126 22, 148 26, 154 36 C 144 50, 122 50, 110 34 Z" fill="#66BB6A"/>
  <g fill="#8E24AA">
    <circle cx="84" cy="74" r="19"/><circle cx="116" cy="74" r="19"/>
    <circle cx="66" cy="104" r="19"/><circle cx="100" cy="104" r="19"/><circle cx="134" cy="104" r="19"/>
    <circle cx="84" cy="134" r="19"/><circle cx="116" cy="134" r="19"/>
    <circle cx="100" cy="162" r="19"/>
  </g>
  <g fill="#fff" opacity="0.22"><circle cx="78" cy="68" r="6"/><circle cx="60" cy="98" r="6"/><circle cx="94" cy="98" r="6"/></g>`;}
function grapeSil(){return `<g fill="#CDBBAC">
    <circle cx="84" cy="74" r="19"/><circle cx="116" cy="74" r="19"/>
    <circle cx="66" cy="104" r="19"/><circle cx="100" cy="104" r="19"/><circle cx="134" cy="104" r="19"/>
    <circle cx="84" cy="134" r="19"/><circle cx="116" cy="134" r="19"/>
    <circle cx="100" cy="162" r="19"/></g>`;}

// 딸기
const STRAWBERRY_BODY='M100 62 C 140 58, 166 80, 162 112 C 158 146, 124 182, 100 186 C 76 182, 42 146, 38 112 C 34 80, 60 58, 100 62 Z';
function strawberryArt(){return `
  <path d="${STRAWBERRY_BODY}" fill="#E53935"/>
  <path d="M100 62 C 140 58, 166 80, 162 112 C 158 146, 124 182, 100 186 Z" fill="#C62828" opacity="0.32"/>
  <path d="M70 58 C 80 44, 92 44, 100 52 C 108 44, 120 44, 130 58 C 120 56, 112 60, 100 70 C 88 60, 80 56, 70 58 Z" fill="#66BB6A"/>
  <path d="M100 52 C 100 42, 100 36, 100 30" stroke="#558B2F" stroke-width="5" fill="none" stroke-linecap="round"/>
  <g fill="#FFF59D"><ellipse cx="80" cy="94" rx="2.4" ry="3.4"/><ellipse cx="110" cy="86" rx="2.4" ry="3.4"/><ellipse cx="126" cy="106" rx="2.4" ry="3.4"/><ellipse cx="92" cy="116" rx="2.4" ry="3.4"/><ellipse cx="118" cy="134" rx="2.4" ry="3.4"/><ellipse cx="72" cy="118" rx="2.4" ry="3.4"/><ellipse cx="100" cy="150" rx="2.4" ry="3.4"/><ellipse cx="100" cy="100" rx="2.4" ry="3.4"/></g>`;}
function strawberrySil(){return `
  <path d="M70 58 C 80 44, 92 44, 100 52 C 108 44, 120 44, 130 58 C 120 56, 112 60, 100 70 C 88 60, 80 56, 70 58 Z" fill="#CDBBAC"/>
  <path d="${STRAWBERRY_BODY}" fill="#CDBBAC"/>`;}

// 수박 (통째로 둥근 수박)
const WATERMELON_BODY='M36 110 a64 64 0 1 0 128 0 a64 64 0 1 0 -128 0 Z';
function watermelonArt(){return `
  <circle cx="100" cy="110" r="64" fill="#66BB6A"/>
  <path d="M100 46 C 122 64, 122 156, 100 174" stroke="#2E7D32" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M72 56 C 92 74, 92 146, 72 164" stroke="#2E7D32" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M128 56 C 108 74, 108 146, 128 164" stroke="#2E7D32" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M50 82 C 62 92, 62 128, 50 138" stroke="#2E7D32" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M150 82 C 138 92, 138 128, 150 138" stroke="#2E7D32" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="76" cy="88" rx="13" ry="18" fill="#fff" opacity="0.22" transform="rotate(-20 76 88)"/>`;}
function watermelonSil(){return `<path d="${WATERMELON_BODY}" fill="#CDBBAC"/>`;}

// 복숭아
const PEACH_BODY='M100 58 C 136 52, 166 78, 164 116 C 162 152, 132 176, 100 170 C 68 176, 38 152, 36 116 C 34 78, 64 52, 100 58 Z';
function peachArt(){return `
  <path d="${PEACH_BODY}" fill="#FFAB91"/>
  <path d="M100 58 C 136 52, 166 78, 164 116 C 162 152, 132 176, 100 170 Z" fill="#FF8A65" opacity="0.4"/>
  <path d="M100 64 C 92 100, 92 138, 100 166" stroke="#EF6C60" stroke-width="3" fill="none" opacity="0.5"/>
  <path d="M104 56 C 116 40, 138 40, 148 50 C 138 64, 116 64, 104 56 Z" fill="#66BB6A"/>
  <ellipse cx="74" cy="96" rx="13" ry="18" fill="#fff" opacity="0.3" transform="rotate(-20 74 96)"/>`;}
function peachSil(){return `
  <path d="M104 56 C 116 40, 138 40, 148 50 C 138 64, 116 64, 104 56 Z" fill="#CDBBAC"/>
  <path d="${PEACH_BODY}" fill="#CDBBAC"/>`;}

// 레몬
const LEMON_BODY='M38 110 C 38 86, 64 66, 100 66 C 136 66, 162 86, 162 110 C 162 134, 136 154, 100 154 C 64 154, 38 134, 38 110 Z';
function lemonArt(){return `
  <path d="${LEMON_BODY}" fill="#FDD835"/>
  <path d="M100 66 C 136 66, 162 86, 162 110 C 162 134, 136 154, 100 154 Z" fill="#FBC02D" opacity="0.4"/>
  <path d="M160 104 C 168 106, 172 110, 168 114 C 164 116, 160 114, 158 112 Z" fill="#F9A825"/>
  <path d="M40 104 C 32 106, 28 110, 32 114 C 36 116, 40 114, 42 112 Z" fill="#F9A825"/>
  <ellipse cx="78" cy="94" rx="13" ry="17" fill="#fff" opacity="0.3" transform="rotate(-20 78 94)"/>`;}
function lemonSil(){return `<path d="${LEMON_BODY}" fill="#CDBBAC"/>`;}

// 망고
const MANGO_BODY='M100 58 C 141 54, 166 84, 166 118 C 166 152, 136 176, 100 176 C 64 176, 38 150, 38 116 C 38 82, 59 58, 100 58 Z';
function mangoArt(){return `
  <path d="${MANGO_BODY}" fill="#FFB300"/>
  <path d="M100 58 C 141 54, 166 84, 166 118 C 166 152, 136 176, 100 176 Z" fill="#FB8C00" opacity="0.4"/>
  <path d="M100 58 C 120 56, 138 60, 150 70 C 130 64, 112 66, 96 74 C 92 66, 96 60, 100 58 Z" fill="#FF7043" opacity="0.45"/>
  <path d="M100 60 C 98 48, 100 40, 108 36" stroke="#8D6E63" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M108 38 C 124 28, 142 32, 148 44 C 138 56, 118 52, 108 38 Z" fill="#66BB6A"/>
  <ellipse cx="74" cy="100" rx="13" ry="18" fill="#fff" opacity="0.32" transform="rotate(-20 74 100)"/>`;}
function mangoSil(){return `
  <path d="M108 38 C 124 28, 142 32, 148 44 C 138 56, 118 52, 108 38 Z" fill="#CDBBAC"/>
  <path d="${MANGO_BODY}" fill="#CDBBAC"/>`;}

// 파인애플 (몸통 + 초록 왕관)
const PINEAPPLE_BODY='M100 84 C 138 84, 162 104, 162 134 C 162 164, 136 182, 100 182 C 64 182, 38 164, 38 134 C 38 104, 62 84, 100 84 Z';
const PINE_CROWN='<path d="M100 28 C 95 50, 95 78, 100 94 C 105 78, 105 50, 100 28 Z"/>'
  +'<path d="M100 94 C 84 80, 70 60, 66 42 C 80 54, 94 72, 100 94 Z"/>'
  +'<path d="M100 94 C 116 80, 130 60, 134 42 C 120 54, 106 72, 100 94 Z"/>'
  +'<path d="M100 94 C 78 86, 58 74, 50 60 C 68 68, 88 82, 100 94 Z"/>'
  +'<path d="M100 94 C 122 86, 142 74, 150 60 C 132 68, 112 82, 100 94 Z"/>';
function pineappleArt(){return `
  <g fill="#43A047">${PINE_CROWN}</g>
  <g fill="#66BB6A" opacity="0.6"><path d="M100 36 C 97 54, 97 80, 100 94 C 103 80, 103 54, 100 36 Z"/></g>
  <path d="${PINEAPPLE_BODY}" fill="#FBC02D"/>
  <path d="M100 84 C 138 84, 162 104, 162 134 C 162 164, 136 182, 100 182 Z" fill="#F9A825" opacity="0.35"/>
  <g stroke="#E65100" stroke-width="2.2" opacity="0.4" fill="none" stroke-linecap="round">
    <path d="M72 110 L 104 166"/><path d="M96 102 L 132 150"/><path d="M62 128 L 88 168"/>
    <path d="M128 110 L 96 166"/><path d="M104 102 L 68 150"/><path d="M138 128 L 112 168"/>
  </g>
  <ellipse cx="72" cy="120" rx="11" ry="15" fill="#fff" opacity="0.25" transform="rotate(-20 72 120)"/>`;}
function pineappleSil(){return `
  <g fill="#CDBBAC">${PINE_CROWN}</g>
  <path d="${PINEAPPLE_BODY}" fill="#CDBBAC"/>`;}

// 단어 사전: 그림 조각으로 맞출 과일들
const WP_WORDS={
  apple:{word:'APPLE',art:appleArt,sil:appleSil,body:APPLE_BODY,img:'assets/fruit/images/fruit_apple_image.png?v=1'},
  banana:{word:'BANANA',art:bananaArt,sil:bananaSil,body:BANANA_BODY,img:'assets/fruit/images/fruit_banana_image.png?v=1',cut:'bsp',parts:6},
  grape:{word:'GRAPE',art:grapeArt,sil:grapeSil,body:GRAPE_BODY,img:'assets/fruit/images/fruit_grape_image.png?v=1'},
  orange:{word:'ORANGE',art:orangeArt,sil:orangeSil,body:ORANGE_BODY,img:'assets/fruit/images/fruit_orange_image.png?v=1'},
  strawberry:{word:'STRAWBERRY',art:strawberryArt,sil:strawberrySil,body:STRAWBERRY_BODY,img:'assets/fruit/images/fruit_strawberry_image.png?v=1'},
  watermelon:{word:'WATERMELON',art:watermelonArt,sil:watermelonSil,body:WATERMELON_BODY,img:'assets/fruit/images/fruit_watermelon_image.png?v=1'},
  peach:{word:'PEACH',art:peachArt,sil:peachSil,body:PEACH_BODY,img:'assets/fruit/images/fruit_peach_image.png?v=1'},
  lemon:{word:'LEMON',art:lemonArt,sil:lemonSil,body:LEMON_BODY,img:'assets/fruit/images/fruit_lemon_image.png?v=1'},
  mango:{word:'MANGO',art:mangoArt,sil:mangoSil,body:MANGO_BODY,img:'assets/fruit/images/fruit_mango_image.png?v=1'},
  pineapple:{word:'PINEAPPLE',art:pineappleArt,sil:pineappleSil,body:PINEAPPLE_BODY,img:'assets/fruit/images/fruit_pineapple_image.png?v=1',scale:1.3}
};
// 한 게임에서 진행할 과일 순서 (여기에 추가/순서변경 하면 자동 반영)
const WP_ORDER=['apple','banana','grape','orange','strawberry','watermelon','peach','lemon','mango','pineapple'];

// 난이도(조각 수) — WP_ORDER 순서대로: 앞은 쉽게(적은 조각), 뒤로 갈수록 많게
// gc=가로 칸 수, gr=세로 칸 수 → 조각 수 = gc*gr (PNG 빈 조각은 자동 제외)
const WP_LEVELS=[
  {gc:2,gr:2},   // 1번째 — 4조각 (3~4세)
  {gc:2,gr:2},   // 2번째 — 4조각
  {gc:3,gr:2},   // 3번째 — 6조각
  {gc:3,gr:2},   // 4번째 — 6조각
  {gc:3,gr:2},   // 5번째 — 6조각
  {gc:3,gr:3},   // 6번째 — 9조각 (6~7세)
  {gc:3,gr:3},   // 7번째 — 9조각
  {gc:3,gr:3},   // 8번째 — 9조각
  {gc:3,gr:3},   // 9번째(망고) — 9조각
  {gc:3,gr:3}    // 10번째(파인애플) — 9조각
];
function wpLevelFor(key){
  var d=WP_WORDS[key];
  if(d && d.lvl) return d.lvl;        // 강제 지정(있으면 최우선)
  if(d && d._grid) return d._grid;    // 그림 분석으로 자동 선택된 격자(빈 조각 0 보장)
  var i=WP_ORDER.indexOf(key); if(i<0)i=0; return WP_LEVELS[Math.min(i,WP_LEVELS.length-1)];
}
function wpPiecesFor(gc,gr){ var a=[]; for(var r=0;r<gr;r++)for(var c=0;c<gc;c++)a.push({r:r,c0:c,c1:c}); return a; }

// 조각 구성: 윗부분 1조각(넓게) + 가운데 3 + 아래 3 = 7조각 (곡선으로 크게 자름)
// 격자 모서리 좌표계는 3x3(=corner 4x4). 조각은 (행 r, 열 c0~c1) 범위로 정의.
const WP_PIECES=[
  {r:0,c0:0,c1:2},
  {r:1,c0:0,c1:0},{r:1,c0:1,c1:1},{r:1,c0:2,c1:2},
  {r:2,c0:0,c1:0},{r:2,c0:1,c1:1},{r:2,c0:2,c1:2}
];
// 그림을 보드에 더 꽉 채우기(약 1.28배 확대, 중심 기준)
const WP_TF='translate(100,100) scale(1.28) translate(-100,-100)';
// 사과를 감싸는 자르기 영역(아트 좌표) — 확대된 사과에 맞춰 넓힘
const WP_X0=8, WP_X1=192, WP_Y0=0, WP_Y1=200, WP_GC=3, WP_GR=3;
let wpGeo=null, wpPlaced=0, wpTotal=0, wpCurrent='apple';

function goWordPuzzle(){
  document.getElementById('wp').classList.add('show');
  try{gtag('event','word_puzzle_open',{category:'fruit',word:wpCurrent});}catch(e){}
  // 세로 방향 잠금 시도(지원 브라우저/설치앱) — 미지원 시 무시
  try{ if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('portrait').catch(function(){}); }catch(e){}
  // 배경음악 (메인 게임과 동일한 bgm.mp3 재사용)
  try{ SND_BGM.loop=true; SND_BGM.volume=0.25; SND_BGM.play().catch(function(){}); bgmStarted=true; }catch(e){}
  requestAnimationFrame(function(){requestAnimationFrame(function(){buildPuzzle(WP_ORDER[0]);});});
}
function wpBack(){ if(_wpEndingStop) _wpEndingStop();   // 엔딩 음성/타이머/영상 정리
  document.getElementById('wp').classList.remove('show'); try{SND_BGM.pause();}catch(e){} }

// === 단어 퍼즐 카테고리 선택 (과일 / 동물·채소는 예고) ===
function goWordCat(){ try{document.getElementById('wc').classList.add('show');}catch(e){} }
function wcBack(){ try{document.getElementById('wc').classList.remove('show');}catch(e){} }
var _wcToastT=null;
function wcLocked(el){
  try{
    el.classList.remove('wc-card-shake'); void el.offsetWidth; el.classList.add('wc-card-shake');  // 흔들기 리셋 후 재생
    var t=document.getElementById('wcToast');
    if(t){ t.classList.add('show'); clearTimeout(_wcToastT); _wcToastT=setTimeout(function(){t.classList.remove('show');},1600); }
  }catch(e){}
}

// === 동물 퍼즐 (독립 페이지 animal.html을 전체화면 오버레이로) ===
// 기존 게임 코드와 완전 분리(iframe) → 충돌/크래시 위험 0. HTML은 ?b=로 항상 최신, 내부 그림/영상은 캐시 사용.
var _apOverlay=null;
function goAnimalPuzzle(){
  try{
    if(_apOverlay) return;                       // 중복 열기 방지
    var ov=document.createElement('div');
    ov.id='apOverlay';
    ov.style.cssText='position:fixed;inset:0;z-index:99999;background:#000;';
    var fr=document.createElement('iframe');
    fr.setAttribute('allow','autoplay; fullscreen');
    fr.style.cssText='border:0;width:100%;height:100%;display:block;';
    fr.src='animal.html?b='+Date.now();          // HTML 항상 최신(미디어는 내부에서 캐시)
    var bk=document.createElement('button');
    bk.textContent='‹'; bk.setAttribute('aria-label','back');
    bk.onclick=closeAnimalPuzzle;
    bk.style.cssText='position:fixed;top:8px;left:8px;z-index:100000;width:42px;height:42px;border:none;border-radius:50%;background:rgba(255,255,255,.85);color:#333;font-size:26px;line-height:42px;padding:0;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.3)';
    ov.appendChild(fr); ov.appendChild(bk);
    document.body.appendChild(ov);
    _apOverlay=ov;
    try{ if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('portrait').catch(function(){}); }catch(e){}
    try{gtag('event','word_puzzle_open',{category:'animal'});}catch(e){}
  }catch(e){}
}
function closeAnimalPuzzle(){
  try{ if(_apOverlay&&_apOverlay.parentNode){ _apOverlay.parentNode.removeChild(_apOverlay); } }catch(e){}
  _apOverlay=null;
}
// 동물 퍼즐(별도 iframe animal.html)이 완성을 알려오면 GA로 기록.
// 과일과 같은 신호 이름(word_puzzle_complete) + category:'animal' 로 → GA4에서 과일 vs 동물 비교 가능.
window.addEventListener('message',function(ev){
  try{ var d=ev&&ev.data; if(d&&d.t==='animal_done'){ gtag('event','word_puzzle_complete',{category:'animal',word:d.key}); } }catch(e){}
});

// === 공룡 퍼즐 (독립 페이지 dino.html을 전체화면 오버레이로 — 동물 퍼즐과 완전 동일 구조) ===
// 기존 게임 코드와 완전 분리(iframe) → 충돌/크래시 위험 0. HTML은 ?b=로 항상 최신, 내부 그림/영상은 캐시 사용.
var _dpOverlay=null;
function goDinoPuzzle(){
  try{
    if(_dpOverlay) return;                       // 중복 열기 방지
    var ov=document.createElement('div');
    ov.id='dpOverlay';
    ov.style.cssText='position:fixed;inset:0;z-index:99999;background:#000;';
    var fr=document.createElement('iframe');
    fr.setAttribute('allow','autoplay; fullscreen');
    fr.style.cssText='border:0;width:100%;height:100%;display:block;';
    fr.src='dino.html?b='+Date.now();            // HTML 항상 최신(미디어는 내부에서 캐시)
    var bk=document.createElement('button');
    bk.textContent='‹'; bk.setAttribute('aria-label','back');
    bk.onclick=closeDinoPuzzle;
    bk.style.cssText='position:fixed;top:8px;left:8px;z-index:100000;width:42px;height:42px;border:none;border-radius:50%;background:rgba(255,255,255,.85);color:#333;font-size:26px;line-height:42px;padding:0;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.3)';
    ov.appendChild(fr); ov.appendChild(bk);
    document.body.appendChild(ov);
    _dpOverlay=ov;
    try{ if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('portrait').catch(function(){}); }catch(e){}
    try{gtag('event','word_puzzle_open',{category:'dino'});}catch(e){}
  }catch(e){}
}
function closeDinoPuzzle(){
  try{ if(_dpOverlay&&_dpOverlay.parentNode){ _dpOverlay.parentNode.removeChild(_dpOverlay); } }catch(e){}
  _dpOverlay=null;
}
// 공룡 퍼즐(별도 iframe dino.html)이 완성을 알려오면 GA로 기록. (과일·동물과 같은 신호 이름 + category:'dino')
window.addEventListener('message',function(ev){
  try{ var d=ev&&ev.data; if(d&&d.t==='dino_done'){ gtag('event','word_puzzle_complete',{category:'dino',word:d.key}); } }catch(e){}
});
// ★ Animal 카드 잠금해제를 '실행 중에' 직접 수행 — script.js는 항상 최신으로 받으므로,
//   옛 index.html(잠긴 버튼)이 캐시된 폰에서도 이게 버튼을 풀어줌(즉시 모든 폰 반영).
function _unlockAnimalCard(){
  try{
    var cards=document.querySelectorAll('.wc-card');
    for(var i=0;i<cards.length;i++){
      var lbl=cards[i].querySelector('.card-label');
      if(lbl && lbl.textContent.trim().toLowerCase()==='animal'){
        var c=cards[i];
        c.classList.remove('wc-locked'); c.classList.add('wc-animal');
        var lock=c.querySelector('.wc-lock'); if(lock&&lock.parentNode) lock.parentNode.removeChild(lock);
        c.onclick=function(){ goAnimalPuzzle(); };
        break;
      }
    }
  }catch(e){}
}
try{ _unlockAnimalCard(); }catch(e){}
try{ document.addEventListener('DOMContentLoaded',_unlockAnimalCard); }catch(e){}

// ★ Dino(공룡) 예고편 카드를 '실행 중에' 보장 — script.js는 항상 최신이라,
//   옛 index.html(카드 없음/이모지 아이콘)이 캐시된 폰에서도 즉시 Dino 카드(실루엣)가 뜸.
// ★ Dino 카드 잠금해제(실제 열기) — Animal 카드와 동일 방식. script.js는 항상 최신이라
//   옛 index.html(잠긴 Dino 카드/카드 없음)이 캐시된 폰에서도 즉시 Dino가 열림.
function _unlockDinoCard(){
  try{
    var iconHTML='<span class="dino-sil-ic" role="img" aria-label="dino"></span>';   // 컬러 마스크(초록)+눈점은 CSS가 처리
    var cards=document.querySelectorAll('.wc-card'), dino=null;
    for(var i=0;i<cards.length;i++){
      var lbl=cards[i].querySelector('.card-label');
      if(lbl && lbl.textContent.trim().toLowerCase()==='dino'){ dino=cards[i]; break; }
    }
    if(dino){
      dino.classList.remove('wc-locked'); dino.classList.add('wc-dino');
      var lock=dino.querySelector('.wc-lock'); if(lock&&lock.parentNode) lock.parentNode.removeChild(lock);
      var ic=dino.querySelector('.card-icon');
      if(ic){ ic.innerHTML=iconHTML; }   // 항상 컬러 span으로 통일(옛 검정 img 캐시도 교체)
      dino.onclick=function(){ goDinoPuzzle(); };
    } else {
      var wrap=document.querySelector('.wc-cards');
      if(wrap){
        var b=document.createElement('button');
        b.className='game-card wc-card wc-dino';
        b.onclick=function(){ goDinoPuzzle(); };
        b.innerHTML='<span class="card-icon">'+iconHTML+'</span><span class="card-label">Dino</span>';
        wrap.appendChild(b);
      }
    }
  }catch(e){}
}
try{ _unlockDinoCard(); }catch(e){}
try{ document.addEventListener('DOMContentLoaded',_unlockDinoCard); }catch(e){}

// ★ Insect(곤충) 예고편 카드도 런타임 보장 (Dino와 동일 방식 — 캐시된 옛 index.html 폰도 즉시 반영).
function _ensureInsectCard(){
  try{
    var iconHTML='<img class="insect-sil-ic" src="assets/ui/icons/insect_silhouette.svg" alt="insect">';
    var cards=document.querySelectorAll('.wc-card'), ins=null;
    for(var i=0;i<cards.length;i++){
      var lbl=cards[i].querySelector('.card-label');
      if(lbl && lbl.textContent.trim().toLowerCase()==='insect'){ ins=cards[i]; break; }
    }
    if(ins){
      ins.classList.add('wc-locked','wc-insect');
      var ic=ins.querySelector('.card-icon');
      if(ic && !ic.querySelector('.insect-sil-ic')){ ic.innerHTML=iconHTML; }
    } else {
      var wrap=document.querySelector('.wc-cards');
      if(wrap){
        var b=document.createElement('button');
        b.className='game-card wc-card wc-locked wc-insect';
        b.setAttribute('onclick','wcLocked(this)');
        b.innerHTML='<span class="card-icon">'+iconHTML+'</span><span class="card-label">Insect</span><span class="wc-lock">🔒</span>';
        wrap.appendChild(b);
      }
    }
  }catch(e){}
}
try{ _ensureInsectCard(); }catch(e){}
try{ document.addEventListener('DOMContentLoaded',_ensureInsectCard); }catch(e){}

// === ABC 모드 선택 화면 ===
function goModeSelect(){ try{document.getElementById('ms').classList.add('show');}catch(e){} }
function msBack(){ try{document.getElementById('ms').classList.remove('show');}catch(e){} }
function goMode(mode){ try{document.getElementById('ms').classList.remove('show');}catch(e){} go(mode); }

// 조각 붙는 "찰칵" 효과음 (에셋 없이 Web Audio로 합성)
var wpAC=null;
function wpClick(){
  try{
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
    if(!wpAC) wpAC=new AC();
    if(wpAC.state==='suspended') wpAC.resume();
    var t=wpAC.currentTime;
    var o=wpAC.createOscillator(), g=wpAC.createGain();
    o.type='triangle';
    o.frequency.setValueAtTime(1500,t);
    o.frequency.exponentialRampToValueAtTime(440,t+0.05);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.76,t+0.005);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);
    o.connect(g); g.connect(wpAC.destination);
    o.start(t); o.stop(t+0.11);
  }catch(e){}
}

// PNG 과일용: 그림 알파를 검사해 각 조각(격자 셀)에 그림이 충분히 있는지 판단
// → 거의 투명한 조각은 만들지 않음(안 보이는 조각=못 맞추는 버그 방지)
// PNG에서 실제 그림(불투명) 영역 bbox 구하기 (투명 여백 제거용) — 이미지 비율로 반환
function wpImgBBox(img){
  try{
    var N=120, cv=document.createElement('canvas'); cv.width=N; cv.height=N;
    var ctx=cv.getContext('2d'); ctx.drawImage(img,0,0,N,N);
    var d=ctx.getImageData(0,0,N,N).data;
    var minx=N,miny=N,maxx=-1,maxy=-1;
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){ if(d[(y*N+x)*4+3]>20){ if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; } }
    if(maxx<0) return {fx:0,fy:0,fw:1,fh:1,W:img.width,H:img.height};
    return {fx:minx/N, fy:miny/N, fw:(maxx-minx+1)/N, fh:(maxy-miny+1)/N, W:img.width, H:img.height};
  }catch(e){ return {fx:0,fy:0,fw:1,fh:1,W:img.width,H:img.height}; }
}
// bbox(실제 과일)를 보드(S) 안에 배치 (여백 제거 → 크게). 격자 자르기 범위(가로 4~96%) 안에
// 충분히 들어가도록 가로 86%·세로 94% 한도 → 좌우/상하 안전 여백 확보(안 잘림)
function wpImgFit(bb,S){
  var bw=bb.fw*bb.W, bh=bb.fh*bb.H;
  var k=Math.min(S*0.86/bw, S*0.94/bh);
  return { rw:bb.W*k, rh:bb.H*k, left:S/2-(bb.fx*bb.W+bw/2)*k, top:S/2-(bb.fy*bb.H+bh/2)*k };
}
// 격자 각 칸(행우선)의 그림 채움 비율(0~1) 배열 — 화면 표시와 동일한 bbox 배치로 샘플링
function wpCellFills(img,gc,gr,bb){
  var N=200, cw=(WP_X1-WP_X0)/gc, ch=(WP_Y1-WP_Y0)/gr;
  var cv=document.createElement('canvas'); cv.width=N; cv.height=N;
  var ctx=cv.getContext('2d');
  var f=wpImgFit(bb,N);
  ctx.drawImage(img, f.left, f.top, f.rw, f.rh);
  var d=ctx.getImageData(0,0,N,N).data;
  var out=[];
  for(var r=0;r<gr;r++)for(var c=0;c<gc;c++){
    var x0=Math.round(WP_X0+c*cw), x1=Math.round(WP_X0+(c+1)*cw);
    var y0=Math.round(WP_Y0+r*ch), y1=Math.round(WP_Y0+(r+1)*ch);
    var op=0,tot=0;
    for(var y=y0;y<y1;y++)for(var x=x0;x<x1;x++){ tot++; if(d[(y*N+x)*4+3]>20) op++; }
    out.push(tot?op/tot:0);
  }
  return out;
}
function wpPieceMask(img,gc,gr,pieces,bb){
  try{
    var fills=wpCellFills(img,gc,gr,bb);                 // pieces는 행우선(wpPiecesFor)이라 index 일치
    return pieces.map(function(p,i){ return fills[i]>=0.08; });
  }catch(e){ return pieces.map(function(){return true;}); }
}
// ★ 빈/흐릿한 조각·손톱만한 빈틈이 절대 안 생기는 격자 자동 선택.
//   각 칸은 둘 중 하나여야 안전: ① 솔리드(MINF 22%↑ → 보이는 조각) ② 완전 빈 칸(EMPTY 2%↓ → 제거해도 빈틈 없음)
//   위험한 건 그 사이 (2%,22%): 8~22%=흐릿한 빈 조각 / 2~8%=제거되지만 그림이 손톱만큼 남아 빈틈. 이 밴드가 0인 격자만 안전.
//   안전 격자 중 목표 난이도(조각 수)에 가장 가까운 걸 채택. (어떤 그림이든 빈 조각·빈틈 0 보장)
function wpAutoGrid(img,bb,desired){
  var CANDS=[{gc:2,gr:2},{gc:3,gr:2},{gc:2,gr:3},{gc:3,gr:3}];   // 4·6·6·9조각, 칸 모양은 정사각에 가깝게만
  var MINF=0.22, EMPTY=0.02;
  var best=null;
  for(var i=0;i<CANDS.length;i++){
    var g=CANDS[i];
    var fills; try{ fills=wpCellFills(img,g.gc,g.gr,bb); }catch(e){ continue; }
    var bad=0, kept=0;
    for(var j=0;j<fills.length;j++){
      if(fills[j]>=MINF) kept++;              // 솔리드 = 보이는 조각
      else if(fills[j]>EMPTY) bad++;          // (2%,22%) = 흐릿한 조각 또는 손톱만한 빈틈
      // fills[j]<=EMPTY : 완전 빈 칸 → 제거해도 빈틈 없음(무해)
    }
    if(kept<3) continue;                                          // 너무 적은 조각 격자 제외
    var cand={g:g, bad:bad, score:Math.abs(kept-(desired||6)), kept:kept};
    // 우선순위: 어중간칸 적은 것 → 목표 조각수에 가까운 것 → 조각 많은 것
    if(!best || cand.bad<best.bad
       || (cand.bad===best.bad && cand.score<best.score)
       || (cand.bad===best.bad && cand.score===best.score && cand.kept>best.kept)) best=cand;
  }
  return best? best.g : {gc:2,gr:2};
}

// ★ BSP(번갈아 쪼개기) 자르기 — 스케치처럼 T자 교차의 다양한 조각.
//   '조각(영역) 중 그림이 가장 많은 것'을 골라, 그 영역의 더 긴 방향(주축 u / 직각 v)으로
//   그림 면적이 반반이 되는 위치에서 둘로 자르기를 n조각이 될 때까지 반복.
//   영역 안에서만 잘리므로 교차점이 항상 T자(3갈래) → 격자의 +교차 모서리 슬리버 없음.
//   전체가 보드를 빈틈없이 분할 + 각 조각이 그림을 골고루 가짐 → 구멍·빈조각 0.
function wpBspCut(img,bb,n){
  try{
    var N=200, cv=document.createElement('canvas'); cv.width=N; cv.height=N;
    var ctx=cv.getContext('2d'); var f=wpImgFit(bb,N); ctx.drawImage(img,f.left,f.top,f.rw,f.rh);
    var dd=ctx.getImageData(0,0,N,N).data;
    var pts=[], sx=0,sy=0;
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){ if(dd[(y*N+x)*4+3]>20){ pts.push([x,y]); sx+=x; sy+=y; } }
    var cnt=pts.length; if(cnt<40) return null;
    var mx=sx/cnt, my=sy/cnt, Sxx=0,Syy=0,Sxy=0;
    for(var i=0;i<cnt;i++){ var ex=pts[i][0]-mx, ey=pts[i][1]-my; Sxx+=ex*ex; Syy+=ey*ey; Sxy+=ex*ey; }
    var th=0.5*Math.atan2(2*Sxy, Sxx-Syy);
    var ux=Math.cos(th), uy=Math.sin(th), vx=-uy, vy=ux;        // u=길이축, v=직각축
    function proj(p,dx,dy){ return (p[0]-mx)*dx+(p[1]-my)*dy; }
    function clipHalf(poly,keepGE,dx,dy,tt){ var out=[]; for(var k=0;k<poly.length;k++){ var A=poly[k],B=poly[(k+1)%poly.length];
      var pa=proj(A,dx,dy)-tt, pb=proj(B,dx,dy)-tt, inA=keepGE?pa>=0:pa<=0, inB=keepGE?pb>=0:pb<=0;
      if(inA) out.push(A); if(inA!==inB){ var t=pa/(pa-pb); out.push([A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t]); } } return out; }
    var regions=[{poly:[[0,0],[200,0],[200,200],[0,200]], pts:pts}];
    var guard=0;
    while(regions.length<n && guard++<50){
      // 그림 픽셀이 가장 많은 영역 선택
      var bi=0; for(i=1;i<regions.length;i++){ if(regions[i].pts.length>regions[bi].pts.length) bi=i; }
      var R=regions[bi]; if(R.pts.length<8) break;
      // 영역의 u/v 범위 → 더 긴 방향으로 자름(조각 비율 좋게)
      var uMin=1e9,uMax=-1e9,vMin=1e9,vMax=-1e9;
      R.pts.forEach(function(p){ var pu=proj(p,ux,uy), pv=proj(p,vx,vy); if(pu<uMin)uMin=pu; if(pu>uMax)uMax=pu; if(pv<vMin)vMin=pv; if(pv>vMax)vMax=pv; });
      var useU=(uMax-uMin)>=(vMax-vMin);
      var dx=useU?ux:vx, dy=useU?uy:vy;
      var pr=R.pts.map(function(p){ return proj(p,dx,dy); }).sort(function(a,b){return a-b;});
      var tt=pr[Math.floor(pr.length/2)];                      // 면적 반반(중앙값)
      var A=clipHalf(R.poly,true,dx,dy,tt), B=clipHalf(R.poly,false,dx,dy,tt);
      var pa=[],pb=[]; R.pts.forEach(function(p){ (proj(p,dx,dy)>=tt?pa:pb).push(p); });
      if(A.length>=3&&B.length>=3&&pa.length>=4&&pb.length>=4){
        regions.splice(bi,1,{poly:A,pts:pa},{poly:B,pts:pb});
      } else { R.pts=[]; }                                      // 더 못 쪼개는 영역은 후보에서 제외
    }
    // ★ 용접: T자 교차점을 이웃 조각의 변에도 꼭짓점으로 삽입 → 곡선 칼선이 양쪽 정확히 일치(틈/겹침 0)
    (function(){
      var rd=function(v){return Math.round(v*10)/10;}, key=function(p){return rd(p[0])+','+rd(p[1]);};
      var rep={}; regions.forEach(function(R){ R.poly.forEach(function(p){ var k=key(p); if(!rep[k]) rep[k]=[rd(p[0]),rd(p[1])]; }); });
      var verts=[]; for(var k in rep) verts.push(rep[k]);
      regions.forEach(function(R){
        var P=R.poly.map(function(p){ return rep[key(p)]; });          // 같은 점 → 같은 참조로 통일
        var Q=[]; for(var i=0;i<P.length;i++){ if(!Q.length||Q[Q.length-1]!==P[i]) Q.push(P[i]); }
        if(Q.length>1 && Q[0]===Q[Q.length-1]) Q.pop();
        var out=[];
        for(i=0;i<Q.length;i++){
          var A=Q[i], B=Q[(i+1)%Q.length]; out.push(A);
          var dx=B[0]-A[0], dy=B[1]-A[1], L2=dx*dx+dy*dy; if(L2<1e-6) continue;
          var on=[];
          verts.forEach(function(V){ if(V===A||V===B) return;
            var t=((V[0]-A[0])*dx+(V[1]-A[1])*dy)/L2; if(t<=0.012||t>=0.988) return;
            if(Math.hypot(V[0]-(A[0]+t*dx), V[1]-(A[1]+t*dy))<0.5) on.push([t,V]); });
          on.sort(function(a,b){return a[0]-b[0];});
          on.forEach(function(o){ out.push(o[1]); });
        }
        R.poly=out;
      });
    })();
    var bands=regions.filter(function(R){return R.poly.length>=3;}).map(function(R){
      var cx=0,cy=0,c=R.pts.length||1; R.pts.forEach(function(p){cx+=p[0];cy+=p[1];});
      // pts 비면 폴리곤 무게중심으로 대체
      if(!R.pts.length){ R.poly.forEach(function(p){cx+=p[0];cy+=p[1];}); c=R.poly.length; }
      return {poly:R.poly, cx:cx/c, cy:cy/c};
    });
    // 컷선(점선 미리보기) = 보드 테두리가 아닌 폴리곤 모서리
    function onBorder(A,B){ return (Math.abs(A[0])<0.6&&Math.abs(B[0])<0.6)||(Math.abs(A[0]-200)<0.6&&Math.abs(B[0]-200)<0.6)||(Math.abs(A[1])<0.6&&Math.abs(B[1])<0.6)||(Math.abs(A[1]-200)<0.6&&Math.abs(B[1]-200)<0.6); }
    var cuts=[];
    bands.forEach(function(b){ var P=b.poly; for(var k=0;k<P.length;k++){ var A=P[k],B=P[(k+1)%P.length]; if(!onBorder(A,B)) cuts.push({x0:A[0],y0:A[1],x1:B[0],y1:B[1]}); } });
    return bands.length>=2 ? {bands:bands, cuts:cuts} : null;
  }catch(e){ return null; }
}

// ★ 주축(길이) 방향 n토막 자르기 — 바나나처럼 길쭉/대각선 과일용.
//   그림의 주축(PCA)을 구해, 그 방향으로 '면적이 균등'하게 n조각으로 가로지르는 컷을 만든다.
//   조각=보드 정사각형을 컷선으로 나눈 띠(다각형) → n조각이 보드를 빈틈없이 덮으므로 구멍이 구조적으로 0,
//   각 띠가 그림 면적을 1/n씩 가지므로 빈 조각도 없음. (격자의 모서리 슬리버 문제 자체가 없음)
function wpAxisCut(img,bb,n){
  try{
    var N=200, cv=document.createElement('canvas'); cv.width=N; cv.height=N;
    var ctx=cv.getContext('2d'); var f=wpImgFit(bb,N); ctx.drawImage(img,f.left,f.top,f.rw,f.rh);
    var d=ctx.getImageData(0,0,N,N).data;
    var xs=[],ys=[],sx=0,sy=0;
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){ if(d[(y*N+x)*4+3]>20){ xs.push(x); ys.push(y); sx+=x; sy+=y; } }
    var cnt=xs.length; if(cnt<20) return null;
    var mx=sx/cnt, my=sy/cnt;
    var Sxx=0,Syy=0,Sxy=0;
    for(var i=0;i<cnt;i++){ var dx=xs[i]-mx, dy=ys[i]-my; Sxx+=dx*dx; Syy+=dy*dy; Sxy+=dx*dy; }
    var th=0.5*Math.atan2(2*Sxy, Sxx-Syy);            // 주축 각도
    var ux=Math.cos(th), uy=Math.sin(th);             // 주축 방향(길이 방향)
    var projs=new Array(cnt);
    for(i=0;i<cnt;i++){ projs[i]=(xs[i]-mx)*ux+(ys[i]-my)*uy; }
    var sorted=projs.slice().sort(function(a,b){return a-b;});
    var cutsT=[]; for(var k=1;k<n;k++){ cutsT.push(sorted[Math.floor(cnt*k/n)]); }  // 면적 균등 분위수
    var lo=sorted[0]-40, hi=sorted[cnt-1]+40;
    var bnd=[lo].concat(cutsT).concat([hi]);
    // 각 띠 폴리곤 = 보드사각형[0..200] ∩ {bnd[k] ≤ proj ≤ bnd[k+1]}
    function projOf(p){ return (p[0]-mx)*ux+(p[1]-my)*uy; }
    function clipHalf(poly,keepGE,tt){ var out=[]; for(var i2=0;i2<poly.length;i2++){ var A=poly[i2],B=poly[(i2+1)%poly.length];
      var pa=projOf(A)-tt, pb=projOf(B)-tt; var inA=keepGE?pa>=0:pa<=0, inB=keepGE?pb>=0:pb<=0;
      if(inA) out.push(A); if(inA!==inB){ var t=pa/(pa-pb); out.push([A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t]); } } return out; }
    // 띠별 그림 무게중심(흩어놓기 기준)
    var bcx=[],bcy=[],bcn=[]; for(k=0;k<n;k++){bcx[k]=0;bcy[k]=0;bcn[k]=0;}
    for(i=0;i<cnt;i++){ var bi=0; while(bi<n-1 && projs[i]>cutsT[bi]) bi++; bcx[bi]+=xs[i]; bcy[bi]+=ys[i]; bcn[bi]++; }
    var bands=[];
    for(k=0;k<n;k++){
      var poly=[[0,0],[200,0],[200,200],[0,200]];
      poly=clipHalf(poly,true,bnd[k]); poly=clipHalf(poly,false,bnd[k+1]);
      if(poly.length<3 || bcn[k]<1) continue;
      bands.push({ poly:poly, cx:bcx[k]/bcn[k], cy:bcy[k]/bcn[k] });
    }
    // 컷선(점선 미리보기용) — 각 컷을 보드사각형과 교차시켜 선분으로
    function lineSeg(tt){ var Q=[mx+tt*ux,my+tt*uy], vx=-uy, vy=ux, pts=[];
      function add(px,py){ if(px>=-0.3&&px<=200.3&&py>=-0.3&&py<=200.3) pts.push([px,py]); }
      if(Math.abs(vx)>1e-6){ add(0, Q[1]+vy*((0-Q[0])/vx)); add(200, Q[1]+vy*((200-Q[0])/vx)); }
      if(Math.abs(vy)>1e-6){ add(Q[0]+vx*((0-Q[1])/vy), 0); add(Q[0]+vx*((200-Q[1])/vy), 200); }
      return pts.length>=2 ? {x0:pts[0][0],y0:pts[0][1],x1:pts[1][0],y1:pts[1][1]} : null; }
    var cuts=[]; cutsT.forEach(function(tt){ var sgmt=lineSeg(tt); if(sgmt) cuts.push(sgmt); });
    return (bands.length===n) ? {bands:bands, cuts:cuts} : null;
  }catch(e){ return null; }
}

function buildPuzzle(key){
  wpCurrent=key||'apple';
  var data=WP_WORDS[wpCurrent];
  var stage=document.getElementById('wpStage');
  stage.innerHTML='';
  var SW=stage.clientWidth, SH=stage.clientHeight;
  if(SW<10||SH<10){
    var wpEl=document.getElementById('wp');
    if(wpEl&&wpEl.classList.contains('show')) setTimeout(function(){buildPuzzle(wpCurrent);},60);  // 화면 닫혔으면 재시도 멈춤(배터리 누수 방지)
    return;
  }

  // 난이도(조각 수) 격자 결정
  var lv=wpLevelFor(wpCurrent);
  var gc=lv.gc, gr=lv.gr;
  var pieces=wpPiecesFor(gc,gr);

  // PNG 과일: 그림이 로드되면 ① 실제영역(bbox) ② 빈 조각이 안 생기는 격자 자동선택 ③ 마스크 계산 후 다시 그림
  if(data.img && !data._mask){
    var _im=new Image();
    _im.onload=function(){
      data._bbox=wpImgBBox(_im);
      if(data.cut==='bsp' || data.cut==='axis'){          // 비격자 자르기(바나나 등 길쭉/대각선)
        data._axis=(data.cut==='bsp') ? wpBspCut(_im,data._bbox,data.parts||6) : wpAxisCut(_im,data._bbox,data.parts||4);
        data._mask=[true];                                // 게이트 재진입 방지(비격자 분할은 격자 마스크 안 씀)
        buildPuzzle(wpCurrent); return;
      }
      if(!data.lvl && !data._grid){                       // 수동 지정 없으면 그림 보고 안전한 격자 자동 선택
        var i=WP_ORDER.indexOf(wpCurrent); var L=WP_LEVELS[Math.min(i<0?0:i,WP_LEVELS.length-1)];
        data._grid=wpAutoGrid(_im,data._bbox,L.gc*L.gr);  // 목표 난이도(위치별 조각수)에 가장 가까운 솔리드 격자
      }
      var g=data.lvl||data._grid;
      var pcs=wpPiecesFor(g.gc,g.gr);
      data._mask=wpPieceMask(_im,g.gc,g.gr,pcs,data._bbox);
      buildPuzzle(wpCurrent);
    };
    _im.onerror=function(){ data._bbox={fx:0,fy:0,fw:1,fh:1,W:1,H:1}; data._grid={gc:2,gr:2}; data._mask=[true,true,true,true]; buildPuzzle(wpCurrent); };
    _im.src=data.img;
    return;
  }

  // 흩어놓을 줄: 위쪽 = 격자 윗줄 절반 / 아래쪽 = 나머지
  var aboveRows=Math.floor(gr/2), belowRows=gr-aboveRows;
  // 보드 크기: '위 흩어줄 + 사과 + 아래 흩어줄'이 통째로 세로 중앙에 들어가도록
  // 간격은 board(=조각 크기)에 비례 → 폰/데스크탑 어떤 화면비에서도 안 겹침
  var board=Math.min(SW*0.72, SH*0.94/(2.25+0.8/gr), 300);
  var s=board/200;                          // 아트→픽셀 배율
  var boardLeft=(SW-board)/2;
  var pitch=board/gr*1.25;                   // 흩어줄 사이 세로 간격
  var gap=board/gr*0.42;                     // 사과와 첫 흩어줄 사이 여백
  var aboveH=aboveRows?aboveRows*pitch+gap:0;
  var belowH=belowRows?belowRows*pitch+gap:0;
  var totalH=aboveH+board+belowH;
  var startTop=Math.max(SH*0.02,(SH-totalH)/2);
  var boardTop=startTop+aboveH;
  var cx=boardLeft+board/2, cy=boardTop+board/2;
  wpGeo={boardLeft:boardLeft,boardTop:boardTop,board:board};
  var mask=data._mask;                        // PNG 과일이면 조각별 사용여부, 아니면 undefined
  wpPlaced=0; wpTotal=mask?mask.filter(Boolean).length:pieces.length;
  var tEl=document.getElementById('wpTitle'); if(tEl) tEl.textContent='🧩 Make the '+data.word.toLowerCase()+'!';

  // 자르기 격자 모서리(안쪽만 살짝 흔들어 자연스러운 곡선)
  var cw=(WP_X1-WP_X0)/gc, ch=(WP_Y1-WP_Y0)/gr;
  var G=[];
  for(var r=0;r<=gr;r++){G[r]=[];for(var c=0;c<=gc;c++){
    var x=WP_X0+c*cw, y=WP_Y0+r*ch;
    if(r>0&&r<gr&&c>0&&c<gc){ x+=Math.sin(r*12.9+c*78.2)*cw*0.13; y+=Math.cos(r*39.3+c*11.7)*ch*0.13; }
    G[r][c]={x:x,y:y};
  }}
  // 모서리 A→B 사이를 부드러운 곡선으로(내부 절단선만 휘게)
  function seg(A,B,bow){
    var dx=B.x-A.x, dy=B.y-A.y, L=Math.hypot(dx,dy)||1;
    var nx=-dy/L, ny=dx/L;
    return {x0:A.x,y0:A.y,
      c1x:A.x+dx*0.33+nx*bow, c1y:A.y+dy*0.33+ny*bow,
      c2x:A.x+dx*0.66+nx*bow, c2y:A.y+dy*0.66+ny*bow,
      x1:B.x,y1:B.y, straight:bow===0};
  }
  function hSeg(r,c){ var bow=(r===0||r===gr)?0: ch*0.14*((r+c)%2?1:-1); return seg(G[r][c],G[r][c+1],bow); }
  function vSeg(r,c){ var bow=(c===0||c===gc)?0: cw*0.14*((r+c)%2?-1:1); return seg(G[r][c],G[r+1][c],bow); }
  function fwd(sg,k){ return sg.straight? 'L '+(sg.x1*k).toFixed(1)+' '+(sg.y1*k).toFixed(1)+' '
      : 'C '+(sg.c1x*k).toFixed(1)+' '+(sg.c1y*k).toFixed(1)+', '+(sg.c2x*k).toFixed(1)+' '+(sg.c2y*k).toFixed(1)+', '+(sg.x1*k).toFixed(1)+' '+(sg.y1*k).toFixed(1)+' '; }
  function rev(sg,k){ return sg.straight? 'L '+(sg.x0*k).toFixed(1)+' '+(sg.y0*k).toFixed(1)+' '
      : 'C '+(sg.c2x*k).toFixed(1)+' '+(sg.c2y*k).toFixed(1)+', '+(sg.c1x*k).toFixed(1)+' '+(sg.c1y*k).toFixed(1)+', '+(sg.x0*k).toFixed(1)+' '+(sg.y0*k).toFixed(1)+' '; }

  // 밑그림(연한 실루엣) + 퍼즐 조각 점선(과일 모양 안에만 보이게 클립)
  function segD(sg){ return 'M '+sg.x0.toFixed(1)+' '+sg.y0.toFixed(1)+' '+fwd(sg,1); }
  var cuts='';
  for(var hr=1;hr<gr;hr++) for(var hc=0;hc<gc;hc++) cuts+=segD(hSeg(hr,hc));   // 안쪽 가로 절단선
  for(var vc=1;vc<gc;vc++) for(var vr=0;vr<gr;vr++) cuts+=segD(vSeg(vr,vc));   // 안쪽 세로 절단선
  var BODY=data.body;
  var fscale=data.scale||1;                     // 길쭉 과일(파인애플) 확대 — 처음부터 끝까지 '일정'하게(완성 때 부풀리지 않음)
  var ghost=document.createElement('div');
  ghost.className='wp-ghost'; ghost.id='wpGhost';
  ghost.style.left=boardLeft+'px'; ghost.style.top=boardTop+'px';
  ghost.style.width=board+'px'; ghost.style.height=board+'px';
  if(fscale!==1){ ghost.style.transformOrigin='center'; ghost.style.transform='scale('+fscale+')'; }

  var snap=Math.min(board*0.34,100);   // 후하게 — 정답 근처에 대충 놔도 착 붙게(키즈 친화)
  var pic;
  if(data.img){
    // PNG 과일: 그림을 비율 유지(contain)로 채우고, 조각은 그 PNG를 격자로 칼질
    // 실제 과일이 보드에 꽉 차도록(여백 제거) 배치 — 확대 아님 → 잘리지 않음
    var ft=wpImgFit(data._bbox||{fx:0,fy:0,fw:1,fh:1,W:1,H:1}, board);
    var fw=ft.rw.toFixed(1), fh=ft.rh.toFixed(1), fl=ft.left.toFixed(1), ftp=ft.top.toFixed(1);
    var imgCss='position:absolute;left:'+fl+'px;top:'+ftp+'px;width:'+fw+'px;height:'+fh+'px;';
    pic='<div class="wp-piece-img" style="width:'+board+'px;height:'+board+'px;">'
      +'<img src="'+data.img+'" draggable="false" style="'+imgCss+'pointer-events:none;"></div>';
    // 맞출 자리: 흐릿한 PNG + 그림 모양에만 보이는 점선 칼선(PNG를 마스크로 사용, 배치 동일)
    var maskCss='-webkit-mask-image:url('+data.img+');mask-image:url('+data.img+');'
      +'-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;'
      +'-webkit-mask-size:'+fw+'px '+fh+'px;mask-size:'+fw+'px '+fh+'px;'
      +'-webkit-mask-position:'+fl+'px '+ftp+'px;mask-position:'+fl+'px '+ftp+'px;';
    ghost.innerHTML='<img src="'+data.img+'" style="'+imgCss+'opacity:0.3;filter:grayscale(0.5) brightness(1.08);">'
      +'<svg viewBox="0 0 200 200" width="'+board+'" height="'+board+'" style="position:absolute;left:0;top:0;'+maskCss+'">'
      +'<path d="'+cuts+'" fill="none" stroke="#9C7B66" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" opacity="0.8"/></svg>';
  } else {
    pic='<div class="wp-piece-img" style="width:'+board+'px;height:'+board+'px;"><svg viewBox="0 0 200 200" width="'+board+'" height="'+board+'" xmlns="http://www.w3.org/2000/svg"><g transform="'+WP_TF+'">'+data.art()+'</g></svg></div>';
    ghost.innerHTML=`<svg viewBox="0 0 200 200" width="${board}" height="${board}" xmlns="http://www.w3.org/2000/svg">`
      +`<defs><clipPath id="wpSilClip"><path d="${BODY}" transform="${WP_TF}"/></clipPath></defs>`
      +`<g opacity="0.5" transform="${WP_TF}">${data.sil()}</g>`
      +`<g clip-path="url(#wpSilClip)"><path d="${cuts}" fill="none" stroke="#9C7B66" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" opacity="0.85"/></g>`
      +`<path d="${BODY}" transform="${WP_TF}" fill="none" stroke="#9C7B66" stroke-width="2.5" stroke-dasharray="5 4" opacity="0.7"/>`
      +`</svg>`;
  }
  stage.appendChild(ghost);

  // === 주축 토막 자르기(바나나 등): 격자 대신 길이방향 n조각 — 빈틈/빈조각 0 ===
  if(data._axis && data._axis.bands && data._axis.bands.length){
    var ax=data._axis, abands=ax.bands, nP=abands.length;
    // 곡선 칼선: 안쪽(조각끼리 맞닿는) 모서리는 곡선, 보드 테두리는 직선.
    // 곡선 휨 부호를 두 점 순서로 자동 반전 → 이웃 조각이 같은 곡선을 거꾸로 그려 빈틈/겹침 0.
    var onBdr=function(A,B){ return (Math.abs(A[0])<0.6&&Math.abs(B[0])<0.6)||(Math.abs(A[0]-200)<0.6&&Math.abs(B[0]-200)<0.6)||(Math.abs(A[1])<0.6&&Math.abs(B[1])<0.6)||(Math.abs(A[1]-200)<0.6&&Math.abs(B[1]-200)<0.6); };
    var edgeCmd=function(A,B,k){
      if(onBdr(A,B)) return 'L '+(B[0]*k).toFixed(1)+' '+(B[1]*k).toFixed(1)+' ';
      var dx=B[0]-A[0], dy=B[1]-A[1], L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
      var sgn=((A[0]-B[0])||(A[1]-B[1]))>0?1:-1, bow=sgn*Math.min(L*0.12,13);
      var c1x=A[0]+dx/3+nx*bow, c1y=A[1]+dy/3+ny*bow, c2x=A[0]+dx*2/3+nx*bow, c2y=A[1]+dy*2/3+ny*bow;
      return 'C '+(c1x*k).toFixed(1)+' '+(c1y*k).toFixed(1)+', '+(c2x*k).toFixed(1)+' '+(c2y*k).toFixed(1)+', '+(B[0]*k).toFixed(1)+' '+(B[1]*k).toFixed(1)+' ';
    };
    var polyPath=function(poly,k){ var s2='M '+(poly[0][0]*k).toFixed(1)+' '+(poly[0][1]*k).toFixed(1)+' '; for(var i=0;i<poly.length;i++) s2+=edgeCmd(poly[i],poly[(i+1)%poly.length],k); return s2+'Z'; };
    // 맞출자리 점선: 안쪽 곡선 칼선만(중복 제거)
    var cutsA='', _seen={};
    abands.forEach(function(b){ var P=b.poly; for(var i=0;i<P.length;i++){ var A=P[i],B=P[(i+1)%P.length]; if(onBdr(A,B)) continue;
      var ka=A[0].toFixed(1)+'_'+A[1].toFixed(1), kb=B[0].toFixed(1)+'_'+B[1].toFixed(1), key=ka<kb?ka+'|'+kb:kb+'|'+ka; if(_seen[key]) continue; _seen[key]=1;
      cutsA+='M '+(A[0]).toFixed(1)+' '+(A[1]).toFixed(1)+' '+edgeCmd(A,B,1); } });
    ghost.innerHTML='<img src="'+data.img+'" style="'+imgCss+'opacity:0.3;filter:grayscale(0.5) brightness(1.08);">'
      +'<svg viewBox="0 0 200 200" width="'+board+'" height="'+board+'" style="position:absolute;left:0;top:0;'+maskCss+'">'
      +'<path d="'+cutsA+'" fill="none" stroke="#9C7B66" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" opacity="0.8"/></svg>';
    var aboveN=Math.ceil(nP/2);
    function slotOf(idx){
      var above=idx<aboveN, inRow=above?idx:idx-aboveN, rowN=above?aboveN:(nP-aboveN);
      var yy=above? boardTop-gap-pitch*0.5 : boardTop+board+gap+pitch*0.5;
      var xx=SW*0.5 + (inRow-(rowN-1)/2)*(SW*0.66/Math.max(rowN,1));
      return {x:xx,y:yy};
    }
    wpPlaced=0; wpTotal=nP;
    abands.forEach(function(band,idx){
      var poly=band.poly;
      var d=polyPath(poly,s);
      var piece=document.createElement('div');
      piece.className='wp-piece';
      piece.style.width=board+'px'; piece.style.height=board+'px';
      piece.style.clipPath="path('"+d+"')"; piece.style.webkitClipPath="path('"+d+"')";
      piece.innerHTML=pic;
      var minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
      poly.forEach(function(pp){ if(pp[0]<minx)minx=pp[0]; if(pp[0]>maxx)maxx=pp[0]; if(pp[1]<miny)miny=pp[1]; if(pp[1]>maxy)maxy=pp[1]; });
      var bx0=boardLeft+minx*s, bx1=boardLeft+maxx*s, by0=boardTop+miny*s, by1=boardTop+maxy*s;
      var homeCenterX=boardLeft+band.cx*s, homeCenterY=boardTop+band.cy*s;
      var slot=slotOf(idx);
      var offX=slot.x-homeCenterX, offY=slot.y-homeCenterY, m=6;
      if(bx0+offX<m) offX=m-bx0;
      if(bx1+offX>SW-m) offX=SW-m-bx1;
      if(by0+offY<m) offY=m-by0;
      if(by1+offY>SH-m) offY=SH-m-by1;
      piece.style.left=(boardLeft+offX)+'px'; piece.style.top=(boardTop+offY)+'px';
      piece.addEventListener('pointerdown',function(e){
        if(piece.classList.contains('placed'))return;
        e.preventDefault();
        try{piece.setPointerCapture(e.pointerId);}catch(_){}
        piece.classList.add('drag');
        var px=e.clientX, py=e.clientY;
        var ol=parseFloat(piece.style.left), ot=parseFloat(piece.style.top);
        function mv(ev){ piece.style.left=(ol+ev.clientX-px)+'px'; piece.style.top=(ot+ev.clientY-py)+'px'; }
        function up(ev){
          piece.removeEventListener('pointermove',mv);
          piece.removeEventListener('pointerup',up);
          piece.removeEventListener('pointercancel',up);
          piece.classList.remove('drag');
          var cl=parseFloat(piece.style.left), ct=parseFloat(piece.style.top);
          if(Math.hypot(cl-boardLeft,ct-boardTop)<snap){
            piece.style.left=boardLeft+'px'; piece.style.top=boardTop+'px';
            piece.classList.add('placed','snap'); piece.style.zIndex=10;
            setTimeout(function(){piece.classList.remove('snap');},400);
            wpClick(); wpPlaced++;
            if(wpPlaced===wpTotal) setTimeout(wpComplete,300);
          } else { piece.style.zIndex=20; }
        }
        piece.addEventListener('pointermove',mv);
        piece.addEventListener('pointerup',up);
        piece.addEventListener('pointercancel',up);
      });
      stage.appendChild(piece);
    });
    return;
  }

  // 흩어놓을 고정 자리 — 격자 윗줄은 사과 위 밴드, 아랫줄은 아래 밴드에 줄 단위로 배치
  function colXof(c){ return gc<=1 ? SW*0.5 : SW*0.5 + (c-(gc-1)/2)*(SW*0.80/gc); }
  function rowYof(r){
    return (r<aboveRows)
      ? boardTop - gap - pitch*0.5 - pitch*(aboveRows-1-r)        // 위 밴드 (사과에 가까울수록 아래)
      : boardTop + board + gap + pitch*0.5 + pitch*(r-aboveRows); // 아래 밴드
  }
  var slots=pieces.map(function(p){ return {x:colXof(p.c0), y:rowYof(p.r)}; });

  pieces.forEach(function(spec,idx){
    if(mask && !mask[idx]) return;             // PNG 과일: 거의 빈 조각은 건너뜀
    var r=spec.r, c0=spec.c0, c1=spec.c1;
    var TL=G[r][c0];
    // 경로: 위(좌→우) → 오른쪽(위→아래) → 아래(우→좌) → 왼쪽(아래→위)
    var d='M '+(TL.x*s).toFixed(1)+' '+(TL.y*s).toFixed(1)+' ';
    for(var c=c0;c<=c1;c++) d+=fwd(hSeg(r,c),s);          // 위
    d+=fwd(vSeg(r,c1+1),s);                                // 오른쪽
    for(var c2=c1;c2>=c0;c2--) d+=rev(hSeg(r+1,c2),s);     // 아래(역순)
    d+=rev(vSeg(r,c0),s);                                  // 왼쪽
    d+='Z';

    var piece=document.createElement('div');
    piece.className='wp-piece';
    piece.style.width=board+'px'; piece.style.height=board+'px';
    piece.style.clipPath="path('"+d+"')";
    piece.style.webkitClipPath="path('"+d+"')";
    if(fscale!==1){ piece.style.transformOrigin='center'; piece.style.transform='scale('+fscale+')'; }  // 처음부터 일정 확대
    piece.innerHTML=pic;

    // 조각(셀) 영역의 제자리 픽셀 박스 (스테이지 기준)
    var aX0=WP_X0+c0*cw, aX1=WP_X0+(c1+1)*cw, aY0=WP_Y0+r*ch, aY1=WP_Y0+(r+1)*ch;
    var homeCenterX=boardLeft+((aX0+aX1)/2)*s, homeCenterY=boardTop+((aY0+aY1)/2)*s;
    var bx0=boardLeft+aX0*s, bx1=boardLeft+aX1*s, by0=boardTop+aY0*s, by1=boardTop+aY1*s;
    // 흩어놓기: 지정 자리로 이동
    var slot=slots[idx];
    var offX=slot.x-homeCenterX, offY=slot.y-homeCenterY;
    // 조각 박스가 화면을 벗어나지 않게 보정
    var m=6;
    if(bx0+offX<m) offX=m-bx0;
    if(bx1+offX>SW-m) offX=SW-m-bx1;
    if(by0+offY<m) offY=m-by0;
    if(by1+offY>SH-m) offY=SH-m-by1;
    piece.style.left=(boardLeft+offX)+'px'; piece.style.top=(boardTop+offY)+'px';

    piece.addEventListener('pointerdown',function(e){
      if(piece.classList.contains('placed'))return;
      e.preventDefault();
      try{piece.setPointerCapture(e.pointerId);}catch(_){}
      piece.classList.add('drag');
      var px=e.clientX, py=e.clientY;
      var ol=parseFloat(piece.style.left), ot=parseFloat(piece.style.top);
      function mv(ev){ piece.style.left=(ol+ev.clientX-px)+'px'; piece.style.top=(ot+ev.clientY-py)+'px'; }
      function up(ev){
        piece.removeEventListener('pointermove',mv);
        piece.removeEventListener('pointerup',up);
        piece.removeEventListener('pointercancel',up);
        piece.classList.remove('drag');
        var cl=parseFloat(piece.style.left), ct=parseFloat(piece.style.top);
        if(Math.hypot(cl-boardLeft,ct-boardTop)<snap){
          piece.style.left=boardLeft+'px'; piece.style.top=boardTop+'px';
          piece.classList.add('placed','snap');
          piece.style.zIndex=10;
          setTimeout(function(){piece.classList.remove('snap');},400);
          wpClick();
          wpPlaced++;
          if(wpPlaced===wpTotal) setTimeout(wpComplete,300);
        } else {
          piece.style.zIndex=20;
        }
      }
      piece.addEventListener('pointermove',mv);
      piece.addEventListener('pointerup',up);
      piece.addEventListener('pointercancel',up);
    });

    stage.appendChild(piece);
  });
}

// === 과일 퍼즐 스펠링 전용 음량 부스트 (2026-07-29) ===
// ffmpeg 실측: letter_*.mp3 는 피크가 이미 0.0~-0.4dB(천장에 붙음), 평균은 -10~-21dB로 들쭉날쭉.
//  → 볼륨 숫자만 1.0 위로 올리면 곧장 깨짐(클리핑). 그래서 게인 +6dB 뒤에
//    리미터(DynamicsCompressor, 천장 -1.5dBFS)를 물려 피크만 눌러 담는 방식.
//  → 시뮬레이션(평균 dB): a -19.1→-14.3 / b -20.8→-14.8 / t -17.6→-13.3 / p -12.6→-11.8 / r -10.4→-10.2
//    (원래 작던 글자가 크게 올라오고, 이미 큰 글자는 조금만 올라 서로 고르게 됨. 피크는 0dB 미만 유지)
// 소리 파일·다른 게임(파리잡기 letter, 동물·공룡 퍼즐)은 일절 미변경 — 이 경로는 과일 퍼즐 스펠링 전용.
var WP_LETTER_GAIN=2.0;          // +6dB. 원본 파일은 그대로 두고 재생할 때만 증폭
var _wpLim=null;
function wpLetterOut(){          // 리미터 노드(1회 생성 후 재사용) → 없으면 그냥 스피커로
  if(!ax) return null;
  if(_wpLim) return _wpLim;
  try{
    var c=ax.createDynamicsCompressor();
    c.threshold.value=-1.5;      // -1.5dBFS 넘는 부분만 눌러 담음(오버슛 여유 포함해 0dB 안 넘김)
    c.knee.value=0;              // 딱 잘라 리미터처럼
    c.ratio.value=20;
    c.attack.value=0.002;
    c.release.value=0.08;
    c.connect(ax.destination);
    _wpLim=c;
  }catch(e){ _wpLim=ax.destination; }   // 구형 웹뷰에 압축기 없으면 직결(게인은 1.0으로 낮춤)
  return _wpLim;
}

// 글자 음성(letter_*.mp3)의 앞/뒤 묵음을 자동 감지해 잘라내고 발음만 이어붙이기 위한 캐시/로더
// (동물 퍼즐 proto-animal.html과 동일 방식 — 발음 길이·음정 그대로, 죽은 묵음만 제거)
var _wpLbuf={};
function wpLoadLetter(ch){
  ch=ch.toLowerCase(); if(_wpLbuf[ch]) return _wpLbuf[ch];
  _wpLbuf[ch]=fetch('assets/abc/sounds/letter_'+ch+'.mp3').then(function(r){return r.arrayBuffer();})
    .then(function(ab){ ea(); if(!ax) return null; return new Promise(function(res,rej){ ax.decodeAudioData(ab,res,rej); }); })
    .then(function(buf){ if(!buf) return null;
      var d=buf.getChannelData(0), sr=buf.sampleRate, win=Math.floor(sr*0.01), thr=0.015, first=-1, last=0;
      for(var i=0;i<d.length;i+=win){ var s=0,n=0; for(var j=i;j<i+win&&j<d.length;j++){s+=d[j]*d[j];n++;}
        if(Math.sqrt(s/n)>thr){ last=i+win; if(first<0)first=i; } }
      return { buffer:buf, start:(first<0?0:Math.max(0,first/sr-0.03)), end:Math.min(buf.duration,last/sr+0.04) };
    }).catch(function(){ return null; });
  return _wpLbuf[ch];
}

function wpComplete(){
  try{gtag('event','word_puzzle_complete',{category:'fruit',word:wpCurrent});}catch(e){}
  var data=WP_WORDS[wpCurrent];
  var stage=document.getElementById('wpStage');
  var ghost=document.getElementById('wpGhost'); if(ghost) ghost.style.opacity='0';

  var board=wpGeo.board, bLeft=wpGeo.boardLeft, bTop=wpGeo.boardTop;
  var GROW=0;

  // 파인애플 등은 처음부터 fscale로 일정 확대됨(완성 때 부풀리지 않음) → 글자만 같은 배율로 맞춤
  var fscale=data.scale||1;

  var word=data.word.split('');
  // 가로 단어 — 사과 중앙에 (확대된 과일에 맞춰 글자도 같이 키움)
  var wrap=document.createElement('div');
  wrap.className='wp-word-h'; wrap.id='wpWordH';
  wrap.style.left=(bLeft+board/2)+'px';
  wrap.style.top=(bTop+board/2+board*0.06*fscale)+'px';
  var fs=Math.min(board*0.2, board*0.82/(word.length*0.66))*fscale;
  wrap.style.fontSize=fs+'px';
  word.forEach(function(ch){
    var sp=document.createElement('span'); sp.className='wl'; sp.textContent=ch; wrap.appendChild(sp);
  });
  stage.appendChild(wrap);

  var spans=wrap.querySelectorAll('.wl');

  // === 글자 소리를 '앞 소리가 끝나면 다음' 순서로 재생 → 간격 일정하고 자연스럽게 ===
  function afterLetters(){
    wrap.classList.add('shout');                       // 단어 전체 강조 + 반짝
    wpSayWord(data.word);                               // 단어 한 번 외치기
    var idx=WP_ORDER.indexOf(wpCurrent), isLast=idx>=WP_ORDER.length-1;
    if(!isLast){
      setTimeout(function(){ try{playVoice(getCheer().vk);}catch(_){}; }, 1300);  // 칭찬 음성 (마지막 과일은 Thanks 음성이 대신함)
      setTimeout(function(){
        if(!document.getElementById('wp').classList.contains('show')) return;   // 도중에 나갔으면 중단
        buildPuzzle(WP_ORDER[idx+1]);
      }, 2900);
    } else {
      // 마지막 과일 완성 → 개구리 과일바구니 축하 영상 → 끝나면 다시하기 버튼
      setTimeout(function(){ wpPlayEnding(stage); }, 1800);
    }
  }
  // === 글자 음성의 앞/뒤 묵음을 자동 감지해 잘라내고 발음만 이어붙임 (동물 퍼즐과 동일 속도감) ===
  //  발음 길이·음정은 그대로, '죽은 묵음'만 제거 → 빠르고 자연스러움. ▶ 속도는 LETTER_GAP만 조절.
  var LETTER_GAP=90;
  word.forEach(function(ch){ wpLoadLetter(ch); });      // 미리 디코드(첫 글자 지연 방지)
  function playLetter(i){
    if(i>=word.length){ setTimeout(afterLetters, 300); return; }
    spans[i].classList.add('show');
    wpLoadLetter(word[i]).then(function(info){
      var dur=600;   // 디코드 실패 시 폴백
      if(info && ax){ try{ var src=ax.createBufferSource(), g=ax.createGain(), out=wpLetterOut()||ax.destination;
          src.buffer=info.buffer;
          g.gain.value=(out===ax.destination)?1.0:WP_LETTER_GAIN;   // 리미터 있으면 +6dB, 없으면 안전하게 1.0(깨짐 방지)
          src.connect(g); g.connect(out);
          src.start(0, info.start, info.end-info.start);   // 묵음 잘라낸 발음 구간만 재생
          dur=(info.end-info.start)*1000;
        }catch(e){ try{ var a=safeAudio('assets/abc/sounds/letter_'+word[i].toLowerCase()+'.mp3'); a.volume=1.0; a.play(); }catch(_){} }
      } else { try{ var a2=safeAudio('assets/abc/sounds/letter_'+word[i].toLowerCase()+'.mp3'); a2.volume=1.0; a2.play(); }catch(_){} }
      setTimeout(function(){ playLetter(i+1); }, dur+LETTER_GAP);   // 발음 끝나면 GAP만 쉬고 다음
    });
  }
  setTimeout(function(){ playLetter(0); }, 450);        // 완성 직후 잠깐 뒤 시작
}

// 엔딩 정리 함수(화면 이탈 시 음성/타이머/영상 한 번에 정리) — wpBack/popstate/replay에서 호출
var _wpEndingStop=null;
// 마지막 과일까지 다 맞추면 개구리 과일바구니 축하 영상 + "Thanks friend!" 음성 재생 → 끝나면 다시하기 버튼
// (영상은 이 순간에만 불러옴 → 평소 로딩 영향 없음 / 영상은 무음 자동재생, 소리는 음성이 담당 / 음성 끝나면 마무리 / 탭하면 건너뛰기 / 실패해도 버튼만)
function wpPlayEnding(stage){
  var done=false, ov=null, voice=null, voiceOk=false, safetyId=0;
  function showReplay(host){
    if(!stage || document.getElementById('wpReplayBtn')) return;
    var rb=document.createElement('button');
    rb.id='wpReplayBtn'; rb.className='wp-replay'; rb.textContent='🔄';
    rb.onclick=function(ev){ if(ev&&ev.stopPropagation) ev.stopPropagation();
      if(_wpEndingStop) _wpEndingStop();   // 음성/타이머/영상 모두 정리
      buildPuzzle(WP_ORDER[0]); };   // 처음 과일부터 다시
    (host||stage).appendChild(rb);
    setTimeout(function(){ rb.classList.add('show'); }, 300);
  }
  // 화면 이탈 시 정리: 음성 정지 + 9초 타이머 해제 + 영상 제거 + 늦은 finish 차단
  function endingStop(){
    done=true;
    try{ clearTimeout(safetyId); }catch(_){}
    try{ if(voice){ voice.pause(); voice.onended=null; } }catch(_){}
    var o=document.getElementById('wpVideo'); if(o&&o.parentNode) o.parentNode.removeChild(o);
    _wpEndingStop=null;
  }
  function finish(){ if(done)return; done=true;
    try{ clearTimeout(safetyId); }catch(_){}
    try{ if(voice) voice.pause(); }catch(_){}
    // 영상을 '정지 그림(캔버스)'으로 바꿔치기(멈춘 영상 레이어 미세 떨림 제거) + 덮개 제거
    try{ if(ov){ var fv=ov.querySelector('video');
      if(fv){ try{fv.pause();}catch(_){}
        try{ if(fv.videoWidth){ var c=document.createElement('canvas'); c.width=fv.videoWidth; c.height=fv.videoHeight; c.className='wp-still'; c.getContext('2d').drawImage(fv,0,0,c.width,c.height); ov.insertBefore(c,fv); } }catch(_){}
        fv.style.display='none';                                            // 영상 항상 숨김(정지그림 있으면 그게, 없으면 흰 배경)
      }
      var cvr=ov.querySelector('.wp-vcover'); if(cvr&&cvr.parentNode) cvr.parentNode.removeChild(cvr);   // 덮개 정리
    } }catch(_){}
    // 마지막 장면 위에 다시하기 버튼 (파인애플 퍼즐이 다시 보이지 않게)
    showReplay(ov && ov.parentNode ? ov : stage);
  }
  // 화면을 이미 벗어났으면 영상 없이 버튼만
  var wpEl=document.getElementById('wp');
  if(!stage || !wpEl || !wpEl.classList.contains('show')){ showReplay(); return; }
  _wpEndingStop=endingStop;   // 이 시점부터 화면 이탈 시 정리 가능
  // "Thanks friend, yummy fruit!" 음성 — 이 음성이 끝나면 마무리(타이밍 지휘자)
  try{
    voice=safeAudio('assets/fruit/sounds/Thanks-friend-Yummy-fruit.mp3'); voice.volume=1;
    voice.onended=finish;
    var vpr=voice.play();
    if(vpr&&vpr.then){ vpr.then(function(){ voiceOk=true; }).catch(function(){ voiceOk=false; }); }
    else { voiceOk=true; }
  }catch(e){ voice=null; voiceOk=false; }
  // 무음 영상 (자동재생용 무음 — 소리는 위 음성이 담당)
  try{
    ov=document.createElement('div'); ov.className='wp-video'; ov.id='wpVideo';
    var vid=document.createElement('video');
    vid.src='assets/frog/videos/frog-baskit.mp4';
    vid.muted=true; vid.defaultMuted=true; vid.setAttribute('muted','');     // 무음 → 폰 자동재생 허용
    vid.setAttribute('playsinline',''); vid.playsInline=true;                 // iOS 전체화면 강제 방지
    vid.autoplay=true; vid.controls=false; vid.preload='auto';
    ov.appendChild(vid);
    // 불투명 덮개: 영상 자리를 처음부터 완전히 가림 → 영상 준비 전 '검은 surface'가 절대 안 보임.
    // 영상이 '진짜 재생'(currentTime 전진=실제 프레임 출력)을 시작하면 그때 덮개를 걷어냄.
    var cover=document.createElement('div'); cover.className='wp-vcover';
    ov.appendChild(cover);
    (document.getElementById('wp')||stage).appendChild(ov);          // 화면 전체를 흰색으로 덮음(위아래 띠 포함)
    ov.addEventListener('click', finish);                            // 탭하면 건너뛰기
    vid.addEventListener('ended', function(){ if(!voiceOk) finish(); });   // 음성이 안 되면 영상 끝에 맞춰 마무리
    vid.addEventListener('error', function(){ if(!voiceOk) finish(); });   // 영상 실패 시(음성도 없으면) 버튼만
    var uncovered=false;
    function uncover(){ if(uncovered)return; uncovered=true;
      if(cover){ cover.classList.add('hide'); setTimeout(function(){ try{ if(cover&&cover.parentNode) cover.parentNode.removeChild(cover); }catch(_){} }, 380); } }
    function chk(){ if(vid.currentTime>0 && !vid.paused) uncover(); }   // 진짜 재생 중(프레임 나오는 중)일 때만 덮개 제거
    vid.addEventListener('timeupdate', chk);                           // currentTime 전진 = 실제 프레임 출력 신호
    vid.addEventListener('playing', chk);
    setTimeout(uncover, 1500);   // 안전장치: 1.5초 안에 확인 못 해도 덮개는 걷음(대개 이미 재생 중)
    var pr=vid.play(); if(pr&&pr.catch) pr.catch(function(){ if(!voiceOk) finish(); });   // 자동재생/영상 막히면 버튼으로
  }catch(e){ if(!voiceOk) finish(); }
  safetyId=setTimeout(finish, 9000);   // 안전장치: 9초 지나면 강제로 정리
}

// 단어 음성: voice_<word>.mp3 → .wav 순으로 파일 재생, 둘 다 없으면 브라우저 TTS
function wpSayWord(w){
  var base='assets/fruit/sounds/voice_'+w.toLowerCase();
  var settled=false;
  function tts(){ if(settled)return; settled=true;
    try{ if(window.speechSynthesis){ speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(w); u.lang='en-US'; u.rate=0.85; u.pitch=1.15; u.volume=1; speechSynthesis.speak(u);
    } }catch(e){} }
  function attempt(urls,i){
    if(settled) return;
    if(i>=urls.length){ tts(); return; }
    var fired=false;
    function fail(){ if(fired)return; fired=true; attempt(urls,i+1); }
    try{
      var a=new Audio(urls[i]); a.volume=1;
      a.addEventListener('error',fail);
      a.play().then(function(){ settled=true; }).catch(fail);
    }catch(e){ fail(); }
  }
  attempt([base+'.mp3', base+'.wav'], 0);
}

// (Word 카드 사과 아이콘은 index.html에 fruit_apple.png를 직접 넣음 — JS 주입 제거: JS 멈춰도 안 사라지게)

// === 뒤로가기 버튼 처리 (TWA 안정성) ===
window.addEventListener('popstate',function(e){
  // 단어 퍼즐 화면이 열려 있으면 → 닫기만 (시작화면으로 복귀)
  var wp=document.getElementById('wp');
  if(wp&&wp.classList.contains('show')){
    if(_wpEndingStop) _wpEndingStop();   // 엔딩 음성/타이머/영상 정리
    wp.classList.remove('show');
    try{SND_BGM.pause();}catch(_){}
    history.pushState(null,null,location.href);
    return;
  }
  var wc=document.getElementById('wc');
  if(wc&&wc.classList.contains('show')){
    wc.classList.remove('show');
    history.pushState(null,null,location.href);
    return;
  }
  var ms=document.getElementById('ms');
  if(ms&&ms.classList.contains('show')){
    ms.classList.remove('show');
    history.pushState(null,null,location.href);
    return;
  }
  var ss=document.getElementById('ss');
  if(ss&&ss.style.display!=='none'){
    // 시작 화면에서 뒤로가기 → 아무것도 안 함 (앱 종료 방지)
    history.pushState(null,null,location.href);
  } else {
    // 게임 중 뒤로가기 → 시작 화면으로
    history.pushState(null,null,location.href);
    location.reload();
  }
});
// 초기 히스토리 상태 추가
try{history.pushState(null,null,location.href);}catch(e){}
