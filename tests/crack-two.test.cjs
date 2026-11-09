const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync:read}=require('node:fs');
const {JSDOM}=require('jsdom');
function boot(saved={}){
 const dom=new JSDOM(read('crack-the-code-2/index.html','utf8'),{url:'https://example.test/crack-the-code-2/',runScripts:'outside-only'});
 const w=dom.window,d=w.document;w.scrollTo=()=>{};
 Object.entries(saved).forEach(([k,v])=>w.localStorage.setItem(k,v));
 for(const path of ['crack-code-shared/level-one-core.js','crack-code-shared/profiles.js','crack-the-code-2/content.js','crack-the-code-2/game.js'])w.eval(read(path,'utf8'));
 const click=(selector)=>{const el=d.querySelector(selector);assert.ok(el,selector);el.click();};
 const create=(name)=>{d.querySelector('#name').value=name;d.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
 return {w,d,click,create};
}
test('Level 2: every mission and homework can finish only through checked answers and confirmations',()=>{
 const {w,d,click,create}=boot();create('Alex');
 for(const [m,mission] of w.CtcTwo.missions.entries()){
   click('[data-mission="'+m+'"]');
   for(const t of mission.tasks){
     if(t.options)click('[data-option="'+t.options.indexOf(t.answer)+'"]');
     if(t.tiles){const used=new Set();for(const value of t.answer){const i=t.tiles.findIndex((v,i)=>v===value&&!used.has(i));used.add(i);click('[data-tile="'+i+'"]');}}
     if(t.options||t.tiles)click('[data-action=check]');
     if(t.confirm){assert.equal(d.querySelector('[data-action=next]').disabled,true);click('#confirm');}
     click('[data-action=next]');
   }
   click('[data-action=map]');
 }
 assert.match(d.querySelector('#app').textContent,/Level 2 complete/);
 click('[data-mission="8"]');
 for(const t of w.CtcTwo.homework.tasks){if(t.options){click('[data-option="'+t.options.indexOf(t.answer)+'"]');click('[data-action=check]');}else click('#confirm');click('[data-action=next]');}
 assert.match(d.querySelector('#app').textContent,/Homework complete/);
});
test('Level 2: wrong answers cannot advance; tiles survive reload and remain private to a local profile',()=>{
 let a=boot();a.create('Alex');a.click('[data-mission="2"]');a.click('[data-tile="0"]');a.click('[data-action=check]');
 assert.equal(a.d.querySelector('[data-action=next]'),null);
 const saved=Object.fromEntries(Object.keys(a.w.localStorage).map(k=>[k,a.w.localStorage.getItem(k)]));
 a.w.close();a=boot(saved);a.click('[data-profile]');assert.ok(a.d.querySelector('[data-remove]'));
 a.click('[data-action=profiles]');a.create('Ben');a.click('[data-mission="2"]');assert.equal(a.d.querySelector('[data-remove]'),null);
});
test('Level 2: uses the Level 1 profile and keeps both levels when they save',()=>{
 const {w,click}=boot(),one=w.CtcProfiles.make(()=>w.localStorage);
 const p=one.create('Alex'),s=w.CtcOne.fresh();
 assert.ok(w.CtcOne.record(s,0,0,['/æ/']));one.save(p.id,s);
 click('[data-action=profiles]');click('[data-profile]');click('[data-mission="0"]');
 click('[data-option="0"]');click('[data-action=check]');click('[data-action=next]');
 assert.ok(one.state(p.id).tasks['0:0']);
 one.save(p.id,s);
 const two=w.CtcProfiles.make(()=>w.localStorage,{level:'level-2',core:w.CtcTwo});
 assert.ok(two.state(p.id).completed['0:0']);
});
