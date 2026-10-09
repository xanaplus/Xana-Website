# Xana Life: build brief for Replit

Read this first, then `AGENTS.md`, `docs/adr/` and `design/README.md`.

## What this is

Xana Life is an online shop in Nairobi with five divisions: Pharmacy, Retail, Deli, Liquor and Wholesale, plus clinic bookings. The design is **finished and approved**. The 19 screens are in `design/screens/`. The live front end is a single static file, `index.html`, with `assets/` and `img/`. It is deployed at https://xana-web.vercel.app/.

Today `index.html` is a working demo. Basket item numbers and quantities are saved locally on the shopper's device and checked against the live catalogue before restoration. Prices, age confirmations, prescriptions and customer details are not saved with the basket. Missing, unavailable and prescription items are removed; age-restricted items must be added again through the age check after reopening. Catalogue failures retain saved entries for retry without showing unverified totals. Checkout remains disabled; orders, prescription upload and clinic booking are browser-only simulations. The goal is to make these real for a launch.

## Run the imported demo on Replit

- Click **Run** to start the **Xana Life demo** workflow, or run `node server.cjs`.
- Open Preview. The server listens on `0.0.0.0:5000` and serves `index.html`, `assets/`, and `img/` only.
- No dependency installation, build step, secrets, or external services are required for this demo. Node.js 20 is already configured.
- The approved layout is unchanged. Checkout is disabled and explicitly labelled as a demo; it cannot create orders, clear the basket, or initiate payments. The Orders panel explains that real Xana Plus App orders are not displayed. Prescription uploads and clinic bookings remain browser-only simulations; they do not save/send customer data.
- The product catalogue now reads the Xana Plus App's customer-facing Supabase `catalogue` view through `/api/catalogue`. It uses the same Business Central-synced prices, inventory and photos as the app. The underlying `products` table (including costs and margins) is never exposed. If the read fails, no demo prices or stock are shown.
- Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to this project's Secrets, using the Xana Plus App's existing `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` values. Only its **publishable/anon** key is accepted; do not use a service-role key.
- The production site at Vercel also requires **these two environment variable names** in its Vercel project settings before deploying the updated website. Replit Secrets do not transfer to Vercel. Set them for Production (and Preview if desired), then redeploy; do not sync this change to a live Vercel site before configuring its environment.
- `/api/catalogue` is a Vercel function in production and is served by `server.cjs` for Replit preview. Both share the same read-only handler. No database migration or separate database is needed. This is not an order or payment backend.
- The app's catalogue does not include discounted/wholesale tier prices; the website does not fabricate these. Existing product-specific demo ad bookings need matching Business Central item numbers before they can appear with live catalogue items.
- Selling units: BC prices and stock are per the item's BC base unit, which the shared catalogue does not publish yet. The site no longer reads pack sizes from names, offers whole units only, and shows the unit once `selling_unit` is published. See `docs/selling-units.md`; do not enable real checkout before then.
- Division matching and the optional shared-catalogue contract are documented in `docs/catalogue-classification.md`. The website can consume verified item-specific tiers when the app publishes them, but no live BC tiers or dedicated website classifications have been added upstream yet.

## Rules

- **Do not change how the site looks.** No new sections, decoration, animation or restyling. The owner wants a simple shop that does not look AI-made. The layout decision is in `docs/adr/0001-products-first-calm-catalogue.md` and the ad rules are in `docs/adr/0002-ad-slots-and-ad-rules.md`. If something contradicts them, flag it instead of changing it.
- Pharmacy must stay conspicuous without overshadowing Retail. Keep all five divisions.
- Keep the front end as plain HTML, CSS and JavaScript with no build step. Add a backend next to it. Change `index.html` only to call the backend in place of the demo code.
- Never name a class or id after ads (`ad-*`, `banner-ad` and similar). Ad blockers hide them.
- Prices are in KSh. Show "KSh", never "KES".

## Product image delivery

Run `npm ci` before starting the server. `sharp` generates uncropped WebP copies at 96, 320, 640 and 1024 pixels via `/api/product-image`, shared by Replit and Vercel. Only product filenames from the existing Xana image host are accepted; redirects and arbitrary URLs are rejected. Responses are browser/CDN cached and the server keeps a bounded short-lived cache. The client uses responsive sizes, prioritizes the first cards and retries the original URL if optimization fails. Original photos and BC data are unchanged.

## Where the demo code is in `index.html`

| What | Where |
| --- | --- |
| Catalogue | `catalogue.cjs` reads the Xana Plus App's Supabase `catalogue` view; `index.html` fetches `/api/catalogue` and renders its products (`rx:true` marks prescription-only, `age:true` marks liquor). The old demo list is inert reference data. |
| Divisions and categories | `DIVS`, `CATS` |
| Ad bookings and rules | `PROMOS`, and `adAllowed()` |
| Basket and orders | the `state` object, `checkout()` |
| Prescription upload | the click handler on `#rxSubmit` |
| Clinic booking | the click handler on `#clSubmit` |
| Delivery areas | `renderLoc()` |
| Age check | `state.age` (kept in memory only) |

## What to build, in this order

1. **Catalogue from a database.** Move `PRODUCTS` into a database with stock, prices and photos, and serve it to the page. Add a simple admin page for the owner to edit prices and stock. Deli prices are placeholders until the owner sends the real list.
2. **Orders and M-PESA.** Replace `checkout()` with a real order: save it, start an M-PESA payment (Safaricom Daraja STK push), and mark the order paid when the payment callback arrives. Delivery is free over KSh 2,500 and KSh 250 under it. The Orders screen reads from this.
3. **Prescriptions.** Replace the `#rxSubmit` handler: store the uploaded file securely, notify the pharmacist, and never sell a `rx:true` product without an approved prescription. Prescription-only products are never advertised.
4. **Clinic bookings.** Replace the `#clSubmit` handler: save the booking and send an SMS confirmation. The visit costs KSh 800, payable at the clinic.
5. **Age check.** Liquor is not for sale to under-18s and ID is checked on delivery. Keep the 18+ prompt, and record the confirmation with the order.
6. **Ads.** Keep every booking in `PROMOS` and enforce the rules in `docs/adr/0002-ad-slots-and-ad-rules.md` on the server too.

## Things only the owner can provide

Do not invent these. Ask, and leave a clear placeholder until they arrive.

- Safaricom Daraja credentials and the paybill or till number.
- The real Deli price list.
- The pharmacist's WhatsApp number (`PROMOS.pharmacist.whatsapp` is empty) and the business WhatsApp and SMS numbers for `PROMOS.capture`.
- Product photos from suppliers. Photo sources and credits are in `img/credits.json`; open photo work is in `.scratch/product-photos/issues/`.
- Privacy policy, terms, and Data Protection Act registration for storing prescriptions and customer details.
