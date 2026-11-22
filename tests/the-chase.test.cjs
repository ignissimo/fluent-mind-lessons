const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const key = 'mark-the-chase-v1';
function app(saved, blocked = false) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(fs.readFileSync('the-chase/index.html', 'utf8'), {
    url: 'https://lesson.example', runScripts: 'dangerously', virtualConsole: console,
    beforeParse(w) {
      w.scrollTo = () => {};
      if (saved !== undefined) w.localStorage.setItem(key, JSON.stringify(saved));
      if (blocked) Object.defineProperty(w, 'localStorage', { get() { throw Error('Blocked'); } });
    }
  });
  return { w: dom.window, d: dom.window.document, errors };
}
function input(w, id, text) {
  const el = w.document.getElementById(id);
  el.value = text;
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
}
test('Chase restores usable legacy drafts and recovers from malformed saved fields', () => {
  for (const saved of [
    { page: 1.5, answers: null, text: { remember: 'My old draft.' } },
    { page: 99, answers: { 's-0': 0, 'g-0': 88 }, text: null },
    { page: '2', answers: [], text: { w1: 'I think Toph is right.', w2: {} } }
  ]) {
    const { w, d, errors } = app(saved);
    assert.deepEqual(errors, []);
    assert.equal(d.querySelectorAll('[data-page]:not(.hidden)').length, 1);
    assert.equal(d.querySelector('[data-page]:not(.hidden)').dataset.page, '0');
    if (saved.text?.remember) assert.equal(d.getElementById('remember').value, saved.text.remember);
    if (saved.text?.w1) assert.equal(d.getElementById('w1').value, saved.text.w1);
    d.querySelector('[data-quiz="s"][data-i="0"][data-j="0"]').click();
    assert.match(d.getElementById('s-f-0').textContent, /Correct/);
    w.close();
  }
});
test('Chase can be used when storage is blocked and reports the save failure', () => {
  const { w, d, errors } = app(undefined, true);
  d.getElementById('next').click();
  input(w, 'fix1', 'I think Toph is a good earthbender.');
  d.querySelector('[data-quiz="g"][data-i="0"][data-j="0"]').click();
  assert.match(d.getElementById('g-f-0').textContent, /Correct/);
  assert.match(d.getElementById('saveStatus').textContent, /could not save/i);
  assert.deepEqual(errors, []);
  w.close();
});
test('Chase finish checks participation, restores the result, and exports quiz answers and drafts', async () => {
  let { w, d } = app();
  for (let i = 0; i < 4; i++) d.getElementById('next').click();
  d.getElementById('next').click();
  assert.equal(d.querySelector('[data-page="4"]').classList.contains('hidden'), false);
  assert.match(d.getElementById('finishStatus').textContent, /still/i);
  const correct = { s: [0, 0, 1], g: [0, 1, 0, 1, 0, 1], r: [0, 0], c: [1, 2, 0] };
  for (const [prefix, answers] of Object.entries(correct)) answers.forEach((answer, i) => {
    d.querySelector(`[data-quiz="${prefix}"][data-i="${i}"][data-j="${answer}"]`).click();
  });
  d.querySelector('[data-quiz="g"][data-i="0"][data-j="1"]').click();
  d.querySelectorAll('[data-save]').forEach(el => input(w, el.id, `My draft for ${el.id}.`));
  d.querySelectorAll('[data-spoken]').forEach(el => {
    el.checked = true;
    el.dispatchEvent(new w.Event('change'));
  });
  d.getElementById('next').click();
  assert.equal(d.getElementById('result').hidden, false);
  assert.match(d.getElementById('result').textContent, /13 \/ 14/);
  let saved = JSON.parse(w.localStorage.getItem(key));
  w.close();
  ({ w, d } = app(saved));
  assert.equal(d.getElementById('result').hidden, false);
  let report;
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async text => { report = text; } } });
  d.getElementById('copyResult').click();
  await Promise.resolve();
  assert.match(report, /Fluent Mind Adventures/);
  assert.match(report, /I ___ Toph is right/);
  assert.match(report, /am thinking/);
  assert.match(report, /My draft for w4/);
  d.getElementById('back').click();
  assert.equal(d.getElementById('w4').value, 'My draft for w4.');
  input(w, 'w4', '');
  d.getElementById('next').click();
  assert.equal(d.getElementById('result').hidden, true);
  saved = JSON.parse(w.localStorage.getItem(key));
  assert.equal(saved.finished, false);
  w.close();
});
