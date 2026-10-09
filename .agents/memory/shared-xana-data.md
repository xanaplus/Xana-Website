---
name: Shared Xana Plus data
description: The owner's requirement that this website use the same database as Xana Plus App.
---

The user wants this website to share the same database as the Xana Plus App. The selected shared-data scope is products, prices, and stock only.

**Why:** The user asked for a shared database.

**How to apply:** Inspect the Xana Plus App's existing backend and data model before connecting the website. Do not create a separate source of truth or migrate the app's existing database without explicit permission. Leave customer accounts, orders, payment records, prescriptions, and clinic bookings outside this integration unless the user expands the scope.
