# ฐานข้อมูลกับระบบโลก/อีเวนต์ — ผลล่าสุด 9 พ.ย. 2026

ขอบเขต: โค้ดและ catalog ใน workspace ไม่ใช่บัญชี Supabase จริง มี 271 ช่อง catalog / 550 effective records (raw 504), และรายงานเพิ่ม 117 ฟิลด์โลก/อีเวนต์/สถานะที่เกี่ยวข้อง สถานะรายช่อง: กลไกอ่านจริง 63, ใช้บาง adapter 133, แสดงผล 13, ยังไม่เกิดกลไกตามความหมายเดิม 62

ตัวเลขนับฟิลด์ต่อหมวด ไม่ใช่จำนวน records ที่ใช้งานได้ครบ 62 ช่องสุดท้ายมีทั้งคำบรรยายที่ตั้งใจเก็บและกติกาพิเศษเก่าที่แยกไว้ให้เจ้าของตรวจ ไม่ควรลบทิ้งหรือประกาศว่าทั้ง record ใช้ไม่ได้เพราะบางช่องไม่เชื่อม

## งานที่เชื่อมเพิ่มแล้ว

| ข้อมูล | จุดที่ใช้งานจริง |
|---|---|
| NPC.id/name/avatar/portrait | ผู้พูดใน VN และรูปครึ่งตัว/รูปสำรอง |
| npcPlacements + mapId/placeId/eventId | ตำแหน่ง NPC/อีเวนต์ประจำสถานที่ เมื่อเปิด enforceLocations ตรวจร้าน/รับเพื่อน/กิจกรรมใน engine |
| NPC.items + ราคาไอเท็ม/อุปกรณ์ | เปิดร้านจาก npcAction shop ใน VN ซื้อ/ขายด้วยคลังและเงินจริง |
| recipe.providerNpcIds/ingredients/goldCost/result* | เปิดปรุงจาก npcAction craft กลับมาคุยต่อได้ |
| NPC.recruitable/stats/equipment/skills/spells/proficiencies | npcAction recruit/dismiss และ roster/ปาร์ตี้ grid พร้อม HP/MP คงอยู่ ไม่แจกเงิน/ของ NPC |
| conditions ของ event/choice | quest absent/active/ready/completed/failed, item, learned skill/spell, stat, proficiency |
| quest.objectives + monsterId/item ID | นับ kill เมื่อชนะและรับผลครั้งเดียว ตรวจจำนวนของในคลังจริง พร้อมส่งเมื่อครบ |
| consumeItems + quest.status + onceKey | ส่งของ/อัปเดตเควส/ให้รางวัลแบบ atomic กันรับซ้ำข้ามการโหลดและเปิดบทใหม่ |
| chapterPlaces | ผูกหมู่บ้าน/ป่า/ถ้ำเดิมกับตำแหน่งโลก ปุ่มบทเริ่ม route จริง ถึงแล้ว sync location และตรวจพื้นที่ก่อนทำกิจกรรม |
| weaponRangeMin/Max และ grid* ของ weapon | โจมตีปกติทั้งมือหลัก/มือรอง/NPC แยกพื้นที่ ใช้ 1 AP พร้อม snapshot เก่าและ preset ทดสอบ |
| สกิล/เวท MP/CD/dice/ธาตุ/status/displacement/hazard/grid | ใช้กับท่าและแม่แบบที่ adapter รองรับใน grid ที่อีเวนต์เรียก ไม่รวมท่าพิเศษที่ถูกแยกรอตรวจ |

รายละเอียดตั้งค่า: WORLD-QUEST-LOOP.md, WEAPON-GRID.md, EVENT-AUTHORING.md เซฟ/คลังเก่าไม่ถูกบังคับเปิดตำแหน่งจริงอัตโนมัติ NPC.location เดิมเป็นข้อความ ต้องวางด้วย ID ที่เลือกจากฟอร์ม

## ข้อมูลที่ยังไม่สร้างกลไกตามความหมายเดิม

