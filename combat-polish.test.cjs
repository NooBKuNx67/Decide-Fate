/* Mocked browser regression: guidance must follow actual combat state, without spending resources. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  fs.mkdirSync('artifacts/qa',{recursive:true});
  const browser=await chromium.launch({headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:`
      export function createClient(){
        const user={id:'polish-qa',email:'qa@players.evervale.invalid',user_metadata:{player_id:'qa'}};
        return {auth:{onAuthStateChange(){},async getSession(){return {data:{session:{user}}}},async signOut(){return {}}},
          from(){return {select(){return this},eq(){return this},insert(){return this},update(){return this},async maybeSingle(){return {data:null}}}}};
      }`}));
    // No real backend requests are allowed even if a transport is introduced later.
    await page.route('https://*.supabase.co/**',r=>r.abort());
    await page.goto('http://127.0.0.1:4173');
    await page.locator('#menuScreen').waitFor({state:'visible'});
    await page.evaluate(()=>{
      const N=DecideCreation,D=EverTaleBattleData;
      const draft=N.recommend({...N.draft(),job:'mage',weapon:'staff',unique:'magia'});
      const state=EvervaleRules.fresh();
      EvervaleRules.createCharacter(state,'อาเรีย','human','mage',EvervaleContent,draft);
      const scene=D.generate('polish','meadow',12,10,'polish');
      for(const tile of scene.cells)Object.assign(tile,D.tile());
      scene.cells[50].spawn='player';scene.cells[54].spawn='enemy';
      state.expedition=DecideCombatRules.create(scene,state,[{hp:70}],'polish',()=>0,{tactical:true});
      state.expedition.units[0].detected=['enemy-0'];
      EvervaleSave.load(state);EverTaleCombat.launch();
    });
    const snapshot=()=>page.evaluate(()=>EvervaleSave.snapshot());
    const before=await snapshot();
    assert.match(await page.locator('#combatSkillGuide').innerText(),/3 MP/);
    assert.match(await page.locator('#combatSkillChoice option:checked').innerText(),/3 MP/);
    await page.selectOption('#combatSkillChoice','fire');
    assert.match(await page.locator('#combatSkillGuide').innerText(),/8 MP.*ทั้งสองฝ่าย.*ร่าย 3 AP/);
    assert.deepEqual(await snapshot(),before,'Changing skill must not mutate a save');
    assert.equal(await page.locator('#combatTargetOptions').getAttribute('open'),null);
    await page.locator('#combatTargetOptions summary').click();
    assert(await page.locator('#combatMultiTargets input').first().isVisible());
    await page.locator('#combatTargetOptions summary').click();
    await page.click('#combatTargetRules');
    await page.selectOption('#targetRuleKey','skill:fire');
    await page.fill('#ruleMax','5');await page.fill('#ruleCast','4');
    await page.click('#targetRuleForm button[type=submit]');
    assert.match(await page.locator('#combatSkillGuide').innerText(),/0–5 ช่อง.*ร่าย 4 AP/);
    await page.locator('#combatEnemies button').first().click();
    assert.equal(await page.locator('#combatEnemies button').first().getAttribute('aria-pressed'),'true');
    await page.click('#combatSkill');
    let state=await snapshot();
    assert.equal(state.expedition.units[0].casting.progress,1);
    assert.equal(state.expedition.units[0].mana,before.expedition.units[0].mana-8);
    assert.match(await page.locator('#combatSkillGuide').innerText(),/Fire Burst 1\/4.*ยกเลิกไม่คืน MP/);
    await page.click('#combatCast');
    state=await snapshot();
    assert.equal(state.expedition.units[0].casting.progress,2);
    assert.equal(state.expedition.units[0].action,0);
    assert.match(await page.locator('#combatSkillGuide').innerText(),/AP หมด/);
    assert(await page.locator('#combatEnd').isEnabled());
    await page.waitForTimeout(500); // Allow local character art to finish loading for the visual record.
    await page.locator('#combatScreen').screenshot({path:'artifacts/qa/polish-desktop.png'});
    for(const [width,height,name] of [[844,390,'landscape'],[390,844,'narrow']]){
      await page.setViewportSize({width,height});
      assert(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'No horizontal page overflow');
      for(const id of ['combatSkillChoice','combatSkill','combatEnd']){
        await page.locator('#'+id).scrollIntoViewIfNeeded();
        const box=await page.locator('#'+id).boundingBox();
        assert(box.x>=0&&box.x+box.width<=width&&box.height>=44,id+' must fit and remain touch-sized');
      }
      await page.locator('#combatScreen').screenshot({path:'artifacts/qa/polish-'+name+'.png'});
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.click('#combatCancelCast');
    assert.equal((await snapshot()).expedition.units[0].mana,state.expedition.units[0].mana,'Cancel does not refund MP');
    await page.reload();await page.locator('#menuScreen').waitFor({state:'visible'});
    await page.click('#loadMenu');await page.click('#localLoad');await page.click('#expeditionStart');
    assert.match(await page.locator('#combatTurn').innerText(),/AP 0\/2/);
    // A held spell must play its effect on completion through the Continue Cast button.
    await page.evaluate(()=>{
      const snap=EvervaleSave.snapshot(),e=snap.expedition,p=e.units[0],enemy=e.units.find(u=>u.side==='enemy');
      p.action=2;p.mana=p.maxMana=100;p.n=EverTaleBattleData.node(50);
      enemy.n=EverTaleBattleData.node(51);p.detected=[enemy.id];
      e.profiles['skill:fire'].castPoints=2;
      EvervaleSave.load(snap);EverTaleCombat.launch();
    });
    await page.locator('#combatEnemies button').first().click();
    await page.selectOption('#combatSkillChoice','fire');
    await page.click('#combatSkill');
    assert.equal((await snapshot()).expedition.units[0].casting.progress,1);
    assert.equal(await page.locator('#combatCanvas').getAttribute('data-effects'),'0');
    await page.click('#combatCast');
    assert.equal((await snapshot()).expedition.units[0].casting,undefined);
    assert(Number(await page.locator('#combatCanvas').getAttribute('data-effects'))>0,'Completed held spell must play an effect');
    await page.locator('#combatCanvas').screenshot({path:'artifacts/qa/polish-cast-effect.png'});
    assert.deepEqual(errors,[]);
    console.log('PASS combat polish: actual MP, friendly fire, profile overrides, held cast/AP, target disclosure, touch layouts and saved reload (mock cloud)');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
