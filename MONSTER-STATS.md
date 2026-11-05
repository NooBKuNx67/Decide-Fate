# Monster source stats — phase 3

New design-1 free-field encounters now use the original monster HP, MP and normal attack value instead of the 12–70 HP clamp and STR-derived placeholder attack. All 35 original monsters compile successfully, including Cave Rat Swarm (10 HP), Tiamat (106 HP / 37 normal ATK) and Bahamut (119 HP / 39 normal ATK). Original content records remain unchanged.

## Source snapshot and entry path

`dist/monster-stats.js` compiles `hp`, `mp`, `attack`, `defense`, `magicDefense`, `damageReduction`, `accuracy`, `evasion` and `level` into optional `enemy.catalogStats = {v:1,...}`. The actual new-encounter controller calls `initialize` immediately after creation and before saving or charging entry time/energy. It sets current/max HP and MP, normal attack and zero placeholder armor. It compiles all identified enemies before applying changes, so an invalid source record cannot partially initialize a party. Disabled/unidentified/scripted enemies retain their existing path. Incomplete or out-of-range identified source records show an error instead of silently fabricating replacement stats.

The generic `C.create` remains compatible with scripted callers and older test/encounter shapes. Its old fallback stats are replaced only by this explicit fresh-field initialization. Chapter/training opponents without a catalog monster identity are unaffected.

`initialize` is restricted to active round-1 design-1 tactical encounters and never reinitializes a unit with an existing profile. Resume/load does **not** call it for existing encounters. A previously saved battle without `catalogStats` keeps its current/max HP, attack, armor and old hit formula, including the previous passive scaling. Catalog edits affect the next newly started field, not the battle in progress.

## Explicit grid hit conversion

The original d20 engine is not reinstated. The existing seeded accuracy calculation and 20%–99% hit-chance limits remain. These are the provisional grid conversions for a new source profile:

- Outgoing Accuracy: `(source Accuracy − 10 + passive Accuracy bonus) × 1 percentage point`.
- Incoming physical Defense penalty: `(source Defense − 10 + passive Defense bonus) × 5 percentage points`.
- Incoming Evasion penalty, physical and magical: `(source Evasion + passive Evasion bonus) × 1 percentage point`.

These terms modify the existing class/stat/proficiency/weapon accuracy calculation. A positive Defense/Evasion reduces the attacker's hit chance; negative Evasion is retained and raises it. Defense does not become flat damage reduction and does not reduce magical hit chance. Base value 10 is neutral for Accuracy and Defense; Evasion 0 is neutral.

Typed bonuses use the same units as their base field for new profiles. Thus Swarm Tactics Accuracy +2 adds **2 percentage points** to a new source-profile monster. Older saved encounters without a source profile retain the previous +10 percentage point behavior. The enemy passive description uses the correct scale for that encounter; the journal describes current new-field rules. Thick Hide Defense +3 remains 15 percentage points in both variants. This is a deliberate compatibility split, not a second application of bonuses.

## Damage and mitigation

- `attack` is the normal attack's base damage. Monster active skills keep their own dice and source ability modifier; the normal ATK is not added to those dice.
- Existing attack-percent passives apply once: for example ATK37 with Ancient Might +25% rounds to 46 before critical/defense calculations.
- Physical mitigation uses `source damageReduction + passive physical reduction`.
- Magical mitigation uses `source magicDefense + passive magic reduction`.
- Source-profile monsters use zero placeholder armor, avoiding an extra hidden armor point. Elemental interaction occurs before mitigation; current guard, resistance, barriers and damage-floor rules remain. Immunity remains true zero.
- Level is retained as source metadata. This phase does not change loot weights, reward/XP amounts, turn order, initiative, perception/stealth DC or ability acquisition.

## UI and data limits

Visible source-profile enemies have a collapsed “ค่าสถานะพื้นฐาน” section showing their snapshotted base values separately from passive effects. HP/max HP and MP/max MP reflect the actual combat state. Only visible enemies expose these details. Old encounters do not acquire misleading new-stat labels.

Finite numeric bounds: HP 1–10000, MP 0–10000, normal attack 0–2000, Defense/Accuracy/Evasion −100–100, magic/physical reduction 0–1000 and level 1–1000. Validation rejects malformed profiles and profiles attached to a player. Existing save transport and content schema are unchanged.

## Verification

`monster-stats.test.cjs`: all 35 profiles, exact HP/MP/ATK, removal of old caps, chance boundaries, negative Evasion, separate physical/magic mitigation, passive combinations and scaling, elemental order, independent active-skill dice, frozen source edits, legacy saves and atomic initialization failure.

`monster-stats-ui.test.cjs`: mocked auth/storage, the actual new-field button with Tiamat (106 HP), real damage and source-detail UI, source edits held out of a running battle, reload without HP refill, a new field taking edited HP/ATK, preservation of a pre-update saved encounter and landscape overflow. Screenshots: `artifacts/qa/monster-source-stats.png`, `monster-source-stats-landscape.png`.

These are source-backed stats plus an explicit grid conversion, not a completed balance pass. Playtesting and tuning rewards/AI choices remain separate work.
