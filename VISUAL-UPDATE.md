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
Browser checks use Playwright and installed Chromium with mocked Supabase; no player saves are touched. Tests resolve Playwright through normal Node module resolution. Use tools/qa-runtime.cjs for the shared browser configuration and legacy entry-screen compatibility; test assertions are unchanged.

In this cloud machine:
```sh
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
export PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium
node tools/qa-runtime.cjs battle-editor.test.cjs
node tools/qa-runtime.cjs battle-isometric.test.cjs
node tools/capture-visuals.cjs
```

On another machine, install Playwright locally (`npm install --no-save playwright`) or expose an existing installation through NODE_PATH. Start `node preview.cjs` in a separate terminal. Run each browser suite with `node tools/qa-runtime.cjs <name>.test.cjs`. The runner uses PLAYWRIGHT_CHROMIUM_EXECUTABLE when set, otherwise system /usr/bin/chromium on Linux if present; on other platforms it preserves the test’s browser/channel options. PLAYWRIGHT_CHANNEL can override the channel when no explicit executable is selected (for example, msedge for installed Edge). With neither override, Playwright must have the requested channel or its managed Chromium installed. Browser QA uses isolated contexts and mocked Supabase only; do not sign in with a real account. Browser tests are not part of the Pages workflow. Screenshots from the visual capture script are written to artifacts/qa/. The original handoff tests also write screenshots one directory above the working directory.

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

## Arm attachment correction — Update 35, 2026-10-31

Replaced rotation of the disconnected atlas arm cutout with connected shoulder/elbow/wrist geometry. Both melee weapons and the bow now share explicit hand anchors; fingers render over the grip. Shoulder sleeves overlap the torso and forearm cuffs cover wrist joints. Removed detached blade arcs. Battle mechanics and equipment saves are unchanged.

Reviewed a 12-pose contact sheet covering sword/shield, dual daggers and bow at windup, strike/draw, follow-through and recovery. Weapon preview browser checks, motion timing checks and isometric picking pass.

## Grid portrait tokens — Update 36, 2026-11-02

Player units now use circular icon tokens instead of the modular anime body in combat. The hero uses the saved Icon image, center-cropped; missing icons and companions use numbered silhouette tokens. Active units have a gold border; guarding and defeated states remain visible. Tokens interpolate between cells and retain HP bars. Portrait selection, rules, equipment and saved character appearance remain compatible.

## Look around — Update 37

Added a one-action Look Around button. Scans 360 degrees at the existing sight distance, respects sight blockers, retains facing, logs targets, and prevents repeated scans in one round. Player normal sight now follows a stepped forward cone; walking updates facing. Scan visibility remains on screen until the next successful command, then returns to the normal cone. Scan state survives save/load and is validated. Uses the existing one-action/separate movement economy; 2-AP migration, Fog of War, hearing and d100 detection remain pending and are not represented as implemented.

Passed look-around.test.cjs (AP consumption, behind-target scan, facing retention, repeat rejection and save validation), tactical.test.cjs, creation-system.test.cjs and mocked creation/combat browser regression.

## Tactical systems v2 — Update 38

Added the AP/perception/casting rules discussed with the owner. The former Look Around command is removed. Each player has 2 AP; moving one route within the movement allowance costs 1 AP, as do attacks, guard, items and Cast. Standing units automatically see around themselves; moving units use a stepped forward cone (depths 1/3/5...). Movement updates facing. Player movement is evaluated step by step for detection, then returns to standing perception at the destination. The view shows a brief movement cone during token interpolation.

Sight uses blocking terrain, tree occlusion and relative height. Hearing uses Chebyshev squares (range 1 = 3x3, range 2 = 5x5). Detection is d100 per observer/target/sense/phase, using saved RNG/check results. Open/adjacent-tree/perched base chances are 80/50/30%, modified by distance, Stealth, Perception and cat ancestry. Hearing creates suspicion and a sound hint, rather than directly identifying the target. Enemy alerts share only the found player's identity. Detection caches and RNG survive save/load; rendering never rolls. Stationary enemies also see 360 degrees under the owner's revised rule.

