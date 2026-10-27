const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs');
function game(name){
 const errors=[],timers=[],spoken=[],paintOps=[];
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(fs.readFileSync(`${name}/index.html`,'utf8'),{runScripts:'dangerously',url:`https://example.test/${name}/`,virtualConsole:vc,beforeParse(w){
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 if(name==='brawl-lab'){w.HTMLCanvasElement.prototype.getContext=function(){return Object.fromEntries(['fillRect','beginPath','moveTo','lineTo','stroke','arc','fill','drawImage'].map(k=>[k,(...args)=>paintOps.push({type:k,args})]))};w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/png;base64,TEST';w.HTMLCanvasElement.prototype.toBlob=fn=>fn(new w.Blob(['PNG'],{type:'image/png'}));w.URL.createObjectURL=()=> 'blob:png';w.URL.revokeObjectURL=()=>{};w.HTMLCanvasElement.prototype.setPointerCapture=()=>{};}
 w.setTimeout=fn=>(timers.push(fn),timers.length);
 w.speechSynthesis={cancel(){},getVoices(){return[]},speak(u){spoken.push(u.text)}};
 w.SpeechSynthesisUtterance=function(t){this.text=t};
 if(name==='server-404'||name==='karni-english-academy')w.Audio=function(src){const el=w.document.createElement('audio');el.pause=()=>{};el.play=()=>{spoken.push(src);return Promise.resolve()};return el};
 }});
 const w=dom.window,d=w.document;
 const click=t=>{const b=[...d.querySelectorAll('button')].find(b=>b.textContent.trim()===t&&!b.disabled);assert.ok(b,`button ${t}`);assert.equal(b.disabled,false,`enabled: ${t}`);b.click();};
 return {w,d,click,spoken,paintOps,flush(){while(timers.length)timers.shift()()},clean(){assert.deepEqual(errors.map(e=>e.message),[]);w.close()}};
}
test('Crack the Code: all helpers and sentence tiles work',()=>{
 const g=game('crack-the-code');
 for(let level=0;level<6;level++){
  g.w.start(level);
  const total=[8,6,6,8,5,4][level];
  for(let i=0;i<total;i++){
   const before=g.spoken.length;g.click('🔊 Sound helper');assert.equal(g.spoken.length,before+1,`helper level ${level+1} task ${i+1}`);
   if(level===4){for(const word of ['The fish is big.','This is a cat.','The dog is in the van.','Ben has a red bag.','The pig can run.'][i].split(' '))g.click(word);g.click('Check sentence');g.flush();}
   else g.click('Skip →');
  }
  assert.match(g.d.body.textContent,/Level complete!/);
 }
 g.clean();
});
test('Percy: every mythology and vocabulary answer unlocks the next stage',()=>{
 const g=game('percy-half-blood-escape');
 for(const t of ['the Furies, goddesses of revenge','a person’s life','a satyr','the Minotaur'])g.click(t);
 assert.equal(g.d.querySelector('#mythNext').disabled,false);
 for(const t of ['keeps tabs on him','on their trail','swerves','makes his skin crawl','holds his ground','with all his might'])g.click(t);
 assert.equal(g.d.querySelector('#vocabNext').disabled,false);
 assert.equal(g.d.querySelector('#score').textContent,'10 / 20');g.clean();
});
test('English Challenge: eight radio answers, result, and reset',()=>{
 const g=game('english-challenge');
 [1,2,0,2,1,0,0,2].forEach((a,i)=>{const r=g.d.querySelector(`input[name=q${i}][value="${a}"]`);r.checked=true;r.dispatchEvent(new g.w.Event('change'));});
 g.click('Check answers');assert.match(g.d.querySelector('#result').textContent,/8 \/ 8/);g.click('Try again');assert.equal(g.d.querySelectorAll(':checked').length,0);g.clean();
});
test('Preposition Trap: all 15 answers and replay',()=>{
 const g=game('preposition-trap');
 [2,1,0,2,0,1,2,0,2,1,2,1,1,0,2].forEach((a,i)=>{g.d.querySelectorAll('#choices button')[a].click();assert.equal(g.d.querySelector('#next').disabled,false);g.d.querySelector('#next').click();});
 assert.match(g.d.querySelector('#summary').textContent,/15 out of 15/);g.d.querySelector('#retry').click();assert.match(g.d.querySelector('#counter').textContent,/1 \/ 15/);g.clean();
});
test('Chameleon: all five choices and explanations reach report',()=>{
 const g=game('chameleon');g.d.querySelector('#start').click();
 for(let i=0;i<5;i++){g.d.querySelector('#choices button').click();const r=g.d.querySelector('#reason');r.value='I chose this because it helps me survive.';r.dispatchEvent(new g.w.Event('input'));assert.equal(g.d.querySelector('#next').disabled,false);g.d.querySelector('#next').click();}
 assert.equal(g.d.querySelector('#finish').classList.contains('hidden'),false);assert.equal(g.d.querySelectorAll('#log p').length,5);g.clean();
});
test('Kyoshi: all 19 tasks, normal and slow speech, dialogue and advice',()=>{
 const g=game('kyoshi-island');
 for(const name of ['Aang','Katara','Sokka','Suki','His role as the Avatar','More practice','To protect the island','Information','More information','Sokka','Protect their island','Together','Ask for help','Listen carefully']){
  g.click('▶ Listen');g.click('▶ Slowly');g.click(name);g.click('I said it ✓');
  const next=[...g.d.querySelectorAll('[data-next]')][0];assert.ok(next);next.click();
 }
 for(const lines of [['What are you looking for?','Information about the Avatar.','Can I help you?','Yes, please. Let’s look together.'],['Can you teach me?','What do you want to learn?','I want to learn how to protect myself.','All right. Watch carefully.']]){
  for(const t of lines)g.click(t);assert.ok(g.d.querySelector('[data-next]'));g.d.querySelector('[data-next]').click();
 }
 for(const name of ['Ask for help','Practise every day','Ask the speaker to repeat it']){g.click(name);g.click('I said my advice ✓');g.d.querySelector('[data-next]').click();}
 assert.match(g.d.body.textContent,/19 \/ 19 tasks/);assert.match(g.d.body.textContent,/Your voice matters/);assert.ok(g.spoken.length>=28);g.clean();
});
test('Droid Mission: all word-building tasks and saved writing',()=>{
 const g=game('star-wars-droid-mission');g.w.eval('page=3;render()');
 for(const words of [['R2-D2','has','a','secret','mission.'],['The','droids','go','in','different','directions.'],['C-3PO','does','not','understand','the','plan.']]){
  for(const word of words)g.click(word);g.click('Check order');assert.match(g.d.querySelector('#buildFeedback').textContent,/Correct/);g.click('Another sentence →');
 }
 g.w.eval('page=2;render()');const field=g.d.querySelector('textarea');field.value='They land on Tatooine.';field.dispatchEvent(new g.w.Event('input'));g.w.eval('page=1;render();page=2;render()');assert.equal(g.d.querySelector('textarea').value,'They land on Tatooine.');g.clean();
});
test('Owl House: all three branches and four sentence puzzles',()=>{
 for(const branch of ['king','eda','luz']){
 const g=game('owl-house');g.w.move(1);g.w.choose(branch);g.w.move(1);g.w.move(1);g.w.move(1);
 for(let i=0;i<4;i++){
  const words=g.w.eval(`sentences[${i}].split(' ')`);
  for(const word of words){const b=[...g.d.querySelectorAll(`#bank${i} button`)].find(b=>!b.disabled&&b.textContent===word);assert.ok(b,word);b.click();}
  g.w.check(i);assert.match(g.d.querySelector(`#feed${i}`).textContent,/Perfect/);
 }
 g.clean();}
});
test('Lev Island: map, mistakes, bag, word machine, and treasures',()=>{
 const g=game('lev-island');g.click('🐉Dragon Island');g.w.go(1);
 for(const cell of [12,11,13,17,17,16,22,0])g.d.querySelector(`[data-cell="${cell}"]`).click();assert.match(g.d.body.textContent,/Your map is ready/);
 g.w.go(2);for(const a of [0,1,2,0,1,1]){g.d.querySelector(`[data-answer="${a}"]`).click();g.click('Next mistake →');}assert.match(g.d.body.textContent,/You rescued the map/);
 g.w.go(3);for(const b of [...g.d.querySelectorAll('[data-item]')].slice(0,4)){g.d.querySelector(`[data-item="${b.dataset.item}"]`).click();}g.click('🔊 Read my bag');assert.equal(g.spoken.length,1);
 g.w.go(4);for(let i=0;i<8;i++){let b;while(b=g.d.querySelector('[data-part]:not(:disabled)')){const choices=[...g.d.querySelectorAll('[data-part]:not(:disabled)')];choices.sort((a,b)=>+a.dataset.part-+b.dataset.part);choices[0].click();}g.click('🔊 Hear the word');g.d.querySelector('#wordnext').click();}
 g.w.go(6);for(const cell of [22,13,11]){g.d.querySelector(`[data-cell="${cell}"]`).click();assert.match(g.d.body.textContent,/Found at/);g.d.querySelector('[data-reward]').click();g.d.querySelector('#treasurenext').click();}g.clean();
});
test('Percy: wrong answers also allow completion; replay resets all gates',()=>{
 const g=game('percy-half-blood-escape');
 for(const q of g.d.querySelectorAll('#myths .question'))q.querySelector('button').click();
 for(const q of g.d.querySelectorAll('#vocab .question'))q.querySelector('button').click();
 assert.equal(g.d.querySelector('#mythNext').disabled,false);assert.equal(g.d.querySelector('#vocabNext').disabled,false);
 g.w.restart();
 for(const id of ['timelineNext','mythNext','vocabNext','battleNext'])assert.equal(g.d.getElementById(id).disabled,true,`${id} locked on replay`);
 g.clean();
});
test('Crack the Code: fast repeated answers advance only once',()=>{
 const g=game('crack-the-code');g.w.start(0);g.click('A');g.click('A');g.flush();
 assert.match(g.d.body.textContent,/Task 2 of 8/);assert.equal(g.d.querySelector('#score').textContent.includes('15 XP'),true);g.clean();
});
test('Crack the Code: every level can be completed by answering',()=>{
 const g=game('crack-the-code');
 const answers=[['A','I','SH','CH','F','V','TH','TH'],['ship','chip','fish','van','this','thin'],['WRONG','RIGHT','WRONG','RIGHT','WRONG','RIGHT'],['🤫 OFF','🐝 ON','🤫 OFF','🐝 ON','🤫 OFF','🐝 ON','🤫 OFF','🐝 ON'],[],['✓ I read it!','✓ I read it!','✓ I read it!','✓ I read it!']];
 for(const level of [0,1,2,3,5]){g.w.start(level);for(const a of answers[level]){if(level===1){g.d.querySelector('#write').value=a;g.click('Check')}else g.click(a);g.flush();}assert.match(g.d.querySelector('#screen').textContent,/Level complete!/);}
 g.clean();
});
test('Crack the Code: leaving a solved task cancels its delayed advance',()=>{
 const g=game('crack-the-code');g.w.start(0);g.click('A');g.click('← Missions');g.flush();assert.match(g.d.querySelector('#screen').textContent,/Mission Control/);g.clean();
});
test('Percy: complete escape and report, then play again',()=>{
 const g=game('percy-half-blood-escape');g.w.go(1);
 for(const i of [2,0,3,1])g.d.querySelectorAll('#timeline button')[i].click();g.click('Open the next file');
 for(const t of ['the Furies, goddesses of revenge','a person’s life','a satyr','the Minotaur'])g.click(t);g.click('Follow Grover');
 for(const t of ['keeps tabs on him','on their trail','swerves','makes his skin crawl','holds his ground','with all his might'])g.click(t);g.d.querySelector('#vocabNext').click();
 for(const a of [1,0,0,1]){g.d.querySelectorAll('#battle button')[a].click();g.flush();}g.d.querySelector('#battleNext').click();
 g.d.querySelector('#report').value='Percy held his ground, jumped sideways and pulled the horn.';g.w.finish();assert.equal(g.d.querySelector('#finalScore').textContent,'20 / 20');g.w.restart();assert.equal(g.d.querySelector('#mythNext').disabled,true);assert.match(g.d.querySelector('#report').value,/Percy held/);g.clean();
});
test('Azeroth: both modes complete all 24 choices, preserve answers, and reset',()=>{
 for(const mode of ['surprise','decide']){
 const g=game('who-are-you-in-azeroth');g.d.querySelector(`[data-mode="${mode}"]`).click();
 if(mode==='decide'){
  for(const name of [...g.d.querySelectorAll('[data-exclude]')].map(n=>n.dataset.exclude)){const input=[...g.d.querySelectorAll('[data-exclude]')].find(n=>n.dataset.exclude===name);input.checked=true;input.dispatchEvent(new g.w.Event('change',{bubbles:true}));}
  assert.equal(g.d.querySelector('[data-action="start"]').disabled,true);
  const input=g.d.querySelector('[data-exclude]');input.checked=false;input.dispatchEvent(new g.w.Event('change',{bubbles:true}));
 }
 g.d.querySelector('[data-action="start"]').click();
 for(let i=0;i<24;i++){
  assert.equal(g.d.querySelector('[data-action="next"]').disabled,true);
  g.d.querySelector(`[data-choice="${i%4}"]`).click();assert.ok(g.d.querySelector('.opt.selected'));
  g.d.querySelector('[data-action="next"]').click();
 }
 assert.match(g.d.querySelector('#app').textContent,/YOUR CHARACTER REVEALED/);
 assert.equal(JSON.parse(g.w.localStorage.getItem('fma-azeroth-v22')).answers.length,24);
 g.d.querySelector('[data-action="reset"]').click();assert.ok(g.d.querySelector('[data-action="start"]'));g.clean();
 }
});
test('Azeroth: long mode titles are not constrained to answer-letter circles',()=>{
 const g=game('who-are-you-in-azeroth');
 for(const b of g.d.querySelectorAll('[data-mode] b'))assert.notEqual(g.w.getComputedStyle(b).width,'30px',b.textContent);
 for(const b of g.d.querySelectorAll('[data-mode]'))assert.equal(g.w.getComputedStyle(b).display,'block');
 g.d.querySelector('[data-action="start"]').click();
 assert.equal(g.d.querySelector('[data-choice] b'),null);g.clean();
});
test('Azeroth: every answer has its own illustrated panel and accessible selection',()=>{
 const g=game('who-are-you-in-azeroth');g.d.querySelector('[data-action="start"]').click();const pictures=new Set();
 for(let i=0;i<24;i++){
  const options=[...g.d.querySelectorAll('[data-choice]')];assert.equal(options.length,4);
  for(const b of options){const art=b.querySelector('.answer-art');assert.ok(art,`question ${i+1}`);assert.equal(art.getAttribute('aria-hidden'),'true');const svg=art.querySelector('svg'),image=art.querySelector('image');assert.ok(svg);assert.ok(image);assert.equal(svg.getAttribute('preserveAspectRatio'),'xMidYMid slice');pictures.add(image.getAttribute('href')+'|'+svg.getAttribute('viewBox'));assert.ok(b.querySelector('.answer-copy').textContent.trim());}
  options[i%4].click();assert.equal(g.d.querySelector(`[data-choice="${i%4}"]`).getAttribute('aria-pressed'),'true');g.d.querySelector('[data-action="next"]').click();
 }
 assert.equal(pictures.size,96);
 assert.ok(g.d.querySelector('.race-portrait[role="img"]'));assert.ok(g.d.querySelector('.class-emblem[role="img"]'));g.clean();
});
test('Azeroth: result export includes race and class art and a reusable download link',async()=>{
 const g=game('who-are-you-in-azeroth');g.w.eval('answers=Array(24).fill(0);step=24;render()');
 const draws=[];g.w.Image=class{constructor(){this.width=1536;this.height=1024}set src(v){this.path=v;queueMicrotask(()=>this.onload())}};
 const context=new Proxy({drawImage(...args){draws.push(args)},measureText(t){return{width:t.length*12}},createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});
 g.w.HTMLCanvasElement.prototype.getContext=()=>context;g.w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/png;base64,dGVzdA==';g.w.HTMLAnchorElement.prototype.click=()=>{};
 await g.w.saveResultCard();assert.equal(draws.length,2);assert.match(draws[0][0].path,/races.jpg$/);assert.match(draws[1][0].path,/classes.jpg$/);
 const link=g.d.querySelector('#feedback a[download]');assert.ok(link);assert.equal(link.download,'fluent-mind-azeroth-result.png');g.clean();
});
test('Azeroth: all published illustration files exist as JPEGs',()=>{
 const path=require('node:path');const base=path.join('who-are-you-in-azeroth','assets');
 for(const name of ['hero.jpg','races.jpg','classes.jpg','choices-01-04.jpg','choices-05-08.jpg','choices-09-12.jpg','choices-13-16.jpg','choices-17-20.jpg','choices-21-24.jpg']){
  const bytes=fs.readFileSync(path.join(base,name));assert.ok(bytes.length>10000,name);assert.equal(bytes.readUInt16BE(0),0xffd8,name);
 }
});

test('Azeroth: class follows best score and exclusions preserve the remaining ranking',()=>{
 const g=game('who-are-you-in-azeroth');
 const report=g.w.eval(`(()=>{let state=71231,draw=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};for(let k=0;k<1000;k++){answers=Array.from({length:24},()=>Math.floor(draw()*4));excluded=new Set();mode='surprise';let first=compute();let scores=D.classes.map((c,j)=>(answers.reduce((s,a,i)=>s+D.cw[i][a][j],0)-D.cm[j])/D.cs[j]/1.2+D.cb[j]);if(Math.max(...scores)-scores[D.classes.indexOf(first.cls)]>1e-9)return 'Class is not the best match';mode='decide';if(JSON.stringify(compute())!==JSON.stringify(first))return 'Mode changes result without exclusions';excluded=new Set(D.classes.filter(c=>c!==first.cls));if(compute().cls!==first.cls)return 'Exclusions remove the winner';excluded=new Set([D.classes.find(c=>c!==first.cls)]);if(JSON.stringify(compute())!==JSON.stringify(first))return 'Excluding another class changes the winner';excluded=new Set([first.cls]);let second=compute();if(second.cls===first.cls)return 'Excluded class returned';let remaining=scores.filter((s,j)=>D.classes[j]!==first.cls);if(Math.max(...remaining)-scores[D.classes.indexOf(second.cls)]>1e-9)return 'Fallback is not the next best match'}return 'ok'})()`);
 assert.equal(report,'ok');g.clean();
});

test('Avatar Day: all sections, answers, writing, export and reset work',async()=>{
 const g=game('avatar-day');let downloads=[];g.w.URL.createObjectURL=b=>(downloads.push(b),'blob:test');g.w.URL.revokeObjectURL=()=>{};g.w.HTMLAnchorElement.prototype.click=function(){assert.equal(this.download,'avatar_day_answers.txt')};g.w.confirm=()=>true;
 const correct=[[0,2],[1,0],[2],[1,2],[],[1]];
 for(let i=0;i<6;i++){
  g.d.querySelectorAll('#nav button')[i].click();
  assert.ok(g.d.querySelector('#page img').getAttribute('src').startsWith('assets/'));
  for(let j=0;j<correct[i].length;j++){
   let cards=[...g.d.querySelectorAll('.card')].filter(c=>c.querySelector('.choice'));
   cards[j].querySelectorAll('.choice')[(correct[i][j]+1)%4].click();
   cards=[...g.d.querySelectorAll('.card')].filter(c=>c.querySelector('.choice'));
   assert.match(cards[j].textContent,/Not quite/);
   cards[j].querySelectorAll('.choice')[correct[i][j]].click();
  }
  const area=g.d.querySelector('textarea');if(area){area.value='My evidence </textarea><img src=x onerror=alert(1)> & conclusion';area.dispatchEvent(new g.w.Event('input',{bubbles:true}));g.w.render();assert.equal(g.d.querySelector('textarea').value,area.value);assert.equal(g.d.querySelector('img[src="x"]'),null)}
 }
 assert.equal(Object.keys(JSON.parse(g.w.localStorage.getItem('avatar_day_answers'))).length,13);
 g.click('⬇ Save my written answers (.txt)');assert.equal(downloads.length,1);const exported=await new Promise(resolve=>{const reader=new g.w.FileReader();reader.onload=()=>resolve(reader.result);reader.readAsText(downloads[0])});assert.match(exported,/My final verdict:/);assert.match(exported,/Case: Why are the villagers angry\?: Option A/);g.click('Reset');assert.equal(g.w.localStorage.getItem('avatar_day_answers'),null);assert.equal(g.d.querySelector('textarea').value,'');g.clean();
});

test('Avatar Day: corrupt or unavailable storage does not block the lesson',()=>{
 const html=fs.readFileSync('avatar-day/index.html','utf8');
 for(const blocked of [false,true]){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};if(blocked){Object.defineProperty(w,'localStorage',{get(){throw Error('Storage blocked')}})}else w.localStorage.setItem('avatar_day_answers','{broken')}});
  assert.equal(dom.window.document.querySelectorAll('#nav button').length,6);dom.window.document.querySelector('.choice').click();assert.ok(dom.window.document.querySelector('.selected'));assert.deepEqual(errors,[]);dom.window.close();
 }
});

