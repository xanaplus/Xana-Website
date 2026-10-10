const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { readProduct, productUrl, available, clampQuantity, viewStatus } = require('../assets/product-detail.js');
const source = fs.readFileSync('assets/product-detail.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const rules = require('../assets/catalogue-rules.js');
const unitHelpers = { unitName: rules.unitName, perUnit: rules.perUnit, stockText: rules.stockText, unitConversions: rules.conversions };
const inline = html.match(/<script>([\s\S]*?)<\/script>/)[1];

test('query URLs round-trip special item numbers, retain unrelated params and omit hash', () => {
  const id = '001 / A&B+#?';
  const url = productUrl('https://shop.example/?area=Ruaka#old', id);
  assert.equal(readProduct(url), id);
  assert.match(url, /^\/\?area=Ruaka&product=/);
  assert.equal(productUrl(url, null), '/?area=Ruaka');
  assert.equal(readProduct('/'), null);
  assert.equal(readProduct('/?product='), '');
});
test('quantity validation uses actual integer stock minus the basket', () => {
  assert.equal(available(7, 3), 4);
  assert.equal(available(2, 5), 0);
  assert.equal(available(-2, 0), 0);
  assert.equal(clampQuantity('9', 4), 4);
  assert.equal(clampQuantity('-2', 4), 1);
  assert.equal(clampQuantity('2.8', 4), 2);
  assert.equal(clampQuantity('bad', 4), 1);
  assert.equal(clampQuantity(1, 0), 0);
});
test('detail statuses distinguish loading, error and catalogue absence', () => {
  assert.equal(viewStatus('loading'), 'loading');
  assert.equal(viewStatus('error'), 'error');
  assert.equal(viewStatus('ready'), 'not-found');
  assert.equal(viewStatus('ready', {}), 'ready');
});

function page(status = 'ready', products = [{ id: 'A&B', name: '<Unsafe>', div: 'Retail', cat: 'Household', stock: 7, price: 87.5, pack: '1 pack' }]) {
  const events = {};
  const nodes = new Map();
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, {
      id: selector.slice(1), innerHTML: '', value: '1', attributes: {}, hidden: false,
      setAttribute(k, v) { this.attributes[k] = v; },
      classList: { toggle() {}, contains() { return false; } },
      contains() { return false; },
      querySelector: node, focus() { this.focused = true; }, scrollIntoView() {},
    });
    return nodes.get(selector);
  }
  const location = { href: 'https://shop.example/?product=A%26B' };
  const pushes = [];
  const window = {
    document: {}, location,
    history: { pushState(_s, _t, url) { pushes.push(url); location.href = new URL(url, location.href).href; } },
    addEventListener(type, callback) { events[type] = callback; },
  };
  const document = {
    title: 'Xana', activeElement: {}, body: node('body'),
    querySelector: selector => selector === '.modal.show' ? null : node(selector),
    addEventListener() {},
  };
  const calls = [];
  const context = vm.createContext({
    window, document, URL, module: undefined, catalogueStatus: status, PRODUCTS: products,
    state: { cart: {}, q: '' }, prod: id => products.find(p => p.id === id),
    ...unitHelpers, unitPrice: p => p.price, ksh: n => 'KSh ' + n,
    escapeHtml: value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]),
    productImageMarkup: () => '', closeAll() {},
    add: (...args) => calls.push(args), loadCatalogue() {},
  });
  vm.runInContext(source, context);
  window.XanaProductDetail.render();
  return { context, window, events, node, location, pushes, calls };
}
test('reload/deep link renders loading, retryable error, not-found and escaped factual content', () => {
  const loading = page('loading');
  assert.match(loading.node('#productDetail').innerHTML, /Checking live price and stock/);
  assert.equal(loading.node('#productDetail').attributes['aria-busy'], 'true');
  assert.match(page('error').node('#productDetail').innerHTML, /data-product-retry/);
  assert.match(page('ready', []).node('#productDetail').innerHTML, /Product not found/);
  const ready = page().node('#productDetail').innerHTML;
  assert.match(ready, /&lt;Unsafe&gt;/);
  assert.ok(!/Item number|<dt>Department|<dt>Category/.test(ready));
  assert.ok(!ready.includes('<Unsafe>'));
  assert.match(ready, /Checkout is disabled/);
});
test('browse pushes once; popstate restores detail without pushing another entry', () => {
  const app = page();
  app.window.XanaProductDetail.browse();
  assert.deepEqual(app.pushes, ['/']);
  assert.equal(app.node('#productDetail').hidden, true);
  app.window.XanaProductDetail.browse();
  assert.equal(app.pushes.length, 1);
  app.location.href = 'https://shop.example/?product=A%26B';
  app.events.popstate();
  assert.equal(app.node('#productDetail').hidden, false);
  assert.match(app.node('#productDetail').innerHTML, /&lt;Unsafe&gt;/);
  assert.equal(app.pushes.length, 1);
});
test('PDP return restores its home or All/All browsing origin without changing basket or safety state', () => {
  const home = require('../assets/home-catalogue.js');
  for (const browsing of [false,true]) {
    const app = page();
    Object.assign(app.context.state,{
      browsing,div:'All',cat:'All',q:'',sort:'rec',max:Infinity,
      inStock:false,brands:new Set(),age:true,cart:{'A&B':2},
    });
    let isHome;
    app.window.XanaHomeCatalogue=home;
    app.window.XanaHome={render(){
      isHome=home.isHome(app.context.state,new URL(app.location.href).searchParams.get('product'));
    }};
    app.window.XanaProductDetail.browse(true);
    assert.equal(isHome,!browsing);
    assert.equal(app.node(browsing ? '#catTitle' : '#homeTitle').focused,true);
    assert.equal(app.context.state.browsing,browsing);
    assert.equal(app.context.state.age,true);
    assert.equal(app.context.state.cart['A&B'],2);
    app.location.href='https://shop.example/?product=A%26B';
    app.events.popstate();
    assert.equal(isHome,false);
    app.location.href='https://shop.example/';
    app.events.popstate();
    assert.equal(isHome,!browsing);
  }
});
test('typing a quantity leaves the Add button intact so the first click works', () => {
  const app = page();
  const before = app.node('#productDetail').innerHTML;
  const addHandler = app.node('#pdAdd').onclick;
  app.node('#pdQuantity').value = '3';
  app.node('#pdQuantity').onchange({ target: app.node('#pdQuantity') });
  assert.equal(app.node('#productDetail').innerHTML, before);
  assert.equal(app.node('#pdAdd').onclick, addHandler);
  app.node('#pdAdd').onclick();
  assert.deepEqual(app.calls, [['A&B', 3]]);
});

