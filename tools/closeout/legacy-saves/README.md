# Synthetic historical save fixtures

No fixture contains account storage, player exports, credentials or copied player saves. The authoring script runs historical repository source in an isolated VM, creates named synthetic characters/progress/inventory and validates each authored shape with that historical validator before recording its hash. Finished/pending-won states are deliberately authored test states, not claims of an end-to-end historical playthrough.

| Fixture | Source | Difference represented |
| --- | --- | --- |
| v2-before-identity | 9b09309 | Supported v2 import shape before character identity; upgrades to v3 with character:null and preserved wealth/activity progress. The original v2 producer predates available Git history; this shape is based on the earliest archived validator's v2 branch, not a claim that this commit produced v2. |
| v3-before-new-creation | d687963 | Legacy character without design/creation, completed claimed chapter, companion and cached map position. |
| v3-creation-v1 | d745307 | First design:1 / creation.v:1 point-buy, inventory and completed chapter. Must not respec its old budget or discard items. |
| v3-before-two-ap | 1b1615d | Creation v3 but one-action frozen encounter without systems:2; Guard already spent its action. |
| v3-checkpoint-before-world-placement | 0187c88 | Actual checkpoint/legacy-systems-2026-11-05 branch; 2 AP, catalog inventory/equipment, frozen pending victory/drops, no worldRules/placements. |
| v3-travel-before-placement | eaa776d | World travel and active/completed side quests already exist, but no chapterPlaces/enforceLocations/placements. Preserves both actual world location and cached map view. |

Full commit IDs and SHA-256 hashes are in manifest.json. Rebuild only in a clone with those Git objects: `node tools/closeout/generate-legacy-saves.cjs`. The generator reads source only, never remote databases or accounts. It follows each commit's script ordering and uses deterministic random input. The imported checkpoint reference was verified to point to 0187c8811e5262bdc8e52c1a9585cbd727b2fdfb.

Normal tests require only Node and the checked-in fixtures, **not Git history, a network, Playwright or a database**:

```sh
node closeout-legacy-saves.test.cjs
node tools/check.cjs
```

The pure test checks repeated current validation/serialization, important character/inventory/quest/chapter/location values, inactive legacy world enforcement, frozen encounter preservation, and repeated settlement before/after claim. v2 has no identity/level/items to reconstruct; the existing UI asks the user to choose an identity rather than pretending one existed.

Current load path reviewed: importSave and EvervaleSave.load in dist/game.js validate through rules.validate, then validate contentEdits before replacing the player state. rules.validate accepts envelope v2/v3 and delegates creation, encounter, journal, overworld, inventory/equipment and chapter validation. The existing targeted Lin 96→100 migration is untouched. map-data/world-links keep location enforcement opt-in when historical map data has no worldRules. No save schema or loader/engine was changed for these tests.

With a running preview and configured Playwright, `node tools/qa-runtime.cjs closeout-legacy-saves-ui.test.cjs` additionally runs the actual import/library-validation/render/local reload flow for all six files with mock authentication and private browser contexts. It does not access real accounts. These fixtures are representative compatibility coverage, not every historical save combination or a real Supabase acceptance test.