test('Eclipse Lake: all three routes, grammar, writing, export, print and restoration',async()=>{
 for(const character of ['Amity','Hunter','Eda']){
 const g=game('eclipse-lake');g.click('Continue →');let t=g.d.querySelector('textarea');t.value='Literal &lt; and </textarea><img src=x> evidence';t.dispatchEvent(new g.w.Event('input',{bubbles:true}));g.click('Continue →');g.click(({Amity:'💜',Hunter:'🗝️',Eda:'🦉'})[character]+' '+character);g.click('Continue →');assert.match(g.d.querySelector('h2').textContent,new RegExp(character));assert.match(g.d.querySelector('img').src,new RegExp(character.toLowerCase()+'.jpg'));
 for(const [i,t] of [...g.d.querySelectorAll('textarea')].entries()){t.value=character+' response '+i;t.dispatchEvent(new g.w.Event('input',{bubbles:true}))}
 g.click('← Back');g.click('← Back');assert.equal(g.d.querySelector('textarea').value,'Literal &lt; and </textarea><img src=x> evidence');assert.equal(g.d.querySelector('img[src=x]'),null);g.click('Continue →');g.click('Continue →');g.click('Continue →');
 for(const [i,value] of ['wants','of','travel','meets'].entries()){g.d.querySelectorAll('.question')[i].querySelectorAll('button').forEach(b=>{if(b.textContent!==value)b.click()});g.click(value)}assert.equal([...g.d.querySelectorAll('.feedback')].filter(e=>e.textContent==='✓ Correct!').length,4);
 t=g.d.querySelector('textarea');t.value='Amity wants to help Luz, but she is afraid.';t.dispatchEvent(new g.w.Event('input',{bubbles:true}));g.click('Continue →');t=g.d.querySelector('textarea');t.value='My magical object can help.';t.dispatchEvent(new g.w.Event('input',{bubbles:true}));
 let blob;g.w.URL.createObjectURL=b=>(blob=b,'blob:test');g.w.URL.revokeObjectURL=()=>{};g.w.HTMLAnchorElement.prototype.click=function(){assert.equal(this.download,'Eclipse_Lake_Writing.txt')};g.click('⬇ Save my writing (.txt)');const text=await new Promise(resolve=>{let r=new g.w.FileReader();r.onload=()=>resolve(r.result);r.readAsText(blob)});assert.match(text,new RegExp(character));assert.match(text,/My magical object can help/);
 let printed=false;g.w.print=()=>printed=true;g.click('🖨 Print');assert.equal(printed,true);assert.match(g.d.querySelector('#print-report').textContent,/response 0/);
 const answers=g.w.localStorage.getItem('eclipse_answers'),progress=g.w.localStorage.getItem('eclipse_progress');assert.ok(progress);g.clean();const restored=new JSDOM(fs.readFileSync('eclipse-lake/index.html','utf8'),{runScripts:'dangerously',url:'https://example.test',beforeParse(w){w.localStorage.setItem('eclipse_answers',answers);w.localStorage.setItem('eclipse_progress',progress)}});assert.match(restored.window.document.querySelector('h2').textContent,/Creative Finale/);assert.match(restored.window.document.querySelector('#app').textContent,new RegExp(character));restored.window.close();
 }
});
test('Eclipse Lake: invalid and unavailable storage remain usable',()=>{
 for(const data of ['null','[]','{broken','{"warm":42}']){const g=new JSDOM(fs.readFileSync('eclipse-lake/index.html','utf8'),{runScripts:'dangerously',url:'https://example.test',beforeParse(w){w.scrollTo=()=>{};w.localStorage.setItem('eclipse_answers',data)}});g.window.go(1);assert.ok(g.window.document.querySelector('textarea'));g.window.close()}
 const g=new JSDOM(fs.readFileSync('eclipse-lake/index.html','utf8'),{runScripts:'dangerously',url:'https://example.test',beforeParse(w){w.scrollTo=()=>{};Object.defineProperty(w,'localStorage',{get(){throw Error('Blocked')}})}});g.window.go(1);let t=g.window.document.querySelector('textarea');t.value='Answer';t.dispatchEvent(new g.window.Event('input',{bubbles:true}));assert.equal(g.window.document.querySelector('#storage-note').hidden,false);g.window.close();
});

