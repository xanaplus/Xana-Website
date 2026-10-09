// Read only Xana Plus App's public catalogue view. Never query the products table:
// it includes private cost and margin fields.
const PAGE_SIZE = 1000;
const CACHE_MS = 30_000;
const COLUMNS = 'item_no,name,price,stock,category,item_category_code,requires_rx,age_restricted,photo_url';
let cached;
let expiresAt = 0;
let pending;

// Match the mobile app's pharmacy shelves, including GENERAL and skin care.
const pharmacyGroups = new Set(['GENERAL', 'CHRONIC', 'CONTROLLED', 'OVER THE COUNTER', 'SUPPLEMENT', 'COSMETICS & BEAUTY P']);
const pharmacyCodes = new Set([
  'PHARMACY', 'PHARMACY & RETAIL', 'POM', 'CHRONIC', 'OTC',
  'CONTROLLED', 'OVER THE COUNTER', 'SUPPLEMENT',
]);
const categoryNames = {
  'FOODSTUFFS': 'Staples',
  'GROCERIES & CEREALS': 'Staples',
  'BREADS & BREAD SPREA': 'Bakery',
  'FRUITS AND VEGETABLE': 'Fresh produce',
  'MILK PRODUCTSS': 'Dairy & eggs',
  'DAIRIES': 'Dairy & eggs',
  'MEAT PRODUCTS': 'Meat',
  'COOKING OILS & FATS': 'Cooking',
  'SPICES & FLAVOURS': 'Cooking',
  'BEVERAGES': 'Beverages',
  'WATER': 'Beverages',
  'SOFTDRINKS AND JUICE': 'Beverages',
  'SNACKS & BISCUITS': 'Snacks',
  'CONFECTIONARIES': 'Snacks',
  'SOAPS & DETERGENTS': 'Household',
  'SANITARIES& DIAPERS': 'Mother & baby',
  'BABY PRODUCTS': 'Mother & baby',
  'CUTLERY AND HOUSEHOL': 'Household',
  'PLASTICS': 'Household',
  'AIRFRESHNERS': 'Household',
  'INSECTICIDES': 'Household',
  'SHOE CARE': 'Household',
  'STATIONARY': 'Books & stationery',
  'RETBEAU': 'Beauty & personal care',
  'COSMETICS & BEAUTY P': 'Skin care',
  'ORAL CARE': 'Personal care',
  'GENERAL': 'Medicines',
  'OVER THE COUNTER': 'Medicines',
  'CHRONIC': 'Chronic care',
  'CONTROLLED': 'Prescription medicines',
  'SUPPLEMENT': 'Vitamins',
};

function publicKey() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error('Catalogue connection is not configured');
  if (key.startsWith('sb_publishable_')) return key;
  try {
    const role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role;
    if (role === 'anon') return key;
  } catch { /* Invalid or non-JWT keys are not acceptable. */ }
  throw new Error('Catalogue requires a publishable/anon key');
}

function product(row) {
  if (typeof row.item_no !== 'string' || !row.item_no.trim()) return null;
  const name = (row.name || row.item_no).trim();
  const price = Number(row.price);
  if (!Number.isFinite(price) || price <= 0) return null;
  const group = row.category || '';
  const code = row.item_category_code || '';
  let div = 'Retail';
  if (row.age_restricted || group === 'WINES & SPIRITS') div = 'Liquor';
  else if (code === 'DELI') div = 'Deli';
  else if (row.requires_rx || pharmacyGroups.has(group) || pharmacyCodes.has(code)) div = 'Pharmacy';
  else if (/\b(?:bale|carton|case of|sack|25\s?kg|50\s?kg)\b/i.test(name)) div = 'Wholesale';

  let cat = categoryNames[group] || 'Other';
  if (div === 'Deli') cat = group === 'MEAT PRODUCTS' ? 'Meat & deli' : 'Prepared foods';
  if (div === 'Wholesale') cat = `Bulk ${cat.toLowerCase()}`;
  if (div === 'Liquor') {
    cat = /\b(?:beer|lager|cider|ale)\b/i.test(name) ? 'Beer & cider'
      : /\b(?:wine|merlot|cabernet|sauvignon|shiraz)\b/i.test(name) ? 'Wine' : 'Spirits';
  }
  const pack = name.match(/\b\d+\s?'?s\b|\b\d+(?:[.,]\d+)?\s?(?:ml|ltrs?|lt|l|kg|gms?|g|mg|mcg|pcs|pc|pk|pack|tabs|caps)\b/gi)?.at(-1) || '';
  let img = '';
  try {
    const photo = new URL(row.photo_url);
    if (photo.protocol === 'https:') img = photo.href;
  } catch { /* No customer-facing photo available. */ }

  return {
    id: row.item_no,
    name,
    price,
    stock: Math.max(0, Number(row.stock) || 0),
    div,
    cat,
    brand: cat,
    pack,
    img,
    fit: img ? 'cover' : undefined,
    rx: row.requires_rx === true || (div === 'Pharmacy' && row.requires_rx !== false),
    age: div === 'Liquor',
  };
}

async function loadCatalogue() {
  const base = process.env.SUPABASE_URL;
  if (!base) throw new Error('Catalogue connection is not configured');
  const origin = new URL(base);
  if (origin.protocol !== 'https:') throw new Error('Catalogue URL must use HTTPS');
  const key = publicKey();
  const endpoint = new URL('/rest/v1/catalogue', origin);
  endpoint.searchParams.set('select', COLUMNS);
  endpoint.searchParams.set('order', 'item_no.asc');
  const headers = { apikey: key };
  if (!key.startsWith('sb_publishable_')) headers.Authorization = `Bearer ${key}`;

  async function page(from, count = false) {
    const response = await fetch(endpoint, {
      headers: {
        ...headers,
        Range: `${from}-${from + PAGE_SIZE - 1}`,
        ...(count ? { Prefer: 'count=exact' } : {}),
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`Catalogue read failed (HTTP ${response.status})`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Catalogue returned an invalid response');
    return { rows, total: Number(response.headers.get('content-range')?.split('/')[1]) };
  }
  const first = await page(0, true);
  if (!Number.isSafeInteger(first.total) || first.total < 0) throw new Error('Catalogue count unavailable');
  const offsets = [];
  for (let offset = PAGE_SIZE; offset < first.total; offset += PAGE_SIZE) offsets.push(offset);
  const rest = await Promise.all(offsets.map(offset => page(offset)));
  const rows = [first, ...rest].flatMap(result => result.rows);
  if (rows.length !== first.total) throw new Error('Catalogue changed during loading; retry shortly');
  const products = rows.map(product).filter(Boolean);
  return { products, updatedAt: new Date().toISOString() };
}

function getCatalogue() {
  if (cached && Date.now() < expiresAt) return Promise.resolve(cached);
  if (!pending) {
    pending = loadCatalogue()
      .then(result => {
        cached = result;
        expiresAt = Date.now() + CACHE_MS;
        return result;
      })
      .finally(() => { pending = null; });
  }
  return pending;
}

async function serveCatalogue(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  try {
    const body = JSON.stringify(await getCatalogue());
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Length': Buffer.byteLength(body),
      'X-Content-Type-Options': 'nosniff',
    });
    return res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    console.error('Catalogue unavailable:', error.message);
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ error: 'Live catalogue unavailable' }));
  }
}

module.exports = { serveCatalogue, product };
