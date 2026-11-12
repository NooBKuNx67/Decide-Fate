/* Story presentation. AI may propose allowed IDs; only a confirmed engine command mutates s. */
(function () {
  'use strict';
  const Story=DecideStory, DM=DecideLocalDM, Combat=DecideNarrativeCombat;
  const el=(tag,text,parent)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(parent)parent.append(node);return node;};
  const section=el('section');section.id='storyScreen';section.hidden=true;section.className='story-screen';
  section.innerHTML='<header class="story-heading"><div><p class="story-eyebrow">DECIDE FATE · LOCAL DM</p><h1>เรื่องราวของคุณ</h1></div><div class="story-toolbar"><button id="storyGear">อุปกรณ์ / JRPG</button><button id="storyClassic">รายละเอียดตัวละคร</button><button id="storyBack">เมนูหลัก</button></div></header><div class="story-layout"><aside id="storyParty" class="story-party"></aside><article class="story-reading"><p id="storyLocation" class="story-eyebrow"></p><div id="storyTruth" class="story-truth"></div><details id="storyReceipt" hidden><summary>ใบสรุปผลจากเอนจิน</summary><pre id="storyReceiptData"></pre></details><div id="storyTranscript" role="log" aria-live="polite"></div><form id="storyForm"><label for="storyInput">คุณอยากพูดหรือทำอะไร?</label><textarea id="storyInput" maxlength="1200" rows="3" placeholder="เช่น ถามลินว่าเธอรู้อะไรเกี่ยวกับป่า"></textarea><div class="story-toolbar"><button id="storySend" type="submit">คุยกับ DM</button><button id="storyCancel" type="button">หยุดรอ AI</button></div></form><p id="storyStatus" role="status"></p><h2>การกระทำที่ทำได้ตอนนี้</h2><p class="story-help">DM แนะนำได้ คุณเป็นผู้เลือกและยืนยันผลกับเกม</p><div id="storyActions" class="story-actions"></div><div id="storyConfirm" hidden><p id="storyConfirmText"></p><button id="storyApply">ยืนยันการกระทำ</button><button id="storyReject">ยกเลิก</button></div><details><summary>ข้อมูลจากฐานข้อมูลที่ DM ใช้อ้างอิง</summary><div id="storySources"></div></details></article></div><details id="storySettings" class="story-settings"><summary>ตั้งค่า Local AI / วิธีเริ่มใช้</summary><p>แนะนำ LM Studio: ดาวน์โหลดโมเดล instruct 7–8B แบบ Q4 เปิด Local Server แล้วใส่ชื่อโมเดลตามที่โปรแกรมแสดง หากมีตัวเลือก CORS ให้เปิดสำหรับต้นทางเกมนี้ เกมใช้ข้อความสำรองได้เมื่อ AI ไม่พร้อม</p><label>โปรแกรม<select id="storyProvider"><option value="lm">LM Studio</option><option value="ollama">Ollama</option></select></label><label>Endpoint<input id="storyEndpoint" value="http://127.0.0.1:1234/v1" spellcheck="false"></label><label>ชื่อโมเดล<input id="storyModel" placeholder="ชื่อโมเดลที่โหลดในโปรแกรม" maxlength="160" spellcheck="false"></label><button id="storySaveSettings">บันทึกการตั้งค่าบนเครื่องนี้</button><p>LM Studio ปกติใช้ port 1234; Ollama ใช้ 11434/v1 และต้องอนุญาต origin ของเกมใน OLLAMA_ORIGINS แล้วเปิดโปรแกรมใหม่ การตั้งค่านี้ไม่ส่งรหัสผ่านหรือเซฟทั้งไฟล์ให้โมเดล ส่วนล็อกอินเกมยังใช้อินเทอร์เน็ต</p></details>';
  document.querySelector('main').insertBefore(section,$('globalStatus'));
  const menu=el('button');menu.id='storyMenu';menu.innerHTML='<span>DM</span><strong>เล่นแบบเล่าเรื่อง</strong><small>พูดคุยกับ Local AI · เลือกการกระทำ · จัดอุปกรณ์</small>';
  $('menuScreen').querySelector('.menu-grid').before(menu);
  let controller=null, epoch=0, account=null, transcript=[], pending=null, startAfterCreation=false, latest=null, demo=null, receipt=null;
  const snapshot=()=>demo?.state || s;
  const database=()=>demo?.db || DB;
  const key=()=> 'decide-fate-local-dm:'+(uid || 'none');
  function cancel(){epoch++;controller?.abort();controller=null;$('storySend').disabled=false;}
  function reset(){cancel();account=null;transcript=[];pending=null;latest=null;demo=null;receipt=null;startAfterCreation=false;$('storyInput').value='';$('storyConfirm').hidden=true;}
  function settings(){return DM.settings({endpoint:$('storyEndpoint').value,model:$('storyModel').value});}
  function loadSettings(){let v={};try{v=JSON.parse(localStorage.getItem(key()) || '{}');}catch{}$('storyEndpoint').value=v.endpoint || 'http://127.0.0.1:1234/v1';$('storyModel').value=v.model || '';}
  function line(who,body){transcript.push({who,body});transcript=transcript.slice(-16);drawTranscript();}
  function drawTranscript(){const root=$('storyTranscript');root.replaceChildren();for(const item of transcript){const p=el('section',undefined,root);p.className='story-line';el('strong',item.who,p);el('p',item.body,p);}}
  function sources(bundle){const root=$('storySources');root.replaceChildren();for(const row of bundle.references){const p=el('p',undefined,root);el('strong',row.name+(row.present?' · อยู่ในฉาก':' · ข้อมูลอ้างอิง'),p);el('small',row.key,p);}el('p','ค้นพบ '+bundle.retrieval.matches+' รายการ ส่ง '+bundle.retrieval.included+(bundle.retrieval.truncated?' (จำกัดเฉพาะรายการเกี่ยวข้อง)':''),root);}
  function choose(id,label){cancel();pending={id,label,revision:Story.revision(snapshot(),database()),demo:!!demo};$('storyConfirmText').textContent='ยืนยัน: '+label;$('storyConfirm').hidden=false;$('storyConfirm').scrollIntoView({block:'nearest'});}
  function draw(){
    if(!uid || !snapshot().character)return;
    if(account!==uid){cancel();transcript=[];pending=null;account=uid;loadSettings();}
    const state=snapshot(),db=database();
    latest=Story.facts(state,db,$('storyInput').value);
    const party=$('storyParty');party.replaceChildren();const c=state.character;
    if(c.images?.icon){const img=el('img',undefined,party);img.src=c.images.icon;img.alt=c.name;}
    el('h2',c.name,party);el('p','Lv. '+c.level+' · '+c.job,party);const hero=state.expedition?.units.find(u=>u.id==='hero');el('p','HP '+(hero?.hp??state.hp)+' · MP '+(hero?.mana??state.mp),party);el('p',state.gold+' เหรียญ',party);
    if(state.adventure?.companion)el('p','ลิน · HP '+state.adventure.companion.hp,party);
    for(const member of latest.party)el('p',member.name,party);
    if(state.expedition){el('h2','ในสนาม',party);for(const u of state.expedition.units)el('p',(state.expedition.active===u.id?'▶ ':'')+u.name+' · HP '+u.hp+'/'+u.maxHp,party);}
    $('storyReceipt').hidden=!receipt;$('storyReceiptData').textContent=receipt?JSON.stringify(receipt,null,2):'';
    $('storyLocation').textContent=(demo?'สนามทดสอบแยกเซฟ · ':'')+(latest.scene.location?.name || 'ระหว่างเดินทาง');
    $('storyTruth').textContent=Story.fallback(latest);
    const actions=$('storyActions');actions.replaceChildren();
    for(const command of latest.actions){const b=el('button',command.label,actions);b.dataset.storyAction=command.id;b.onclick=()=>choose(command.id,command.label);}
    if(state.expedition&&!Combat.is(state.expedition)){const b=el('button','เล่นการต่อสู้ที่บันทึกไว้ต่อ',actions);b.id='storyResume';b.onclick=()=>{if(demo){$('storyStatus').textContent='สถานการณ์นี้ทดสอบการเล่าเรื่องเท่านั้น';return;}EverTaleCombat.launch();};}
    if(DecideWorldLinks.pending(state)?.service){const b=el('button','เปิดบริการของ NPC',actions);b.onclick=()=>{if(!demo){const service=DecideWorldLinks.pending(s).service;DecideCatalogServices.openFor(service.npcId,service.type);}};}
    $('storyGear').disabled=!!demo;$('storyClassic').disabled=!!demo;
    el('h2','สกิลที่เรียน',party);for(const key of latest.learned){const row=R.records(db).find(r=>r.key===key);el('p',row?.displayName||row?.name||key,party);}
    el('h2','สัมภาระ',party);
    for(const item of latest.inventory)el('p',item.name+(item.quantity?' ×'+item.quantity:''),party);
    el('p','ยาพกพา '+latest.supplies.potions+' · วัตถุดิบ '+latest.supplies.reagents,party);
    const equipped=DecideCatalogEquipment.read(state);
    el('h2','อุปกรณ์ที่ใส่',party);
    for(const [slot,ref] of Object.entries(equipped.slots)){const row=DecideCatalogEquipment.row(ref,R.records(db));el('p',DecideCatalogEquipment.slots[slot]+': '+(row?.displayName||ref?.name||'ว่าง'),party);}
    sources(latest);drawTranscript();
  }
  function open(){demo=null;receipt=null;if(!s.character){startAfterCreation=true;openCreate(false);return;}show('storyScreen');}
  menu.onclick=open;
  $('storyBack').onclick=()=>{cancel();demo=null;show('menuScreen');};
  $('storyClassic').onclick=()=>{cancel();show('gameScreen');};
  $('storyGear').onclick=()=>{cancel();show('gameScreen');$('equipmentWindow').open=true;DecideEquipmentUI.draw();$('equipmentWindow').scrollIntoView({block:'start'});};
  $('storyProvider').onchange=()=>{$('storyEndpoint').value=$('storyProvider').value==='ollama'?'http://127.0.0.1:11434/v1':'http://127.0.0.1:1234/v1';};
  $('storySaveSettings').onclick=()=>{try{localStorage.setItem(key(),JSON.stringify(settings()));$('storyStatus').textContent='บันทึกการตั้งค่าแล้ว';}catch(e){$('storyStatus').textContent=e.message;}};
  $('storyReject').onclick=()=>{pending=null;$('storyConfirm').hidden=true;};
  $('storyApply').onclick=async()=>{try{
    if(!pending || pending.demo!==!!demo)throw Error('เลือกการกระทำใหม่ก่อน');
    const chosen=pending;pending=null;$('storyConfirm').hidden=true;cancel();
    if(Story.revision(snapshot(),database())!==chosen.revision)throw Error('สถานการณ์เปลี่ยนแล้ว โปรดเลือกการกระทำใหม่');
    let next;
    if(Combat.is(snapshot().expedition)){const result=Combat.apply(snapshot(),R.records(database()),chosen.id);next=result.snapshot;receipt=result.receipt;}
    else{next=Story.apply(snapshot(),database(),chosen.id,chosen.revision);receipt=null;}
    const clean=R.validate(next,database());
    if(demo)demo.state=clean;else{s=clean;save();}
    line('ผลจากเอนจิน',chosen.label+' • สำเร็จ'+(receipt?'\n'+Combat.summary(receipt):''));draw();
    $('storyStatus').textContent=demo?'ผลจำลอง ไม่บันทึกลงเซฟผู้เล่น':'บันทึกผลการกระทำแล้ว';
    if(!demo&&s.expedition&&!Combat.is(s.expedition))EverTaleCombat.launch();
    if(settings().model){
      const ticket=epoch,owner=uid,isDemo=!!demo,fingerprint=Story.revision(snapshot(),database());
      const facts=Story.facts(snapshot(),database());facts.actions=[];facts.lastAction=receipt;facts.confirmedAction=chosen.label;
      controller=new AbortController();
      try{
        const answer=Story.decode(await DM.completion(settings(),facts,'บรรยายเฉพาะผลที่เอนจินยืนยันแล้ว ห้ามเสนอหรือดำเนินการเพิ่ม',{signal:controller.signal}),facts);
        if(ticket===epoch&&uid===owner&&isDemo===!!demo&&screen==='storyScreen'&&fingerprint===Story.revision(snapshot(),database()))line('DM · ผลที่เกิดขึ้น',answer.text);
      }catch(error){if(ticket===epoch)$('storyStatus').textContent='บันทึกผลแล้ว • ใช้ผลจากเอนจินแทนคำบรรยาย AI';}
      finally{if(ticket===epoch)controller=null;}
    }

  }catch(e){$('storyStatus').textContent=e.message;draw();}};
  $('storyCancel').onclick=()=>{cancel();$('storyStatus').textContent='หยุดรอแล้ว เลือกการกระทำของเกมต่อได้';};
  $('storyForm').onsubmit=async event=>{
    event.preventDefault();cancel();const ticket=epoch,owner=uid,isDemo=!!demo;
    const utterance=$('storyInput').value.trim() || 'บรรยายสถานการณ์และเสนอทางเลือก';
    const fingerprint=Story.revision(snapshot(),database()),bundle=Story.facts(snapshot(),database(),utterance);
    if(receipt)bundle.lastAction=JSON.parse(JSON.stringify(receipt));
    sources(bundle);line('คุณ',utterance);$('storyStatus').textContent='กำลังคุยกับ Local DM… คุณยังเลือกการกระทำของเกมได้';$('storySend').disabled=true;
    controller=new AbortController();
    try{
      const answer=Story.decode(await DM.completion(settings(),bundle,utterance,{signal:controller.signal}),bundle);
      if(ticket!==epoch||uid!==owner||isDemo!==!!demo||screen!=='storyScreen'||Story.revision(snapshot(),database())!==fingerprint)return;
      line('Local DM · คำบรรยาย',answer.text);
      if(answer.actionIds.length===1){const proposed=bundle.actions.find(a=>a.id===answer.actionIds[0]);choose(proposed.id,proposed.label);}
      const actions=$('storyActions');for(const id of answer.actionIds){const action=bundle.actions.find(a=>a.id===id),b=el('button','DM แนะนำ: '+action.label,actions);b.dataset.dmSuggested=id;b.onclick=()=>choose(id,action.label);}
      $('storyStatus').textContent='DM อ้างอิง '+answer.sourceIds.length+' รายการ • ยังไม่มีผลต่อเกมจนกดยืนยัน';
    }catch(error){
      if(ticket===epoch&&uid===owner&&isDemo===!!demo&&screen==='storyScreen'&&Story.revision(snapshot(),database())===fingerprint){line('ผู้บรรยายสำรอง',Story.fallback(bundle));$('storyStatus').textContent='ใช้ข้อความจากเกม: '+(error.name==='AbortError'?'Local AI ตอบไม่ทัน':error.message);}
    }finally{if(ticket===epoch){controller=null;$('storySend').disabled=false;}}
  };
  window.addEventListener('evervale-save',()=>{if(startAfterCreation&&s.character){startAfterCreation=false;setTimeout(()=>show('storyScreen'),0);}else if(controller)cancel();});
  window.addEventListener('evervale-content-save',()=>{cancel();if(screen==='storyScreen')draw();});
  // A separate test entry uses the production context/commands/client on disposable state.
  const test=el('button','ทดสอบ DM / ฐานข้อมูล / ข้อความสำรอง');test.id='storyLab';$('combatLabScreen').querySelector('header')?.append(test);
  if(!test.parentElement)$('combatLabScreen').prepend(test);
  test.onclick=()=>{
    cancel();const state=R.fresh();R.createCharacter(state,'ผู้ทดสอบเรื่องราว','human','warrior',DB,DecideCreation.recommend(DecideCreation.draft()));
    demo={state,db:{...DB,overrides:JSON.parse(JSON.stringify(DB.overrides || {}))}};transcript=[];pending=null;show('storyScreen');
  };
  const combatTest=el('button','ทดสอบต่อสู้แบบบรรยาย / ผลคำนวณ');combatTest.id='storyCombatLab';test.after(combatTest);
  combatTest.onclick=()=>{
    test.onclick();
    for(const id of ['chapter:accept','chapter:recruit','chapter:travel:forest','chapter:battle:forest']){
      demo.state=Story.apply(demo.state,demo.db,id,Story.revision(demo.state,demo.db));
    }
    receipt=null;draw();
  };
  window.DecideStoryUI={open,draw,reset,leave:cancel};
})();
