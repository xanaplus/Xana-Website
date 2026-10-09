# Products first, calm catalogue layout

Status: accepted, 2026-10-08

## Context

The owner found the earlier page cluttered and "AI obvious", and pointed at https://quickmart.tekrova.co.ke/ as the simplicity to aim for. They also want Pharmacy to be conspicuous without overshadowing Retail, and all five divisions (Pharmacy, Retail, Deli, Liquor, Wholesale) kept as in the Xana app.

## Decision

- **Order of the page:** header (logo, delivery area, search, basket) → division tabs → one slim row with Pharmacy and Retail as equal cards → the offers carousel → the product grid → one "Buying for a shop, school or event?" box → footer. Products are visible in the first screen on desktop.
- **Pharmacy stands out by position and action, not by size:** it is the first card and carries "Upload prescription" plus a Nairobi-time on-duty line. Retail gets the same card size and a primary button.
- **Divisions are text tabs**, not photo tiles. Categories are a chip row with an "On offer" chip first; a Sort select replaces the old filter sidebar.
- **One accent colour, green.** Gold/yellow is used only for discount badges.
- **No decoration that reads as generated:** no gradients, glows, swooshes, icons in front of headings, eyebrow labels above headings, hover lift/zoom, or scroll-in animations. Motion is limited to explaining an action (basket bounce, drawer slide, modal and toast entrance).
- **Type:** Libre Franklin for headings and prices, Atkinson Hyperlegible Next for text, both self-hosted in `assets/fonts/`. Digits always come from Franklin (Atkinson slashes its zero).
- **Product cards share one anatomy:** brand and division, name, pack, large price, (wholesale) tier table, one "Add to basket" button. Product photos sit whole on white without cropping or stretching, including basket thumbnails and product promotions. Updated at the owner's request on 2026-10-09 because the crop-to-fill treatment cut off products; card dimensions remain unchanged.

## Consequences

- Removed: the large Pharmacy hero, Deli/Liquor/Wholesale photo tiles, the deals rail, the filter sidebar (price slider, brand ticks, in-stock), and the Rewards/Gifting/Clinics/Store cards. Bring any of them back only with the owner's say-so.
- New sections should earn their place against "would a shopper miss it?"; the owner asked explicitly for no unnecessary additions.
