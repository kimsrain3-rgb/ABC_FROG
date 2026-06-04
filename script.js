
// === 전역 에러 핸들러 (TWA 크래시 방지) ===
window.onerror=function(msg,src,line,col,err){console.warn('Error caught:',msg);return true;};
window.addEventListener('unhandledrejection',function(e){e.preventDefault();console.warn('Promise rejected:',e.reason);});

// === 인트로 개구리 숨쉬기 ===
(function(){const f=document.querySelector('.ss .sf');if(!f)return;let t=false;setInterval(()=>{t=!t;f.src='assets/images/frog_4'+(t?'b':'a')+'.png'},800);})();

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
const SND_FLY1=safeAudio('assets/sounds/fly_buzz1.mp3');
const SND_FLY2=safeAudio('assets/sounds/fly_buzz2.mp3');
const SND_FROG=safeAudio('assets/sounds/frog_tongue.mp3');
const SND_BGM=safeAudio('assets/sounds/bgm.mp3');
SND_BGM.loop=true;SND_BGM.volume=0.25;
SND_FLY1.volume=0.5;SND_FLY2.volume=0.5;
SND_FROG.volume=0.5;

let bgmStarted=false;
function startBGM(){if(!bgmStarted){SND_BGM.play().catch(()=>{});bgmStarted=true;}}

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
  left:["assets/images/fly_left.png","assets/images/fly_left2.png"],
  right:["assets/images/fly_right.png","assets/images/fly_right2.png"],
  front:["assets/images/fly_front.png","assets/images/fly_front2.png"]
};
const DRAGONFLY_IMGS={
  left:["assets/images/dregon1.png","assets/images/dregon1-1.png"],
  right:["assets/images/dregon2.png","assets/images/dregon2-1.png"],
  front:["assets/images/dregon1.png","assets/images/dregon1-1.png"]
};
const SPIDER_IMGS=["assets/images/spider1.png","assets/images/spider1-1.png"];
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
  'assets/images/butterfly_frame1.png',
  'assets/images/butterfly_frame2.png'
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
  where_is:safeAudio('assets/sounds/voice_where_is.mp3'),
  find_for_me:safeAudio('assets/sounds/voice_find_for_me.mp3'),
  i_see:safeAudio('assets/sounds/voice_i_see.mp3'),
  tap:safeAudio('assets/sounds/voice_tap.mp3'),
  can_you_see:safeAudio('assets/sounds/voice_can_you_see.mp3'),
  help_me_find:safeAudio('assets/sounds/voice_help_me_find.mp3'),
  look:safeAudio('assets/sounds/voice_look.mp3'),
  over_there:safeAudio('assets/sounds/voice_over_there.mp3'),
  catch_v:safeAudio('assets/sounds/voice_catch_v.mp3'),
  congrats:safeAudio('assets/sounds/voice_congrats.mp3'),
  you_did_it:safeAudio('assets/sounds/voice_you_did_it.mp3'),
  hooray:safeAudio('assets/sounds/voice_hooray.mp3'),
  tap_the_letter:safeAudio('assets/sounds/voice_tap_the_letter.mp3'),
  excellent:safeAudio('assets/sounds/voice_excellent.mp3'),
  good_job:safeAudio('assets/sounds/voice_good_job.mp3'),
  nice:safeAudio('assets/sounds/voice_nice.mp3'),
  awesome:safeAudio('assets/sounds/voice_awesome.mp3'),
  great_catch:safeAudio('assets/sounds/voice_great_catch.mp3'),
  youre_a_genius:safeAudio('assets/sounds/voice_youre_a_genius.mp3'),
  thats_right:safeAudio('assets/sounds/voice_thats_right.mp3'),
  amazing:safeAudio('assets/sounds/voice_amazing.mp3'),
  well_done:safeAudio('assets/sounds/voice_well_done.mp3'),
  super:safeAudio('assets/sounds/voice_super.mp3'),
  fantastic:safeAudio('assets/sounds/voice_fantastic.mp3'),
  you_got_it:safeAudio('assets/sounds/voice_you_got_it.mp3'),
  perfect:safeAudio('assets/sounds/voice_perfect.mp3'),
  brilliant:safeAudio('assets/sounds/voice_brilliant.mp3'),
  way_to_go:safeAudio('assets/sounds/voice_way_to_go.mp3'),
  bingo:safeAudio('assets/sounds/voice_bingo.mp3'),
  yummy:safeAudio('assets/sounds/voice_yummy.mp3'),
  yummy_yummy:safeAudio('assets/sounds/voice_yummy_yummy.mp3'),
  i_wanna_eat:safeAudio('assets/sounds/voice_i_wanna_eat.mp3'),
  give_me:safeAudio('assets/sounds/voice_give_me.mp3'),
  i_need:safeAudio('assets/sounds/voice_i_need.mp3'),
  find:safeAudio('assets/sounds/voice_find.mp3'),
  looks_so_yummy:safeAudio('assets/sounds/voice_looks_so_yummy.mp3'),
  gimme:safeAudio('assets/sounds/voice_gimme.mp3'),
  bring_me:safeAudio('assets/sounds/voice_bring_me.mp3'),
  please_v:safeAudio('assets/sounds/voice_please_v.mp3'),
  im_so_hungry:safeAudio('assets/sounds/voice_im_so_hungry.mp3'),
  im_hungry:safeAudio('assets/sounds/voice_im_hungry.mp3'),
  im_so_full:safeAudio('assets/sounds/voice_im_so_full.mp3'),
};
function playVoice(k,vol){var v=VOICE[k];if(!v)return;v.currentTime=0;v.volume=vol||0.8;v.play().catch(function(){});}

