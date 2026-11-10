const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const errors = [];
    const sdk = fs.readFileSync('creation-ui.test.cjs', 'utf8').match(/body:`([^`]+)`/)[1];
    async function account(id) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      await context.route('https://esm.sh/**', route => route.fulfill({ contentType: 'application/javascript', body: sdk.replace('creation-qa', id) }));
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:4173');
      await page.locator('#menuScreen').waitFor({ state: 'visible' });
      await page.click('#databaseMenu');
      return page;
    }
    async function upload(page, text, name = 'answer.json') {
      const choosing = page.waitForEvent('filechooser');
      await page.click('#dataImportButton');
      await (await choosing).setFiles({ name, mimeType: 'application/json', buffer: Buffer.from(text) });
    }
    const page = await account('transfer-a');
    const pack = await page.evaluate(() => DecideDataTemplate.generate({ db: { ...EvervaleContent, overrides: EvervaleEditor.snapshot() }, schema: EvervaleContentSchema, selected: ['weapon', 'item'] }).exampleResponse);
    pack.create[0].displayName = '<img src=x onerror=__transfer=1>';
    await upload(page, JSON.stringify(pack));
    await page.locator('#authorReview').waitFor({ state: 'visible' });
    assert.deepEqual(await page.evaluate(() => EvervaleEditor.snapshot()), {});
    assert.match(await page.locator('#authorStatus').innerText(), /ไม่รันโค้ด/);
    assert.equal(await page.locator('#authorReview img').count(), 0);
    await page.click('#authorApply');
    await page.locator('#authorReview').waitFor({ state: 'hidden' });
    const expected = await page.evaluate(() => EvervaleEditor.snapshot());
    assert.equal(await page.evaluate(() => window.__transfer || 0), 0);
    const downloading = page.waitForEvent('download');
    await page.click('#dbExport');
    const output = fs.readFileSync(await (await downloading).path(), 'utf8');
    assert.deepEqual(Object.keys(JSON.parse(output)).sort(), ['format', 'overrides']);
    assert.deepEqual(JSON.parse(output).overrides, expected);
    const other = await account('transfer-b');
    await upload(other, output);
    await other.locator('#authorReview').waitFor({ state: 'visible' });
    assert.match(await other.locator('#authorReviewMode').innerText(), /แทนฐานข้อมูลแก้ไขทั้งหมด/);
    assert.deepEqual(await other.evaluate(() => EvervaleEditor.snapshot()), {});
    await other.click('#authorApply');
    await other.locator('#authorReview').waitFor({ state: 'hidden' });
    assert.deepEqual(await other.evaluate(() => EvervaleEditor.snapshot()), expected);
    assert.equal(await other.evaluate(() => EvervaleSave.hasCharacter()), false);
    for (const text of ['{', '<html><script>__transfer=1</script></html>', '{"format":"unknown"}', JSON.stringify({ ...pack, extra: true }), ' '.repeat(2000001)]) {
      await upload(other, text);
      await other.waitForFunction(() => document.getElementById('authorStatus').textContent.includes('นำเข้าไม่ได้'));
      assert.deepEqual(await other.evaluate(() => EvervaleEditor.snapshot()), expected);
      assert.equal(await other.locator('#authorReview').isVisible(), false);
    }
    await other.locator('#authorRestore').evaluate(element => element.closest('details').open = true);
    await other.click('#authorRestore');
    await other.locator('#authorReview').waitFor({ state: 'visible' });
    await other.click('#authorApply');
    await other.locator('#authorReview').waitFor({ state: 'hidden' });
    assert(await other.evaluate(() => EvervaleEditor.snapshot()[DecideContentAuthoring.KEY].records.every(row => row.enabled === false)));
    assert.deepEqual(await page.evaluate(() => EvervaleEditor.snapshot()), expected);
    assert.deepEqual(errors, []);
    console.log('PASS C: single Import file chooser, AI diff/confirmation/inert HTML warning, full export/new mock account exact import, invalid-file atomic rejection, backup and disabled rollback, account isolation');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