test('Server 404: full investigation, speech helpers, word puzzles and replay awards',()=>{
 const g=game('server-404');g.click('🔊 Listen to briefing');assert.equal(g.spoken.length,1);g.click('Start investigation');
 const levels=[['The server crashed.','At midnight.','Inside an online game.'],['What could you do?','When was everything fine?','How did you react?'],['FACT','THEORY','FACT','THEORY']];
 for(let level=0;level<3;level++){for(const answer of levels[level]){const count=g.spoken.length;g.click('🔊 Listen');assert.equal(g.spoken.length,count+1);g.click('💡 Hint');assert.ok(g.d.querySelector('#feedback').textContent);const wrong=[...g.d.querySelectorAll('#game button')].find(b=>!['🔊 Listen','💡 Hint',answer].includes(b.textContent));wrong.click();assert.match(g.d.querySelector('#feedback').textContent,/Try/);g.click(answer)}g.click('Next level →')}
 for(const words of [['Where','were','the','players','?'],['What','happened','at','midnight','?'],['When','did','the','server','crash','?'],['How','did','the','developers','react','?']]){g.click('Unlock');assert.match(g.d.querySelector('#feedback').textContent,/order/);for(const word of words)g.click(word);g.click('Unlock')}
 g.click('Next level →');g.click('Submit report');assert.match(g.d.querySelector('#feedback').textContent,/Choose/);const input=g.d.querySelector('input');input.checked=true;input.dispatchEvent(new g.w.Event('change',{bubbles:true}));const area=g.d.querySelector('textarea');area.value='I think <img src=x> & evidence matters.';area.dispatchEvent(new g.w.Event('input',{bubbles:true}));g.click('Submit report');assert.match(g.d.querySelector('#game').textContent,/MISSION COMPLETE/);assert.equal(g.d.querySelector('img[src=x]'),null);let saved=JSON.parse(g.w.localStorage.getItem('server404-game'));assert.equal(saved.xp,500);assert.equal(saved.badges.length,5);g.w.finish();assert.equal(JSON.parse(g.w.localStorage.getItem('server404-game')).xp,500);g.click('Replay');g.w.go(5);g.d.querySelector('input').checked=true;g.d.querySelector('#reason').value='Another valid explanation.';g.click('Submit report');assert.equal(JSON.parse(g.w.localStorage.getItem('server404-game')).xp,500);g.clean();
});
test('Server 404: sentence selection and final draft survive reload; bad storage is safe',()=>{
 const html=fs.readFileSync('server-404/index.html','utf8');
 for(const saved of ['{broken','null','[]','{"level":4,"xp":0,"badges":[],"step":1,"chosen":[0,1]}','{"level":5,"xp":0,"badges":[],"draftTheory":"A hacker attacked.","draftReason":"My saved reason."}']){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){w.localStorage.setItem('server404-game',saved)}});assert.ok(d.window.document.querySelector('#game button'));if(saved.includes('"level":4')){assert.match(d.window.document.querySelector('#game').textContent,/What happened/);assert.match(d.window.document.querySelector('small').textContent,/FLUENT/)}if(saved.includes('"level":5'))assert.equal(d.window.document.querySelector('textarea').value,'My saved reason.');assert.deepEqual(errors,[]);d.window.close();
 }
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){Object.defineProperty(w,'localStorage',{get(){throw Error('Blocked')}})}});d.window.go(5);const t=d.window.document.querySelector('textarea');t.value='A reason';t.dispatchEvent(new d.window.Event('input',{bubbles:true}));assert.deepEqual(errors,[]);assert.equal(d.window.document.querySelector('#storage-note').hidden,false);d.window.close();
});

