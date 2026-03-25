
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

// === 사운드 에셋 ===
const SND_FLY1=new Audio('assets/sounds/fly_buzz1.mp3');
const SND_FLY2=new Audio('assets/sounds/fly_buzz2.mp3');
const SND_FROG=new Audio('assets/sounds/frog_tongue.mp3');
const SND_BGM=new Audio('assets/sounds/bgm.mp3');
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
  where_is:new Audio('assets/sounds/voice_where_is.mp3'),
  find_for_me:new Audio('assets/sounds/voice_find_for_me.mp3'),
  i_see:new Audio('assets/sounds/voice_i_see.mp3'),
  tap:new Audio('assets/sounds/voice_tap.mp3'),
  can_you_see:new Audio('assets/sounds/voice_can_you_see.mp3'),
  help_me_find:new Audio('assets/sounds/voice_help_me_find.mp3'),
  look:new Audio('assets/sounds/voice_look.mp3'),
  over_there:new Audio('assets/sounds/voice_over_there.mp3'),
  catch_v:new Audio('assets/sounds/voice_catch_v.mp3'),
  congrats:new Audio('assets/sounds/voice_congrats.mp3'),
  you_did_it:new Audio('assets/sounds/voice_you_did_it.mp3'),
  hooray:new Audio('assets/sounds/voice_hooray.mp3'),
  tap_the_letter:new Audio('assets/sounds/voice_tap_the_letter.mp3'),
  excellent:new Audio('assets/sounds/voice_excellent.mp3'),
  good_job:new Audio('assets/sounds/voice_good_job.mp3'),
  nice:new Audio('assets/sounds/voice_nice.mp3'),
  awesome:new Audio('assets/sounds/voice_awesome.mp3'),
  great_catch:new Audio('assets/sounds/voice_great_catch.mp3'),
  youre_a_genius:new Audio('assets/sounds/voice_youre_a_genius.mp3'),
  thats_right:new Audio('assets/sounds/voice_thats_right.mp3'),
  amazing:new Audio('assets/sounds/voice_amazing.mp3'),
  well_done:new Audio('assets/sounds/voice_well_done.mp3'),
  super:new Audio('assets/sounds/voice_super.mp3'),
  fantastic:new Audio('assets/sounds/voice_fantastic.mp3'),
  you_got_it:new Audio('assets/sounds/voice_you_got_it.mp3'),
  perfect:new Audio('assets/sounds/voice_perfect.mp3'),
  brilliant:new Audio('assets/sounds/voice_brilliant.mp3'),
  way_to_go:new Audio('assets/sounds/voice_way_to_go.mp3'),
  bingo:new Audio('assets/sounds/voice_bingo.mp3'),
  yummy:new Audio('assets/sounds/voice_yummy.mp3'),
  yummy_yummy:new Audio('assets/sounds/voice_yummy_yummy.mp3'),
  i_wanna_eat:new Audio('assets/sounds/voice_i_wanna_eat.mp3'),
  give_me:new Audio('assets/sounds/voice_give_me.mp3'),
  i_need:new Audio('assets/sounds/voice_i_need.mp3'),
  find:new Audio('assets/sounds/voice_find.mp3'),
  looks_so_yummy:new Audio('assets/sounds/voice_looks_so_yummy.mp3'),
  gimme:new Audio('assets/sounds/voice_gimme.mp3'),
  bring_me:new Audio('assets/sounds/voice_bring_me.mp3'),
  please_v:new Audio('assets/sounds/voice_please_v.mp3'),
  im_so_hungry:new Audio('assets/sounds/voice_im_so_hungry.mp3'),
  im_hungry:new Audio('assets/sounds/voice_im_hungry.mp3'),
  im_so_full:new Audio('assets/sounds/voice_im_so_full.mp3'),
};
function playVoice(k,vol){var v=VOICE[k];if(!v)return;v.currentTime=0;v.volume=vol||0.8;v.play().catch(function(){});}

