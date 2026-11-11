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
