const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { KEY, create } = require('../assets/basket-storage.js');
const rules = require('../assets/catalogue-rules.js');
const html = fs.readFileSync('index.html', 'utf8');
const inline = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function storage(raw = null) {
  const values = new Map(raw === null ? [] : [[KEY, raw]]);
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
}
const product = { id: '001 / A&B', name: 'Food', stock: 12, price: 150 };
test('refresh and reopen restore only item numbers and quantities, never other state', () => {
  const disk = storage();
  const basket = create(() => disk);
  basket.save({ [product.id]: 4 });
  assert.equal(disk.getItem(KEY), JSON.stringify([[product.id, 4]]));
  const restored = create(() => disk).restore([product], false);
  assert.deepEqual(restored.cart, { [product.id]: 4 });
  assert.equal(restored.hadItems, true);
  assert.equal(rules.unitPrice({ ...product, price: 200 }, restored.cart[product.id]), 200);
  basket.save({});
  assert.equal(disk.getItem(KEY), null);
  assert.deepEqual(create(() => disk).restore([product], false).cart, {});
});
test('stock, removed items, Rx, age, and unusable pricing are revalidated', () => {
  const disk = storage(JSON.stringify([['food', 9], ['gone', 1], ['rx', 1], ['age', 2], ['zero', 2], ['bad', 1]]));
  const products = [
    { ...product, id: 'food', stock: 2.9 },
    { ...product, id: 'rx', rx: true },
    { ...product, id: 'age', age: true },
    { ...product, id: 'zero', stock: 0 },
    { ...product, id: 'bad', price: null },
  ];
  const result = create(() => disk).restore(products, false);
  assert.deepEqual(result.cart, { food: 2 });
  assert.equal(result.notices.length, 6);
  assert.match(result.notices.join(' '), /prescription.*18 or over/);
  assert.deepEqual(JSON.parse(disk.getItem(KEY)), [['food', 2]]);
  const confirmed = create(() => storage('[["age",2]]')).restore(products, true);
  assert.deepEqual(confirmed.cart, { age: 2 });
});
test('malformed, duplicate, fractional, excessive and prototype entries cannot restore', () => {
  for (const raw of ['{broken', '{}', 'null']) {
    const basket = create(() => storage(raw));
    assert.match(basket.warning, /could not be read/);
    assert.deepEqual(basket.restore([product], false).cart, {});
  }
  const raw = JSON.stringify([['food', 2], ['food', 8], ['__proto__', 2], ['constructor', 1], ['x', -1], ['y', 1.5], ['z', Number.MAX_SAFE_INTEGER + 1], ['secret', 1, 'file'], null]);
  const result = create(() => storage(raw)).restore([{ ...product, id: 'food' }], false);
  assert.deepEqual(result.cart, { food: 2 });
  assert.match(result.warning, /invalid/);
});
test('blocked storage does not break in-memory basket or retry', () => {
  const basket = create(() => { throw new Error('denied'); });
  assert.match(basket.warning, /could not be read/);
  assert.doesNotThrow(() => basket.save({ [product.id]: 2 }));
  assert.deepEqual(basket.restore([product], false).cart, { [product.id]: 2 });
  assert.match(basket.warning, /could not be saved/);
});
test('real catalogue loader keeps saved entries through outage and retries with current prices', async () => {
  const disk = storage(JSON.stringify([[product.id, 8]]));
  const nodes = {};
  let fail = true;
  let products = [{ ...product, stock: 3, price: 220, div: 'Retail', cat: 'Food' }];
  const context = vm.createContext({
    savedBasket: create(() => disk), basketNotices: [], basketChecked: false,
    state: { cart: {}, age: false, div: 'All', cat: 'All' },
    PRODUCTS: [], catalogueStatus: 'loading', DIVS: [{ id: 'All' }, { id: 'Retail' }],
    CATS: { All: ['All'], Retail: ['All', 'Food'] },
    inDivision: rules.inDivision, productCategory: rules.category,
    $: selector => nodes[selector] ||= { classList: { contains: () => false } },
    renderGrid() {}, renderAll() {}, renderBasket() {}, toast() {},
    window: {}, console: { error() {} },
    fetch: async () => ({ ok: !fail, json: async () => ({ products }) }),
  });
  vm.runInContext(inline.slice(inline.indexOf('async function loadCatalogue(){'), inline.indexOf('/* =====================================================================\n   PROMO SLOTS')), context);
  await context.loadCatalogue();
  assert.equal(context.catalogueStatus, 'error');
  assert.deepEqual(JSON.parse(disk.getItem(KEY)), [[product.id, 8]]);
  assert.equal(Object.keys(context.state.cart).length, 0);
  fail = false;
  await context.loadCatalogue();
  assert.equal(context.state.cart[product.id], 3);
  assert.equal(rules.unitPrice(context.PRODUCTS[0], 3), 220);
  assert.match(context.basketNotices.join(' '), /reduced to 3/);
  fail = true;
  await context.loadCatalogue();
  assert.equal(Object.keys(context.state.cart).length, 0);
  assert.deepEqual(JSON.parse(disk.getItem(KEY)), [[product.id, 3]]);
  fail = false;
  products = [{ ...products[0], rx: true }];
  await context.loadCatalogue();
  assert.equal(Object.keys(context.state.cart).length, 0);
  assert.equal(disk.getItem(KEY), null);
});
test('actual add and decrement persist changes, including removing the final item', () => {
  const disk = storage();
  const context = vm.createContext({
    savedBasket: create(() => disk), state: { cart: {}, age: false },
    prod: () => product, window: {}, toast() {}, openRx() {}, openModal() {},
    renderAll() {}, renderBasket() {}, $: () => ({ classList: { contains: () => false } }),
  });
  vm.runInContext('function saveBasket(){ savedBasket.save(state.cart); }' +
    inline.slice(inline.indexOf('function add(id,d){'), inline.indexOf('let lastCount=0;')), context);
  context.add(product.id, 2);
  assert.deepEqual(JSON.parse(disk.getItem(KEY)), [[product.id, 2]]);
  context.add(product.id, -1);
  assert.deepEqual(JSON.parse(disk.getItem(KEY)), [[product.id, 1]]);
  context.add(product.id, -1);
  assert.equal(disk.getItem(KEY), null);
});
