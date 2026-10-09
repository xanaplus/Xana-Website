---
name: Shared Xana Plus data
description: The owner's requirement that this website use the same database as Xana Plus App.
---

The user wants this website to share the same database as the Xana Plus App. The selected shared-data scope is products, prices, and stock only.

**Why:** The user asked for a shared database.

**How to apply:** Inspect the Xana Plus App's existing backend and data model before connecting the website. Do not create a separate source of truth or migrate the app's existing database without explicit permission. Leave customer accounts, orders, payment records, prescriptions, and clinic bookings outside this integration unless the user expands the scope.

The user states: “bc is the source of truth.”

**Why:** The user explicitly confirmed BC's authority when asked about conflicting catalogue classifications.

**How to apply:** Treat BC as authoritative for shared catalogue data. Do not resolve conflicting BC fields by guessing from product names or adding independent website overrides. Corrections require authoritative BC changes before verifying the synced app and website results.

Some BC item classifications are off; the user will fix them later.

**Why:** The user asked to remember this and defer corrections.

**How to apply:** Leave these classifications unchanged. BC remains the source of truth; do not resume correction work unless the user requests it.
