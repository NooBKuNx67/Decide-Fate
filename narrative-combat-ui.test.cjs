const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {fixture}=require('./tools/closeout/custom-fixture.cjs'),A=require('./dist/adventure-data');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const sdk=fs.readFileSync('creation-ui.test.cjs','utf8').match(/body:`([^`]+)`/)[1];await page.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:sdk}));await page.goto('http://127.0.0.1:4173');await page.locator('#menuScreen').waitFor({state:'visible'});
 const f=fixture();f.state.hp=120;await page.evaluate(state=>EvervaleSave.load(state),f.state);await page.click('#menuButton');await page.click('#storyMenu');
 async function act(id){await page.locator('[data-story-action="'+id+'"]').click();await page.click('#storyApply');assert.equal(await page.locator('#combatScreen').isVisible(),false);}
 for(const id of ['chapter:accept','chapter:recruit','chapter:travel:forest','chapter:battle:forest'])await act(id);
 assert(await page.evaluate(()=>DecideNarrativeCombat.is(EvervaleSave.snapshot().expedition)));
 const before=await page.evaluate(()=>EvervaleSave.snapshot());await page.reload();await page.locator('#menuScreen').waitFor({state:'visible'});await page.click('#storyMenu');assert.deepEqual(await page.evaluate(()=>EvervaleSave.snapshot().expedition),before.expedition);
 async function finish(){for(let i=0;i<100;i++){
   const e=await page.evaluate(()=>EvervaleSave.snapshot().expedition);if(e.status!=='active'){assert.equal(e.status,'won');break;}
   const ids=await page.locator('[data-story-action]').evaluateAll(nodes=>nodes.map(n=>n.dataset.storyAction));
   const actor=e.units.find(u=>u.side==='player'&&u.hp>0&&u.action>0&&!u.effects.stun&&!u.effects.frozen);
   const id=ids.find(id=>id.startsWith('battle:attack:main:'))||ids.find(id=>id==='battle:select:'+actor?.id)||'battle:end';await act(id);
 }
 assert(await page.locator('#storyReceipt').isVisible());await act('battle:settle');assert.equal(await page.evaluate(()=>EvervaleSave.snapshot().expedition),null);}
 await finish();for(const id of ['chapter:learn','chapter:travel:village','chapter:rest','chapter:travel:cave','chapter:seal','chapter:battle:cave'])await act(id);await finish();await act('chapter:travel:village');await act('chapter:restore');
 const ended=await page.evaluate(()=>EvervaleSave.snapshot());assert(ended.adventure.claimed);assert.equal(await page.locator('[data-story-action="chapter:restore"]').count(),0);
 await page.reload();await page.locator('#menuScreen').waitFor({state:'visible'});await page.click('#storyMenu');assert.equal(await page.evaluate(()=>EvervaleSave.snapshot().gold),ended.gold);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.body.scrollWidth<=innerWidth));
 fs.mkdirSync('artifacts/qa',{recursive:true});await page.screenshot({path:'artifacts/qa/story-mobile.png',fullPage:true});
 let old=A.change(f.state,'accept',f.rows);old=A.change(old,'travel:forest',f.rows);old=A.battle(old,'forest',f.rows);await page.evaluate(state=>EvervaleSave.load(state),old);await page.click('#menuButton');await page.click('#storyMenu');await page.click('#storyResume');await page.locator('#combatScreen').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>DecideNarrativeCombat.is(EvervaleSave.snapshot().expedition)),false);
 const realBefore=await page.evaluate(()=>EvervaleSave.snapshot());
 await page.evaluate(()=>document.getElementById('storyCombatLab').click());
 const labAttack=await page.locator('[data-story-action]').evaluateAll(nodes=>nodes.map(n=>n.dataset.storyAction).find(id=>id.startsWith('battle:attack:main:')));
 assert(labAttack);await act(labAttack);assert(await page.locator('#storyReceipt').isVisible());
 assert.deepEqual(await page.evaluate(()=>EvervaleSave.snapshot()),realBefore,'Narrative battle lab must not change player save');
 assert.deepEqual(errors,[]);console.log('PASS narrative UI: real forest/cave/story ending without grid, confirm-only actions, 2 AP/party/enemy loop, mid-battle reload, receipts, mobile, no duplicate reward and legacy frozen grid resume');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
