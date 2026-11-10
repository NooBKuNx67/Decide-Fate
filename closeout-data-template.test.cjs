require('./dist/tactical-systems');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { load } = require('./tools/audit-content.cjs');
const A = require('./dist/content-authoring');
const R = require('./dist/rules');
const T = require('./dist/data-template');
const guide = require('./dist/field-guide');
const { db, schema } = load();
const copy = value => JSON.parse(JSON.stringify(value));
const before = copy(db);
const available = T.topics(db, schema);
assert.equal(available.filter(topic => topic.supported).length, A.kinds.length);
assert(available.some(topic => !topic.supported && topic.message.includes('ยังไม่รองรับ')));
const bases = R.records({ ...db, overrides: {} });
for (const topic of available.filter(topic => topic.supported)) {
  const result = T.generate({ db, schema, selected: [topic.key] });
  assert.equal(result.characterCount, result.text.length);
  const embedded = result.text.split('---BEGIN EXAMPLE RESPONSE---\n')[1].split('\n---END EXAMPLE RESPONSE---')[0];
  const pack = A.decode(embedded);
  assert.deepEqual(Object.keys(pack), ['format', 'baseFingerprint', 'changes', 'create']);
  const staged = A.stage(pack, db.overrides || {}, R.records(db));
  A.validateRegistry(staged.next[A.KEY], bases, schema);
  assert(pack.create.every(record => record.id.startsWith('custom-example-')));
  for (const key of result.topics[0].fields) {
    assert(guide.entries[topic.key + '.' + key].description);
    assert(T.statusLabels[guide.entries[topic.key + '.' + key].status]);
    assert(result.text.includes(key + ' | '));
  }
  console.log('PASS template topic ' + topic.key + ': ' + result.characterCount + ' chars');
}
const combined = T.generate({ db, schema, selected: A.kinds });
assert.equal(combined.exampleResponse.create.length, A.kinds.length);
A.validateRegistry(A.stage(A.decode(JSON.stringify(combined.exampleResponse)), {}, R.records(db)).next[A.KEY], bases, schema);
assert(combined.warning.includes('40,000'));
const changed = copy(db);
changed.overrides = { 'spell:preset-spell-fire': { mpCost: 19 } };
assert.notEqual(T.generate({ db: changed, schema, selected: ['weapon'] }).exampleResponse.baseFingerprint, combined.exampleResponse.baseFingerprint);
const schemaChanged = copy(schema);
schemaChanged.schemas.npc.fields.push({ key: 'unknownFutureField', label: 'ใหม่', type: 'text' });
assert.throws(() => T.assertCoverage(schemaChanged), /unknownFutureField/);
const missingExplanation = copy(guide.entries);
delete missingExplanation['npc.name'];
assert.throws(() => T.assertCoverage(schema, missingExplanation), /npc.name/);
assert.throws(() => T.generate({ db, schema, selected: [] }), /อย่างน้อย/);
assert.throws(() => T.generate({ db, schema, selected: ['proficiency'] }), /ไม่รองรับ/);
const privateInput = copy(db);
Object.assign(privateInput, { password: 'PASSWORD_SENTINEL', access_token: 'TOKEN_SENTINEL', playerSave: { name: 'SAVE_SENTINEL' } });
const safe = T.generate({ db: privateInput, schema, selected: ['npc', 'weapon', 'spell'] });
for (const secret of ['PASSWORD_SENTINEL', 'TOKEN_SENTINEL', 'SAVE_SENTINEL', 'sb_publishable_', 'service_role']) assert(!safe.text.includes(secret));
assert.deepEqual(db, before);
// Same classic-script module is callable in the browser without CommonJS.
const context = { window: {} };
Object.assign(context.window, { DecideContentAuthoring: A, EvervaleRules: R, DecideFieldGuide: guide });
vm.runInNewContext(fs.readFileSync('dist/data-template.js', 'utf8'), context);
assert.equal(context.window.DecideDataTemplate.generate({ db, schema, selected: ['weapon'] }).text, T.generate({ db, schema, selected: ['weapon'] }).text);
for (const [file, selected] of [['template-one-topic.txt', ['weapon']], ['template-three-topics.txt', ['weapon', 'item', 'recipe']]]) {
  assert.equal(fs.readFileSync('docs/samples/' + file, 'utf8'), T.generate({ db, schema, selected }).text);
}
console.log('PASS A: all supported topics, actual import validators/mixed kinds, complete audited field coverage, fresh fingerprints, size warnings, no private account/save data, browser/Node parity and generated samples');