Fog tracks visible and discovered cells separately. Unexplored cells conceal scene objects and units; explored cells darken when outside sight and do not reveal live enemy positions. Party sight combines. Sound hints do not explore terrain. Whole-map eye temporarily reveals the map for its active round.

Weapon/skill definitions carry targeting profiles. Encounter settings support min/max grid range, single/selected/all targets, maximum count, faction, height offsets -2..+2 and cast points. Overrides and sight/hearing settings persist with the character for future encounters. Height combines terrain, tree perch (+1) and flight altitude (0..2). Dragon/wind forms may change flight altitude for 1 AP, and land when their form expires. The settings are currently exposed in the combat testing interface, not a new general content-library editor schema.

Magic accumulates one Cast point per AP; held spells persist across turns, permit movement and block other actions until released or cancelled. Targets are chosen/validated at release. MP is paid once at preparation; invalid release rolls back AP and spell state. Cancellation forfeits progress/MP. Uncast Magic preserves the legacy `silent` save key but releases immediately for 1 AP and normal MP; it does not grant silence immunity in v2. Damage can break concentration using saved combat RNG. Default stronger spells require 2 or 3 Cast points; per-spell settings allow 1..20.

Validation: tactical-v2.test.cjs covers AP, held casts, MP, Uncast Magic, multi-targets, relative height, movement while casting, fog and deterministic checks. tactical-v2-ui.test.cjs tests the actual AP/Cast UI, reload, settings and desktop/mobile screenshots with mock Supabase. Updated creation UI regression for held casting; creation rules, legacy tactical behavior, cloud transport, adventure rules and camera picking pass. No real player saves modified. Balance values remain provisional; each ability is not individually balanced for the new economy.

## Expedition polish — 2026-11-04

Reorganized combat into movement/attack, skills/casting, special powers and supplies. End Turn sits beside the turn status. Camera/perception settings stay above the map; multi-target checkboxes are behind a keyboard-accessible disclosure. Added a mana bar, explicit selected-enemy state and a skill guide that reads the existing skill definitions and tactical profile overrides: actual mage MP discount, targeting side/range, required Cast AP, cooldown and held-cast progress. Choosing a skill does not mutate saves or spend resources. The guide reminds players that cancellation does not refund MP. Desktop and narrow/landscape layouts keep controls at least 44px high. Updated asset query versions for the changed controller/styles.

Fixed the Continue Cast button so a successfully completed held spell invokes the same existing PixelFX effect as the skill button. Preparing a held spell does not play the completion effect. Combat balance, simulation, artwork and save schemas are unchanged.

Validation: `node tools/qa-runtime.cjs combat-polish.test.cjs` covers displayed versus charged MP, friendly-fire disclosure, profile overrides, held-cast/AP state, non-mutating selection, disclosure access, 1440×1000 / 844×390 / 390×844 layouts, cancellation, reload and completion effects. Existing creation-ui, tactical-v2-ui and battle-isometric browser suites passed, as did all 16 pure rule/data test files. Browser tests mock Supabase; real player data was not touched. Visual records: `artifacts/qa/polish-desktop.png`, `polish-landscape.png`, `polish-narrow.png`, `polish-cast-effect.png`.

Known regression-suite limitation: `combat.test.cjs` times out selecting `#combatEnemies button` at line 13. Reproduced the same missing-enemy failure with unchanged HEAD combat.js/combat.css served through browser routes. This legacy suite is not passing and is not counted as validated; the focused modern combat, reload/AP and camera suites above pass. No assertion or combat visibility rule was bypassed.

## Player icons on the grid — 2026-11-05

The player's creation icon (`character.images.icon`) is the grid token. Removed the animated modular character customizer from the creation screen; appearance fields in existing saves remain compatible. Updated the upload hint to explain that the icon is used on the grid. Retained the existing icon-token rendering and movement interpolation, added image-load/error redraw callbacks, and forwarded the active unit flag so the selected player's icon has the proper selection ring. Characters without a usable icon retain the default pawn. Companion icons are not inherited from the player's image.

