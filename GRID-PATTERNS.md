# Data-driven skill/spell grid patterns

The skill and spell database forms now include an additive **รูปพื้นที่ ระยะอ้างอิง และจำนวนเป้าบน grid** group. Original 504 records and 205 original schema fields are unchanged. Runtime schemas now contain 227 fields: original 205 + eight equipment presentation fields + fourteen pattern fields (seven per skill/spell category).

## Database settings

| Field | Meaning |
| --- | --- |
| `gridShape` | Legacy, one grid cell, straight strip, around caster, cone, or rectangle around aim point |
| `gridWidth` | Strip width / cone maximum end width / rectangle width, 1–15 cells |
| `gridLength` | Fixed strip/cone depth, around-caster radius, or rectangle length, 1–20 |
| `gridRangeSource` | Fixed value, caster hearing range, or caster sight range |
| `gridRange` | Fixed aim distance for a one-cell or aimed-rectangle shape, 0–20 |
| `gridSelection` | Choose one, choose up to N, or automatically target all eligible units |
| `gridCount` | Maximum selectable count for choose-N, 1–13 |

The form shows Thai choices and disables irrelevant fields. Examples: **line, width 2, length 7, fixed, choose up to 3**; **around caster, hearing, all**; **cone, sight, choose one/all**. Shape and selection are independent: the footprint is where units may be chosen, not a promise every unit takes damage. Hit chance, immunity and defense still apply. Target side/friendly-fire policy is inherited from the actual ability; “all” means all eligible targets of that ability, not automatically both factions.

A zero/decimal/out-of-bound dimension or invalid shape/basis/selection is rejected before saving. Passive records cannot acquire active targeting through these fields. Unsupported authored movement/self-only commands must keep legacy geometry; adding shape data never implements a previously unsupported legacy effect.

## Geometry and facing

- Strips/cones start one cell in front of the caster. They can face four grid directions (+X, +Y, −X, −Y), or automatically choose the dominant axis toward the aim cell. A 2×7 strip has fourteen cells before map clipping/obstruction. Even widths use the center column and a bias toward the right side of the chosen facing, so dimensions remain exact.
- Cones widen in integer steps from one front cell to the configured maximum end width. Depth comes from fixed length or the referenced hearing/sight range. This is a grid mask, not a continuous-angle ray.
- Around-caster radius uses the existing Manhattan grid-distance convention (radius 1 is the origin plus four orthogonal neighbors). Width is unused. Hearing/sight supplies the radius when selected; it does not bypass vision/detection or permit attacks through a wall.
- One-cell/rectangle patterns are centered on the aim cell. Their cast distance comes from `gridRange` or the referenced sense. Rectangle width/length remain their own dimensions. Even dimensions bias toward +X/+Y.
- Every mask clips to the map and excludes invalid terrain and cells blocked by LOS/relative height. Real target filtering additionally checks side, living state, actual unit height, visibility/detection and the requested selection limit. Physical effects allow relative height ±1; magical effects ±2.
- Sense references read the actor's current `hearingRange`/`sightRange`, so the same stored ability changes range as that actor's senses change. The underlying perception engine is unchanged.

## Shared execution

`dist/grid-patterns.js` provides validation, geometry, target selection, preview descriptions and scoped low-level damage masks. Catalog actions, supported authored class actions and monster active skills share it. The low-level tactical damage guard checks both the mask and normal grid geometry. Direction is a cast-time choice (`gridDirection`), not a permanent source-data facing.

Choose-one requires one valid target. Choose-N allows 1 through the configured maximum, never duplicates or units outside the footprint. All automatically selects the eligible set. Validation precedes resource use for instant casts; an invalid target/count leaves AP, MP, cooldown and damage RNG unchanged. Existing held spells retain their multi-AP charging rules and choose final targets on release. Area commands charge their normal AP/MP once, with existing per-recipient consumable semantics retained. Authored healing/cleanse skips full/unaffected recipients when other valid recipients exist; an entirely ineffective cast is rejected. Authored Fire/Cleave do not also apply their old hard-coded explosion when a new mask is active.

Monster skills orient toward a detected target automatically. They select one/up to N/all within the same mask and pay their action/MP/cooldown once, resolving damage per recipient. Player facing choices do not override monster geometry.

## Compatibility and limits

Absent/legacy shapes keep existing behavior. Catalog/monster action snapshots optionally carry `grid`; new authored-class patterns are snapshotted in `encounter.gridSkills` for the party's owned skills. Existing saved fights keep their existing snapshots/legacy patterns; edit source data then start a new encounter or restart the lab to use the changes. Shape settings are validated on save/load, while referenced senses stay dynamic.

Configured patterns work with currently supported catalog actions (except self-only Iron Wall), the nine supported monster active actions, and authored damage, heal, aid, cure, barrier, antidote and taunt commands. Movement, traps, fields, self-only buffs, mark/protect/steal and unimplemented legacy abilities retain their existing mechanics and do not gain invented effects from a footprint. The source schema is broader than implemented mechanics, as before. The lab now supports 1–4 player-side members, with direct multi-recipient monster scenarios; see MONSTER-TACTICS.md.

## Update Test Field and verification

Added direct scenarios for line 2×7/select-three, around/hearing, cone/sight and a real Fire rectangle 3×3. They use the real action/pattern engine with scenario-only metadata overrides, not edits to the player's database. The direction selector rotates preview and eligible targets. Hearing/sight controls demonstrate live changes. Checkboxes choose targets; all-target actions show automatic disabled checks. The same controls/preview/target limits are available in normal combat. The previous sandbox-only guaranteed-hit 3×3 template remains separately labeled.

- `grid-patterns.test.cjs`: exact masks/directions, boundaries/count rejection, dynamic senses, walls, resource rollback, authored Fire without duplicate AoE, area healing/cleanse, saved validation and monster multi-target dispatch.
- `grid-patterns-ui.test.cjs`: real database edit/save/reload, invalid width rejection, a custom lab layout reading the edited Fire record, select-three/extra-target rejection, facing/sense controls, normal-game direction/target controls and landscape. Mock auth/storage only.
- `full-schema.test.cjs`: all 255 runtime fields remain editable/savable, with the original raw record/schema parity checked separately.

Screenshots: `artifacts/qa/grid-pattern-line.png`, `grid-pattern-cone-landscape.png`.
