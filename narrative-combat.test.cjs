const assert=require('node:assert/strict');
const {fixture}=require('./tools/closeout/custom-fixture.cjs');
const NC=require('./dist/narrative-combat'),A=require('./dist/adventure-data'),R=require('./dist/rules'),C=require('./dist/tactical-systems'),X=require('./dist/character-combat'),K=require('./dist/combat-context');
const copy=x=>JSON.parse(JSON.stringify(x)),f=fixture();let s=copy(f.state);s.hp=120;s.energy=100;
s=A.change(s,'accept',f.rows);s=A.change(s,'recruit',f.rows);s=A.change(s,'travel:forest',f.rows);
const legacy=A.battle(s,'forest',f.rows),legacyBefore=copy(legacy);assert(!NC.is(legacy.expedition));assert.deepEqual(NC.commands(legacy,f.rows),[]);
s=NC.adopt(legacy,f.rows);assert.deepEqual(legacy,legacyBefore);R.validate(s,f.db);
const a=NC.commands(s,f.rows).find(x=>x.id.startsWith('battle:attack:main:'));
const near=NC.apply(s,f.rows,a.id),far=copy(s);far.expedition.units[0].n=0;far.expedition.units[1].n=far.expedition.scene.cells.length*2-2;
// Clear any tree at the structural save location; no gameplay geometry is used.
for(const u of far.expedition.units){far.expedition.scene.cells[Math.floor(u.n/2)].terrain='path';far.expedition.scene.cells[Math.floor(u.n/2)].object='none';}
const distant=NC.apply(far,f.rows,a.id);
assert.deepEqual(distant.snapshot.expedition.units.map(u=>[u.hp,u.action]),near.snapshot.expedition.units.map(u=>[u.hp,u.action]));assert.equal(distant.snapshot.expedition.seed,near.snapshot.expedition.seed);
assert.equal(near.snapshot.expedition.round,s.expedition.round+1,'Confirmed attack includes one enemy response');assert(near.receipt.events.some(e=>e.type==='hitChance'));assert(!JSON.stringify(near.snapshot).includes('seedBefore'));
const base=copy(legacy.expedition),traced=copy(base);X.damage(base,base.units[0],base.units[1]);K.capture(traced,()=>X.damage(traced,traced.units[0],traced.units[1]));assert.deepEqual(traced,base,'Trace cannot alter legacy state or RNG');
assert.throws(()=>K.withoutPositions(base,()=>{throw Error('stop');}));assert.equal(K.active(base),false);
const injected=copy(s);injected.expedition.units[0].skills.push('fire','backstab','step');assert(!NC.commands(injected,f.rows).some(a=>/cast:(fire|backstab|step):/.test(a.id)));
assert.throws(()=>NC.apply(s,f.rows,'battle:cast:fire:enemy-0'));
const intact=copy(s);NC.commands(s,f.rows);assert.deepEqual(s,intact,'Listing choices never executes an action on the save');
function finish(state){
 for(let turn=0;turn<160&&state.expedition?.status==='active';turn++){
  const choices=NC.commands(state,f.rows),attack=choices.find(a=>a.id.startsWith('battle:attack:main:'));
  const available=state.expedition.units.find(u=>u.side==='player'&&u.hp>0&&u.action>0&&!u.effects.stun&&!u.effects.frozen);
  const action=attack||choices.find(a=>a.id==='battle:select:'+available?.id)||choices.find(a=>a.id==='battle:end');
  assert(action);state=NC.apply(state,f.rows,action.id).snapshot;state=R.validate(JSON.parse(JSON.stringify(state)),f.db);
 }
 assert.equal(state.expedition.status,'won');return NC.apply(state,f.rows,'battle:settle').snapshot;
}
s=finish(s);assert(s.adventure.forest);assert.equal(s.expedition,null);assert.throws(()=>NC.apply(s,f.rows,'battle:settle'));
s=A.change(s,'learn',f.rows);s=A.change(s,'travel:village',f.rows);s=A.change(s,'rest',f.rows);s=A.change(s,'travel:cave',f.rows);s=A.change(s,'seal',f.rows);s=NC.adopt(A.battle(s,'cave',f.rows),f.rows);s=finish(s);assert(s.adventure.cave);s=A.change(s,'travel:village',f.rows);s=A.change(s,'restore',f.rows);const gold=s.gold;assert.throws(()=>A.change(s,'restore',f.rows));assert.equal(R.validate(copy(s),f.db).gold,gold);
console.log('PASS narrative: real chapter forest/cave/end, engine shared damage/trace parity, no-position targeting invariance, no AP budget, automatic enemy response, hidden spatial skills, atomic rejection, save roundtrips and once-only settlement');
// Narrative actions do not require remaining tactical AP; probing stays immutable.
const exhausted=copy(NC.adopt(legacy,f.rows));
for(const u of exhausted.expedition.units)u.action=0;
const exhaustedBefore=copy(exhausted);
const available=NC.commands(exhausted,f.rows);
assert(available.some(c=>c.id.startsWith('battle:attack:main:')));
assert.deepEqual(exhausted,exhaustedBefore);
NC.apply(exhausted,f.rows,available.find(c=>c.id.startsWith('battle:attack:main:')).id);
assert.deepEqual(exhausted,exhaustedBefore);
const selection=NC.commands(exhausted,f.rows).find(c=>c.id.startsWith('battle:select:'));
if(selection){const chosen=NC.apply(exhausted,f.rows,selection.id).snapshot;assert.equal(chosen.expedition.round,exhausted.expedition.round);assert.deepEqual(chosen.expedition.units.map(u=>u.hp),exhausted.expedition.units.map(u=>u.hp));}
assert.equal(NC.apply(exhausted,f.rows,available.find(c=>c.id.startsWith('battle:attack:main:')).id).snapshot.expedition.round,exhausted.expedition.round+1);
