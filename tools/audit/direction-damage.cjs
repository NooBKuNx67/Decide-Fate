// Read-only synthetic demonstration; no files, accounts or network are accessed for mutation.
const assert = require('node:assert/strict');
const { fixture } = require('../closeout/custom-fixture.cjs');
const C = require('../../dist/combat-data');
const X = require('../../dist/character-combat');
const D = require('../../dist/battle-data');
const Gear = require('../../dist/catalog-equipment');
const copy = x => JSON.parse(JSON.stringify(x));
const { state, rows, one } = fixture();
state.hp = 100;
const scene = D.blank('audit', 'meadow', 12, 10);
scene.cells[50].spawn = 'player';
scene.cells[51].spawn = 'enemy';
function run(heavy, dice) {
  const s = copy(state);
  const armor = {kind:'armor',id:'custom-audit-heavy',name:'Audit heavy',defense:12,equipSlot:'armor',enabled:true};
  s.catalogEquipment = Gear.read(s);
  if (heavy) s.catalogEquipment.slots.armor = {kind:'armor',id:armor.id,name:armor.name,twoHanded:false};
  const e = C.create(scene,s,[], 'audit-damage',()=>0.5,{tactical:true});
  Gear.applyEncounter(e,s,[...rows,armor]);
  const p = e.units[0], enemy = e.units[1];
  e.seed = 123456;
  // Isolate armor with a guaranteed noncritical area hit from a fixed-base enemy.
  const hp = p.hp;
  const value = X.damage(e,enemy,p,1,{base:30,sure:true,area:true});
  const result = {case:heavy?'catalog-heavy':'no-catalog-armor',armor:p.armor,hpBefore:hp,hpAfter:p.hp,damage:value,seed:e.seed};
  if (dice) {
    p.catalogWeapon = {...Gear.weapon(one),damageDice:'3d6+2',dice:{n:3,sides:6,bonus:2}};
    enemy.hp=enemy.maxHp=1000;
    e.status='active';e.seed=123456;
    const before=copy(e);
    const amount=X.damage(e,p,enemy,1,{sure:true,area:true});
    const repeat=copy(before);
    assert.equal(X.damage(repeat,repeat.units[0],repeat.units[1],1,{sure:true,area:true}),amount);
    assert.deepEqual(repeat,e);
    return {case:'3d6+2',weapon:p.catalogWeapon,stat:p.stats[p.catalogWeapon.stat],level:p.level,bonuses:p.gearBonuses,targetArmor:enemy.armor,damage:amount,hpAfter:enemy.hp,seedBefore:123456,seedAfter:e.seed,repeatEqual:true,log:e.log};
  }
  return result;
}
const results=[run(false,false),run(true,false),run(false,true)];
assert.equal(results[1].armor,12);
assert(results[1].damage<results[0].damage);
console.log(JSON.stringify({note:'Node headless with a synthetic grid scene; NOT proof of grid-free combat. sure/area isolate formulas and skip hit/crit rolls.',results},null,2));
