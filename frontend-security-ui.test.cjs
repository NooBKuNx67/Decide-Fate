// Real DOM regression tests. Auth, cloud transport and storage are private mocks.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const sdk=fs.readFileSync('creation-ui.test.cjs','utf8').match(/body:`([^`]+)`/)[1];
 await page.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:sdk}));
 await page.route('https://example.invalid/**',r=>r.abort());
 await page.goto('http://127.0.0.1:4173');await page.locator('#menuScreen').waitFor({state:'visible'});
 const payload='<img src=x onerror=__xss=1>';
 async function safe(label){await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.__xss),0,label);assert.equal(await page.locator('[onerror]').count(),0,label+' creates no event attribute');}
 await page.evaluate(payload=>{window.__xss=0;const state=EvervaleRules.fresh();EvervaleRules.createCharacter(state,payload,'human','warrior',EvervaleContent);state.character.stats[payload]=1;state.character.stats.note=payload;EvervaleSave.load(state);},payload);
 await safe('imported character stats and name');assert((await page.locator('#characterPanel').innerText()).includes(payload));
 await page.evaluate(payload=>{const A=DecideContentAuthoring,rows=EvervaleRules.records(EvervaleContent),template=A.templates(rows).find(r=>r.kind==='weapon'&&DecideCatalogEquipment.weapon(r).type==='sword'&&DecideCatalogEquipment.weapon(r).hands===1),record=A.create(template,payload,'custom-xss-blade');EvervaleEditor.commit({[A.KEY]:{v:1,records:[record]},[template.key]:{displayName:payload,icon:'https://example.invalid/a" onerror="__xss=1'}});let state=EvervaleRules.fresh();EvervaleRules.createCharacter(state,payload,'human','knight',EvervaleContent,DecideCreation.recommend({...DecideCreation.draft(),job:'knight',weapon:'sword'}));state.catalogInventory={v:1,items:[],gearStash:[{refType:'weapon',name:payload}]};state=DecideCatalogEquipment.equip(state,EvervaleRules.records(EvervaleContent),'rightHand','weapon',record.id);EvervaleSave.load(state);window.__xssTemplate=template.key;},payload);
 await safe('authored weapon name');assert((await page.locator('#characterPanel').innerText()).includes('อาวุธ: '+payload));
 await page.click('#menuButton');await page.click('#databaseMenu');await page.fill('#dbSearch',payload);await safe('database override labels');assert((await page.locator('#dbList').innerText()).includes(payload));
 await page.evaluate(()=>EvervaleEditor.open(window.__xssTemplate));await page.locator('#dbDialog').waitFor({state:'visible'});await safe('image URL attribute boundary');
 assert.equal(await page.locator('#field-icon img').getAttribute('src'),'https://example.invalid/a" onerror="__xss=1');
 assert.deepEqual(errors,[]);console.log('PASS imported stats/name, authored weapon, override display text and image URL remain inert in real DOM (mock auth/storage)');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
