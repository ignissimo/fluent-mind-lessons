const el=id=>document.getElementById(id),titles=chapter.titles||data.map(s=>s[1]+" · "+s[0]);
let idx=0,xp=0,done=[],badges=[],drafts={},mode='soft',autoSound=true,audioUnlocked=false,recognition=null,session=0,recordTimer=null,playerReturn=null,audioSession=0,advanceTimer=null,advancing=false,flowSession=0;
function norm(s){return String(s).toLocaleLowerCase('el').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ς/g,'σ').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim()}
// One achievement per completed chapter, including when migrating legacy saves.
function rebuild(){badges=done.length===data.length?['chapter-'+chapter.id]:[];xp=done.length*10+badges.length*20}
try{const s=JSON.parse(localStorage.getItem(chapter.key)||'{}');if(s&&typeof s==='object'){idx=Number.isInteger(s.idx)&&s.idx>=0&&s.idx<data.length?s.idx:0;done=Array.isArray(s.done)?[...new Set(s.done.filter(i=>Number.isInteger(i)&&i>=0&&i<data.length))]:[];mode=['soft','exam'].includes(s.mode)?s.mode:'soft';autoSound=s.autoSound!==false;if(s.drafts&&typeof s.drafts==='object')for(let i=0;i<data.length;i++)if(typeof s.drafts[i]==='string')drafts[i]=s.drafts[i].slice(0,300)}}catch{}rebuild();
function save(){try{localStorage.setItem(chapter.key,JSON.stringify({idx,xp,done,badges,drafts,mode,autoSound}));el('storageStatus').textContent=''}catch{el('storageStatus').textContent='Браузер не разрешил сохранение. Можно играть, но после закрытия страницы прогресс не сохранится.'}}
function micState(active){el('mic').textContent=active?'⏹ Закончить ответ':'🎙️ Ответить голосом';el('mic').setAttribute('aria-pressed',String(active))}
function stopMic(){session++;clearTimeout(recordTimer);if(recognition){const old=recognition;recognition=null;old.abort()}micState(false)}
function stopAudio(){audioSession++;const a=el('npcAudio');a.onended=null;a.onerror=null;a.pause();if('speechSynthesis'in window)speechSynthesis.cancel()}
function cancelAdvance(){flowSession++;clearTimeout(advanceTimer);advanceTimer=null;advancing=false;el('mic').disabled=false}
function stopAll(){cancelAdvance();stopMic();stopAudio()}
function render(){stopAll();const s=data[idx];['name','place'].forEach((k,i)=>el(k).textContent=s[i]);el('portrait').src=chapter.portraits[s[0]];el('portrait').alt=s[0];el('greek').textContent=s[3];el('greek').lang='el';el('ru').textContent=s[4];el('task').textContent=s[5];el('phrase').hidden=true;el('reveal').hidden=false;el('transcript').textContent='';el('feedback').textContent=done.includes(idx)?'✓ Эта сцена уже пройдена. Можно потренироваться ещё раз.':'';el('micStatus').textContent='';el('audioStatus').textContent='';el('help').classList.add('hidden');el('help').textContent='';el('mode').value=mode;applyModeUI();el('count').textContent=`Сцена ${idx+1} из ${data.length}`;el('back').disabled=idx===0;renderChoices();if(el('auto'))el('auto').checked=autoSound;renderScore();if(autoSound&&audioUnlocked)speak()}
function renderScore(){el('score').textContent=`⭐ ${xp} XP`;el('fill').style.width=100*done.length/data.length+'%';el('progress').textContent=`${done.length} из ${data.length} сцен`;el('steps').replaceChildren(...data.map((s,i)=>{const b=document.createElement('button');b.className=`step ${idx===i?'active':''} ${done.includes(i)?'done':''}`;b.textContent=`${i+1}. ${titles[i]}`;b.disabled=!(i===0||done.includes(i)||done.includes(i-1));b.setAttribute('aria-current',idx===i?'step':'false');b.onclick=()=>go(i);return b}));renderChapterProgress()}
function applyModeUI(){
  el('hintButton').hidden=mode==='exam';
  el('reveal').hidden=mode==='exam';
  el('phrase').hidden=true;
  el('greek').textContent='';
  el('ru').textContent='';
  el('help').classList.add('hidden');
  el('help').textContent='';
}
function reveal(){if(mode!=='soft')return;el('greek').textContent=data[idx][3];el('ru').textContent=data[idx][4];el('phrase').hidden=false;el('reveal').hidden=true}
function speak(){
  audioUnlocked=true;stopAll();
  const scene=idx,audioToken=audioSession,a=el('npcAudio');
  a.src=chapter.audioFiles[idx];a.playbackRate=1;
  el('audioStatus').textContent='🔊 Слушаем…';
  a.onended=()=>{if(idx===scene&&audioToken===audioSession)el('audioStatus').textContent='Теперь твоя очередь. Ответь голосом.'};
  const failure=()=>{if(idx===scene&&audioToken===audioSession)el('audioStatus').textContent='Не удалось включить аудио. Проверь интернет и громкость и нажми «Слушать» ещё раз.'};
  a.onerror=failure;try{a.play().catch(failure)}catch{failure()}
}
function hint(){if(mode!=='soft')return;const opening=el('help').classList.contains('hidden');el('help').textContent=opening?'Пример: '+data[idx][7]:'';el('help').classList.toggle('hidden')}
function isIntroduction(value){
  const match=value.match(/^(?:με λενε|(?:εγω )?ειμαι(?: η| ο)?) ([α-ω]+(?: [α-ω]+){0,2})$/u);
  const nonNames=['ειμαι','δεν','οχι','καλα','πολυ','ευχαριστω','και','εγω','εσυ','η','ο','τον','την','μια','χαρα','εδω','φιλοσ','φιλη','φιλοι'];
  return !!match&&!match[1].split(' ').some(word=>nonNames.includes(word));
}
function accepted(value){
  if(chapter.introductionAndWellbeingScenes?.includes(idx)){
    const reply=value.replace(/^(?:γεια σου|γεια) /u,'');
    const match=reply.match(/^(.+?) (?:και )?(?:ναι )?(?:εγω )?ειμαι (?:πολυ καλα|καλα|μια χαρα)(?: ευχαριστω)?$/u);
    return !!match&&isIntroduction(match[1]);
  }
  if(chapter.nameScenes.includes(idx))return isIntroduction(value);
  const alternatives=(chapter.alternatives||{})[idx]||data[idx][6];
  return alternatives.some(a=>norm(a)===value);
}
function renderChoices(){
  const choices=data[idx][8];
  el('learningSteps').textContent=choices?'1. Послушай по-гречески · 2. Скажи перевод по-русски':'1. Послушай реплику · 2. Ответь голосом по-гречески';
  el('mic').setAttribute('aria-label',choices?'Ответить голосом по-русски':'Ответить голосом по-гречески');
  el('transcript').lang=choices?'ru':'el';
  el('choices').hidden=!choices;
  el('choices').replaceChildren(...(choices||[]).map(choice=>{const item=document.createElement('span');item.className='choice';item.textContent=choice;return item}));
}
function checkVoice(raw){
  if(advancing)return;
  const text=String(raw||'').trim().slice(0,300),value=norm(text);
  el('transcript').textContent=text?'Услышано: '+text:'';
  if(!value){el('feedback').textContent='Не удалось услышать ответ. Нажми микрофон и попробуй ещё раз.';return}
  if(!accepted(value)){el('feedback').textContent=mode==='exam'?'Распознанная фраза не совпала с ответом. Проверь строку «Услышано» и попробуй ещё раз.':'Распознанная фраза не совпала с ответом. Проверь строку «Услышано», повтори или открой подсказку.';return}
  stopAll();el('feedback').textContent='✨ Верно!';complete();
  advancing=true;el('mic').disabled=true;
  const scene=idx,ticket=flowSession;
  advanceTimer=setTimeout(()=>{if(idx!==scene||ticket!==flowSession)return;advanceTimer=null;advancing=false;el('mic').disabled=false;advanceAfterAnswer()},650);
}
function showModal(title,note){stopAll();playerReturn=document.activeElement;el('award').textContent=title;el('awardNote').textContent=note;el('modal').classList.add('show');el('closeModal').focus()}
function closeModal(){el('modal').classList.remove('show');if(playerReturn?.isConnected)playerReturn.focus()}
function complete(){if(!done.includes(idx)){done.push(idx);rebuild();save()}renderScore()}
function go(i){idx=i;save();render();document.querySelector('main').scrollIntoView?.({block:'start',behavior:'instant'})}
function advanceAfterAnswer(){
  if(!done.includes(idx))return;
  if(idx<data.length-1)go(idx+1);
  else if(done.length===data.length)showModal(chapter.finalTitle,`Все ${data.length} встреч пройдены! ${xp} XP. Можно вернуться к любой сцене и потренироваться.`);
  else go(data.findIndex((scene,i)=>!done.includes(i)));
}
function back(){if(idx>0)go(idx-1)}
function resetGame(){if(!confirm('Начать главу заново и сбросить прогресс этой главы?'))return;stopAll();idx=0;done=[];drafts={};rebuild();closeModal();save();render()}
function listen(){if(advancing)return;if(recognition){recognition.stop();el('micStatus').textContent='Проверяю, что удалось услышать…';return}const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){el('micStatus').textContent='Этот браузер не поддерживает распознавание. Открой урок в браузере с поддержкой распознавания речи.';return}if(!window.isSecureContext&&location.hostname!=='localhost'){el('micStatus').textContent='Для микрофона открой опубликованную HTTPS-ссылку.';return}stopAll();audioUnlocked=true;const token=++session,scene=idx,r=new R();recognition=r;let received=false,failed=false;r.lang=data[idx][8]?'ru-RU':'el-GR';r.interimResults=false;r.continuous=false;r.maxAlternatives=5;micState(true);el('micStatus').textContent=data[idx][8]?'Разреши микрофон и скажи перевод по-русски…':'Разреши микрофон и произнеси ответ по-гречески…';const current=()=>token===session&&scene===idx;
r.onstart=()=>{if(current())el('micStatus').textContent='🎙️ Слушаю. Закончи фразу или нажми «Закончить ответ».'};
r.onresult=e=>{if(!current()||received)return;const result=e.results?.[e.resultIndex||0];const candidates=Array.from(result||[]).map(a=>String(a.transcript||'').trim().slice(0,300)).filter(Boolean);const text=candidates.find(a=>accepted(norm(a)))||candidates[0];if(!text)return;received=true;el('micStatus').textContent='';recognition=null;session++;clearTimeout(recordTimer);micState(false);r.abort();checkVoice(text)};
const errors={'not-allowed':'Доступ к микрофону запрещён. Разреши его в настройках сайта и попробуй снова.','service-not-allowed':'Сервис распознавания недоступен в этом браузере.','audio-capture':'Микрофон не найден или занят другим приложением.','no-speech':'Не услышала речь. Попробуй ещё раз, немного ближе к микрофону.','network':'Нет связи с сервисом распознавания. Проверь интернет.','language-not-supported':'Сервис не поддерживает язык ответа на этом устройстве.','aborted':'Запись остановлена.'};
r.onerror=e=>{if(!current())return;failed=true;el('micStatus').textContent=(errors[e.error]||'Не удалось распознать речь. Попробуй ещё раз.')};
r.onend=()=>{if(!current())return;recognition=null;clearTimeout(recordTimer);micState(false);if(!received&&!failed)el('micStatus').textContent='Ответ не распознан. Нажми микрофон и попробуй ещё раз.'};
try{r.start();recordTimer=setTimeout(()=>{if(current()){stopMic();el('micStatus').textContent='Время ожидания закончилось. Нажми микрофон для новой попытки.'}},25000)}catch{recognition=null;micState(false);el('micStatus').textContent='Не удалось запустить микрофон. Проверь разрешение на микрофон и попробуй снова.'}}
el('mode').addEventListener('change',()=>{stopAll();mode=el('mode').value==='exam'?'exam':'soft';el('mode').value=mode;applyModeUI();el('feedback').textContent='';el('micStatus').textContent='';el('audioStatus').textContent='';save()});document.addEventListener('keydown',e=>{if(!el('modal').classList.contains('show'))return;if(e.key==='Escape')closeModal();if(e.key==='Tab'){const a=el('modalNextChapter'),b=el('closeModal');e.preventDefault();(a.hidden?b:document.activeElement===a?b:a).focus()}});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll()});window.addEventListener('pagehide',stopAll);if(el('auto'))el('auto').addEventListener('change',()=>{autoSound=el('auto').checked;if(!autoSound)stopAudio();save()});renderChapterNav();render();save();


function renderChapterNav(){
  el('chapters').replaceChildren(...LUMA_CHAPTERS.map(c=>{const a=document.createElement('a');a.href='../'+c.slug+'/';a.dataset.chapter=c.id;a.textContent='Глава '+c.id+' · '+c.title;if(c.id===chapter.id)a.setAttribute('aria-current','page');a.addEventListener('click',stopAll);return a}));
}
function renderChapterProgress(){
  const next=LUMA_CHAPTERS[LUMA_CHAPTERS.findIndex(c=>c.id===chapter.id)+1],finished=done.length===data.length;
  for(const id of ['nextChapter','modalNextChapter']){
    const a=el(id);a.hidden=!finished||!next;
    if(next){a.href='../'+next.slug+'/';a.textContent='Глава '+next.id+' · '+next.title+' →'}
  }
  el('seriesNote').hidden=!finished||!!next;
}
