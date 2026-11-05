const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),R=require('./dist/rules'),N=require('./dist/creation-data'),C=require('./dist/tactical-systems'),D=require('./dist/battle-data'),X=require('./dist/character-combat'),M=require('./dist/monster-ai');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/content.js','utf8'),ctx);const db=JSON.parse(JSON.stringify(ctx.window.EvervaleContent)),rows=R.records(db),copy=x=>JSON.parse(JSON.stringify(x));
const s=R.fresh();R.createCharacter(s,'Monster QA','human','knight',db,N.recommend({...N.draft(),job:'knight',weapon:'sword'}));
function fixture(monsterId='preset-monster-cultist-acolyte',extra=[]){const scene=D.generate('monster-ai','meadow',12,10,'monsters');for(const cell of scene.cells)Object.assign(cell,D.tile());scene.cells[50].spawn='player';scene.cells[54].spawn='enemy';scene.cells[54].monster=monsterId;const e=C.create(scene,s,rows.filter(r=>r.kind==='monster'),'monster-ai',()=>0,{tactical:true,partyJobs:extra});M.prepare(e,rows);e.seed=1;e.detectSeed=8;const p=e.units[0],u=e.units.find(x=>x.side==='enemy');p.hp=p.maxHp=1000;p.armor=0;p.n=D.node(50);u.hp=u.maxHp=1000;u.n=D.node(54);u.detected=['hero'];u.aware=['hero'];u.lastSeen=p.n;return {e,p,u};}

function rejects(f){const before=copy(f.e),id=f.u.monsterCombat.actions[0].id;assert.throws(()=>M.act(f.e,f.u,id,f.p.id),/ใช้สกิล/);assert.deepEqual(f.e,before,'Blocked grid attack consumes no MP/AP/cooldown or RNG');}
let f=fixture();f.e.scene.cells[52].object='wall';rejects(f);
f=fixture();f.e.scene.cells[52].object='tree';rejects(f);
f=fixture();f.e.fields=[{type:'smoke',cells:[52],until:3}];rejects(f);
f=fixture();f.p.n=D.node(49);assert.equal(C.distance(f.e.scene,f.u.n,f.p.n),5);rejects(f);
f=fixture();f.e.scene.cells[50].height=3;rejects(f);
f=fixture('preset-monster-orc');f.u.n=D.node(51);f.e.scene.cells[50].height=2;rejects(f);
f=fixture('preset-monster-orc');f.u.n=D.node(51);f.e.scene.cells[50].height=1;assert(M.act(f.e,f.u,f.u.monsterCombat.actions[0].id,f.p.id)>0,'Melee permits one grid level');
f=fixture();f.e.scene.cells[50].height=2;assert(M.act(f.e,f.u,f.u.monsterCombat.actions[0].id,f.p.id)>0,'Magic permits two grid levels');
f=fixture();f.u.detected=[];rejects(f);
f=fixture();const before=copy(f.e);assert.throws(()=>M.act(f.e,f.u,f.u.monsterCombat.actions[0].id,f.u.id));assert.deepEqual(f.e,before,'No friendly fire/self targeting');
// Player command profiles cannot expand or shrink a monster skill's own targeting.
f=fixture();f.e.currentTargeting={min:0,max:0,mode:'single',count:1,side:'ally',heights:[0]};const old=copy(f.e.currentTargeting);assert(M.act(f.e,f.u,f.u.monsterCombat.actions[0].id,f.p.id)>0);assert.deepEqual(f.e.currentTargeting,old);f=fixture();M.act(f.e,f.u,f.u.monsterCombat.actions[0].id,f.p.id);assert.equal(f.e.currentTargeting,undefined);
// The shared low-level damage guard also rejects out-of-grid attacks and LOS blockers.
for(const setup of [f=>{f.e.scene.cells[52].object='wall';},f=>{f.p.n=D.node(49);},f=>{f.e.scene.cells[50].height=3;}]){f=fixture();setup(f);f.e.currentTargeting=M.targeting(f.u.monsterCombat.actions[0]);const hp=f.p.hp,seed=f.e.seed;assert.equal(X.damage(f.e,f.u,f.p,1,{sure:true,base:100}),0);assert.equal(f.p.hp,hp);assert.equal(f.e.seed,seed);}
assert.deepEqual(M.targeting({range:1,magic:false}).heights,[-1,0,1]);assert.deepEqual(M.targeting({range:4,magic:true}).heights,[-2,-1,0,1,2]);
console.log('PASS monster attacks use shared grid range/LOS/heights/side guards, detection/smoke, physical/magic height limits, atomic rejection and scoped monster targeting');
