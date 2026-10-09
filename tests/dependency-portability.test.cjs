const test = require('node:test');
const assert = require('node:assert/strict');
const lock = require('../package-lock.json');

test('dependency downloads are portable to Vercel and retain integrity checks', () => {
  for (const [name, dependency] of Object.entries(lock.packages)) {
    if (!name) continue;
    assert.equal(new URL(dependency.resolved).origin, 'https://registry.npmjs.org', name);
    assert.ok(dependency.integrity?.startsWith('sha512-'), name);
  }
});
