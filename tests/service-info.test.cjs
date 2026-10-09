const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('index.html', 'utf8');
const detail = fs.readFileSync('assets/product-detail.js', 'utf8');

test('clinic and prescription dialogs explain limits without personal-data fields', () => {
  for (const id of ['rxModal', 'clinicModal']) {
    const section = html.slice(html.indexOf(`id="${id}"`), html.indexOf('</div></div>', html.indexOf(`id="${id}"`)));
    assert.match(section, /not available/);
    assert.match(section, /data-close>Close/);
    assert.doesNotMatch(section, /<input|<select|<form|type="file"/);
  }
  assert.doesNotMatch(html, /rxSubmit|clSubmit|clDate|rxFile|rxPhone|clPhone|Visit booked|SMS confirmation sent/);
  assert.doesNotMatch(html + detail, /Upload prescription|Uploading a prescription/);
});

test('delivery is not quoted or advertised as free in any area', () => {
  assert.doesNotMatch(html, /free delivery|delivery unlocked|reaches free delivery|del=sub|ksh\(tot\)/i);
  assert.match(html, /<span>Delivery<\/span><b>Not quoted<\/b>/);
  assert.match(html, /subtotal covers products only/);
  assert.match(html, /Delivery coverage, fees and a final order total are not confirmed/);
  assert.doesNotMatch(html, /Delivering to/);
});

test('business details shown are only the owner-confirmed ones', () => {
  assert.doesNotMatch(html, /PPB Lic|XN-2024|until 11pm|7am|open all night|Ruaka Bypass|Kitengela|Industrial Area|three branches/);
  for (const n of ['+254718666661', '+254718555559', '+254718555554', '+254142631157']) assert.match(html, new RegExp(`tel:\\${n}`));
  assert.match(html, /Syokimau/);
  assert.match(html, /close at 9pm/);
});

test('branch choice is remembered but does not claim branch stock', () => {
  const vm = require('node:vm');
  const start = html.indexOf("const BRANCHES=");
  const code = html.slice(start, html.indexOf('document.querySelectorAll(\'#bottomNav', start));
  const run = (storedValue) => {
    const store = new Map(storedValue == null ? [] : [['xana.branch', storedValue]]);
    const els = {};
    const el = () => ({ textContent: '', setAttribute(k, v) { this[k] = v; }, querySelectorAll: () => [] });
    const ctx = {
      state: { branch: null },
      $: (q) => (els[q] ||= el()),
      window: { localStorage: { getItem: (k) => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) } },
      openModal() {}, closeAll() {}, toast() {},
    };
    vm.runInNewContext(code, ctx);
    return { ctx, els, store };
  };
  const ok = run('Ruiru');
  assert.equal(ok.ctx.state.branch, 'Ruiru');
  assert.equal(ok.els['#locName'].textContent, 'Ruiru');
  const bad = run('Nairobi CBD');
  assert.equal(bad.ctx.state.branch, null);
  assert.equal(bad.store.has('xana.branch'), false);
  assert.match(html, /Choosing one does not confirm stock or prices at that branch/);
});
