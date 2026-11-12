# Narrative play contract — owner decisions, 12 Nov 2026

This replaces the earlier 2 AP narrative prototype as the target for new play. It does not authorize breaking old saves, deleting catalog data or publishing the website.

## Confirmed interaction

1. Player types an intended action.
2. Local DM interprets it using current engine facts and enabled database records. Its output proposes a supported action with concrete actor, target and item/skill references.
3. UI shows the interpreted action for player confirmation. Ambiguous references require clarification; prose is not an executable command.
4. On confirmation, engine revalidates current state, ownership, learned skills, resources, targets and conditions. Stale proposals are rejected without spending anything.
5. Engine resolves randomness, damage, defenses, resource use, statuses, inventory and rewards. AI cannot supply authoritative numbers or directly modify saves.
6. DM narrates the committed outcome. Failed/invalid narration must not repeat the action or rewards. Engine result remains visible even with no AI connection.

## Rules removed from new play

No player-facing AP budget, cast duration, grid positions, cone/line geometry, attack distance, hearing distance or sight distance. Merely hiding labels is insufficient: these checks must not gate narrative actions. Existing fields remain readable for old-save compatibility. Existing frozen grid encounters need their explicit compatibility path.

Do not replace spatial effects with invented generic damage. A narrative equivalent must have an explicit engine-supported meaning; unsupported effects require a clear explanation and must not consume resources. Catalog migration and authoring guidance must distinguish these cases.

## Authoritative visible facts

Show current HP/MP, statuses, equipment by slot, owned inventory and quantities, learned skills, party and opponents. Source both UI and DM context from the same current engine state. A referenced catalog record is not proof of ownership or presence. Local DM must receive relevant updated facts each request rather than remembering inventory from chat.

## Remaining implementation work

- Replace the current narrative-v1 AP loop and held casting with the confirmed action/reaction flow. Keep resolution atomic and save-load compatible.
- Define and test party/enemy response ordering, incapacitation, status duration and cooldown advancement per exchange; avoid an extra automatic enemy turn on selection, confirmation cancellation or rejected actions.
- Extend interpretation beyond recommending existing buttons: validate a single structured proposal, show it clearly and require confirmation.
- Send committed result to narration without executing again; preserve deterministic offline output.
- Add authoritative inventory/equipment/skills panels and JRPG equipment presentation.
- Add direct isolated Update Test Field scenarios for the new flow and regression tests for duplicate confirmation, stale proposals, illegal ownership, immediate casting, repeated attacks without AP gating, enemy response and save/load.
- Test the actual local model on the owner's Windows / 16 GB RAM / RTX 4060. Mock transport passing is not proof of model compatibility or narration quality.

## Current implementation evidence

At commit 9bc12bd the narrative prototype still has 2 AP, explicit end-round and held-cast rules. Existing 54 pure and 6 focused browser successes apply to that prototype, not this new contract. Do not mark the new flow complete on that evidence.
