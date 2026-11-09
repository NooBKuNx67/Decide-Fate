// Rendering-only comparison capture; fresh contexts and mocked auth/storage.
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const phase=process.argv[3]||'before';
(async()=>{const b=await chromium.launch({headless:true});try{
 fs.mkdirSync('artifacts/qa/asset-'+phase,{recursive:true});const sdk=fs.readFileSync('browser.test.cjs','utf8').match(/body:`([^`]+)`/)[1];
 for(const [name,viewport,mobile]of [['desktop',{width:1440,height:1000},false],['mobile',{width:844,height:390},true]]){
  const c=await b.newContext({viewport,hasTouch:mobile,isMobile:mobile}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await c.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:sdk}));await p.goto('http://127.0.0.1:4173');
  await p.waitForFunction(()=>!document.getElementById('authSubmit').disabled);await p.evaluate(()=>document.fonts.ready);
  await p.evaluate(async()=>{const url=getComputedStyle(document.getElementById('loginScreen')).backgroundImage.match(/url\(["']?(.+?)["']?\)/)?.[1];if(url){const img=new Image();img.src=url;await img.decode();}});
  await p.screenshot({path:'artifacts/qa/asset-'+phase+'/'+name+'-login.png',animations:'disabled'});
  await p.fill('#authId','assetmock');await p.fill('#authPassword','mock-only');await p.click('#authSubmit');await p.locator('#menuScreen').waitFor({state:'visible'});await p.click('#battleEditorMenu');
  await p.waitForFunction(()=>['art','props','biomeProps','extraProps'].every(k=>document.getElementById('battleCanvas').dataset[k]==='ready'));
  for(const biome of ['meadow','forest','cave']){await p.selectOption('#battleScene',biome+'-demo');await p.click('#battleFit');await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.locator('#battleCanvas').screenshot({path:'artifacts/qa/asset-'+phase+'/'+name+'-'+biome+'.png',animations:'disabled'});}
  assert(await p.locator('body').evaluate(e=>e.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);await c.close();
 }console.log('PASS asset '+phase+' screenshots: desktop and touch mobile landscape, login + three biomes, all atlases loaded and no overflow');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
