# Xana Life division and quantity-price rules

## Confirmed business rule

The owner said: “include the obvious names and also we have tiers where when
lets say you buy 6 items or more it switches to wholesale.” Business Central
Dynamics is the authority; Xana Plus App has access to it.

Six units is an example, **not** a universal minimum. The website contract below
supports per-item thresholds. Basket-wide or mixed-item quantity rules have not
been verified and must be confirmed with the BC administrator before publishing
tiers. No percentage or wholesale price is inferred.

## Available upstream data

Inspected Xana Plus App's `src/data/live-catalogue.ts`,
`supabase/functions/bc-items-sync/index.ts`, and the catalogue migrations.
The sync publishes item category code, inventory posting group, standard
VAT-inclusive unit price, inventory, and safety flags. It does **not** sync
quantity prices or a dedicated website classification. The app's static
six-unit examples are demo data, not verified BC prices.

No changes have been applied to the shared database or the separate app repo.

## Current classification

- Normalize BC codes and posting groups before matching.
- Keep the app's pharmacy groups, including GENERAL and skin care.
- Keep medicines with a required or unknown pharmacy Rx status protected.
- Liquor remains age-restricted, regardless of its website label.
- DELI code/group identifies Deli; WHOLESALE code/group identifies Wholesale.
- Otherwise recognize explicit bale(s), carton(s), case of, sack(s), wholesale
  and bulk pack wording. A standalone 25kg/50kg size is not proof of wholesale.
- Other items remain Retail. Unknown categories remain “Other”; do not guess
  medical categories from arbitrary names.
- These compatibility rules are not claimed to be BC website classifications.

## Optional public catalogue contract

The website is ready to read the following **three columns together** from
the existing read-only `public.catalogue` view:

| Column | Meaning |
| --- | --- |
| `website_division` | Nullable exact value: Pharmacy, Retail, Deli, Liquor or Wholesale |
| `website_category` | Nullable approved customer-facing category label |
| `wholesale_tiers` | Nullable JSON array of `{min_quantity: integer, unit_price: number}` |

Publish these only after confirming actual BC fields and price-list rules.
Missing columns cause a specific, reported compatibility path
(`classificationFieldsAvailable: false`). Network/authentication/other schema
failures do not fall back. Do not expose `products`, costs or margins.

Quantity prices must be public, KSh, VAT-inclusive, for the same sellable unit
as the standard price. Upstream must resolve currency, unit of measure,
customer eligibility, validity dates and discount combinations. Never publish
customer-specific BC prices as public discounts. Tier minimums must be unique
integers greater than one; prices must be positive, below standard price, and
non-increasing as quantities grow. Invalid data causes catalogue unavailability,
not invented prices.

Verified tiers add an item to Wholesale **alongside** its home division.
The same item number shares one basket quantity across both shelves and appears
once in All. Categories/counts support both shelves. Card and basket prices
switch at the actual threshold and revert when quantity decreases. Rx and
age checks still apply. Without published tiers the real standard price remains,
and the Wholesale note explicitly says quantity discounts are unavailable.

## Upstream work still needed

The BC administrator must identify the actual public quantity-price source and
approved item/category-to-division mapping. Implement its sync in Xana Plus App,
append the optional fields to the public view without changing existing columns,
and verify anonymous access exposes customer-facing data only. Then test a
real item below, at, and above its threshold in both app and website.
