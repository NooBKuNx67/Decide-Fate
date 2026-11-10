/* Content files only: no character saves or account credentials. */
(function (root, factory) {
  const api = factory(root.DecideContentAuthoring || (typeof require === 'function' ? require('./content-authoring') : null));
  if (typeof module !== 'undefined') module.exports = api;
  root.DecideDataTransfer = api;
})(typeof window === 'undefined' ? globalThis : window, function (A) {
  'use strict';
  const LIBRARY = 'evervale-content-v1';
  const copy = value => JSON.parse(JSON.stringify(value));

  function parse(text, byteSize) {
    if (typeof text !== 'string' || (byteSize ?? new TextEncoder().encode(text).length) > 2000000) {
      throw Error('ไฟล์ใหญ่เกิน 2 MB');
    }
    let value;
    try { value = A.decode(text); }
    catch (error) { throw Error('อ่าน JSON ไม่ได้: ' + error.message); }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('ไฟล์ JSON ต้องเป็น object');
    if (value.format === A.FORMAT) {
      if (Object.keys(value).some(key => !['format', 'baseFingerprint', 'changes', 'create'].includes(key))) {
        throw Error('ชุดข้อมูลมีช่องที่ไม่รองรับ');
      }
    } else if (value.format === LIBRARY) {
      if (Object.keys(value).some(key => !['format', 'overrides', 'createdAt'].includes(key))) throw Error('ไฟล์ส่งออกมีช่องที่ไม่รองรับ');
      if (!value.overrides || typeof value.overrides !== 'object' || Array.isArray(value.overrides)) throw Error('overrides ต้องเป็น object');
    } else throw Error('รูปแบบไฟล์ไม่รองรับ: ใช้ไฟล์ Export หรือ decide-fate-data-pack-v1');
    return value;
  }

  function stage(value, current, rows, validate, records) {
    if (value.format === A.FORMAT) {
      const staged = A.stage(value, current, rows);
      staged.next = validate(staged.next);
      return staged;
    }
    const next = validate(value.overrides);
    const created = [], changed = [];
    for (const row of records(next)) {
      const old = rows.find(item => item.key === row.key);
      if (!old) {
        created.push({ key: row.key, name: row.displayName || row.name, templateKey: row.templateKey });
        continue;
      }
      const fields = Object.keys(row).filter(key => !['key', 'id', 'kind', 'name'].includes(key) && JSON.stringify(row[key]) !== JSON.stringify(old[key]))
        .map(field => ({ field, before: old[field], after: row[field] }));
      if (fields.length) changed.push({ key: row.key, name: row.displayName || row.name, fields });
    }
    return { next, created, changed, baseFingerprint: A.fingerprint(current), replacesLibrary: true };
  }

  function exportLibrary(snapshot) {
    return { format: LIBRARY, overrides: copy(snapshot) };
  }

  return { parse, stage, exportLibrary };
});
