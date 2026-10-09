---
name: Shared Xana Plus data
description: The owner's requirement that this website use the same database as Xana Plus App.
---

The user wants this website to share the same database as the Xana Plus App.

**Why:** The user asked for a shared database.

**How to apply:** Inspect the Xana Plus App's existing backend and data model before connecting the website. Do not create a separate source of truth or migrate the app's existing database without explicit permission. Do not assume shared database access also authorizes shared customer sessions or unrestricted access to prescription data.