const SND_WOOWECK=new Audio('assets/sounds/wooweck.mp3');
const BF_VOICES=[
  new Audio('assets/sounds/butterfly_voice1.mp3'),
  new Audio('assets/sounds/butterfly_voice2.mp3')
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
  if(!letterPlayers[key]){letterPlayers[key]=new Audio(src);}
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
function ea(){if(!ax)ax=new AC();if(ax.state==='suspended')ax.resume()}
function pt(f,d,t='sine',v=.3){ea();const o=ax.createOscillator(),g=ax.createGain();o.type=t;o.frequency.setValueAtTime(f,ax.currentTime);g.gain.setValueAtTime(v,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+d);o.connect(g);g.connect(ax.destination);o.start();o.stop(ax.currentTime+d)}
function psg(){ea();const o=ax.createOscillator(),g=ax.createGain();o.type='sine';o.frequency.setValueAtTime(80,ax.currentTime);o.frequency.exponentialRampToValueAtTime(40,ax.currentTime+.3);o.frequency.exponentialRampToValueAtTime(90,ax.currentTime+.5);o.frequency.exponentialRampToValueAtTime(35,ax.currentTime+.8);g.gain.setValueAtTime(.08,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+.8);o.connect(g);g.connect(ax.destination);o.start();o.stop(ax.currentTime+.8)}
function py(){[0,100,200].forEach((d,i)=>setTimeout(()=>pt(523+i*100,.15,'sine',.25),d))}
function pk(){pt(200,.1,'sawtooth',.2);setTimeout(()=>pt(150,.15,'sawtooth',.25),100);setTimeout(()=>pt(100,.3,'sawtooth',.15),200)}
function ptg(){ea();const o=ax.createOscillator(),g=ax.createGain();o.type='sine';o.frequency.setValueAtTime(800,ax.currentTime);o.frequency.exponentialRampToValueAtTime(200,ax.currentTime+.15);g.gain.setValueAtTime(.15,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+.15);o.connect(g);g.connect(ax.destination);o.start();o.stop(ax.currentTime+.15)}
function pbr(){ea();const o=ax.createOscillator(),g=ax.createGain();o.type='sawtooth';o.frequency.setValueAtTime(120,ax.currentTime);o.frequency.exponentialRampToValueAtTime(60,ax.currentTime+.4);g.gain.setValueAtTime(.08,ax.currentTime);g.gain.exponentialRampToValueAtTime(.001,ax.currentTime+.5);o.connect(g);g.connect(ax.destination);o.start();o.stop(ax.currentTime+.5)}
function psu(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>pt(f,.2,'sine',.2),i*80))}
function sp(t,r=1.1,onStart){if('speechSynthesis'in window){const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=r;u.pitch=1.8;u.volume=1;if(onStart)u.onstart=onStart;speechSynthesis.speak(u)}}

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
    setTimeout(()=>{
      if(!animPaused && !ia) setFrame('a');
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
  bbl.textContent=t;
  bbl.classList.remove('bbl-left','bbl-right');
  
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
  // 개구리 머리 위에 배치
  const fr=document.getElementById('frog');
  if(fr){
    const frRect=fr.getBoundingClientRect();
    const gcRect=gc.getBoundingClientRect();
    const frogTop=frRect.top-gcRect.top;
    bbl.style.bottom=(gc.offsetHeight-frogTop+5)+'px';
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
sb('🐸 '+phrase.text,2500,'#2E7D32');
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
      psg();sb('🐸 '+displayTarget(),1500,'#E65100');playLetter(ct);
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
        psg();sb('🐸 '+displayTarget(),1500,'#E65100');playLetter(ct);
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
    sb('CONGRATULATIONS',4000,'#D500F9');
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
    crown.style.cssText='position:absolute;left:50%;bottom:40%;transform:translateX(-50%);font-size:15vmin;z-index:100;pointer-events:none;animation:crownBounce 0.5s ease-out;';
    crown.textContent='👑';
    gc.appendChild(crown);
    
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
  
  // 다시하기 버튼
  setTimeout(()=>{
    const btn=document.createElement('button');
    btn.textContent='PLAY AGAIN';
    btn.style.cssText='position:absolute;left:50%;bottom:15%;transform:translateX(-50%);padding:3vmin 8vmin;font-size:5vmin;font-weight:bold;color:#fff;background:linear-gradient(135deg,#FF6F00,#FF9800);border:none;border-radius:12vmin;cursor:pointer;z-index:110;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
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

function gl(){uf();requestAnimationFrame(gl)}
function go(mode){
  gameMode=mode||'ABC';
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
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
