require('../dist/tactical-systems');
const { load } = require('./audit-content.cjs');
const template = require('../dist/data-template.js');
const { schema } = load();
template.assertCoverage(schema);
console.log('PASS field-guide/schema coverage: every schema field has a Thai explanation and audited mechanic status');
