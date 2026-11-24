const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const key = 'fm-natanel-message-rescue-v1';
function app(saved, blocked = false) {
 const errors=[];
 const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(fs.readFileSync('message-board-rescue/index.html','utf8'),{url:'https://test.example',runScripts:'dangerously',virtualConsole,beforeParse(w){
  w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLMediaElement.prototype.pause=()=>{};
  if(saved!==undefined)w.localStorage.setItem(key,JSON.stringify(saved));
  if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('blocked')}});
 }}).window;
 return {w,d:w.document,errors};
}
function go(w,index){w.document.querySelectorAll('#nav button')[index].click();}
test('Message Board restores valid drafts and handles invalid saved collections and blocked storage',()=>{
 for(const [saved,blocked] of [[{done:null,answers:null,evidence:null,writing:{0:'Old draft'},ratings:null,notes:'My note',current:99},false],[undefined,true]]){
  const {w,d,errors}=app(saved,blocked);assert.deepEqual(errors,[]);go(w,5);
  if(saved)assert.equal(d.querySelector('textarea').value,'Old draft');
  if(blocked)assert.match(d.getElementById('storage').textContent,/недоступно/);
  assert.equal(d.querySelectorAll('#nav button').length,6);w.close();
 }
});
test('Message Board evidence follows the selected answer and a wrong clue never remains marked correct',()=>{
 const {w,d}=app();go(w,1);
 assert.match(d.querySelector('.story p').textContent,/Ben/);
 d.querySelector('.question .choices button').click();
 let evidence=d.querySelector('.question .evidence');evidence.querySelectorAll('button')[0].click();
 assert.equal(evidence.querySelectorAll('button.correct').length,1);
 evidence.querySelectorAll('button')[1].click();assert.equal(evidence.querySelectorAll('button.correct').length,0);
 evidence.querySelectorAll('button')[0].click();d.querySelector('.question .choices button:nth-child(2)').click();
 const saved=JSON.parse(w.localStorage.getItem(key));assert.equal(saved.evidence['1-0'],undefined);
 d.querySelector('.question .choices button').click();evidence=d.querySelector('.question .evidence');
 assert.equal(evidence.querySelectorAll('button.correct').length,0);w.close();
});
test('Message Board keeps both repair sentences and the current station across reload',()=>{
 let {w,d}=app();
 const selectWord=word=>{const button=[...d.querySelectorAll('.tokens button')].find(b=>b.textContent===word&&!b.disabled);assert.ok(button,word);button.click()};
 ['Why','do','you'].forEach(selectWord);
 go(w,2);go(w,0);assert.equal(d.querySelector('.answerline').textContent,'Why do you');
 d.querySelector('[data-action=other]').click();['How','do','you','get','to','school?'].forEach(selectWord);d.querySelector('[data-action=check]').click();
 let saved=JSON.parse(w.localStorage.getItem(key));w.close();({w,d}=app(saved));
 assert.equal(d.querySelector('.answerline').textContent,'How do you get to school?');
 d.querySelector('[data-action=other]').click();assert.equal(d.querySelector('.answerline').textContent,'Why do you');
 go(w,4);saved=JSON.parse(w.localStorage.getItem(key));w.close();({w,d}=app(saved));
 assert.match(d.querySelector('#app h2').textContent,/Time & listening/);assert.ok(d.querySelector('audio[src="assets/listening.m4a"]'));w.close();
});
test('Message Board badges record exploration, summary restores, and reset cancellation keeps teacher notes',()=>{
 let {w,d}=app();
 for(let i=0;i<6;i++){go(w,i);d.querySelector('[data-badge]').click();}
 d.getElementById('notes').value='Keep this';d.getElementById('notes').dispatchEvent(new w.Event('input'));
 d.querySelector('[data-next]').click();assert.match(d.querySelector('#app h2').textContent,/Lesson explored/);
 const saved=JSON.parse(w.localStorage.getItem(key));w.close();({w,d}=app(saved));
 assert.match(d.querySelector('#app h2').textContent,/Lesson explored/);
 d.getElementById('reset').click();d.getElementById('cancelReset').click();assert.equal(d.getElementById('notes').value,'Keep this');
 d.getElementById('reset').click();d.getElementById('confirmReset').click();assert.equal(d.getElementById('notes').value,'');
 assert.match(d.getElementById('progress').textContent,/0 \/ 6/);w.close();
});
