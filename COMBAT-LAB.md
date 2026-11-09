# Update test field

The main menu now has **สนามทดสอบอัปเดต**. It opens an isolated, disposable session with a simulated character, including before a real character exists. It does not replace the current character or active encounter, write local/cloud player saves, emit save events, or settle rewards.

## Player flow

1. Choose a starting scenario and press “จัดตามสถานการณ์นี้”. Available presets: 3×3 footprint, single target, wall obstruction, Holy/Poison interactions, and monster AI/passives.
2. Choose a monster from enabled database records. In setup, click a tile to place/change it, or use X/Y coordinates. Tools also move the simulated hero/companions, erase monsters/walls, place walls and change tile height. Add 0–3 companions with selectable classes and switch commander after starting. Current combat limits allow five monsters. Different monster types can share one test field.
3. Press “เริ่มทดสอบ”. Choose the action and aim tile, then use it. Normal movement and enemy turns use the real combat engine. The full-board observer view is for inspection; normal combat commands still check their own range, detection/LOS, equipment, casting and resource requirements.
4. Inspect HP before/after per unit, with coordinates, and open the combat log if needed. Reset the scenario, return to setup, refill test AP/MP/cooldowns, or cancel a held cast using the normal cancellation rule.
5. Return to the main menu. The real saved character/encounter is unchanged. Setup/session memory is discarded on reload/sign-out; there is no permanent test-layout storage in this phase.

## Real mechanics versus test template

The selector includes supported authored class skills and compiled catalog skills/spells, plus a clearly labeled **แม่แบบทดสอบพื้นที่ 3×3 (ไม่ใช่สกิลจริง)**. Selecting a real ability dispatches through its existing combat command; this is not a copy of its damage formula. New supported catalog actions appear through the compiler automatically.

The 3×3 test template is sandbox-only. It previews the nine grid tiles centered on the aim cell (clipped at map edges), costs 1 AP/8 MP, uses base 30 Fire damage and guaranteed hit to demonstrate footprint boundaries. The center must be within four Manhattan tiles and a valid line of sight/height. Enemies in the square still pass the shared grid damage guard (range up to six for the outer edge, relative height at most two, LOS), elemental immunity/weakness, source defense and passive mitigation. It targets enemies only. It is not granted to a real character or advertised as an implemented production catalog spell. The default layout has four Goblins inside the square and one outside, making the boundary directly testable.

The simulated hero uses recommended human stats, selectable class/training weapon, level 10, 5000 MP, all currently supported authored skills, compiled catalog abilities and test supplies. This is a debug grant, not an acquisition or balance test. Existing weapon restrictions and multi-AP casting still apply. Cast progress is shown, refill preserves a held cast, and explicit cancellation does not refund MP. Monster HP/MP/normal ATK, active actions and passives use source-backed snapshots. Reset/start again to take newly edited database values.

## Implementation and isolation

- `dist/combat-lab-data.js`: pure plan validation, source-backed session construction, deterministic seeds, action/turn dispatch and HP reports. No storage/auth/DOM dependency or calls to settlement.
- `dist/combat-lab.js`: independent local plan/session; the live game variable `s` is never reassigned. Reuses the isometric renderer with pan/zoom/picking, coordinate controls and keyboard navigation.
- `dist/combat-lab.css`: existing green/gold theme, a clear playfield and setup sidebar, responsive desktop/landscape layout.
- `game.js`: screen navigation/account reset includes the lab; normal save/auth flows remain intact.

Closed wall layouts are valid tests. Construction bootstraps units on a connected blank field, then applies the validated test terrain and validates the encounter, allowing deliberate LOS/path blockers without weakening the production encounter-entry checks. No real scene/content overrides are written by the lab.

## Verification

`combat-lab.test.cjs`: four inside/one outside, exact prototype AP/MP, deterministic restart, real skills, blocked walls, mixed monster identities/source stats, all class setups, layout limits, multi-AP casting/cancellation, preset builds, enemy-turn reports, immutable input rows/plans and independent save objects.

