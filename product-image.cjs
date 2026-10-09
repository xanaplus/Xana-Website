const sharp = require('sharp');
const ORIGIN = 'https://xana.afyanalytics.net';
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_CACHE_BYTES = 16 * 1024 * 1024;
const cache = new Map();
const pending = new Map();
let cacheBytes = 0;
let active = 0;
const waiting = [];

async function withImageSlot(request) {
  if (active >= 6) await new Promise(resolve => waiting.push(resolve));
  else active++;
  try {
    return await optimize(request);
  } finally {
    const next = waiting.shift();
    if (next) next();
    else active--;
  }
}

function imageRequest(url) {
  const params = new URL(url, 'http://image').searchParams;
  const file = params.get('file') || '';
  const width = Number(params.get('w'));
  if (!/^[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp)$/i.test(file) ||
      file.length > 180 || ![96, 320, 640, 1024].includes(width)) return null;
  return { file, width, key: `${file}:${width}` };
}

async function optimize({ file, width }) {
  // Only public product files on the existing image host. Never follow redirects
  // or accept arbitrary source URLs, credentials, paths or fetch headers.
  const response = await fetch(`${ORIGIN}/uploads/products/${file}`, {
    redirect: 'error', signal: AbortSignal.timeout(8000),
  });
  if (!response.ok || !/^image\/(?:jpeg|png|webp)(?:;|$)/i.test(response.headers.get('content-type') || '')) {
    await response.body?.cancel();
    throw new Error('Product image unavailable');
  }
  if (Number(response.headers.get('content-length')) > MAX_BYTES) {
    await response.body?.cancel();
    throw new Error('Product image too large');
  }
  const chunks = [];
  let length = 0;
  for await (const chunk of response.body) {
    length += chunk.length;
    if (length > MAX_BYTES) throw new Error('Product image too large');
    chunks.push(chunk);
  }
  return sharp(Buffer.concat(chunks), { limitInputPixels: 25_000_000 })
    .rotate()
    .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78, effort: 3 })
    .toBuffer();
}

async function serveProductImage(req, res) {
  const fail = (status, message) => {
    res.writeHead(status, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : message);
  };
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  const request = imageRequest(req.url);
  if (!request) return fail(400, 'Invalid product image request');
  let entry = cache.get(request.key);
  if (entry && entry.expires < Date.now()) {
    cacheBytes -= entry.buffer.length;
    cache.delete(request.key);
    entry = null;
  }
  try {
    if (!entry) {
      if (!pending.has(request.key)) {
        if (pending.size >= 48) return fail(503, 'Image service busy');
        const job = withImageSlot(request).then(buffer => {
          while (cache.size && (cacheBytes + buffer.length > MAX_CACHE_BYTES || cache.size >= 256)) {
            const oldest = cache.keys().next().value;
            cacheBytes -= cache.get(oldest).buffer.length;
            cache.delete(oldest);
          }
          const result = { buffer, expires: Date.now() + 86400000 };
          cache.set(request.key, result);
          cacheBytes += buffer.length;
          return result;
        }).finally(() => pending.delete(request.key));
        pending.set(request.key, job);
      }
      entry = await pending.get(request.key);
    }
    res.writeHead(200, {
      'Content-Type': 'image/webp',
      'Content-Length': entry.buffer.length,
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : entry.buffer);
  } catch {
    console.warn('Product image optimization failed');
    fail(502, 'Product image unavailable');
  }
}

module.exports = { imageRequest, serveProductImage };
