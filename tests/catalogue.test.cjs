const test = require('node:test');
const assert = require('node:assert/strict');

const { product } = require('../catalogue.cjs');

function item(overrides = {}) {
  return {
    item_no: 'OTC001',
    name: 'Example Tablets 20 tabs',
    price: 250,
    stock: 4,
    category: 'OVER THE COUNTER',
    item_category_code: 'PHARMACY',
    requires_rx: null,
    age_restricted: false,
    photo_url: null,
    last_direct_cost: 12,
    profit_percent: 10,
    ...overrides,
  };
}

test('maps customer-facing fields only and treats unknown pharmacy Rx status safely', () => {
  const mapped = product(item());
  assert.equal(mapped.div, 'Pharmacy');
  assert.equal(mapped.rx, true);
  assert.equal(mapped.price, 250);
  assert.equal(mapped.stock, 4);
  assert.equal(mapped.img, '');
  assert.ok(!('last_direct_cost' in mapped));
  assert.ok(!('profit_percent' in mapped));
  assert.equal(product(item({ price: 0 })), null);
});

test('liquor remains age-restricted and bulk items use actual unit prices without invented tiers', () => {
  const liquor = product(item({ item_no: 'WS001', name: 'Tusker Lager', category: 'WINES & SPIRITS', item_category_code: 'RETAIL', age_restricted: true, requires_rx: false }));
  assert.equal(liquor.div, 'Liquor');
  assert.equal(liquor.age, true);
  assert.equal(liquor.cat, 'Beer & cider');
  const bulk = product(item({ item_no: 'FS001', name: 'Maize Flour Bale 25kg', category: 'FOODSTUFFS', item_category_code: 'RETAIL', requires_rx: false }));
  assert.equal(bulk.div, 'Wholesale');
  assert.equal(bulk.price, 250);
  assert.ok(!('tiers' in bulk));
  const deli = product(item({ item_no: 'DEL001', category: 'MEAT PRODUCTS', item_category_code: 'DELI', requires_rx: false }));
  assert.equal(deli.div, 'Deli');
});

test('reads every page of the public view, shares a short cache, and rejects write methods', async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const previousFetch = global.fetch;
  try {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
    const calls = [];
    global.fetch = async (url, init) => {
      calls.push({ url: String(url), headers: init.headers });
      const from = Number(init.headers.Range.split('-')[0]);
      const rows = Array.from({ length: from ? 1 : 1000 }, (_, i) => item({
        item_no: `ITEM${from + i}`,
        item_category_code: 'RETAIL',
        category: 'BEVERAGES',
        requires_rx: false,
      }));
      return new Response(JSON.stringify(rows), { status: 206, headers: { 'content-range': `${from}-${from + rows.length - 1}/1001` } });
    };
    delete require.cache[require.resolve('../catalogue.cjs')];
    const { serveCatalogue } = require('../catalogue.cjs');
    function response() {
      return {
        writeHead(status, headers) { this.status = status; this.headers = headers; },
        end(body) { this.body = body; },
      };
    }
    const first = response();
    await serveCatalogue({ method: 'GET' }, first);
    assert.equal(first.status, 200);
    assert.equal(JSON.parse(first.body).products.length, 1001);
    assert.equal(calls.length, 2);
    assert.ok(calls.every(call => call.url.includes('/rest/v1/catalogue?')));
    assert.ok(calls.every(call => call.headers.apikey === 'sb_publishable_test'));
    const second = response();
    await serveCatalogue({ method: 'GET' }, second);
    assert.equal(second.status, 200);
    assert.equal(calls.length, 2);
    const write = response();
    await serveCatalogue({ method: 'POST' }, write);
    assert.equal(write.status, 405);
  } finally {
    global.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
    else process.env.SUPABASE_PUBLISHABLE_KEY = previousKey;
  }
});

test('never serves demo data or uses a service-role key if connection settings are wrong', async () => {
  const previousKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const previousUrl = process.env.SUPABASE_URL;
  const previousLog = console.error;
  try {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_secret_not_allowed';
    delete require.cache[require.resolve('../catalogue.cjs')];
    const { serveCatalogue } = require('../catalogue.cjs');
    const response = {
      writeHead(status) { this.status = status; },
      end(body) { this.body = body; },
    };
    console.error = () => {};
    await serveCatalogue({ method: 'GET' }, response);
    assert.equal(response.status, 503);
    assert.equal(JSON.parse(response.body).error, 'Live catalogue unavailable');
    assert.ok(!response.body.includes('products'));
  } finally {
    console.error = previousLog;
    if (previousKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
    else process.env.SUPABASE_PUBLISHABLE_KEY = previousKey;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
  }
});
