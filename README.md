# Decide Fate

This folder is the primary working project for the current chat, as requested by the owner on 2026-10-28. Continue development here rather than the earlier scratch copy.

Read `START-HERE.md`, `DESIGN-AGREEMENTS.md` and `VISUAL-UPDATE.md` for the original design and implemented changes.

## Current state

- Imported baseline: EverTale Prototype 13 archive.
- Display name: Decide Fate.
- Approved illustrated opening screen and anime-style isometric grid props are implemented in `dist/`.
- Browser checks passed for editor operations, movement/climbing, camera picking, 40×40 scene persistence, and mobile layout. Supabase transport was mocked during QA.
- Owner clarification: the earlier version was a set of files tested in Codex, not an existing deployed website. The current workflow is local development and testing here.
- Treat the uploaded archive plus this checkout's changes as the working source. References to Sites/URLs in the original handoff are historical metadata, not a prerequisite for current work.
- Existing Supabase configuration is retained; keep account, table and save identifiers compatible.
- No website deployment is requested as part of the clarified local-testing workflow. Sites access is not a blocker for development.
- Files have not been committed or pushed to GitHub. The selected GitHub repository returned no refs at the last check.

## Development

Run `node preview.cjs` from this directory. No application install or build is required. See `VISUAL-UPDATE.md` for browser QA commands and screenshots under `artifacts/qa/`.

Keep the existing Supabase configuration and player-save compatibility. Do not rerun setup.sql against the existing database merely for local testing.
