const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const sdk=fs.readFileSync('browser.test.cjs','utf8').match(/body:`([^`]+)`/)[1];
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await context.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:sdk}));
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  assert(await page.locator('#rotateScreen').isVisible());
  assert(await page.locator('#loginScreen').evaluate(e=>e.inert));
  await page.setViewportSize({width:844,height:390});
  await page.locator('#rotateScreen').waitFor({state:'hidden'});
  await page.fill('#authId','rotationtest');await page.fill('#authPassword','qa-password');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#rotateScreen').waitFor({state:'visible'});
  await page.setViewportSize({width:844,height:390});
  await page.locator('#rotateScreen').waitFor({state:'hidden'});
  assert.equal(await page.locator('#authId').inputValue(),'rotationtest');
  await page.click('#authSubmit');await page.locator('#menuScreen').waitFor({state:'visible'});
  await page.setViewportSize({width:390,height:844});
  await page.locator('#rotateScreen').waitFor({state:'visible'});
  assert(await page.locator('#signedIn').evaluate(e=>e.inert));
  await page.setViewportSize({width:844,height:390});
  await page.locator('#rotateScreen').waitFor({state:'hidden'});
  await page.click('#battleEditorMenu');await page.locator('#battleEditorScreen').waitFor({state:'visible'});
  const desktop=await browser.newPage({viewport:{width:500,height:900}});
  await desktop.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:sdk}));
  await desktop.goto('http://127.0.0.1:4173/');assert(await desktop.locator('#rotateScreen').isHidden());
  assert.deepEqual(errors,[]);console.log('PASS touch portrait gate, landscape login/editor, rotate-back input retention, desktop portrait unaffected (mock auth)');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
