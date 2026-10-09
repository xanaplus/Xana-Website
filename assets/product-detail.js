/* Query-string navigation works on static hosts without rewrite rules. */
(function (scope) {
  'use strict';
  function readProduct(href) { return new URL(href, 'https://xana.life').searchParams.get('product'); }
  function productUrl(href, id) {
    const url = new URL(href, 'https://xana.life');
    if (id === null) url.searchParams.delete('product');
    else url.searchParams.set('product', String(id));
    url.hash = '';
    return url.pathname + url.search;
  }
  function available(stock, inBasket) {
    return Math.max(0, Math.floor(Number(stock) || 0) - Math.max(0, Number(inBasket) || 0));
  }
  function clampQuantity(value, max) {
    return max <= 0 ? 0 : Math.min(max, Math.max(1, Math.floor(Number(value) || 1)));
  }
  function viewStatus(status, item) { return status === 'ready' ? (item ? 'ready' : 'not-found') : status; }
  const helpers = { readProduct, productUrl, available, clampQuantity, viewStatus };
  if (typeof module !== 'undefined') module.exports = helpers;
  if (!scope.document) return;
  let selected = readProduct(scope.location.href);
  let quantity = 1;
  let returnFocus = null;
  const originalTitle = document.title;
  function href(id) { return productUrl(scope.location.href, id); }
  function link(id, text, attrs = '') {
    return `<a href="${escapeHtml(href(id))}" data-product-link ${attrs}>${text}</a>`;
  }
  function browseLink(text, div, cat) {
    return `<a href="${escapeHtml(href(null))}" data-product-browse${div ? ` data-div="${escapeHtml(div)}"` : ''}${cat ? ` data-cat="${escapeHtml(cat)}"` : ''}>${text}</a>`;
  }
  function focusHeading() {
    const heading = document.querySelector('#productDetail h1');
    if (heading) { heading.focus({ preventScroll: true }); document.querySelector('#main').scrollIntoView({ block: 'start', behavior: 'auto' }); }
  }
  function navigate(id, push = true, focusBrowse = false) {
    if (typeof closeAll === 'function') closeAll();
    if (push && selected !== id) scope.history.pushState(null, '', href(id));
    selected = id;
    quantity = 1;
    render();
    if (id !== null) focusHeading();
    else if (focusBrowse) {
      const home = scope.XanaHomeCatalogue?.isHome(state);
      document.querySelector(home ? '#homeTitle' : '#catTitle').focus({ preventScroll: true });
    }
  }
  function browse(focusBrowse = false) { if (selected !== null) navigate(null, true, focusBrowse); }
  function render() {
    const root = document.querySelector('#productDetail');
    if (!root) return;
    document.body.classList.toggle('product-view', selected !== null);
    scope.XanaHome?.render();
    root.hidden = selected === null;
    if (selected === null) { document.title = originalTitle; return; }
    const p = prod(selected);
    const status = viewStatus(catalogueStatus, p);
    root.setAttribute('aria-busy', String(status === 'loading'));
    const back = browseLink('← Back to shop');
    if (status === 'loading') {
      document.title = 'Loading product · Xana Life';
      root.innerHTML = `<a class="pd-back" href="${escapeHtml(href(null))}" data-product-browse>← Back to shop</a><h1 class="sr-only" tabindex="-1">Loading product</h1><p role="status" class="sr-only">Checking live price and stock…</p><div class="pd-layout pd-loading" aria-hidden="true"><div class="pd-photo skeleton-block"></div><div><div class="skeleton-block skeleton-line"></div><div class="skeleton-block skeleton-line"></div><div class="skeleton-block skeleton-line" style="width:55%"></div></div></div>`;
      return;
    }
    if (status !== 'ready') {
      const error = status === 'error';
      document.title = (error ? 'Catalogue unavailable' : 'Product not found') + ' · Xana Life';
      root.innerHTML = `<div class="pd-state"><h1 tabindex="-1">${error ? 'Live catalogue unavailable' : 'Product not found'}</h1><p>${error ? 'We could not check this product’s price and stock. Please try again.' : 'This item is not in the current catalogue. Browse the shop to find an available product.'}</p>${error ? '<button type="button" class="btn g" data-product-retry>Try again</button> ' : ''}${back}</div>`;
      return;
    }
    document.title = p.name + ' · Xana Life';
    const max = available(p.stock, state.cart[p.id]);
    quantity = clampQuantity(quantity, max);
    const price = unitPrice(p, Math.max(1, quantity + (state.cart[p.id] || 0)));
    const category = p.cat || '';
    const related = PRODUCTS.filter(item => item.id !== p.id && item.div === p.div && item.cat === category).slice(0, 4);
    // Keep the focused quantity control stable during minute-by-minute refreshes.
    const active = document.activeElement;
    const focused = root.contains(active) ? active.id : '';
    root.innerHTML = `<nav class="pd-breadcrumbs" aria-label="Breadcrumb">${browseLink('Shop')}<span aria-hidden="true">/</span>${browseLink(escapeHtml(p.div), p.div)}${category ? `<span aria-hidden="true">/</span>${browseLink(escapeHtml(category), p.div, category)}` : ''}<span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(p.name)}</span></nav>
      <div class="pd-back">${back}</div>
      <div class="pd-layout">
        <div class="pd-photo"><span class="pd-image-empty"><svg class="ic" aria-hidden="true"><use href="#i-package"/></svg>Image unavailable</span>${p.img ? productImageMarkup(p, { detail: true, alt: p.name, eager: true, priority: true }) : ''}</div>
        <section class="pd-copy" aria-labelledby="pdTitle"><p class="pd-eyebrow">${escapeHtml(p.div)}</p><h1 id="pdTitle" tabindex="-1">${escapeHtml(p.name)}</h1>${p.pack ? `<p class="pd-pack">${escapeHtml(p.pack)}</p>` : ''}
          <p class="pd-price"><small>KSh</small> ${Number(price).toLocaleString('en-KE')}</p><p class="pd-stock${p.stock <= 0 ? ' unavailable' : ''}">${p.stock > 0 ? `${escapeHtml(p.stock)} in stock` : 'Out of stock'}</p>
          <dl class="pd-meta"><div><dt>Item number</dt><dd>${escapeHtml(p.id)}</dd></div><div><dt>Department</dt><dd>${escapeHtml(p.div)}</dd></div>${category ? `<div><dt>Category</dt><dd>${escapeHtml(category)}</dd></div>` : ''}${p.pack ? `<div><dt>Pack</dt><dd>${escapeHtml(p.pack)}</dd></div>` : ''}</dl>
          ${p.tiers?.length ? `<div class="tiers"><table><caption>Catalogue quantity prices</caption><thead><tr><th scope="col">Quantity</th><th scope="col">Per unit</th></tr></thead><tbody>${p.tiers.map(t => `<tr><td>${escapeHtml(t.l)}</td><td>${escapeHtml(ksh(t.p))}</td></tr>`).join('')}</tbody></table></div>` : ''}
          ${p.rx ? '<div class="pd-safety"><b>Prescription required</b>A pharmacist must review your prescription before this medicine can be supplied. Uploading a prescription does not add this item to your basket.</div>' : ''}
          ${p.age ? '<div class="pd-safety"><b>For adults aged 18 and over</b>Not for sale to persons under 18. Age confirmation is required before adding to your basket. Drink responsibly.</div>' : ''}
        </section>
        <section class="pd-purchase" aria-labelledby="pdPurchase"><h2 id="pdPurchase">Your basket</h2><label for="pdQuantity">Quantity to add</label><div class="pd-quantity"><button type="button" id="pdMinus" aria-label="Decrease quantity" ${quantity <= 1 ? 'disabled' : ''}>−</button><input type="number" id="pdQuantity" min="1" max="${Math.max(1, max)}" step="1" value="${quantity}" inputmode="numeric" ${max <= 0 ? 'disabled' : ''} aria-describedby="pdAvailability"><button type="button" id="pdPlus" aria-label="Increase quantity" ${quantity >= max ? 'disabled' : ''}>+</button></div><p class="pd-basket-note" id="pdAvailability">${state.cart[p.id] ? `${state.cart[p.id]} already in basket · ` : ''}${max} available to add</p><div class="pd-total"><span>Quantity subtotal</span><strong>${escapeHtml(ksh(price * quantity))}</strong></div><button type="button" class="addbtn" id="pdAdd" ${max <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Out of stock' : max <= 0 ? 'All available stock in basket' : p.rx ? 'Upload prescription' : 'Add to basket'}</button><p class="pd-demo">Browsing demo only. Checkout is disabled; no order or payment will be made.</p></section>
      </div>
      ${related.length ? `<section class="pd-related"><h2>More in ${escapeHtml(category)}</h2><p>Other products in the same catalogue category.</p><div class="pd-related-grid">${related.map(item => `<article class="card">${link(item.id, `<div class="img">${item.img ? productImageMarkup(item, { alt: item.name }) : '<span class="mono">Image unavailable</span>'}</div>`, `aria-label="${escapeHtml(item.name)}"`)}<div class="card-body">${link(item.id, escapeHtml(item.name), 'class="pname"')}<p class="pack">${escapeHtml(item.pack)}</p><p class="price">${escapeHtml(ksh(unitPrice(item, 1)))}</p><p class="pack">${item.stock > 0 ? `${escapeHtml(item.stock)} in stock` : 'Out of stock'}</p></div></article>`).join('')}</div></section>` : ''}`;
    root.querySelector('#pdMinus').onclick = () => { quantity--; render(); };
    root.querySelector('#pdPlus').onclick = () => { quantity++; render(); };
    root.querySelector('#pdQuantity').onchange = event => {
      quantity = clampQuantity(event.target.value, max);
      event.target.value = quantity;
      // Do not replace the Add button on input blur: doing so swallows the
      // shopper's pending click when they type a quantity then immediately add.
      root.querySelector('#pdMinus').disabled = quantity <= 1;
      root.querySelector('#pdPlus').disabled = quantity >= max;
      const currentPrice = unitPrice(p, Math.max(1, quantity + (state.cart[p.id] || 0)));
      root.querySelector('.pd-price').innerHTML = `<small>KSh</small> ${Number(currentPrice).toLocaleString('en-KE')}`;
      root.querySelector('.pd-total strong').textContent = ksh(currentPrice * quantity);
    };
    root.querySelector('#pdAdd').onclick = () => {
      // Re-read stock and basket at the moment of purchase, not from rendered markup.
      const current = prod(selected);
      const allowed = available(current?.stock, state.cart[selected]);
      if (!current || !allowed) { render(); return; }
      const requested = clampQuantity(document.querySelector('#pdQuantity').value, allowed);
      add(current.id, requested);
      const modal = document.querySelector('.modal.show');
      if (modal) {
        returnFocus = '#pdAdd';
        modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
        const heading = modal.querySelector('h2');
        if (heading) { heading.id = heading.id || modal.id + 'Title'; modal.setAttribute('aria-labelledby', heading.id); }
        modal.querySelector('button,input,select')?.focus();
      }
    };
    if (focused) {
      const control = document.getElementById(focused);
      (control?.disabled ? root.querySelector('#pdQuantity') : control)?.focus({ preventScroll: true });
    }
  }
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[data-product-link],a[data-product-browse]');
    if (!anchor || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (anchor.hasAttribute('data-product-link')) navigate(readProduct(anchor.href));
    else {
      browse(true);
      if (anchor.dataset.div) { state.q = ''; document.querySelector('#search').value = ''; goShop(anchor.dataset.div, anchor.dataset.cat); }
    }
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-product-retry]')) loadCatalogue();
    if (returnFocus && !document.querySelector('.modal.show')) {
      document.querySelector(returnFocus)?.focus({ preventScroll: true });
      returnFocus = null;
    }
  });
  document.addEventListener('keydown', event => {
    if (!returnFocus) return;
    const modal = document.querySelector('.modal.show');
    if (!modal) { document.querySelector(returnFocus)?.focus(); returnFocus = null; return; }
    if (event.key === 'Escape') {
      event.preventDefault(); closeAll(); scope._pendingAdd = null; scope._pendingAddQty = null;
      document.querySelector(returnFocus)?.focus(); returnFocus = null;
    } else if (event.key === 'Tab') {
      const controls = [...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select,a[href]')].filter(el => !el.hidden);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  scope.addEventListener('popstate', () => navigate(readProduct(scope.location.href), false, true));
  scope.XanaProductDetail = { render, browse, href };
})(typeof window !== 'undefined' ? window : {});
