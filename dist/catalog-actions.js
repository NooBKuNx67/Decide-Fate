/* Explicit legacy catalog -> grid/2 AP action adapter. Original records stay intact. */
(function(g){'use strict';
const C=g.DecideCombatRules||(typeof require==='function'?require('./tactical-systems.js'):null),N=g.DecideCreation||(typeof require==='function'?require('./creation-data.js'):null),X=g.DecideCharacterCombat||(typeof require==='function'?require('./character-combat.js'):null);
const copy=x=>JSON.parse(JSON.stringify(x)),need=(ok,msg)=>{if(!ok)throw Error(msg);},specs={};
function add(kind,ids,spec){for(const id of ids.split(' '))specs[kind+':preset-'+kind+'-'+id]={...spec};}
add('spell','fire ice fire-ii ice-ii thunder thunder-ii arcane-missile holy-light smite',{effect:'damage',magic:true,range:4});
add('spell','meteor poison-cloud static-field radiant-burst',{effect:'damage',magic:true,range:4,all:true});
add('skill','power-strike quick-slash quick-strike',{effect:'damage',magic:false,range:1,weapons:['sword','dagger','axe','spear','mace','staff','unarmed']});
add('skill','cleave',{effect:'damage',magic:false,range:1,all:true,weapons:['sword','axe','mace']});
add('skill','precise-shot',{effect:'damage',magic:false,range:3,weapons:['bow','crossbow']});
add('skill','weapon-break',{effect:'damage',magic:false,range:1,status:'broken',weapons:['sword','axe','mace']});
add('skill','weaken',{effect:'damage',magic:true,range:4,status:'weaken'});
add('spell','heal',{effect:'heal',magic:true,range:3,healing:'2d6'});
add('spell','greater-heal',{effect:'heal',magic:true,range:3,healing:'4d6'});
add('skill','heal',{effect:'heal',magic:true,range:3,healing:'2d6'});
add('spell','cure',{effect:'cure',magic:true,range:3});
add('skill','empower',{effect:'empower',magic:true,range:3});
add('skill','iron-wall',{effect:'wall',magic:false,range:0,shield:true});
function key(r){return r.key||r.kind+':'+r.id;}
function dice(text){const m=/^\s*(\d{1,2})d(\d{1,3})(?:\s*([+-])\s*(\d{1,3}))?\s*$/i.exec(text||'');if(!m)return null;const d={n:+m[1],sides:+m[2],bonus:+(m[4]||0)*(m[3]==='-'?-1:1)};return d.n>0&&d.n<=20&&d.sides>=2&&d.sides<=100?d:null;}
function compile(r){const spec=specs[key(r)];if(!spec||r.enabled===false||r.activePassive==='Passive')return null;const cost=r.kind==='spell'?r.mpCost:(r.resourceCost?.trim()?(/^\d+\s*MP$/i.test(r.resourceCost.trim())?parseInt(r.resourceCost,10):NaN):0),cd=Number(r.cooldown||0);if(!Number.isInteger(cost)||cost<0||cost>1000||!Number.isInteger(cd)||cd<0||cd>100)return null;
const roll=spec.effect==='damage'?dice(r.damage):spec.healing?dice(spec.healing):null;if(['damage','heal'].includes(spec.effect)&&!roll)return null;
const stat=spec.effect==='heal'?'WIS':String(r.damageAbility||'').toUpperCase();if(spec.effect==='damage'&&!N.stats.includes(stat))return null;
// Reject edited mechanics that this explicit adapter cannot honor in full.
if(spec.effect==='damage'&&((r.statusEffects||[]).some(x=>x!==({broken:'Defense Down',weaken:'Attack Down'}[spec.status]))||Number(r.saveDC||0)!==0||Number(r.lifestealPct||0)!==0))return null;
const side=['heal','cure','empower','wall'].includes(spec.effect)?'ally':'enemy',id='catalog-'+r.kind+'-'+r.id;
const detail=spec.effect==='damage'?r.damage+' + '+stat+' modifier'+(spec.status?' • '+spec.status+' 2 เทิร์น':''):spec.effect==='heal'?spec.healing+' + WIS modifier HP':spec.effect==='cure'?'ล้าง Poison / Burn / Slow / Broken / Blind / Weaken / Silence':spec.effect==='empower'?'ดาเมจ +15% นาน 2 เทิร์น':'ลดดาเมจกายภาพ 50% และห้ามเดิน 1 เทิร์น • ต้องถือโล่';
return {id,key:key(r),name:String(r.displayName||r.name).slice(0,160),effect:spec.effect,magic:spec.magic,cost,cd,stat:stat||'WIS',roll,element:typeof r.element==='string'?r.element.slice(0,100):'',status:spec.status||null,weapons:spec.weapons||[],shield:!!spec.shield,power:spec.effect==='damage'?1:0,castPoints:1,targeting:{min:side==='ally'?0:1,max:spec.range,mode:spec.all?'all':'single',count:13,heights:[-2,-1,0,1,2],side},description:detail+' • '+(spec.all?'ศัตรูที่มองเห็นทั้งหมดในระยะ':'เลือกหนึ่งเป้าหมาย')+' • ใช้ 1 AP'};}
function support(r,details=true){if(!['skill','spell'].includes(r.kind))return '';if(r.enabled===false)return 'ปิดใช้งาน';if(r.id.startsWith('decide-')&&N.skills[r.id.slice(7)])return 'ใช้ต่อสู้ได้ • สกิลประจำคลาส';const a=compile(r);return a?(details?'ใช้ต่อสู้ได้ • '+a.description+' • '+a.cost+' MP · CD '+a.cd:'ใช้ต่อสู้ได้ • ศึกษาเพื่อดูรายละเอียด'):'ยังไม่รองรับในสนามต่อสู้';}
function validate(list){need(Array.isArray(list)&&list.length<=Object.keys(specs).length,'ข้อมูลวิชาในสนามไม่ถูกต้อง');const ids=new Set();for(const a of list){const spec=specs[a?.key];need(spec&&typeof a.id==='string'&&a.id==='catalog-'+a.key.replace(':','-')&&!ids.has(a.id),'วิชาในสนามไม่ถูกต้อง');ids.add(a.id);need(typeof a.name==='string'&&a.name.length<=160&&typeof a.description==='string'&&a.description.length<=1000&&Number.isInteger(a.cost)&&a.cost>=0&&a.cost<=1000&&Number.isInteger(a.cd)&&a.cd>=0&&a.cd<=100&&N.stats.includes(a.stat)&&typeof a.element==='string'&&a.element.length<=100,'ค่าวิชาในสนามไม่ถูกต้อง');need(a.effect===spec.effect&&a.magic===spec.magic&&a.status===(spec.status||null)&&a.shield===!!spec.shield&&JSON.stringify(a.weapons)===JSON.stringify(spec.weapons||[])&&a.castPoints===1&&a.power===(spec.effect==='damage'?1:0),'กลไกวิชาในสนามไม่ถูกต้อง');const side=['heal','cure','empower','wall'].includes(spec.effect)?'ally':'enemy';const targeting={min:side==='ally'?0:1,max:spec.range,mode:spec.all?'all':'single',count:13,heights:[-2,-1,0,1,2],side};need(a.targeting&&Object.entries(targeting).every(([k,v])=>JSON.stringify(a.targeting[k])===JSON.stringify(v)),'ระยะวิชาในสนามไม่ถูกต้อง');if(['damage','heal'].includes(a.effect))need(a.roll&&Number.isInteger(a.roll.n)&&a.roll.n>=1&&a.roll.n<=20&&Number.isInteger(a.roll.sides)&&a.roll.sides>=2&&a.roll.sides<=100&&Number.isInteger(a.roll.bonus)&&Math.abs(a.roll.bonus)<=999,'เต๋าวิชาไม่ถูกต้อง');else need(a.roll===null,'เต๋าวิชาไม่ถูกต้อง');}return copy(list);}
function prepare(e,s,rows){if(e.design!==1||e.catalogActions!==undefined)return;e.catalogActions=rows.filter(r=>s.learned.includes(key(r))).map(compile).filter(Boolean);validate(e.catalogActions);}
function list(e,p=C.hero(e)){return p.id==='hero'?e.catalogActions||[]:[];}
function definition(e,id){return list(e).find(a=>a.id===id)||N.skills[id];}
function random(e){let x=e.seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;e.seed=x>>>0;return e.seed/4294967296;}
function roll(e,d){let n=d.bonus;for(let i=0;i<d.n;i++)n+=1+Math.floor(random(e)*d.sides);return n;}
function note(e,text){e.log.unshift(text);e.log=e.log.slice(0,30);}
const oldCast=C.cast;
C.cast=function(e,id,ids,selected){if(!id?.startsWith('catalog-'))return oldCast(e,id,ids,selected);const before=copy(e);try{const p=C.hero(e),a=list(e,p).find(x=>x.id===id);need(e.design===1&&e.status==='active'&&a&&p.hp>0&&p.action>=1,'ยังไม่ได้เรียนวิชานี้หรือไม่มี AP');validate(e.catalogActions);need(!p.casting,'กำลังร่ายเวท ต้องปล่อยหรือยกเลิกก่อน');need(!p.effects.stun,'ติดสตัน');need(!a.magic||!p.effects.silence||p.unique==='silent','ติดใบ้ ใช้เวทไม่ได้');need(p.mana>=a.cost&&(p.cooldowns[id]||0)<=e.round,'MP ไม่พอหรือวิชายังติดคูลดาวน์');const w=p.catalogWeapon||N.weapons[p.main];need(!a.weapons.length||a.weapons.includes(w?.type),'อาวุธไม่ตรงเงื่อนไขวิชา');need(!a.shield||p.off==='shield','ต้องถือโล่');
const targets=a.effect==='wall'?[p]:C.tactical.targets(e,p,ids,a.targeting);need(targets.length,'ไม่มีเป้าหมายในระยะ');if(a.effect==='heal')need(targets.some(t=>t.hp<t.maxHp),'สุขภาพเต็มแล้ว');const curable=['poison','burn','slow','broken','blind','weaken','silence'];if(a.effect==='cure')need(targets.some(t=>curable.some(k=>t.effects[k]>0)),'ไม่มีสถานะที่ล้างได้');
p.action--;p.mana-=a.cost;p.cooldowns[id]=e.round+a.cd+(a.cd?1:0);
for(const t of targets){if(a.effect==='damage'){const base=Math.max(0,roll(e,a.roll)+Math.floor((X.amount(p,a.stat)-10)/2));const dealt=X.damage(e,p,t,1,{base,magic:a.magic,element:a.element||null,weapon:{element:a.element,elementDamage:0},area:a.targeting.mode==='all'});if(dealt>0&&t.hp>0&&a.status)X.applyStatus(e,t,a.status,2);}
else if(a.effect==='heal'){const hp=Math.max(1,roll(e,a.roll)+Math.floor((X.amount(p,'WIS')-10)/2)),gain=Math.min(hp,t.maxHp-t.hp);t.hp+=gain;note(e,t.name+' +'+gain+' HP');}
else if(a.effect==='cure'){for(const k of curable)t.effects[k]=0;note(e,t.name+' • ล้างสถานะ');}
else if(a.effect==='empower')t.effects.empower=Math.max(2,t.effects.empower||0);
else if(a.effect==='wall'){p.effects.wall=1;p.move=0;}}
note(e,p.name+' ใช้ '+a.name+' • 1 AP / '+a.cost+' MP');C.observe(e);return e;
}catch(err){for(const k of Object.keys(e))delete e[k];Object.assign(e,before);throw err;}};
const api={compile,support,validate,prepare,list,definition};g.DecideCatalogActions=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
