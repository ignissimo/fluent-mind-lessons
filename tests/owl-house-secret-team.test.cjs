const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const key = 'owl13progress-v1';
function app(entries = {}, blocked = false) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', e => errors.push(e.message));
  const w = new JSDOM(fs.readFileSync('owl-house-secret-team/index.html', 'utf8'), {
    url: 'https://lessons.example', runScripts: 'dangerously', virtualConsole,
    beforeParse(w) {
      w.scrollTo = () => {};
      for (const [k, v] of Object.entries(entries)) w.localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      if (blocked) Object.defineProperty(w, 'localStorage', { get() { throw Error('blocked'); } });
    }
  }).window;
  return { w, d: w.document, errors };
}
function write(w, id, text) {
  const field = w.document.getElementById(id);
  field.value = text;
  field.dispatchEvent(new w.Event('input', { bubbles: true }));
}
function pair(w, i) {
  const d = w.document;
  d.querySelector(`[data-side="w"][data-i="${i}"]`).click();
  d.querySelector(`[data-side="d"][data-i="${i}"]`).click();
}
test('Secret Team preserves matches and grammar through navigation, shuffle, and reload', () => {
  let { w, d } = app();
  w.choose('hunter');
  w.go(3);
  pair(w, 0);
  w.go(4);
  d.querySelector('#grammar .quizrow button').click();
  w.go(3);
  assert.equal(d.querySelectorAll('.done').length, 2);
  w.resetMatch();
  assert.equal(d.querySelectorAll('.done').length, 2);
  const saved = JSON.parse(w.localStorage.getItem(key));
  w.close();
  ({ w, d } = app({ [key]: saved }));
  assert.equal(d.querySelector('.screen.active').id, 's3');
  assert.equal(d.querySelectorAll('.done').length, 2);
  w.go(4);
  assert.match(d.getElementById('g0').textContent, /Correct/);
  w.close();
});
test('Secret Team imports legacy writing, keeps routes separate and rejects invalid routes', () => {
  const { w, d, errors } = app({ owl13route: 'hunter', owl13short_hunter: 'Hunter draft', owl13final_azura: 'Azura draft' });
  w.go(2);
  assert.equal(d.getElementById('shortWrite').value, 'Hunter draft');
  write(w, 'shortWrite', 'Updated Hunter draft');
  w.choose('azura');
  assert.equal(d.getElementById('finalWrite').value, 'Azura draft');
  write(w, 'shortWrite', 'Luz draft');
  w.choose('hunter');
  assert.equal(d.getElementById('shortWrite').value, 'Updated Hunter draft');
  assert.deepEqual(errors, []);
  w.close();
  const invalid = app({ owl13route: 'missing', [key]: { route: 'invalid', screen: 4.5, matched: null, texts: null } });
  assert.deepEqual(invalid.errors, []);
  assert.equal(invalid.d.querySelector('.screen.active').id, 's0');
  invalid.w.close();
});
test('Secret Team works with blocked storage and reports unsaved progress', () => {
  const { w, d, errors } = app({}, true);
  w.choose('azura');
  w.go(2);
  write(w, 'shortWrite', 'This is my answer.');
  w.go(3);
  pair(w, 2);
  assert.equal(d.querySelectorAll('.done').length, 2);
  assert.match(d.getElementById('saveStatus').textContent, /could not save/i);
  assert.deepEqual(errors, []);
  w.close();
});
test('Secret Team requires a real prediction and restores a finished route with complete export', () => {
  let { w, d } = app();
  w.choose('azura');
  w.go(6);
  d.getElementById('finish').click();
  assert.equal(d.querySelector('.screen.active').id, 's6');
  assert.match(d.getElementById('finishStatus').textContent, /still/i);
  w.go(3);
  for (let i = 0; i < 8; i++) pair(w, i);
  w.go(4);
  [0, 1, 2].forEach((a, i) => d.querySelectorAll('#grammar .quizrow')[i].querySelectorAll('button')[a].click());
  w.go(2);
  write(w, 'shortWrite', 'The person was pretending to be the author.');
  w.go(5);
  write(w, 'finalWrite', 'I wanted to meet the author. We followed a stranger. She was Tinella. Tibbles had changed the photos. I felt surprised. I still like the books.');
  for (const stage of [0, 2, 3]) {
    w.go(stage);
    const field = d.querySelector(`#s${stage} [data-spoken]`);
    field.checked = true;
    field.dispatchEvent(new w.Event('change'));
  }
  w.go(6);
  d.querySelector('[data-prediction]').click();
  write(w, 'predictionWrite', 'I think Hunter might help his friends because he cares about them.');
  d.getElementById('finish').click();
  assert.equal(d.querySelector('.screen.active').id, 's7');
  assert.match(d.getElementById('s7').textContent, /3 \/ 3/);
  const saved = JSON.parse(w.localStorage.getItem(key));
  w.close();
  ({ w, d } = app({ [key]: saved }));
  assert.equal(d.querySelector('.screen.active').id, 's7');
  const report = w.report();
  for (const part of ['Fluent Mind Adventures', 'Luz & Amity', 'pretending to be the author', 'Hunter might help', 'because', '8 / 8']) assert.ok(report.includes(part), part);
  w.go(6);
  write(w, 'predictionWrite', '');
  d.getElementById('finish').click();
  assert.equal(d.querySelector('.screen.active').id, 's6');
  w.close();
});
test('Secret Team keeps a separate prediction draft for each question', () => {
  let { w, d } = app();
  assert.equal(d.getElementById('predictionWrite').disabled, true);
  w.choose('hunter');
  w.go(6);
  d.querySelector('[data-prediction="0"]').click();
  assert.equal(d.getElementById('predictionWrite').disabled, false);
  write(w, 'predictionWrite', 'Hunter might choose his friends.');
  d.querySelector('[data-prediction="1"]').click();
  assert.equal(d.getElementById('predictionWrite').value, '');
  write(w, 'predictionWrite', 'Willow might make a new plan.');
  d.querySelector('[data-prediction="0"]').click();
  assert.equal(d.getElementById('predictionWrite').value, 'Hunter might choose his friends.');
  const saved = JSON.parse(w.localStorage.getItem(key));
  w.close();
  ({ w, d } = app({ [key]: saved }));
  d.querySelector('[data-prediction="1"]').click();
  assert.equal(d.getElementById('predictionWrite').value, 'Willow might make a new plan.');
  w.close();
});
