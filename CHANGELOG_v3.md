# TORAMI TRAVEL v3 — 2026-11-15

## Changes
- **GoatCounter**: every live HTML page uses `https://torami-travel.goatcounter.com/count`; events remain in `assets/js/app.js`.
- **Instagram**: links to `https://www.instagram.com/findmeoutthere25/` in navigation/footer.
- **35 countries**: 35 is the authoritative visit count. The actual visited country list in `data/destinations.js` is **unverified**; it was estimated from a screenshot and must be corrected before publishing personal travel claims.
- **Default Japanese** regardless of browser language; English only when chosen and remembered in localStorage.
- Country names use `data/country-ja.js`, built from Japanese territory labels with exceptions; country/city results and map tooltips change by language.
- Home simplified: hero, 3 actions, destination previews, gacha and Instagram. The map and search moved to `atlas.html`.
- New luxury background: `assets/images/luxury-atlas-bg.webp`, emerald gradient map with high-contrast outlines.

## Upload
Unzip, then upload the **contents** of the folder to the GitHub Pages publishing root, replacing existing files. Ensure `index.html`, `atlas.html`, `destination.html`, `gacha.html`, `journeys.html`, `assets/`, `data/` are at the same root.

## Notes
The reference images are conceptual. HTML/CSS reproduces the aesthetic, not every pixel of the static mockup. Example destination stories are placeholders. Do not publish them as first-hand accounts. Safety information is not live.
