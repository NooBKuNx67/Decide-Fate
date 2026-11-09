# Lossless WebP asset maintenance — phase 4

`dist` file-content total before: **24,726,004 bytes**. After: **18,450,303 bytes**. Saved: **6,275,701 bytes (25.38%)**. These are uncompressed file-content totals, not transfer/compressed or filesystem allocation sizes.

All eight images retain exactly the same dimensions and decoded RGBA bytes, including transparent RGB. Original PNG bytes match the pre-phase Git objects and are preserved under source-assets/png/, outside dist. Existing renderer procedural/vector fallbacks remain; the current game requires no duplicate PNG fallback. Runtime references and capture-visuals.cjs now use WebP, including dynamically assembled forest/cave URLs. Source attribution is updated. No camera/physics/crop coordinates, animation settings or save data changed.

| Asset | Original PNG bytes | Lossless WebP bytes |
| --- | ---: | ---: |
| `title-screen` | 2,859,823 | 2,081,894 |
| `login-background` | 2,724,911 | 1,982,396 |
| `terrain-atlas` | 2,854,289 | 2,073,748 |
| `biome-atlas` | 2,479,695 | 1,669,392 |
| `camp-atlas` | 2,334,195 | 1,490,740 |
| `forest-extras` | 2,653,870 | 1,821,676 |
| `cave-extras` | 2,163,553 | 1,502,268 |
| `characters/anime-parts` | 2,353,833 | 1,526,204 |

## Verification

Before conversion: battle-isometric.test.cjs and grid-closeout-ui.test.cjs passed (2/2); tools/asset-visual-check.cjs captured desktop and touch-mobile landscape login plus three biomes (8 images), all atlases loaded, no horizontal overflow.

After conversion: **44 pure files + 9 browser files passed; 0 failed**. Browser files: battle-isometric, battle-props, battle-biome-props, battle-presets-ui, grid-closeout-ui, grid-icon, creation-ui, orientation, frontend-security-ui. They cover real pan/zoom picking, large maps, touch/keyboard controls, persistence through mocked storage, portrait gate, icon tokens, creation and security. Two additional browser scripts passed: asset-visual-check.cjs and capture-visuals.cjs, including deliberately blocked atlas/procedural fallback. No actual mobile device or Windows/Edge was tested.

The 8 before/after screenshots were compared; representative forest and mobile/login images were visually inspected. Canvas image geometry/dimensions are identical. Their maximum channel difference is 2–3/255 and per-channel mean error is below 0.111/255. Source RGBA is exact; browser image decoding/compositing can still round alpha differently. Desktop login is pixel-identical. Mobile login differs at 8 pixels at the decorative top border (bounds x223–270/y40–41, maximum 33/255); no visible layout/art change was observed. Do not describe these browser screenshots as byte-identical. Detailed values: reports/asset-visual-comparison.json.

Screenshots are in artifacts/qa/asset-before/ and artifacts/qa/asset-after/ (ignored QA artifacts). Machine-readable size/hash data is in reports/asset-webp-phase4.json.

Reproduce captures with the Playwright environment in VISUAL-UPDATE.md and a running preview server:

```sh
node tools/qa-runtime.cjs tools/asset-visual-check.cjs before
# Convert/update assets, then capture the same private mocked scenarios:
node tools/qa-runtime.cjs tools/asset-visual-check.cjs after
node tools/capture-visuals.cjs
```

The phase argument labels capture directories; it does not switch the currently served asset format. PNG originals must be restored in a separate comparison checkout if repeating the original phase baseline later.
