const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { JSDOM } = require('jsdom');

const html = readFileSync('why-women-kill-episode-1/index.html', 'utf8');
const key = 'fluentmind-why-women-kill-s1e1-v1';

function open(saved, blocked = false) {
  return new JSDOM(html, {
    url: 'https://lesson.example/',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.scrollTo = () => {};
      if (saved) window.localStorage.setItem(key, saved);
      if (blocked) Object.defineProperty(window, 'localStorage', {
        get() { throw new Error('blocked'); }
      });
    }
  }).window;
}

test('restores round, selections, prediction position and notes', () => {
  let w = open();
  let d = w.document;
  d.querySelector('#flagArea .choice').click();
  d.querySelector('#predNext').click();
  d.querySelector('#predictionChoices button:nth-child(2)').click();
  d.querySelector('#adviceChoices button:nth-child(3)').click();
  d.querySelector('#nav button:nth-child(5)').click();
  d.querySelector('#notes').value = 'My example.';
  d.querySelector('#notes').dispatchEvent(new w.Event('input'));
  const saved = w.localStorage.getItem(key);
  w.close();

  w = open(saved);
  d = w.document;
  assert.equal(d.querySelector('.page.active').id, 'p4');
  assert.equal(d.querySelector('#notes').value, 'My example.');
  assert.equal(d.querySelector('#adviceChoices [aria-pressed=true]').textContent, 'Taylor');
  assert.equal(d.querySelector('#flagArea .help').hidden, false);
  assert.match(d.querySelector('#predictionCount').textContent, /2 \/ 4/);
  assert.equal(d.querySelector('#predictionChoices [aria-pressed=true]').textContent, 'Unlikely');
  w.close();
});

test('restart clears vocabulary reveals and saved responses only after confirmation', () => {
  const w = open();
  const d = w.document;
  d.querySelector('#vocab button').click();
  d.querySelector('#flagArea .choice').click();
  d.querySelector('#nav button:last-child').click();
  w.confirm = () => false;
  d.querySelector('#restart').click();
  assert.equal(d.querySelector('.page.active').id, 'p5');
  w.confirm = () => true;
  d.querySelector('#restart').click();
  assert.equal(d.querySelector('.page.active').id, 'p0');
  assert.equal(d.querySelector('#vocab button').getAttribute('aria-expanded'), 'false');
  assert.deepEqual(JSON.parse(w.localStorage.getItem(key)).flags, {});
  w.close();
});

test('corrupt or blocked storage leaves the speaking activities usable', () => {
  for (const w of [open('{broken'), open(null, true)]) {
    const d = w.document;
    d.querySelector('#nav button:nth-child(3)').click();
    d.querySelector('#flagArea .choice').click();
    assert.equal(d.querySelector('.page.active').id, 'p2');
    assert.equal(d.querySelector('#flagArea .help').hidden, false);
    w.close();
  }
});
