---
name: BC selling units
description: What one catalogue price/stock count means and why pack sizes are never parsed from names.
---

BC item unit price and inventory are both in the item's base unit of measure, which the shared catalogue did not publish as of Oct 2026. Names are unreliable (e.g. "Bale x 6Pc" with 9 Pk; box items with half-box stock).

**Why:** Task brief and owner rule "BC is the source of truth"; the audit found 1,089 fractional-stock rows and ambiguous bale/outer/box names.

**How to apply:** Never infer quantity/pack from names. Offer whole units only. Reject quantity tiers without a published selling unit. Keep real checkout disabled until the app publishes `selling_unit`; the proposed upstream migration needs BC admin confirmation of field names first.
