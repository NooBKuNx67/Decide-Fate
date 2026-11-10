/* Data-management UI only. Existing import/export handlers and validators stay authoritative. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined') module.exports = api;
  root.DecideDataWorkflowUI = api;
  if (root.document) api.mount();
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';

  function mount() {
    const document = root.document;
    if (!document || document.getElementById('dataTransferTools')) return;
    const el = id => document.getElementById(id);
    const host = el('dbEditorTools');
    if (!host) return;
    const toolbar = document.createElement('div');
    toolbar.id = 'dataTransferTools';
    toolbar.className = 'data-transfer-tools';
    toolbar.setAttribute('role', 'group');
    toolbar.setAttribute('aria-label', 'Import Export Template');
    const importButton = document.createElement('button');
    importButton.id = 'dataImportButton';
    importButton.textContent = 'นำเข้า (Import)';
    const exportButton = el('dbExport');
    exportButton.textContent = 'ส่งออก (Export)';
    const templateButton = document.createElement('button');
    templateButton.id = 'dataTemplateButton';
    templateButton.textContent = 'ไฟล์ตัวอย่างให้ AI (Template)';
    const oldImportLabel = el('dbImport').closest('label');
    if (oldImportLabel) oldImportLabel.hidden = true;
    importButton.onclick = () => el('dbImport').click();
    toolbar.append(importButton, exportButton, templateButton);
    host.prepend(toolbar);
    const exportNote = document.createElement('p');
    exportNote.id = 'dataExportNote';
    exportNote.textContent = 'Export ส่งออกทั้งหมด รวมข้อมูลแผนที่/ฉากและรายการอ้างอิง เพื่อให้นำเข้ากลับได้ครบ ไม่รวมเซฟตัวละครหรือข้อมูลบัญชี';
    toolbar.after(exportNote);

    const dialog = document.createElement('dialog');
    dialog.id = 'dataTemplateDialog';
    dialog.className = 'data-template-dialog';
    dialog.innerHTML = '<h2>ไฟล์ตัวอย่างให้ AI (Template)</h2>' +
      '<p>เลือกเฉพาะหัวข้อที่ต้องการ ไฟล์จะใช้ฐานข้อมูลและ fingerprint ปัจจุบันตอนดาวน์โหลด</p>' +
      '<div class="data-transfer-tools"><button id="dataTopicsAll">เลือกทั้งหมด</button><button id="dataTopicsClear">ล้าง</button></div>' +
      '<div id="dataTopicList" class="data-topic-list"></div>' +
      '<p id="dataTemplateCount" role="status" aria-live="polite"></p>' +
      '<p id="dataTemplateWarning" role="alert"></p>' +
      '<div class="data-transfer-tools"><button id="dataTemplateDownload">ดาวน์โหลด Template</button><button id="dataTemplateClose">ปิด</button></div>';
    document.body.append(dialog);
    const selected = new Set();
    const template = root.DecideDataTemplate;
    const schema = root.EvervaleContentSchema;
    const database = () => ({ ...root.EvervaleContent, overrides: root.EvervaleEditor.snapshot() });
    const generate = () => template.generate({ db: database(), schema, selected: [...selected] });

    function measure() {
      el('dataTemplateDownload').disabled = !selected.size;
      if (!selected.size) {
        el('dataTemplateCount').textContent = 'เลือกอย่างน้อย 1 หัวข้อ';
        el('dataTemplateWarning').textContent = '';
        return;
      }
      try {
        const result = generate();
        el('dataTemplateCount').textContent = 'ประมาณ ' + result.characterCount.toLocaleString('th-TH') + ' ตัวอักษร • ' + selected.size + ' หัวข้อ';
        el('dataTemplateWarning').textContent = result.warning;
      } catch (error) {
        el('dataTemplateCount').textContent = 'สร้างไฟล์ไม่ได้';
        el('dataTemplateWarning').textContent = error.message;
        el('dataTemplateDownload').disabled = true;
      }
    }

    function refresh() {
      const topics = template.topics(database(), schema);
      for (const key of selected) if (!topics.some(topic => topic.key === key && topic.supported)) selected.delete(key);
      el('dataTopicList').replaceChildren();
      for (const topic of topics) {
        const label = document.createElement('label');
        label.className = topic.supported ? 'data-topic' : 'data-topic data-topic-unavailable';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.dataTopic = topic.key;
        checkbox.disabled = !topic.supported;
        checkbox.checked = selected.has(topic.key);
        const text = document.createElement('span');
        text.textContent = topic.label;
        label.append(checkbox, text);
        if (!topic.supported) {
          const note = document.createElement('small');
          note.textContent = topic.message;
          label.append(note);
        }
        checkbox.onchange = () => {
          if (checkbox.checked) selected.add(topic.key);
          else selected.delete(topic.key);
          measure();
        };
        el('dataTopicList').append(label);
      }
      measure();
    }

    templateButton.onclick = () => {
      refresh();
      dialog.showModal();
    };
    el('dataTopicsAll').onclick = () => {
      for (const topic of template.topics(database(), schema)) if (topic.supported) selected.add(topic.key);
      refresh();
    };
    el('dataTopicsClear').onclick = () => {
      selected.clear();
      refresh();
    };
    el('dataTemplateClose').onclick = () => dialog.close();
    el('dataTemplateDownload').onclick = () => {
      try {
        // Never reuse a preview: another tab or form may have changed the library.
        const result = generate();
        const now = new Date();
        const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('');
        const url = URL.createObjectURL(new Blob([result.text], { type: 'text/plain;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'decide-fate-template-' + date + '.txt';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        measure();
      } catch (error) {
        el('dataTemplateWarning').textContent = error.message;
      }
    };
    root.addEventListener('evervale-content-save', () => {
      if (dialog.open) refresh();
    });
  }

  return { mount };
});
