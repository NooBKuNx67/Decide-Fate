# ตรวจความเป็นไปได้ของทิศทาง Decide Fate

11 พฤศจิกายน 2026 — source baseline d254a51; AUDIT เท่านั้น ไม่แตะข้อมูลบัญชีจริง ไม่แก้เกม/schema/เทสต์/workflow ไม่เผยแพร่

อ่าน README.md, AGENTS.md, GAME-READINESS.md, HANDOFF.md, WORLD-DATABASE-FIELDS.md และข้อตกลงเดิมประกอบ หลักฐานด้านล่างอ้าง source ใน checkout นี้ ไม่ใช่เว็บ production

VERIFIED = อ่านโค้ดโดยตรงหรือรันสาธิตแล้ว; INFERRED = ข้อเสนอ/ประเมินจากโค้ด; NOT VERIFIED = ยังไม่ได้ทดลองจริง ไม่ใช่การรับรอง

## A ท่อดาเมจ — เสร็จในขอบเขตที่ระบุ

**VERIFIED: เกราะที่สวมจริงมีผลอยู่แล้ว** เบาะแสที่ดูเฉพาะ character-combat.init ไม่ครบท่อ: catalog-equipment.applyEncounter แทนฐานเกราะคลาสเมื่อสวมเกราะ catalog และรวม defense อุปกรณ์อื่นเข้า unit.armor (dist/catalog-equipment.js:13,20) ไม่ควรเขียนระบบเกราะซ้ำ

### เส้นทางจริง

1. dist/combat.js:63 ปุ่ม combatAttack → action ที่บรรทัด 61 → C.attack; action บันทึกและวาดหลังคำนวณ
2. dist/tactical-systems.js:40 ครอบ C.attack: เลือกมือ/รูปอาวุธ/เป้าหมาย ตรวจระยะและพื้นที่ → old.attack; use ที่บรรทัด 32 จัด AP และ atomic rollback
3. dist/combat-data.js:38 ส่ง encounter design=1 ไป X.attack; รุ่นเก่าใช้สูตรเดิมบรรทัด 37–39
4. dist/character-combat.js:28 attack ตรวจพร้อม/visible/canHit/stealth/มือรอง → damage บรรทัด 16–23 (เลขบรรทัดของไฟล์อัดยาว ครอบหลายขั้นในบรรทัดเดียว)
5. damage ตรวจสิทธิ์เป้าหมาย → โอกาสโดน → base → ธาตุ/เกราะ/ลดเสียหาย/critical → barrier/รับแทน/resistance → b.hp=max(0,b.hp-value) → log/loot/ผลแพ้ชนะ
6. dist/combat.js:65 ปุ่มกลับเรียก C.settle(s) แล้วแทน snapshot/save; การลด HP ในไฟต์ไม่ใช่การแจกเงิน/EXP ทันทีทั้งหมด

### สูตรของ design=1 (ไม่ใช่สูตรเดียวสำหรับทุกคำสั่ง)

VERIFIED — dist/character-combat.js:11–23:

- A(stat)=floor(stat×(1+โบนัสกลางคืน/กินเลือด/ร่างตามชนิด)); โบนัส STR/DEX จาก gear ถูกใส่ใน unit.stats ก่อนแล้ว
- อาวุธ catalog: base=ผลรวมเต๋า+bonus ของเต๋า หรือ weapon.power + A(weapon.stat)/2 + level + gearBonuses.attack
- อาวุธฝึก: power ใช้ค่าพลังคงที่; magic fallback=6+A(INT หรือ WIS)/2+level ไม่บวก gear attack แบบเดียวกัน
- catalog skill/spell ที่มี roll ใช้ base=max(0,ผลเต๋าของท่า+floor((A(stat)-10)/2)); ไม่ใช่ทุกเวท/ท่าบวกอาวุธและเลเวล (dist/catalog-actions.js:52,58; character-combat.js:cast)
- base อาจคูณ monster passive attackPercent; raw=(base+elementDamage)×mult×weaken(0.85)×empower(1.15)
- critical เฉพาะ non-area: โอกาส clamp(0.05+critRate/100,0,0.95), เพิ่ม mult ×1.5; stealth/mark/พลังท่าอาจเพิ่ม mult ด้วย
- armorEffective=armor สำหรับกายภาพ; เวทใช้ floor(armor/2); broken ลดเกราะกายภาพเหลือ 85%; rogue โจมตีหลังลดอีก 10%
- หลังปรับธาตุ: V=max(1,round((elementTotal-armorEffective-flatReduction)×(1-min(0.6,reduction))))
- guard ลด 30% หรือ knight ถือ shield 40%; warrior ลดประสิทธิผล guard; wall/earth เพิ่ม reduction ตามโค้ด
- barrier ดูดซับ → ผู้ protect ที่อยู่ใกล้รับแทน 30% → gear resistance ลดเป็นเปอร์เซ็นต์สูงสุด 90% → หัก HP
- ดังนั้น **เกราะเป็นค่าหักคงที่** ส่วน guard/resistance เป็นเปอร์เซ็นต์แยกชั้น ดาเมจขั้นกลางขั้นต่ำ 1 แต่สุดท้ายเป็น 0 ได้จาก immunity/barrier/resistance หรือพลาด ไม่ใช่ขั้นต่ำ 1 ทุกกรณี
- Legacy design ไม่ใช่ 1: max(1,round(attack×power×(weakened?0.65:1))-armor-(guard?6:0)); ไม่มีการทอยโดน/critical ใน damage รุ่นนี้ (combat-data.js:37)