test('Server 404: stale answers cannot skip tasks and reset clears progress',()=>{const g=game('server-404');g.click('Start investigation');const first=[...g.d.querySelectorAll('button')].find(b=>b.textContent==='The server crashed.');first.click();first.click();assert.match(g.d.querySelector('h3').textContent,/When/);g.w.confirm=()=>true;g.w.go(6);g.click('Reset progress');assert.match(g.d.querySelector('h2').textContent,/server crashed/);assert.equal(JSON.parse(g.w.localStorage.getItem('server404-game')).xp,0);g.clean()});

test('Server 404: all sound helpers have local audio and speech is a fallback',async()=>{const g=game('server-404');const paths=g.w.eval('Object.values(audioFiles)');assert.equal(paths.length,13);for(const p of paths)assert.ok(fs.statSync('server-404/'+p).size>1000);g.w.Audio=function(){const el=g.d.createElement('audio');el.pause=()=>{};el.play=()=>Promise.reject(Error('No media'));return el};g.click('🔊 Listen to briefing');await new Promise(resolve=>setImmediate(resolve));assert.equal(g.spoken[0],'At midnight, the server crashed. Find clues and solve the mystery.');g.clean()});

test('Brawl Lab: six missions, eight-point budget, drawing, map and designer report',async()=>{
 const g=game('brawl-lab');const type=(key,value)=>{let el=g.d.querySelector(`[data-field="${key}"]`);assert.ok(el,key);el.value=value;el.dispatchEvent(new g.w.Event('input',{bubbles:true}))};type('rules',"You have to hold gems. It's fun & fair.");g.click('Next mission →');assert.equal(g.d.querySelectorAll('img.portrait').length,6);assert.ok([...g.d.querySelectorAll('img.portrait')].every(i=>i.getAttribute('src').startsWith('assets/')));g.d.querySelector('[data-hero="3"]').click();type('heroText','8-Bit helps the team.');g.click('Next mission →');g.w.toggle(0);g.w.toggle(1);g.w.toggle(2);assert.equal(g.w.eval('s.chosen.length'),2);g.w.toggle(3);assert.equal(g.w.eval('s.chosen.reduce((n,i)=>n+powers[i][1],0)'),8);type('robot',"Nova's Robot");type('super','Shield wave');type('weak','It is slow.');type('robotText','My robot can protect the team.');g.click('Next mission →');let canvas=g.d.querySelector('canvas');canvas.getBoundingClientRect=()=>({left:0,top:0,width:700,height:450});canvas.onpointerdown({clientX:10,clientY:10,pointerId:1,button:0});canvas.onpointermove({clientX:60,clientY:60,pointerId:1});canvas.onpointercancel({pointerId:1});assert.ok(g.w.localStorage.getItem('brawl_drawing'));assert.ok(g.paintOps.some(x=>x.type==='stroke'));type('drawText','The shield is blue.');let downloads=[];g.w.HTMLAnchorElement.prototype.click=function(){downloads.push({name:this.download,href:this.href})};g.click('Save drawing PNG ↓');assert.equal(downloads[0].name,'my-brawl-robot.png');g.click('Next mission →');assert.equal(g.d.querySelectorAll('.tile').length,48);g.d.querySelectorAll('.tile')[9].click();g.click('💎 Gem');g.d.querySelectorAll('.tile')[10].click();g.click('Erase');g.d.querySelectorAll('.tile')[9].click();assert.equal(g.w.eval('s.map[9]'),0);assert.equal(g.w.eval('s.map[10]'),3);type('mapText','The gem is in the centre.');g.click('Next mission →');type('battleText','First, I will help my team.');type('pitch','Nova is fair because it is slow.');let blob;g.w.URL.createObjectURL=b=>(blob=b,'blob:test');g.w.URL.revokeObjectURL=()=>{};g.click('Download your report ↓');const text=await new Promise(resolve=>{let r=new g.w.FileReader();r.onload=()=>resolve(r.result);r.readAsText(blob)});assert.match(text,/8-Bit/);assert.match(text,/Nova's Robot/);assert.match(text,/The gem is in the centre/);assert.match(text,/Arena layout/);g.clean();
});
test('Brawl Lab: late image restore cannot overwrite a cleared drawing',()=>{const g=game('brawl-lab');const images=[];g.w.Image=function(){images.push(this)};g.w.localStorage.setItem('brawl_drawing','data:image/png;base64,OLD');g.w.go(3);assert.equal(images.length,1);g.w.confirm=()=>true;g.click('Clear');const count=g.paintOps.filter(x=>x.type==='drawImage').length;images[0].onload();assert.equal(g.paintOps.filter(x=>x.type==='drawImage').length,count);assert.equal(g.w.localStorage.getItem('brawl_drawing'),null);g.clean()});
test('Brawl Lab: invalid or unavailable saved data does not break the lesson',()=>{
 const html=fs.readFileSync('brawl-lab/index.html','utf8');for(const data of ['{broken','null','[]','{"chosen":[999],"map":null,"hero":100,"page":2}','{"page":4,"map":[99],"tool":100}']){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.localStorage.setItem('brawl_lab',data)}});assert.ok(d.window.document.querySelector('#main h2'));assert.deepEqual(errors,[]);d.window.close()}
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){Object.defineProperty(w,'localStorage',{get(){throw Error('Blocked')}})}});assert.ok(d.window.document.querySelector('textarea'));assert.equal(d.window.document.querySelector('#storage-note').hidden,false);assert.deepEqual(errors,[]);d.window.close();
});

