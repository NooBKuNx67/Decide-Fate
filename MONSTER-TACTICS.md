# Tactical action selection and party test field — 2026-11-07

`dist/monster-tactics.js` adds read-only action/aim scoring to the existing monster skill allowlist. It does not interpret prose or grant additional production skills. Actual actions still execute through `monster-ai.js`, shared grid/status/displacement/hazard rules and saved source descriptors.

## Decisions

The AI considers every currently detected, visible opponent and available linked action. It estimates mitigated base damage, explicit elemental defenses, useful status duration, finishing value and modest MP cost. Reapplying an equal/longer remaining status has less value. A valid taunted opponent retains priority whenever a legal candidate includes it.

Area commands search aim cells, including empty centers between opponents. Line/cone commands test all four directions. Selected recipient limits remain authoritative. Ground placement subtracts estimated allied/self harm, discounts redundant sufficiently strong same-type/status coverage, and respects which side the zone affects. This is a penalty/tradeoff, not an absolute promise of zero collateral in every configuration. A push/pull action can gain value from predicted entry into an existing visible harmful field; actual movement and exposure still resolve normally.

Aim search is bounded to 121 visible legal candidate centers per action, or four directions for lines/cones. Scores use no RNG and do not mutate battle data. Movement retains its existing budget and hazard safety ordering; preferred combat range now considers which currently available actions are useful against the pursued opponent. After movement, the action is selected from the current real position/detection state.

Execution validates explicit aim, direction and selected IDs. Directional casts update the acting monster's facing. MP/action/cooldown costs are paid once per command. Grid count, LOS, height, detection, source ownership and status restrictions continue to apply. The log shows the chosen action, intended recipient count, aim and explicit direction. A scored target can still dodge the actual attack; damage/status probability is not bypassed.

The estimate is a tactical heuristic, not an exact damage preview or complete fight solver. It does not model every accuracy/critical interaction, future movement, future spells or the globally best combined movement/action plan. Basic melee remains the legal fallback when no linked action is useful/available.

## Explicit defenses on both sides

Normal and environmental damage now pass the actual target to the original elemental interaction helper, regardless of side. A player unit with explicit `elementWeakness`/`immunities` metadata therefore follows the same elemental rules as a monster. Missing metadata remains neutral, including historical player saves. This does not automatically grant defenses from item names/descriptions or add an equipment-affix system. The demonstration uses labeled encounter-only immunity data. State remains compatible with the existing encounter validation and save envelope.

## Party controls in Update Test Field

The isolated arena supports 1–4 simulated player-side members. Add/remove companions in setup, select each companion's class and place them with the ally brush. Layout validation rejects overlap or invalid cells. Companions use existing real party creation/stat/weapon/skill rules. The simulated hero retains the previous debug supply/skill grants, which are not written to a real character.

After starting, select a living commander. AP, MP, movement and commands use that member; catalog actions remain hero-owned. Ability lists reflect the commanded actor, class healing can target the ally on the selected cell, sense controls update the selected actor, and the grid highlights that actor. The roster reports HP/AP/MP/status for every member. When the current commander dies, the lab reflects the core's living-member fallback. The lab never assigns its encounter to a real save or settles rewards.

Nine prepared cases exercise real decisions:

- A three-recipient area centered on an empty cell.
- A cone turned toward two companions instead of the nearest lone opponent.
- Ground placement that avoids an allied monster.
- A useful control status instead of redundant Burn.
- Ice against explicit Fire immunity.
- A low-HP recipient/finishing attempt.
- Valid taunt priority over an otherwise attractive low-HP target.
- A direct attack instead of redundant persistent-zone placement.
- Push into a prepared harmful field.

Source action shapes/statuses/defenses/HP and stationary setup are explicitly scenario-only metadata; database records remain unchanged. Fixed visible seeds make the demonstrations reproducible, while normal detection and damage rolls still run.

## Verification

- `monster-tactics.test.cjs`: score purity, empty aim and rotation, recipient limits, friendly cost, statuses, defenses, low HP/taunt, overlap, displacement benefit, legal/resource gates, explicit-plan rollback, actual symmetric defense damage and replay.
- `combat-lab-party.test.cjs`: immutable layouts, overlap/count validation, real party profiles, AP/catalog ownership and selected-ally healing.
- `monster-tactics-ui.test.cjs`: nine real scenarios, visible decisions/HP, four-member setup, placement/class/commander controls, independent AP/ownership, desktop/landscape and zero mock-save mutations.
- Existing pure and focused schema, hazard/navigation and sandbox browser regressions verify compatibility.