### ปัจจัยและที่มา

| ปัจจัย | แหล่ง | ใช้จริง | หลักฐาน VERIFIED |
|---|---|---|---|
| พลัง/เต๋าอาวุธ | catalog-equipment.weapon → catalogWeapon/off | ใช่; ฝึกใช้ power; ท่าที่ส่ง base แทนใช้เต๋าท่า | catalog-equipment.js:9–10; character-combat.js:13–17 |
| STR/DEX/INT/WIS | character stats + gear + form | ใช่ ตามสูตรคำสั่ง | character-combat.js:11–14; catalog-actions.js:58 |
| เลเวล | unit.level | บางส่วน; weapon/power มี ท่าที่ส่ง base ไม่จำเป็นมี | character-combat.js:13–17 |
| attack/STR/DEX gear | passive parser รวมทุก slot | ใช่ แต่ไม่ใช่เพิ่มให้ทุก spell | catalog-equipment.js:13,20; legacy-equipment.js:13 |
| เกราะประเภทคลาส | ผ้า1/เบา2/กลาง3/หนักฝึกหัด4 | ใช่ เป็นฐานเมื่อไม่มี catalog armor | character-combat.js:10; catalog-equipment.js:20 |
| เกราะที่สวม | armor.defense + passive defense | ใช่; ใส่ catalog armor ทำฐานคลาสเป็น 0 ก่อนรวม | catalog-equipment.js:13,20 |
| หมวก/รองเท้า/ผ้าคลุม | non-weapon defense + passive | ใช่ถ้า record เปิดใช้และไม่ใช่ training | catalog-equipment.js:13 |
| โล่ | catalog armor ช่องซ้าย defense/passive | ใช่; โล่ฝึก defense=0 แต่มีผล guard | catalog-equipment.js:7,13; character-combat.js:18 |
| เครื่องประดับ 4 ช่อง | defense และ passive ที่ parser รองรับ | บางส่วน; คำบรรยายอิสระไม่เท่ากับโบนัส | catalog-equipment.js:13; legacy-equipment.js |
| ธาตุ/ภูมิคุ้มกัน | อาวุธ/ท่า/ร่าง + target immunities/weakness | ใช่ก่อนหักเกราะ; immunity เป็น 0 | character-combat.js:18 |
| สถานะ | effects/statusMeta และ after-hit config | ใช่ทั้งแก้สูตร/บล็อก/ลดต่อรอบ | character-combat.js:16–23; status-effects.js:12–13 |
| critical | 5% + gear critRate | ใช่ non-area; log ไม่บอก roll/critical แยกครบ | character-combat.js:18 |
| มอนสเตอร์ ATK/DEF | starter fallback แล้ว MonsterStats.initialize/adjustments | บางส่วนตาม adapter; initialize ตั้ง armor=0 และใช้ damageReduction/magicDefense แทน | combat-data.js:23; monster-stats.js:5–6; combat.js:20 |

### โอกาสโดนและสุ่ม

VERIFIED — character-combat.js:16: ใช้ rng(e) < clamp(accuracy,0.20,0.99), **ไม่ใช่ d20 โจมตี** ค่า accuracy เริ่ม .85 บวก weapon attackBonus×.05 (กายภาพ), DEX ของผู้โจมตี .12×DEX/(DEX+30) หรือ .05, opt.accuracy, monster adjustments/passives, ranger ยืนนิ่ง/grade; หัก target evasion/physical defense, blind .15 และ dodge

