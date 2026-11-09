# Hazard-aware monster movement — 2026-11-07

Catalog monster AI now compares bounded movement routes against persistent ground hazards before choosing its normal combat position. Encounters without active hazards keep ordinary shortest-path search; action-aware combat range preference is described in MONSTER-TACTICS.md. The legacy tactical fallback also evaluates terrain risks when moving toward its target or last-known location.

## Planning rules

- Search only reachable routes within the existing movement budget: normally 4, Slow 2, including elevation/decorations and quagmire costs. Occupied cells remain blocked. No movement/attack resources are added.
- Compare lethal environmental damage first, then estimated immediate exposure plus one future enemy-phase exposure, then the existing attack/range preference, movement cost and node order. This is a conservative policy: a safe waiting position can beat a damaging approach.
- Current-round exposure records prevent charging the same field repeatedly along a route. Remaining inside a field is assessed against the next enemy phase, respecting expiry. A monster already pulsed this round can therefore choose to leave before the next exposure.
- Predict elemental immunity/weakness, barriers and expected status risk using the shared definitions and target-stat save probability. Certain Stun/Frozen exposure ends the candidate route. Poison/Burn include a bounded DOT penalty. Other debuffs receive a simple risk weight. These are movement heuristics, not a complete combat simulation.
- Only hazard cells in the monster's current sight are considered. Unknown hazards behind walls are not used as hidden knowledge. Real movement continues to call the ground-effect engine, so an unexpected entry can still hurt, stop or kill the monster.
- Search and prediction do not mutate RNG, health, statuses, encounter metadata or player saves. Equal states resolve deterministically. Distinct field IDs and per-field exposure are retained during route search.

Available attacks, source ownership, detection, line of sight, MP, cooldown and one enemy action are unchanged. A ranged monster can step out of a field and still attack from a legal position. A monster with no target/last-known location can leave a visible harmful field, but is not given the player's position and does not automatically attack. Wall/Stun/Frozen restrictions retain priority; a monster killed by the phase pulse cannot retroactively escape.

The policy does not foresee future spells, choose a full-battle strategy or guarantee the globally best move. It estimates only current movement and one upcoming exposure. Hidden traps are handled by the existing execution rules rather than revealed by planning. The legacy fallback's untargeted idle behavior is retained.

## Observable behavior

The combat log explains avoidance/wait decisions. It also reports walking through a field that causes no effect, such as elemental immunity. Normal combat uses the same planner; the Update Test Field additionally shows its most recent decision beside the field information.

Six prepared scenarios use actual AI and hazard execution:

1. Detour around Fire while closing on the player.
2. Leave Fire while retaining a ranged attack.
3. Approach a blocked hazardous corridor, wait safely, then progress once the field expires.
4. Cross Fire with an explicit scenario-only Fire immunity.
5. Avoid a zero-damage Stun zone.
6. Escape without knowing the player's location.

Prepared fields, extra HP and the immunity demonstration are labeled sandbox setup, not edits to production monster records. Scenarios neither change player saves nor grant rewards. Last-action position/HP reports show outcomes. The preset selector now always matches the loaded setup, including the initial 3×3 scenario.

## Verification

- `hazard-navigation.test.cjs`: safe routes, exposure/expiry, ranged attacks, blocked waiting, immunity/weakness/barriers/saves, control avoidance, bounds and quagmire, hidden terrain, unknown target preservation, fallback movement, state purity and deterministic replay.
- `hazard-navigation-ui.test.cjs`: six real scenarios, visible decisions/positions/HP, desktop/landscape and mock-save isolation.
- Existing combat, monster AI, hazard, status and displacement tests remain applicable. Source database schemas are unchanged by this AI update.
