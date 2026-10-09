// Shared, dependency-free catalogue behavior for the storefront and node tests.
(function(root) {
  const rules = {
    inDivision: (p, div) => div === 'All' || (p.divisions || [p.div]).includes(div),
    category: (p, div) => div === 'All' ? p.cat : (p.categories?.[div] || p.cat),
    inCategory: (p, div, cat) => cat === 'All' || (div === 'All'
      ? Object.values(p.categories || { [p.div]: p.cat }).includes(cat)
      : rules.category(p, div) === cat),
    activeTier(p, qty) {
      if (!p.tiers?.length) return -1;
      let active = -1;
      for (let i = 0; i < p.tiers.length; i++) {
        if (qty >= p.tiers[i].min) active = i;
      }
      return active;
    },
    unitPrice(p, qty) {
      const tier = rules.activeTier(p, qty);
      return tier < 0 ? p.price : p.tiers[tier].p;
    },
  };
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.CatalogueRules = rules;
})(typeof globalThis === 'object' ? globalThis : this);
