/* Pure tactical encounter rules. Provisional balance; no DOM or real-time clock. */
(function(scope){
'use strict';
const D=scope.EverTaleBattleData||(typeof require==='function'?require('./battle-data.js'):null);
const clone=x=>JSON.parse(JSON.stringify(x));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||a));
const jobs={warrior:['ฟันทรงพลัง','STR',1],rogue:['จู่โจมจุดอ่อน','DEX',1],mage:['กระสุนเวท','INT',3],priest:['แสงเยียวยา','WIS',2],ranger:['ยิงแม่นยำ','DEX',3],buffer:['ลดพลังศัตรู','CHA',2],alchemist:['ยาฟื้นกำลัง','INT',2],knight:['โล่กระแทก','CON',1]};
function log(e,t){e.log.unshift(t);e.log=e.log.slice(0,30);}
const living=e=>e.units.filter(u=>u.hp>0),hero=e=>e.units[0];
function distance(s,a,b){const x=D.index(a),y=D.index(b);return Math.abs(x%s.w-y%s.w)+Math.abs(Math.floor(x/s.w)-Math.floor(y/s.w));}
function sight(s,a,b){const ai=D.index(a),bi=D.index(b),ax=ai%s.w,ay=Math.floor(ai/s.w),bx=bi%s.w,by=Math.floor(bi/s.w),steps=Math.max(Math.abs(bx-ax),Math.abs(by-ay));for(let k=1;k<steps;k++){const t=k/steps,i=Math.round(ay+(by-ay)*t)*s.w+Math.round(ax+(bx-ax)*t),c=s.cells[i];if(!D.walkable(c)||c.object==='tree'||c.height>D.height(s,a)+(D.height(s,b)-D.height(s,a))*t+1)return false;}return true;}
function canHit(e,a,b,range=a.range){return a.hp>0&&b.hp>0&&a.side!==b.side&&distance(e.scene,a.n,b.n)<=range&&Math.abs(D.height(e.scene,a.n)-D.height(e.scene,b.n))<=(range>1?4:2)&&sight(e.scene,a.n,b.n);}
function ready(e){if(e.status!=='active')throw Error('การต่อสู้จบแล้ว');}
function create(scene,snapshot,monsters=[],id='encounter',roll=Math.random){
 scene=D.validate({v:1,scenes:[scene]}).scenes[0];const report=D.inspect(scene);if(report.issues.length)throw Error(report.issues.join(' / '));
 if(!snapshot.character||snapshot.dead||snapshot.event||snapshot.hp<20||snapshot.energy<15)throw Error('ต้องมีตัวละครที่ยังมีชีวิต สุขภาพอย่างน้อย 20 และพลังงาน 15 พร้อมจบอีเวนต์ก่อน');
 if(snapshot.ageStart+(snapshot.days+(snapshot.minute+120)/1440)/365>=snapshot.lifespan)throw Error('เวลาในชีวิตไม่พอสำหรับการเดินทาง 2 ชั่วโมง');
 const c=snapshot.character,job=jobs[c.job];if(!job)throw Error('อาชีพไม่ถูกต้อง');
 const player={id:'hero',side:'player',name:c.name,n:D.node(report.players[0]),hp:Math.min(100,snapshot.hp),maxHp:100,mana:snapshot.mp,maxMana:snapshot.maxMp,attack:Math.round(6+clamp(c.stats[job[1]],0,100)/2+clamp(c.level,1,100)),armor:c.job==='knight'?4:2,range:job[2],move:6,action:1,guard:false,weakened:false,job:c.job};
 const enemies=D.spawnEnemy(scene,roll).map((i,k)=>{const ref=monsters.find(m=>m.id===scene.cells[i].monster&&m.enabled!==false)||monsters.filter(m=>m.enabled!==false).sort((a,b)=>(Number(a.level)||1)-(Number(b.level)||1))[k%Math.max(1,monsters.filter(m=>m.enabled!==false).length)];return {id:'enemy-'+k,side:'enemy',name:String(ref?.displayName||ref?.name||'ผู้เฝ้าป่า').slice(0,100),n:D.node(i),hp:Math.round(clamp(ref?.hp||20+c.level*3,12,70)),maxHp:Math.round(clamp(ref?.hp||20+c.level*3,12,70)),mana:0,maxMana:0,attack:Math.round(3+clamp(ref?.str||8,1,24)/2),armor:1,range:1,move:4,action:1,guard:false,weakened:false,job:'monster'};});
 const e={v:1,id:String(id).slice(0,100),scene,units:[player,...enemies],status:'active',round:1,potions:2,used:[],loot:0,log:[]};log(e,'เข้าสู่ '+scene.name+' • เคลื่อนที่ 6 แต้ม และทำ 1 แอ็กชันต่อเทิร์น');return e;
}
function validate(input){
 if(!input||input.v!==1||typeof input.id!=='string'||!input.id||input.id.length>100||!['active','won','lost','retreated'].includes(input.status)||!Number.isInteger(input.round)||input.round<1||input.round>100000||!Array.isArray(input.units)||input.units.length<2||input.units.length>4)throw Error('ข้อมูลสนามต่อสู้ไม่ถูกต้อง');
 const e=clone(input);e.scene=D.validate({v:1,scenes:[e.scene]}).scenes[0];const ids=new Set(),positions=new Set();
 e.units.forEach((u,k)=>{if(!u||typeof u.id!=='string'||(!k&&u.id!=='hero')||ids.has(u.id)||typeof u.name!=='string'||u.name.length>100||u.side!==(k?'enemy':'player')||!Number.isInteger(u.n)||u.n<0||u.n>=e.scene.cells.length*2||!D.walkable(e.scene.cells[D.index(u.n)])||u.n%2&&(e.scene.cells[D.index(u.n)].object!=='tree'||!e.scene.cells[D.index(u.n)].climb))throw Error('ตำแหน่งตัวละครต่อสู้ไม่ถูกต้อง');ids.add(u.id);for(const key of ['hp','maxHp','mana','maxMana','attack','armor','range','move','action'])if(!Number.isFinite(u[key])||u[key]<0||u[key]>10000)throw Error('ค่าสถานะต่อสู้ไม่ถูกต้อง');if(u.hp>u.maxHp||u.maxHp<1||u.mana>u.maxMana||u.range<1||u.range>3||u.move>6||u.action>1||!Number.isInteger(u.move)||!Number.isInteger(u.action)||typeof u.guard!=='boolean'||typeof u.weakened!=='boolean'||(k?u.job!=='monster':!jobs[u.job]))throw Error('ค่าสถานะต่อสู้ไม่ถูกต้อง');if(u.hp>0){if(positions.has(u.n))throw Error('ตำแหน่งตัวละครซ้ำ');positions.add(u.n);}});
 if(!Number.isInteger(e.potions)||e.potions<0||e.potions>99||!Number.isFinite(e.loot)||e.loot<0||e.loot>100000||!Array.isArray(e.used)||e.used.length>10000||e.used.some(i=>!Number.isInteger(i)||i<0||i>=e.scene.cells.length)||new Set(e.used).size!==e.used.length||!Array.isArray(e.log)||e.log.length>30||e.log.some(t=>typeof t!=='string'||t.length>500))throw Error('ข้อมูลสัมภาระต่อสู้ไม่ถูกต้อง');
 const won=e.units.slice(1).every(u=>u.hp===0),lost=e.units[0].hp===0;if(e.status==='won'&&(!won||lost)||e.status==='lost'&&!lost||e.status==='active'&&(won||lost))throw Error('ผลการต่อสู้ไม่ตรงกับสนาม');return e;
}
function path(e,target,unit=hero(e)){return D.route(D.paths(e.scene,unit.n,living(e).filter(u=>u!==unit).map(u=>u.n)),target);}
function move(e,target){ready(e);const p=hero(e),route=path(e,target),cost=route.reduce((n,x)=>n+x.cost,0);if(!route.length||cost>p.move)throw Error('เดินไปช่องนี้ไม่ได้หรือแต้มเดินไม่พอ');p.n=target;p.move-=cost;log(e,'เดิน '+cost+' แต้ม');return route;}
function outcome(e){if(hero(e).hp<=0)e.status='lost';else if(e.units.slice(1).every(u=>u.hp<=0))e.status='won';}
function damage(e,a,b,power=1){const value=Math.max(1,Math.round(a.attack*power*(a.weakened ? 0.65 : 1))-b.armor-(b.guard?6:0));b.hp=Math.max(0,b.hp-value);log(e,a.name+' → '+b.name+' −'+value+' HP'+(b.hp===0?' • ล้มลง':''));outcome(e);return value;}
function attack(e,id,skill=false){ready(e);const p=hero(e),target=e.units.find(u=>u.id===id);if(p.action<1)throw Error('ใช้แอ็กชันแล้ว กดจบเทิร์น');if(skill&&p.mana<8)throw Error('มานาไม่พอ (8)');if(skill&&['priest','alchemist'].includes(p.job)){if(p.hp===p.maxHp)throw Error('สุขภาพเต็มแล้ว');p.hp=Math.min(p.maxHp,p.hp+28);p.mana-=8;p.action=0;log(e,jobs[p.job][0]+' • ฟื้น 28 HP');return;}
 if(!target||!canHit(e,p,target))throw Error('เลือกศัตรูในระยะและไม่มีสิ่งบัง');p.action=0;if(skill)p.mana-=8;damage(e,p,target,skill?(p.job==='buffer'?1.2:1.7):1);if(skill&&p.job==='buffer')target.weakened=true;if(skill&&p.job==='knight')p.guard=true;
}
function guard(e){ready(e);const p=hero(e);if(!p.action)throw Error('ใช้แอ็กชันแล้ว');p.action=0;p.guard=true;log(e,'ตั้งรับ • ลดความเสียหายจนถึงเทิร์นถัดไป');}
function potion(e){ready(e);const p=hero(e);if(!p.action||!e.potions||p.hp===p.maxHp)throw Error('ต้องมีแอ็กชัน ยาฟื้นฟู และสุขภาพไม่เต็ม');e.potions--;p.action=0;p.hp=Math.min(p.maxHp,p.hp+35);log(e,'ใช้ยาฟื้นฟู • +35 HP');}
function interact(e,i){ready(e);if(!Number.isInteger(i)||!e.scene.cells[i])throw Error('เลือกช่องวัตถุในสนาม');const p=hero(e),kind=e.scene.cells[i].object;if(!p.action||e.used.includes(i)||distance(e.scene,p.n,D.node(i))>1||Math.abs(D.height(e.scene,p.n)-e.scene.cells[i].height)>1)throw Error('ต้องอยู่ติดวัตถุและมีแอ็กชัน • ใช้ได้ครั้งเดียว');
 if(kind==='chest'){e.loot+=20;e.potions=Math.min(99,e.potions+1);log(e,'เปิดหีบ • พบ 20 เหรียญและยา 1 ขวด (รับเหรียญเมื่อชนะ)');}
 else if(['tent','campfire'].includes(kind)){p.hp=Math.min(p.maxHp,p.hp+20);p.mana=Math.min(p.maxMana,p.mana+10);log(e,'พักจุดค่าย • +20 HP / +10 มานา');}
 else if(['mushroom','redMushroom','flowers'].includes(kind)){e.potions=Math.min(99,e.potions+1);log(e,'เก็บวัตถุดิบ • ได้ยาฟื้นฟู 1 ขวด');}
 else if(['goldOre','rubyOre','crystal'].includes(kind)){e.loot+=12;log(e,'เก็บแร่ • +12 เหรียญเมื่อชนะ');}
 else throw Error('วัตถุนี้ยังใช้ไม่ได้');e.used.push(i);p.action=0;
}
function endTurn(e){ready(e);const p=hero(e);for(const enemy of e.units.slice(1).filter(u=>u.hp>0)){
 if(!canHit(e,enemy,p)){const paths=D.paths(e.scene,enemy.n,living(e).filter(u=>u!==enemy).map(u=>u.n));let best=null;for(const [n,cost] of paths.dist){if(canHit(e,{...enemy,n},p)&&(!best||cost<best.cost))best={n,cost};}
 if(best){let budget=enemy.move;for(const step of D.route(paths,best.n)){if(step.cost>budget)break;enemy.n=step.n;budget-=step.cost;}}}
 if(canHit(e,enemy,p))damage(e,enemy,p);else log(e,enemy.name+' เคลื่อนเข้าหาหรือรอเส้นทาง');enemy.weakened=false;if(e.status!=='active')break;
 }if(e.status==='active'){e.round++;p.move=6;p.action=1;p.guard=false;log(e,'เทิร์น '+e.round+' • ตาคุณ');}}
function retreat(e){ready(e);e.status='retreated';log(e,'ถอนตัวกลับที่พัก • ไม่ได้รับรางวัล');}
function reward(e){return e.status==='won'?{gold:15*e.units.slice(1).length+e.loot,xp:20*e.units.slice(1).length}:{gold:0,xp:0};}
function settle(snapshot){if(!snapshot.expedition||snapshot.expedition.status==='active')throw Error('ยังไม่มีผลการต่อสู้ให้รับ');const e=validate(snapshot.expedition),next=clone(snapshot),r=reward(e),p=hero(e);next.hp=e.status==='lost'?15:Math.max(1,p.hp);next.mp=Math.min(next.maxMp,p.mana);next.gold+=r.gold;next.earned+=r.gold;next.character.xp+=r.xp;const stat=jobs[next.character.job][1];while(next.character.xp>=next.character.level*50){next.character.xp-=next.character.level*50;next.character.level++;next.character.stats[stat]++;}next.expedition=null;return {snapshot:next,reward:r,status:e.status};}
const api={create,validate,path,move,attack,guard,potion,interact,endTurn,retreat,reward,settle,canHit,distance,jobs};scope.DecideCombatRules=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
