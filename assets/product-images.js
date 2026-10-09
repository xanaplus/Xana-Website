/* Responsive presentation copies only; catalogue URLs and BC records stay intact. */
function productImageUrl(source, width) {
  try {
    const url = new URL(source);
    const match = url.pathname.match(/^\/uploads\/products\/([a-zA-Z0-9_-]+\.(?:jpe?g|png|webp))$/i);
    if (url.origin === 'https://xana.afyanalytics.net' && match && !url.search) {
      return `/api/product-image?file=${encodeURIComponent(match[1])}&w=${width}`;
    }
  } catch { /* Local or other trusted catalogue images keep their original path. */ }
  return source;
}

function productImageFallback(image) {
  if (image.dataset.fallbackUsed === 'true') {
    image.remove();
    return;
  }
  image.dataset.fallbackUsed = 'true';
  image.removeAttribute('srcset');
  image.src = image.dataset.original;
}

function productImageMarkup(product, { thumbnail = false, eager = false, priority = false, alt = '' } = {}) {
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
  const source = product.img;
  const small = productImageUrl(source, thumbnail ? 96 : 320);
  const responsive = !thumbnail && small !== source
    ? ` srcset="${escape(small)} 320w, ${escape(productImageUrl(source, 640))} 640w" sizes="(max-width:699px) 46vw, (max-width:1099px) 30vw, 300px"`
    : '';
  return `<img src="${escape(small)}"${responsive} alt="${escape(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${priority ? 'high' : 'auto'}" data-original="${escape(source)}" onerror="productImageFallback(this)">`;
}

if (typeof module !== 'undefined') module.exports = { productImageUrl, productImageMarkup, productImageFallback };
