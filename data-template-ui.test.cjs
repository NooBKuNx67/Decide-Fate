const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const sdk = fs.readFileSync('creation-ui.test.cjs', 'utf8').match(/body:`([^`]+)`/)[1];
    await page.route('https://esm.sh/**', route => route.fulfill({ contentType: 'application/javascript', body: sdk }));
    await page.goto('http://127.0.0.1:4173');
    await page.locator('#menuScreen').waitFor({ state: 'visible' });
    await page.click('#databaseMenu');
    for (const id of ['dataImportButton', 'dbExport', 'dataTemplateButton']) assert(await page.locator('#' + id).isVisible());
    await page.click('#dataTemplateButton');
    assert(await page.locator('#dataTemplateDownload').isDisabled());
    assert(await page.locator('[data-data-topic="proficiency"]').isDisabled());
    assert.match(await page.locator('.data-topic-unavailable').innerText(), /ยังไม่รองรับ ต้องแก้โค้ด/);
    await page.locator('[data-data-topic="weapon"]').check();
    await page.locator('[data-data-topic="item"]').check();
    assert.match(await page.locator('#dataTemplateCount').innerText(), /2 หัวข้อ/);
    await page.evaluate(() => EvervaleEditor.commit({ 'spell:preset-spell-fire': { mpCost: 17 } }));
    const expectedFingerprint = await page.evaluate(() => DecideContentAuthoring.fingerprint(EvervaleEditor.snapshot()));
    const downloading = page.waitForEvent('download');
    await page.click('#dataTemplateDownload');
    const file = await downloading;
    assert.match(file.suggestedFilename(), /^decide-fate-template-\d{8}\.txt$/);
    const text = fs.readFileSync(await file.path(), 'utf8');
    const pack = JSON.parse(text.split('---BEGIN EXAMPLE RESPONSE---\n')[1].split('\n---END EXAMPLE RESPONSE---')[0]);
    assert.deepEqual(pack.create.map(record => record.kind), ['weapon', 'item']);
    assert.equal(pack.baseFingerprint, expectedFingerprint);
    assert(!pack.create.some(record => record.kind === 'npc'));
    await page.click('#dataTopicsAll');
    assert.match(await page.locator('#dataTemplateWarning').innerText(), /40,000/);
    await page.click('#dataTopicsClear');
    assert(await page.locator('#dataTemplateDownload').isDisabled());
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.locator('body').evaluate(body => body.scrollWidth <= innerWidth));
    await page.click('#dataTemplateClose');
    for (const id of ['dataImportButton', 'dbExport', 'dataTemplateButton']) assert((await page.locator('#' + id).boundingBox()).height >= 44);
    assert.deepEqual(errors, []);
    console.log('PASS B: three visible buttons, supported topic checkboxes, fresh-fingerprint selected-topic TXT, length warning, clear/disabled state and mobile controls (mock account)');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
