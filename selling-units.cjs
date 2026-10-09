// Business Central selling-unit contract. BC states an item's unit price and
// inventory in its base unit of measure; the public catalogue must publish
// that unit for the website to say what one price buys. Nothing here is read
// from product names. Invalid upstream data fails the catalogue load instead of
// showing an ambiguous price.
const CODE = /^[A-Za-z0-9][A-Za-z0-9 ._/-]{0,19}$/;

function invalid() {
  return new Error('Catalogue contains an invalid selling unit');
}

function sellingUnit(row) {
  const code = row.selling_unit;
  if (code == null || code === '') return null;
  if (typeof code !== 'string' || !CODE.test(code.trim())) throw invalid();
  const label = row.selling_unit_label;
  if (label != null && label !== '' && (typeof label !== 'string' || !label.trim() || label.trim().length > 40)) throw invalid();
  const conversions = row.unit_conversions;
  if (conversions != null && !Array.isArray(conversions)) throw invalid();
  const seen = new Set([code.trim().toUpperCase()]);
  const list = (conversions || []).map(entry => {
    if (!entry || typeof entry !== 'object') throw invalid();
    const unit = typeof entry.unit === 'string' ? entry.unit.trim() : '';
    const qty = entry.qty_per_unit;
    if (!CODE.test(unit) || typeof qty !== 'number' || !Number.isFinite(qty) || qty <= 0) throw invalid();
    const key = unit.toUpperCase();
    if (seen.has(key)) {
      // BC lists the base unit itself at 1; anything else is contradictory.
      if (key === code.trim().toUpperCase() && qty === 1) return null;
      throw invalid();
    }
    seen.add(key);
    return { unit, qty };
  }).filter(Boolean);
  return {
    code: code.trim(),
    label: label ? label.trim() : code.trim(),
    conversions: list,
  };
}

// Whole selling units only: a fraction of a BC base unit (for example half a
// box after pieces were sold) is not purchasable at the base-unit price.
function wholeStock(value) {
  const stock = Number(value);
  return Number.isFinite(stock) && stock > 0 ? Math.floor(stock + 1e-9) : 0;
}

module.exports = { sellingUnit, wholeStock };
