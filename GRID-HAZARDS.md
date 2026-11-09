# Persistent ground hazards — 2026-11-07

`dist/grid-hazards.js` adds persistent Fire/Poison ground zones to supported damage actions. Configuring a zone replaces that action's direct hit with ground placement; there is no implicit extra direct attack. Empty, walkable cells can be selected. AP/MP, cooldown, equipment restrictions, ownership and multi-AP casting still use the source action. Existing smoke/quagmire fields remain separate and retain their behavior.

## Database fields

Seven additive fields on both skills and spells bring runtime schemas to 255 fields. Original 205 source-schema fields and 504 original records remain intact.

| Field | Behavior |
| --- | --- |
| `hazardType` | none / fire / poison |
| `hazardWidth`, `hazardLength` | Rectangular fallback, width 1–15 and length 1–20 |
| `hazardTurns` | 1–20 rounds, measured to the corresponding future placement phase |
| `hazardDamage` | 0–999 environmental HP damage per exposure |
| `hazardAffects` | both sides, enemies of the owner, or allies of the owner |
| `hazardStatus` | none or one of the existing supported statuses |

A configured grid shape takes precedence over the fallback dimensions, including line/cone direction and sense-based range. Without a grid override, place the rectangle within the action's cast range; class range profiles are honored. Geometry respects walkability, height and line of sight when created. A zone covers cells rather than a selected number of units: every eligible occupant on those cells can be affected, regardless of gridSelection/gridCount. The guide explicitly explains this distinction.

Status chance, duration, DOT amount, saving stat and saveDC reuse existing status controls. Direct after-hit statuses do not additionally execute on placement. Use hazardStatus to choose a zone's status. A zone must have damage or a status. Push/pull and ground placement are mutually exclusive on one action; other actions can push/pull units through an existing zone.

The adapter supports existing catalog damage actions, authored class damage commands and the nine supported monster active actions. This does not implement arbitrary legacy spells/passives or convert healing/trap/field abilities into ground placement. Unsupported records stay unsupported. No effects are inferred from names or descriptions.

## Timing and exposure

Placement creates the zone without an immediate damage pulse. It affects a ground unit when that unit enters a covered cell or starts its team's phase. Beginning phases include existing occupants. Each unit receives at most one exposure from each distinct zone per global round; walking out/in or crossing several covered cells does not multiply damage. Different overlapping zones resolve independently. A 2×2 body is one recipient, not four. Flying/perched units avoid ground exposure.

Fields expire at the start of the corresponding future placement phase. For example, a one-round player field acts during that round's enemy phase and expires at the next player phase; a one-round enemy field survives into the next player phase and expires at the following enemy phase. This prevents enemy-created zones disappearing before the player has a chance to react. The display shows at least one remaining round for a still-active enemy field at that boundary.

Environmental damage is fixed, without attack dice, hit rolls, criticals, armor or owner attack buffs. Original Fire/Poison element weaknesses/immunity and barriers apply. Positive damage checks held-cast concentration with the existing CON-based chance. A damaging exposure may apply its configured status through the shared chance/save/immunity resolver. Elemental immunity blocks the exposure's effects; a fully absorbed damaging exposure does not apply status. Zero-damage status-only zones can apply their status. Applied status duration/cleansing is independent of field lifetime: Cure removes the condition but does not remove a still-active zone.

Voluntary movement checks every traversed cell and stops if the unit dies or becomes unable to act. Forced movement checks every traversed cell, including a field passed through before the final destination, and stops on death. Player/class-step movement, monster movement and the legacy tactical fallback share these entry hooks. Death updates victory/loss and existing loot once. Finished encounters cannot be reactivated by terrain. AI can cast configured ground attacks at detected targets and excludes placement actions when the active-field capacity is full; hazard-aware bounded movement now evaluates visible environmental risk; see HAZARD-AI.md.

## Persistence and rendering

Configuration is frozen in action descriptors or optional hazardSkills for fresh encounters. Active fields store bounded cells, owner, source, phase/expiry and per-unit exposure rounds. Save validation bounds ten simultaneous zones, 1,000 cells each, and their metadata. Database edits affect new/restarted encounters; old battles without hazard metadata remain valid. Supabase identity, schema and transport are unchanged.

Orange Fire and green Poison cells have distinct glyphs, with overlap counts. Preview, unit icons and camera/picking remain separate. Normal combat clips hazard rendering and summaries to visible cells; the isolated lab observes the entire board. Field lists show remaining lifetime and damage. Movement reports in the lab now include HP/status changes from terrain, in addition to positional changes.

## Update Test Field

Eight labeled presets reuse real mechanics with encounter-only configuration:

- Fire: persistent damage and remaining lifetime.
- Poison: environmental damage plus the shared poison condition.
- Empty-cell placement followed by walking into the field.
- Push into one-cell Fire: place with Fire, then use Bash on the adjacent target.
- Pull through one-cell Fire: place with Fire, then use the catalog Ice action on the distant target.
- One-round expiry.
- Both-side exposure, including the owner.
- Enemy-created Fire.

These templates do not edit database overrides, player saves or rewards. A custom arena reads the actual edited database settings. The status/HP reports and field list make outcomes observable.

## Verification

- `grid-hazards.test.cjs`: exact placement/costs; preview purity; phase timing, expiry and per-unit dedup; traversal/forced traversal; poison, immunity and barriers; lethal entry, loot, post-combat guards; snapshots/replay; capacity/invalid-cast rollback; held casting; overlapping large-body exposure.
- `grid-hazards-ui.test.cjs`: real database edit/save/reload/rejection, actual custom-field data, all scenario controls, empty placement, normal combat resume, field rendering, camera picking, desktop/landscape, and mock save isolation.
- Existing pure, complete-schema, displacement and status browser regressions verify compatibility. Browser auth/storage are mocked throughout.
