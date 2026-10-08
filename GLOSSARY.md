# Xana Life

The Xana Life shop: a Kenyan pharmacy, grocery, deli, liquor and wholesale shop serving walk-in customers, households and bulk buyers.

## Language

**Design**:
The artifact in this repo: a single self-contained `index.html` that shows the Xana Life shop's browsing experience. It is a design for the shop, not the shop itself: no backend, no transactions.
_Avoid_: prototype, mockup, site, app

**Division**:
The top-level grouping of the catalogue, shown as the tabs under the header. There are five: Pharmacy, Retail, Deli, Liquor, Wholesale. Every product belongs to exactly one division.
_Avoid_: department, section, vertical, aisle

**Deli**:
The fresh-counter division: cured meats, cheeses, cold cuts and hot foods served over a counter.
_Avoid_: meat, butchery, fresh

**Liquor**:
The alcohol division: wine, spirits and beer. Restricted to customers aged 18 and over.
_Avoid_: Wines & Spirits, bar, drinks

**Category**:
A sub-grouping that sits inside exactly one division. Category names are not unique across divisions; the pair (division, category) is.
_Avoid_: tag, aisle, type
