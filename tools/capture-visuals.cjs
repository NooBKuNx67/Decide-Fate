const {chromium}=require('playwright');
const fs=require('fs'),assert=require('node:assert/strict');
(async()=>{
fs.mkdirSync('artifacts/qa',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const src=fs.readFileSync(require('path').join(__dirname,'../browser.test.cjs'),'utf8');
const sdk=src.match(/body:`([^`]+)`/)[1];
await page.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:sdk}));
await page.exposeFunction('__qaBackend',()=>({data:null}));
await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
await page.evaluate(()=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src='assets/login-background.png';}));
await page.waitForFunction(()=>!document.getElementById('authSubmit').disabled);
await page.screenshot({path:'artifacts/qa/login-desktop.png'});
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'artifacts/qa/login-mobile.png'});
assert(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth));
async function login(){await page.fill('#authId','qatest');await page.fill('#authPassword','qa-password');await page.click('#authSubmit');}
await login();
await page.setViewportSize({width:1440,height:1000});
await page.locator('#menuScreen').waitFor({state:'visible'});
await page.click('#battleEditorMenu');
await page.waitForFunction(()=>document.getElementById('battleCanvas').dataset.art==='ready');
await page.locator('#battleCanvas').scrollIntoViewIfNeeded();
await page.screenshot({path:'artifacts/qa/editor-desktop.png'});
for(const biome of ['meadow','forest','cave']){
 await page.selectOption('#battleScene',biome+'-demo');
 await page.locator('#battleCanvas').screenshot({path:'artifacts/qa/'+biome+'.png'});
}
await page.setViewportSize({width:390,height:844});
await page.locator('#battleCanvas').scrollIntoViewIfNeeded();
await page.screenshot({path:'artifacts/qa/editor-mobile.png'});
assert(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth));
await page.route('**/terrain-atlas.png',r=>r.abort());
await page.reload({waitUntil:'domcontentloaded'});await login();await page.click('#battleEditorMenu');
await page.waitForFunction(()=>document.getElementById('battleCanvas').dataset.art==='fallback');
await page.locator('#battleCanvas').screenshot({path:'artifacts/qa/atlas-fallback.png'});
assert.deepEqual(errors,[]);console.log('PASS first-screen login, editor boot, three biomes, mobile overflow, no runtime errors (mock Supabase)');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
