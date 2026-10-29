const assert=require('node:assert/strict'),D=require('./dist/battle-data.js');
for(const biome of Object.keys(D.biomes))for(const size of [6,12,24,40])for(let seed=0;seed<12;seed++){const s=D.generate('test',biome,size,size,'seed'+seed);D.validate({v:1,scenes:[s]});assert.deepEqual(D.inspect(s).issues,[]);assert.deepEqual(s,D.generate('test',biome,size,size,'seed'+seed));}
const s=D.blank('unit','meadow',6,6);s.cells[0].spawn='player';s.cells[5].spawn='enemy';for(let y=0;y<6;y++)s.cells[y*6+2].object='wall';assert(D.inspect(s).issues.some(x=>x.includes('เดินไปหาไม่ได้')));s.cells[2].object='none';assert.deepEqual(D.inspect(s).issues,[]);
s.cells[1]={...D.tile(),object:'tree',climb:true};let p=D.paths(s,0);assert.equal(p.dist.get(D.node(1,true)),5);assert.equal(D.height(s,D.node(1,true)),2);assert.equal(D.neighbors(s,D.node(1,true)).length,1);
s.cells[1].climb=false;assert(!D.paths(s,0).dist.has(D.node(1,true)));s.cells[1]={...D.tile(),height:4};assert(!D.neighbors(s,0).some(x=>x.n===2));s.cells[1].climb=true;assert.equal(D.neighbors(s,0).find(x=>x.n===2).cost,6);
assert(!D.paths(s,0,[2]).dist.has(2));s.cells[0].terrain='water';assert(D.inspect(s).issues.some(x=>x.includes('กีดขวาง')));
for(const edit of [x=>x.scenes[0].w=999,x=>x.scenes[0].cells[0].height=5,x=>x.scenes[0].cells[0].spawn='bad',x=>x.scenes[0].cells[0].climb='yes',x=>x.scenes.push(D.clone(x.scenes[0]))]){const d=D.defaults();edit(d);assert.throws(()=>D.validate(d));}
console.log('PASS battle rules: 144 seeded layouts, schema, blocked spawns, connectivity, tree ascent/descent, cliff climb costs, unit occupancy');

for(const kind of ['tent','chest','campfire','crate','barrel','sign']){
 const scene=D.blank('props','meadow',6,6);scene.cells[0].spawn='player';scene.cells[5].spawn='enemy';scene.cells[1].object=kind;
 assert.equal(D.validate(JSON.parse(JSON.stringify({v:1,scenes:[scene]}))).scenes[0].cells[1].object,kind);
 const result=D.paths(scene,D.node(0));assert(!result.dist.has(D.node(1)));assert(result.dist.has(D.node(5)));
 scene.cells[1].spawn='player';assert(D.inspect(scene).issues.some(x=>x.includes('กีดขวาง')));
}
console.log('PASS camp props: save roundtrip, impassable cells, alternate routes and blocked spawn diagnosis');
