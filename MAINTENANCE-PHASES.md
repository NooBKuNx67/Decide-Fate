# Maintenance phases — 9 Nov 2026

Scope: no gameplay, save-schema, Supabase configuration or internal identifier changes. All browser checks use mocked auth/cloud and fresh private browser contexts, never real player saves. Local Chromium/Linux was tested; Windows/Edge execution remains unverified.

## Phase 1 — CI

Commit 4d2bab3. The original workflow ran 38 files (not 9). cloud.test.cjs was already present. All seven requested files passed individually with node, including the pure-logic look-around.test.cjs. Added the other six, yielding 44 passing CI test files, 0 failing. tools/check.cjs also passed 44 files. No browser suite was added to CI.

## Phase 2 — portable browser imports

Replaced only the Playwright require string in 17 files (not 21); byte comparison against the original confirms no assertion/test-body changes. The shared runner keeps legacy entry-screen handling and now selects an explicit executable, Linux system Chromium or the existing Playwright/channel options. Documented installation and runner use in VISUAL-UPDATE.md. Syntax and simulated Windows/Edge/Linux option resolution passed.

Browser results: **44/47 primary files passed; 3 failed**. Both compatibility entrypoints (catalog.test.cjs and weapon-preview.test.cjs) passed too: **46 passed / 3 failed across 49 invocations**.

The three failures predate these edits: reproduced with test source and qa-runtime.cjs from commit 4d2bab3. browser expects four menus but there are five. tactical-ui expects one-AP behavior (1 != 0). combat has an unseeded legacy fixture: this run timed out choosing the enemy; original source also failed, at the old reward expectation (140 != 135); VISUAL-UPDATE.md already records the missing-enemy problem. These were not rewritten to force green. No passing baseline was observed to regress.

Recommendation: keep browsers outside Pages CI for now. A separate mocked browser workflow should first adopt a deterministic supported acceptance list (tools/check-grid.cjs), install Playwright/browser explicitly and upload failure artifacts. Retire or update obsolete suites only in a separately approved change; do not silently change their assertions here.

| Browser file | Result |
| --- | --- |
| `adventure-ui.test.cjs` | PASS |
| `battle-biome-props.test.cjs` | PASS |
| `battle-editor.test.cjs` | PASS |
| `battle-isometric.test.cjs` | PASS |
| `battle-presets-ui.test.cjs` | PASS |
| `battle-props.test.cjs` | PASS |
| `browser.test.cjs` | FAIL — existing legacy mismatch |
| `catalog-actions-ui.test.cjs` | PASS |
| `catalog-combat-items-ui.test.cjs` | PASS |
| `catalog-loot-ui.test.cjs` | PASS |
| `catalog-services-ui.test.cjs` | PASS |
| `catalog.test.cjs` | PASS |
| `character-art.test.cjs` | PASS |
| `combat-lab-ui.test.cjs` | PASS |
| `combat-polish.test.cjs` | PASS |
| `combat.test.cjs` | FAIL — existing legacy mismatch |
| `content-authoring-ui.test.cjs` | PASS |
| `creation-ui.test.cjs` | PASS |
| `database-live-links-ui.test.cjs` | PASS |
| `displacement-ui.test.cjs` | PASS |
| `elements-ui.test.cjs` | PASS |
| `equipment-icon-ui.test.cjs` | PASS |
| `equipment-ui.test.cjs` | PASS |
| `event-story-ui.test.cjs` | PASS |
| `full-schema.test.cjs` | PASS |
| `grid-closeout-ui.test.cjs` | PASS |
| `grid-hazards-ui.test.cjs` | PASS |
| `grid-icon.test.cjs` | PASS |
| `grid-patterns-ui.test.cjs` | PASS |
| `hazard-navigation-ui.test.cjs` | PASS |
| `image-cloud.test.cjs` | PASS |
| `large-map-ui.test.cjs` | PASS |
| `maps.test.cjs` | PASS |
| `monster-ai-ui.test.cjs` | PASS |
| `monster-grid-ui.test.cjs` | PASS |
| `monster-passives-ui.test.cjs` | PASS |
| `monster-stats-ui.test.cjs` | PASS |
| `monster-tactics-ui.test.cjs` | PASS |
| `orientation.test.cjs` | PASS |
| `save-recovery-ui.test.cjs` | PASS |
| `scenery-ui.test.cjs` | PASS |
| `status-effects-ui.test.cjs` | PASS |
| `status-immunity-ui.test.cjs` | PASS |
| `tactical-ui.test.cjs` | FAIL — existing legacy mismatch |
| `tactical-v2-ui.test.cjs` | PASS |
| `weapon-patterns-ui.test.cjs` | PASS |
| `weapon-preview.test.cjs` | PASS |
| `world-links-ui.test.cjs` | PASS |
| `world-travel-ui.test.cjs` | PASS |
