(function (scope) {
  'use strict';
  const KEY = 'xana.basket.v1';
  const reserved = new Set(['__proto__', 'constructor', 'prototype']);
  function valid(id, quantity) {
    return typeof id === 'string' && id.length > 0 && id.length <= 256 &&
      !reserved.has(id) && Number.isSafeInteger(quantity) && quantity > 0;
  }
  function create(getStorage) {
    let entries = [];
    let warning = '';
    try {
      const raw = getStorage().getItem(KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length > 10000) throw new Error('Invalid basket');
        const seen = new Set();
        entries = parsed.filter(row => {
          const ok = Array.isArray(row) && row.length === 2 && valid(row[0], row[1]) && !seen.has(row[0]);
          if (ok) seen.add(row[0]);
          else warning = 'Some invalid saved basket entries were ignored.';
          return ok;
        });
      }
    } catch {
      warning = 'The saved basket could not be read. Your basket starts empty; saving may be unavailable.';
    }
    function save(cart) {
      entries = Object.entries(cart).filter(([id, quantity]) => valid(id, quantity));
      try {
        if (entries.length) getStorage().setItem(KEY, JSON.stringify(entries));
        else getStorage().removeItem(KEY);
      } catch {
        warning = 'Your basket works for this visit, but changes could not be saved on this device.';
      }
      return warning;
    }
    function restore(products, ageConfirmed) {
      const productsById = new Map(products.map(p => [p.id, p]));
      const cart = {};
      const notices = [];
      for (const [id, quantity] of entries) {
        const p = productsById.get(id);
        if (!p) { notices.push(`Item ${id} was removed because it is no longer in the catalogue.`); continue; }
        if (p.rx) { notices.push(`${p.name}: removed; a prescription must be reviewed before purchase.`); continue; }
        if (p.age && !ageConfirmed) { notices.push(`${p.name}: removed; add it again and confirm you are 18 or over.`); continue; }
        if (!Number.isFinite(p.price) || p.price < 0 || !Number.isFinite(p.stock) || p.stock < 1) {
          notices.push(`${p.name}: removed because current price or stock is unavailable.`);
          continue;
        }
        cart[id] = Math.min(quantity, Math.floor(p.stock));
        if (cart[id] !== quantity) notices.push(`${p.name}: quantity reduced to ${cart[id]}${p.unit?.label ? ` ${p.unit.label}` : ''} to match current stock.`);
      }
      const hadItems = entries.length > 0;
      save(cart);
      return { cart, notices, hadItems, warning };
    }
    return { save, restore, get warning() { return warning; } };
  }
  const api = { KEY, create };
  if (typeof module !== 'undefined') module.exports = api;
  scope.BasketStorage = api;
})(typeof window !== 'undefined' ? window : {});
