/* Position-free controller. Reuses saved encounter envelope and existing action/damage resolvers. */
(function(g,factory){const api=factory(pair=>g[pair[0]]||(typeof require==='function'?require('./'+pair[1]):null));g.DecideNarrativeCombat=api;if(typeof module!=='undefined')module.exports=api;})(typeof window==='undefined'?globalThis:window,function(get){
  'use strict';
  const C=get(['DecideCombatRules','tactical-systems']),X=get(['DecideCharacterCombat','character-combat']);
  const K=get(['DecideCombatContext','combat-context']),Z=get(['DecideStatusEffects','status-effects']);
  const N=get(['DecideCreation','creation-data']),Actions=get(['DecideCatalogActions','catalog-actions']);
  const Class=get(['DecideClassActionData','class-action-data']),Gear=get(['DecideCatalogEquipment','catalog-equipment']);
  const M=get(['DecideMonsterAI','monster-ai']),F=get(['DecideDisplacement','displacement']);
  const copy=x=>JSON.parse(JSON.stringify(x)),need=(v,m)=>{if(!v)throw Error(m);};
  const prefix='narrative-v1:';
  const is=e=>e?.design===1&&typeof e.id==='string'&&e.id.startsWith(prefix);
  const hidden=new Set(['fire','cleave','cry','step','trap','smoke','quagmire','backstab','protect','mark','steal']);
  function spatial(a,e,id){return !!(a.grid||a.hazard||F.active(a.displacement)||e.gridSkills?.[id]||e.hazardSkills?.[id]||F.active(F.config(e,id))||hidden.has(id)||a.targeting?.mode&&a.targeting.mode!=='single');}
  function adopt(snapshot,rows){
    const s=copy(snapshot),e=s.expedition;
    need(e&&e.design===1&&e.status==='active'&&e.round===1,'เริ่มโหมดบรรยายได้เฉพาะไฟต์ใหม่ของตัวละครปัจจุบัน');
    if(is(e))return s;
    e.id=(prefix+e.id).slice(0,100);
    if(s.catalogEquipment&&!e.catalogEquipmentApplied){Gear.applyEncounter(e,s,rows);e.catalogEquipmentApplied=true;}
    for(const pair of [['DecideMonsterAI','monster-ai'],['DecideMonsterPassives','monster-passives'],['DecideGridPatterns','grid-patterns'],['DecideStatusEffects','status-effects'],['DecideDisplacement','displacement'],['DecideGridHazards','grid-hazards']])get(pair).prepare(e,rows);
    Actions.prepare(e,s,rows);get(['DecideCatalogLoot','catalog-loot']).prepare(e,rows);
    e.log.unshift('โหมดบรรยาย • ไม่มีตำแหน่ง • ผู้เล่น 2 AP • ท่าที่พึ่งพื้นที่พักไว้');e.log=e.log.slice(0,30);
    C.validate(e);return s;
  }
  function random(e,label){let x=e.seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;e.seed=x>>>0;const value=e.seed/4294967296;K.add(e,{type:'random',label,value,seedAfter:e.seed});return value;}
  function endRound(e){
    need(e.status==='active','การต่อสู้จบแล้ว');e.detectPhase='enemy';
    for(const enemy of e.units.filter(u=>u.side==='enemy'&&u.hp>0)){
      if(e.status!=='active')break;
      enemy.action=1;
      if(Z.blocked(enemy)){enemy.action=0;continue;}
      const targets=e.units.filter(u=>u.side==='player'&&u.hp>0);
      if(!targets.length)break;
      let target=targets.find(u=>u.id===enemy.taunt);
      if(!target)target=random(e,'enemy-lowest-hp')<.5?[...targets].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id.localeCompare(b.id))[0]:targets[Math.floor(random(e,'enemy-target')*targets.length)];
      enemy.detected=targets.map(u=>u.id);enemy.aware=[...enemy.detected];
      const abilities=(enemy.monsterCombat?.actions||[]).filter(a=>!spatial(a,e,a.id)&&enemy.mana>=a.cost&&(enemy.cooldowns[a.id]||0)<=e.round&&(!a.magic||!enemy.effects.silence));
      if(abilities.length){const a=abilities[Math.floor(random(e,'enemy-skill')*abilities.length)];M.act(e,enemy,a.id,target.id);}
      else{enemy.action=0;X.damage(e,enemy,target);}
    }
    if(e.status==='active'){
      e.round++;e.detectPhase='player';
      for(const p of e.units.filter(u=>u.side==='player'&&u.hp>0)){p.action=2;p.guard=false;p.moved=false;p.moving=false;}
      X.tick(e);
      e.log.unshift('รอบ '+e.round+' • เลือกสมาชิกและการกระทำ');e.log=e.log.slice(0,30);
    }
  }
  function candidates(s,rows){
    const e=s.expedition;if(!is(e))return [];
    if(e.status!=='active')return [{id:'battle:settle',label:'รับผลการต่อสู้ / กลับเข้าเรื่อง',settle:true}];
    const p=C.hero(e),list=[];
    const add=(id,label,run)=>list.push({id:'battle:'+id,label,run});
    for(const u of e.units.filter(u=>u.side==='player'&&u.hp>0&&u.id!==p.id))add('select:'+u.id,'สั่งการ '+u.name,e=>C.selectUnit(e,u.id));
    add('end','จบรอบ / ให้ศัตรูทำการกระทำ',endRound);
    if(e.travelEvent?.allowRetreat!==false)add('retreat','ถอนตัว • ไม่รับรางวัล',e=>{need(C.hero(e).action>=1&&!Z.blocked(C.hero(e)),'ต้องมี 1 AP และไม่ติดสตัน');C.hero(e).action--;C.retreat(e);});
    if(p.action<1||Z.blocked(p))return list;
    if(p.casting)add('cancel','ยกเลิกการร่าย',e=>C.cancelCast(e));
    if(!p.casting){
      add('guard','ป้องกัน · 1 AP',e=>C.guard(e));
      if(e.potions&&p.hp<p.maxHp)add('potion','ใช้ยาพกพา · 1 AP',e=>C.potion(e));
      for(const t of e.units.filter(u=>u.side==='enemy'&&u.hp>0))for(const hand of ['main','off']){
        if(hand==='off'&&(!p.off||p.off==='shield'))continue;
        add('attack:'+hand+':'+t.id,(hand==='main'?'มือหลัก':'มือรอง')+' → '+t.name+' · 1 AP',e=>{const p=C.hero(e),ap=p.action;X.attack(e,t.id,{hand,stealth:0});p.action=ap-1;});
      }
      const Effects=get(['DecideCatalogItemEffects','catalog-item-effects']);
      for(const item of rows.filter(r=>r.kind==='item'&&r.enabled!==false&&(s.catalogInventory?.items||[]).includes(r.name)&&Effects.supported(r)&&Effects.mode(r)!=='smoke')){
        list.push({id:'battle:item:'+item.id,label:'ใช้ '+(item.displayName||item.name)+' · 1 AP',item:item.id});
      }
    }
    for(const id of [...(p.skills||[]),...Actions.list(e,p).map(a=>a.id)]){
      const a=Actions.list(e,p).find(a=>a.id===id)||Class.definition(e,id);
      if(!a||a.enabled===false||spatial(a,e,id)||p.casting&&p.casting.id!==id)continue;
      const side=a.targeting?.side||'enemy';
      const targets=a.effect==='wall'?[p]:e.units.filter(t=>t.hp>0&&(side==='both'||(side==='ally')===(t.side===p.side)));
      for(const t of targets)add('cast:'+id+':'+t.id,a.name+' → '+t.name+' · '+a.cost+' MP',e=>C.cast(e,id,[t.id]));
    }
    if(e.chapterSpell&&p.id==='hero'&&!p.casting)for(const t of e.units.filter(u=>u.side==='enemy'&&u.hp>0))add('chapter-spell:'+t.id,'ประกายชำระ → '+t.name+' · 12 MP',e=>C.spell(e,t.id));
    return list;
  }
  function execute(s,rows,command,capture=false){
    if(command.settle){const result=C.settle(s);return {snapshot:result.snapshot,receipt:{type:'settlement',status:result.status,reward:result.reward}};}
    if(command.item){const result=get(['DecideCatalogEconomy','catalog-economy']).useInCombat(s,rows,command.item);return {snapshot:result.snapshot,receipt:{type:'item',result:result.result}};}
    const next=copy(s),e=next.expedition;
    let receipt;
    K.withoutPositions(e,()=>{if(capture)receipt=K.capture(e,()=>command.run(e));else command.run(e);});
    C.validate(e);if(receipt)receipt.command={id:command.id,label:command.label};return {snapshot:next,receipt};
  }
  function commands(s,rows){return candidates(s,rows).filter(command=>{try{execute(s,rows,command);return true;}catch{return false;}}).map(({id,label})=>({id,label}));}
  function apply(s,rows,id){const command=candidates(s,rows).find(a=>a.id===id);need(command,'ท่านี้ไม่พร้อมหรือยังไม่รองรับในโหมดบรรยาย');return execute(s,rows,command,true);}
  function summary(receipt){
    if(!receipt)return '';
    if(receipt.type==='settlement')return 'ผลการต่อสู้: '+receipt.status+' • รับ '+receipt.reward.gold+' เหรียญ / '+receipt.reward.xp+' EXP';
    if(receipt.type==='item')return receipt.result.message;
    const lines=[];
    for(const after of receipt.after){const before=receipt.before.find(u=>u.id===after.id);if(!before)continue;const hp=after.hp-before.hp,mp=after.mp-before.mp,ap=after.ap-before.ap;if(hp||mp||ap)lines.push(after.name+': HP '+before.hp+' → '+after.hp+', MP '+before.mp+' → '+after.mp+', AP '+before.ap+' → '+after.ap);}
    if(receipt.events.some(e=>e.type==='miss'))lines.push('มีการโจมตีที่เป้าหมายหลบได้');
    return lines.join('\n')||'เอนจินบันทึกการกระทำแล้ว';
  }
  return {is,adopt,commands,apply,summary};
});
