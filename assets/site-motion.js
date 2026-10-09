/* Presentation only. Commerce handlers never wait for motion to finish. */
(function () {
  'use strict';
  const seenProducts = new Set();
  const seenSections = new WeakSet();
  const pending = new Map();
  const media = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let observer = null;

  function remember(element, key) {
    if (key !== null) seenProducts.add(key);
    else seenSections.add(element);
  }
  function available() {
    return !!media && !media.matches && typeof window.IntersectionObserver === 'function';
  }
  function ensureObserver() {
    if (!available()) return false;
    if (!observer) {
      observer = new window.IntersectionObserver(entries => {
        let stagger = 0;
        entries.forEach(entry => {
          if (!entry.isIntersecting || !pending.has(entry.target)) return;
          const element = entry.target;
          const key = pending.get(element);
          pending.delete(element);
          observer.unobserve(element);
          remember(element, key);
          if (!element.isConnected || !available()) return;
          element.style.setProperty('--motion-delay', `${Math.min(stagger++ * 24, 96)}ms`);
          element.classList.add('motion-enter');
        });
      }, { threshold: 0, rootMargin: '0px' });
    }
    return true;
  }
  function register(element, key) {
    if (key !== null ? seenProducts.has(key) : seenSections.has(element)) return;
    if (!ensureObserver()) {
      remember(element, key);
      return;
    }
    pending.set(element, key);
    observer.observe(element);
  }
  function registerGrid(grid) {
    // renderGrid rebuilds DOM on basket updates/refreshes. Identity is the SKU,
    // never a DOM node or grid index. Release replaced off-screen nodes as well.
    pending.forEach((key, element) => {
      if (key === null) return;
      if (observer) observer.unobserve(element);
      pending.delete(element);
    });
    grid.querySelectorAll('.card[data-motion-product]').forEach(card => {
      register(card, card.dataset.motionProduct);
    });
  }
  function preferenceChanged() {
    if (!media.matches) return; // Do not replay content when motion is re-enabled.
    pending.forEach((key, element) => remember(element, key));
    pending.clear();
    if (observer) observer.disconnect();
    observer = null;
    document.querySelectorAll('.motion-enter').forEach(element => {
      element.classList.remove('motion-enter');
      element.style.removeProperty('--motion-delay');
    });
  }
  if (media) {
    if (media.addEventListener) media.addEventListener('change', preferenceChanged);
    else if (media.addListener) media.addListener(preferenceChanged);
  }
  document.addEventListener('animationend', event => {
    if (event.animationName !== 'siteEnter') return;
    event.target.classList.remove('motion-enter');
    event.target.style.removeProperty('--motion-delay');
  });
  window.XanaMotion = { registerGrid };
  document.querySelectorAll('.lead,.offers,.cat-head,.bulk,.capture,footer').forEach(section => {
    register(section, null);
  });
})();
