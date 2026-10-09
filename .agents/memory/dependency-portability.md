---
name: Dependency portability
description: Replit package installs can produce lockfiles that fail on external build servers.
---

Check lockfile download hosts after installing or updating dependencies for the Vercel-hosted website.

**Why:** Replit's installer recorded internal package-firewall URLs. Vercel cannot resolve that host, so dependency installation failed before the website build.

**How to apply:** Keep public packages resolved through the public npm registry while retaining exact versions and integrity hashes. Check portability after dependency updates; a successful install within Replit alone does not verify an external build.
