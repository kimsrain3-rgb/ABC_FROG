/*
 * Recording list for the cooking prototype. Put MP3 files in test/cook-sounds/.
 * The exact text below is the script to record. Until each file exists, the
 * browser speaks the same English line with speechSynthesis when available.
 */
const CookVoice = (() => {
  const lines = Object.freeze({
    wash:  {file:'cook_wash_tomato.mp3', text:'I want veggie soup! Wash the tomato.'},
    peel:  {file:'cook_peel_onion.mp3', text:'Peel the onion.'},
    cut:   {file:'cook_cut_carrot_twice.mp3', text:'Cut the carrot twice.'},
    stir:  {file:'cook_stir_three_times.mp3', text:'Stir the soup three times.'},
    serve: {file:'cook_serve_soup.mp3', text:'Give me the soup, please.'},
    one:   {file:'cook_one.mp3', text:'One.'},
    two:   {file:'cook_two.mp3', text:'Two.'},
    three: {file:'cook_three.mp3', text:'Three.'},
    yummy: {file:'cook_yummy.mp3', text:'Yummy! Thank you!'}
  });
  const unavailable = new Set();
  const assetBust = Date.now();
  let active = null;
  let token = 0;
  function stop(){
    token++;
    if(active){try{active.pause();active.currentTime=0}catch(e){}active=null}
    try{if('speechSynthesis' in window)window.speechSynthesis.cancel()}catch(e){}
  }
  function speak(line, id){
    if(id!==token)return;
    try{
      if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance)return;
      const utterance=new SpeechSynthesisUtterance(line);
      utterance.lang='en-US';utterance.rate=.88;utterance.pitch=1.2;
      utterance.onerror=()=>{};
      window.speechSynthesis.speak(utterance);
    }catch(e){}
  }
  function play(key){
    const line=lines[key];
    if(!line)return;
    stop();
    const id=token;
    if(unavailable.has(key)){speak(line.text,id);return}
    let fallbackUsed=false;
    function fallback(){
      if(fallbackUsed||id!==token)return;
      fallbackUsed=true;unavailable.add(key);
      speak(line.text,id);
    }
    try{
      const audio=new Audio('cook-sounds/'+line.file+'?b='+assetBust);
      active=audio;audio.preload='auto';audio.onerror=fallback;
      const result=audio.play();
      if(result&&typeof result.catch==='function')result.catch(fallback);
    }catch(e){fallback()}
  }
  return {lines,play,stop};
})();
