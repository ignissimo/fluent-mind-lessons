const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs');
function game(name){
 const errors=[],timers=[],spoken=[];
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(fs.readFileSync(`${name}/index.html`,'utf8'),{runScripts:'dangerously',url:`https://example.test/${name}/`,virtualConsole:vc,beforeParse(w){
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.setTimeout=fn=>(timers.push(fn),timers.length);
 w.speechSynthesis={cancel(){},getVoices(){return[]},speak(u){spoken.push(u.text)}};
 w.SpeechSynthesisUtterance=function(t){this.text=t};
 }});
 const w=dom.window,d=w.document;
 const click=t=>{const b=[...d.querySelectorAll('button')].find(b=>b.textContent.trim()===t&&!b.disabled);assert.ok(b,`button ${t}`);assert.equal(b.disabled,false,`enabled: ${t}`);b.click();};
 return {w,d,click,spoken,flush(){while(timers.length)timers.shift()()},clean(){assert.deepEqual(errors.map(e=>e.message),[]);w.close()}};
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
