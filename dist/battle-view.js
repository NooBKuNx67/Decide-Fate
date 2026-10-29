/* Isometric diorama. View/camera are transient; gameplay remains in battle-data. */
(function(scope){
'use strict';
const HW=32,HH=16,LIFT=20;
function project(s,i,top=false){const c=s.cells[i];return {x:(i%s.w-Math.floor(i/s.w))*HW,y:(i%s.w+Math.floor(i/s.w))*HH-c.height*LIFT-(top?40:0)};}
function order(s){return s.cells.map((_,i)=>i).sort((a,b)=>(a%s.w+Math.floor(a/s.w))-(b%s.w+Math.floor(b/s.w))||a-b);}
function bounds(s){let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let i=0;i<s.cells.length;i++){const p=project(s,i);left=Math.min(left,p.x-HW-8);right=Math.max(right,p.x+HW+8);top=Math.min(top,p.y-(s.cells[i].object==='tree'?78:58));bottom=Math.max(bottom,p.y+HH+s.cells[i].height*LIFT+16);}return {left,right,top,bottom};}
function fit(s,w,h){const b=bounds(s),zoom=Math.min(1.6,(w-44)/(b.right-b.left),(h-64)/(b.bottom-b.top));return {zoom:Math.max(.08,zoom),x:w/2-(b.left+b.right)/2*zoom,y:h/2-(b.top+b.bottom)/2*zoom+8};}
function pick(s,camera,x,y){const wx=(x-camera.x)/camera.zoom,wy=(y-camera.y)/camera.zoom;const sorted=order(s);for(let k=sorted.length-1;k>=0;k--){const i=sorted[k],p=project(s,i);if(Math.abs(wx-p.x)/HW+Math.abs(wy-p.y)/HH<=1)return i;}return null;}
const palettes={meadow:{sky:['#b8dce4','#ecedce'],grass:['#a6ce77','#a0c973','#b0d681','#9ac56e'],soil:'#baa27b',edge:['#a89b78','#6f8575'],tree:['#e2ed9d','#94c96a','#477b65'],water:'#6ecbd0',mist:'#b2d8ad'},forest:{sky:['#8eb8be','#c7d9c0'],grass:['#598564','#517b59','#638b61','#497354'],soil:'#a18d6c',edge:['#87917b','#536f6d'],tree:['#cce596','#78b785','#386e68'],water:'#3d8891',mist:'#a0c7b6'},cave:{sky:['#333b63','#6c8194'],grass:['#78868b','#737e84','#849094','#69777d'],soil:'#8a8d8c',edge:['#58586b','#373b50'],tree:['#a2b5ab','#688d87','#3c6668'],water:'#4b9aa9',mist:'#94c5d0'}};
function create(canvas){const ctx=canvas.getContext('2d');let camera={x:0,y:0,zoom:1},width=0,height=0,last=null,autoFit=true;
 // Local illustrated atlas: rendering only; cell data, physics and picking stay independent.
 const art=new Image();let artReady=false;canvas.dataset.art='loading';
 art.onload=()=>{artReady=true;canvas.dataset.art='ready';redraw();};
 art.onerror=()=>{canvas.dataset.art='fallback';};
 art.src='assets/terrain-atlas.png';
 const frames=[[0,0,533,577],[533,0,533,577],[1066,0,470,577],[0,590,520,434],[530,590,540,434],[1080,590,456,434]];
 function sprite(frame,x,y,w,h,ghost=false){if(!artReady)return false;const [sx,sy,sw,sh]=frames[frame];ctx.save();if(ghost)ctx.globalAlpha=.3;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(art,sx,sy,sw,sh,x-w/2,y-h*.965,w,h);ctx.restore();return true;}

 const campArt=new Image();let campReady=false;canvas.dataset.props='loading';
 campArt.onload=()=>{campReady=true;canvas.dataset.props='ready';redraw();};campArt.onerror=()=>{canvas.dataset.props='fallback';};campArt.src='assets/camp-atlas.png';
 const campFrames={tent:0,chest:1,campfire:2,crate:3,barrel:4,sign:5};
 function campProp(kind,x,y){
 if(!Object.hasOwn(campFrames,kind))return false;
 ellipse(x+3,y+3,21,7,'#122b3930');
 if(campReady){const i=campFrames[kind],sw=campArt.naturalWidth/3,sh=campArt.naturalHeight/2;const h=kind==='tent'?60:kind==='sign'?52:44,w=kind==='tent'?72:54;ctx.drawImage(campArt,(i%3)*sw,Math.floor(i/3)*sh,sw,sh,x-w/2,y-h*.86,w,h);return true;}
 // Readable procedural props remain usable if the illustrated sheet is unavailable.
 if(kind==='tent'){poly([[x-28,y],[x-1,y-46],[x+29,y],[x+5,y+10]],'#d9cba4');poly([[x-1,y-46],[x+5,y+10],[x+29,y]],'#a68d6b');poly([[x-18,y],[x-4,y-27],[x+1,y+5]],'#293849');}
 else if(kind==='campfire'){for(let k=0;k<6;k++){const a=k*Math.PI/3;ellipse(x+Math.cos(a)*17,y+Math.sin(a)*7,5,3,'#87969c');}poly([[x-10,y],[x-5,y-17],[x,y-10],[x+4,y-28],[x+11,y],[x,y+4]],'#ed994e');poly([[x-5,y],[x+1,y-15],[x+5,y]],'#ffe0a0');}
 else if(kind==='sign'){poly([[x-2,y],[x-2,y-35],[x+2,y-35],[x+2,y]],'#846443');poly([[x-21,y-39],[x+15,y-39],[x+24,y-30],[x+15,y-23],[x-21,y-23]],'#bb935b','#654b36');}
 else{poly([[x-20,y-23],[x,y-32],[x+20,y-22],[x+20,y],[x,y+9],[x-20,y]],'#a57a4e','#604a35');poly([[x,y-12],[x+20,y-22],[x+20,y],[x,y+9]],'#735236');ctx.strokeStyle=kind==='chest'?'#e8cc83':'#405866';ctx.lineWidth=3;ctx.strokeRect(x-13,y-21,26,20);}
 return true;
 }
 const biomeArt=new Image();let biomeReady=false;canvas.dataset.biomeProps='loading';
 biomeArt.onload=()=>{biomeReady=true;canvas.dataset.biomeProps='ready';redraw();};biomeArt.onerror=()=>{canvas.dataset.biomeProps='fallback';};biomeArt.src='assets/biome-atlas.png';
 const biomeFrames={stump:0,log:1,fern:2,mushroom:3,stalagmite:4,crystal:5};
 function biomeProp(kind,x,y){
 if(!Object.hasOwn(biomeFrames,kind))return false;
 ellipse(x+2,y+2,20,6,'#122b3926');
 if(biomeReady){const i=biomeFrames[kind],sw=biomeArt.naturalWidth/3,sh=biomeArt.naturalHeight/2,h=['stalagmite','crystal'].includes(kind)?58:kind==='fern'?40:38;ctx.drawImage(biomeArt,i%3*sw,Math.floor(i/3)*sh,sw,sh,x-28,y-h*.88,56,h);return true;}
 if(kind==='stump'||kind==='log'){poly([[x-18,y],[x-18,y-21],[x+15,y-21],[x+19,y],[x,y+6]],'#70543e');ellipse(x-1,y-21,17,7,'#c9a46d');ellipse(x-1,y-21,10,4,'#896b45');}
 else if(kind==='fern'){for(let k=-2;k<=2;k++)poly([[x,y],[x+k*9-3,y-12],[x+k*10,y-26+Math.abs(k)*5],[x+k*9+4,y-12]],k%2?'#73a575':'#a0c889');}
 else if(kind==='mushroom'){for(let k=-1;k<=1;k++){poly([[x+k*13-2,y],[x+k*13-2,y-14],[x+k*13+2,y-14],[x+k*13+2,y]],'#bdd5dd');ellipse(x+k*13,y-16-Math.abs(k)*3,9,5,k%2?'#8c91cb':'#74bcc6');}}
 else{for(let k=-1;k<=1;k++)poly([[x+k*13-7,y],[x+k*13,y-42+Math.abs(k)*12],[x+k*13+8,y],[x+k*13,y+4]],kind==='crystal'?(k%2?'#8f9ddd':'#71cddd'):'#8e9ca7','#455d7455');}
 return true;
 }
 function poly(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
 function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
 function diamond(x,y){return [[x,y-HH],[x+HW,y],[x,y+HH],[x-HW,y]];}
 function hash(i,k){let a=Math.imul(i+1,374761393)^Math.imul(k+1,668265263);a=Math.imul(a^(a>>>13),1274126177);return ((a^(a>>>16))>>>0)/4294967295;}
 function rock(x,y,scale=1,cave=false){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ellipse(3,3,20,8,'#132a3438');poly([[-20,0],[-15,-18],[0,-27],[19,-12],[21,1],[3,9]],cave?'#647380':'#929a91');poly([[-15,-18],[0,-27],[19,-12],[1,-8]],cave?'#a3b4bb':'#c4c7ae');poly([[1,-8],[19,-12],[21,1],[3,9]],cave?'#4c586a':'#69796f');poly([[-15,-18],[1,-8],[-20,0]],'#ffffff12');ctx.restore();}
 function tree(x,y,i,p,biome,ghost){ctx.save();if(ghost)ctx.globalAlpha=.35;ellipse(x+9,y+3,27,10,'#102c343a');poly([[x-5,y],[x-4,y-38],[x+3,y-40],[x+6,y-2]],'#6b5842');poly([[x,y-3],[x,y-38],[x+3,y-40],[x+6,y-2]],'#463f35');ctx.strokeStyle='#685440';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y-20);ctx.lineTo(x-12,y-35);ctx.moveTo(x+1,y-24);ctx.lineTo(x+13,y-43);ctx.stroke();
 if(biome==='forest'&&i%3===0){for(let k=0;k<3;k++){const yy=y-25-k*15,ww=27-k*5;poly([[x-ww,yy],[x,yy-36],[x+ww,yy],[x+5,yy+9]],p.tree[2]);poly([[x-ww,yy],[x,yy-36],[x+2,yy+2]],p.tree[1]);poly([[x-ww+5,yy-1],[x,yy-36],[x-3,yy-6]],p.tree[0]);}}else{for(const [dx,dy,r] of [[0,-37,24],[-17,-45,18],[15,-47,21],[-4,-60,22]]){const g=ctx.createRadialGradient(x+dx-6,y+dy-8,1,x+dx,y+dy,r);g.addColorStop(0,p.tree[0]);g.addColorStop(.5,p.tree[1]);g.addColorStop(1,p.tree[2]);ellipse(x+dx,y+dy,r,r*.77,g);}for(let k=0;k<18;k++){const xx=x-23+hash(i,k+31)*44,yy=y-66+hash(i,k+54)*24;ellipse(xx,yy,5+hash(i,k+72)*4,3+hash(i,k+83)*3,k%3===0?p.tree[0]:p.tree[1]);}for(let k=0;k<6;k++)ellipse(x-22+hash(i,k)*40,y-64+hash(i,k+7)*22,2.4,1.3,'#f4edbb44');}ctx.restore();}
 function object(s,c,i,p,x,y,ghost){
 if(campProp(c.object,x,y)||biomeProp(c.object,x,y))return;
 if(artReady){
  if(c.object==='tree'){ellipse(x+7,y+3,23,7,'#173a4926');sprite(s.biome==='forest'?2:s.biome==='meadow'&&hash(i,91)<.24?1:0,x,y+2,70,78,ghost);return;}
  if(c.object==='bush'){ellipse(x+3,y+3,19,5,'#173a4920');sprite(3,x,y+4,42,32);return;}
  if(c.object==='rock'){sprite(4,x,y+5,44,34);return;}
  if(c.object==='wall'&&s.biome==='cave'){sprite(5,x,y+4,43,52);return;}
 }
 if(c.object==='tree')tree(x,y,i,p,s.biome,ghost);else if(c.object==='bush'){ellipse(x+4,y+4,23,7,'#19332b30');for(const [dx,dy,r] of [[-13,-3,10],[0,-8,13],[14,-2,9]]){const g=ctx.createLinearGradient(x,y-20,x,y+6);g.addColorStop(0,p.tree[0]);g.addColorStop(1,p.tree[2]);ellipse(x+dx,y+dy,r,r*.68,g);}for(let k=0;k<3;k++)ellipse(x-12+k*11,y-8-(k%2)*7,1.8,2,'#e5d395');}else if(c.object==='rock')rock(x,y,.8,s.biome==='cave');else if(c.object==='wall'){if(s.biome==='cave'){rock(x-6,y,1.2,true);poly([[x+1,y-9],[x+9,y-52],[x+18,y-12]],'#9caeb4');poly([[x+9,y-52],[x+24,y-2],[x+18,y-12]],'#4f6275');}else{poly([[x-23,y-4],[x-23,y-34],[x,y-23],[x,y+9]],'#797c73');poly([[x,y+9],[x,y-23],[x+24,y-35],[x+24,y-4]],'#56665e');poly([[x-23,y-34],[x,y-46],[x+24,y-35],[x,y-23]],'#b0b39a');ctx.strokeStyle='#344b4755';ctx.lineWidth=1;for(let k=1;k<3;k++){ctx.beginPath();ctx.moveTo(x-23,y-34+k*10);ctx.lineTo(x,y-23+k*10);ctx.lineTo(x+24,y-35+k*10);ctx.stroke();}}}}
 function marker(x,y,side,label,playing,active){const blue=side==='player',color=blue?'#70d9e9':'#f09a89';ellipse(x,y+3,17,8,'#0b1c2f66');ctx.strokeStyle=color;ctx.lineWidth=active?3:1.8;ctx.beginPath();ctx.ellipse(x,y,18,9,0,0,Math.PI*2);ctx.stroke();if(playing){poly([[x-11,y-3],[x-7,y-28],[x+6,y-30],[x+12,y-3],[x,y+3]],blue?'#438398':'#a96161');poly([[x-7,y-28],[x-11,y-3],[x,y+3],[x-1,y-23]],blue?'#82b5bd':'#dbad95');ellipse(x,y-32,7,8,'#e9d5ad');poly([[x-8,y-33],[x-7,y-40],[x+3,y-42],[x+8,y-34],[x,y-36]],blue?'#344853':'#704741');ctx.strokeStyle='#dfd1a4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+12,y-6);ctx.lineTo(x+16,y-27);ctx.stroke();}else{ctx.strokeStyle='#e6d8a8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-2);ctx.lineTo(x,y-33);ctx.stroke();poly([[x,y-34],[x+24,y-29],[x+20,y-16],[x,y-21]],blue?'#315e77':'#913f51');ctx.font='bold 10px sans-serif';ctx.fillStyle='#fff6da';ctx.textAlign='center';ctx.fillText(label,x+11,y-23);ctx.textAlign='start';}if(active){ctx.fillStyle='#fff0b7';poly([[x,y-54],[x-5,y-61],[x+5,y-61]],'#ffe5a0');}}
 function draw(s,state){last={s,state};const rect=canvas.getBoundingClientRect();const w=Math.max(1,rect.width),h=Math.max(1,rect.height);if(w<2||h<2)return;if(w!==width||h!==height){const dx=w-width,dy=h-height;width=w;height=h;if(autoFit)camera=fit(s,w,h);else{camera.x+=dx/2;camera.y+=dy/2;}}const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const p=palettes[s.biome],bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,p.sky[0]);bg.addColorStop(1,p.sky[1]);ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // Atmospheric speckles and a grounded island shadow, all deterministic.
 for(let k=0;k<40;k++)ellipse(hash(k,2)*w,hash(k,4)*h,hash(k,6)*1.2+.3,hash(k,6)*1.2+.3,p.mist+'22');ctx.save();ctx.translate(camera.x,camera.y);ctx.scale(camera.zoom,camera.zoom);const b=bounds(s);ellipse((b.left+b.right)/2,(s.w+s.h)*HH/2+22,(b.right-b.left)*.43,(s.w+s.h)*HH*.36,'#1c4a5428');
 const sorted=order(s),unitMap=new Map();if(state.testing)state.units.forEach((u,k)=>{const i=Math.floor(u.n/2);if(!unitMap.has(i))unitMap.set(i,[]);unitMap.get(i).push({...u,active:k===state.active});});const pathCells=new Set((state.route||[]).map(e=>Math.floor(e.n/2)));
 for(const i of sorted){const c=s.cells[i],q=project(s,i),x=q.x,y=q.y,depth=c.height*LIFT+12;ctx.lineWidth=.7;
 poly([[x-HW,y],[x,y+HH],[x,y+HH+depth],[x-HW,y+depth]],p.edge[0]);poly([[x,y+HH],[x+HW,y],[x+HW,y+depth],[x,y+HH+depth]],p.edge[1]);if(c.height){
 // Faceted cliff layers catch the same warm light as the painted props.
 for(let z=0;z<c.height;z++){const yy=y+z*LIFT;poly([[x-HW+2,yy+4],[x-4,yy+HH+2],[x-8,yy+HH+12],[x-HW+3,yy+16]],z%2?'#e8dbb724':'#e8dbb73b');poly([[x+2,yy+HH+3],[x+HW-2,yy+4],[x+HW-5,yy+16],[x+6,yy+HH+14]],'#273e4f1c');}
 ctx.strokeStyle='#e2d9b340';for(let z=1;z<=c.height;z++){ctx.beginPath();ctx.moveTo(x-HW,y+z*LIFT);ctx.lineTo(x,y+HH+z*LIFT);ctx.lineTo(x+HW,y+z*LIFT);ctx.stroke();}}
 const fill=c.terrain==='water'?p.water:c.terrain==='ground'?p.soil:p.grass[i%4];poly(diamond(x,y),fill,state.grid?'#f7ffe969':null);
 if(c.terrain==='grass'){poly([[x-HW,y],[x,y+HH],[x+HW,y],[x+HW,y+3],[x,y+HH+3],[x-HW,y+3]],p.grass[(i+1)%4]);}
ctx.save();poly(diamond(x,y));ctx.clip();const light=ctx.createLinearGradient(x-HW,y-HH,x+HW,y+HH);light.addColorStop(0,'#fff4bf38');light.addColorStop(1,'#244e6c15');ctx.fillStyle=light;ctx.fillRect(x-HW,y-HH,HW*2,HH*2);
 if(c.terrain==='water'){ctx.strokeStyle='#d8f6eb55';ctx.lineWidth=1.2;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(x-25+k*9,y-9+k*6);ctx.lineTo(x-10+k*9,y-10+k*6);ctx.stroke();}}else{for(let k=0;k<12;k++){const xx=x-28+hash(i,k)*56,yy=y-14+hash(i,k+15)*28;ctx.fillStyle=k%2?'#f7ecc329':'#263e2920';ctx.fillRect(xx,yy,2,1);if(c.terrain==='grass'&&i%4===0){if(s.biome==='meadow'&&k<2){ellipse(xx,yy-2,1.6,1.3,i%3?'#fff3cd':'#e8b5cf');}ctx.strokeStyle='#e5eab448';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx-2,yy-4);ctx.moveTo(xx,yy);ctx.lineTo(xx+2,yy-3);ctx.stroke();}}}ctx.restore();
 if(pathCells.has(i)){poly(diamond(x,y),'#9ce9db55','#c8ffe5');ellipse(x,y,3,1.7,'#edfff6');}if(i===state.selected){ctx.lineWidth=2;poly(diamond(x,y),'#ffe1a22a','#ffe1a2');}
 if(c.climb&&c.height>0){ctx.strokeStyle='#dac49a';ctx.lineWidth=2;const xx=x+17,yy=y+7;for(const off of [-4,4]){ctx.beginPath();ctx.moveTo(xx+off,yy);ctx.lineTo(xx+off,yy+depth-2);ctx.stroke();}for(let z=5;z<depth;z+=7){ctx.beginPath();ctx.moveTo(xx-4,yy+z);ctx.lineTo(xx+4,yy+z);ctx.stroke();}}
 object(s,c,i,p,x,y,state.ghost||(i===state.selected&&c.object==='tree'));if(c.object==='tree'&&c.climb&&!state.testing){ctx.font='bold 13px sans-serif';ctx.fillStyle='#f9e4a4';ctx.fillText('↟',x-8,y+8);}
 if(!state.testing&&c.spawn)marker(x,y,c.spawn,c.spawn==='player'?'P':'M',false,false);for(const u of unitMap.get(i)||[])marker(x,y-(u.n%2?40:0),u.side,u.number,true,u.active);
 }
 const q=project(s,state.selected);ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff0cb';ctx.fillText('H'+s.cells[state.selected].height,q.x,q.y+29);ctx.restore();ctx.fillStyle=s.biome==='cave'?'#e7edf9':'#355968';ctx.font='11px sans-serif';ctx.textAlign='left';ctx.fillText('DECIDE FATE  /  '+s.w+' × '+s.h+'  /  '+({meadow:'MEADOW',forest:'WOODLAND',cave:'CAVERN'}[s.biome]),18,h-17);
 }
 function redraw(){if(last)draw(last.s,last.state);}
 return {draw,fit(s){autoFit=true;const r=canvas.getBoundingClientRect();camera=fit(s,r.width,r.height);redraw();},pan(dx,dy){autoFit=false;camera.x+=dx;camera.y+=dy;redraw();},zoom(factor,x=width/2,y=height/2){autoFit=false;const next=Math.max(.08,Math.min(3,camera.zoom*factor)),ratio=next/camera.zoom;camera.x=x-(x-camera.x)*ratio;camera.y=y-(y-camera.y)*ratio;camera.zoom=next;redraw();},pick(s,x,y){return pick(s,camera,x,y);},cellPoint(s,i){const p=project(s,i);return {x:p.x*camera.zoom+camera.x,y:p.y*camera.zoom+camera.y};},get camera(){return {...camera};},redraw};
}
const api={project,order,bounds,fit,pick,create};scope.EverTaleBattleView=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
