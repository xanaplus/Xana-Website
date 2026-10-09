---
name: Deli classification comes from BC
description: Why kitchen/bakery items showed under Retail, and the owner's decision on how to fix it.
---

The website puts an item in Deli only when BC's item category code (or category) is DELI. As of Oct 2026 BC coded most Xana kitchen/bakery items (pizzas, meals, breads, cakes) as FOODSTUFFS | RETAIL, while DELI-coded items included Duro bags and pigeon peas. BC item numbers prefixed "DEL" mark deli items, but that series also holds kitchen supplies and packaging (cups, boxes, gloves, syrups, cake bases).

Owner decision (Oct 2026): fix the codes in BC, not with website overrides. A review sheet was produced at docs/bc-deli-review.csv for the team to confirm.

**Why:** "BC is the source of truth"; name rules mis-sort (XanaLife spices, water, bouquets; "chicken" crisps, cat food).

**How to apply:** Do not add name-based or item-prefix Deli rules or override lists in website code. Once BC is updated the shop reclassifies automatically (catalogue cache ~30s). There is no website-visibility field for hiding non-customer items; that needs an upstream decision.
