const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const key = 'campfireSecrets';
function app(saved, blocked = false) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', e => errors.push(e.message));
  const w = new JSDOM(fs.readFileSync('percy-campfire-secrets/index.html', 'utf8'), {
    url: 'https://lesson.example', runScripts: 'dangerously', virtualConsole,
    beforeParse(w) {
      w.scrollTo = () => {};
      w.HTMLElement.prototype.scrollIntoView = () => {};
      if (saved !== undefined) w.localStorage.setItem(key, JSON.stringify(saved));
      if (blocked) Object.defineProperty(w, 'localStorage', { get() { throw Error('blocked'); } });
    }
  }).window;
  return { w, d: w.document, errors };
}
function correctQuiz(w, target, choices) {
  choices.forEach((index, i) => w.document.querySelectorAll(`#${target} .card`)[i].querySelectorAll('.choice')[index].click());
}
function sortTimeline(w) {
  for (let id = 0; id < 6; id++) {
    let item = w.document.querySelector(`[data-event="${id}"]`);
    while (Array.from(item.parentElement.children).indexOf(item) > id) {
      item.querySelector('[data-direction="-1"]').click();
      item = w.document.querySelector(`[data-event="${id}"]`);
    }
  }
  w.checkOrder();
}
function matchMyths(w) {
  const values = ['goddess of wisdom and battle','god of travellers, merchants and thieves','water spirits','gives prophecies','god of war'];
  values.forEach((value, i) => { const el=w.document.getElementById('m'+i);el.value=value;el.dispatchEvent(new w.Event('change')); });
  w.checkMatches();
}
test('Campfire quiz buttons accept retries, award once, and restore the actual answer', () => {
  let { w, d, errors } = app();
  w.startGame();
  d.querySelector('#q1 .choice').click();
  assert.match(d.getElementById('q1-0fb').textContent, /try again/i);
  correctQuiz(w, 'q1', [1,1,0]);
  correctQuiz(w, 'q1', [1,1,0]);
  assert.equal(d.getElementById('score').textContent,'3');
  const saved=JSON.parse(w.localStorage.getItem(key));w.close();
  ({ w,d,errors }=app(saved));
  assert.deepEqual(errors,[]);
  assert.equal(d.querySelectorAll('#q1 .choice[aria-pressed="true"]').length,3);
  assert.equal(d.getElementById('score').textContent,'3');
  w.close();
});
test('Campfire timeline and archive changes restore and revoke outdated completion', () => {
  let {w,d}=app();w.startGame();
  sortTimeline(w);matchMyths(w);
  const saved=JSON.parse(w.localStorage.getItem(key));w.close();
  ({w,d}=app(saved));
  assert.match(d.getElementById('sortfb').textContent,/restored/i);
  assert.equal(d.getElementById('m0').value,'goddess of wisdom and battle');
  d.querySelector('[data-event="1"] [data-direction="-1"]').click();
  const el=d.getElementById('m0');el.value='water spirits';el.dispatchEvent(new w.Event('change'));
  assert.equal(d.getElementById('score').textContent,'0');
  w.close();
});
test('Campfire legacy achievements restore without trusting an invalid score or scene', () => {
  const {w,d,errors}=app({scene:2.5,score:999,done:{1:true},points:{'q1-0':true,oral2:true,timeline:true,myths:true,unknown:true}});
  assert.deepEqual(errors,[]);
  assert.equal(d.getElementById('score').textContent,'12');
  assert.match(d.getElementById('oral2').textContent,/completed/i);
  w.startGame();
  assert.equal(d.querySelector('.scene.active').dataset.scene,'1');
  w.close();
});
test('Campfire blocked or malformed storage leaves a playable lesson', () => {
  for(const [saved,blocked] of [[{scene:99,done:null,points:null,answers:null,order:[1,1],mythSelections:null},false],[undefined,true]]) {
    const {w,d,errors}=app(saved,blocked);w.startGame();correctQuiz(w,'q1',[1,1,0]);
    assert.deepEqual(errors,[]);
    assert.equal(d.getElementById('score').textContent,'3');
    if(blocked)assert.match(d.getElementById('saveStatus').textContent,/could not save/i);
    w.close();
  }
});
test('Campfire full route reaches 30, restores its finale, supports review and cancels reset', () => {
  let {w,d}=app();w.startGame();w.finishScene(1);
  assert.equal(d.querySelector('.scene.active').dataset.scene,'1');
  correctQuiz(w,'q1',[1,1,0]);w.finishScene(1);w.teacherPoint('oral2',2);w.finishScene(2);
  sortTimeline(w);w.teacherPoint('oral3',3);w.finishScene(3);matchMyths(w);w.finishScene(4);
  correctQuiz(w,'q5',[0,1,0]);w.teacherPoint('oral5',2);w.finishScene(5);
  w.endGame();assert.equal(d.getElementById('endbox').classList.contains('hidden'),true);
  w.teacherPoint('oral6',5);w.teacherPoint('finalReflection',3);w.endGame();
  assert.equal(d.getElementById('finalScore').textContent,'30');
  const saved=JSON.parse(w.localStorage.getItem(key));w.close();
  ({w,d}=app(saved));assert.equal(d.getElementById('endbox').classList.contains('hidden'),false);
  w.restart();d.getElementById('cancelReset').click();assert.equal(d.getElementById('finalScore').textContent,'30');
  d.querySelector('[data-go="2"]').click();w.teacherPoint('oral2',2);assert.equal(d.getElementById('score').textContent,'28');
  w.endGame();assert.equal(d.getElementById('endbox').classList.contains('hidden'),true);
  w.localStorage.setItem('other-lesson', 'keep');
  w.restart();w.confirmReset();
  assert.equal(d.getElementById('score').textContent,'0');
  assert.equal(d.getElementById('hero').classList.contains('hidden'),false);
  assert.equal(d.getElementById('matchfb').textContent,'');
  assert.equal(w.localStorage.getItem('other-lesson'),'keep');
  w.close();
});
