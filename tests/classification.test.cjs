const test = require('node:test');
const assert = require('node:assert/strict');
const { product } = require('../catalogue.cjs');
const rules = require('../assets/catalogue-rules.js');

const item = overrides => ({
  item_no: 'BC-123', name: 'Maize flour 2kg', price: 200, stock: 50,
  category: 'FOODSTUFFS', item_category_code: 'RETAIL',
  requires_rx: false, age_restricted: false, ...overrides,
});

test('normalizes BC codes and retains the app pharmacy category mapping', () => {
  for (const [group, cat] of [
    ['GENERAL', 'Medicines'], ['CHRONIC', 'Chronic care'],
    ['CONTROLLED', 'Prescription medicines'], ['OVER THE COUNTER', 'Medicines'],
    ['SUPPLEMENT', 'Vitamins'], ['COSMETICS & BEAUTY P', 'Skin care'],
  ]) {
    const p = product(item({ category: ` ${group.toLowerCase()} `, item_category_code: ' otc ' }));
    assert.equal(p.div, 'Pharmacy');
    assert.equal(p.cat, cat);
  }
  assert.equal(product(item({ item_category_code: ' deli ' })).div, 'Deli');
  assert.equal(product(item({ item_category_code: ' wholesale ' })).div, 'Wholesale');
  assert.equal(product(item({ category: ' wines & spirits ' })).div, 'Liquor');
  assert.equal(product(item({ category: 'CLOTHING' })).cat, 'General merchandise');
});

test('obvious bulk names qualify, but pack size and quantity alone never invent eligibility', () => {
  for (const name of ['Flour bale', 'Oil cartons', 'Case of juice', 'Rice sacks', 'Bulk pack of tissue', 'Wholesale sugar']) {
    assert.equal(product(item({ name })).div, 'Wholesale', name);
  }
  for (const name of ['Rice 25kg', 'Rice 50kg', 'Casein protein 500g', 'Sackville bread', 'Tablets 6 pack']) {
    const p = product(item({ name }));
    assert.equal(p.div, 'Retail', name);
    assert.equal(p.tiers, undefined);
    assert.equal(rules.unitPrice(p, 6), 200);
    assert.equal(rules.unitPrice(p, 100), 200);
  }
});

test('authoritative division and category override hints without removing safety flags', () => {
  const retail = product(item({ name: 'Rice sack', website_division: 'Retail', website_category: 'Rice' }));
  assert.equal(retail.div, 'Retail');
  assert.equal(retail.cat, 'Rice');
  assert.equal(retail.classificationSource, 'shared-catalogue');
  const rx = product(item({ requires_rx: true, website_division: 'Wholesale' }));
  assert.equal(rx.div, 'Pharmacy');
  assert.equal(rx.rx, true);
  const alcohol = product(item({ age_restricted: true, website_division: 'Retail' }));
  assert.equal(alcohol.div, 'Liquor');
  assert.equal(alcohol.age, true);
  const pharmacy = product(item({ category: 'GENERAL', requires_rx: null, item_category_code: 'PHARMACY', website_division: 'Retail' }));
  assert.equal(pharmacy.rx, true);
  assert.equal(pharmacy.div, 'Pharmacy');
  assert.throws(() => product(item({ website_division: 'Unknown' })), /invalid website division/);
  assert.throws(() => product(item({ website_category: 7 })), /invalid website category/);
});

test('verified six-unit tiers cross-list the same item and price exactly at each threshold', () => {
  const p = product(item({ selling_unit: 'PCS', wholesale_tiers: [
    { min_quantity: 12, unit_price: 160 },
    { min_quantity: 6, unit_price: 180 },
  ] }));
  assert.equal(p.id, 'BC-123');
  assert.equal(p.div, 'Retail');
  assert.deepEqual(p.divisions, ['Retail', 'Wholesale']);
  assert.equal(p.categories.Wholesale, 'Bulk staples');
  assert.deepEqual(p.tiers.map(t => t.min), [1, 6, 12]);
  assert.equal(rules.unitPrice(p, 5), 200);
  assert.equal(rules.unitPrice(p, 6), 180);
  assert.equal(rules.unitPrice(p, 11), 180);
  assert.equal(rules.unitPrice(p, 12), 160);
  assert.equal(rules.unitPrice(p, 5), 200); // Quantity decreases restore standard pricing.
  assert.equal(rules.activeTier(p, 6), 1);
  assert.equal(rules.inDivision(p, 'Wholesale'), true);
  assert.equal(rules.inCategory(p, 'Wholesale', 'Bulk staples'), true);
  assert.equal(rules.inCategory(p, 'All', 'Bulk staples'), true);
  assert.equal(rules.inCategory(p, 'Retail', 'Bulk staples'), false);
  assert.equal(rules.category(p, 'Retail'), 'Staples');
  assert.equal(rules.category(p, 'Wholesale'), 'Bulk staples');
  const cart = { [p.id]: 6 };
  assert.equal(Object.keys(cart).length, 1);
  assert.equal(rules.unitPrice(p, cart[p.id]) * cart[p.id], 1080);
});

test('any number of numeric thresholds works; no tier-label parsing or fixed discount quantities', () => {
  const p = product(item({ selling_unit: 'PCS', wholesale_tiers: [{ min_quantity: 7, unit_price: 150 }] }));
  assert.equal(p.tiers.length, 2);
  assert.equal(rules.unitPrice(p, 6), 200);
  assert.equal(rules.unitPrice(p, 7), 150);
  assert.equal(rules.activeTier(p, 7), 1);
  assert.equal(rules.unitPrice(p, 0), 200);
});

test('invalid or contradictory prices fail explicitly, never fabricate discounts', () => {
  for (const wholesale_tiers of [
    '6 for 100', [null], [{ min_quantity: 1, unit_price: 100 }],
    [{ min_quantity: 6.5, unit_price: 100 }],
    [{ min_quantity: 6, unit_price: 0 }],
    [{ min_quantity: 6, unit_price: '100' }],
    [{ min_quantity: 6, unit_price: 200 }],
    [{ min_quantity: 6, unit_price: 300 }],
    [{ min_quantity: 6, unit_price: 100 }, { min_quantity: 6, unit_price: 90 }],
    [{ min_quantity: 6, unit_price: 100 }, { min_quantity: 12, unit_price: 150 }],
  ]) assert.throws(() => product(item({ wholesale_tiers })), /wholesale tiers/);
  assert.equal(product(item({ wholesale_tiers: [] })).tiers, undefined);
  assert.equal(product(item({ wholesale_tiers: null })).tiers, undefined);
});

test('quantity pricing never clears Rx or age restrictions on a Wholesale shelf', () => {
  const wholesale_tiers = [{ min_quantity: 6, unit_price: 180 }];
  for (const overrides of [{ requires_rx: true }, { age_restricted: true }]) {
    const p = product(item({ ...overrides, selling_unit: 'PCS', wholesale_tiers }));
    assert.equal(rules.inDivision(p, 'Wholesale'), true);
    assert.equal(p.rx, !!overrides.requires_rx);
    assert.equal(p.age, !!overrides.age_restricted);
  }
});
