# Original PNG artwork

`png/` preserves the eight original PNG files moved out of the shipped `dist/` tree during the WebP maintenance phase. These are source artwork, not new assets or player uploads. Original provenance remains with the existing asset documentation.

The shipped counterparts under `dist/assets/` use **lossless WebP**, identical dimensions and identical decoded RGBA bytes, including RGB beneath transparent pixels. Existing procedural/vector load-error fallbacks remain in the renderer; PNG duplication is not required in the download.

Conversion used Pillow's WebP encoder with `lossless=True, quality=100, method=6, exact=True`. Verify both decoded size and `convert('RGBA').tobytes()` equality before replacing a source. Pillow is an offline maintenance tool, not an application dependency.

See `reports/asset-webp-phase4.json` and `ASSET-OPTIMIZATION.md` for measurements and visual/camera checks. Title artwork and legacy anime parts are retained in WebP even where current icon-based gameplay does not display them.
