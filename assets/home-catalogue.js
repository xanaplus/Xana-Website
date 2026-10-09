/* Presentation groups only. Classification belongs to CatalogueRules/upstream. */
(function(root) {
  'use strict';
  const rules = typeof module === 'object' && module.exports
    ? require('./catalogue-rules.js') : root.CatalogueRules;
  const departments = [
    {div:'Retail',label:'Groceries & household',icon:'i-storefront'},
    {div:'Pharmacy',label:'Pharmacy',icon:'i-pill'},
    {div:'Deli',label:'Deli',icon:'i-storefront'},
    {div:'Wholesale',label:'Wholesale',icon:'i-package'},
    {div:'Liquor',label:'Liquor · 18+',icon:'i-age'},
  ];
  // A conservative presentation allow-list, not a medical classification rule.
  // Ambiguous categories remain fully accessible in Browse all.
  const shelfCategories = new Set([
    'fresh produce','dairy & eggs','beverages','snacks','rice & grains',
    'cleaning & household','household','foodstuffs','cooking oils & fats',
    'cleaning products','household products','confectionery','cereals',
    'bakery','bakery products','dairy products','biscuits','detergents',
  ]);
  function members(products, div, cat = 'All') {
    return products.filter(p => rules.inDivision(p, div) && rules.inCategory(p, div, cat));
  }
  function categories(products, div) {
    return [...new Set(members(products, div).map(p => rules.category(p, div)))]
      .filter(cat => cat && cat !== 'All');
  }
  function shortcuts(products) {
    return departments.filter(d => members(products, d.div).length)
      .map(d => ({...d,cat:'All',count:members(products,d.div).length}));
  }
  function canFeature(p) {
    return p.stock > 0 && p.price > 0 && !!p.img && !p.rx && !p.age &&
      !rules.inDivision(p,'Pharmacy') && !rules.inDivision(p,'Liquor') &&
      shelfCategories.has(String(rules.category(p,'Retail')).trim().toLowerCase()) &&
      // Omit obvious name/department conflicts from home only. Never infer Rx
      // status, alter upstream records, or change browsing/purchase rules.
      !/\b(tablets?|capsules?|injections?|amoxicillin|antibiotics?|vitamins?|medicines?|inhalers?|suspension|ointment|drops|lager|beer|wine|vodka|whisky)\b|\b\d+(?:\.\d+)?\s*(?:mg|mcg)\b/i.test(p.name);
  }
  function collections(products, limit = 4) {
    const used = new Set();
    const result = [];
    const div = 'Retail';
    const groups = categories(products,div).map(cat => ({
      cat, pool:members(products,div,cat).filter(canFeature),
    })).filter(group => group.pool.length);
    // Larger available categories first, with stable catalogue order for ties.
    groups.sort((a,b) => b.pool.length-a.pool.length);
    for (const {cat,pool} of groups) {
      const selected = pool.filter(p => !used.has(p.id)).slice(0,Math.min(4,Math.max(0,limit)));
      if (!selected.length) continue;
      selected.forEach(p => used.add(p.id));
      result.push({div,cat,label:cat,copy:'Available now',products:selected});
      if (result.length === 2) break;
    }
    return result;
  }
  function isHome(state, product = null) {
    return !state.browsing && product === null && state.div === 'All' && state.cat === 'All' && !state.q &&
      state.sort === 'rec' && state.max === Infinity && !state.inStock && !state.brands.size;
  }
  function resetFilters(state) {
    state.q=''; state.max=Infinity; state.inStock=false; state.brands.clear(); state.sort='rec';
  }
  const api = {members,categories,shortcuts,collections,canFeature,isHome,resetFilters};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XanaHomeCatalogue = api;
})(typeof globalThis === 'object' ? globalThis : this);
