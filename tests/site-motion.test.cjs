const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/site-motion.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../assets/site-motion.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

function setup({ reduced = false, io = true, matchMedia = true } = {}) {
  const listeners = {};
  const animations = new Set();
  const observed = new Set();
  let callback;
  let change;
  const media = { matches: reduced, addEventListener(type, fn) { change = fn; } };
  const window = {};
  if (matchMedia) window.matchMedia = () => media;
  if (io) window.IntersectionObserver = class {
    constructor(fn) { callback = fn; }
    observe(el) { observed.add(el); }
    unobserve(el) { observed.delete(el); }
    disconnect() { observed.clear(); }
  };
  const document = {
    querySelectorAll: selector => selector === '.motion-enter' ? [...animations] : [],
    addEventListener: (type, fn) => { listeners[type] = fn; },
  };
  vm.runInNewContext(source, { window, document, Set, Map, WeakSet });
  const card = id => {
    const styles = new Map();
    const element = {
      dataset: { motionProduct: id }, isConnected: true,
      style: { setProperty: (key, val) => styles.set(key, val), removeProperty: key => styles.delete(key) },
      classList: { add: () => animations.add(element), remove: () => animations.delete(element) },
      styles,
    };
    return element;
  };
  return {
    card, observed, animations,
    register: cards => window.XanaMotion.registerGrid({ querySelectorAll: () => cards }),
    enter: cards => callback(cards.map(target => ({ target, isIntersecting: true }))),
    reduce: value => { media.matches = value; change(); },
    finish: element => listeners.animationend({ animationName: 'siteEnter', target: element }),
  };
}

test('SKU entrances survive basket DOM rebuilds, refresh, filtering and sorting without replay', () => {
  const app = setup();
  const first = app.card('sku-17');
  app.register([first]);
  app.enter([first]);
  assert.ok(app.animations.has(first));
  app.finish(first);
  assert.equal(app.animations.size, 0);
  const refreshed = app.card('sku-17');
  app.register([refreshed]);
  assert.equal(app.observed.size, 0);
  assert.equal(app.animations.size, 0);
  app.register([]);
  app.register([app.card('sku-17')]);
  assert.equal(app.observed.size, 0);
});

test('new cards enter once, stagger is capped, and detached pending cards are released', () => {
  const app = setup();
  const old = app.card('offscreen');
  app.register([old]);
  const cards = Array.from({ length: 12 }, (_, i) => app.card(`new-${i}`));
  app.register(cards);
  assert.ok(!app.observed.has(old));
  app.enter(cards);
  assert.equal(app.observed.size, 0);
  assert.equal(cards[0].styles.get('--motion-delay'), '0ms');
  assert.equal(cards[11].styles.get('--motion-delay'), '96ms');
  assert.equal(app.animations.size, 12);
});

test('runtime reduced motion cancels entrances and does not replay when re-enabled', () => {
  const app = setup();
  const active = app.card('active');
  const pending = app.card('pending');
  app.register([active, pending]);
  app.enter([active]);
  app.reduce(true);
  assert.equal(app.animations.size, 0);
  assert.equal(app.observed.size, 0);
  app.reduce(false);
  app.register([app.card('active'), app.card('pending')]);
  assert.equal(app.observed.size, 0);
});

test('missing observer/media APIs and initial reduced motion fail open without animation', () => {
  for (const options of [{ io: false }, { matchMedia: false }, { reduced: true }]) {
    const app = setup(options);
    assert.doesNotThrow(() => app.register([app.card('available')]));
    assert.equal(app.animations.size, 0);
    assert.equal(app.observed.size, 0);
  }
});

test('motion adds no hidden content, image transforms, delay timers or scroll listeners', () => {
  assert.doesNotMatch(source, /setTimeout|requestAnimationFrame|addEventListener\(['"]scroll/);
  assert.doesNotMatch(css, /opacity:\s*0[;} ]|visibility:\s*hidden|pointer-events:\s*none|img\s*\{/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(html, /card\.dataset\.motionProduct=String\(p\.id\)/);
  assert.equal((html.match(/behavior:'smooth'/g) || []).length, 0);
});
