const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const html=require('node:fs').readFileSync('mohicans-episode-4/index.html','utf8');
const key='mohicans-episode4-v1';
function open(saved,blocked=false){
 const w=new JSDOM(html,{url:'https://example.test/',runScripts:'dangerously',beforeParse(w){
 if(saved!==undefined)w.localStorage.setItem(key,JSON.stringify(saved));
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('blocked')}});
 }}).window;
 return {w,d:w.document,click:s=>w.document.querySelector(s).click(),has:s=>!!w.document.querySelector(s)};
}
test('Bear Tracks: short route requires a clue and spoken confirmation',()=>{
 const g=open();g.click('nav [data-go="3"]');assert.equal(g.has('#badge'),false);
 g.click('nav [data-go="1"]');g.click('[data-answer="0"]');assert.equal(g.d.querySelector('#next').disabled,true);
 g.click('[data-answer="2"]');g.click('nav [data-go="3"]');assert.equal(g.has('#badge'),false);
 g.click('#confirm');assert.equal(g.has('#badge'),true);g.w.close();
});
test('Bear Tracks: all three clues, both roles and completion restore',()=>{
 const g=open();g.click('nav [data-go="1"]');
 for(const a of [2,5,4]){g.click('[data-answer="'+a+'"]');g.click('#next')}
 g.click('[data-role="0"]');g.click('[data-role="1"]');g.click('nav [data-go="3"]');g.click('#confirm');
 const r=open(JSON.parse(g.w.localStorage.getItem(key)));assert.equal(r.has('#badge'),true);
 r.click('nav [data-go="2"]');assert.equal(r.d.querySelector('[data-role="1"]').getAttribute('aria-pressed'),'true');
 r.click('nav [data-go="1"]');assert.equal(r.d.querySelector('#next').disabled,false);r.w.close();g.w.close();
});
test('Bear Tracks: malformed or blocked storage keeps the trail playable',()=>{
 for(const [saved,blocked] of [[{page:9,round:9,solved:null,finished:true},false],[null,true]]){
 const g=open(saved,blocked);assert.equal(g.has('#badge'),false);g.click('nav [data-go="1"]');g.click('[data-answer="2"]');
 assert.equal(g.d.querySelector('#next').disabled,false);g.w.close();
 }
});
