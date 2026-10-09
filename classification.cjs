// Business Central codes take precedence over name hints. Quantity eligibility
// is separate from the item's home division: one item number, one basket line.
const divisions = new Set(['Pharmacy', 'Retail', 'Deli', 'Liquor', 'Wholesale']);
const pharmacyGroups = new Set(['GENERAL', 'CHRONIC', 'CONTROLLED', 'OVER THE COUNTER', 'SUPPLEMENT', 'COSMETICS & BEAUTY P']);
const pharmacyCodes = new Set(['PHARMACY', 'PHARMACY & RETAIL', 'POM', 'CHRONIC', 'OTC', 'CONTROLLED', 'OVER THE COUNTER', 'SUPPLEMENT']);
const normalizeCode = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toUpperCase() : '';
const bulkName = /\b(?:bales?|cartons?|case\s+of|sacks?|wholesale|bulk\s+pack)\b/i;

function classify(row, name) {
  const group = normalizeCode(row.category);
  const code = normalizeCode(row.item_category_code);
  const pharmacy = row.requires_rx === true || pharmacyGroups.has(group) || pharmacyCodes.has(code);
  const age = row.age_restricted === true || group === 'WINES & SPIRITS' || code === 'LIQUOR';
  const rx = row.requires_rx === true || (pharmacy && row.requires_rx !== false);
  const declared = typeof row.website_division === 'string' ? row.website_division.trim() : row.website_division;
  if (declared != null && declared !== '' && !divisions.has(declared)) {
    throw new Error('Catalogue contains an invalid website division');
  }
  // An upstream website label must never remove medicine or alcohol safeguards.
  const div = age ? 'Liquor' : rx ? 'Pharmacy' : declared ||
    (code === 'DELI' || group === 'DELI' ? 'Deli'
      : pharmacy ? 'Pharmacy'
        : code === 'WHOLESALE' || group === 'WHOLESALE' || bulkName.test(name) ? 'Wholesale' : 'Retail');
  return { div, group, code, rx, age, declared: !!declared };
}

// Tier minimums count the same BC selling unit as the standard price.
function quantityTiers(value, basePrice, unitLabel) {
  if (value == null || (Array.isArray(value) && value.length === 0)) return undefined;
  if (!Array.isArray(value)) throw new Error('Catalogue contains invalid wholesale tiers');
  const tiers = value.map(tier => {
    if (!tier || typeof tier !== 'object') throw new Error('Catalogue contains invalid wholesale tiers');
    const min = tier.min_quantity;
    const price = tier.unit_price;
    if (!Number.isSafeInteger(min) || min < 2 || typeof price !== 'number' || !Number.isFinite(price) || price <= 0 || price >= basePrice) {
      throw new Error('Catalogue contains invalid wholesale tiers');
    }
    return { min, p: price };
  }).sort((a, b) => a.min - b.min);
  for (let i = 1; i < tiers.length; i++) {
    if (tiers[i].min === tiers[i - 1].min || tiers[i].p > tiers[i - 1].p) {
      throw new Error('Catalogue contains conflicting wholesale tiers');
    }
  }
  const all = [{ min: 1, p: basePrice }, ...tiers];
  const unitWord = unitLabel || 'units';
  return all.map((tier, i) => ({
    ...tier,
    l: i === all.length - 1 ? `${tier.min}+ ${unitWord}` : `${tier.min}–${all[i + 1].min - 1} ${unitWord}`,
  }));
}

module.exports = { classify, quantityTiers };
