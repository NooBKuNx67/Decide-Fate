# Development checkpoint — 2026-11-05

Owner requested pausing development and saving the work to GitHub. The original checkpoint is on `checkpoint/legacy-systems-2026-11-05`. The owner subsequently requested preparing `main` for Run workflow. The work is now also on `main`, with GitHub Pages deployment configured for manual `workflow_dispatch` only. Pushing changes does not publish them; the owner can run Publish Decide Fate on `main`.

## Completed since the last published commit

- Replaced the rejected animated-character work with uploaded player icons on the grid.
- Audited the supplied old JSX: 504 original records, 13 categories and 205 original schema fields match. Added reproducible source manifests and extraction tools.
- Connected catalog shops, inventory, crafting, HP/MP items, combat item use and stable monster victory loot.
- Added ten equipment slots (head, armor, cape, boots, both hands and four accessories), item icons, catalog weapon dice and supported numeric bonuses.
- Connected elemental weakness/immunity and explicit status-immunity checks.
- Enabled 26 learned catalog skills/spells with saved battle snapshots; retained grid/2 AP.

Details and limitations: `LEGACY-MIGRATION.md`, `EQUIPMENT-SYSTEM.md`, `CATALOG-COMBAT-ACTIONS.md`, `VISUAL-UPDATE.md`.

## Verification

24 pure test files pass. Focused browser tests have passed for icon tokens, economy, loot, combat items, equipment, elements, status immunity and catalog actions with mocked auth/storage. Latest browser checks include creation/combat/reload, status immunity and catalog journal learning/Fire/Heal/Meteor/Cure, desktop and landscape. The pre-existing legacy `combat.test.cjs` enemy-visibility failure remains documented in VISUAL-UPDATE.md and is not counted as passing. No real player saves were modified during QA.

Run `node preview.cjs` for local preview. Browser compatibility runner: `NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules node tools/qa-runtime.cjs <test-file>` when this runtime is available.

## Next work, when requested

Continue the remaining legacy combat actions and then monster skill/AI integration. UI visual redesign is deferred at the owner's request. Do not restart animation work. Do not publish or develop further merely because this checkpoint exists.

## Monster systems release — 2026-11-05

Owner requested uploading through completed publication. This release adds nine monster active skills across all 35 source monsters, six typed passive effects, actual source base stats for new free fields, and shared grid targeting/damage guards. Existing battles keep their prior stats/formulas; new fields use source HP/MP/ATK and the documented grid hit conversion. No character-animation work was resumed.

References: MONSTER-AI.md, MONSTER-PASSIVES.md, MONSTER-STATS.md. Current verification: 28 pure test files passed, plus focused mocked browser tests for monster AI, passives, source-stat initialization/reload, wall-blocked casting, character creation/combat, and isometric camera picking/landscape rendering. Source database parity remains intact. The publish workflow now runs the four new monster rule suites as part of deployment.

Next possible work when requested: balance playtests, reward/XP scaling and additional supported combat effects. Publishing remains manual via the workflow; an owner request to upload to GitHub includes dispatching that workflow and verifying the live site, per AGENTS.md.