`combat-lab-ui.test.cjs`: main-menu access before character creation, actual template cast, reset, source monster placement, camera picking after zoom/pan, held cast/refill/cancel, a blocked real cast, enemy turn, landscape layout and unchanged real character/active encounter/local save with zero save events. Auth/storage are mocked. Screenshots: `artifacts/qa/combat-lab-setup.png`, `combat-lab-result.png`, `combat-lab-landscape.png`.

## Ongoing owner requirement

Every new or changed gameplay mechanic must ship with a corresponding directly accessible test-field scenario/control and observable outcome in the same change. Reuse the actual mechanic, keep sandbox-only templates clearly marked, preserve save/reward isolation and verify the scenario. A generic selector alone does not establish coverage. See AGENTS.md.

## Database pattern update

Four additional pattern scenarios plus an empty custom layout (ten total) cover the shared real grid-pattern engine: line 2×7/select-three, around caster/hearing, cone/sight, and a real Fire rectangle 3×3. Scenario patterns are isolated overrides on that Fire action, not database writes. A custom layout without a scenario pattern uses the actual edited database shape. Direction and live hearing/sight controls update previews, eligible-target checkboxes and actual execution. The prior sandbox-only 3×3 template stays separately labeled. See GRID-PATTERNS.md.

Choose “จัดสนามเอง · ใช้รูปจากฐานข้อมูล” for a blank layout using actual database shapes. Named pattern-demo scenarios visibly label their isolated shape override; their setup does not change the database.

## Status scenarios — 2026-11-06

Eight additional labeled presets exercise poison, burn, frozen, stun, a successful DC 1 save, Skeleton poison immunity, an enemy poisoning the player and Cure. Use the attack and End Turn controls to observe HP ticks and remaining duration. Results include per-unit condition changes. These presets override only their isolated encounter metadata; custom layouts use actual edited database values. See STATUS-EFFECTS.md.

## Forced movement scenarios — 2026-11-06

Seven additional presets cover push/pull, walls, bodies, elevation, the board edge and an enemy pushing the player. They use shared real command resolution with labeled encounter-only metadata. Conditional origin/destination coordinates and orange endpoint markers are shown before casting; result reports include movement as well as HP/status changes. Custom fields read actual `pushDistance`/`pullDistance` database values. See DISPLACEMENT.md.

## Ground hazards — 2026-11-07

Eight additional presets cover Fire, Poison, empty-cell placement/entry, push/pull through Fire, expiry, friendly fire and enemy placement. They use real commands with labeled encounter-only metadata; custom arenas use edited DB settings. Colored cells, remaining-round lists and HP/status movement reports make outcomes visible. See GRID-HAZARDS.md.

## Hazard AI scenarios — 2026-11-07

Six prepared scenarios demonstrate detouring, escaping and attacking, waiting at a hazardous corridor, Fire immunity, avoiding a status-only field and escaping without discovering the player. A visible AI decision report accompanies the existing HP/position reports. All run the actual bounded planner and hazard engine; production records/saves are untouched. See HAZARD-AI.md.

## Tactical party scenarios — 2026-11-07

The arena now supports four simulated party members, class/position editing, per-member commands/senses/resources and selected-ally healing. Nine additional AI scenarios cover aim/direction, collateral, useful statuses, explicit defenses, finishers/taunt, overlap and pushing into a field. The same source snapshot/ownership rules apply, and no real saves or rewards are touched. See MONSTER-TACTICS.md.

## Grid closeout / weapon controls

The simulator now equips any weapon permitted by its class through the real equipment validator, rather than rejecting non-starter choices during character creation. Select a left-hand weapon or shield when permitted; dual mastery D is granted only to the simulated character. Two-handed weapons clear the left-hand choices. Direct presets: `weapon-dual`, `weapon-twohand`, `weapon-bow`. See GRID-CLOSEOUT.md for acceptance evidence. The current board is 12×10 cells.

## Database integration scenarios — 9 Nov 2026

Direct presets now include data-class, data-heal, data-multihit, data-items, party-npc, weapon-firearm, weapon-whip and weapon-mixed. Item tests consume the sandbox inventory using the real inventory adapter. NPC tests use real recruitable source stats/equipment/owned catalog commands and isolated vitals. See DATABASE-LIVE-LINKS.md.
