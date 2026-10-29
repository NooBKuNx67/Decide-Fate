/* Serializable scene rules, independent of canvas/UI and campaign progression. */
(function(scope){
'use strict';
const KEY='battleScenes:main',biomes={meadow:'ทุ่งหญ้า',forest:'ป่า',cave:'ถ้ำ'},objects={none:'พื้นโล่ง',bush:'พุ่มหญ้า',tree:'ต้นไม้',rock:'ก้อนหิน',wall:'ผนัง',tent:'เต็นท์',chest:'กล่องสมบัติ',campfire:'กองไฟ',crate:'ลังไม้',barrel:'ถังไม้',sign:'ป้ายทาง',stump:'ตอไม้',log:'ขอนไม้',fern:'เฟิร์น',mushroom:'เห็ดถ้ำ',stalagmite:'หินงอก',crystal:'ผลึกแร่',flowers:'ดอกไม้ป่า',redMushroom:'เห็ดป่า',thornBush:'พุ่มหนาม',vines:'ซุ้มเถาวัลย์',nest:'รังนก',standingStone:'หินโบราณ',goldOre:'แร่ทอง',rubyOre:'แร่ทับทิม',bones:'โครงกระดูก',torch:'คบเพลิง',minecart:'รถรางเหมือง',beams:'คานเหมืองพัง',altar:'แท่นบูชา'},terrains={ground:'พื้นดิน',grass:'หญ้า',water:'น้ำ'};
const propSets={"meadow": ["tree", "bush", "rock", "flowers", "tent", "chest", "campfire", "crate", "barrel", "sign"], "forest": ["tree", "stump", "log", "fern", "flowers", "redMushroom", "thornBush", "vines", "nest", "standingStone"], "cave": ["mushroom", "stalagmite", "crystal", "goldOre", "rubyOre", "bones", "torch", "minecart", "beams", "altar"]};
const clone=x=>JSON.parse(JSON.stringify(x)),tile=()=>({terrain:'grass',object:'none',height:0,climb:false,spawn:'',monster:''});
function blank(id='scene-1',biome='meadow',w=12,h=10){return {id,name:biomes[biome]+' ใหม่',biome,w,h,seed:'',cells:Array.from({length:w*h},()=>({...tile(),terrain:biome==='cave'?'ground':'grass'}))};}
function validate(input){
 if(!input||input.v!==1||!Array.isArray(input.scenes)||input.scenes.length<1||input.scenes.length>30)throw Error('ต้องมีฉาก 1–30 ฉาก');
 const ids=new Set();return {v:1,scenes:input.scenes.map(s=>{
 if(!s||typeof s.id!=='string'||!/^[-\w]{1,80}$/.test(s.id)||ids.has(s.id))throw Error('ID ฉากซ้ำหรือไม่ถูกต้อง');ids.add(s.id);
 if(typeof s.name!=='string'||!s.name.trim()||s.name.length>80||!Object.hasOwn(biomes,s.biome)||!Number.isInteger(s.w)||!Number.isInteger(s.h)||s.w<6||s.h<6||s.w>40||s.h>40||!Array.isArray(s.cells)||s.cells.length!==s.w*s.h||typeof s.seed!=='string'||s.seed.length>80)throw Error('ชื่อ หมวด หรือขนาดฉากไม่ถูกต้อง (6–40 ช่อง)');
 return {id:s.id,name:s.name.trim(),biome:s.biome,w:s.w,h:s.h,seed:s.seed,cells:s.cells.map(c=>{if(!c||!Object.hasOwn(terrains,c.terrain)||!Object.hasOwn(objects,c.object)||!Number.isInteger(c.height)||c.height<0||c.height>4||typeof c.climb!=='boolean'||!['','player','enemy'].includes(c.spawn)||typeof c.monster!=='string'||c.monster.length>120)throw Error('ข้อมูลช่องกริดไม่ถูกต้อง');return {terrain:c.terrain,object:c.object,height:c.height,climb:c.climb,spawn:c.spawn,monster:c.spawn==='enemy'?c.monster:''};})};})};
}
const walkable=c=>!!c&&c.terrain!=='water'&&!['rock','wall','tent','chest','campfire','crate','barrel','sign','stump','log','stalagmite','crystal','thornBush','vines','nest','standingStone','goldOre','rubyOre','torch','minecart','beams','altar'].includes(c.object);
const node=(i,top=false)=>i*2+(top?1:0),index=n=>Math.floor(n/2),height=(s,n)=>s.cells[index(n)].height+(n%2?2:0);
function neighbors(s,n){const i=index(n),c=s.cells[i],out=[];if(!walkable(c))return out;
 if(c.object==='tree'&&c.climb)out.push({n:n%2?n-1:n+1,cost:3,action:n%2?'ลงต้นไม้':'ปีนต้นไม้'});
 if(n%2)return out;
 const x=i%s.w,y=Math.floor(i/s.w);
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||xx>=s.w||yy<0||yy>=s.h)continue;const j=yy*s.w+xx,d=s.cells[j];if(!walkable(d))continue;const diff=Math.abs(c.height-d.height);if(diff>1&&!c.climb&&!d.climb)continue;out.push({n:node(j),cost:diff>1?diff+2:1+diff+(['bush','tree','fern','mushroom','flowers','redMushroom','bones'].includes(d.object)?1:0),action:diff>1?'ปีนหน้าผา':diff?'ขึ้น/ลงระดับ':'เดิน'});}
 return out;
}
function paths(s,start,blocked=[]){const dist=new Map([[start,0]]),prev=new Map(),todo=[start],ban=new Set(blocked);while(todo.length){todo.sort((a,b)=>dist.get(a)-dist.get(b));const n=todo.shift();for(const edge of neighbors(s,n)){if(ban.has(edge.n))continue;const cost=dist.get(n)+edge.cost;if(cost<(dist.get(edge.n)??Infinity)){dist.set(edge.n,cost);prev.set(edge.n,{from:n,...edge});if(!todo.includes(edge.n))todo.push(edge.n);}}}return {dist,prev};}
function route(result,target){if(!result.dist.has(target))return [];const out=[];while(result.prev.has(target)){const p=result.prev.get(target);out.unshift(p);target=p.from;}return out;}
function inspect(s){const players=[],enemies=[],issues=[];s.cells.forEach((c,i)=>{if(c.spawn==='player')players.push(i);if(c.spawn==='enemy')enemies.push(i);if(c.spawn&&!walkable(c))issues.push('จุดเกิดที่ ('+(i%s.w+1)+','+(Math.floor(i/s.w)+1)+') ถูกสิ่งกีดขวาง');});if(!players.length)issues.push('ยังไม่มีจุดเกิดผู้เล่น');if(!enemies.length)issues.push('ยังไม่มีจุดเกิดมอนสเตอร์');if(players.length&&walkable(s.cells[players[0]])){const p=paths(s,node(players[0]));if([...players,...enemies].some(i=>!p.dist.has(node(i))))issues.push('มีจุดเกิดที่เดินไปหาไม่ได้ • เพิ่มทางเดินหรือทางปีน');}return {players,enemies,issues};}
function random(seed){let a=2166136261;for(const c of seed)a=Math.imul(a^c.charCodeAt(0),16777619);return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function generate(id,biome,w,h,seed){const s=blank(id,biome,w,h),r=random(seed);s.seed=seed;s.name=biomes[biome]+' • '+seed;
 s.cells.forEach((c,i)=>{const x=i%w,y=Math.floor(i/w),v=r();c.object=biome==='cave'?(v<.2?'wall':v<.28?'rock':'none'):(v<(biome==='forest'?.26:.12)?'tree':v<.38?'bush':v<.43?'rock':'none');if(biome==='forest'){if(c.object==='bush'&&i%2===0)c.object='fern';if(c.object==='rock')c.object=i%2?'log':'stump';}if(biome==='cave'){if(c.object==='rock')c.object=i%2?'crystal':'stalagmite';else if(c.object==='none'&&v<.4)c.object='mushroom';}if(biome==='forest'){if(['bush','fern'].includes(c.object))c.object=['fern','flowers','redMushroom'][i%3];else if(['stump','log'].includes(c.object))c.object=['stump','log','thornBush','vines','nest','standingStone'][i%6];}if(biome==='cave'){if(['stalagmite','crystal'].includes(c.object))c.object=['stalagmite','crystal','goldOre','rubyOre','torch','minecart','beams','altar'][i%8];else if(c.object==='mushroom'&&i%3===0)c.object='bones';}if(biome==='meadow'&&c.object==='bush'&&i%3===0)c.object='flowers';c.climb=c.object==='tree';if(x>w*.6&&y<h*.35){c.height=2;c.climb=true;}if(biome==='cave'&&(x===0||y===0||x===w-1||y===h-1))c.object='wall';});
 const y=Math.floor(h/2);for(let x=1;x<w-1;x++)s.cells[y*w+x]={...tile(),terrain:'ground'};
 for(const yy of [y-1,y,y+1])for(const x of [1,2,w-3,w-2])s.cells[yy*w+x]={...tile(),terrain:'ground'};
 for(let k=0;k<3;k++){s.cells[(y-1+k)*w+1].spawn='player';s.cells[(y-1+k)*w+w-2].spawn='enemy';}
 // Accessible examples: a climbable tree, a two-level cliff and its clear approach.
 s.cells[(y-1)*w+3]={...tile(),object:biome==='cave'?'none':'tree',climb:true,height:biome==='cave'?2:0};
 s.cells[(y-2)*w+3]={...tile(),terrain:'ground',height:2,climb:true};
 return s;
}
const defaults=()=>({v:1,scenes:[generate('meadow-demo','meadow',12,10,'EVER-01'),generate('forest-demo','forest',12,10,'EVER-02'),generate('cave-demo','cave',12,10,'EVER-03')]});
const api={KEY,biomes,objects,propSets,terrains,clone,tile,blank,validate,walkable,node,index,height,neighbors,paths,route,inspect,generate,defaults};scope.EverTaleBattleData=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
