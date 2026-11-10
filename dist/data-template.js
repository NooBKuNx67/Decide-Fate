/* Read-only Thai templates for manual chat AI; no auth, storage, save or network access. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined') module.exports = api;
  root.DecideDataTemplate = api;
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';

  const authoring = root.DecideContentAuthoring || (typeof require === 'function' ? require('./content-authoring.js') : null);
  const rules = root.EvervaleRules || (typeof require === 'function' ? require('./rules.js') : null);
  const guide = root.DecideFieldGuide || (typeof require === 'function' ? require('./field-guide.js') : null);
  const statusLabels = {
    runtime: 'มีกลไกอ่านจริง',
    partial: 'อ่านผ่านตัวแปลงที่รองรับ',
    display: 'แสดงผลเท่านั้น',
    unlinked: 'เก็บเฉย ๆ ไม่มีผลต่อกลไก'
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  const oneLine = value => String(value ?? '').replace(/[\r\n|]+/g, ' ').replace(/\s+/g, ' ').trim();
  const short = (value, limit) => {
    const text = oneLine(value);
    return text.length > limit ? text.slice(0, limit) + '…' : text;
  };

  function assertCoverage(schema, entries = guide.entries) {
    for (const [kind, definition] of Object.entries(schema.schemas)) {
      for (const field of definition.fields) {
        const info = entries[kind + '.' + field.key];
        if (!info?.description || !statusLabels[info.status]) {
          throw Error('ยังไม่มีคำอธิบาย/สถานะ: ' + kind + '.' + field.key);
        }
      }
    }
    const expected = new Set(Object.entries(schema.schemas).flatMap(([kind, definition]) => definition.fields.map(field => kind + '.' + field.key)));
    for (const key of Object.keys(entries)) {
      if (!expected.has(key) && key !== 'accessory.passive') throw Error('field guide ไม่ตรง schema: ' + key);
    }
    return true;
  }

  function topics(db, schema) {
    const templates = authoring.templates(rules.records(db));
    return schema.types.map(type => ({
      key: type.key,
      label: type.label,
      supported: authoring.kinds.includes(type.key) && templates.some(row => row.kind === type.key),
      message: templates.some(row => row.kind === type.key) && authoring.kinds.includes(type.key)
        ? '' : 'ยังไม่รองรับ ต้องแก้โค้ด'
    }));
  }

  function allowedValues(kind, field, example) {
    if (field.options) return field.options.map(value => JSON.stringify(value)).join(', ');
    if (field.type === 'boolean') return 'true / false';
    if (field.type === 'number') {
      const common = {
        buyPrice: [0, 1000000], sellPrice: [0, 1000000], goldCost: [0, 1000000],
        levelRequirement: [0, 1000], gridWidth: [1, 15], gridLength: [1, 20],
        gridRange: [0, 20], gridCount: [1, 13], pushDistance: [0, 20], pullDistance: [0, 20],
        hazardWidth: [1, 15], hazardLength: [1, 20], hazardTurns: [1, 20], hazardDamage: [0, 999]
      };
      const monster = {
        hp: [1, 10000], mp: [0, 10000], attack: [0, 2000], defense: [-100, 100],
        magicDefense: [0, 1000], damageReduction: [0, 1000], accuracy: [-100, 100],
        evasion: [-100, 100], level: [1, 1000], str: [1, 99], dex: [1, 99], con: [1, 99],
        int: [1, 99], wis: [1, 99], cha: [1, 99]
      };
      if (field.key === 'weaponRangeMax') return '-1 หรือจำนวนเต็ม 1–20';
      if (field.key === 'weaponRangeMin') return 'จำนวนเต็ม 0–20';
      if (kind === 'weapon' && field.key === 'attackBonus') return 'จำนวนเต็ม -20–20';
      if (kind === 'weapon' && field.key === 'elementDamage') return 'ตัวเลข 0–999';
      if (kind === 'recipe' && field.key === 'resultQuantity') return 'จำนวนเต็ม 1–99';
      if (['armor', 'helmet', 'boots', 'accessory'].includes(kind) && field.key === 'defense') return 'ตัวเลข 0–1000';
      const range = kind === 'monster' ? monster[field.key] || common[field.key] : common[field.key];
      if (range) return range.join('–') + ' (ต้องผ่านเงื่อนไขร่วมของแม่แบบด้วย)';
      return 'finite; ช่วงขึ้นกับแม่แบบ คงค่าตัวอย่าง ' + JSON.stringify(example[field.key] ?? 0) + ' แล้วตรวจในเกม';
    }
    if (field.type === 'image') return 'ว่าง หรือ URL http/https หรือ data:image/png,jpeg,webp,gif ตามตัวตรวจ; ห้ามใส่ token ใน URL';
    if (field.type === 'proficiencyPicker') return 'array ของ {name,grade}; grade D/C/B/A/S';
    if (field.type === 'keyvalue') return 'array ของ {key,value} โดย value เป็น string';
    if (['reference', 'lootPicker', 'tags'].includes(field.type)) {
      return 'array ของ string' + (field.refType ? '; อ้าง ' + field.refType + (field.byName ? ' ด้วยชื่ออ้างอิงเดิม' : ' ด้วย ID') : '');
    }
    return 'string ตามตัวอย่างแม่แบบ';
  }

  function exampleFor(kind, templates, current, baseRows, schema, usedNames, usedIds, rows) {
    let number = 1;
    while (usedIds.has('custom-example-' + kind.toLowerCase() + '-' + String(number).padStart(3, '0')) || usedNames.has(('ตัวอย่าง ' + kind + ' ' + number).toLowerCase())) number++;
    const id = 'custom-example-' + kind.toLowerCase() + '-' + String(number).padStart(3, '0');
    const name = 'ตัวอย่าง ' + kind + ' ' + number;
    let lastError;
    for (const template of templates.filter(row => row.kind === kind)) {
      try {
        const request = authoring.request(template, current, schema, rows, id);
        const example = copy(request.exampleResponse.create[0]);
        example.name = name;
        // Image payloads/signed URLs are unnecessary for AI examples and may be very long.
        for (const field of authoring.fieldsFor(template, schema)) if (field.type === 'image') example[field.key] = '';
        authoring.validateRegistry({ v: 1, records: [...authoring.records(current).map(({ key, ...row }) => row), example] }, baseRows, schema);
        usedIds.add(id);
        usedNames.add(name.toLowerCase());
        return { template, example, request };
      } catch (error) {
        lastError = error;
      }
    }
    throw Error('สร้างตัวอย่างที่ผ่านตัวตรวจไม่ได้สำหรับ ' + kind + ': ' + (lastError?.message || 'ไม่มีแม่แบบ'));
  }

  function generate({ db, schema, selected, referenceLimit = 8 }) {
    assertCoverage(schema);
    const selectedKinds = [...new Set(selected || [])];
    if (!selectedKinds.length) throw Error('เลือกอย่างน้อย 1 หัวข้อ');
    const available = topics(db, schema);
    for (const kind of selectedKinds) if (!available.some(row => row.key === kind && row.supported)) throw Error('หัวข้อยังไม่รองรับ: ' + kind);
    const current = db.overrides || {};
    const remaining = 200 - authoring.records(current).length;
    if (remaining < selectedKinds.length) throw Error('เหลือโควตา ' + remaining + ' รายการ ไม่พอตัวอย่างหัวข้อละ 1 รายการ กรุณาลดหัวข้อ');
    const rows = rules.records(db);
    const baseRows = rules.records({ ...db, overrides: {} });
    const templates = authoring.templates(rows);
    const usedIds = new Set(rows.map(row => row.id));
    const usedNames = new Set(rows.map(row => row.name.toLowerCase()));
    const sections = [];
    const creates = [];
    const detail = [];
    const fingerprint = authoring.fingerprint(current);
    const header = [
      'คำสั่งกรอกข้อมูล Decide Fate สำหรับ ChatGPT / Claude ฟรี',
      'ทำหน้าที่กรอกข้อมูลเกมเท่านั้น ไม่แก้โค้ด ไม่ต้องใช้ GitHub ไม่ใช้ API และไม่เห็น repository',
      authoring.request(templates[0], current, schema, rows, 'custom-example-header-001').instructions,
      'ขอครั้งละ 5–10 รายการ ไม่เกินโควตาที่เหลือ ' + remaining + '/200 (รวมรายการ disabled); ไฟล์ไม่เกิน 2 MB',
      'ห้ามคัดลอก ID ตัวอย่างไปใช้ซ้ำ: เปลี่ยนเป็น custom- ที่ไม่ซ้ำและชื่อใหม่ก่อนตอบ; ห้ามเปลี่ยน baseFingerprint/templateKey',
      'ใช้ displayName สำหรับแก้ชื่อที่แสดง; ห้ามเพิ่มช่องที่ไม่ได้ระบุ แต่ละหัวข้อใช้แม่แบบที่ระบุเท่านั้น ไม่ครอบคลุมทุกกลไกในหมวด',
      'ช่องที่ไม่มีผลต่อกลไกเป็นข้อความ/ข้อมูลเท่านั้น ไม่สร้างกลไกจากคำบรรยาย; ต้อง Import ดู diff และยืนยันเอง',
      'baseFingerprint ปัจจุบัน: ' + fingerprint,
      ''
    ];
    for (const kind of selectedKinds) {
      const topic = available.find(row => row.key === kind);
      const { template, example, request } = exampleFor(kind, templates, current, baseRows, schema, usedNames, usedIds, rows);
      creates.push(example);
      const fields = authoring.fieldsFor(template, schema);
      const lines = ['หัวข้อ: ' + topic.label + ' (' + kind + ')', 'templateKey คงที่: ' + template.key,
        'กลไกที่รองรับจาก compile เดิม: ' + JSON.stringify(request.mechanics),
        'ช่อง | ความหมาย | ชนิด | ค่าที่ใส่ได้/ช่วง | สถานะผลต่อกลไก'];
      for (const field of fields) {
        const info = guide.entries[kind + '.' + field.key];
        if (!info) throw Error('ขาด field guide: ' + kind + '.' + field.key);
        const warning = ['display', 'unlinked'].includes(info.status) ? ' ⚠ ไม่มีผลกลไกตามคำบรรยาย' : '';
        lines.push([field.key, short(info.description, 64), field.type, oneLine(allowedValues(kind, field, example)), statusLabels[info.status] + warning].join(' | '));
      }
      lines.push('ช่องโครงสร้าง: id=custom- ไม่ซ้ำ; kind=' + kind + '; templateKey ห้ามแก้; enabled=true/false; displayName=string ≤150 ถ้าต้องการชื่อแสดงผล');
      lines.push('ช่องอื่นที่ไม่มีในตัวอย่างสืบทอดจากแม่แบบ อย่าแต่งช่องใหม่เอง', 'ตัวอย่างเต็มที่ผ่าน validateRegistry จริง:', JSON.stringify(example));
      const exampleText = JSON.stringify(example);
      const refs = request.references.slice().sort((a, b) => {
        const score = ref => exampleText.includes(JSON.stringify(ref.id)) || exampleText.includes(JSON.stringify(ref.name)) ? 0 : 1;
        return score(a) - score(b) || (a.kind + ':' + a.id).localeCompare(b.kind + ':' + b.id);
      });
      const shown = refs.slice(0, Math.max(0, Math.min(30, referenceLimit)));
      lines.push('รายการอ้างอิงที่ใช้ได้ (' + shown.length + '/' + refs.length + '):' + (shown.length < refs.length ? ' ตัดรายการแล้ว ขอหัวข้อน้อยลง/ใช้รายการที่แสดงเท่านั้น' : ''));
      for (const ref of shown) lines.push(ref.kind + ' | id=' + oneLine(ref.id) + ' | name=' + oneLine(ref.name));
      const section = lines.join('\n');
      detail.push({ key: kind, label: topic.label, fields: fields.map(field => field.key), characterCount: section.length, referencesTotal: refs.length, referencesShown: shown.length });
      sections.push(section);
    }
    const exampleResponse = { format: authoring.FORMAT, baseFingerprint: fingerprint, changes: {}, create: creates };
    const staged = authoring.stage(authoring.decode(JSON.stringify(exampleResponse)), current, rows);
    authoring.validateRegistry(staged.next[authoring.KEY], baseRows, schema);
    const text = header.concat(sections.join('\n\n'), '\nตัวอย่างคำตอบรวม — ตอบ JSON อย่างเดียว ห้ามใส่คำอธิบาย/Markdown',
      '---BEGIN EXAMPLE RESPONSE---', JSON.stringify(exampleResponse, null, 2), '---END EXAMPLE RESPONSE---').join('\n');
    return { text, characterCount: text.length, warning: text.length > 40000 ? 'ไฟล์เกิน 40,000 ตัวอักษร กรุณาลดหัวข้อก่อนส่ง AI ฟรี' : '', topics: detail, exampleResponse };
  }

  return { topics, generate, assertCoverage, statusLabels };
});
