#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Install the locked image optimizer dependency; no database migration is needed.
npm ci --no-audit --no-fund
for source in server.cjs catalogue.cjs classification.cjs product-image.cjs api/*.js; do
  node --check "$source"
done
node --test tests/*.test.cjs
