/* Small homepage adapter. All prices, product links and purchase controls are shared. */
(function(scope) {
  'use strict';
  const helpers = scope.XanaHomeCatalogue;
  let previousProducts, previousStatus, previousCart;
  let ageFocus = null;
  function rememberAgeFocus() { ageFocus = document.activeElement; }
  function restoreAgeFocus() { ageFocus?.focus({preventScroll:true}); ageFocus = null; }
  function resetFilters() {
    helpers.resetFilters(state);
    document.querySelector('#search').value = '';
    document.querySelector('#sortSel').value = 'rec';
  }
  function destination(div,cat) { goShop(div,cat); }
  function home() {
    scope.XanaProductDetail?.browse();
    resetFilters();
    state.browsing = false; state.div = 'All'; state.cat = 'All';
    resetVisible(); renderAll();
    scope.scrollTo({top:0,behavior:adOff()?'auto':'smooth'});
    document.querySelector('#homeTitle').focus({preventScroll:true});
  }
  function render() {
    const active = helpers.isHome(state, new URL(scope.location.href).searchParams.get('product'));
    document.body.classList.toggle('shop-browsing',!active);
    const root = document.querySelector('#homeShop');
    root.hidden = !active;
    if (!active) return;
    // renderAll also refreshes the PDP adapter. Do not rebuild a shelf twice or
    // disturb focused controls when nothing about the catalogue/basket changed.
    const cart = JSON.stringify(state.cart);
    if (PRODUCTS === previousProducts && catalogueStatus === previousStatus && cart === previousCart) return;
    previousProducts = PRODUCTS; previousStatus = catalogueStatus; previousCart = cart;
    const categories = document.querySelector('#homeCategories');
    const shelves = document.querySelector('#homeCollections');
    root.setAttribute('aria-busy',String(catalogueStatus === 'loading'));
    if (catalogueStatus === 'loading') {
      categories.innerHTML = Array.from({length:5},()=>'<div class="home-loading-tile skeleton-block" aria-hidden="true"></div>').join('');
      shelves.innerHTML = '<p class="sr-only" role="status">Loading shopping categories and current products…</p>';
      return;
    }
    if (catalogueStatus === 'error') {
      categories.innerHTML = '';
      shelves.innerHTML = '<div class="home-state" role="status"><b>Catalogue unavailable</b><p>We could not check the live catalogue. Please try again.</p><button type="button" class="btn g" data-home-retry>Try again</button></div>';
      shelves.querySelector('[data-home-retry]').onclick = loadCatalogue;
      return;
    }
    const tiles = helpers.shortcuts(PRODUCTS);
    categories.innerHTML = tiles.map((tile,index)=>`<button type="button" class="home-category" data-home-category="${index}" aria-label="${escapeHtml(tile.label)}: browse ${escapeHtml(tile.div)}${tile.cat === 'All' ? '' : ', '+escapeHtml(tile.cat)}">
      <span class="home-category-art"><svg class="ic" aria-hidden="true"><use href="#${tile.icon}"/></svg></span>
      <span class="home-category-copy"><strong>${escapeHtml(tile.label)}</strong></span>
    </button>`).join('');
    categories.querySelectorAll('[data-home-category]').forEach(button => {
      const tile = tiles[Number(button.dataset.homeCategory)];
      button.onclick = () => destination(tile.div,tile.cat);
    });
    shelves.innerHTML = '';
    const collections = helpers.collections(PRODUCTS);
    for (const [shelfIndex,collection] of collections.entries()) {
      const section = document.createElement('section');
      section.className = 'home-shelf';
      const headingId = 'homeShelf'+shelfIndex;
      section.setAttribute('aria-labelledby',headingId);
      section.innerHTML = `<div class="home-shelf-head"><div><h3 id="${headingId}">${escapeHtml(collection.label)}</h3><p>${escapeHtml(collection.copy)}</p></div><button type="button" class="home-shelf-link" aria-label="Browse ${escapeHtml(collection.label)}">View all <svg class="ic" aria-hidden="true"><use href="#i-arrow-right"/></svg></button></div><div class="grid"></div>`;
      section.querySelector('button').onclick = () => destination(collection.div,collection.cat);
      const grid = section.querySelector('.grid');
      collection.products.forEach((p,index) => grid.appendChild(createProductCard(p,index,false,collection.div)));
      shelves.appendChild(section);
    }
    if (!PRODUCTS.length) shelves.innerHTML = '<div class="home-state"><b>No catalogue products to show yet</b><p>Check back for current products, or explore pharmacy and clinic services below.</p></div>';
  }
  scope.XanaHome = {render,resetFilters,destination,home,rememberAgeFocus,restoreAgeFocus};
  document.addEventListener('click',event => {
    if (!event.target.closest('[data-home-return]') || event.button !== 0 ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); home();
  });
  document.querySelector('#homeBrowse').onclick = () => destination('All','All');
  document.querySelector('#homeClinic').onclick = () => openClinic();
  document.addEventListener('keydown',event => {
    const modal = document.querySelector('#ageModal');
    if (!modal.classList.contains('show') || !ageFocus || !scope._pendingDiv) return;
    if (event.key === 'Escape') {
      event.preventDefault(); closeAll(); restoreAgeFocus();
    } else if (event.key === 'Tab') {
      const first = document.querySelector('#ageNo'), last = document.querySelector('#ageYes');
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})(window);
