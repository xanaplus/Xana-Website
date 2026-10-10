const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { product } = require('../catalogue.cjs');
const rules = require('../assets/catalogue-rules.js');
const { create } = require('../assets/basket-storage.js');

const item = overrides => ({
  item_no: 'BC-1', name: 'Blueband 500Gm Original Box 24 Pcs', price: 7000, stock: 5.5,
  category: 'BREADS & BREAD SPREA', item_category_code: 'RETAIL',
  requires_rx: false, age_restricted: false, ...overrides,
});

test('without a published selling unit nothing is parsed from the name and stock is whole units', () => {
  const p = product(item());
  assert.equal(p.unit, null);
  assert.ok(!('pack' in p));
  assert.equal(p.price, 7000);
  assert.equal(p.stock, 5);
  assert.equal(product(item({ stock: 0.5 })).stock, 0);
  assert.equal(product(item({ stock: -3 })).stock, 0);
  assert.equal(product(item({ stock: 2.9999999999 })).stock, 3);
  assert.equal(rules.unitName(p), '');
  assert.equal(rules.perUnit(p), 'per unit');
  assert.equal(rules.stockText(p), '5 in stock');
  assert.deepEqual(rules.conversions(p), []);
});

test('unit case: a piece-priced item says what one price buys', () => {
  const p = product(item({ name: 'Blueband Original 500G', price: 300, stock: 14, selling_unit: 'PCS', selling_unit_label: 'piece' }));
  assert.deepEqual(p.unit, { code: 'PCS', label: 'piece', conversions: [] });
  assert.equal(rules.perUnit(p), 'per piece');
  assert.equal(rules.stockText(p), '14 piece in stock');
});

test('pack case: box-priced item with BC conversions to pieces and cartons', () => {
  const p = product(item({
    selling_unit: 'BOX',
    unit_conversions: [
      { unit: 'BOX', qty_per_unit: 1 },
      { unit: 'PCS', qty_per_unit: 1 / 24 },
      { unit: 'CTN', qty_per_unit: 4 },
    ],
  }));
  assert.equal(p.unit.label, 'BOX');
  assert.equal(p.stock, 5); // 5.5 boxes on hand: only five whole boxes sell at the box price.
  assert.deepEqual(rules.conversions(p), ['24 PCS = 1 BOX', '1 CTN = 4 BOX']);
  assert.equal(rules.perUnit(p), 'per BOX');
});

test('weight case: per-kilogram price keeps whole-kilogram basket quantities', () => {
  const p = product(item({ item_no: 'FP0003', name: 'Tomatoes Per Kg', price: 99, stock: 724.36639, category: 'FRUITS AND VEGETABLE', selling_unit: 'KG', selling_unit_label: 'kg' }));
  assert.equal(p.stock, 724);
  assert.equal(rules.perUnit(p), 'per kg');
  assert.equal(rules.stockText(p), '724 kg in stock');
  assert.deepEqual(rules.conversions(product(item({ selling_unit: 'KG', unit_conversions: [{ unit: 'G', qty_per_unit: 0.001 }] }))), ['1000 G = 1 KG']);
});

test('quantity prices are labelled in the selling unit and require one', () => {
  const tiers = [{ min_quantity: 6, unit_price: 6500 }];
  const p = product(item({ selling_unit: 'BOX', wholesale_tiers: tiers }));
  assert.deepEqual(p.tiers.map(t => t.l), ['1–5 BOX', '6+ BOX']);
  assert.throws(() => product(item({ wholesale_tiers: tiers })), /require a selling unit/);
});

test('malformed selling-unit data fails instead of showing an ambiguous price', () => {
  for (const overrides of [
    { selling_unit: 7 },
    { selling_unit: '   ' },
    { selling_unit: '<b>BOX</b>' },
    { selling_unit: 'BOX', selling_unit_label: 12 },
    { selling_unit: 'BOX', unit_conversions: 'PCS=24' },
    { selling_unit: 'BOX', unit_conversions: [{ unit: 'PCS', qty_per_unit: 0 }] },
    { selling_unit: 'BOX', unit_conversions: [{ unit: 'PCS', qty_per_unit: '24' }] },
    { selling_unit: 'BOX', unit_conversions: [{ unit: 'PCS', qty_per_unit: 0.5 }, { unit: 'pcs', qty_per_unit: 0.25 }] },
    { selling_unit: 'BOX', unit_conversions: [{ unit: 'BOX', qty_per_unit: 2 }] },
  ]) assert.throws(() => product(item(overrides)), /selling unit/, JSON.stringify(overrides));
});

test('basket restore keeps whole selling units and names the unit when reducing', () => {
  const store = new Map([['xana.basket.v1', JSON.stringify([['BC-1', 9]])]]);
  const disk = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
  const p = product(item({ selling_unit: 'BOX' }));
  const result = create(() => disk).restore([p], false);
  assert.deepEqual(result.cart, { 'BC-1': 5 });
  assert.match(result.notices[0], /reduced to 5 BOX/);
});

test('storefront shows selling units on cards, details and basket, never name-derived packs', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const detail = fs.readFileSync('assets/product-detail.js', 'utf8');
  assert.ok(!/p\.pack|item\.pack/.test(html.slice(html.indexOf('let PRODUCTS = []'))));
  assert.ok(!/\.pack\b/.test(detail));
  assert.ok(html.includes("escapeHtml('Price '+perUnit(p))"));
  assert.match(html, /\$\{ksh\(u\)\} \$\{escapeHtml\(perUnit\(p\)\)\}/);

  function render(p) {
    const nodes = new Map();
    const node = sel => {
      if (!nodes.has(sel)) nodes.set(sel, { innerHTML: '', value: '1', setAttribute() {}, classList: { toggle() {} }, contains: () => false, querySelector: node, focus() {}, scrollIntoView() {} });
      return nodes.get(sel);
    };
    const window = { document: {}, location: { href: `https://x.test/?product=${p.id}` }, history: { pushState() {} }, addEventListener() {} };
    const context = vm.createContext({
      window, URL, module: undefined, catalogueStatus: 'ready', PRODUCTS: [p], state: { cart: {} },
      document: { title: '', activeElement: {}, body: node('body'), querySelector: s => s === '.modal.show' ? null : node(s), addEventListener() {} },
      prod: () => p, unitPrice: x => x.price, ksh: n => 'KSh ' + n, productImageMarkup: () => '', closeAll() {}, add() {}, loadCatalogue() {},
      escapeHtml: v => String(v ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`),
      unitName: rules.unitName, perUnit: rules.perUnit, stockText: rules.stockText, unitConversions: rules.conversions,
    });
    vm.runInContext(detail, context);
    window.XanaProductDetail.render();
    return node('#productDetail').innerHTML;
  }
  const boxed = render(product(item({ selling_unit: 'BOX', selling_unit_label: 'box', unit_conversions: [{ unit: 'PCS', qty_per_unit: 1 / 24 }] })));
  assert.match(boxed, /Price per box/);
  assert.match(boxed, /<dt>Selling unit<\/dt><dd>box \(BOX\)<\/dd>/);
  assert.match(boxed, /24 PCS = 1 box/);
  assert.match(boxed, /5 box in stock/);
  assert.match(boxed, /Quantity to add \(box\)/);
  const unknown = render(product(item()));
  assert.ok(!/Not yet published by Business Central|<dt>Selling unit/.test(unknown));
  assert.ok(!/24 Pcs<\/p>|Pack<\/dt>/.test(unknown));
});
