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
 for(const c of s.cells){c.spawn='';c.monster='';}
 const point=(x,y)=>[Math.round(x*(n-1)),Math.round(y*(n-1))];
 const clear=(x,y,terrain='path')=>{const i=y*n+x;if(x<1||x>=n-1||y<1||y>=n-1)return;const old=s.cells[i];s.cells[i]={...D.tile(),terrain:['water','bridge'].includes(old.terrain)?'bridge':terrain};};
 function line(a,b){let [x,y]=a;clear(x,y);while(x!==b[0]){x+=Math.sign(b[0]-x);clear(x,y,p.layout==='crossroads'?'road':'path');}while(y!==b[1]){y+=Math.sign(b[1]-y);clear(x,y,p.layout==='crossroads'?'road':'path');}}
 const centers=[[.25,.25],[.72,.25],[.35,.73],[.74,.73]].map(([x,y])=>point(x,y));
 const kits=p.biome==='cave'?[['mushroom','crystal','bones','chest'],['minecart','goldOre','torch','crate'],['tent','campfire','barrel','rubyOre'],['altar','crystal','standingStone','chest']]:p.biome==='forest'?[['redMushroom','flowers','fern','chest'],['stump','log','nest','standingStone'],['tent','campfire','barrel','sign'],['altar','vines','standingStone','chest']]:[['flowers','bush','flowers','chest'],['crate','barrel','sign','tent'],['tent','campfire','barrel','chest'],['standingStone','altar','flowers','chest']];
 // Four deliberately arranged landmarks, each with a clear approach and interactable props.
 centers.forEach(([x,y],k)=>{for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)clear(x+dx,y+dy,p.layout==='ruins'?'road':'ground');const kit=kits[(k+p.variant)%kits.length];[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy],j)=>{const c=s.cells[(y+dy)*n+x+dx];c.object=kit[j];if(c.terrain==='bridge')c.terrain='ground';});line([x,cy],[x,y]);});
 // Candidate spawns are separated throughout the map, rather than adjacent to each other.
 const player=point(.1,.5),enemies=[point(.8,.18),point(.88,.5),point(.8,.84)];
 for(const pos of [player,...enemies]){line([pos[0],cy],pos);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)clear(pos[0]+dx,pos[1]+dy);}
 for(let x=1;x<n-1;x++)clear(x,cy,p.layout==='crossroads'?'road':'path');
 s.cells[player[1]*n+player[0]].spawn='player';for(const [x,y] of enemies)s.cells[y*n+x].spawn='enemy';
 return s;
}
const api={catalog,build};scope.DecideBattlePresets=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
