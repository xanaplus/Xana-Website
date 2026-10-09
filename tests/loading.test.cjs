const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const renderGrid = script.slice(script.indexOf('function renderGrid(){'), script.indexOf('function renderCatsDrawer(){'));

function render(status) {
  const elements = new Map();
  const $ = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      innerHTML: '', attributes: {},
      setAttribute(key, value) { this.attributes[key] = value; },
    });
    return elements.get(selector);
  };
  const retry = () => {};
  vm.runInNewContext(`${renderGrid};renderGrid();`, {
    $, catalogueStatus: status, filtered: () => [], loadCatalogue: retry,
  });
  return { $, retry };
}

test('initial load renders eight decorative skeleton cards with an accessible loading status', () => {
  const { $ } = render('loading');
  const grid = $('#grid');
  assert.equal((grid.innerHTML.match(/class="card skeleton-card"/g) || []).length, 8);
  assert.equal((grid.innerHTML.match(/aria-hidden="true"/g) || []).length, 8);
  assert.equal(grid.attributes['aria-busy'], 'true');
  assert.equal($('#resCount').textContent, 'Loading…');
  assert.equal($('#moreWrap').hidden, true);
  assert.ok(!grid.innerHTML.includes('<button'));
  assert.match(html, /id="resCount" role="status" aria-live="polite"/);
});

test('failed load clears skeleton state and keeps a working retry action', () => {
  const { $, retry } = render('error');
  assert.equal($('#grid').attributes['aria-busy'], 'false');
  assert.ok(!$('#grid').innerHTML.includes('skeleton-card'));
  assert.match($('#grid').innerHTML, /Live catalogue unavailable/);
  assert.equal($('#retryCatalogue').onclick, retry);
});

test('skeleton motion is disabled for reduced motion and page script parses', () => {
  assert.match(html, /@media\(prefers-reduced-motion:reduce\)\{\.skeleton-block\{animation:none\}\}/);
  assert.doesNotThrow(() => new vm.Script(script));
});
