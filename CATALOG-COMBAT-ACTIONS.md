# Catalog combat actions — phase 1

The old catalog has 112 skill and 59 spell records. This phase enables **29 records** for design-1 characters in the existing grid/2 AP combat. Original content, schema fields and canonical IDs remain unchanged. `dist/catalog-actions.js` is an explicit adapter, not an interpreter for arbitrary descriptions or a replacement d20 combat engine.

| Group | Supported records |
| --- | --- |
| Single-target spell damage | Fire, Ice, Fire II, Ice II, Thunder, Thunder II, Arcane Missile, Holy Light, Smite |
| Spell damage to all eligible enemies | Meteor, Poison Cloud, Static Field, Radiant Burst |
| Physical damage | Power Strike, Quick Slash, Quick Strike, Cleave, Precise Shot, Weapon Break |
| Damage and debuff | Weapon Break adds Broken; Weaken adds Weaken |
| Healing | spell Heal, Greater Heal, skill Heal |
| Cleanse | spell Cure |
| Buff | Empower, Iron Wall |

Weapon Break appears in two groups but counts once. Same-named skill Heal and spell Heal remain distinct records.

## Acquisition and persistence

Existing discovery, research, class, stat, proficiency, gold and learning checks remain in force. Spell learning now also honors `spellLevel` where `levelRequirement` is absent. No automatic grants or conversion of current class skills occur. A learned canonical key in `save.learned` is the ownership source; catalog actions do not get inserted into `character.skills`.

At entry/resume, learned and enabled supported actions are snapshotted once as optional `expedition.catalogActions`. The battle's MP, cooldown, dice, element and mechanics remain stable through reload and subsequent catalog edits. Existing encounters without this field acquire their snapshot on the next launch; old saves remain valid. Only the main hero receives these learned actions. Test companions do not inherit them. Equipment and action snapshots are independent.

## Grid rules and resource costs

- Each catalog action is instant and costs **1 AP**. Current class spells keep their existing held-cast rules. Catalog actions cannot be used while another cast is held.
- MP and cooldown use actual record values. The current mage class-spell discount is not applied to catalog actions. A failed validation restores the entire encounter, including seed, AP, MP and cooldowns.
- CD 0 actions can repeat within the same turn if AP remains. CD N blocks the next N rounds after casting, matching the existing cooldown convention.
- Enemy spells have range 4. Physical melee actions have range 1; Precise Shot has range 3 and requires a bow/crossbow. Cleave requires sword/axe/mace; Weapon Break requires sword/axe/mace. Other supported melee attacks require a melee weapon. Iron Wall requires a shield.
- All-enemy actions only hit living, visible enemies within range, line of sight and allowed height difference (−2 through +2). They do not reveal or damage distant/hidden units and do not damage allies. Costs are charged once, not per target. Catalog target rules are fixed in this phase; the existing class target-profile editor does not override them.
- A successful hit rolls the record's damage dice plus `floor((ability − 10) / 2)`, using saved encounter RNG. Current accuracy, critical, armor, guard, resistance and element interaction still resolve in the current engine. Catalog dice damage does not add the held weapon's damage or elemental bonus. Physical Magia forms retain their existing elemental override.
- Poison Cloud is Poison elemental direct damage. It does not acquire a damage-over-time effect from its name. Lifesteal, unsupported status and passive edits are rejected by the compiler rather than partially executed.

## Explicit new mechanics for formerly descriptive records

The supplied old Heal/Cure/Empower/Iron Wall records did not contain working numeric effects. These rules are **new provisional grid rules**, shown by the adapter in the journal and battle guide; they are not claimed to be extracted legacy formulas:

- Heal (both records): `2d6 + WIS modifier`, minimum 1 HP, capped at maximum HP.
- Greater Heal: `4d6 + WIS modifier`, minimum 1 HP, capped at maximum HP.
- Cure: remove all ten supported harmful statuses, including Frozen and Stun. It does not revive or cleanse buffs. A target without a removable status is rejected without costs.
- Empower: +15% damage for two status ticks; reapplication refreshes rather than stacks. Applies to physical and magical damage.
- Iron Wall: at least 50% physical damage reduction under the current guard/reduction calculation; no movement, one status tick. It does not affect magical damage.
- Weapon Break and Weaken add two ticks of the existing Broken/Weaken effects only after a damaging hit. Existing status immunity checks apply.

Healing, cleansing and Empower target a living ally (including self) within three tiles. Iron Wall is self-only. Full-health healing and invalid/hostile ally targets fail without costs.

## Visibility and scope

The database labels supported versus unsupported combat records and shows current grid formulas at research depth 2. Original descriptions remain intact, including historical engine limitations. The character screen lists learned catalog abilities separately from class skills; combat selectors show only owned supported actions. Disabled/invalid records do not get added to a new battle.

Still pending: the other catalog records, arbitrary text effects, resurrection, multi-hit/character-specific mechanics, spell XP/unlock trees and monster skill AI. Original static data parity is unchanged.

## Validation

- `catalog-actions.test.cjs`: all 29 compiled records, learning/ownership, spell-level gates, exact resource costs, elemental immunity, area filtering, LOS, allies, heal/cure/buff expiry, weapon and shield conditions, zero cooldown, atomic rejection, saved snapshots and malformed metadata.
- `catalog-actions-ui.test.cjs`: mocked auth/storage, learns Fire through the journal, casts Fire/Heal/Meteor/Cure through real controls, reloads a saved battle and checks landscape overflow. Screenshots: `artifacts/qa/catalog-actions-desktop.png` and `catalog-actions-landscape.png`.

## Database pattern extension

Supported catalog actions can now opt into validated `grid` shape metadata from the skill/spell database, replacing the fixed phase-1 target geometry. The source effect/dice/resources stay unchanged, and existing action snapshots stay stable. Shape/target count, facing and sense references share the player/monster engine documented in GRID-PATTERNS.md. Self-only Iron Wall remains a legacy self command.

## Status integration

Ice Bind, Poison Blade and Shield Bash now resolve structured source statuses. Supported damage actions honor status chance, duration, DOT amount and target-stat saving throws. See [STATUS-EFFECTS.md](STATUS-EFFECTS.md) for the exact rules, compatibility and isolated test scenarios.

## Forced movement

Supported damage actions now honor `pushDistance`/`pullDistance` through the same grid resolver used by authored class and monster actions. See DISPLACEMENT.md for collision, snapshots, conditional preview and sandbox coverage.
