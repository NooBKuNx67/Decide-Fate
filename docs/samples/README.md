# Generated Thai templates for manual chat AI

These committed examples use bundled mock game content only. They contain no account metadata, player saves or credentials. IDs containing `example` are illustrative; the AI must replace them with unique `custom-` IDs/names before creating real content. The fingerprint belongs to this bundled sample database, not the owner's current library.

- template-one-topic.txt: weapon; 6,004 characters.
- template-three-topics.txt: weapon, item and recipe; 12,292 characters.

Generate an account-specific file at download time via DecideDataTemplate.generate({db, schema, selected}); never use these sample fingerprints for another library. Each topic uses a real supported representative template and its editable fields, not every mechanic in that category. The original per-template request remains available for a different specific template. References are bounded and explicitly marked when truncated. Some detailed topics (NPC/skill/spell) exceed the soft 8,000-character target; combined files warn above 40,000 characters.

Commands (Node only, no network or account access):

```sh
node tools/generate-field-guide.cjs
node tools/check-field-guide.cjs
node tools/generate-template-sample.cjs
node closeout-data-template.test.cjs
```

Field meanings/statuses come from reports/world-database-links.json, the same audit used to generate WORLD-DATABASE-FIELDS.md. Do not hand-edit generated field-guide.js entries. A schema addition without an audited explanation fails generation/coverage tests. Existing authoring-only accessory.passive has one explicit documented guide entry. Unknown per-template numeric ranges are marked as unspecified rather than invented; examples still pass the real validators.

Part A is the pure generator. UI topic selection/download and unified Import/Export are separate later parts. No gameplay or importer protocol was changed. AI packs retain only format, baseFingerprint, changes and create at the top level.
