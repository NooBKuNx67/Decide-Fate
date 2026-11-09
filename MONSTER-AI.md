# Monster skill AI — phase 1

Design-1 tactical encounters now snapshot and use **9 active monster skills**, covering the active references on all **35 original monster records**. Original records and player grid/2 AP remain intact. This phase does not imply that every monster field or passive has been migrated.

| Skill | Kind | Range |
| --- | --- | --- |
| Vicious Bite | Physical | 1 |
| Heavy Slam | Physical | 1 |
| Poison Fang | Physical damage only | 1 |
| Rending Claw | Physical | 1 |
| Dark Bolt | Magic | 4 |
| Ember Burst | Magic | 4 |
| Frost Spike | Magic | 4 |
| Void Ray | Magic | 4 |
| Radiant Beam | Magic | 4 |

`dist/monster-ai.js` uses an explicit allowlist. It resolves monster skill references by canonical ID or unambiguous canonical name, not display names or prose. It never grants skills from unrelated monsters. Unsupported, disabled, ambiguous or malformed skill references are recorded as unsupported and fall back to the existing normal melee attack when legal.

## Source data and provisional grid rules

- New design-1 encounters initialize enemy MP/max MP from the monster record. Existing resumed encounters preserve their saved MP/max MP; adding skill metadata never refills resources.
- Damage uses actual skill dice plus `floor((source ability − 10) / 2)`, with saved combat RNG. Dice, ability, element, MP cost and cooldown are snapshotted. The current hit/critical/armor/guard/resistance and damage calculations still apply.
- Empty `resourceCost` means **0 MP**, and cooldown 0 remains 0. All nine original monster action records currently have these defaults. Edited numeric MP costs/cooldowns work and are enforced; no undocumented costs are invented.
- Range 1 physical / range 4 magic are explicit new grid adapter rules. These records did not have grid range fields. Each monster retains one attack opportunity per enemy turn and up to four movement points (two when slowed). Players retain two AP.
- Poison Fang's original record expressly has descriptive poison and no structured status effect. It therefore deals damage without poisoning. No Burn/Slow/Stun effects are inferred from action names.
- Lifesteal, unsupported resource formats or unsupported status-effect edits are rejected by the compiler instead of being partially executed.

## Decision and movement rules

The AI considers only living player units it has actually detected and can currently see. It honors an eligible taunt target, then nearest visible targets. For a legal target it chooses the highest expected damage among its own available skills; ties are deterministic. It checks MP, cooldown, silence, range, height and line of sight before use, deducts resources once, and logs the skill and target.

A melee unit closes to attack range. A ready ranged unit seeks about three tiles of separation where possible, including backing away from an adjacent player. Movement uses the existing pathfinder, occupied cells, terrain costs and height rules; it respects traps, slow, quagmire and immobility. A monster with no visible detected target may move toward its existing last-seen position, but does not attack an unseen player. It clears a stale last-seen position after reaching it without reacquiring a target.

If it cannot use a skill, it can make one normal melee attack when legal. Silence blocks magic; stun skips its movement and attack. It does not get a free basic attack after a skill. The skill and movement choices do not consume random numbers; only existing perception and damage resolution do, so saved states replay consistently.

## Save compatibility and UI

Optional `enemy.monsterCombat = {v:1, stats, actions, unsupported}` is validated within the existing encounter schema. At launch it is prepared once for identified catalog monsters and then kept stable across reload/catalog edits. Old units without a canonical monster ID are not guessed from their display name and keep the old AI. Scripted chapter enemies and unidentified training opponents retain their existing behavior.

Visible mapped enemies now show MP/max MP beside HP. Battle logs name their actions, and researched database skill entries identify supported monster actions separately from player-learnable skills. No character animation or UI redesign was added.

## Pending

The six monster passive records are now connected in the independent layer documented in MONSTER-PASSIVES.md. General custom skill interpretation, monster healing/buff/AoE actions remain separate work. Source HP/MP/normal ATK and an explicit grid conversion for Defense/Accuracy/Evasion are now connected for new free fields; see MONSTER-STATS.md. Older saved encounters preserve their HP caps, armor and normal attack balance; old d20 Defense is not silently treated as flat grid damage reduction. Behavior prose is retained as source data, not executed as commands.

