const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
function declaration(name) {
  const match = html.match(new RegExp(`function ${name}\\([^)]*\\)\\{[\\s\\S]*?\\n\\}`));
  assert.ok(match, `${name} exists`);
  return match[0];
}

test('basket checkout is disabled and explains that no order or payment is made', () => {
  const basket = declaration('renderBasket');
  assert.match(basket, /<button[^>]*id="coBtn"[^>]*disabled[^>]*aria-describedby="checkoutNotice"/);
  assert.match(basket, /Checkout unavailable · Demo/);
  assert.match(basket, /id="checkoutNotice">Browsing demo only\. No order will be placed, no M-PESA prompt will be sent, and no payment will be taken/);
  assert.doesNotMatch(basket, /\.onclick=checkout/);
});

test('direct checkout calls preserve empty and filled baskets and never create orders', () => {
  for (const cart of [{}, { sample: 2 }]) {
    const state = { cart, orders: [] };
    const before = JSON.stringify(state);
    const messages = [];
    // No fetch, storage or DOM mutation APIs: any attempt to use them fails.
    const context = vm.createContext({ state, toast: text => messages.push(text) });
    vm.runInContext(declaration('checkout'), context);
    assert.equal(vm.runInContext('checkout()', context), false);
    assert.equal(JSON.stringify(state), before);
    assert.match(messages[0], /No order or payment has been made/);
  }
});

test('orders drawer replaces old success content with an explicit demo notice', () => {
  const body = { innerHTML: '<b>Order XN-123456 placed</b>' };
  const context = vm.createContext({
    $: selector => { assert.equal(selector, '#ordersBody'); return body; },
    state: { orders: [{ id: 'XN-123456' }] },
  });
  vm.runInContext(declaration('renderOrders') + '\nrenderOrders()', context);
  assert.match(body.innerHTML, /Orders unavailable in this demo/);
  assert.match(body.innerHTML, /does not display your Xana Plus App orders/);
  assert.doesNotMatch(body.innerHTML, /XN-123456|Preparing|placed|Approve/);
});