test('detail purchase re-reads stock and basket, and refreshed detail clamps quantity', () => {
  const app = page();
  app.node('#pdQuantity').value = '6';
  app.context.state.cart['A&B'] = 5;
  app.node('#pdAdd').onclick();
  assert.deepEqual(app.calls, [['A&B', 2]]);
  app.context.PRODUCTS[0].stock = 0;
  app.node('#pdAdd').onclick();
  assert.equal(app.calls.length, 1);
  assert.match(app.node('#productDetail').innerHTML, /Out of stock/);
});

function commerce(product) {
  const notices = [], modals = [];
  const state = { cart: {}, age: false };
  const window = {};
  const context = vm.createContext({
    ...unitHelpers, prod: () => product, state, window,
    toast: text => notices.push(text), openRx: () => modals.push('rx'),
    openModal: text => modals.push(text), renderAll() {}, renderBasket() {},
    saveBasket() {},
    $: () => ({ classList: { contains: () => false } }),
  });
  vm.runInContext(inline.slice(inline.indexOf('function add(id,d){'), inline.indexOf('let lastCount=0;')), context);
  return { add: context.add, state, window, notices, modals, context };
}
test('prescription action and age confirmation do not claim basket success', () => {
  const rx = commerce({ id: 'rx', name: 'Medicine', stock: 8, rx: true });
  assert.equal(rx.add('rx', 3), false);
  assert.deepEqual(rx.modals, ['rx']);
  assert.deepEqual(rx.state.cart, {});
  assert.equal(rx.notices.length, 0);
  const age = commerce({ id: 'age', name: 'Liquor', stock: 8, age: true });
  assert.equal(age.add('age', 3), false);
  assert.equal(age.window._pendingAddQty, 3);
  assert.equal(age.notices.length, 0);
  age.state.age = true;
  assert.equal(age.add('age', age.window._pendingAddQty), true);
  assert.equal(age.state.cart.age, 3);
});
test('stock changes during age confirmation cannot exceed current availability', () => {
  const p = { id: 'age', stock: 8, age: true };
  const app = commerce(p);
  app.add('age', 5);
  p.stock = 2;
  app.state.age = true;
  assert.equal(app.add('age', app.window._pendingAddQty), false);
  assert.deepEqual(app.state.cart, {});
  assert.equal(app.notices.length, 1);
});
test('actual age confirmation preserves requested quantity before dismissal clears pending state', () => {
  const app = commerce({ id: 'age', name: 'Liquor', stock: 8, age: true });
  const nodes = {};
  app.context.$ = selector => nodes[selector] ||= { classList: { remove() {}, contains: () => false }, scrollIntoView() {} };
  app.context.document = { querySelectorAll: () => [] };
  app.context.resetVisible = () => {};
  app.context.adOff = () => true;
  vm.runInContext(inline.slice(inline.indexOf('function closeAll('), inline.indexOf('function toast(')), app.context);
  vm.runInContext(inline.slice(inline.indexOf("$('#ageYes').onclick="), inline.indexOf('/* "Ask a pharmacist"')), app.context);
  app.add('age', 3);
  nodes['#ageYes'].onclick();
  assert.equal(app.state.cart.age, 3);
  assert.equal(app.window._pendingAdd, null);
  assert.equal(app.window._pendingAddQty, null);
  app.state.age = false;
  app.add('age', 2);
  app.context.closeAll();
  nodes['#ageYes'].onclick();
  assert.equal(app.state.cart.age, 3);
});
test('inline and detail scripts parse; image/name navigation remains separate from purchase', () => {
  assert.doesNotThrow(() => new vm.Script(inline));
  assert.doesNotThrow(() => new vm.Script(source));
  assert.match(html, /<a class="pname" data-product-link/);
  assert.match(html, /<a data-product-link href=/);
  assert.match(source, /detail: true/);
});