const SND_WOOWECK=safeAudio('assets/sounds/wooweck.mp3');
const BF_VOICES=[
  safeAudio('assets/sounds/butterfly_voice1.mp3'),
  safeAudio('assets/sounds/butterfly_voice2.mp3')
];
let bfVoiceIdx=0;
function playBfVoice(){
  var v=BF_VOICES[bfVoiceIdx];
  v.currentTime=0;v.volume=0.8;v.play().catch(function(){});
  bfVoiceIdx=(bfVoiceIdx+1)%2;
}

const BUTTERFLY_SHOCK=[
  'assets/images/butterfly_shock1.png',
  'assets/images/butterfly_shock2.png'
];

const CATERPILLAR_FRAMES=[
  'assets/images/caterpillar_frame1.png',
  'assets/images/caterpillar_frame2.png',
  'assets/images/caterpillar_frame3.png',
  'assets/images/caterpillar_frame4.png',
  'assets/images/caterpillar_frame5.png'
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
  A:'assets/sounds/letter_a.mp3',
  B:'assets/sounds/letter_b.mp3',
  C:'assets/sounds/letter_c.mp3',
  D:'assets/sounds/letter_d.mp3',
  E:'assets/sounds/letter_e.mp3',
  F:'assets/sounds/letter_f.mp3',
  G:'assets/sounds/letter_g.mp3',
  H:'assets/sounds/letter_h.mp3',
  I:'assets/sounds/letter_i.mp3',
  J:'assets/sounds/letter_j.mp3',
  K:'assets/sounds/letter_k.mp3',
  L:'assets/sounds/letter_l.mp3',
  M:'assets/sounds/letter_m.mp3',
  N:'assets/sounds/letter_n.mp3',
  O:'assets/sounds/letter_o.mp3',
  P:'assets/sounds/letter_p.mp3',
  Q:'assets/sounds/letter_q.mp3',
  R:'assets/sounds/letter_r.mp3',
  S:'assets/sounds/letter_s.mp3',
  T:'assets/sounds/letter_t.mp3',
  U:'assets/sounds/letter_u.mp3',
  V:'assets/sounds/letter_v.mp3',
  W:'assets/sounds/letter_w.mp3',
  X:'assets/sounds/letter_x.mp3',
  Y:'assets/sounds/letter_y.mp3',
  Z:'assets/sounds/letter_z.mp3'
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
function ptg(){ea();const o=ax.createOscillator(),g=ax.createGain();o.type='sine';o.frequency.setValueAtTime(800,ax.currentTime);o.frequency.exponentialRampToValueAtTime(200,ax.currentTime+.15);g.gain.setValueAtTime(.15,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+.15);o.connect(g);g.connect(ax.destination);o.start();o.stop(ax.currentTime+.15)}
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
  if(ia)return;ea();rit();
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
    document.body.style.background="url('assets/images/bg_4.png') center bottom/cover no-repeat";
    document.body.style.backgroundColor="#87CEEB";
    gc.classList.add('mode-abc');
  } else if(gameMode==='ABc'){
    document.body.style.background="url('assets/images/bg_5.png') center/cover no-repeat";
    document.body.style.backgroundColor="#2a3a1a";
    gc.classList.add('mode-ABc');
  } else {
    document.body.style.background="url('assets/images/bg_1.png') center/cover no-repeat";
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

// 단어 사전: 그림 조각으로 맞출 과일들
const WP_WORDS={
  apple:{word:'APPLE',art:appleArt,sil:appleSil,body:APPLE_BODY},
  banana:{word:'BANANA',art:bananaArt,sil:bananaSil,body:BANANA_BODY},
  grape:{word:'GRAPE',art:grapeArt,sil:grapeSil,body:GRAPE_BODY},
  orange:{word:'ORANGE',art:orangeArt,sil:orangeSil,body:ORANGE_BODY},
  strawberry:{word:'STRAWBERRY',art:strawberryArt,sil:strawberrySil,body:STRAWBERRY_BODY},
  watermelon:{word:'WATERMELON',art:watermelonArt,sil:watermelonSil,body:WATERMELON_BODY},
  peach:{word:'PEACH',art:peachArt,sil:peachSil,body:PEACH_BODY},
  lemon:{word:'LEMON',art:lemonArt,sil:lemonSil,body:LEMON_BODY}
};
// 한 게임에서 진행할 과일 순서 (여기에 추가/순서변경 하면 자동 반영)
const WP_ORDER=['apple','banana','grape','orange','strawberry','watermelon','peach','lemon'];

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
  try{gtag('event','word_puzzle_open',{word:wpCurrent});}catch(e){}
  // 세로 방향 잠금 시도(지원 브라우저/설치앱) — 미지원 시 무시
  try{ if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('portrait').catch(function(){}); }catch(e){}
  // 배경음악 (메인 게임과 동일한 bgm.mp3 재사용)
  try{ SND_BGM.loop=true; SND_BGM.volume=0.25; SND_BGM.play().catch(function(){}); bgmStarted=true; }catch(e){}
  requestAnimationFrame(function(){requestAnimationFrame(function(){buildPuzzle(WP_ORDER[0]);});});
}
function wpBack(){ document.getElementById('wp').classList.remove('show'); try{SND_BGM.pause();}catch(e){} }

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

