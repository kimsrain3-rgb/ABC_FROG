(() => {
  'use strict';
  // The installed /test/ web app may rotate even though the Android app is portrait.
  // This is best effort only; the Android app's own orientation remains unchanged.
  try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('portrait').catch(()=>{})}catch(e){}
  const $ = id => document.getElementById(id);
  const ingredients = ['tomato','onion','carrot'];
  const tools = ['peeler','knife','spoon'];
  const steps = [
    {speech:'I want veggie soup! Can you help me?', instruction:'Wash the tomato!', hint:'Drag tomato here. Tap water.', ingredient:'tomato', tool:null, action:'Turn on water', count:1, caption:'THE SINK'},
    {speech:'Lovely! Let’s get the onion ready.', instruction:'Peel the onion!', hint:'Drag onion, then peeler.', ingredient:'onion', tool:'peeler', action:'Peel once', count:1, caption:'THE CUTTING BOARD'},
    {speech:'Now I need carrot pieces.', instruction:'Cut the carrot twice!', hint:'Drag carrot and knife. Tap 2×.', ingredient:'carrot', tool:'knife', action:'Cut!', count:2, caption:'THE CUTTING BOARD'},
    {speech:'It smells so good already!', instruction:'Stir the soup 3 times!', hint:'Drag spoon here. Tap 3×.', ingredient:null, tool:'spoon', action:'Stir!', count:3, caption:'THE SOUP POT'},
    {speech:'That looks delicious. May I taste it?', instruction:'Serve the soup!', hint:'Tap the bowl to feed frog.', ingredient:null, tool:null, action:'Give soup 🥣', count:1, caption:'READY TO EAT'}
  ];
  const state = {step:0, ingredient:false, tool:false, taps:0, finished:false, busy:false};
  const labels = {tomato:'Tomato',onion:'Onion',carrot:'Carrot',peeler:'Peeler',knife:'Knife',spoon:'Spoon'};
  let drag = null;
  let notice = '';
  let timer = null;
  let transitionTimer = null;
  let suppressClick = false;
  function current(){return steps[state.step]}
  function completed(key){return (key==='tomato'&&state.step>0)||(key==='onion'&&state.step>1)||(key==='carrot'&&state.step>2)||(key==='peeler'&&state.step>1)||(key==='knife'&&state.step>2)||(key==='spoon'&&state.step>3)}
  function setNotice(message){notice=message; $('hint').textContent=message; clearTimeout(timer);timer=setTimeout(()=>{notice='';$('hint').textContent=current().hint},2200)}
  function railItem(key,type){const s=current();const target=type==='ingredient'?s.ingredient:s.tool;const chosen=type==='ingredient'?state.ingredient:state.tool;return `<button type="button" class="card ${completed(key)?'done':''} ${key===target?'target':''} ${key===target&&chosen?'chosen':''}" data-key="${key}" data-type="${type}" aria-label="${labels[key]}. Drag to cooking table"><span class="icon">${CookArt[key]()}</span><span>${labels[key]}</span></button>`}
  function renderRails(){const ing=$('ingredients'),tool=$('tools');const a=ing.scrollLeft,b=tool.scrollLeft;ing.innerHTML=ingredients.map(k=>railItem(k,'ingredient')).join('');tool.innerHTML=tools.map(k=>railItem(k,'tool')).join('');ing.scrollLeft=a;tool.scrollLeft=b;document.querySelectorAll('.card').forEach(el=>{el.addEventListener('pointerdown',startDrag);el.addEventListener('click',cardClick)})}
  function foodArt(){const s=current();if(!s.ingredient||!state.ingredient)return '';return `<div class="food ${state.step===0?'':'on-board'}">${CookArt[s.ingredient](s.ingredient==='carrot'?state.taps:state.taps>0) }</div>`}
  function toolArt(){const s=current();return s.tool&&state.tool?`<div class="tool-on-stage">${CookArt[s.tool]()}</div>`:''}
  function renderWork(){const s=current();let visual='';if(state.step===0){visual=`<div class="surface">${CookArt.sink()}</div>${foodArt()}`;if(state.taps)visual+='<span class="steam" style="left:54%;color:#4fb9d5">✦</span>'}else if(state.step<3){visual=`<div class="surface">${CookArt.board()}</div>${foodArt()}${toolArt()}`;if(state.step===1&&state.taps)visual+='<span class="steam" style="left:57%;color:#d0a4d2">✦</span>'}else if(state.step===3){visual=`<div class="surface">${CookArt.pot()}</div>${toolArt()}<span class="steam">〰</span>`}else{visual=`<div class="surface">${CookArt.bowl()}</div>`;if(state.finished)visual+='<span class="steam" style="left:58%">♥</span>'}
    visual+=`<div class="hand" id="hand">${CookArt.hand()}</div>`;$('workVisual').innerHTML=visual;
    $('workCaption').textContent=s.caption;
    const ready=(s.ingredient===null||state.ingredient)&&(s.tool===null||state.tool);
    const action=$('action');action.disabled=!ready||state.busy||state.finished;action.textContent=state.finished?'Yummy! ♥':ready?s.action:(s.ingredient&&!state.ingredient?'Bring '+labels[s.ingredient]:'Bring '+labels[s.tool]);
    $('count').innerHTML=s.count>1?`${Array.from({length:s.count},(_,i)=>`<span class="count-mark ${i<state.taps?'hit':''}">${i+1}</span>`).join('')}`:(state.taps?'<span class="count-mark hit">✓</span>':'');
  }
  function render(){const s=current();$('frogArt').innerHTML=CookArt.frog(state.finished);$('speech').textContent=state.finished?'Yummy! You made it for me!':s.speech;$('stepLabel').textContent=state.finished?'SOUP COMPLETE':`STEP ${state.step+1} OF ${steps.length}`;$('stepDots').innerHTML=steps.map((_,i)=>`<i class="dot ${i<state.step||state.finished?'done':i===state.step?'now':''}"></i>`).join('');$('instruction').textContent=state.finished?'A bowl made with love!':s.instruction;$('hint').textContent=notice||s.hint;renderRails();renderWork()}
  function place(type,key){if(state.busy||state.finished)return;const s=current();const wanted=type==='ingredient'?s.ingredient:s.tool;if(!wanted){setNotice(type==='ingredient'?'The vegetables are ready.':'No tool needed yet.');return}if(key!==wanted){setNotice(`Try the ${labels[wanted].toLowerCase()}!`);return}if(type==='ingredient')state.ingredient=true;else state.tool=true;notice='';render();setNotice(type==='ingredient'?`${labels[key]} is on the table!`:`${labels[key]} is ready!`)}
  function cardClick(ev){if(suppressClick){suppressClick=false;return}if(drag&&drag.moved)return;const el=ev.currentTarget;place(el.dataset.type,el.dataset.key)}
  function startDrag(ev){if(ev.button!==0&&ev.pointerType==='mouse')return;const el=ev.currentTarget;drag={id:ev.pointerId,key:el.dataset.key,type:el.dataset.type,x:ev.clientX,y:ev.clientY,moved:false,vertical:false};el.setPointerCapture(ev.pointerId);el.addEventListener('pointermove',moveDrag);el.addEventListener('pointerup',endDrag,{once:true});el.addEventListener('pointercancel',cancelDrag,{once:true})}
  function moveDrag(ev){if(!drag||drag.id!==ev.pointerId)return;const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)>8){drag.moved=true;drag.vertical=Math.abs(dy)>Math.abs(dx)}if(!drag.vertical)return;const ghost=$('dragGhost');ghost.innerHTML=CookArt[drag.key]();ghost.style.display='block';ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';const r=$('work').getBoundingClientRect();$('work').classList.toggle('drop-ready',ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom)}
  function endDrag(ev){if(!drag||drag.id!==ev.pointerId)return;const d=drag;cleanupDrag();if(d.moved&&d.vertical){suppressClick=true;setTimeout(()=>{suppressClick=false},0);ev.preventDefault();ev.stopPropagation();const r=$('work').getBoundingClientRect();if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom)place(d.type,d.key);else setNotice('Drop it on the cooking table.')}}
  function cancelDrag(){cleanupDrag()}
  function cleanupDrag(){drag=null;$('dragGhost').style.display='none';$('work').classList.remove('drop-ready')}
  function act(){const s=current();if(state.busy||state.finished||s.ingredient&&!state.ingredient||s.tool&&!state.tool)return;state.taps++;const hand=$('hand');if(hand){hand.classList.remove('animate');void hand.offsetWidth;hand.classList.add('animate')}renderWork();if(state.taps<s.count)return;state.busy=true;renderWork();if(state.step===steps.length-1){transitionTimer=setTimeout(()=>{state.finished=true;state.busy=false;render()},480)}else{transitionTimer=setTimeout(()=>{state.step++;state.ingredient=false;state.tool=false;state.taps=0;state.busy=false;notice='';render()},650)}}
  function restart(){clearTimeout(timer);clearTimeout(transitionTimer);state.step=0;state.ingredient=false;state.tool=false;state.taps=0;state.finished=false;state.busy=false;notice='';render()}
  $('action').addEventListener('click',act);$('restart').addEventListener('click',restart);render();
})();
