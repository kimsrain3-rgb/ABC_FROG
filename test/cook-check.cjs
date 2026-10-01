/* Read-only browser smoke check for the cooking prototype. Run: node test/cook-check.cjs */
const {spawn} = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 19000 + Math.floor(Math.random() * 20000);
const profile = path.join(os.tmpdir(), 'abc-frog-cook-check-' + process.pid);
const browser = spawn(chrome, ['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'], {windowsHide:true,stdio:'ignore'});
let ws, nextId=1;
const pending = new Map();
const delay = ms => new Promise(r=>setTimeout(r,ms));
async function connect(){for(let i=0;i<50;i++){try{const list=await (await fetch('http://127.0.0.1:'+port+'/json')).json();const target=list.find(x=>x.type==='page');if(target){ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej});ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.id&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(msg.error):p.resolve(msg.result)}};return}}catch(e){}await delay(100)}throw Error('Chrome DevTools did not open')}
function call(method,params={}){return new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value}
async function snapshot(width,height,scale){await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await call('Page.navigate',{url:'file:///'+path.join(__dirname,'cook.html').replace(/\\/g,'/')});await delay(500);await evaluate(`document.documentElement.style.setProperty('--check-text-scale',${scale})`);return evaluate(`(() => {const ids=['app','speech','frogArt','lesson','work','workVisual','action','ingredients','tools','restart'];const o={viewport:[innerWidth,innerHeight],bodyScroll:[document.body.scrollWidth,document.body.scrollHeight],font:getComputedStyle(document.querySelector('.speech')).fontSize,textOverflow:{},railScroll:{}};for(const id of ids){const e=document.getElementById(id)||document.querySelector('.'+id);const r=e.getBoundingClientRect();o[id]=[+r.left.toFixed(1),+r.top.toFixed(1),+r.right.toFixed(1),+r.bottom.toFixed(1)]}for(const id of ['speech','instruction','hint']){const e=document.getElementById(id);o.textOverflow[id]=[e.scrollWidth,e.clientWidth,e.scrollHeight,e.clientHeight]}for(const id of ['ingredients','tools']){const e=document.getElementById(id);o.railScroll[id]=[e.scrollWidth,e.clientWidth]}return o})()`)}
async function run(){
  await connect();
  await call('Page.enable');
  await call('Runtime.enable');
  for(const [w,h,scale] of [[320,568,1],[320,568,1.3],[360,640,1],[390,844,1]]){
    const r=await snapshot(w,h,scale);
    console.log(w+'x'+h+' text '+scale,JSON.stringify(r));
    if(r.viewport[0]!==w||r.viewport[1]!==h)throw Error('wrong viewport');
    for(const id of ['frogArt','action','ingredients','tools','restart']){
      const b=r[id];
      if(b[0]<0||b[1]<0||b[2]>w||b[3]>h)throw Error(id+' clipped at '+w+'x'+h);
    }
    if(w===320&&scale===1.3){
      const shot=await call('Page.captureScreenshot',{format:'png'});
      const out=path.join(os.tmpdir(),'abc-frog-cook-320-text130.png');
      fs.writeFileSync(out,Buffer.from(shot.data,'base64'));
      console.log('screenshot',out);
    }
  }
  await snapshot(320,568,1.3);
  const assertText=async()=>{
    const o=await evaluate(`(() => {
      const parent=document.querySelector('.lesson').getBoundingClientRect();
      const ids=['instruction','hint'];
      return ids.map(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect();return [id,e.scrollWidth,e.clientWidth,r.bottom,parent.bottom]});
    })()`);
    for(const [id,scroll,client,bottom,limit] of o){
      if(scroll>client+1||bottom>limit-3)throw Error(id+' text clipped: '+JSON.stringify(o));
    }
  };
  const assertCue=async expected=>{
    const cues=await evaluate('Array.from(document.querySelectorAll(".cue")).map(e=>e.id||(e.dataset&&e.dataset.key)||e.className)');
    if(cues.length!==1||cues[0]!==expected)throw Error('wrong guidance cue: '+JSON.stringify(cues)+' expected '+expected);
  };
  await assertText();
  await assertCue('tomato');
  await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:270,y:430,id:1}]});
  await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:210,y:430,id:1}]});
  await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:140,y:430,id:1}]});
  await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await delay(150);
  const rolled=await evaluate('document.querySelector("#ingredients").scrollLeft');
  if(rolled<5)throw Error('ingredient rail did not roll: '+rolled);
  await evaluate('document.querySelector("#ingredients").scrollLeft=0');
  const card=await evaluate('(()=>{const r=document.querySelector("[data-key=tomato]").getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()');
  const work=await evaluate('(()=>{const r=document.querySelector("#work").getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()');
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:card[0],y:card[1]});
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:card[0],y:card[1],button:'left',clickCount:1});
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:work[0],y:work[1],button:'left',buttons:1});
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:work[0],y:work[1],button:'left',clickCount:1});
  await delay(100);
  if(await evaluate('document.querySelector("#action").disabled'))throw Error('drag did not place tomato');
  await assertCue('action');
  const tap=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(selector==='#action'?1150:120);await assertText()};
  await tap('#action');
  await assertCue('onion');
  await tap('[data-key="onion"]');
  await assertCue('peeler');
  await tap('[data-key="peeler"]');
  await assertCue('action');
  await tap('#action');
  await assertCue('carrot');
  await tap('[data-key="carrot"]');
  await assertCue('knife');
  await tap('[data-key="knife"]');
  await assertCue('action');
  await tap('#action');
  await assertCue('action');
  await tap('#action');
  await assertCue('spoon');
  await tap('[data-key="spoon"]');
  await assertCue('action');
  await tap('#action');
  await tap('#action');
  await tap('#action');
  await assertCue('surface serve-cue cue');
  await tap('#action');
  const finalCues=await evaluate('document.querySelectorAll(".cue").length');
  if(finalCues!==0)throw Error('guidance still animating after finish');
  const result=await evaluate('({step:document.querySelector("#stepLabel").textContent,speech:document.querySelector("#speech").textContent})');
  console.log('flow',result);
  if(result.step!=='SOUP COMPLETE')throw Error('flow incomplete');
  const spoken=await evaluate(`(() => {
    const synth=window.speechSynthesis;
    if(!synth)return 'TTS_UNAVAILABLE';
    let heard='';
    const original=synth.speak;
    synth.speak=function(u){heard=u.text};
    CookVoice.play('peel');
    synth.speak=original;
    return heard;
  })()`);
  if(spoken!=='Peel the onion.')throw Error('device-voice fallback failed: '+spoken);
  console.log('fallback voice',spoken);
}
run().then(()=>{ws.close();browser.kill()}).catch(e=>{console.error(e);if(ws)ws.close();browser.kill();process.exitCode=1});