Validation: `grid-icon.test.cjs` uploads an actual PNG through character creation, verifies the normalized saved icon is drawn on the combat canvas, moves the hero through the UI, confirms image movement and reload persistence, checks landscape layout and confirms the animated customizer is absent. Authentication/storage are mocked. `weapon-preview.test.cjs` now delegates to this replacement flow; creation UI coverage no longer expects the retired appearance/animation controls. Rule, image-save validation and camera-picking checks pass. Screenshot: `artifacts/qa/grid-player-icon.png`.

## Legacy economy reuse — 2026-11-05

Audited the user-provided v20.3 JSX against the current catalog: all 504 records and all schemas/help metadata match; no typed reference targets were missing. Added a source manifest and repeatable audit/parity checks. Extracted 20 original economy/item-effect functions unchanged with source provenance. An atomic adapter and NPC service panel now support catalog-based buying, selling, crafting and out-of-combat HP/MP item use. Added optional validated catalogInventory to the existing save envelope; no automatic legacy-equipment conversion or changes to grid/2 AP. Gear stays in reserve, unsupported item effects are not treated as successes, and recipe duplicate ingredients are aggregated before applying the original engine. Tests cover the real records, transactions, rejection without mutation, save reload, UI use and landscape layout with mocked cloud. Full scope and remaining combat/loot/equipment adapters are documented in LEGACY-MIGRATION.md.

## Catalog monster victory loot — 2026-11-05

Retained the original rarity-weighted loot selector and 40% bonus-drop chance. Enemy units now retain their source monster ID. Drops are seeded by encounter ID and frozen into the saved encounter, previewed on victory, and routed into the catalog item/gear inventory during the same settlement that clears the encounter. Loss, retreat and training do not grant drops. Old unidentified encounters are not matched by display name. Pure and mocked browser coverage verify source tables, stable rewards across reload, inventory persistence and exactly-once claim. See LEGACY-MIGRATION.md.

## Catalog combat item commands — 2026-11-05

Added active-member HP/MP item use from catalog inventory for one AP, retaining the old effect calculator. The command clones and validates before committing unit resources, shared inventory, AP and combat log together. Full resources, no AP, held casting, stun, unavailable items and unsupported effects do not consume resources. Pocket potions are not double-charged. Fixed settlement to use the current tactical validator when other party members retain two AP. Covered by focused pure/browser item tests and loot/AP regressions with mock cloud.

## Equipment window and item icons — 2026-11-05

Added a pale-blue paper-doll equipment window with ten slots, player icon in the center, owned-item selection, atomic swaps/unequip and two-hand reservation. Four accessory slots consume independent owned copies. Added optional catalogEquipment and bounded character bonus data, with old-save fallback to training hands. Catalog gear now snapshots supported weapon/defense/passive values into new encounters; damage dice use saved combat RNG. Original numeric passive parsing is retained. Training equipment controls return catalog gear to stash when switching. Added per-record default SVG icons and icon image fields; cape/shield starter records and a basic equipment merchant are additive to the unchanged legacy catalog. Full support/limitations and tests are in EQUIPMENT-SYSTEM.md.

## Legacy elemental damage interaction — 2026-11-05

Imported the four original pure element helpers and connected catalog weapon element/elementDamage and explicit implemented-spell elements to monster weakness/immunity snapshots. Immunity wins over weakness and remains true zero; neutral/no-element paths retain current behavior. Element modification happens after critical and before the grid armor/guard calculation. Main/off-hand metadata remains independent, spells do not inherit weapon element, and zero elemental damage does not apply the weapon-form burn/slow follow-up. Battle logs show weakness/immunity outcomes. Focused pure/UI tests cover real Silver Longsword against a skeleton, saved outcomes and AP consumption with mocked cloud. Status-immunity and unimplemented legacy spell effects remain separate migration work.

## Status immunity — 2026-11-05

