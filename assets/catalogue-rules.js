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
    // Business Central selling unit: what one price and one stock count mean.
    // Null until the shared catalogue publishes it; never derived from names.
    unitName: p => p?.unit?.label || '',
    perUnit: p => p?.unit?.label ? `per ${p.unit.label}` : 'per unit',
    stockText(p) {
      if (!(p?.stock > 0)) return 'Out of stock';
      return p.unit?.label ? `${p.stock} ${p.unit.label} in stock` : `${p.stock} in stock`;
    },
    quantityText: (p, qty) => p?.unit?.label ? `${qty} × ${p.unit.label}` : `${qty}`,
    conversions(p) {
      if (!p?.unit?.conversions?.length) return [];
      const base = p.unit.label;
      const round = n => Number(n.toFixed(4)).toLocaleString('en-KE', { maximumFractionDigits: 4 });
      return p.unit.conversions.map(({ unit, qty }) => {
        if (qty >= 1) return `1 ${unit} = ${round(qty)} ${base}`;
        const inverse = 1 / qty;
        return Math.abs(inverse - Math.round(inverse)) < 1e-6
          ? `${Math.round(inverse)} ${unit} = 1 ${base}`
          : `1 ${unit} = ${round(qty)} ${base}`;
      });
    },
  };
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.CatalogueRules = rules;
})(typeof globalThis === 'object' ? globalThis : this);
