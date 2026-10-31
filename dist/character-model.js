/* Modular vector rig. Feet are the shared anchor; equipment attaches to hand joints. */
(function(g){'use strict';
const defaults={body:'male',face:'gentle',hair:'tousled',hairColor:'brown',skin:'warm'};
const choices={body:{male:'ร่างชาย',female:'ร่างหญิง'},face:{gentle:'อ่อนโยน',sharp:'มั่นใจ',bright:'ร่าเริง'},hair:{tousled:'ผมสั้นยุ่ง',bob:'บ๊อบ',ponytail:'หางม้า'},hairColor:{brown:'น้ำตาล',silver:'เงิน',black:'ดำ'},skin:{light:'ผิวอ่อน',warm:'ผิวกลาง',deep:'ผิวเข้ม'}};
function validate(v,gender){const out={...defaults,body:gender==='female'?'female':'male',...(v||{})};if(!v||typeof v==='object'&&!Array.isArray(v)){for(const k of Object.keys(defaults))if(!Object.hasOwn(choices[k],out[k]))throw Error('รูปลักษณ์ตัวละครไม่ถูกต้อง');return Object.fromEntries(Object.keys(defaults).map(k=>[k,out[k]]));}throw Error('รูปลักษณ์ตัวละครไม่ถูกต้อง');}
function draw(ctx,x,y,size,appearance={},equipment={},pose='idle',time=0,facing=0,race='human'){
 if(g.DecideAnimeCharacter?.draw(ctx,x,y,size,validate(appearance),equipment,pose,time,facing,race))return;
 const a=validate(appearance),female=a.body==='female',back=facing===2||facing===3,flip=facing===1||facing===2?-1:1,t=time/1000,stride=pose==='walk'?Math.sin(t*12):0,attack=pose==='attack'?Math.sin(Math.min(1,t%1)*Math.PI):0;
 const skin={light:'#f7d9bd',warm:'#dcb08b',deep:'#a36e51'}[a.skin],hair={brown:'#674737',silver:'#d5dce7',black:'#28303f'}[a.hairColor],outline='#27313b',cloth=equipment.armor==='หนักฝึกหัด'?'#71838f':equipment.armor==='ผ้า'?'#475575':'#2e6966';
 ctx.save();ctx.translate(x,y);ctx.scale(size/100*flip,size/100);if(pose==='down'){ctx.rotate(-1.35);ctx.translate(30,0);}if(pose==='hit')ctx.rotate(Math.sin(t*30)*.08);ctx.translate(0,pose==='walk'?-Math.abs(stride)*3:Math.sin(t*2)*.7);
 const path=(d,color,stroke=outline)=>{const p=new Path2D(d);ctx.fillStyle=color;ctx.fill(p);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.stroke(p);}};
 const oval=(cx,cy,rx,ry,color)=>{ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();};
 const limb=(px,py,angle,fn)=>{ctx.save();ctx.translate(px,py);ctx.rotate(angle);fn();ctx.restore();};
 // Back hair and cape are independent layers.
 if(a.hair==='ponytail')path('M 8 -82 Q 31 -87 25 -58 Q 23 -48 14 -43 Q 22 -67 8 -72 Z',hair);
 path('M -14 -60 L 16 -60 L 22 -27 Q 0 -19 -22 -28 Z','#204c51');
 if(race==='cat')path('M 10 -26 Q 38 -19 27 -45 Q 43 -17 16 -13',hair);
 for(const side of [-1,1])limb(side*7,-25,side*stride*.38,()=>{path('M -5 0 L 5 0 L 5 18 L -4 18 Z',female?skin:'#39424b');path('M -5 12 L 6 12 L 7 26 L -6 26 L -7 22 Z','#614b3c');path('M -6 23 L 8 23 L 11 27 L -7 27 Z','#3d3632');path('M -5 14 L 6 14 L 6 17 L -5 17 Z','#b29b68');});
 path(female?'M -12 -59 Q -16 -46 -10 -34 L -15 -23 Q 0 -18 15 -23 L 10 -34 Q 16 -46 12 -59 Z':'M -15 -59 L 15 -59 L 13 -27 Q 0 -23 -13 -27 Z',cloth);
 path('M -7 -59 L 7 -59 L 9 -39 L -8 -39 Z','#eee2bd');
 path('M -17 -59 L -3 -63 L 0 -52 L -10 -44 Z',cloth);path('M 17 -59 L 3 -63 L 0 -52 L 10 -44 Z',cloth);
 path('M -14 -34 L 14 -34 L 14 -28 L -14 -28 Z','#6b4d36');path('M -3 -35 L 4 -35 L 4 -28 L -3 -28 Z','#d3b572');path('M -11 -55 L -6 -57 L 13 -31 L 9 -29 Z','#9a7850');
 const shield=()=>{path('M -12 0 Q 0 -8 12 0 L 11 20 Q 0 31 -11 20 Z','#b18a52');path('M -9 2 Q 0 -3 9 2 L 8 18 Q 0 26 -8 18 Z','#695341');path('M 0 3 L 4 12 L 0 22 L -4 12 Z','#dec17c');};
 const weapon=type=>{if(type==='bow'||type==='crossbow'){ctx.strokeStyle='#b38b55';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-20);ctx.quadraticCurveTo(21,1,0,26);ctx.stroke();ctx.strokeStyle='#e9dab6';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(0,26);ctx.stroke();if(type==='crossbow')path('M -10 -3 L 12 -3 L 12 2 L -10 2 Z','#71533b');}
 else if(type==='staff'||type==='holyStaff'){path('M -2 9 L 2 9 L 2 -35 L -2 -35 Z','#bb905a');oval(0,-37,6,7,'#70d8e5');oval(-1,-39,2,3,'#e8ffff');}
 else if(type==='axe'){path('M -2 10 L 2 10 L 2 -33 L -2 -33 Z','#936c43');path('M 0 -31 Q 19 -36 14 -19 L 0 -22 Z','#b9d2d9');}
 else if(type==='mace'){path('M -2 10 L 2 10 L 2 -24 L -2 -24 Z','#91683d');path('M -7 -21 L -7 -34 L 0 -38 L 7 -34 L 7 -21 Z','#b6c6cb');}
 else{const top=type==='spear'?-52:type==='dagger'?-20:-37;path(`M -2 10 L 2 10 L 2 -7 L -2 -7 Z`,'#755339');path(`M -3 -7 L -3 ${top+9} L 0 ${top} L 4 ${top+9} L 3 -7 Z`,'#c5dce1');path(`M 0 -7 L 0 ${top} L 4 ${top+9} L 3 -7 Z`,'#8aa8b5');path('M -8 -8 L 8 -8 L 8 -4 L -8 -4 Z','#d1b36c');}};
 for(const side of [-1,1])limb(side*15,-54,side===1?(pose==='cast'?-1.3:pose==='attack'?-1.8+attack*2.2:stride*-.3):pose==='guard'?.75:stride*.3,()=>{path('M -5 0 L 5 0 L 6 13 L -5 13 Z','#ece0bc');path('M -4 12 L 5 12 L 5 23 L -3 23 Z',skin);path('M -5 17 L 6 17 L 6 23 L -5 23 Z','#654e3c');oval(1,25,4,4,skin);ctx.translate(1,25);if(side===1)weapon(equipment.main||'sword');else if(equipment.off==='shield')shield();else if(equipment.off)weapon(equipment.off);});
 if(race==='elf'){path('M -15 -76 L -26 -82 L -18 -68 Z',skin);path('M 15 -76 L 26 -82 L 18 -68 Z',skin);}
 oval(0,-75,17,18,skin);path('M -18 -77 Q -23 -98 0 -98 Q 23 -98 18 -73 L 11 -83 L 4 -88 L -3 -79 L -6 -88 L -13 -77 Z',hair);
 if(a.hair==='bob')path('M -18 -83 L -20 -59 L -13 -63 L -14 -80 M 18 -83 L 20 -59 L 13 -63 L 14 -80 Z',hair);
 if(a.hair==='tousled')path('M -18 -86 L -24 -88 L -13 -92 L -17 -98 L -5 -95 L 2 -103 L 7 -96 L 18 -97 L 15 -90 Z',hair);
 if(!back){const ey=a.face==='sharp'?-75:-74;for(const side of [-1,1]){oval(side*7,ey,3.2,a.face==='bright'?4.2:3.5,'#faf6e8');oval(side*7+.6,ey,1.8,3,'#426b72');oval(side*7+.7,ey+.2,.9,2.3,'#182f3b');oval(side*7,ey-1.4,.7,.8,'white');}ctx.strokeStyle='#704b42';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(-3,-65);ctx.quadraticCurveTo(0,a.face==='bright'?-61:-64,3,-65);ctx.stroke();oval(-11,-68,3,1.2,'#d58c7d66');oval(11,-68,3,1.2,'#d58c7d66');}else oval(0,-77,16,15,hair);
 if(race==='cat'){path('M -16 -88 L -18 -103 L -7 -94 Z',hair);path('M 16 -88 L 18 -103 L 7 -94 Z',hair);}
 if(race==='dragonborn'){path('M -13 -92 Q -25 -105 -17 -109 L -7 -94 Z','#ddcfa9');path('M 13 -92 Q 25 -105 17 -109 L 7 -94 Z','#ddcfa9');}
 if(pose==='cast'){ctx.strokeStyle='#9debf0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(28,-65,12,5,t*2,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}
const api={defaults,choices,validate,draw};g.DecideCharacterModel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
