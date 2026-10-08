# Replace product photos so the catalogue reads as one clean shelf

Status: ready-for-human

The product grid now shows every photo whole, on white, with the same padding. That works best with
front-of-pack cut-outs on a plain white or light grey background, about 800 × 800 px or larger.
The photos below either show the wrong item, have stray text in them, are missing, or are styled
scenes that look out of place next to cut-outs.

Product ids are the `id` values in the `PRODUCTS` list in `index.html`. To swap a photo, drop the new
file in `img/app/` and change that product's `img` path.

## 1. Wrong item in the photo (fix first)

| id  | Product                  | What the photo shows instead           | Status |
| --- | ------------------------ | -------------------------------------- | ------ |
| s6  | White Sugar 2 kg         | A jar of acacia honey                  | Photo removed; placeholder shown until a sugar photo arrives |
| w3  | Sugar Bale · 2kg units   | The same honey jar                     | Photo removed; placeholder shown |
| s22 | Omo Hand Washing Powder  | A Harpic toilet cleaner bottle         | Fixed: now uses `img/app/wholesale-pack-2.jpg` (Omo 1 kg) |
| s4  | Spago Spaghetti          | Spago **penne rigate**                 | Needs a spaghetti photo, or rename the product |
| p23 | Durex Classic            | Durex **Fetherlite** pack              | Needs a Classic photo, or rename the product |
| s13 | Bio Whole Milk 500 ml    | A **2 litre** pack                     | Needs a 500 ml photo, or change the pack size |
| p13 | Sunscreen Lotion SPF 50 (brand: Generic) | A La Roche-Posay bottle | Needs a generic photo, or set the brand to La Roche-Posay |

## 2. Stray text inside the photo

| id  | Product               | Problem |
| --- | --------------------- | ------- |
| p1  | Panadol Extra Tablets | Caption "Screen 8a: Pharmacy & Wellness" in the top-left corner |
| p19 | Betadine Antiseptic   | Small caption text in the top-left corner (check and crop) |
| p20 | Hansaplast Strips     | Small caption text in the top-left corner (check and crop) |

## 3. No photo yet

p16 Metformin 500mg · d5 Whole Rotisserie Chicken (the only rotisserie photo has a US "$8.99/lb" price tag) ·
w1 Maize Flour Bale · w5 Wheat Flour Bale · w6 Toilet Tissue Bale · s6 White Sugar · w3 Sugar Bale

## 4. Styled scenes, replace when convenient

These are fine to keep for now, but read as lifestyle photos next to cut-outs.

- **Pharmacy, product on a shelf or counter:** p2, p3, p6, p7, p8, p9, p10, p11, p14, p15, p17, p18, p21, p24
- **Phone photos with busy backgrounds:** p22, s1, s3, s8, s16, s17 (back of pack), s18, s19, s20, s21
- **Retail and wholesale scenes:** s5, s7, s25, s26, s27, w2, w4, w7, s12
- **Liquor:** v1, v2

Deli photos (d1 to d4) are counter scenes on purpose and can stay.

## Comments

**2026-10-08:** Swapped the 17 Open Food Facts photos (img/*.jpg from openfoodfacts.org) for the full-size originals of the same images, resized to 900 px on the long side. Same source and licence, so img/credits.json still applies. These phone snapshots now fill their card (`fit:'cover'` in PRODUCTS, with `pos` setting the crop point) instead of floating on white. Still to replace: **s17 Fahari Ya Kenya Tea**, whose only full-size front photo is actually the back of the pack.

**2026-10-08 (later):** Set `fit:'cover'` on 36 more products whose photos have their own background (the 512 × 279 pharmacy shots, deli and produce scenes, Strepsils, ORS, Durex, Amoxicillin, Duka pack). They were showing as small boxes with white bars, and now fill the card like the rest. Still shown whole on white: the bottle shots (wine, Tusker, gin, Kenya Cane, Smirnoff), Vicks, sunscreen, hand sanitiser and Harpic (only 144 px). The Panadol caption in the top-left corner still shows a little; it needs a replacement photo.

**2026-10-08 (placeholders):** AI placeholder photos (Gemini) now on s6 White Sugar, d5 Rotisserie Chicken, s13 Bio Whole Milk and p13 Sunscreen, in `img/placeholder/`. Swap for supplier pack shots when they arrive. Held back, kept locally but not committed: Metformin (box misspells "Hydrochloride"), Fahari and Durex (look like real brand photos of unknown source), penne (product is listed as spaghetti).

**2026-10-08 (order):** Products with `weak:1` in PRODUCTS, or no photo, now sort after the good photos under Recommended. Remove `weak:1` when a product gets a better photo. Also to replace: **w7 Duka Starter Pack**, whose photo shows cosmetics bottles, not staples.