Centralized implemented debuff applications behind explicit saved immunity tags. Catalog Poison immunity now blocks Poison Blade's status while preserving physical damage and resource costs. Other implemented debuffs/form follow-ups use the same check; Antidote remains effective. No inferred element/status aliases or arbitrary legacy text effects. Added rule and mocked browser tests covering real skeleton data, damage-over-time expiry, save/reload, AP/MP and susceptible controls. See EQUIPMENT-SYSTEM.md for exact supported tags and limitations. No visual layout or animation changes.

## Catalog combat actions, phase 1 — 2026-11-05

Enabled 26 explicitly supported legacy skill/spell records for learned design-1 heroes, preserving original records and current grid/2 AP. Added saved action snapshots, one-AP catalog casting with original MP/cooldown/dice values, ally healing/cleansing, Empower/Iron Wall, weapon conditions and visible-in-range area targeting. Formerly descriptive healing/buff records now have explicit provisional formulas shown in the journal and battle guide. The character panel separates learned catalog abilities from starter skills; unsupported combat records are labeled. No automatic grants, monster-skill AI or arbitrary text interpretation. See CATALOG-COMBAT-ACTIONS.md for exact rules and limitations. Pure and mocked UI tests cover learning through real controls, casts, resources, invalid actions, snapshots/reload and desktop/landscape screenshots.

## Monster active-skill AI — 2026-11-05

Connected nine explicitly supported monster actions referenced across all 35 source monsters. Identified enemies snapshot owned actions and source ability stats, initialize MP on new encounters, enforce edited MP/cooldown values and select legal targets using detection, range and LOS. Added ranged spacing, melee approach, stun/silence behavior and one-action fallback attacks; movement respects terrain, traps and slow/quagmire. Visible enemies show MP and logs name skills. Old unidentified/chapter enemies retain their prior AI. Monster passives remain unsupported; Poison Fang still deals damage only, consistent with its descriptive-only source status. See MONSTER-AI.md for rules and limits. Pure and mocked UI tests cover linking, decisions, resources, movement, saved replay and actual End Turn controls; no real player saves are used.

## Monster passives — 2026-11-05

Connected all six original monster passive records using typed numeric fields and the extracted original aggregation helper. Thick Hide affects physical hit chance, Undying Resilience reduces physical damage, Arcane Ward reduces magic damage, Swarm Tactics improves accuracy, and Predator's Instinct/Ancient Might add attack percentages. Bonuses are derived from optional validated snapshots without mutating base attack/armor or refilling resources; repeated loads cannot restack them. Visible enemies display their active effects and the journal distinguishes supported passives. Source data and player grid/2 AP remain unchanged. Full grid conversion, boundaries and tests are in MONSTER-PASSIVES.md.

## Monster source stats — 2026-11-05

New free-field encounters now use exact source HP/MP/normal ATK and separate Defense/Evasion/Accuracy from physical/magic damage reduction. Removed the 12–70 HP clamp for this path. Added validated source snapshots, provisional grid hit conversion with consistent base/passive units, source stat details for visible enemies and atomic rejection of invalid source data. Existing saved fights keep their stats and old formula; source edits are applied only to new fields. Player grid/2 AP, active-skill dice and source records remain intact. See MONSTER-STATS.md for calibration, bounds, compatibility and tests.

## Monster attacks through shared grid guards — 2026-11-05

Made monster action geometry explicit and reused the tactical grid target predicate for AI planning and legal casts. Skills and normal melee fallback scope their own targeting profile during shared damage resolution; the low-level grid guard now includes LOS. Physical attacks permit one relative grid level, magical attacks two. Preserved detection/smoke requirements and resource rollback for invalid casts. Added pure boundary/guard tests and a mocked End Turn test proving a full wall prevents casting and opening the grid permits it. No animations or UI layout changes.

## Main-menu combat lab — 2026-11-05

