const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { imageRequest, serveProductImage } = require('../product-image.cjs');
const { productImageUrl, productImageMarkup, productImageFallback } = require('../assets/product-images.js');
const original = 'https://xana.afyanalytics.net/uploads/products/product_test.jpg';
const response = () => ({
  writeHead(status, headers) { this.status = status; this.headers = headers; },
  end(body) { this.body = body; },
});

test('only expected filenames and fixed widths can reach the image host', () => {
  assert.ok(imageRequest('/api/product-image?file=product_test.jpg&w=320'));
  for (const file of ['../secret.jpg', 'https://evil.test/a.jpg', 'file.svg', 'a.jpg?x', 'a.jpg/extra']) {
    assert.equal(imageRequest(`/api/product-image?file=${encodeURIComponent(file)}&w=320`), null);
  }
  assert.equal(imageRequest('/api/product-image?file=a.jpg&w=10000'), null);
  assert.equal(productImageUrl('https://evil.test/product_test.jpg', 320), 'https://evil.test/product_test.jpg');
});

test('image output preserves proportions, shrinks bytes, caches and supports HEAD', async () => {
  const source = await sharp({ create: { width: 1600, height: 2400, channels: 3, background: '#eee' } }).jpeg().toBuffer();
  const previous = global.fetch;
  let calls = 0;
  global.fetch = async (url, options) => {
    calls++;
    assert.equal(url, original);
    assert.equal(options.redirect, 'error');
    return new Response(source, { headers: { 'content-type': 'image/jpeg' } });
  };
  try {
    const res = response();
    await serveProductImage({ method: 'GET', url: '/api/product-image?file=product_test.jpg&w=320' }, res);
    assert.equal(res.status, 200);
    assert.equal(res.headers['Content-Type'], 'image/webp');
    assert.match(res.headers['Cache-Control'], /s-maxage/);
    const image = await sharp(res.body).metadata();
    assert.equal(image.height, 320);
    assert.ok(Math.abs(image.width / image.height - 1600 / 2400) < .01);
    assert.ok(res.body.length < source.length);
    const head = response();
    await serveProductImage({ method: 'HEAD', url: '/api/product-image?file=product_test.jpg&w=320' }, head);
    assert.equal(head.status, 200);
    assert.equal(head.body, undefined);
    assert.equal(calls, 1);
    const invalid = response();
    await serveProductImage({ method: 'GET', url: '/api/product-image?file=bad.svg&w=320' }, invalid);
    assert.equal(invalid.status, 400);
    assert.equal(calls, 1);
    const post = response();
    await serveProductImage({ method: 'POST', url: '/' }, post);
    assert.equal(post.status, 405);
  } finally { global.fetch = previous; }
});

test('responsive cards prioritize first images and thumbnails request only 96px', () => {
  const markup = productImageMarkup({ img: original }, { eager: true, priority: true, alt: '"<Pack>' });
  assert.match(markup, /srcset=/);
  assert.match(markup, /loading="eager"/);
  assert.match(markup, /fetchpriority="high"/);
  assert.match(markup, /&quot;&lt;Pack&gt;/);
  const thumb = productImageMarkup({ img: original }, { thumbnail: true });
  assert.match(thumb, /w=96/);
  assert.ok(!thumb.includes('srcset'));
  assert.match(productImageMarkup({ img: original }), /loading="lazy"/);
});

test('an optimizer failure tries the original once without a retry loop', () => {
  const image = { dataset: { original }, removeAttribute(key) { this.removedAttribute = key; }, remove() { this.removed = true; } };
  productImageFallback(image);
  assert.equal(image.src, original);
  assert.equal(image.removedAttribute, 'srcset');
  productImageFallback(image);
  assert.equal(image.removed, true);
});
