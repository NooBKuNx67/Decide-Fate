const assert=require('node:assert/strict'),D=require('./dist/battle-data.js'),C=require('./dist/combat-data.js'),R=require('./dist/rules.js');
for(const biome of Object.keys(D.biomes))for(const layout of Object.keys(D.layouts))for(const size of [6,24,100]){const s=D.generate('qa',biome,size,size,'LARGE',layout);assert.deepEqual(D.inspect(s).issues,[],`${biome}/${layout}/${size}`);assert.deepEqual(D.validate({v:1,scenes:[s]}).scenes[0],s);assert.deepEqual(s,D.generate('qa',biome,size,size,'LARGE',layout));if(layout==='river'){assert(s.cells.some(c=>c.terrain==='water'));assert(s.cells.some(c=>c.terrain==='bridge'));}}
const s=D.generate('qa','meadow',100,100,'LARGE','crossroads'),points=D.inspect(s).enemies;
for(const [roll,index] of [[0,0],[.5,1],[.99999,2]])assert.deepEqual(D.spawnEnemy(s,()=>roll),[points[index]]);
assert.equal(D.paths(s,D.node(D.inspect(s).players[0])).dist.has(D.node(points[2])),true);
const snap={...R.fresh(),character:{name:'Hero',job:'warrior',stats:{STR:12},level:1,xp:0}};
for(const roll of [0,.5,.99999]){const e=C.create(s,snap,[],'qa',()=>roll);assert.equal(e.units.length,2);assert.deepEqual(C.validate(JSON.parse(JSON.stringify(e))),e);assert.equal(e.units[1].n,D.node(D.spawnEnemy(s,()=>roll)[0]));}
assert.throws(()=>D.validate({v:1,scenes:[{...s,w:101}]}));
const plain=D.blank('empty','meadow',100,100);assert.equal(D.paths(plain,0).dist.get(D.node(9999)),198);
for(const terrain of ['road','path','bridge'])assert(D.walkable({...D.tile(),terrain}));assert(!D.walkable({...D.tile(),terrain:'water'}));
console.log('PASS 45 large/template layouts, seeded repeatability, connectivity, 100x100 shortest path, terrain traversal, 3 candidate spawn choices, one enemy and stable saved encounter');