Dodge ใช้ DEX เป้าหมาย .12×DEX/(DEX+50), cat .05, foresight เมื่อเห็นผู้โจมตีและไม่ใช่ area .10, wind .10 (ตรวจเงื่อนไขจาก source) การมองเห็น/ตำแหน่งจึงยังเข้ามาแม้ใน damage

VERIFIED — มี **d20 ใน saving throw สถานะ** ที่ status-effects.js:13 ไม่ใช่ hit roll; detection ใช้ d100/seed อีกชุดใน tactical-systems.js:14,21 เป็นต้นไป

VERIFIED — rng xorshift32 แก้ e.seed (character-combat.js:8); ตัวละครใหม่เริ่ม seed จาก encounter ID (บรรทัด 10) ทำซ้ำได้เมื่อ snapshot/ลำดับคำสั่ง/seed เหมือนเดิม แต่ free encounter ใช้ crypto.randomUUID และ Math.random ตอนสร้าง (combat.js:20); chapter ใช้ seed ของบท (adventure-data.js:24) จึงห้ามอ้างว่าใส่ seed เดียวอย่างเดียวจะทำซ้ำทั้งทุกทางเข้าได้

VERIFIED — rollWeapon เก็บเพียงผลรวม ไม่เก็บแต่ละลูก; hit/critical ใช้ค่าที่สุ่มแล้วทิ้ง เหลือ seed ปลายทางและข้อความ log จำกัด 30 รายการ (character-combat.js:7–8,13,16–23) บาง status/detection มีตัวเลขทอยในข้อความ แต่ไม่มี action receipt มาตรฐานเดียว

### ผลสาธิตจริง

รัน `node tools/audit/direction-damage.cjs` สำเร็จ พร้อม assertion เปรียบเทียบ snapshot เมื่อรันซ้ำ:

| กรณีจำลอง | armor ที่เข้า damage | HP ก่อน→หลัง | damage |
|---|---:|---:|---:|
| ไม่มี catalog armor (warrior ยังมีฐานคลาส) | 3 | 100→73 | 27 |
| ใส่เกราะ catalog DEF12 | 12 | 100→82 | 18 |
| อาวุธ 3d6+2, STR16, level1, bonus0 โจมตีเกราะ1 | 1 ของเป้าหมาย | 1000→983 | 17 |

seed อาวุธ 123456→561134079; rerun snapshot เท่ากันจริง ดาเมจนี้รวมเต๋า 9 + STR/2=8 + level1 − armor1 =17 (9 รวม bonus+2 แล้ว)

ข้อจำกัด VERIFIED: สองกรณีเกราะตั้ง base30/sure/area เพื่อแยกเกราะจาก hit/critical; กรณีเต๋าใช้ weapon snapshot จำลอง 3d6+2 ไม่ได้อ้างว่าเป็นไอเท็มที่เจ้าของมี สคริปต์เรียก engine โดยไม่มี browser แต่ **ยังสร้าง grid scene** เพราะ C.create/visibility/reveal ต้องใช้ scene ไม่ใช่หลักฐานต่อสู้ไม่มีตำแหน่ง ไม่ผ่าน UI ซื้อ/สวมเกราะหนัก; ใช้ read/applyEncounter จริงเพื่อสาธิตสูตร

รันเทสต์เดิมจริงเพิ่มเติม: catalog-equipment.test.cjs PASS, adventure.test.cjs PASS, status-effects.test.cjs PASS (3 ไฟล์/ไม่ผ่าน0) ไม่ได้รัน suite ทั้งหมด ไม่รัน browser ใน audit นี้: NOT VERIFIED ไม่ใช่ BLOCKED เพราะยังไม่ได้พยายามรัน

## C ความผูกกับ grid — เสร็จ static audit

VERIFIED: ไม่มี DOM ไม่ได้แปลว่าไม่มีตำแหน่ง combat-data.js:13–15 ใช้ distance/sight/canHit; tactical-systems.js:32,40,53 ใช้ target profile, AP, reachable, grid cells; character-combat.js:24–25 reveal/behind อ่าน scene และ n; validation บังคับ scene/ตำแหน่งไม่ซ้ำ (combat-data.js:27–29)