function percyBookMissions(g,wrong=false){
 g.w.go(1);for(const text of ['Mrs Dodds turns into a winged creature.','The three old women cut the blue yarn.','Grover reveals his cloven hooves.','The Minotaur follows Percy through the storm.'])[...g.d.querySelectorAll('#timeline .event')].find(b=>b.textContent.includes(text)).click();g.click('Open the mythology file');
 for(const [box,key,next] of [['myths','mythQs','Follow Grover'],['vocab','vocabQs','Read the storm evidence'],['chapter','chapterQs','Face the Minotaur']]){const answers=g.w.eval(key+'.map(q=>q.c)');[...g.d.querySelectorAll('#'+box+' .question')].forEach((q,i)=>q.querySelectorAll('button')[wrong?(answers[i]+1)%3:answers[i]].click());g.click(next)}
 const battle=g.w.eval('battleQs.map(q=>q.c)');for(const i of battle){g.d.querySelectorAll('#battle .option')[wrong?(i+1)%3:i].click();g.flush()}g.click('Compare the film');
 for(const [box,key] of [['compare','compareQs'],['filmLanguage','filmLanguageQs']]){const answers=g.w.eval(key+'.map(q=>q.c)');[...g.d.querySelectorAll('#'+box+' .question')].forEach((q,i)=>q.querySelectorAll('button')[wrong?(answers[i]+1)%3:answers[i]].click())}g.click('Write the final report');
}
test('Percy Book & Film: complete all missions for 40 points, download and safe replay',async()=>{
 const g=game('percy-book-film');percyBookMissions(g);assert.equal(g.d.querySelector('#score').textContent,'34 / 40');const text='In both versions, Percy is in danger. Unlike the book, the film shows the gods first. I prefer the book because we learn with Percy.';g.d.querySelector('#report').value=text;g.d.querySelector('#report').dispatchEvent(new g.w.Event('input',{bubbles:true}));g.click('Complete the quest');assert.equal(g.d.querySelector('#finalScore').textContent,'40 / 40');g.w.finish();assert.equal(g.d.querySelector('#score').textContent,'40 / 40');
 const progress=g.w.localStorage.getItem('hb2-progress');assert.ok(progress);g.click('Read my report');let blob;g.w.URL.createObjectURL=b=>(blob=b,'blob:report');g.w.URL.revokeObjectURL=()=>{};g.w.HTMLAnchorElement.prototype.click=function(){assert.equal(this.download,'percy-book-film-report.txt')};g.click('Download my writing (.txt)');const output=await new Promise(resolve=>{let r=new g.w.FileReader();r.onload=()=>resolve(r.result);r.readAsText(blob)});assert.match(output,/Unlike the book/);g.w.restart();assert.ok(g.d.querySelector('#s0.active'));assert.equal(g.d.querySelector('#score').textContent,'0 / 40');assert.equal(g.d.querySelector('#report').value,text);g.clean();
});
test('Percy Book & Film: wrong answers unlock stages, writing must be present',()=>{const g=game('percy-book-film');percyBookMissions(g,true);g.click('Complete the quest');assert.ok(g.d.querySelector('#s7.active'));assert.match(g.d.querySelector('#reportFb').textContent,/60/);g.d.querySelector('#report').value='In both versions, Percy discovers danger. Unlike the book, the film shows the gods first.';g.w.finish();assert.equal(g.d.querySelector('#finalScore').textContent,'10 / 40');g.clean()});
test('Percy Book & Film: reload restores locked answers, score and chapter stage',()=>{
 const g=game('percy-book-film');g.w.go(1);for(const t of ['Mrs Dodds turns into a winged creature.','The three old women cut the blue yarn.','Grover reveals his cloven hooves.','The Minotaur follows Percy through the storm.'])[...g.d.querySelectorAll('#timeline .event')].find(b=>b.textContent.includes(t)).click();g.w.go(2);g.d.querySelectorAll('#myths .question').forEach(q=>q.querySelectorAll('button')[1].click());g.w.go(3);g.d.querySelectorAll('#vocab .question').forEach(q=>q.querySelectorAll('button')[0].click());g.w.go(4);g.d.querySelector('#chapter .question button').click();const saved=g.w.localStorage.getItem('hb2-progress');assert.ok(saved);const score=g.d.querySelector('#score').textContent;g.clean();
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(fs.readFileSync('percy-book-film/index.html','utf8'),{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.localStorage.setItem('hb2-progress',saved)}});assert.ok(d.window.document.querySelector('#s4.active'));assert.equal(d.window.document.querySelector('#score').textContent,score);assert.equal(d.window.document.querySelector('#chapter .question button').disabled,true);assert.deepEqual(errors,[]);d.window.close();
});
test('Percy Book & Film: battle clicks and pending timers cannot double-score or survive restart',()=>{const g=game('percy-book-film');g.w.renderBattle();const b=g.d.querySelectorAll('#battle .option')[1];b.click();b.click();assert.equal(g.w.eval('state.battleDone'),1);g.w.restart();g.flush();assert.equal(g.w.eval('state.battleDone'),0);assert.equal(g.d.querySelector('#score').textContent,'0 / 40');g.clean()});
test('Percy Book & Film: broken or unavailable storage never blocks play',()=>{const html=fs.readFileSync('percy-book-film/index.html','utf8');for(const value of ['{broken','null','[]','{"screen":8,"score":999,"answers":{"myths":[99]}}','blocked']){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};if(value==='blocked')Object.defineProperty(w,'localStorage',{get(){throw Error('Blocked')}});else w.localStorage.setItem('hb2-progress',value)}});assert.ok(d.window.document.querySelector('#s0.active'));assert.deepEqual(errors,[]);d.window.close()}});

