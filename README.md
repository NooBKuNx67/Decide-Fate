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
- Built-in atlas: 51 selectable meadow/forest/cave maps at 16, 32, 64 and 100 cells per side; playable directly or copied into the workshop for editing.
- Chapter one connects village NPCs, forest choice, a discoverable spell, persistent companion Lin, cave combat and two saved endings. Start from the chapter panel on the character game screen.
- Campaign combat now supports movement, class actions, enemy AI, props, win/loss, rewards and resumable encounters. Full inventory/equipment and catalog skill effects remain future work.

## Character creation redesign

The latest agreed design and implementation checklist are in [CHARACTER-CREATION-DESIGN.md](CHARACTER-CREATION-DESIGN.md). New characters now use the first implementation described below; existing characters retain their legacy rules.

## Development

Run `node preview.cjs` from this directory. No application install or build is required. See `VISUAL-UPDATE.md` for browser QA commands and screenshots under `artifacts/qa/`.

Keep the existing Supabase configuration and player-save compatibility. Do not rerun setup.sql against the existing database merely for local testing.

## Character Update 27 — 2026-10-31

New Game now offers six races, seven classes, 27 stat points, eight proficiency points (D/C), one-time local draft rolls and three Unique choices. New characters receive four active class skills, a passive definition, starter equipment and persistent supplies. The battle adapter supplies the 28 class commands, Unique commands, vampire feeding and dragon transformation, cooldowns, statuses, equipment damage and separate dual-weapon hits. The character panel includes basic spell tuition, training-grade gates, training-weapon purchases/equipment and a solo Dual Wield trial unlocked after discovering the forest shrine and reaching B in a one-handed weapon.

Implementation limits: rolls are persisted per account in this browser until character confirmation; cross-device draft sync and server-enforced anti-reroll are not implemented. Completed characters and encounters use the existing cloud save transport. Rune/soul crafting, the full imported equipment catalog and replacement NPC/monster catalogs remain pending. Copy Eye currently copies a supported enemy basic attack for one use; it is not a general enemy-skill interpreter. Detection/appraisal currently inspect implemented battlefield objects and unit stats. Silent casting handles silence, but there are no multi-turn ritual spells yet. Magia has basic dark/fire/ice/earth/wind/lightning forms, not an exhaustive per-spell transformation catalog. Rank B–S checks are provisional training thresholds and victory milestones, not separate authored quests. Legacy records remain preserved and their editor overrides do not automatically change the new combat adapter's definitions.

Validation: `node creation-system.test.cjs` plus existing rules, tactical, adventure, combat, map and cloud suites. Browser: `node tools/qa-runtime.cjs creation-ui.test.cjs` with the documented Playwright environment; covers persisted offers, character creation, battle/reload, Fire Burst, Magia and landscape screenshots. Character-art and full-schema browser regressions also pass with mock Supabase.

## Character Update 28 — shared Unique point buy

Skill/passive/Unique and proficiency labels use English with Thai explanations in creation. New drafts use version 2: all ten Unique options are available for purchase, rather than three random offers. Unique and proficiency share eight points (stat buy remains 27). Initial balance is three points per Unique, at most one, with equal budgets for all races. Recommendations, refunds, validation and reload use the shared budget. Existing v1 characters retain their original Unique and allocations; incomplete v1 drafts migrate with a visible refund notice if their proficiency allocation no longer fits. ID keys remain stable. Rules and browser checks cover over-budget rejection, purchased Unique surviving identity randomization/reload, English/Thai labels, legacy character validation and combat.

## Character Update 29 — racial budgets and gender

New v3 drafts have racial base profiles (total 48 before existing racial bonuses) and shared budgets: Human 10, Dwarf 9, Elf/Cat 8, Vampire/Dragonborn 6. Stat buy remains 27 and cannot lower a stat below its racial baseline. Unique prices range 1–5; see the latest design table. Recommendations fit every race/class/Unique combination. Gender choices persist across draft reload and completed saves and do not alter stats. Completed v1/v2 characters retain their original prices, budgets and grants; only unconfirmed drafts migrate. Tests cover 462 combinations, old save validation, refunds, gender and desktop/landscape creation.

## Character Update 30 — manual creation and proficiency spacing

Removed the identity-randomization button and explanatory copy from character creation. Pending drafts previously rolled can now choose race/class manually; completed characters are unchanged. Proficiencies display English names, Thai explanations and rank selectors on separate spaced lines. Verified the existing browser creation/combat/reload/landscape flow and reviewed the proficiency screenshot.

## Character Update 31 — modular battle characters

Character creation now includes male/female body templates, three faces, three hairstyles, hair/skin palettes and live pose previews. A local vector rig draws clothing, limbs, head, hair and hand-attached weapons/shields; creation stores appearance with the character and encounter units preserve it. Players in battle use this rig, including temporary party members, instead of the old pawn. Idle/walk/attack/cast/guard/hit/down poses run in the canvas; dead player units remain visible. Equipment types select sword, dagger, axe, spear, bow, crossbow, staff or mace silhouettes. The vector artwork is simpler than the approved generated concept board; that board is not a production sprite atlas. Old saves use default appearance. Existing image uploads remain available. Camera picking and tactical regression suites plus browser creation, appearance persistence, combat and landscape checks pass with mocked cloud.

## Character Update 32 — PixelFX effects

Integrated six local transparent sprite sheets from https://github.com/patch-gg/pixelfx (MIT): sword slash, fireball, frost nova, heal, divine shield and lightning strike. Successful combat actions trigger transient effects at their targets; guard and potion effects attach to the acting character. Failed actions do not trigger effects. Sheets are rendered with `--sheet --no-actor`; no upstream actor or proprietary gallery font is shipped. Asset provenance, pinned source commit, LICENSE and NOTICE are under `dist/assets/fx/`. The effects add about 2.6 MB and use the existing canvas camera, with a bounded transient queue. They do not change combat damage or save data. Browser QA exercises a real Fire Burst and captures its effect, alongside camera picking and existing creation/combat checks.

AutoSprite and GameSlash tools pages returned HTTP 403 from this environment. Their functionality, pricing, export rights and integration were not verified; no accounts were created, payments made or game data uploaded to either service.
