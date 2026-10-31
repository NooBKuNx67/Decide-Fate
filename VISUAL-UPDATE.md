# Decide Fate — Anime visual update

Working source: this folder, based on the uploaded Prototype 13 archive. The owner clarified that the earlier game was files tested in Codex, not an existing deployed website. Continue local development and testing from this version.

## Changes
- The approved title illustration has been cleaned of painted menu buttons; the original ID/password authentication form is now on the opening screen. No extra enter screen is required.
- The grid workshop uses a local transparent illustrated atlas for oak, cherry blossom, pine, flowering shrub, mossy rock and cave crystal props.
- Terrain lighting, grass details, cliff faces, biome palettes and workshop panels have been refined.
- Geometry, camera picking, movement rules and save format are unchanged. If the atlas cannot load, the procedural objects remain available.
- Existing Supabase configuration, storage identifiers and Site binding are retained. No schema migration is needed.

## Run
From this directory, run `node preview.cjs`. The server uses port 4173. The app itself requires no install or build. Supabase login requires access to the original backend and esm.sh SDK. Do not run setup.sql against the established database.

## Validation
Pure checks: `node battle-view.test.cjs` and `node battle-data.test.cjs`.
Browser checks use Playwright and installed Chromium with mocked Supabase; no player saves are touched. The adapter handles the Windows-specific imports in the original handoff tests and supports the original handoff tests.

In this cloud machine:
```sh
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
export PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium
node tools/qa-runtime.cjs battle-editor.test.cjs
node tools/qa-runtime.cjs battle-isometric.test.cjs
node tools/capture-visuals.cjs
```

On another machine, make Playwright available to Node and set PLAYWRIGHT_CHROMIUM_EXECUTABLE to its Chromium binary. Screenshots from the visual capture script are written to artifacts/qa/. The original handoff tests also write screenshots one directory above the working directory.

The owner subsequently authorized GitHub Pages publishing through pushes to main. Historical Sites metadata is not required.

## Camp props
Six new placeable props: tent, treasure chest, campfire, crate, barrel and signpost. All are one-cell obstacles with illustrated sprites and procedural fallback. They persist in the existing battleScenes library section; no SQL migration is needed. Props are scene decoration/obstacles only; looting and resting interactions are not implemented. Existing scenes remain compatible. Browser coverage: `node tools/qa-runtime.cjs battle-props.test.cjs` with the same NODE_PATH as above.

## Forest and cavern props
Added stump, fallen log, fern, cave mushroom, stalagmite and mineral crystal brushes, usable across all biomes alongside camp props. Newly generated forests include ferns, stumps and logs; newly generated caves include mushrooms, stalagmites and crystals. Existing saved scene definitions are not rewritten. Ferns/mushrooms are traversable at +1 movement cost; the solid props block movement. All use the existing scene library and require no SQL migration. Browser coverage: battle-biome-props.test.cjs (forest/cave painting, undo/redo, mocked cloud persistence and second-browser restore).

## Ten-prop palettes
Each recommended meadow, forest and cavern palette now has exactly ten distinct object types, available through the workshop's prop-set filter. Shared props remain usable in every biome via All. Added painted wildflowers, forest mushrooms, thorn bushes, vine-covered arches, bird nests, ancient stones, gold/ruby ore, bones, braziers, minecarts, collapsed supports and altars. These are scene props, not harvesting/quest/interaction systems. Newly generated layouts use suitable props without modifying saved scenes. Flowers, mushrooms, ferns and bones add one movement point; solid props block traversal. Pure tests verify palette counts, validation and traversal. Browser tests verify all thirty palette entries, filtering, undo/redo and mocked-cloud cross-browser restore.

## Campaign combat milestone — 2026-10-29

The game map now offers Tactical Expedition, using the current character and a validated scene from the existing library (meadow, forest or cave). Explore opens a forest encounter when campaign safety checks allow it. Entry costs 2 hours and 15 energy; requires 20 HP, 15 energy and no pending event. Up to three enemies use catalog names and capped HP/STR for provisional balance. One hero, six movement points, one action per turn; enemy pathfinding and retaliation, range/elevation/line-of-sight, eight provisional class skills, guard and two encounter potions are implemented.

Chests supply pending gold and a potion, herbs supply potions, ore supplies pending gold, camps restore HP/mana, once per object per encounter. Winning grants 15 gold and 20 XP per enemy plus collected gold; defeat returns at 15 HP, retreat preserves remaining HP, neither grants rewards. Results settle once and clear the saved encounter. Character HP/mana persist; entry time/energy are never charged again on resume. Encounter state travels in existing local/cloud/JSON snapshots. Other activities are blocked until it is resolved. QA uses mocked Supabase only; real accounts were not touched.

The workshop remains an independent movement sandbox. Combat uses existing pawn visuals, not final animated character art. Equipment, persistent item inventory, all imported spell effects, passive/race bonuses and prepared activity buffs are not implemented in this combat ruleset. Existing activity buffs remain available for the next ordinary activity. Balancing is provisional.

