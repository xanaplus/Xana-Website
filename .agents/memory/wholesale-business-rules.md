---
name: Wholesale business rules
description: Business Central is authoritative for quantity-based wholesale eligibility.
---

The owner said: “include the obvious names and also we have tiers where when lets say you buy 6 items or more it switches to wholesale.”

**Why:** Wholesale is also quantity-based, not solely a separate class of bulk-named products. The owner says these rules come from BC Dynamics, which Xana Plus App accesses.

**How to apply:** Use obvious bulk names for current shelf classification, but obtain actual thresholds and prices from Business Central and confirm whether quantities apply per item or across items. Six is an example, not a universal minimum. Never use static app demo discounts as live pricing.

Update (Oct 2026): Xana Plus App now publishes BC tiers in the public catalogue as a `price_tiers` column (camelCase: minQty, unitPrice, uom, startsOn, endsOn), not `wholesale_tiers`. The site accepts both. About 136 of 4,363 tiered items carry tiers at or above the standard price; those are ignored as non-discounts, and tiers that mix units are ignored as ambiguous.

**Why:** the owner said the tier integration already runs in the app; the column name was found by re-probing the view, so probe the live view before telling the owner data is missing.

**How to apply:** tier unit comes from the tier's own `uom` when no `selling_unit` is published; checkout stays disabled regardless.
