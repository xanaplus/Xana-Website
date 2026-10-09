# What one catalogue price buys: BC selling units

Business Central (BC) is the source of truth. In BC, an item's `Unit Price` and
`Inventory` are both expressed in the item's **base unit of measure**. The
storefront therefore treats "one price" and "one stock count" as one BC
selling unit. It must not work out pack contents from product names.

## Audit of the shared catalogue (9 Oct 2026)

Read-only audit of the public `catalogue` view (10,774 rows):

| Finding | Count |
| --- | --- |
| Columns published | `item_no, name, price, stock, category, item_category_code, gtin, requires_rx, age_restricted, photo_url, has_photo, in_stock`. No unit of measure. |
| Rows with fractional stock | 1,089 (130 of them between 0 and 1) |
| Names containing "bale" / "outer" / "box" | 251 / 226 / 822 |
| Names with an "N pcs" count | 1,656 |
| Names with a kg size / "per kg" | 616 / 81 |

The data shows why names cannot be used:

- `Blueband Original 500G` costs KSh 300 with 312.76 in stock, while
  `Blueband 500Gm Original Box 24 Pcs` costs KSh 7,000 with 5.5 in stock. The
  name says what is inside the box, but only BC knows whether a half box can be
  sold or whether the stock count means boxes.
- `Velvex Ultra 3Ply Tissue 9 Pk Bale x 6Pc` has three possible quantities in
  its name (9 per pack, 6 packs, 1 bale).
- Weighed items such as `Tomatoes Per Kg` (KSh 99, 724.37 in stock) are priced
  per kilogram.

Xana Plus App's `bc-items-sync` currently selects only `no, description,
itemCategoryCode, lastDirectCost, unitPrice, inventory, barcode,
vATPostingGroup, inventoryPostingGroup`. No unit of measure is synced, so the
unit cannot be identified from the shared data today.

## What the website does now

- The name-derived `pack` text has been removed. Cards, details and the basket
  show only the product name and the BC price.
- `stock` is the number of **whole** selling units (`floor` of BC inventory).
  A fraction of a unit (for example half a box after some pieces were sold) is
  not offered at the full-unit price. Basket quantities remain whole numbers.
- Until a unit is published, `unit` is `null`, `sellingUnitsAvailable` is
  `false`, the detail page shows "Selling unit: Not yet published by Business
  Central", and the basket says "per unit".
- Quantity prices (`wholesale_tiers`) are rejected unless the selling unit is
  published, because "6+ units" is ambiguous without it.

**Launch rule:** do not enable real checkout while `sellingUnitsAvailable` is
`false`.

## Optional public contract (selling units)

The website reads these **three columns together** from `public.catalogue`. If
PostgREST reports one of them missing, the website reads the rest of the
catalogue and reports `sellingUnitsAvailable: false`. Other errors are not
hidden.

| Column | Meaning |
| --- | --- |
| `selling_unit` | BC Item **Base Unit of Measure** code (e.g. `PCS`, `BOX`, `KG`). `price`, `stock` and tier quantities are all per this unit. |
| `selling_unit_label` | Optional customer-facing text from BC's Unit of Measure description (e.g. `piece`, `box`, `kg`). Defaults to the code. |
| `unit_conversions` | Optional JSON array from BC Item Units of Measure: `[{ "unit": "PCS", "qty_per_unit": 0.041667 }]`, where `qty_per_unit` is BC's *Qty. per Unit of Measure* (how many selling units one `unit` contains). |

Validation: codes are 1–20 characters (letters, digits, space, `.`, `_`, `/`,
`-`); labels are at most 40 characters; `qty_per_unit` must be a positive
number; units cannot repeat; the base unit may only appear with quantity 1.
Invalid data makes the catalogue unavailable rather than showing an ambiguous
price.

Display: cards show "Price per box"; details show the selling unit, BC
conversions (for example "24 PCS = 1 BOX"), stock as "5 box in stock" and the
quantity label in the unit; the basket shows "KSh 7,000 per box".

## Upstream change for Xana Plus App (not yet applied)

Nothing has been changed in the Xana Plus App repository or the shared
database. A proposed migration is in `docs/upstream/selling-units-view.sql`.
Before applying it, the BC administrator must confirm:

1. The exact field name for the item's base unit of measure in the Nexus/artemis
   items API (BC standard API uses `baseUnitOfMeasureCode`), and where to read
   Item Units of Measure and Unit of Measure descriptions.
2. That `unitPrice` and `inventory` are both in the base unit for every item.
   If some items are sold in a different *Sales Unit of Measure*, the app must
   publish the price for the unit it sells in, not a converted guess.
3. Why count-based items (boxes, outers, bales) have fractional inventory, and
   whether those items should be sold by piece in BC.
4. For weighed items, the BC quantity rounding precision. The website basket
   uses whole units only, so fractional kilograms need a separate decision.

Then: add the fields to `bc-items-sync` (`SELECT_FIELDS` and `toProductRow`),
apply the migration, and check that the anonymous key can read only the new
customer-facing columns. Test one piece item, one box/bale item with
conversions and one per-kg item in both the app and this website.