| กลุ่ม | ผลเมื่อไม่มีตำแหน่ง | ใช้ซ้ำได้แค่ไหน |
|---|---|---|
| ระยะอาวุธ min/max ความสูง LOS การตรวจจับ | ไม่มีข้อมูลตัดสินว่าโจมตีได้ | เก็บสูตรดาเมจ แต่ต้องเจ้าของกำหนด eligibility ใหม่ |
| เส้น/กรวย/รอบตัว/3×3, เลือกบางเป้าหรือทุกเป้า | จำนวนเป้าแทนพื้นที่อย่างเดียวไม่ได้รักษาความหมาย | เก็บชนิดท่าและผลต่อผู้รับ; ต้องนิยามกฎจำนวนเป้า |
| ผลัก/ดึง/บิน/ปีน/step/กับดัก/พื้นที่ค้าง | ขาด endpoint, entry/pulse และสิ่งกีดขวาง | ซ่อนไม่ให้เลือกใหม่หรือออกแบบความหมายใหม่หลังอนุมัติ |
| backstab, foresight, protect ใกล้1, ranger ยืนนิ่ง | แม้โจมตีเดี่ยวก็พึ่งตำแหน่ง/การเห็น | ห้ามเพียงตัด canHit แล้วอ้างว่าผลเดิม |
| heal/cure/status/cooldown/HP/MP/loot | มีส่วนไม่ขึ้นตำแหน่ง | reuse resolver/state transitions แต่ orchestration ยังผูก encounter |

หลักฐาน VERIFIED: character-combat.js:16–28 และ cast, grid-patterns.js, displacement.js, grid-hazards.js; catalog-actions.js:58 ส่งเป้าหมายเข้าฟังก์ชันผลร่วม

แยกชนิดฟังก์ชัน:
- VERIFIED ฟังก์ชันคำนวณ/compile ไม่มี DOM: catalog-equipment.stats/weapon, character-combat.amount/power, monster-stats.compile/adjustments, catalog-actions.compile ใช้ต่อได้
- VERIFIED ตัวตัดสินแบบ headless แต่ **mutate input** ไม่ใช่ pure mathematical function: character-combat.damage, status-effects.apply/resolve, combat-data.attack/endTurn/settle; หลายตัวอ่าน scene และ seed ด้วย
- VERIFIED ผูก UI: combat.js launch/action/draw และ adventure.js button/renderStory; canvas battle-view/battle-editor ไม่ควรเป็นเจ้าของผลตัวเลข
- INFERRED ทางที่ใช้ซ้ำน้อยเสี่ยงที่สุด: แยกการคำนวณ/receipt ออกจาก targeting เดิมก่อน แล้วทำ controller แบบข้อความเรียกผลเดิม ส่วน “รอบไม่มีตำแหน่งจริง” เป็นการเปลี่ยนกติกาหลายกลุ่ม ไม่ใช่ซ่อน canvas อย่างเดียว

## D บทแรกทีละฉาก — เสร็จ static audit

VERIFIED — adventure.js:3–15; adventure-data.js:8–27:

หมู่บ้านคุยนารา → accept → ชวนลินได้ → travel forest → [scout เสียพลัง/เวลา หรือ battle forest] → learn ประกายชำระ → travel cave → seal ใช้12MP → **battle cave จำเป็น** → settle won ทำ cave=true → กลับหมู่บ้าน → restore/sell → claimed=true เงิน60/100 + ending

forest combat ชนะตั้ง forest=true/route=fight; scout ไม่ต้องสู้; cave สร้าง scene12×10/ผู้เล่น/ศัตรู/เพื่อน และ e.chapter (adventure-data.js:21–25) adventure.js:3 ตั้ง s.expedition แล้ว launch; combat.js:65 เรียก settle กลับเกม; adventure-data.settle:27 อัปเดตลิน/ความชำนาญ/ชัยชนะ ไม่ทำ cave สำเร็จจาก retreat/lost

INFERRED ถ้าจะไม่เห็น grid แต่ยังใช้เกมเดิม: ต้องมีหน้า command/target/result/end-turn/return ที่ทำหน้าที่แทน combat.js โดยใช้ encounter เดิมก่อน ซ่อนภาพอย่างเดียวทำให้ไม่มีทางออกคำสั่งและจบบท ส่วนไม่มีตำแหน่งจริงต้องแก้ targeting/AI ไม่สามารถอ้างว่าเป็น presentation-only

INFERRED frozen encounters: ทางปลอดภัยคือเปิด legacy grid เฉพาะเซฟที่ค้าง หรือหน้า text ที่ยังขับ engine/scene เดิมทุกกฎให้จบ แล้วค่อยใช้โหมดใหม่ในไฟต์ถัดไป ห้ามแปลง HP/AP/status/fields/casting แบบเดา ห้าม auto-win/แจกซ้ำ; การปิด grid ทั้งหมดโดยไม่มีทาง resume ทำให้เซฟที่ expedition ค้างเดินเรื่องไม่ได้ (adventure-data.ready:6; game.js:32) ไม่มี schema change ไม่ได้แปลว่าข้าม validator เดิมได้

