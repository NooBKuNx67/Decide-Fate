const assert=require('node:assert/strict'),C=require('./dist/combat-data.js'),D=require('./dist/battle-data.js'),R=require('./dist/rules.js');
function state(job='warrior'){const s=R.fresh();R.createCharacter(s,'นักทดสอบ','human',job,{skill:[],proficiency:[]});return s;}
function scene(){const s=D.blank('fight','meadow',6,6);s.cells[0].spawn='player';s.cells[1].spawn='enemy';return s;}
function fight(job){return C.create(scene(),state(job),[{id:'goblin',name:'Goblin',hp:30,str:8}],'test');}
let e=fight();const before=JSON.stringify(e);assert.throws(()=>C.move(e,2));assert.equal(JSON.stringify(e),before);assert.throws(()=>C.attack(e,'missing'));assert.equal(JSON.stringify(e),before);
C.attack(e,'enemy-0');assert(e.units[1].hp<30);assert.throws(()=>C.attack(e,'enemy-0'));const hp=e.units[0].hp;C.endTurn(e);assert(e.units[0].hp<hp);assert.equal(e.units[0].action,1);assert.equal(e.round,2);
e=fight();C.guard(e);C.endTurn(e);const guarded=e.units[0].hp;const unguarded=fight();C.endTurn(unguarded);assert(guarded>unguarded.units[0].hp);
for(const job of Object.keys(C.jobs)){e=fight(job);e.units[0].hp=50;C.attack(e,'enemy-0',true);assert.equal(e.units[0].mana,state(job).mp-8);assert.equal(e.units[0].action,0);assert(['priest','alchemist'].includes(job)?e.units[0].hp>50:e.units[1].hp<30);}
e=fight();e.units[0].mana=0;assert.throws(()=>C.attack(e,'enemy-0',true));assert.equal(e.units[0].action,1);
e=fight();e.units[0].hp=20;C.potion(e);assert.equal(e.potions,1);assert.equal(e.units[0].hp,55);assert.throws(()=>C.potion(e));
const far=scene();far.cells[1].spawn='';far.cells[5].spawn='enemy';e=C.create(far,state(),[], 'ai');const old=e.units[1].n;C.endTurn(e);assert.notEqual(e.units[1].n,old);assert.notEqual(e.units[1].n,e.units[0].n);
e=fight();e.units[1].hp=1;C.attack(e,'enemy-0');assert.equal(e.status,'won');assert.throws(()=>C.endTurn(e));const s=state();s.contentLibrary={keep:'yes'};s.expedition=e;const result=C.settle(s);assert.equal(result.snapshot.gold,s.gold+15);assert.equal(result.snapshot.character.xp,20);assert.deepEqual(result.snapshot.contentLibrary,s.contentLibrary);assert.throws(()=>C.settle(result.snapshot));assert.equal(s.expedition.status,'won');
e=fight();e.units[0].hp=1;C.endTurn(e);assert.equal(e.status,'lost');const lost=state();lost.expedition=e;const loss=C.settle(lost);assert.equal(loss.snapshot.hp,15);assert.equal(loss.reward.gold,0);assert.equal(loss.snapshot.dead,false);
e=fight();C.retreat(e);assert.equal(e.status,'retreated');assert.deepEqual(C.reward(e),{gold:0,xp:0});
e=fight();e.scene.cells[6].object='chest';C.interact(e,6);assert.equal(e.loot,20);C.endTurn(e);assert.throws(()=>C.interact(e,6));assert.deepEqual(C.validate(JSON.parse(JSON.stringify(e))),e);
const saved=state();saved.expedition=fight();assert.deepEqual(R.validate(saved,{}).expedition,saved.expedition);assert.equal(R.act(saved,'work',{}),false);
for(const edit of [x=>x.units[0].hp=-1,x=>x.units[1].n=x.units[0].n,x=>x.status='won',x=>x.scene.cells[0].object='bad',x=>x.potions=-1]){e=fight();edit(e);assert.throws(()=>C.validate(e));}
e=fight('ranger');e.units[1].n=6;e.scene.cells[1].object='wall';assert(!C.canHit(e,e.units[0],e.units[1]));
console.log('PASS combat rules: attacks/action budget, blocked movement/LOS, eight class skills, mana, guard, potions, enemy pursuit, win/loss/retreat, one-time loot/reward and saved encounter validation');
