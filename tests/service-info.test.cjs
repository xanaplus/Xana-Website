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
  assert.match(html, /preference does not confirm delivery coverage/);
  assert.doesNotMatch(html, /Delivering to/);
});
