const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {fixture}=require('./tools/closeout/custom-fixture.cjs'),A=require('./dist/adventure-data');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const sdk=fs.readFileSync('creation-ui.test.cjs','utf8').match(/body:`([^`]+)`/)[1];await page.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:sdk}));await page.goto('http://127.0.0.1:4173');await page.locator('#menuScreen').waitFor({state:'visible'});
 const f=fixture();await page.evaluate(state=>EvervaleSave.load(state),f.state);await page.click('#menuButton');await page.click('#storyMenu');await page.locator('#dicePanel summary').click();
 await page.fill('#diceValues','12');await page.fill('#diceBonus','4');await page.click('#diceManual');assert.match(await page.locator('#diceResult').innerText(),/= 16/);
 await page.fill('#diceValues','21');await page.click('#diceManual');assert.match(await page.locator('#diceResult').innerText(),/1 ถึง 20/);
 await page.click('#diceThrow');await page.waitForFunction(()=>!document.getElementById('diceThrow').disabled);assert.match(await page.locator('#diceResult').innerText(),/ทอยในเกม/);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.body.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);console.log('PASS dice UI: manual result, invalid bounds, animated roll and mobile');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
