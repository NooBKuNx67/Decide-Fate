# Decide Fate

This folder is the primary working project for the current chat, as requested by the owner on 2026-10-28. Continue development here rather than the earlier scratch copy.

Read `START-HERE.md`, `DESIGN-AGREEMENTS.md` and `VISUAL-UPDATE.md` for the original design and implemented changes.

## Current state

- Imported baseline: EverTale Prototype 13 archive.
- Display name: Decide Fate.
- Approved illustrated opening screen and anime-style isometric grid props are implemented in `dist/`.
- Browser checks passed for editor operations, movement/climbing, camera picking, 40×40 scene persistence, and mobile layout. Supabase transport was mocked during QA.
- Owner clarification: the earlier version was a set of files tested in Codex, not an existing deployed website. Development and mocked-save testing continue here; the owner subsequently enabled GitHub Pages.
- Treat the uploaded archive plus this checkout's changes as the working source. References to Sites/URLs in the original handoff are historical metadata, not a prerequisite for current work.
- Existing Supabase configuration is retained; keep account, table and save identifiers compatible.
- Publish through `.github/workflows/pages.yml` on pushes to `main`: https://noobkunx67.github.io/Decide-Fate/. Sites access is not required.
- Campaign combat now supports movement, class actions, enemy AI, props, win/loss, rewards and resumable encounters. Full inventory/equipment and catalog skill effects remain future work.

## Development

Run `node preview.cjs` from this directory. No application install or build is required. See `VISUAL-UPDATE.md` for browser QA commands and screenshots under `artifacts/qa/`.

Keep the existing Supabase configuration and player-save compatibility. Do not rerun setup.sql against the existing database merely for local testing.
