# Ad slots and the rules every paid placement follows

Status: accepted, 2026-10-08

## Context

The shop sells paid placements to suppliers. Kenya restricts advertising prescription-only medicines to the public, and liquor is age-restricted (18+). Paid slots must also not erode trust in the pharmacy.

## Decision

All bookings live in the `PROMOS` object in `index.html`; product data (price, photo) is always read from the booked product so ads cannot drift.

| Slot | Where | Booking |
| --- | --- | --- |
| Offers carousel | Above the product grid; auto-advances every 3 s (`adDelay`), pauses on hover, focus, hidden tab, off-screen, and reduce-motion | `PROMOS.ads` |
| Phone offer bar | Above the bottom nav on small screens, mirrors the current carousel slide | (follows `ads`) |
| Sponsored product | Position 2 of the grid, only if the product is already in the results | `PROMOS.sponsored` |
| Sponsored search result | Position 2 of search results when the query contains a booked term | `PROMOS.searchSponsored` |
| Category takeover | Strip above the grid when its category or division is open | `PROMOS.takeover` |

Rules, enforced in code by `adAllowed()` for every slot:

1. Never advertise a product marked `rx:true`.
2. Never advertise a product marked `age:true` until the visitor has passed the 18+ check (`state.age`).
3. Never advertise an out-of-stock product.
4. Paid placements are labelled "Sponsored". The first grid position stays editorial.

The carousel and the phone offer bar have **no close button**, at the owner's request.

Never place ads in the Pharmacy/Retail cards, the division tabs, the prescription upload, the age check, or checkout.

## Consequences

Removing the deals rail also removed its sponsored card; "On offer" products are reachable through the category chip instead. Liquor ads cannot appear in the carousel, because the age check is not remembered between visits.