Verification: combat-data.test.cjs covers rules, class actions, AI, loot, result settlement and malformed saves. combat.test.cjs covers actual UI movement, retaliation, refresh/resume, single reward, defeat recovery, retreat and landscape layout. Run with the documented tools/qa-runtime.cjs runner.

## Large maps, terrain routes and spawn candidates — 2026-10-29

Scene dimensions now support 6–100 per axis (10,000 cells), with 64×64 and 100×100 presets. Existing scene/save formats remain compatible. The JSON array guard accepts 10,000 entries; the existing aggregate 2 MB content-library limit remains in force, so capacity depends on total scene sizes and other library content.

Road, dirt path and wooden bridge brushes are walkable at normal ground cost; water/river tiles remain blocked. Painting a route clears objects; painting water also clears spawns. Seeded generation offers Nature, Crossroads, River with Bridges, Camp and Ruins. Layout is saved per scene and reused by Repeat; existing scenes default to Nature. Generation changes the selected scene and supports undo. River crossings and all spawn candidates have connected paths.

Enemy markers are candidate locations. Each new expedition or movement preview samples exactly one marker uniformly, using that marker's monster reference. Other markers do not create additional enemies. An active saved encounter retains its already chosen location through reload; older multi-enemy encounters are preserved until resolved.

Weighted pathfinding now uses a binary heap and the renderer skips tiles outside the viewport for large-map navigation. Tests: large-map.test.cjs covers 45 biome/layout/size combinations through 100×100, shortest paths, candidate selection and saved encounters; large-map-ui.test.cjs verifies 10,000-cell generation, mocked cloud save/second-browser restore, repeat, brushes and landscape layout. Screenshots reviewed.

## Built-in world atlas — 2026-10-29

Added 51 bundled presets: meadow/forest/cave each have five 100×100 maps, and four maps each at 16×16, 32×32 and 64×64 (17 per biome). Named themes include flowers, caravan roads, river crossings, camps, mines and ancient shrines. Each uses deterministic terrain plus four arranged landmarks, supplies/treasure, connected approaches, one player spawn and three spatially separated enemy candidates. Existing illustrated props are reused; no new external art dependencies.

The atlas lives in battle-presets.js as compact recipes expanded only on selection. It does not add 51 full scenes to every account or consume the custom library quota. In the workshop, biome/size filters select a preset; applying replaces the selected draft scene after confirmation, retains its custom ID, and supports undo/redo. Save explicitly to persist edits. The original atlas remains available. Custom libraries keep their existing 30-scene/2 MB limits.

All presets are also directly selectable under Expedition without saving a custom copy. Only the chosen encounter scene is saved, so reload preserves both terrain and the randomly selected enemy. Old saves and active encounters remain unchanged.

Tests: battle-presets.test.cjs validates exact counts, 51 distinct layouts, determinism, independent copies, schema, connectivity, single-enemy sampling, encounter serialization and per-map library size. battle-presets-ui.test.cjs verifies filters, biome visuals, undo/redo, mocked cloud restore, mobile landscape, direct expedition launch and reload. Screenshots reviewed for all three 100×100 biomes.

## Party tactics and scenery revision — 2026-10-29

New expeditions let the player choose 1–8 party members and 1–5 enemies. Extra party members are temporary prototype companions using the other class archetypes; recruitment, individual persistent inventories and companion progression are not implemented. The campaign hero keeps existing stats; companions exist within the saved encounter. Enemy groups deploy around one randomly chosen candidate spawn. Every living party member has independent movement/action budgets and can be selected in the combat sidebar.

Commands include move, attack, class skill, a separate 12-mana ranged spell, guard, healing item, and retreat. Vision is checked per individual with terrain occlusion: players 8 cells, enemies 5 with a rear blind sector except adjacent cells. Enemies face their movement direction. Unseen enemies are omitted from the canvas and target list. A detected character alerts enemies within 6 cells about only that individual and their last known position. AI cannot track hidden characters to new positions; it searches the known position, then clears awareness when no player is found. Basic/class attacks deal double damage if the attacker has not been detected; surviving targets alert nearby allies, while an unwitnessed kill allows further stealth attacks. Terrain remains visible (not unexplored-map fog).

Party defeat requires all members down. On victory/retreat a downed campaign hero recovers to 1 HP; on party defeat the original 15-HP recovery applies. Legacy non-tactical saves retain old behavior. New perception/party state is validated and serialized in existing local/cloud/JSON flows.

Added 30 local SVG scenery objects, accessible via the workshop's New Objects filter: lavender, sunflower, reeds, cattail, lotus, berries, wheat, bluebells, succulent, glowing moss, well, fountain, bench, picnic table, fence, gate, lantern, banner, wagon, hay, moss boulder, limestone, basalt, amethyst, amber, ice crystal, obelisk, broken column, sarcophagus and supply sacks. Plants are traversable; structures/rocks block movement. Existing flower bushes still add one movement point. These are scenery, not 30 new loot systems.

