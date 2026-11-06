# Grid status effects — 2026-11-06

`dist/status-effects.js` supplies one typed resolver for players and monsters. Existing `effects` counters remain compatible with saved encounters. New optional `statusConfig`, `statusSkills` and unit `statusMeta` snapshots preserve the settings used when an encounter starts; database edits take effect in a fresh encounter. No Supabase migration, identity change or original source-record rewrite is required.

## Supported effects

| Status | Effect |
| --- | --- |
| Poison / Burn | Configurable direct HP loss per status tick, without armor, elemental modifiers or critical hits |
| Frozen / Stun | Prevent movement and combat actions; interrupt a held cast |
| Slow | Existing movement reduction: player 4 movement points, monster 2 |
| Defense Down / Broken | Existing 15% physical armor reduction |
| Attack Down / Weaken | Existing 15% outgoing damage reduction |
| Blind / Blinded | Existing 15 percentage-point accuracy penalty |
| Silence | Prevent magic and interrupt a held cast; Uncast Magic can still cast through silence |
| Taunt | Existing target preference toward the source while it remains an eligible target |

No alias is inferred from elemental names or prose: `Fire` immunity does not mean `Burn` immunity. Poison Fang and Poison Cloud do not acquire poison from their names. Explicit original `statusEffects` tags are mapped; unsupported tags such as Bleeding, Magic Down and Oni Form keep the action unsupported instead of being silently dropped. Original `Silence:1` syntax is also still unsupported by the catalog compiler.

## Database controls

Five additive fields on both skill and spell schemas (241 runtime fields total, original 205 unchanged):

- `battleStatus`: legacy/source statusEffects, none, or one supported status. Custom selection replaces the source statuses.
- `statusChance`: 0–100%, tested separately for each landed, surviving recipient.
- `statusTurns`: integer 1–20; default 2, or 1 for original Frozen/Stun when no explicit duration exists.
- `statusDamage`: integer 0–999 HP per tick for Poison/Burn; initial explicit balance default 3. Original class poison retains its existing scaling until configured.
- `statusSaveStat`: STR/DEX/CON/INT/WIS/CHA; default CON.

Existing `saveDC` is reused: 0 disables a save, otherwise integer 1–40. Roll d20 + floor((target stat − 10) / 2); a total ≥ DC resists the condition, while the landed direct attack damage remains unchanged. Use monster source stats and player effective stats. Chance and save results use the saved encounter seed. Immunity and active antidote reject the condition before RNG; chance 0/100 are deterministic. The initial 100% chance default is an explicit grid balance choice where source records declare a status but provide no chance value.

Custom after-hit statuses work on the 29 supported damage/heal/buff catalog actions where the effect is damage, nine supported monster active attacks, and authored class damage actions. Non-damage authored actions such as traps, fields and transformations keep their explicit mechanics. This is not a general interpreter for all old skill descriptions. Ice Bind, Poison Blade and Shield Bash are now executable source actions; Poison Blade requires a dagger/sword and Shield Bash requires a shield. Existing tuition/learning gates still apply.

## Duration, stacking and clearing

Statuses tick at the existing round boundary after the monster phase. A condition applied to a player during that phase skips that immediate boundary, so a one-turn stun/freeze survives for the player's next opportunity to act. Player-applied enemy statuses affect that enemy phase before decrementing. Both sides receive the same number of affected opportunities. Poison/Burn damage occurs before decrementing. Duration and DOT potency refresh to the larger value instead of stacking separate instances.

Legacy encounters without new timing metadata retain their old counters. Buff duration semantics are unchanged. Ended battles do not run extra rounds. DOT death updates outcome and existing monster loot exactly once. Cure now clears all ten supported harmful statuses and their metadata, without removing buffs or reviving. A controlled caster cannot self-cleanse, but an eligible teammate can cleanse them. Antidote only clears/prevents poison.

## UI and isolated scenarios

Normal combat shows status icons, Thai labels and remaining turns on the commanded player and visible enemies; the party selector also shows allies' conditions. Controlled player commands are disabled, with the core independently enforcing the restriction and atomic rejection. Ability guides show actual status configuration, including DOT and saving throw details.

Update Test Field presets directly demonstrate poison, burn, frozen, stun, successful saving throws, Skeleton poison immunity, enemy-to-player poison and Cure. They reuse real damage/status/AI commands with explicitly labeled scenario-only configuration. The immune/resistance presets still show direct attack damage. Per-unit results show both HP and condition changes. Use the custom field to test real database edits. Scenarios never modify player saves, grant rewards or write database overrides.

## Verification

- `status-effects.test.cjs`: source action dispatch/equipment, per-target area effects, chance/save stats, immunity, duration across phases, action locks and atomic costs, held-cast interruption, DOT/death/loot, cleanse, snapshots and deterministic AI replays.
- `status-effects-ui.test.cjs`: actual form/save/reload and invalid chance rejection, real edited Fire in a custom arena, status presets, visible icons/durations, desktop/landscape, mock save isolation.
- Existing pure suites and targeted schema/catalog/grid/sandbox browser regressions remain required. Browser auth and storage are mocked throughout.