## E ทางเข้า grid และ flag — เสร็จ static inventory; runtime NOT VERIFIED

| ทางเข้า VERIFIED | หลักฐาน |
|---|---|
| สำรวจจากกิจกรรม/manual/day/offline; expedition ค้างกลับ launch | game.js:32–33 |
| เลือกฉาก/พรีเซ็ต/จำนวนปาร์ตี้และ expeditionStart | combat.js:19–20,63 |
| forest/cave จากบท และปุ่มกลับเข้าไฟต์ค้าง | adventure.js:3,15 |
| บททดสอบ Dual Wield | creation-ui.js:24 |
| เหตุการณ์สู้จากเส้นทาง/VN | world-travel-ui.js:23; world-travel-combat.js:4–5 |
| ตัวแก้ฉากจากเมนูแผนที่และหน้าเกม | battle-editor.js:21 |
| คลังพรีเซ็ต/สุ่มฉาก/ทดลองเดิน/ปีนใน editor | battle-editor.js:31,64,67–70 |
| สนามทดสอบอัปเดต รวม world sandbox ที่ใช้ encounter | combat-lab.js:3; world-travel-sandbox.js |
| โหลดเซฟกลางไฟต์แล้วผ่านทาง resume ข้างต้น | game.js:32; combat.js:20 |

INFERRED ใช้ **policy flag เดียวเป็นแหล่งตัดสิน** ได้โดยไม่เก็บใน save แต่ต้องต่อหลาย UI/controller และ guard ทาง launch/เริ่ม battle ไม่ใช่ใส่ hidden ที่เมนูจุดเดียว แผนที่โลก maps.js ไม่ใช่ tactical grid ทั้งหมด ห้ามซ่อนระบบเดินทางตามไปโดยไม่แยก แฟล็กควรอนุญาต exception frozen/DM/test; หากเลือกห้าม grid แม้ในเซฟค้าง ต้องมี replacement controller ก่อน

NOT VERIFIED: รายการนี้มาจาก static callsites ที่ค้นพบ ยังไม่ได้กดทุกเส้นทางบน browser ไม่รับรองว่าไม่มี dynamic handler อื่น จึงไม่อ้างว่าทดลอง flag สำเร็จ

## B ความโปร่งใสของผล — เสร็จ static audit

VERIFIED: มี state ที่โปรแกรมอ่านได้ (unit stats/gearBonuses/catalogWeapon/HP/effects/seed) และ damage คืนตัวเลข แต่ยังไม่มี receipt รวมทุกองค์ประกอบต่อ action การเทียบ snapshot บอก HP delta ได้ แต่แยก miss, immunity, barrier, protect, หลาย hit และแต่ละลูกเต๋าไม่ได้ครบ (character-combat.js:13,16–23; catalog-actions.js:58; combat-data.settle:57 คืน snapshot/reward/status)

INFERRED: เพิ่มผลลัพธ์ชั่วคราวข้างการคำนวณเดิม เช่น action ID, actor/target/weapon IDs, input snapshot/version, RNG ก่อน/หลังและค่าที่ถูกใช้จริงแต่ละครั้ง, base components, multiplier/armor/reduction/absorb/transfer, status outcome, HP/AP/MP ก่อนหลัง เก็บ trace ระหว่าง resolver ทำงาน ไม่สุ่มซ้ำเพื่อสร้างคำบรรยายและไม่คำนวณใหม่จาก catalog ล่าสุดของไฟต์ frozen จากนั้น narrative renderer รับสำเนาที่อ่านอย่างเดียว ไม่รับ patch/save จากโมเดล

INFERRED: เริ่ม receipt ในหน่วยความจำโดยไม่เพิ่มฟิลด์เข้า encounter/save validator แล้วพิสูจน์ state หลัง action เท่ากับเดิมทุกกรณี การเอา trace ใส่ e โดยตรงเสี่ยงเปลี่ยน schema โดยไม่ตั้งใจ ไม่จำเป็นต้องเปลี่ยนสูตรเพื่อให้ตรวจย้อนหลังได้

## F ชุดข้อเท็จจริงฉาก — เสร็จ static audit