The 51 atlas maps now use coherent rounded hill fields, smoothed slopes into paths/water, habitat clusters, open clearings, visible rock formations, varying landmark positions and winding approaches. Automatic ladders on every hillside path were removed. Existing edited scenes and saved encounters are not rewritten.

Validation: tactical.test.cjs covers 8/5 limits, individual actions/vision, limited alerts, stealth chains, spell costs, save validation and prop collision. tactical-ui.test.cjs checks party selection, turns, reload, mobile and retreat. scenery-ui.test.cjs checks all 30 brushes and a rendered gallery. Legacy encounter, editor, atlas, rules and mocked cloud regressions pass. No real player saves used.

## Chapter one: Heart of the Stream — 2026-10-29

Added a playable adventure loop above the independent combat sandbox. Original NPCs Nara, Lin and Ira connect Lan Son village, Whispering Forest and Heartstream Cave. Accept Nara's request, optionally recruit Lin, bypass the forest sentry through tracking or fight it, discover Ember Light at the shrine, open the cave seal with that learned spell, defeat the cave guardians, and choose to restore or sell the Heartstream relic. The ending changes village/NPC dialogue and grants a one-time 60/100 gold reward. Returning to cleared story encounters does not respawn rewards. Travel costs 5 energy/30 minutes, tracking 10 energy/60 minutes, combat 15 energy/120 minutes; free village rest takes eight hours and restores the hero and Lin.

Adventure state is independently validated and saved through the existing snapshot transport. Lin's membership, HP and mana persist across chapter encounters, unlike sandbox companions. Retreat/defeat preserve earned spell practice and companion damage but do not clear the quest encounter. Old saves lazily acquire chapter state; existing world/editor data is not rewritten. Story RNG has a saved xorshift state and deterministic encounter generation; this is not a retrofit of all legacy random functions.

Ember Light is a discoverable spell record in the existing known/learned catalog. It uses the same chapter ability definition for seal cost and combat casting, is unavailable before learning, and only the hero who learned it can cast it. Practice is mirrored into proficiency and adds 0.02 damage multiplier per point to the next encounter, capped at +0.5. Other catalog abilities are not all migrated. Existing class skills retain prototype behavior.

The chapter uses location buttons, persistent dialogues and existing grid encounters; free-roaming towns, NPC schedules, a general quest editor, companion recruitment beyond Lin and a full persistent equipment/inventory system remain future work. The broader test arena remains available and is labeled separately. No rename from Decide Fate to MYTHBOUND.

Correction to the prior audit: rules.validate already restored the legacy eye event after initializing event to null. That behavior was preserved and explicitly regression-tested.

Verification: adventure.test.cjs tests gates, both exploration routes' preparation, deterministic encounters, persistent companion damage, no quest completion on retreat, learned record integration, one-time settlement and reward, both endings, malformed-state rejection and eye-event preservation. adventure-ui.test.cjs plays accept/recruit/scout/learn/reload/seal/actual cave combat with spells/ending/reload through DOM controls and checks landscape overflow. Existing rules, tactical, cloud, browser and party UI tests pass using mocked Supabase.

## Anime character art — Update 33, 2026-10-31

Character creation now offers Icon and Portrait upload only. Battle appearance is assembled in the character customizer; the old saved combat-image field remains compatible with existing saves and the legacy image editor.

Replaced the normal modular character rendering with an original painted anime parts atlas: illustrated faces, layered hair, clothing, cape and limbs. Appearance choices and weapon/shield attachments remain connected to the character data. Preview and battle use the same renderer and foot anchor. Assets load locally; the vector rig is retained as a fallback if the atlas fails to load. Current art uses mirrored three-quarter views and one outfit with armor color variations, not a complete four-direction/class-outfit collection.

Validation: creation rules, image save validation, isometric picking, and mocked creation/combat browser flow. Inspected assembled preview and battle screenshots. Supabase configuration and real player saves were not changed.

## Weapon choreography — Update 34, 2026-10-31

Added render-only attack choreography for sword/shield, dual weapons and ranged weapons. Shield users cover the torso during a sword swing; dual wielders alternate main/off-hand swings with separate blade arcs; bow users hold the bow forward, draw the string and release an arrow. The existing 650 ms battle animation window is shared with preview playback. Basic bow attacks no longer emit a melee slash effect at the target. Weapon eligibility, Dual Wield unlock requirements and damage calculations are unchanged.

Character creation includes a clearly labeled preview-only weapon selector (equipped, sword/shield, dual daggers, bow). It never grants equipment or changes saved appearance. Preview attacks repeat with an idle pause. Weapons remain canvas illustrations attached to the painted anime rig, not frame-by-frame sprite animation.

Verification: weapon-motion.test.cjs covers alternating strikes, bow draw/release and recovery; weapon-preview.test.cjs checks all preview options with mocked Supabase and captures the poses; creation rules and the creation/combat browser regression cover save and gameplay compatibility. Reviewed all three rendered poses.