- NPC.location เป็นข้อความ (29 records), attitude/personality/lore (40 แต่ละช่อง), relationships (21), occupation/category/description ใช้อ้างอิงเขียนบท ไม่สร้างท่าที/คะแนนสัมพันธ์/ตำแหน่งเอง ตำแหน่งจริงใช้ npcPlacements แทน
- NPC.gold ไม่ใช่เงินหมุนเวียนร้านหรือเงินที่แจกเมื่อรับเพื่อน มีค่าที่ไม่เป็นศูนย์ 19 ตัว
- monster.habitat (35), locations (ว่าง), aiBehavior/combatTactics/initiative/stealthDC/attackType และ monster.element ไม่กำกับ AI กลางหรือธาตุโจมตีปกติ ธาตุสกิลใช้ skill.element; การเลือกมอนสเตอร์เกิดใช้อีเวนต์/ฉาก monsterId ที่กำหนดเอง
- spell.xpPerCast มีกรอก 58 ตัวแต่ยังไม่ใช้ค่านี้เป็น XP ต่อร่าย; xpUnlocks ว่าง; school/upgradeNotes เป็นข้อมูลอ่าน สูตรพิเศษ consumeAllMp/mpScalingPerDice/exhaustAfterCast/interruptOnDamage ยังไม่รองรับครบและถูกกันไว้รอเจ้าของตรวจเมื่อเปิดใช้ค่าพิเศษ
- skill.narrativeMindReadingVisible/craftRecipeIds/powerCapacity*/maxMpMultiplier/dodgeChancePercent/instantCastSpells/castTimeReduction/weaponAccuracyPenalty*/onHitStack* และโบนัสพิเศษอื่นยังไม่ถูกแปลเป็นกลไกอัตโนมัติ มี learned-skill condition ใช้เขียนทางเลือกได้ แต่ไม่ปลดความสามารถเก่าที่ไม่มี adapter
- proficiency.maxLevel/milestones มีข้อมูล 36 records แต่เกณฑ์ rank/การฝึกปัจจุบันยังใช้ creation/progression
- item.targetType ไม่ได้เปลี่ยนเป้าหมายคำสั่งใช้ของอย่างอิสระ; outcome ให้ item ยังไม่ใช้ไอเท็มนั้นทันที
- event.weight เก็บเพื่ออ่านไฟล์เก่า ไม่ใช้สุ่มแล้ว; bgmId เตรียมไว้ ยังไม่เล่นเสียง

weapon.specialEffectsText/armor.passive/accessory.passiveEffects ใช้ได้บางส่วนผ่าน parser โบนัสตัวเลข ไม่ใช่ความสามารถภาษาอิสระทั้งหมด 77 records พิเศษ/ของสะสมที่เจ้าของขอแยกไว้ยังคงอยู่ในกลุ่มรอตรวจ

## งานต่อที่ไม่ขวางวงจรหลัก

world placement/บริการ/เงื่อนไข/ส่งของ/เป้าหมายและ chapter bridge ที่เคยเป็นข้อขวางถูกดำเนินการแล้ว งานเสริมเช่น spawn table จาก habitat, reputation, ปลดสูตรจาก craftRecipeIds, เวท progression และ BGM เป็นกลไกเพิ่มเติม ต้องมีขอบเขตแยก ไม่ควรรวมว่าเพียงกรอกข้อความแล้วเกิดผล

งานตรวจรับที่ยังขาดคือข้อมูลเจ้าของจริงและ Supabase/สองอุปกรณ์จริง ตาม OWNER-ACCEPTANCE.md

## หลักฐาน

- WORLD-DATABASE-FIELDS.md: ตารางทุกช่อง สถานะ consumer จำนวนที่กรอก และข้อจำกัด
- reports/world-database-links.json: ID/ตัวอย่างค่าของ source/effective catalog และหลักฐานโค้ด
- `node tools/audit-world-links.cjs` สร้างรายงานพร้อม engine probes รวม gate เควสและ placement จริง; `--export /path/to/evertale-content-edits.json` ตรวจฉบับที่เจ้าของส่งออกได้โดยไม่เชื่อมบัญชี
- world-links.test.cjs และ world-links-ui.test.cjs ตรวจวงจรโลกใหม่; engine 44 และ browser grid 20/20 ผ่านด้วย mock auth/storage

รายงานนี้ตรวจโค้ด/ข้อมูล workspace และไม่ได้แก้ฐานข้อมูลเฉพาะบัญชีเจ้าของ สถานะเผยแพร่ให้ดู GitHub Actions ล่าสุดและรายงานส่งมอบ
