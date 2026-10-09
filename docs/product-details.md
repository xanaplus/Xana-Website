# Storefront product details

Catalogue image/name links open `/?product=<encoded item number>`. The query URL
is reloadable and shareable on Replit and Vercel without rewrite rules. Navigation
uses `pushState` and `popstate`; browse/search/department actions remove only the
product parameter. The header, footer and in-memory basket stay in place.

Presentation lives in `assets/product-detail.js` and `assets/product-detail.css`.
The small hooks in `index.html` notify details of catalogue loading and refresh,
provide semantic catalogue links, and return navigation/search to browsing.
The detail image uses the existing image helper's `detail: true` option.

Details show only catalogue fields, current stock/price, factual metadata and
same-department/same-category products. No inferred brand, description, rating,
discount or delivery promise is introduced. Loading, retryable error, absent
item and out-of-stock states are explicit.

Quantities are whole units bounded by stock minus quantities already in the
basket. Purchase re-reads stock; catalogue refresh re-clamps quantities.
Prescription-only items open the existing prescription flow, not a basket
success. Age confirmation preserves the requested quantity and re-checks stock
when confirmed. Dismissing the modal clears pending purchase. Detail-launched
safety dialogs receive focus, trap Tab, close on Escape and restore focus.
Checkout remains disabled; this is not an ordering/payment implementation.

Run `node --test tests/*.test.cjs`. Focused detail tests cover query encoding,
deep-link states, browse/popstate, escaping, quantity bounds, stock refresh,
prescription gating and pending age quantities. These use Node VM DOM stubs;
they do not replace browser interaction tests. Existing server catalogue
failure and basket persistence behavior is otherwise unchanged.
