const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=require('fs').readFileSync('karni-lesson-3/index.html','utf8');
const key='karni_english_lesson3_v1';
function lesson(save,blocked=false){
 const errors=[], speech=[], vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(html,{url:'https://example.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
 if(save!==undefined)w.localStorage.setItem(key,save);
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('blocked')}});
 else {w.SpeechSynthesisUtterance=function(text){this.text=text};w.speechSynthesis={cancel(){},speak(u){speech.push(u.text)}}}
 }}).window;
 const d=w.document, click=s=>{const b=d.querySelector(s);assert.ok(b,s);assert.equal(b.disabled,false);b.click()};
 return {w,d,speech,click,close(){assert.deepEqual(errors,[]);w.close()}};
}
test('all 110 questions and eight section transitions work through buttons',()=>{
 const g=lesson();const answers=g.w.eval('SECTIONS.map(s=>s.items.map(q=>q.a))');let count=0;
 answers.forEach(section=>{g.click('[data-action=start]');section.forEach(a=>{g.click('[data-choice="'+a+'"]');assert.match(g.d.querySelector('#status').textContent,new RegExp('^'+ ++count+' / 110'));g.click('[data-action=next]')})});
 assert.equal(count,110); assert.match(g.d.querySelector('main h2').textContent,/Lesson complete/);g.close();
});
test('retry, explanation, notebook, review, previous and reload remain consistent',()=>{
 const g=lesson();g.click('[data-action=start]');g.click('[data-action=question]');assert.match(g.speech.at(-1),/True.*False/);
 assert.ok(g.d.querySelector('[data-action=explanation]').disabled);g.click('[data-choice="1"]');
 assert.match(g.d.querySelector('#feedback').textContent,/Try/);assert.ok(g.d.querySelector('[data-action=explanation]').disabled);
 g.click('[data-action=rule]');g.click('[data-action=start]');g.click('[data-choice="0"]');g.click('[data-action=explanation]');assert.match(g.speech.at(-1),/visible light/);
 g.click('[data-action=notebook]');assert.equal(g.d.querySelector('#notebook').hidden,false);
 g.click('[data-action=next]');g.click('[data-action=previous]');assert.match(g.d.querySelector('#feedback').textContent,/Correct/);
 const save=g.w.localStorage.getItem(key);g.close();const restored=lesson(save);assert.match(restored.d.querySelector('.question').textContent,/Moon/);assert.match(restored.d.querySelector('#feedback').textContent,/Correct/);restored.close();
});
test('skipped questions do not count as completion; broken storage and speech do not block practice',()=>{
 const g=lesson('null',true);g.click('[data-section="7"]');g.click('[data-action=start]');g.click('[data-action=question]');assert.match(g.d.querySelector('#audio-status').textContent,/unavailable/);
 for(let i=0;i<10;i++)g.click('[data-action=next]');
 assert.match(g.d.querySelector('main h2').textContent,/Lesson review/);g.click('[data-action=unfinished]');assert.match(g.d.querySelector('.question').textContent,/Moon/);g.close();
});
