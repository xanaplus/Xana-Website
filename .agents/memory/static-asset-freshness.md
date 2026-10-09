---
name: Static asset freshness
description: Prevent stale CSS and JS after storefront changes.
---

When changing unbundled storefront CSS or JavaScript, update its versioned URL in the HTML.

**Why:** Preview captures and repeat visitors can retain old assets even after a workflow restart, producing mixed old/new layouts and behaviour.

**How to apply:** Version each changed asset reference together with its integration changes. A server restart alone does not invalidate a browser's fresh cached response.