| ข้อมูล VERIFIED | แหล่ง/ข้อจำกัด |
|---|---|
| ที่ตั้งปัจจุบันและเส้นทางค้าง | world-travel-data.js:20 current; world-links-data.js:7 context/location; s.overworld/mapView; บทเก่าอาจมีเพียง adventure.location |
| NPC ที่อยู่จริง | npcPlacements + same(location) + enabled + R.records(DB), world-travel-ui.js:26; ห้ามถือว่าข้อความ location ของทุก NPC เป็น placement |
| บุคลิก ความสัมพันธ์ ประวัติ | records npc personality/relationships/lore/description; WORLD-DATABASE-FIELDS.md:23–24,49–51; เป็นข้อความอ้างอิง ไม่ใช่ state ความสัมพันธ์ที่คำนวณแล้ว |
| บท/ทางเลือกที่ผ่านมา | adventure.accepted/route/learned/seal/cave/ending/claimed; adventure-data.js:4–5 |
| เควส/เรื่องเสริม | eventJournal.quests/stories, event-story.js:9–10; claimedChoices/countedBattles ใน world-links-data.js:29,31; ledger ไม่ใช่ transcript บทสนทนาทั้งหมด |
| เหตุการณ์ปัจจุบัน | pendingEvent/nodeId/eventQueue ใน journey/interaction; world-links-data.context/pending และ event-story.apply |
| เหตุการณ์ล่าสุด | s.logs ข้อความพร้อม day/minute จำกัด40 (world-travel-data.js:23); e.log ข้อความจำกัด30 (character-combat.js:7) ไม่ใช่ประวัติไม่จำกัด |
| ปาร์ตี้ | adventure.companion, catalogParty และ encounter.units; ต้องแยกตัวที่อยู่ในไฟต์จริงกับ roster (combat-data.js:57 settle/party; adventure-data.js:12,27) |
| กระเป๋า/อุปกรณ์ | catalog-economy adapter และ catalog-equipment.read/stats; character.inventory มี supplies อีกชุด ไม่ควรอ่านเฉพาะชุดเดียว (catalog-equipment.js:6,13; combat-data.js:57) |

INFERRED: มีวัตถุดิบเพียงพอสำหรับ fact bundle ฉากสั้น แต่ขาดลำดับเหตุการณ์เชิงโครงสร้างที่ครอบคลุมทุก action/ตัวเลขและสรุปเรื่องยาวที่เชื่อถือได้ ควรเลือก facts จาก state จริงก่อน ใช้ lore เป็น background แยกจากผลที่ยืนยันแล้ว ไม่ส่งทั้งคลังให้โมเดล

INFERRED: สรุปเรื่องที่ผ่านมาเก็บ sidecar IndexedDB แยก account + character identity เท่าที่มี + save fingerprint/revision + scene/encounter ID โดยไม่แก้ save schema ข้อดี: ลบ/สร้างใหม่ได้ ไม่กระทบการโหลดเก่า ข้อเสีย: ไม่เดินทางกับ save export/ข้ามเครื่อง, quota/clear storage ทำหาย, โหลดเซฟย้อนเวลาแล้ว summary อาจอยู่อนาคต ต้อง invalidate เมื่อ fingerprint ไม่ตรงและ fallback เป็น facts ปัจจุบัน สรุป AI ต้องถือว่า derived text ไม่ใช้ตัดสินเควส/ไอเท็ม และไม่เขียนทับ eventJournal ห้ามอ้างว่าชื่อ character อย่างเดียวเป็น unique ID ข้ามเซฟ

## G โมเดลในเครื่อง — เสร็จตรวจเบา ๆ; การเชื่อมจริง NOT VERIFIED

VERIFIED: preview.cjs:1 serve static ที่ 127.0.0.1:4173 ไม่มี proxy ของโมเดล; dist/cloud.js:25 import Supabase SDK จาก esm.sh และเริ่ม auth; dist/index.html ไม่มี CSP meta ใน source ที่ตรวจ การไม่มี CSP ไม่ได้ยืนยันว่า browser อนุญาต localhost ทุกกรณี

INFERRED จุดเชื่อม: หลัง engine action สำเร็จ/save แล้วที่ combat.js:61 หรือหลัง choice/event transition (adventure.js:3; world-travel-ui.js:23) ส่ง immutable facts เข้า renderer เสริม ข้อความ fallback จากผล engine แสดงได้ทันที ตั้ง timeout/abort และกันคำตอบเก่าหลังเปลี่ยนฉาก/บัญชีด้วย action ID โมเดลล่มต้องไม่บล็อก AP/endTurn/save และผลข้อความใช้ textContent ไม่ eval/innerHTML ไม่รับ action/tool calls จากโมเดล

