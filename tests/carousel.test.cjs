const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const configuration = html.slice(html.indexOf('const PROMOS ='), html.indexOf('/* ad rules,'));
const controller = html.slice(html.indexOf('let adIndex='), html.indexOf('function renderAdCarousel(){'));

function carousel() {
  const timers = new Map();
  let id = 0;
  const slides = Array.from({ length: 4 }, () => ({
    setAttribute(key, value) { this[key] = value; },
  }));
  const elements = new Map();
  const $ = key => {
    if (!elements.has(key)) elements.set(key, {
      style: { setProperty() {} }, dataset: {},
      classList: { add() {}, remove() {} },
      setAttribute(name, value) { this[name] = value; },
    });
    return elements.get(key);
  };
  const context = vm.createContext({
    $, document: { hidden: false, querySelectorAll: selector => selector.includes('.offer-slide') ? slides : [] },
    reduced: false,
    matchMedia: () => ({ matches: context.reduced }),
    setTimeout: (fn, delay) => { timers.set(++id, { fn, delay }); return id; },
    clearTimeout: timer => timers.delete(timer),
    renderOfferBar() {},
    goShop: division => { context.destination = division; },
    openClinic() {}, openRx() {}, promoAdd() {},
  });
  vm.runInContext(configuration + controller, context);
  return {
    run: source => vm.runInContext(source, context), context, timers, slides,
    next() {
      assert.equal(timers.size, 1);
      const [key, timer] = [...timers][0];
      timers.delete(key);
      assert.equal(timer.delay, 3000);
      timer.fn();
    },
  };
}

test('four genuine browsing/service slides continuously loop every three seconds', () => {
  const app = carousel();
  assert.equal(app.run('PROMOS.ads.length'), 4);
  assert.equal(app.run('PROMOS.ads.some(a=>a.sku)'), false);
  app.run('adGoTo(0);adTick()');
  for (let i = 1; i <= 9; i++) {
    app.next();
    assert.equal(app.run('adIndex'), i % 4);
    assert.equal(app.timers.size, 1);
  }
});

test('hover, focus, explicit pause, hidden tabs and reduced motion pause safely', () => {
  const app = carousel();
  for (const flag of ['adHover', 'adFocus', 'adUserPaused', 'document.hidden', '!adInView', 'reduced']) {
    const target = flag.startsWith('!') ? flag.slice(1) : flag;
    const pausedValue = flag.startsWith('!') ? false : true;
    app.run(`${target}=${pausedValue};adTick()`);
    assert.equal(app.timers.size, 0);
    app.run(`${target}=${!pausedValue};adTick()`);
    assert.equal(app.timers.size, 1);
  }
});

test('manual navigation wraps and hides inactive slide controls from keyboard navigation', () => {
  const app = carousel();
  app.run('adGoTo(-1)');
  assert.equal(app.run('adIndex'), 3);
  assert.equal(app.slides[0].inert, true);
  assert.equal(app.slides[3].inert, false);
  assert.equal(app.slides[3]['aria-hidden'], 'false');
  app.run('adGoTo(4)');
  assert.equal(app.run('adIndex'), 0);
});

test('browsing slide buttons route to their matching department', () => {
  const app = carousel();
  for (const division of ['Pharmacy', 'Retail', 'Wholesale']) {
    app.run(`adAct(PROMOS.ads.find(a=>a.division==='${division}'))`);
    assert.equal(app.context.destination, division);
  }
});
