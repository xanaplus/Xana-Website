/* Presentation groups only. Classification belongs to CatalogueRules/upstream. */
(function(root) {
  'use strict';
  const rules = typeof module === 'object' && module.exports
    ? require('./catalogue-rules.js') : root.CatalogueRules;
  const departments = [
    {div:'Retail',label:'Groceries & household',image:'img/app/fresh-produce.jpg',icon:'i-storefront'},
    {div:'Pharmacy',label:'Pharmacy',image:'img/app/pharmacy.jpg',icon:'i-pill'},
    {div:'Deli',label:'Deli',image:'img/app/cheese-counter.jpg',icon:'i-storefront'},
    {div:'Wholesale',label:'Wholesale',image:'img/app/retail-wholesale.jpg',icon:'i-package'},
    {div:'Liquor',label:'Liquor · 18+',image:'img/app/liquor.jpg',icon:'i-age'},
  ];
  // Exact catalogue labels select artwork, never membership/classification.
  const artwork = {
    'Fresh produce':'fresh-produce.jpg','Dairy & eggs':'dairy-eggs.jpg',
    'Beverages':'beverages.jpg','Snacks':'snacks.jpg','Rice & grains':'rice-grains.jpg',
    'Cleaning & household':'cleaning-household.jpg','Vitamins':'vitamins-supplements.jpg',
    'Skin care':'beauty-personal-care.jpg','First aid':'first-aid-wound-care.jpg',
  };
  function members(products, div, cat = 'All') {
    return products.filter(p => rules.inDivision(p, div) && rules.inCategory(p, div, cat));
  }
  function categories(products, div) {
    return [...new Set(members(products, div).map(p => rules.category(p, div)))]
      .filter(cat => cat && cat !== 'All');
  }
  function shortcuts(products) {
    const tiles = departments.filter(d => members(products, d.div).length)
      .map(d => ({...d,cat:'All',count:members(products,d.div).length}));
    // Categories are discovered from authoritative metadata, not product names.
    for (const div of ['Retail','Pharmacy']) {
      const limit = div === 'Retail' ? 2 : 1;
      const cats = categories(products,div).filter(cat => cat !== 'Other').slice(0,limit);
      for (const cat of cats) {
        const pool = members(products,div,cat);
        const sample = pool.find(p => p.img && !p.rx && !p.age);
        const fallback = departments.find(d => d.div === div);
        tiles.push({div,cat,label:cat,count:pool.length,icon:fallback.icon,
          image:artwork[cat] ? 'img/app/'+artwork[cat] : sample?.img || fallback.image,
          cataloguePhoto:!artwork[cat] && !!sample?.img});
      }
    }
    return tiles;
  }
  function collections(products, limit = 4) {
    const used = new Set();
    const result = [];
    for (const [div,label,copy] of [
      ['Retail','Everyday essentials','Groceries and household shopping from the current catalogue.'],
      ['Pharmacy','Pharmacy & personal care','Browse available items. Prescription medicines are in the full pharmacy catalogue.'],
      ['Wholesale','For bulk buying','Available packs at current catalogue prices.'],
    ]) {
      const pool = members(products,div).filter(p => !p.rx && !p.age && !used.has(p.id));
      // Prefer real photos and available stock; never invent availability.
      const rank = p => (p.stock > 0 ? 0 : 2) + (p.img ? 0 : 1);
      pool.sort((a,b) => rank(a)-rank(b));
      const selected = [], seenCats = new Set();
      for (const p of pool) {
        const cat = rules.category(p,div);
        if (seenCats.has(cat)) continue;
        seenCats.add(cat); selected.push(p);
        if (selected.length === limit) break;
      }
      for (const p of pool) {
        if (selected.length >= limit) break;
        if (!selected.includes(p)) selected.push(p);
      }
      if (!selected.length) continue;
      selected.forEach(p => used.add(p.id));
      result.push({div,cat:'All',label,copy,products:selected});
    }
    return result;
  }
  function isHome(state, product = null) {
    return product === null && state.div === 'All' && state.cat === 'All' && !state.q &&
      state.sort === 'rec' && state.max === Infinity && !state.inStock && !state.brands.size;
  }
  function resetFilters(state) {
    state.q=''; state.max=Infinity; state.inStock=false; state.brands.clear(); state.sort='rec';
  }
  const api = {members,categories,shortcuts,collections,isHome,resetFilters};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XanaHomeCatalogue = api;
})(typeof globalThis === 'object' ? globalThis : this);
