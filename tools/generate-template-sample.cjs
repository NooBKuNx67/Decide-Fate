// Bundled game content only: no accounts, player saves, Supabase or credentials.
require('../dist/tactical-systems');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./audit-content.cjs');
const template = require('../dist/data-template.js');
const { db, schema } = load();
const samples = [
  ['template-one-topic.txt', ['weapon']],
  ['template-three-topics.txt', ['weapon', 'item', 'recipe']]
];
const directory = path.join(__dirname, '../docs/samples');
fs.mkdirSync(directory, { recursive: true });
for (const [file, selected] of samples) {
  const result = template.generate({ db, schema, selected });
  fs.writeFileSync(path.join(directory, file), result.text);
  console.log(file + ': ' + result.characterCount + ' characters');
}
