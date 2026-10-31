/* Painted modular anime parts; feet stay at the same world-space anchor. */
(function(g){'use strict';
const atlas=new Image();atlas.src='assets/characters/anime-parts.png';
const parts={gentle:[74,9,213,290],sharp:[407,6,213,295],bright:[744,7,220,293],tousled:[8,304,329,305],bob:[349,311,319,300],ponytail:[682,302,341,382],male:[42,615,307,407],female:[396,620,302,406],arm:[835,654,128,395],maleLegs:[35,1090,259,433],femaleLegs:[431,1142,179,376],cape:[660,1031,361,480]};
const cache=new Map();
function part(name,tint){const key=name+':'+(tint||'');if(cache.has(key))return cache.get(key);const r=parts[name],c=document.createElement('canvas');c.width=r[2];c.height=r[3];const q=c.getContext('2d');q.drawImage(atlas,...r,0,0,c.width,c.height);if(tint){q.globalCompositeOperation='source-atop';q.fillStyle=tint;q.fillRect(0,0,c.width,c.height);}cache.set(key,c);return c;}
function draw(c,x,y,size,a,e,pose,time,facing,race){if(!atlas.complete||!atlas.naturalWidth)return false;
const t=time/1000,walk=pose==='walk'?Math.sin(t*12):0,flip=facing===1||facing===2?-1:1;
c.save();c.translate(x,y);c.scale(size/100*flip,size/100);if(pose==='down'){c.rotate(-1.35);c.translate(30,0);}if(pose==='hit')c.rotate(Math.sin(t*30)*.08);c.translate(0,pose==='walk'?-Math.abs(walk)*2:Math.sin(t*2)*.5);
const image=(name,x,y,w,h,tint)=>c.drawImage(part(name,tint),x,y,w,h);
const shape=(d,color)=>{const p=new Path2D(d);c.fillStyle=color;c.fill(p);c.lineWidth=.6;c.strokeStyle='#302c39';c.stroke(p);};
const skin=a.skin==='deep'?'#75412970':a.skin==='light'?'#fff1dc30':null;
const hairTint=a.hairColor==='black'?'#131926b8':a.hairColor==='silver'?'#e4edf6b0':a.hair==='tousled'?null:'#89543290';
image('cape',-22,-76,44,65);
if(race==='cat')shape('M 12 -25 Q 38 -19 27 -45 Q 43 -17 16 -13 Z','#6d4b37');
// The lower-body sheet is split at the hip into independently moving legs.
const legs=part(a.body+'Legs');for(const side of [-1,1]){c.save();c.translate(side*6,-38);c.rotate(side*walk*.22);const half=legs.width/2;c.drawImage(legs,side<0?0:half,0,half,legs.height,-7,0,14,39);c.restore();}
image(a.body,-18,-78,36,44,e.armor==='หนักฝึกหัด'?'#a2b6c44a':e.armor==='ผ้า'?'#54549b45':null);
function weapon(type){if(type==='shield'){shape('M -11 -6 Q 0 -13 11 -6 L 9 13 Q 0 24 -9 13 Z','#c4a86c');shape('M -8 -4 Q 0 -9 8 -4 L 6 12 L 0 18 L -6 12 Z','#365b70');shape('M 0 -5 L 3 5 L 0 15 L -3 5 Z','#f2d59a');return;}
if(type==='bow'||type==='crossbow'){c.strokeStyle='#d3ae71';c.lineWidth=2;c.beginPath();c.moveTo(0,-27);c.quadraticCurveTo(22,0,0,24);c.stroke();c.strokeStyle='#e4e1d3';c.lineWidth=.5;c.beginPath();c.moveTo(0,-27);c.lineTo(0,24);c.stroke();return;}
shape('M -1.6 7 L 1.6 7 L 1.6 -20 L -1.6 -20 Z','#654832');
if(type==='staff'||type==='holyStaff'){shape('M -2 -16 L -2 -38 L 2 -38 L 2 -16 Z','#c2a56c');shape('M 0 -48 L 6 -40 L 0 -32 L -6 -40 Z','#94e5f2');return;}
if(type==='axe'){shape('M 0 -32 Q 19 -38 15 -19 L 0 -23 Z','#a9cbd7');return;}
if(type==='mace'){shape('M -6 -22 L -6 -33 L 0 -38 L 6 -33 L 6 -22 Z','#b0c7d4');return;}
const top=type==='spear'?-55:type==='dagger'?-24:-41;shape(`M -3 -8 L -3 ${top+9} L 0 ${top} L 3 ${top+9} L 3 -8 Z`,'#d4e9ee');shape(`M 0 -8 L 0 ${top} L 3 ${top+9} L 3 -8 Z`,'#88b2c6');shape('M -7 -9 Q 0 -12 7 -9 L 7 -6 L -7 -6 Z','#d1b36c');}
for(const side of [-1,1]){c.save();c.translate(side*17,-74);c.rotate(side===1?(pose==='cast'?-1.3:pose==='attack'?-1.8+Math.sin(Math.min(1,t%1)*Math.PI)*2.2:-walk*.25):pose==='guard'?.75:walk*.25);if(side<0)c.scale(-1,1);image('arm',-5,0,11,39,skin);c.translate(0,35);if(side===1)weapon(e.main||'sword');else if(e.off)weapon(e.off);c.restore();}
image(a.face,-13,-107,27,36,skin);
if(race==='elf')shape('M -11 -89 L -23 -95 L -14 -83 Z','#e6b293');
image(a.hair,-20,-111,40,a.hair==='ponytail'?46:37,hairTint);
if(race==='cat'){shape('M -16 -100 L -18 -114 L -7 -105 Z','#705041');shape('M 12 -101 L 20 -113 L 20 -99 Z','#705041');}
if(race==='dragonborn'){shape('M -13 -103 Q -24 -115 -17 -119 L -7 -105 Z','#e0d2b3');shape('M 13 -103 Q 24 -115 17 -119 L 7 -105 Z','#e0d2b3');}
if(pose==='cast'){c.strokeStyle='#9debf0';c.lineWidth=1.4;c.beginPath();c.ellipse(31,-70,13,5,t*2,0,Math.PI*2);c.stroke();}
c.restore();return true;}
g.DecideAnimeCharacter={draw};
})(window);