Added a disposable main-menu sandbox with simulated characters, source monster placement, five preset scenarios and supported real action selection. Includes a clearly distinguished 3×3 test template, footprint preview, per-unit HP reports, real enemy turns, class/weapon selection, multi-AP cast progress/cancel, reset/refill and grid terrain tools. The lab reuses core combat and isometric rendering, runs independently of the real save, and never settles rewards or dispatches save events. Main UI preserves the existing visual theme; controls support desktop/landscape, canvas picking and coordinate input. See COMBAT-LAB.md for exact scope and test coverage.

## Database-defined grid patterns — 2026-11-05

Added seven typed fields each to skill/spell forms for footprint, width/depth, fixed/hearing/sight range reference, and one/up-to-N/all target selection. Added shared four-direction strip/cone, around-caster and aimed rectangle/cell geometry, normal-game and sandbox previews/target controls, real catalog/authored/monster dispatch and source snapshot validation. Legacy defaults retain previous behavior. Added direct lab scenarios for line 2×7/select-three, hearing radius, sight cone and actual Fire 3×3. Original 504 records and 205 schema fields remain intact; runtime schemas are 227 with additive equipment/pattern fields. See GRID-PATTERNS.md for exact geometry, supported mechanics and tests.

## Shared grid statuses — 2026-11-06

Added typed source status resolution, five status fields per skill/spell (237 runtime fields total), target-stat d20 saves, configurable chance/duration/DOT, Frozen, full action locks, held-cast interruption and fair enemy-to-player expiry. Connected Ice Bind, Poison Blade and Shield Bash (29 supported catalog actions). Both combat panels show icons and durations; Cure clears supported harmful effects. Eight isolated Update Test Field scenarios and status/HP reports exercise the real shared engine without save mutations. See STATUS-EFFECTS.md and the new pure/browser tests.

## Push/pull fields and grid resolution — 2026-11-06

Added push/pull numeric fields to skill/spell schemas (241 runtime fields), validated mutual exclusivity, frozen encounter metadata and shared after-hit displacement for class/catalog/monster damage actions. Stops before bodies, solid objects, elevation changes and edges; no falling/collision damage. Conditional coordinates and orange endpoints appear in normal combat and the lab, with seven direct presets and movement result reports. Camera picking and desktop/landscape rendering verified with mock saves; see DISPLACEMENT.md.

## Persistent grid hazards — 2026-11-07

Added seven skill/spell fields (255 runtime fields total) and shared bounded ground-zone snapshots, phase-aware expiry, once-per-unit/zone/round exposure, environmental damage and status resolution. Integrated empty-cell placement into catalog/class/AI commands, including held casts; entry hooks cover normal and forced movement. Added colored/glyph overlays, field timers and terrain-aware lab movement results. Eight isolated presets and focused pure/browser tests verify source editing, save reload, deaths, expiry, camera picking and desktop/landscape with mock saves. Existing smoke/quagmire and original raw records remain unchanged. See GRID-HAZARDS.md.

## Hazard-aware movement — 2026-11-07

Added bounded deterministic risk planning for catalog monster movement and the targeted tactical fallback. It accounts for visible hazards, per-field dedup, one future exposure, elemental/status defenses, control, barriers and expiry; no planner RNG or save mutations. Added six isolated scenarios and a visible decision report. Existing no-hazard routing is retained. Pure and mocked browser coverage includes escape/attacks, detours/waiting/immunity, unknown-target preservation and landscape. See HAZARD-AI.md.

## Tactical AI and party lab — 2026-11-07

Added pure bounded action/aim scoring with validated execution, useful status/defense/taunt/finishing choices, collateral/overlap penalties and displacement-to-hazard benefit. Directional execution updates facing. Explicit player elemental tags now use the shared real damage helper. Added four-member isolated party setup, companion classes/positions/commander/senses/ownership and real ally targeting. Nine tactical presets and pure/browser coverage verify decisions, state purity, replay, AP/MP, source ownership, party controls and desktop/landscape without real-save changes. See MONSTER-TACTICS.md.

## 2026-11-08 — Content authoring and owner handoff

