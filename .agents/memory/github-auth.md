---
name: GitHub source-control authentication
description: Distinguish Git provider authentication from ordinary Replit integrations.
---

Replit's GitHub source-control connection is not an ordinary connector. Generic integration cards can reject its connection identifier even when discovery reports the account as authorized or healthy.

**Why:** The integration attachment reported automatic Git authentication, but Git operations rejected authentication and generic reconnect/connect cards could not handle this source-control connection. Official Replit documentation directs recovery through Git Providers settings.

**How to apply:** Treat successful Git operations—not integration health alone—as evidence of working authentication. If Git rejects credentials and the generic connection card cannot open, ask the user to reconnect GitHub through Replit's Git Providers settings and verify repository or organization access. Never request or inspect their token.
