# Web2: Xana Life storefront

Single self-contained `index.html` (~105 KB) plus `assets/` and `img/`. No build step, no dependencies, no `package.json`. Deploy = copy the folder.

## Before changing the design

Read `docs/adr/` first. The owner has settled the layout (ADR-0001) and the ad rules (ADR-0002); flag anything that contradicts them instead of quietly undoing it.

The owner wants a simple shop that does not look AI-made: no new sections, decoration, or animation unless they ask. Pharmacy must stay conspicuous without overshadowing Retail.

## Where things live in `index.html`

- `PRODUCTS`: the catalogue. `rx:true` marks prescription-only items, `age:true` liquor; `fit:'cover'` and `pos` control how a phone-snapshot photo is cropped.
- `DIVS`, `CATS`: divisions and their categories.
- `PROMOS`: every ad booking (see ADR-0002). `adAllowed()` enforces the ad rules.
- Never name a class or id after ads (`ad-*`, `adCarousel`, `banner-ad`…): ad blockers hide them, which is how the offers carousel once vanished for shoppers. The carousel uses `offers` / `offer-*`; check new names against EasyList's `##.name` rules.
- Deli prices are placeholders until the owner sends the real list.

## Preview

Fonts do not load from `file://`. Serve the folder over HTTP, for example `npx serve .` or `python -m http.server`, and check desktop and phone widths before reporting a change as done.

## Open work

- `.scratch/product-photos/issues/01-replace-product-photos.md`: photos to replace (wrong items, stray text, missing photos). Product photos come from Open Food Facts and Wikimedia Commons; credits are in `img/credits.json`.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature-slug>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles, label strings equal to their names: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` at the repo root plus `docs/adr/` for decisions. See `docs/agents/domain.md`.
