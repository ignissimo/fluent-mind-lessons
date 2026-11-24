const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom'),fs=require('node:fs');
function game(raw,blocked){return new JSDOM(fs.readFileSync('omashu-engineers-challenge/index.html','utf8'),{url:'https://example.test',runScripts:'dangerously',beforeParse(w){w.scrollTo=()=>{};if(raw)w.localStorage.setItem('fluentmind-omashu-2024-v1',JSON.stringify(raw));if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('blocked')}})}}).window}
test('damaged saves leave the game playable and valid drafts survive',()=>{const w=game({page:99,answers:null,texts:{'4-final':'<draft>'}});w.eval('go(4)');assert.equal(w.document.getElementById('4-final').value,'<draft>');w.close()});
test('blocked storage is visible and navigation still works',()=>{const w=game(null,true);w.eval('go(4)');assert.match(w.document.body.textContent,/Progress could not be saved/);w.close()});
test('all 20 questions, writing and speaking complete the quest; changes reopen it',()=>{const w=game();w.eval('go(4);finish()');assert.equal(w.document.querySelector('#done').hidden,true);w.eval(`missions.slice(0,5).forEach((m,p)=>{go(p);(m.questions||[]).forEach((q,i)=>{choose(p+'-'+i,q.a);check(p+'-'+i)});(m.writes||[]).forEach(([k])=>{if(k==='talk'||k==='present')document.querySelector('#spoken-'+k).click();else writeText(p+'-'+k,k==='final'?'One. Two. Three. Four. Five.':'Draft')})});document.querySelectorAll('#review input').forEach(e=>e.click());finish()`);assert.equal(w.document.querySelector('#done').hidden,false);const saved=JSON.parse(w.localStorage.getItem('fluentmind-omashu-2024-v1'));w.close();const r=game(saved);assert.equal(r.document.querySelector('#done').hidden,false);r.eval("go(0);choose('0-0',0);check('0-0');go(4)");assert.equal(r.document.querySelector('#done').hidden,true);r.close()});
test('extended story follows the original five missions and has its own completion',()=>{
 const w=game({page:4,finished:true,answers:{'0-0':{choice:1,checked:true}},texts:{'4-final':'My original draft'}}),d=w.document;
 assert.equal(d.querySelectorAll('#steps button').length,10);
 assert.equal(d.getElementById('4-final').value,'My original draft');
 d.querySelector('#next').click();assert.match(d.querySelector('#progressText').textContent,/Mission 6/);
 d.querySelector('#next').click();d.querySelector('#finishInvestigation').click();assert.match(d.querySelector('#storyStatus').textContent,/Before finishing/);
 w.eval("missions.slice(5,7).forEach((m,j)=>{const p=j+5;go(p);m.questions.forEach((q,i)=>{choose(p+'-'+i,q.a);check(p+'-'+i)});m.writes.forEach(([k])=>{if(k==='jet'||k==='speak')document.getElementById('spoken-'+k).click();else writeText(p+'-'+k,'First sentence. Second sentence. Third sentence. Fourth sentence.')})})");
 d.querySelector('#finishInvestigation').click();assert.match(d.querySelector('#storyStatus').textContent,/Story investigation complete/);
 const saved=JSON.parse(w.localStorage.getItem('fluentmind-omashu-2024-v1'));w.close();
 const restored=game(saved);assert.match(restored.document.querySelector('#storyStatus').textContent,/Story investigation complete/);
 restored.eval("go(5);choose('5-0',1);go(6)");assert.doesNotMatch(restored.document.querySelector('#storyStatus').textContent,/Story investigation complete/);restored.close();
});
test('complete edition adds three missions without reusing workshop speaking marks',()=>{
 const w=game({page:9,spoken:{talk:true,present:true,jet:true,speak:true},texts:{'4-final':'My old draft','9-talk':'My old notes'}}),d=w.document;
 assert.equal(d.querySelectorAll('#steps button').length,10);
 assert.equal(d.getElementById('spoken-9-talk').checked,false);
 assert.equal(d.getElementById('9-talk').value,'My old notes');
 d.getElementById('spoken-9-talk').click();
 const saved=JSON.parse(w.localStorage.getItem('fluentmind-omashu-2024-v1'));
 assert.equal(saved.spoken.talk,true);assert.equal(saved.spoken['9-talk'],true);
 w.eval('go(4)');assert.equal(d.getElementById('4-final').value,'My old draft');
 w.eval('go(3)');assert.equal(d.getElementById('spoken-talk').checked,true);
 w.eval('go(7)');assert.doesNotMatch(d.querySelector('.reading').textContent,/Bumi/);
 w.close();
});
test('full Omashu finale requires all ten missions and restores all seven speaking marks',()=>{
 let w=game(),d=w.document;
 w.eval('go(9)');d.getElementById('next').click();assert.match(d.getElementById('completeStatus').textContent,/Before finishing/);
 w.eval(`missions.forEach((m,p)=>{go(p);(m.questions||[]).forEach((q,i)=>{choose(p+'-'+i,q.a);check(p+'-'+i)});(m.writes||[]).forEach(([k])=>{
 const field=document.getElementById(p+'-'+k),section=field.closest('section');
 const spoken=section.querySelector('input[type=checkbox]');
 if(spoken)spoken.click();else writeText(p+'-'+k,k==='final'?'One. Two. Three. Four. Five.':'First. Second. Third. Fourth.');
 });if(p===4){document.querySelectorAll('#review input').forEach(e=>e.click());finish()}})`);
 d.getElementById('spoken-9-talk').click();d.getElementById('next').click();
 assert.match(d.getElementById('completeStatus').textContent,/speaking.*mission 10/);
 d.getElementById('spoken-9-talk').click();
 d.getElementById('next').click();assert.match(d.getElementById('completeStatus').textContent,/Complete lesson finished/);
 assert.match(d.getElementById('progressText').textContent,/68 \/ 68/);
 const saved=JSON.parse(w.localStorage.getItem('fluentmind-omashu-2024-v1'));w.close();
 w=game(saved);d=w.document;assert.match(d.getElementById('completeStatus').textContent,/Complete lesson finished/);
 assert.equal(d.getElementById('spoken-9-talk').checked,true);
 w.eval("go(8);choose('8-0',1);check('8-0');go(9)");
 assert.doesNotMatch(d.getElementById('completeStatus').textContent,/Complete lesson finished/);
 w.eval("go(4)");assert.equal(d.querySelector('#done').hidden,false);w.close();
});