Database supports creating new data from working templates, guided fields, reviewed manual AI JSON merges, baseline checks, account-scoped IndexedDB backup and identity-preserving restore. New spells appear in the Update Test Field action selector; shops/gear/crafting remain tested through their real services rather than field combat. See HANDOFF.md and dist/maintenance-guide.html. No new animation or general UI redesign. Engine checks pass 37 files; browser checks cover authoring, complete schemas and tactical lab. Final release acceptance remains tracked separately in RELEASE-CLOSEOUT.md.

## Grid closeout — current scope accepted

Fixed non-starter simulation weapon selection through real equipment rules; added left-hand controls and dual/two-hand/bow presets. Current grid browser acceptance: 15/15 suites, including actual touch input in the lab and normal combat, pan/zoom picking, keyboard and landscape screenshots. Engine/data: 38 files, including 10 weapon commands, lethal dual-wield stopping, 160 boundary masks and deterministic round-trip saves through 12 status/field/AI scenarios. See GRID-CLOSEOUT.md for scope, evidence and commands.

## Database links and NPC party — 9 Nov 2026

Source-backed catalog coverage is now 95 working commands, plus 30 class snapshots with editable cost/cooldown/dice/healing/range/power/cast setup and enabled state. Added recruitable NPC roster/vitals, per-member owned actions/AP, chapter/free-field participation, avatar/race/proficiency/equipment data, persistence and anti-recruit healing safeguards. Added four usable item modes and firearm/whip, including independent offhand reach. Owner explicitly requested review separation for unusual legacy data; 77 records remain visible under the database review-only checkbox and cannot masquerade as usable paid skills. Original records remain intact. See DATABASE-LIVE-LINKS.md for supported fields, snapshots, lab presets and verification; 40 pure suites, existing 15 grid browser suites, new database browser suite, full-schema 261 fields, authoring and chapter UI checks pass with mock accounts.

## Database event authoring and Visual Novel — 2026-11-09

Added database event category/editor, independent per-event/per-route percentages and saved sequential checkpoint queues. NPC half-body art is a separate optional schema image field. Dialogue graphs provide real inventory and quest-journal effects, linked side stories and actual grid combat with win/loss/retreat continuations. BGM is reserved metadata only. Added an isolated VN/queue/quest/grid test-field preset. See EVENT-AUTHORING.md. Verified 42 engine/data suites, event-story-ui, world-travel-ui and full-schema (262 catalog fields); reviewed desktop and landscape screenshots with mocked accounts. Save import cap is 12 MB for frozen journey/event images. No publication in this turn.

## Catalog weapon grid authoring — 2026-11-09

Added nine weapon fields for minimum/legacy maximum reach and the shared grid footprint/range-source/selection schema. Main/offhand plans resolve independently through one AP command, with frozen weapon snapshots, NPC party support, production preview/target controls and six reach-* lab presets. The lab can also select actual catalog weapons per hand for reach testing. Type defaults and encounters without weaponPattern remain compatible; skills retain their own definitions. Schema now has 271 fields. Verified 43 engine/data files and eight relevant browser suites; see WEAPON-GRID.md. New work is local and has not been published.

## World/NPC/quest closeout integration — 2026-11-09

Added opt-in placement enforcement, local saved VN interactions, scoped shop/crafting/recruit/dismiss outcomes, event/choice conditions, atomic inventory turn-ins, one-time reward ledgers, kill/item quest objectives and a real-route chapter bridge. Legacy libraries keep prior behavior unless enforcement is enabled. Private worldLoop/worldCombatQuest presets exercise production adapters including NPC services and grid settlement. Verified 44 engine/data files and 20/20 grid browser suites plus authoring/recovery/services/adventure/cloud mock checks. Actual Supabase/two-device owner acceptance remains unverified; see OWNER-ACCEPTANCE.md. Current local work has not been published.

## Release 68 delivery package

Packages catalog weapon reach/footprints and the world/NPC/quest integration with cache revision 68. During delivery review, filled the in-game maintenance guide with the new world, event, weapon and quest instructions and versioned its entry link. Engine/data 44 and grid browser 20/20 pass; actual-account/two-device acceptance stays in OWNER-ACCEPTANCE.md.
