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

## Phase 3 — front-end security

Audited 40 innerHTML assignments across 15 dist scripts, plus the related insertAdjacentHTML paths. Fixed two actual editable-data paths: imported extra character.stats keys/values and authored equipped-weapon names. No other behavior/schema/auth configuration changed. Full inventory and rationale: [FRONTEND-SECURITY-AUDIT.md](FRONTEND-SECURITY-AUDIT.md), [JSON inventory](reports/frontend-html-sinks.json).

Verification: **44 pure files + 9 browser files passed, 0 failed**. Browser files: frontend-security-ui, creation-ui, equipment-ui, full-schema, content-authoring-ui, combat-polish, grid-closeout-ui, event-story-ui, world-links-ui. The new XSS test reproduced execution before the fix and passes without CSP afterward. A separate temporary CSP smoke script passed mocked login/logout and grid startup; real remote SDK/auth was not tested, so the proposed CSP is documentation only, not an active meta tag.

## Phase 4 — lossless WebP assets

Converted eight requested PNGs to lossless WebP, preserved exact original bytes outside dist and updated runtime/tool/provenance references. No geometry or save changes. [ASSET-OPTIMIZATION.md](ASSET-OPTIMIZATION.md) records per-image sizes, original hashes, capture locations and the measured screenshot differences.

Before: 2/2 camera/grid browser files and the visual capture script passed. After: **44 pure + 9 browser files passed, 0 failed**; both visual/fallback scripts passed too. Desktop and emulated touch mobile were checked. Exact dist sizes and percentage are in reports/asset-webp-phase4.json. Windows/Edge and physical mobile remain unverified.

## Closeout E — diagnosed, three legacy suites remain failing

Re-run after closeout A–D: `node tools/check.cjs` **48/48 PASS**; current `creation-ui.test.cjs`, `tactical-v2-ui.test.cjs`, `combat-polish.test.cjs` **3/3 PASS** through qa-runtime. The three old files below are unchanged, including all assertions. This is not an all-browser-green claim. Reports: reports/closeout-E.json.

| File | Reproduced failure / cause | Effect on actual play and disposition |
| --- | --- | --- |
| browser.test.cjs | Assertion `5 !== 4` at line 2: Update Test Field is the fifth menu. Further assertions still expect 9 races/8 classes and two old alchemist buttons, whereas the approved creation system has 6/7 and current skills. | Returning to four menus would remove a required feature. Current creation-ui passes. Needs owner approval for a separate legacy-test specification update; not a small import/environment fix. |
| tactical-ui.test.cjs | Assertion `1 !== 0` at line 4 after Guard: it expects a single-action turn, then expects the hero to start with 1. Current 2 AP spends one on Guard and leaves one. | Actual 2 AP is intended; tactical-v2-ui passes. Do not change the engine back to one AP to satisfy this test. Updating numeric expectations needs separate authorization. |
| combat.test.cjs | Original run reached the 45s watchdog without completing. Diagnostic run with shorter locator timeout, unchanged assertions, observed `systems:2, tactical:false` and an enemy button, then timed out on hidden combatResult at line 14 after the scripted attack/skill pair. The test creates a modern character, toggles only tactical=false, assumes two attacks always kill current source-stat enemies, and uses unseeded encounter UUID/detection; earlier phase-2 runs also missed the enemy locator at line 13. A further obsolete assertion at line 16 expects only 15 gold: character-combat.js initializes enemy lootGold=5 and credits it on death, combat-data.js reward adds e.loot, explaining the previously observed 140 versus 135. This extra 5 is enemy loot, not the chest (a chest would award 20). | No evidence that the intended 2 AP flow is broken: closeout A proves real victory, frozen saves and exactly-once settlement; combat-polish/creation/adventure current flows pass. This mixed-version, unseeded fixture cannot reliably validate a legacy save. Needs a real versioned legacy fixture and an approved reward expectation; no engine rollback or assertion bypass performed. |

Reproduce locally (no browser tests in Pages CI):

```sh
node preview.cjs
# In another terminal with Playwright and browser configured per VISUAL-UPDATE.md:
node tools/qa-runtime.cjs browser.test.cjs
node tools/qa-runtime.cjs tactical-ui.test.cjs
node tools/qa-runtime.cjs combat.test.cjs
```

These old tests set process.exitCode on failure but do not close the browser in finally, so a printed assertion may leave Node alive. Stop that failed test after recording stderr; the closeout diagnostic watchdog cleaned its process group after 45s. For combat, the diagnostic shortened locator waits to 12s and logged state without changing any assertion or product code. Physical Edge/real accounts remain untested. The three failures are pre-existing and are **not closed as passing tests**.
