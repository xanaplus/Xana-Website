const test = require('node:test');
const assert = require('node:assert/strict');

function response() {
  return {
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(body) { this.body = body; },
  };
}

async function withCatalogue(fetcher, check) {
  const oldFetch = global.fetch;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const oldLog = console.error;
  try {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
    global.fetch = fetcher;
    console.error = () => {};
    delete require.cache[require.resolve('../catalogue.cjs')];
    await check(require('../catalogue.cjs').serveCatalogue);
  } finally {
    global.fetch = oldFetch;
    console.error = oldLog;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
    else process.env.SUPABASE_PUBLISHABLE_KEY = oldKey;
  }
}

const row = {
  item_no: 'BC1', name: 'Cooking oil carton', price: 500, stock: 60,
  category: 'COOKING OILS & FATS', item_category_code: 'RETAIL', requires_rx: false,
};
const page = rows => new Response(JSON.stringify(rows), { status: 206, headers: { 'content-range': `0-${rows.length - 1}/${rows.length}` } });

test('old public view uses explicit compatibility path without fake tiers or private queries', async () => {
  const selects = [];
  await withCatalogue(async url => {
    const u = new URL(url);
    assert.equal(u.pathname, '/rest/v1/catalogue');
    const select = u.searchParams.get('select');
    selects.push(select);
    assert.ok(!select.includes('*'));
    assert.ok(!select.includes('last_direct_cost'));
    if (select.includes('website_division')) {
      return new Response(JSON.stringify({ code: '42703', message: 'column catalogue.website_division does not exist' }), { status: 400 });
    }
    return page([row]);
  }, async serve => {
    const res = response();
    await serve({ method: 'GET' }, res);
    assert.equal(res.status, 200);
    const data = JSON.parse(res.body);
    assert.equal(data.classificationFieldsAvailable, false);
    assert.equal(data.quantityPricedProducts, 0);
    assert.equal(data.products[0].div, 'Wholesale');
    assert.equal(data.products[0].price, 500);
    assert.equal(data.products[0].tiers, undefined);
    assert.equal(selects.length, 2);
  });
});

test('published public classifications and tiers are consumed end to end', async () => {
  await withCatalogue(async () => page([{
    ...row, website_division: 'Retail', website_category: 'Cooking',
    wholesale_tiers: [{ min_quantity: 6, unit_price: 450 }],
  }]), async serve => {
    const res = response();
    await serve({ method: 'GET' }, res);
    assert.equal(res.status, 200);
    const data = JSON.parse(res.body);
    assert.equal(data.classificationFieldsAvailable, true);
    assert.equal(data.quantityPricedProducts, 1);
    assert.equal(data.products[0].div, 'Retail');
    assert.deepEqual(data.products[0].divisions, ['Retail', 'Wholesale']);
    assert.equal(data.products[0].tiers[1].min, 6);
    assert.equal(data.products[0].tiers[1].p, 450);
  });
});

test('authentication, unrelated schema failures and invalid upstream tiers cannot trigger compatibility', async () => {
  for (const [status, code, message] of [
    [401, 'unauthorized', 'Invalid key'],
    [400, '42703', 'column catalogue.price does not exist'],
    [500, '42703', 'column catalogue.website_division does not exist'],
  ]) {
    let calls = 0;
    await withCatalogue(async () => {
      calls++;
      return new Response(JSON.stringify({ code, message }), { status });
    }, async serve => {
      const res = response();
      await serve({ method: 'GET' }, res);
      assert.equal(res.status, 503);
      assert.equal(calls, 1);
    });
  }
  await withCatalogue(async () => page([{ ...row, wholesale_tiers: [{ min_quantity: 6, unit_price: -5 }] }]), async serve => {
    const res = response();
    await serve({ method: 'GET' }, res);
    assert.equal(res.status, 503);
    assert.ok(!res.body.includes('products'));
  });
});