## Verification

`monster-ai.test.cjs` exercises all 35 monster skill links and nine action types, MP/cooldown edits, one attack per turn, ranged spacing, melee approach, detection/LOS/taunt, silence/stun, traps and slow/quagmire movement, exact snapshot persistence, deterministic replay, rejection rollback and malformed save data.

`monster-ai-ui.test.cjs` uses mocked auth/storage and the real End Turn button: ranged Dark Bolt, edited MP/cooldown, actual damage and 2 AP recovery, reload without MP refill, melee Heavy Slam and landscape overflow. Screenshots: `artifacts/qa/monster-ai-ranged.png` and `monster-ai-landscape.png`. Creation/combat and catalog-action browser regressions and isometric camera picking checks are also exercised.

## Shared grid targeting guard

Monster skills now use the same explicit `C.tactical.canTarget` predicate as other grid targeting: Manhattan tile distance, target side, living target, allowed relative height and line of sight. AI planning uses this predicate for candidate attack cells. Actual skills and normal melee fallback also install their own targeting profile while passing through the shared damage resolver, then restore/remove it. Player target-profile overrides cannot change a monster's skill geometry.

The nine supported actions remain single-target, as in their source data. Physical actions/fallback have range 1 and relative height −1/0/+1; magical actions have range 4 and relative height −2 through +2. Existing detection and smoke visibility checks are additionally required before a monster can select a player. No direct HP subtraction is added to the AI.

The shared low-level grid damage guard now also checks line of sight, so a stale or bypassed target selection cannot deal damage through a grid blocker. Invalid monster actions leave HP, MP, AP, cooldown and damage RNG unchanged.

`monster-grid.test.cjs` covers walls, trees, smoke, undetected targets, distance, physical/magic height boundaries, self/friendly targeting, scope restoration and direct damage-guard rejection. `monster-grid-ui.test.cjs` presses the actual End Turn button with a full wall between the units, verifies no damage/resource use, opens the route and verifies a legal cast. Mock authentication/storage only. Screenshots: `artifacts/qa/monster-grid-wall.png`, `monster-grid-open.png`.

## Data-defined pattern extension

The nine supported active skill records can optionally carry the same database-defined footprint and one/up-to-N/all target count as player skills. The AI faces a detected target automatically and uses the shared geometry, visibility checks and per-recipient damage resolver, spending one action/MP/cooldown total. Unconfigured records keep the phase-1 single-target behavior. See GRID-PATTERNS.md; pure party coverage verifies multiple recipients, while the current lab player side is solo.

## Shared status effects

All nine active attacks can apply explicit supported structured statuses with per-target chance and saving throws through the shared resolver. No status is inferred from prose. Frozen/Stun skip the entire monster turn; Silence prevents magic while still allowing a legal basic attack. See STATUS-EFFECTS.md.

## Push/pull

Structured push/pull distances on the nine supported active attacks execute through shared displacement after a damaging hit. No displacement is inferred from names/descriptions. The Update Test Field includes an enemy-push scenario; see DISPLACEMENT.md.

## Ground hazards

Supported active damage records can instead create configured persistent zones. AI respects source ownership, detection/placement geometry, costs and capacity; movement receives environmental entry effects and stops on death/control. It now compares bounded routes against visible hazard risk; see HAZARD-AI.md. See GRID-HAZARDS.md.

## Hazard-aware movement

Visible ground hazards now influence route selection, escape and waiting while keeping normal movement/attack costs and detection rules. Element/status defenses, exposure history and expiry inform a deterministic conservative estimate. Six isolated scenarios show the decisions. See HAZARD-AI.md.

## Tactical selection

Available linked actions now receive target-aware scores and bounded aim/direction search. The AI can choose empty area centers, use control/element differences, preserve valid taunt priority, value push/pull into hazards and penalize allied/duplicate ground effects. Source ownership, legal targeting and resource checks remain in the executor. See MONSTER-TACTICS.md for bounds, estimates and nine direct scenarios.
