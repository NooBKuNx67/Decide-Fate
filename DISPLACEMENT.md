# Skill/spell push and pull — 2026-11-06

Two additive database fields, on both skills and spells:

| Field | Label | Values |
| --- | --- | --- |
| `pushDistance` | ผลัก (ช่อง) | Integer 0–20 |
| `pullDistance` | ดึง (ช่อง) | Integer 0–20 |

Zero disables that direction. Both cannot be positive on one action; the database editor and encounter validators reject that conflict. The form preserves the original class Bash's one-cell default when first editing it. Explicit zero/zero disables its push. The original 205 source-schema fields and 504 raw records are unchanged; runtime schemas now have 241 fields.

## Resolution

`dist/displacement.js` is shared by supported catalog damage actions, authored class damage commands and the nine supported monster active attacks. Fresh encounters snapshot configuration in action descriptors or `e.displacementSkills`. Existing saved actions without that metadata keep their mechanics; class Bash retains its one-cell fallback and now uses safe shared collision checks instead of directly changing its node.

Displacement occurs once per recipient after a damaging hit, while that recipient is alive. It does not trigger on a miss, elemental immunity, fully absorbed damage or a killing hit. Existing status checks/saves are independent of displacement. It costs no additional AP/MP, does not spend the target's movement budget and does not mark them as having voluntarily moved. Multi-AP casts displace only when released. Each recipient of an area action resolves in its stable target order, including collision against positions changed by earlier recipients. There is no chain-pushing of bodies. Preview is conditional on the displayed recipients being hit and surviving.

Movement is cardinal, at most one cell per step. Choose the axis with the larger distance from the source; ties use X. Push moves away, pull moves toward the source, recalculating each step. A diagonal pull therefore follows a staircase, rather than teleporting or pathfinding around objects. Stop before crossing any occupied footprint, solid prop, tree, water, elevation change or board edge. Pull cannot pass through or overlap the caster. Self-targets do not move. A trap on an entered cell consumes the existing stop trap and ends forced movement, matching its movement-stop role.

Ground targets retain their ground level; there is no falling, automatic climb or collision damage. Perched/flying targets stop without being dropped to the ground. Dragon form checks the entire 2×2 footprint at every step. Frozen/Stun prevent voluntary actions but do not inherently make a target immune to forced movement. There is no newly invented weight, knockback resistance or size immunity system.

Only currently supported damage actions can use these fields. Passive, healing, movement/field/trap commands and arbitrary unimplemented legacy skills do not gain new effects from numeric metadata. Editor validation rejects known non-damage actions; unsupported source rows remain labeled unsupported. Database edits affect new/restarted encounters, preserving saved battle configuration and account identity.

## Preview and test field

Normal combat and the Update Test Field show conditional origin/destination coordinates, obstacle reasons, configured distance and orange endpoint markers. Normal-game preview uses visible units and stops at unknown cells; it does not reveal undetected bodies or terrain. Actual execution always checks all occupants. Hidden blockers, misses, deaths and earlier area outcomes can change the final result. Preview makes no changes to RNG, resources, traps, positions or saves.

Seven direct isolated presets demonstrate push 3, pull 3, a wall, an occupied cell, an elevation change, the board edge and a monster pushing the player. They reuse real commands with labeled scenario-only configuration. Use the custom arena to test actual edited database fields. Last-action reports include each unit's original and final coordinates alongside HP/status results. No player-save changes or rewards occur in the lab.

## Verification

- `displacement.test.cjs`: movement geometry, collision/edges/water/elevation/traps/large and perched bodies; pure and fog-safe preview; source/compiler/save validation; misses/immunity/death; held casts, class Bash, area recipients, exact costs and deterministic AI/lab scenarios.
- `displacement-ui.test.cjs`: real editor save/reload/conflict rejection; custom field reading edited Fire data; previews/endpoints and position reports; seven scenarios; normal combat; camera picking after zoom/pan; desktop/landscape and mock-save isolation.
- Existing pure tests and targeted schema, grid and status browser regressions verify compatibility. Browser QA uses mocked auth/storage only.
