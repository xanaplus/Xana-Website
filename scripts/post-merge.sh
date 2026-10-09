#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# This site uses Node built-ins; no dependency install or database migration is needed.
for source in server.cjs catalogue.cjs classification.cjs api/catalogue.js; do
  node --check "$source"
done
node --test tests/*.test.cjs
