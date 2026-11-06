const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),R=require('./dist/rules'),N=require('./dist/creation-data'),C=require('./dist/tactical-systems'),D=require('./dist/battle-data'),X=require('./dist/character-combat'),M=require('./dist/monster-ai');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/content.js','utf8'),ctx);const db=JSON.parse(JSON.stringify(ctx.window.EvervaleContent)),rows=R.records(db),copy=x=>JSON.parse(JSON.stringify(x));
const s=R.fresh();R.createCharacter(s,'Monster QA','human','knight',db,N.recommend({...N.draft(),job:'knight',weapon:'sword'}));
function fixture(monsterId='preset-monster-cultist-acolyte',extra=[]){const scene=D.generate('monster-ai','meadow',12,10,'monsters');for(const cell of scene.cells)Object.assign(cell,D.tile());scene.cells[50].spawn='player';scene.cells[54].spawn='enemy';scene.cells[54].monster=monsterId;const e=C.create(scene,s,rows.filter(r=>r.kind==='monster'),'monster-ai',()=>0,{tactical:true,partyJobs:extra});M.prepare(e,rows);e.seed=1;e.detectSeed=8;const p=e.units[0],u=e.units.find(x=>x.side==='enemy');p.hp=p.maxHp=1000;p.armor=0;p.n=D.node(50);u.hp=u.maxHp=1000;u.n=D.node(54);u.detected=['hero'];u.aware=['hero'];u.lastSeen=p.n;return {e,p,u};}
let f=fixture();assert.equal(f.u.mana,10);assert.equal(f.u.maxMana,10);assert.equal(f.u.monsterCombat.actions.length,1);assert.equal(f.u.monsterCombat.actions[0].name,'Dark Bolt');assert(f.u.monsterCombat.unsupported.includes('Arcane Ward'));assert.equal(rows.filter(r=>M.compile(r)).length,9);
for(const r of rows.filter(r=>r.kind==='monster')){const z=fixture(r.id);assert(z.u.monsterCombat.actions.length>0,r.name+' owns at least one supported action');assert.deepEqual(z.u.monsterCombat.actions.map(a=>a.id),r.skills.map(n=>rows.find(s=>s.kind==='skill'&&(s.id===n||s.name===n))).filter(Boolean).map(M.compile).filter(Boolean).map(a=>a.id));}
// A real ranged cultist attacks from its supported range and consumes only one action.
let hp=f.p.hp;M.turn(f.e,f.u);assert(f.p.hp<hp);assert(C.distance(f.e.scene,f.u.n,f.p.n)>=2);assert.equal(f.u.action,0);assert.equal(f.e.log.filter(x=>x.includes('ใช้ Dark Bolt')).length,1);assert.equal(f.u.mana,10,'Blank source cost is zero');
// Kiting is bounded by the normal movement pool and never overlaps units.
f=fixture();f.u.n=D.node(51);const start=f.u.n;M.turn(f.e,f.u);assert(C.distance(f.e.scene,f.u.n,f.p.n)>1);assert(C.distance(f.e.scene,start,f.u.n)<=4);assert.notEqual(f.u.n,f.p.n);
// Physical-only monsters close the gap and select their own linked skill.
f=fixture('preset-monster-orc');f.u.n=D.node(53);hp=f.p.hp;M.turn(f.e,f.u);assert.equal(C.distance(f.e.scene,f.u.n,f.p.n),1);assert(f.p.hp<hp);assert(f.e.log.some(x=>x.includes('ใช้ Heavy Slam')));
f=fixture('preset-monster-giant-spider');f.u.n=D.node(51);M.act(f.e,f.u,'preset-skill-monster-poison-fang','hero');assert.equal(f.p.effects.poison,undefined,'Do not invent a poison effect from descriptive prose');
// Custom numeric edits are compiled and frozen; real MP/cooldowns govern subsequent choices.
f=fixture();const edited=rows.map(r=>r.id==='preset-skill-monster-dark-bolt'?{...r,resourceCost:'4 MP',cooldown:2}:r);delete f.u.monsterCombat;M.prepare(f.e,edited);const snap=copy(f.u.monsterCombat);M.prepare(f.e,rows);assert.deepEqual(f.u.monsterCombat,snap);M.act(f.e,f.u,'preset-skill-monster-dark-bolt','hero');assert.equal(f.u.mana,6);assert.equal(f.u.cooldowns['preset-skill-monster-dark-bolt'],3+f.e.round);const before=copy(f.e);assert.throws(()=>M.act(f.e,f.u,'preset-skill-monster-dark-bolt','hero'));assert.deepEqual(f.e,before);
f.u=f.e.units.find(u=>u.side==='enemy');f.u.action=1;f.e.round=4;M.act(f.e,f.u,'preset-skill-monster-dark-bolt','hero');assert.equal(f.u.mana,2);f.u.action=1;f.e.round=7;assert.equal(M.choose(f.e,f.u),null,'Insufficient MP prevents the action');
// Silence blocks only magic; a caster can still approach and use a normal melee fallback.
f=fixture();f.u.effects.silence=1;M.turn(f.e,f.u);assert(!f.e.log.some(x=>x.includes('ใช้ Dark Bolt')));assert(f.e.log.some(x=>x.includes('ใช้โจมตีปกติ')));assert.equal(f.u.mana,10);
f=fixture();f.u.effects.stun=1;const loc=f.u.n;hp=f.p.hp;M.turn(f.e,f.u);assert.equal(f.u.n,loc);assert.equal(f.p.hp,hp);assert.equal(f.u.action,0);assert.match(f.e.log[0],/สตัน/);
// Geometric visibility alone does not reveal an undetected player.
f=fixture();f.u.detected=[];delete f.u.lastSeen;const old=copy(f.e);M.turn(f.e,f.u);assert.equal(f.p.hp,old.units[0].hp);assert.equal(f.u.n,old.units.find(u=>u.side==='enemy').n);assert.equal(f.e.seed,old.seed);
f=fixture();f.u.n=D.node(52);f.e.scene.cells[51].object='wall';assert.equal(M.choose(f.e,f.u),null,'Wall blocks casting');
// Taunt wins among legal visible targets, independent of distance ties.
f=fixture('preset-monster-cultist-acolyte',['priest']);const ally=f.e.units.find(u=>u.id==='ally-0');ally.n=D.node(42);ally.hp=ally.maxHp=1000;f.u.detected=['hero',ally.id];f.u.taunt=ally.id;assert.equal(M.choose(f.e,f.u).t.id,ally.id);
// Older identified encounters gain skills without refilling previously spent resources.
f=fixture();delete f.u.monsterCombat;f.u.mana=2;M.prepare(f.e,rows);assert.equal(f.u.mana,2);const legacy=copy(f.e);delete legacy.units.find(u=>u.side==='enemy').monsterCombat;delete legacy.units.find(u=>u.side==='enemy').monsterId;M.prepare(legacy,rows);assert.equal(legacy.units.find(u=>u.side==='enemy').monsterCombat,undefined,'Do not guess monster identity by name');
assert.deepEqual(R.validate({...s,expedition:f.e},db).expedition.units.find(u=>u.side==='enemy').monsterCombat,f.u.monsterCombat);const bad=copy(f.e);bad.units.find(u=>u.side==='enemy').monsterCombat.actions[0].range=99;assert.throws(()=>C.validate(bad),/สกิลมอนสเตอร์/);
// Actual end-turn integration keeps 2 AP, resolves exactly one enemy action, and survives validation.
f=fixture();C.endTurn(f.e);assert.equal(f.e.round,2);assert.equal(f.p.action,2);assert.equal(f.e.log.filter(x=>x.includes('ใช้ Dark Bolt')).length,1);C.validate(f.e);
console.log('PASS 9 monster actions across 35 catalog monsters, identity/ownership, range/kiting/melee, source MP/CD, silence/stun, detection/LOS/taunt, snapshots/old saves and real end-turn integration');
// A trap ends the planned movement; slow and quagmire reduce actual travel.
f=fixture('preset-monster-orc');f.u.n=D.node(54);f.e.traps=[{owner:'hero',index:53}];M.turn(f.e,f.u);assert.equal(f.u.n,D.node(53));assert.equal(f.e.traps.length,0);assert(f.e.log.some(x=>x.includes('ติดกับดัก')));
f=fixture('preset-monster-orc');f.u.n=D.node(54);f.u.effects.slow=1;M.turn(f.e,f.u);assert(C.distance(f.e.scene,D.node(54),f.u.n)<=2);
f=fixture('preset-monster-orc');f.u.n=D.node(54);f.e.fields=[{type:'quagmire',cells:[51,52,53,54],until:3}];M.turn(f.e,f.u);assert(C.distance(f.e.scene,D.node(54),f.u.n)<=3);
// Branches replay identically from the same saved state and do not refill MP.
f=fixture();const replay=copy(f.e);C.endTurn(f.e);C.endTurn(replay);assert.deepEqual(replay,f.e);M.prepare(replay,rows);assert.deepEqual(replay,f.e);
// No cast can cross a blocked line of sight or target an undetected/dead unit.
f=fixture();f.u.detected=[];const beforeAct=copy(f.e);assert.throws(()=>M.act(f.e,f.u,'preset-skill-monster-dark-bolt','hero'));assert.deepEqual(f.e,beforeAct);
const active=rows.find(r=>r.id==='preset-skill-monster-dark-bolt');assert.equal(M.compile({...active,resourceCost:'2 HP'}),null);assert.deepEqual(M.compile({...active,statusEffects:['Poison']}).statusConfig.kinds,['poison']);assert.equal(M.compile({...active,enabled:false}),null);assert.equal(M.compile({...active,damage:'99d100'}),null);assert.equal(M.compile({...active,saveDC:13}).statusConfig.dc,13);
f=fixture();const malformed=copy(f.e);malformed.units.find(u=>u.side==='enemy').monsterCombat.stats.INT=Infinity;assert.throws(()=>C.validate(malformed),/AI/);const unowned=copy(f.e);unowned.units[0].monsterCombat=copy(f.u.monsterCombat);assert.throws(()=>C.validate(unowned),/เฉพาะมอนสเตอร์/);
console.log('PASS traps, slow/quagmire movement budget, deterministic saved replay, invalid action rollback and malformed/unsupported metadata');