INFERRED: localhost คนละ port เป็น cross-origin ต้อง server อนุญาต CORS/preflight ของต้นทาง preview; Ollama กับ LM Studio ใช้ endpoint/model name/config ต่างกันแม้รองรับ OpenAI-compatible ห้าม hard-code ว่าทุกเครื่องใช้ endpoint เดียว จาก GitHub Pages HTTPS ไป loopback ยังขึ้นกับ browser mixed-content/secure-loopback exception/local-network permission และ server CORS ต้องตรวจจริง การเปิด file:// มี origin null ไม่ควรถือว่าเท่ากับ preview localhost

NOT VERIFIED: ไม่ได้เปิด Ollama/LM Studio หรือเรียก endpoint จริง ไม่ตรวจ hardware/model/context length/ความเร็ว/คุณภาพภาษาไทย และยังไม่พิสูจน์ fallback runtime

VERIFIED/INFERRED: การมีโมเดลในเครื่องไม่ทำให้เกมเริ่มเล่นออฟไลน์ได้อัตโนมัติ เพราะเส้นทางเริ่มต้นยังพึ่ง remote SDK/auth (cloud.js:25) source มี offline recovery ระหว่างใช้งาน แต่ cold start ไม่มีอินเทอร์เน็ตยัง NOT VERIFIED อย่าสัญญา offline-first โดยไม่จัดการ auth/bootstrap แยก ซึ่งไม่ใช่แค่เพิ่มตัวเล่าเรื่อง

## H ผลต่อเทสต์ — เสร็จแบ่งกลุ่ม static; ไม่แก้หรือปิดเทสต์

VERIFIED รายชื่อ suite มีอยู่ใน repo; INFERRED ผลกระทบที่คาดจาก dependency ใน C–E:

| กลุ่ม | ไฟล์ตัวอย่างที่ต้องรักษา/เพิ่ม coverage แยก |
|---|---|
| grid geometry/targeting/AP | tactical.test.cjs, tactical-v2.test.cjs, grid-patterns.test.cjs, weapon-patterns.test.cjs, displacement.test.cjs, grid-hazards.test.cjs, hazard-navigation.test.cjs, monster-grid.test.cjs |
| grid UI/editor/lab | tactical-v2-ui.test.cjs, combat-polish.test.cjs, battle-isometric.test.cjs, grid-closeout-ui.test.cjs, combat-lab-ui.test.cjs, weapon-patterns-ui.test.cjs, status-effects-ui.test.cjs |
| ทางเข้าบท/โลก | adventure.test.cjs/adventure-ui.test.cjs, world-travel.test.cjs/world-travel-ui.test.cjs, world-links.test.cjs/world-links-ui.test.cjs, event-story.test.cjs/event-story-ui.test.cjs |
| แหล่ง facts/ตัวเลข | catalog-equipment.test.cjs, elements.test.cjs, status-effects.test.cjs, catalog-actions.test.cjs, catalog-combat-items.test.cjs, monster-stats.test.cjs, event-story.test.cjs, world-links.test.cjs |
| รักษาเซฟ/รางวัล/บัญชี | closeout-legacy-saves.test.cjs, closeout-resume.test.cjs, cloud.test.cjs และ browser counterparts ที่มี |

INFERRED: ถ้าซ่อน UI ด้วยโหมดใหม่ ให้รันเทสต์ grid เดิมภายใต้โหมด compatibility/DM ไม่ลบเพื่อทำตัวเลขผ่านสวยขึ้น เพิ่ม coverage โหมด story สำหรับคำสั่ง/จบบท/โหลด frozen/fallback/ข้อความโมเดลที่พยายามแก้ state แยก ถ้าเปลี่ยนกฎไม่มีตำแหน่งจริงต้องมี specification ใหม่ก่อน ไม่แก้ assertion เดิมให้ตามผลโดยไม่มีเหตุผล

ผลรันจริงมีเพียง script และ 3 pure suites ที่บันทึกใน A; suite อื่นในตารางเป็น dependency inventory ไม่ใช่ผล PASS รอบนี้ legacy-browser/legacy-tactical-ui/legacy-combat เป็นประวัติ ไม่ได้นำกลับมาใช้รับรอง

## I สรุปความเป็นไปได้ — ข้อเสนอ INFERRED จาก A–H