function buildPuzzle(key){
  wpCurrent=key||'apple';
  var data=WP_WORDS[wpCurrent];
  var stage=document.getElementById('wpStage');
  stage.innerHTML='';
  var SW=stage.clientWidth, SH=stage.clientHeight;
  if(SW<10||SH<10){ setTimeout(function(){buildPuzzle(wpCurrent);},60); return; }

  var board=Math.min(SW*0.64, SH*0.36, 320);  // 아래 조각 트레이 공간 확보 위해 작게
  var s=board/200;                          // 아트→픽셀 배율
  var boardLeft=(SW-board)/2;
  var boardTop=Math.max(8, SH*0.01);        // 사과(맞출 자리)는 위쪽에, 아래는 조각 트레이
  var cx=boardLeft+board/2, cy=boardTop+board/2;
  wpGeo={boardLeft:boardLeft,boardTop:boardTop,board:board};
  wpPlaced=0; wpTotal=WP_PIECES.length;
  var tEl=document.getElementById('wpTitle'); if(tEl) tEl.textContent='🧩 Make the '+data.word.toLowerCase()+'!';

  // 자르기 격자 모서리(안쪽만 살짝 흔들어 자연스러운 곡선)
  var cw=(WP_X1-WP_X0)/WP_GC, ch=(WP_Y1-WP_Y0)/WP_GR;
  var G=[];
  for(var r=0;r<=WP_GR;r++){G[r]=[];for(var c=0;c<=WP_GC;c++){
    var x=WP_X0+c*cw, y=WP_Y0+r*ch;
    if(r>0&&r<WP_GR&&c>0&&c<WP_GC){ x+=Math.sin(r*12.9+c*78.2)*cw*0.13; y+=Math.cos(r*39.3+c*11.7)*ch*0.13; }
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
  function hSeg(r,c){ var bow=(r===0||r===WP_GR)?0: ch*0.14*((r+c)%2?1:-1); return seg(G[r][c],G[r][c+1],bow); }
  function vSeg(r,c){ var bow=(c===0||c===WP_GC)?0: cw*0.14*((r+c)%2?-1:1); return seg(G[r][c],G[r+1][c],bow); }
  function fwd(sg,k){ return sg.straight? 'L '+(sg.x1*k).toFixed(1)+' '+(sg.y1*k).toFixed(1)+' '
      : 'C '+(sg.c1x*k).toFixed(1)+' '+(sg.c1y*k).toFixed(1)+', '+(sg.c2x*k).toFixed(1)+' '+(sg.c2y*k).toFixed(1)+', '+(sg.x1*k).toFixed(1)+' '+(sg.y1*k).toFixed(1)+' '; }
  function rev(sg,k){ return sg.straight? 'L '+(sg.x0*k).toFixed(1)+' '+(sg.y0*k).toFixed(1)+' '
      : 'C '+(sg.c2x*k).toFixed(1)+' '+(sg.c2y*k).toFixed(1)+', '+(sg.c1x*k).toFixed(1)+' '+(sg.c1y*k).toFixed(1)+', '+(sg.x0*k).toFixed(1)+' '+(sg.y0*k).toFixed(1)+' '; }

  // 밑그림(연한 실루엣) + 퍼즐 조각 점선(과일 모양 안에만 보이게 클립)
  function segD(sg){ return 'M '+sg.x0.toFixed(1)+' '+sg.y0.toFixed(1)+' '+fwd(sg,1); }
  var cuts=segD(hSeg(1,0))+segD(hSeg(1,1))+segD(hSeg(1,2))
          +segD(hSeg(2,0))+segD(hSeg(2,1))+segD(hSeg(2,2))
          +segD(vSeg(1,1))+segD(vSeg(1,2))
          +segD(vSeg(2,1))+segD(vSeg(2,2));
  var BODY=data.body;
  var ghost=document.createElement('div');
  ghost.className='wp-ghost'; ghost.id='wpGhost';
  ghost.style.left=boardLeft+'px'; ghost.style.top=boardTop+'px';
  ghost.style.width=board+'px'; ghost.style.height=board+'px';
  ghost.innerHTML=`<svg viewBox="0 0 200 200" width="${board}" height="${board}" xmlns="http://www.w3.org/2000/svg">`
    +`<defs><clipPath id="wpSilClip"><path d="${BODY}" transform="${WP_TF}"/></clipPath></defs>`
    +`<g opacity="0.5" transform="${WP_TF}">${data.sil()}</g>`
    +`<g clip-path="url(#wpSilClip)"><path d="${cuts}" fill="none" stroke="#9C7B66" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" opacity="0.85"/></g>`
    +`<path d="${BODY}" transform="${WP_TF}" fill="none" stroke="#9C7B66" stroke-width="2.5" stroke-dasharray="5 4" opacity="0.7"/>`
    +`</svg>`;
  stage.appendChild(ghost);

  var snap=Math.min(board*0.18,52);
  var pic='<div class="wp-piece-img" style="width:'+board+'px;height:'+board+'px;"><svg viewBox="0 0 200 200" width="'+board+'" height="'+board+'" xmlns="http://www.w3.org/2000/svg"><g transform="'+WP_TF+'">'+data.art()+'</g></svg></div>';

  // 흩어놓을 고정 자리 — 사과 아래 '트레이'에 겹치지 않게 펼침
  // 넓은 윗조각(idx 0)은 트레이 맨 윗줄 가운데, 나머지 6개는 3×2 격자
  // 사과는 확대 표시(약 1.28배)라 박스보다 큼 → 트레이를 충분히 아래로
  var trayTop=boardTop+board*1.40;
  var rowH=board*0.46;
  var colX=[SW*0.20, SW*0.50, SW*0.80];
  var slots=[
    {x:SW*0.50, y:trayTop},
    {x:colX[0], y:trayTop+rowH},
    {x:colX[1], y:trayTop+rowH},
    {x:colX[2], y:trayTop+rowH},
    {x:colX[0], y:trayTop+rowH*2},
    {x:colX[1], y:trayTop+rowH*2},
    {x:colX[2], y:trayTop+rowH*2}
  ];

  WP_PIECES.forEach(function(spec,idx){
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
    piece.innerHTML=pic;

    // 조각(셀) 영역의 제자리 픽셀 박스 (스테이지 기준)
    var aX0=WP_X0+c0*cw, aX1=WP_X0+(c1+1)*cw, aY0=WP_Y0+r*ch, aY1=WP_Y0+(r+1)*ch;
    var homeCenterX=boardLeft+((aX0+aX1)/2)*s, homeCenterY=boardTop+((aY0+aY1)/2)*s;
    var bx0=boardLeft+aX0*s, bx1=boardLeft+aX1*s, by0=boardTop+aY0*s, by1=boardTop+aY1*s;
    // 흩어놓기: 지정 자리로 이동
    var slot=slots[idx%slots.length];
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

function wpComplete(){
  try{gtag('event','word_puzzle_complete',{word:wpCurrent});}catch(e){}
  var data=WP_WORDS[wpCurrent];
  var stage=document.getElementById('wpStage');
  var ghost=document.getElementById('wpGhost'); if(ghost) ghost.style.opacity='0';

  var word=data.word.split('');
  // 가로 단어 — 사과 안에 크게
  var wrap=document.createElement('div');
  wrap.className='wp-word-h'; wrap.id='wpWordH';
  wrap.style.left=(wpGeo.boardLeft+wpGeo.board/2)+'px';
  wrap.style.top=(wpGeo.boardTop+wpGeo.board*0.56)+'px';
  var fs=Math.min(wpGeo.board*0.2, wpGeo.board*0.82/(word.length*0.66));
  wrap.style.fontSize=fs+'px';
  word.forEach(function(ch){
    var sp=document.createElement('span'); sp.className='wl'; sp.textContent=ch; wrap.appendChild(sp);
  });
  stage.appendChild(wrap);

  var spans=wrap.querySelectorAll('.wl');
  // 1) 글자 하나씩: A - P - P - L - E
  word.forEach(function(ch,i){
    setTimeout(function(){
      spans[i].classList.add('show');
      try{var a=safeAudio('assets/sounds/letter_'+ch.toLowerCase()+'.mp3');a.volume=0.9;a.play().catch(function(){});}catch(_){}
    },350+i*470);
  });
  // 2) 단어 한 번 크게 외치기 + 글자 반짝
  var shoutAt=350+word.length*470+300;
  setTimeout(function(){
    wrap.classList.add('shout');
    wpSayWord(data.word);
  },shoutAt);
  // 3) 외친 다음 개구리 칭찬 음성 (굿잡 등, 기존 에셋)
  setTimeout(function(){ try{playVoice(getCheer().vk);}catch(_){}; },shoutAt+1200);

  // 4) 다음 과일로 자동 진행 / 마지막이면 다시하기 버튼
  var idx=WP_ORDER.indexOf(wpCurrent);
  var isLast=idx>=WP_ORDER.length-1;
  if(!isLast){
    setTimeout(function(){
      if(!document.getElementById('wp').classList.contains('show')) return; // 도중에 나갔으면 중단
      buildPuzzle(WP_ORDER[idx+1]);
    }, shoutAt+2700);
  } else {
    var rb=document.createElement('button');
    rb.className='wp-replay'; rb.textContent='🔄';
    rb.onclick=function(){ buildPuzzle(WP_ORDER[0]); };   // 처음 과일부터 다시
    stage.appendChild(rb);
    setTimeout(function(){ rb.classList.add('show'); },shoutAt+1800);
  }
}

// 단어 음성: voice_<word>.mp3 → .wav 순으로 파일 재생, 둘 다 없으면 브라우저 TTS
function wpSayWord(w){
  var base='assets/sounds/voice_'+w.toLowerCase();
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

// 시작화면 4번째 버튼 아이콘에 사과 SVG 주입
try{document.getElementById('wordBtnIcon').innerHTML='<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'+appleArt()+'</svg>';}catch(e){}

// === 뒤로가기 버튼 처리 (TWA 안정성) ===
window.addEventListener('popstate',function(e){
  // 단어 퍼즐 화면이 열려 있으면 → 닫기만 (시작화면으로 복귀)
  var wp=document.getElementById('wp');
  if(wp&&wp.classList.contains('show')){
    wp.classList.remove('show');
    try{SND_BGM.pause();}catch(_){}
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
