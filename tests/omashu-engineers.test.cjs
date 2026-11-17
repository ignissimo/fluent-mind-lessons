const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom'),fs=require('node:fs');
function game(raw,blocked){return new JSDOM(fs.readFileSync('omashu-engineers-challenge/index.html','utf8'),{url:'https://example.test',runScripts:'dangerously',beforeParse(w){w.scrollTo=()=>{};if(raw)w.localStorage.setItem('fluentmind-omashu-2024-v1',JSON.stringify(raw));if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('blocked')}})}}).window}
test('damaged saves leave the game playable and valid drafts survive',()=>{const w=game({page:99,answers:null,texts:{'4-final':'<draft>'}});w.eval('go(4)');assert.equal(w.document.getElementById('4-final').value,'<draft>');w.close()});
test('blocked storage is visible and navigation still works',()=>{const w=game(null,true);w.eval('go(4)');assert.match(w.document.body.textContent,/Progress could not be saved/);w.close()});
test('all 20 questions, writing and speaking complete the quest; changes reopen it',()=>{const w=game();w.eval('go(4);finish()');assert.equal(w.document.querySelector('#done').hidden,true);w.eval(`missions.slice(0,5).forEach((m,p)=>{go(p);(m.questions||[]).forEach((q,i)=>{choose(p+'-'+i,q.a);check(p+'-'+i)});(m.writes||[]).forEach(([k])=>{if(k==='talk'||k==='present')document.querySelector('#spoken-'+k).click();else writeText(p+'-'+k,k==='final'?'One. Two. Three. Four. Five.':'Draft')})});document.querySelectorAll('#review input').forEach(e=>e.click());finish()`);assert.equal(w.document.querySelector('#done').hidden,false);const saved=JSON.parse(w.localStorage.getItem('fluentmind-omashu-2024-v1'));w.close();const r=game(saved);assert.equal(r.document.querySelector('#done').hidden,false);r.eval("go(0);choose('0-0',0);check('0-0');go(4)");assert.equal(r.document.querySelector('#done').hidden,true);r.close()});
test('extended story follows the original five missions and has its own completion',()=>{
 const w=game({page:4,finished:true,answers:{'0-0':{choice:1,checked:true}},texts:{'4-final':'My original draft'}}),d=w.document;
 assert.equal(d.querySelectorAll('#steps button').length,7);
 assert.equal(d.getElementById('4-final').value,'My original draft');
 d.querySelector('#next').click();assert.match(d.querySelector('#progressText').textContent,/Mission 6/);
 d.querySelector('#next').click();d.querySelector('#next').click();assert.match(d.querySelector('#storyStatus').textContent,/Before finishing/);
 w.eval("missions.slice(5).forEach((m,j)=>{const p=j+5;go(p);m.questions.forEach((q,i)=>{choose(p+'-'+i,q.a);check(p+'-'+i)});m.writes.forEach(([k])=>{if(k==='jet'||k==='speak')document.getElementById('spoken-'+k).click();else writeText(p+'-'+k,'First sentence. Second sentence. Third sentence. Fourth sentence.')})})");
 d.querySelector('#next').click();assert.match(d.querySelector('#storyStatus').textContent,/Story investigation complete/);
 const saved=JSON.parse(w.localStorage.getItem('fluentmind-omashu-2024-v1'));w.close();
 const restored=game(saved);assert.match(restored.document.querySelector('#storyStatus').textContent,/Story investigation complete/);
 restored.eval("go(5);choose('5-0',1);go(6)");assert.doesNotMatch(restored.document.querySelector('#storyStatus').textContent,/Story investigation complete/);restored.close();
});
