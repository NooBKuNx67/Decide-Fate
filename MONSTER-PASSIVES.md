# Monster passives — phase 2

All six original monster passive records now work for identified design-1 tactical enemies. The original records/schema remain unchanged. `dist/legacy-monster-passives.js` retains the original `getCharacterEnabledSkillDbEntries` and `withMonsterEffectiveStats` functions verbatim; source hashes and the extracted-file hash are in `docs/legacy-monster-passives-source.json`. Reproduce with `tools/import-legacy-monster-passives.cjs <original.jsx>`.

## Supported effects in the current grid engine

| Passive | Original typed value | Current effect |
| --- | --- | --- |
| Thick Hide | Defense +3 | −15 percentage points to incoming physical hit chance |
| Predator's Instinct | Attack +15% | +15% outgoing damage |
| Undying Resilience | Damage Reduction +2 | Subtract 2 from incoming physical damage |
| Swarm Tactics | Accuracy +2 | +2 percentage points in new source profiles; +10 in older saved fights |
| Arcane Ward | Magic Defense +4 | Subtract 4 from incoming magical damage |
| Ancient Might | Attack +25% | +25% outgoing damage |

Defense is not flat damage reduction. The source engine treats Defense as a hit-roll threshold, physical Damage Reduction as flat mitigation and Magic Defense as flat magical mitigation. The Arcane Ward description is historical prose; the adapter honors its typed Magic Defense field. Older saved fights convert one Defense/Accuracy/Evasion bonus point to five percentage points. New source profiles retain five for Defense but use one for Accuracy/Evasion, combining them with source stats; see MONSTER-STATS.md. All use the existing 20%–99% hit-chance caps. Thick Hide applies to physical attacks/skills, not magic. Swarm Tactics applies to physical and magical hit checks because both use the current grid hit resolver. These conversions are explicit grid rules, not a claim that the old d20 hit engine was transplanted.

Predator's Instinct and Ancient Might add: **15% + 25% = 40%**, not a compounded 43.75%. The shared damage resolver applies the bonus once to base outgoing damage (rounded), before existing critical, elemental and mitigation calculations. This covers basic attacks and monster skill dispatch. It does not alter healing or periodic poison/burn ticks.

Physical/magic mitigation is subtracted after elemental interaction and alongside existing armor, before guard/reduction. It retains the current minimum of 1 damage on a damaging hit. Elemental immunity still returns true zero before the minimum floor. Existing Broken/Weaken, gear resistance, barriers and protector behavior remain on their current rules.

## Typed data, snapshots and compatibility

`dist/monster-passives.js` recognizes the six canonical IDs and reads only the six original numeric monster bonus fields. Edited text is never parsed into powers. Each finite field is bounded to ±1000; unsupported/disabled/non-passive records are not compiled. All six typed fields are supported on these six records, including the optional Evasion bonus (one percentage point per point in new source profiles, five in older fights, to all incoming hit checks). The original aggregator sums values; physical/magic reduction is clamped at zero. Repeated references are deduplicated by canonical ID.

Optional `enemy.monsterPassives = {v:1, entries:[{id,name,values}]}` is prepared once at launch. Bonuses are derived from this snapshot without changing `enemy.attack`, `enemy.armor`, ability stats or resources. Repeated prepare/load calls do not stack bonuses. Editing/turning off source records after battle entry does not alter an already saved encounter; new encounters use the new source values.

Older identified encounters acquire a passive snapshot once on resume. Unidentified/scripted chapter enemies are not matched by display name. Player units cannot carry a monster-passive snapshot. Validation rejects unknown/duplicate IDs, malformed fields and out-of-bound numbers.

This layer connects passive bonuses. New fields also use the source-profile base-stat layer documented in MONSTER-STATS.md; older saved fights preserve their previous base stats. The active-only adapter's historical `monsterCombat.unsupported` list can contain passive names, but passive support now lives in this independent snapshot and is shown from that snapshot.

## UI and verification

Only visible enemies show their active passive names and actual grid effects under the enemy button. The database identifies supported monster passives and shows their numeric effects at full research depth. Hidden enemy names/abilities are not announced by snapshot creation.

`monster-passives.test.cjs` verifies all six records, extraction provenance, precise physical/magic mitigation, deterministic chance boundaries, additive attack bonuses, actual monster skill dispatch, elemental order/immunity, duplicate/disabled handling, unchanged base stats, stable saved snapshots and invalid-save rejection.

`monster-passives-ui.test.cjs` uses mocked auth/storage. It compares real attack damage against Stone Golem with/without passives, verifies exactly two points of physical reduction, reloads without stat inflation, changes source data without altering the frozen battle, exercises Elder Cultist's combined attack bonus and reviews desktop/landscape layouts. Screenshots: `artifacts/qa/monster-passives-defense.png`, `monster-passives-landscape.png`.

## Source-profile compatibility update

For new fields using `catalogStats`, base and passive Accuracy/Evasion use one percentage point per point. Swarm Tactics is +2 percentage points there; old saved fights retain +10. Defense remains five percentage points per point. Source physical/magic reduction now adds to passive reduction for those new profiles. The journal and enemy descriptions reflect their respective current/encounter rules. See MONSTER-STATS.md.