| ชิ้นงาน | ระดับ / ขนาด | เสี่ยงเซฟเก่า | ลำดับ / เหมาะส่งต่อ AI อื่นหรือไม่ |
|---|---|---|---|
| ดาเมจอ้างเกราะที่สวมจริง | ทำง่าย S สำหรับตรวจ/อธิบาย เพราะมีแล้ว; ถ้าบังคับทุกท่าใช้ weapon หรือ d20 = เปลี่ยนสมดุล M–L | ต่ำถ้าไม่แก้สูตร; สูงขึ้นเมื่อเปลี่ยนกฎไฟต์ค้าง | 1 — ส่งต่อการทำ receipt/เอกสารพร้อม regression ได้; ไม่ให้แต่งสูตรแทนของเดิม |
| ชุดข้อเท็จจริง action/scene | ทำได้แต่ต้องแก้มาก M | ต่ำเมื่อเป็นผลลัพธ์ชั่วคราว; กลางเมื่อผูก history | 2 — แบ่ง extractor ฉากกับ instrumentation ตัวเลข; งานฉากเหมาะ งาน RNG ต้องผู้ตรวจโค้ด |
| ต่อสู้แบบรอบไม่มีตำแหน่ง | ทำได้แต่ต้องแก้มาก L; ไม่แนะนำก่อนเป้าปล่อยเดิม | สูง โดยเฉพาะ frozen/casting/hazard | 5 — ต้องตัดสินกฎก่อน ไม่เหมาะมอบเป็นงานแก้ครั้งเดียวให้แชตฟรี |
| ซ่อน grid | ทำง่าย S สำหรับเมนู; ทางเล่นครบพร้อม replacement M–L | สูงถ้าไม่มีทางออกไฟต์ค้าง | 4 หลังมี controller — AI อื่นทำ UI ได้เมื่อมี policy/compatibility ชัด |
| ตัวเชื่อมโมเดลในเครื่อง + fallback | ทำได้แต่ต้องแก้มาก M (รวม browser/CORS/auth boundary) | ต่ำถ้า display-only | 3 หลัง facts — แยก task ได้ แต่ต้องมีเครื่องโมเดลจริงตรวจ |
| สรุปเรื่องที่ผ่านมาแบบ sidecar | ทำได้แต่ต้องแก้มาก M | ไม่ทำ save พัง แต่เล่าอนาคตผิดได้หลัง rollback | 6 — เริ่มจาก facts ปัจจุบันก่อน; AI อื่นทำได้เมื่อกำหนด invalidate/export policy |

คำตัดสิน INFERRED: **เสริมผู้เล่าเรื่องในเครื่องบนผล engine เดิมทำได้; เปลี่ยนเป็นการต่อสู้ไม่มีตำแหน่งไม่ใช่งานซ่อน grid และไม่ใช่งานเติมข้อมูลอย่างเดียว** ไม่แนะนำให้รวมทั้งสองการเปลี่ยนเป็นเงื่อนไขปล่อยศุกร์ 13 พ.ย. 2026 นี่เป็นข้อเสนอที่เปลี่ยนจากข้อตกลง grid/2 AP เดิมใน AGENTS.md จึงต้องให้เจ้าของตัดสินกฎใหม่ก่อน ไม่ได้ดำเนินการเปลี่ยนแล้ว

คำถามเจ้าของ:
1. ต้องการแค่ไม่แสดงกระดานแต่ยังคำนวณตำแหน่งเดิม หรือไม่มีตำแหน่งจริง? ผลต่องานต่างกันมาก
2. ยืนยันคงโอกาสโดนแบบปัจจุบันได้ไหม หรือจำเป็นต้อง d20? d20 status ที่มีอยู่ไม่ได้แปลว่าทุก attack ใช้ d20
3. ยอมให้เซฟ frozen เปิด grid เดิมจนจบไฟต์ได้ไหม? ถ้าไม่ ต้องมี text controller ครบก่อนซ่อน
4. อนุญาตซ่อนท่า AoE/ผลัก/ดึง/hazard/หลัง/บินจากการเลือกใหม่ในโหมดไม่มีตำแหน่งไหม หรือทุกท่าต้องมีความหมายใหม่?
5. ใช้ local preview ที่ยัง login ออนไลน์ได้ หรือจำเป็นต้องเริ่มเกมออฟไลน์ทั้งระบบ? ระบุ browser และ Ollama/LM Studio ที่จะใช้ตรวจจริงด้วย

สถานะส่งมอบ: A–I เสร็จในระดับ audit ที่ติดป้ายไว้; ยังไม่ทำ/ไม่อ้างว่าผ่าน: runtime flag ทุกทางเข้า, grid-free combat, local-model request/fallback, offline cold start, browser acceptance ของแนวทางใหม่ ไม่มีการแก้ไฟล์เกม/เทสต์/workflow และไม่รัน Publish