test('Karni Academy: all 130 challenges, hints, notebook and mistake review work',()=>{
 const g=game('karni-english-academy');const data=g.w.eval('data.map(d=>({name:d.name,match:d.match,count:d.rows.length}))');let count=0;
 data.forEach((mission,a)=>{g.w.start(a);for(let b=0;b<mission.count;b++){const right=mission.match?b:0;const wrong=(right+1)%(mission.match?mission.count:3);g.w.answer(wrong);assert.equal(g.d.querySelector('#next').disabled,true);g.w.hint();g.w.notebook();assert.ok(g.d.querySelector('#writeText').textContent);if(a===4){assert.match(g.d.querySelector('#prompt').textContent,/NOT correct/);assert.doesNotMatch(g.d.querySelector('#writeText').textContent,/impossible to break|never shares|never ends|a new problem|always afraid to try|the cause itself|unnecessary|always needs others to decide|describe only the past/)}g.w.answer(right);assert.equal(g.d.querySelector('#next').disabled,false);g.w.next();count++}assert.equal(g.d.querySelector('#end').classList.contains('hidden'),false)});
 assert.equal(count,130);g.w.home();g.w.review();for(let i=0;i<count;i++){const x=g.w.current();g.w.answer(x.match?x.b:0);g.w.next()}assert.equal(g.w.eval('Object.values(state).filter(v=>v.miss).length'),0);g.click('Play again');assert.equal(g.d.querySelector('#game').classList.contains('hidden'),false);assert.match(g.d.querySelector('#status').textContent,/Review/);g.clean();
});
test('Karni Academy: solved questions cannot be marked wrong by Skip and teacher notes save safely',()=>{const g=game('karni-english-academy');g.w.start(0);g.w.answer(0);g.w.skip();assert.equal(JSON.parse(g.w.localStorage.getItem('esther-karni-v2'))['0:0'].done,true);g.click('⚙ Teacher notes');const t=g.d.querySelector('#notes');t.value='Try reading in shorter groups.';g.click('Save notes');assert.equal(g.w.localStorage.getItem('esther-teacher-notes'),t.value);g.clean()});
test('Karni Academy: a paused attempt resumes with disabled wrong choices and teacher notes',()=>{
 const g=game('karni-english-academy');g.w.start(1);g.w.answer(1);const progress=g.w.localStorage.getItem('esther-karni-v2'),session=g.w.localStorage.getItem('esther-karni-session-v1');assert.ok(session);g.clean();const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(fs.readFileSync('karni-english-academy/index.html','utf8'),{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){w.localStorage.setItem('esther-karni-v2',progress);w.localStorage.setItem('esther-karni-session-v1',session);w.localStorage.setItem('esther-teacher-notes','Saved observation')}});d.window.resume();assert.match(d.window.document.querySelector('#prompt').textContent,/give up/);assert.equal(d.window.document.querySelector('#choices [data-id="1"]').disabled,true);assert.equal(d.window.document.querySelector('#notes').value,'Saved observation');d.window.answer(0);assert.equal(d.window.document.querySelector('#next').disabled,false);assert.deepEqual(errors,[]);d.window.close();
});
test('Karni Academy: invalid or blocked storage does not prevent a lesson',()=>{const html=fs.readFileSync('karni-english-academy/index.html','utf8');for(const value of ['{broken','null','[]','{"4:0":null,"invalid":{"miss":true}}','blocked']){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){if(value==='blocked')Object.defineProperty(w,'localStorage',{get(){throw Error('Blocked')}});else w.localStorage.setItem('esther-karni-v2',value)}});assert.equal(d.window.document.querySelectorAll('#missions button').length,10);d.window.start(4);d.window.answer(0);assert.equal(d.window.document.querySelector('#next').disabled,false);assert.deepEqual(errors,[]);d.window.close()}});

test('Karni Academy: all 132 reading clips exist and audio failure falls back to speech',async()=>{const g=game('karni-english-academy');const manifest=JSON.parse(fs.readFileSync('karni-english-academy/assets/audio/manifest.json','utf8'));assert.equal(Object.keys(manifest).length,132);for(const key of Object.keys(manifest))assert.ok(fs.statSync('karni-english-academy/assets/audio/'+key+'.m4a').size>1000);g.w.start(4);g.w.speak();assert.equal(g.spoken[0],'assets/audio/4-0.m4a');assert.match(manifest['4-0'],/NOT correct/);g.w.Audio=function(){const el=g.d.createElement('audio');el.pause=()=>{};el.play=()=>Promise.reject(Error('No media'));return el};g.w.speak();await new Promise(resolve=>setImmediate(resolve));assert.match(g.spoken[1],/NOT correct/);g.clean()});
