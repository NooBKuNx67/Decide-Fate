/* Built-in atlas: compact recipes, expanded only when selected. Never stored wholesale in player libraries. */
(function(scope){
'use strict';
const D=scope.EverTaleBattleData||(typeof require==='function'?require('./battle-data.js'):null);
const themes={
 meadow:[['ทุ่งบุปผารุ่งอรุณ','wild','ทุ่งดอกไม้และจุดพักตามเส้นทาง'],['ทางแยกคาราวาน','crossroads','ถนนหินเชื่อมค่ายพ่อค้าและคลังเสบียง'],['สายน้ำสีคราม','river','แม่น้ำคดเคี้ยว สะพาน และค่ายริมฝั่ง'],['ค่ายผู้บุกเบิก','camp','เต็นท์หลายจุด กองไฟ และสมบัติ'],['วงแหวนหินโบราณ','ruins','ลานพิธีและซากหินกลางทุ่ง']],
 forest:[['ป่าดอกไม้แสงอรุณ','wild','ดงไม้หนาแน่นสลับลานดอกไม้'],['เส้นทางผู้พิทักษ์','crossroads','เส้นทางลาดตระเวนเชื่อมศาลาและค่าย'],['ลำธารป่ามรกต','river','ป่าริมน้ำพร้อมทางข้ามและจุดพัก'],['ค่ายพรานใต้ร่มไม้','camp','จุดพักพราน สมุนไพร และเสบียง'],['วิหารเถาวัลย์','ruins','หินโบราณและแท่นบูชาที่ปกคลุมด้วยป่า']],
 cave:[['โพรงเห็ดเรืองแสง','wild','ลานเห็ดและผลึกแร่ในถ้ำ'],['ชุมทางเหมืองร้าง','crossroads','ทางเหมืองเชื่อมคลังแร่และรถราง'],['ธารน้ำใต้พิภพ','river','แม่น้ำใต้ดินพร้อมสะพานและผลึก'],['ค่ายนักขุด','camp','ค่ายพักคนงาน เต็นท์ และลังแร่'],['วิหารผลึกโบราณ','ruins','แท่นบูชา ผลึก และขุมทรัพย์ในถ้ำ']]
};
const catalog=[];
for(const biome of Object.keys(themes))for(const size of [100,16,32,64])for(let variant=0;variant<(size===100?5:4);variant++){
 const theme=themes[biome][size===100?variant:(variant+([16,32,64].indexOf(size)))%5];
 catalog.push(Object.freeze({id:`atlas-v1-${biome}-${size}-${variant+1}`,biome,w:size,h:size,name:theme[0]+(size===100?'':` · เขต ${variant+1}`),layout:theme[1],description:theme[2],variant}));
}
Object.freeze(catalog);
function build(id){
 const p=catalog.find(x=>x.id===id);if(!p)throw Error('ไม่พบพรีเซ็ตแผนที่');
 const s=D.generate(p.id,p.biome,p.w,p.h,p.id,p.layout),n=s.w,cy=Math.floor(n/2);s.name=p.name;
 // Coherent landforms and habitat clusters replace independent per-tile scatter.
 const phase=p.variant*1.73+(p.biome==='cave'?2.2:p.biome==='forest'?1.1:0);
 const hills=[[.27+.07*Math.sin(phase),.25,.25],[.7,.72+.07*Math.cos(phase),.3],[.8,.2,.16]];
 s.cells.forEach((c,i)=>{const x=i%n,y=Math.floor(i/n),u=x/(n-1),v=y/(n-1);
  c.spawn='';c.monster='';
  const mound=Math.max(...hills.map(([hx,hy,r])=>Math.max(0,1-Math.hypot(u-hx,v-hy)/r)));
  c.height=c.terrain==='water'?0:Math.floor(mound*4);c.climb=false;
  const habitat=Math.sin(u*19+phase)+Math.cos(v*16-phase)+Math.sin((u+v)*11);
  const noise=((Math.imul(i+17,1597334677)>>>0)%1000)/1000;
  if(!['grass','ground'].includes(c.terrain))return;
  if(p.biome==='meadow')c.object=habitat>1.4?(noise<.3?'tree':noise<.45?'bush':'none'):habitat< -1.5?(noise<.22?'rock':'none'):(noise<.045?'flowers':'none');
  if(p.biome==='forest')c.object=habitat>.1?(noise<.55?'tree':noise<.63?'fern':'none'):habitat< -1.6?(noise<.2?'rock':noise<.28?'log':'none'):(noise<.12?'redMushroom':'none');
  if(p.biome==='cave')c.object=habitat>1.5?(noise<.55?'wall':noise<.7?'stalagmite':'none'):habitat< -1.5?(noise<.3?'crystal':noise<.4?'goldOre':'none'):(noise<.08?'mushroom':noise<.15?'rock':'none');
  if(c.object==='none'&&noise>.91&&noise<.93){const keys=Object.keys(D.decorations).filter(k=>D.decorations[k].biome===p.biome);c.object=keys[(x*7+y*3+p.variant)%keys.length];}
  c.climb=c.object==='tree';
 });
 const point=(x,y)=>[Math.round(x*(n-1)),Math.round(y*(n-1))];
 const clear=(x,y,terrain='path')=>{const i=y*n+x;if(x<1||x>=n-1||y<1||y>=n-1)return;const old=s.cells[i];s.cells[i]={...D.tile(),height:old.height,climb:false,terrain:['water','bridge'].includes(old.terrain)?'bridge':terrain};};
 function line(a,b){let [x,y]=a;const [tx,ty]=b;clear(x,y);let step=0;
  while(x!==tx||y!==ty){const dx=tx-x,dy=ty-y;const preferX=(Math.sin(step*.41+phase)>0?Math.abs(dx)*1.7:Math.abs(dx)*.6)>=Math.abs(dy);if(dx&&(preferX||!dy))x+=Math.sign(dx);else y+=Math.sign(dy);clear(x,y,p.layout==='crossroads'?'road':'path');step++;}}

 const centers=[[.22+.03*Math.sin(phase),.28],[.65,.2+.04*Math.cos(phase)],[.3,.7],[.74,.78]].map(([x,y])=>point(x,y));
 const kits=p.biome==='cave'?[['mushroom','crystal','bones','chest'],['minecart','goldOre','torch','crate'],['tent','campfire','barrel','rubyOre'],['altar','crystal','standingStone','chest']]:p.biome==='forest'?[['redMushroom','flowers','fern','chest'],['stump','log','nest','standingStone'],['tent','campfire','barrel','sign'],['altar','vines','standingStone','chest']]:[['flowers','bush','flowers','chest'],['crate','barrel','sign','tent'],['tent','campfire','barrel','chest'],['standingStone','altar','flowers','chest']];
 // Four deliberately arranged landmarks, each with a clear approach and interactable props.
 centers.forEach(([x,y],k)=>{for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)clear(x+dx,y+dy,p.layout==='ruins'?'road':'ground');const kit=kits[(k+p.variant)%kits.length];[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy],j)=>{const c=s.cells[(y+dy)*n+x+dx];c.object=kit[j];if(c.terrain==='bridge')c.terrain='ground';});line([x,cy],[x,y]);});
 // Candidate spawns are separated throughout the map, rather than adjacent to each other.
 const player=point(.1,.5),enemies=[point(.8,.18),point(.88,.5),point(.8,.84)];
 for(const pos of [player,...enemies]){line([pos[0],cy],pos);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)clear(pos[0]+dx,pos[1]+dy);}
 for(let x=1;x<n-1;x++)clear(x,cy,p.layout==='crossroads'?'road':'path');
 s.cells[player[1]*n+player[0]].spawn='player';for(const [x,y] of enemies)s.cells[y*n+x].spawn='enemy';
 // Ease the slope into streams and paths, without artificial ladders on every hill tile.
 for(let pass=0;pass<4;pass++)for(let i=0;i<s.cells.length;i++){const x=i%n,y=Math.floor(i/n);for(const j of [x?i-1:-1,x<n-1?i+1:-1,y?i-n:-1,y<n-1?i+n:-1])if(j>=0)s.cells[i].height=Math.min(s.cells[i].height,s.cells[j].height+1);}
 return s;
}
const api={catalog,build};scope.DecideBattlePresets=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
