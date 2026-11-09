# ผลตรวจฐานข้อมูลหลังเพิ่มแผนที่และ Visual Novel — 9 พ.ย. 2026

ตรวจจากโค้ด workspace และ catalog ที่มากับโปรเจค ไม่ได้อ่านฐานข้อมูล Supabase เฉพาะบัญชีเจ้าของ ตัวเกมเก็บ routes/events ที่ผู้ใช้สร้างใน worldMap:main overrides ไม่ใช่ในไฟล์ catalog ต้นฉบับ ดังนั้นรอบนี้ยืนยันกลไกและข้อมูลในโปรเจคได้ แต่ยืนยันไม่ได้ว่าในบัญชีจริงมีเส้นทาง/อีเวนต์กี่ตัวหรือมี ID ที่เจ้าของกรอกผิดหรือไม่ สามารถใช้ไฟล์ «ส่งออกข้อมูลที่แก้ไข» ตรวจรายบัญชีโดยไม่เชื่อมบริการจริงได้

ตรวจครบ **262 ช่อง schema ใน 13 หมวด**, **550 records** ที่ R.records รวม record ที่ระบบเพิ่มแล้ว (raw ต้นฉบับ 504) และ **82 ฟิลด์แผนที่/อีเวนต์เพิ่มเติม** แยกต่างหาก ผลรายช่อง catalog: กลไกอ่านจริง 63, ใช้บาง adapter/เงื่อนไข 124, แสดงผล 13, ยังไม่เชื่อมกลไก 62 ไม่ใช่ว่า 200 ช่องแรกทำงานครบกับทุก record และไม่ใช่ 62 record ต้องลบ ฟิลด์ที่อ่าน/แก้ได้ในฐานข้อมูลหรือมี validator อย่างเดียวไม่นับว่าเกิดผลในเกมแล้ว

## เชื่อมแล้ว ใช้ได้จากสองระบบใหม่

| ข้อมูล | ผูกกับอะไรอยู่ | ขอบเขตจริง |
|---|---|---|
| NPC.id/name/avatar/portrait | novel.npcId หรือ node.npcId → หน้าคุย | ชื่อ + รูปครึ่งตัวก่อน/รูปโปรไฟล์สำรอง ไม่ดึงบุคลิกมาแต่งบทเอง |
| NPC.recruitable, stats, HP/MP, equipment, skills/spells, proficiencies | roster → catalogParty → grid ของอีเวนต์ | ต้องรับเข้าทีมจากหน้าจัดเพื่อนก่อน VN ยังชวนเองไม่ได้ ท่าต้องมี adapter |
| monster.id + stats + skills + weaknesses/immunities | event.monsterId หรือจุดเกิดใน sceneId → grid | ใช้มอนสเตอร์ที่เลือกจริง ไม่เลือกตาม habitat/location อัตโนมัติ |
| monster.loot + item/gear rarity | ชนะไฟต์อีเวนต์ → ระบบดรอปเดิม → กระเป๋า/คลัง | rarity ของของดรอปมีผลกับน้ำหนักใน pool; rarity ของ monster ไม่ใช่ % encounter |
| item/dropItem/gear ID | choice.items → catalogInventory | ของใช้/วัตถุดิบเข้ากระเป๋า อุปกรณ์เข้าคลัง ต้องกดใช้/ใส่ภายหลัง ของพิเศษยังขึ้นกับตัวประมวลผลเดิม |
| สกิล/เวท MP/CD/dice/ธาตุ/grid/status/ผลักดึง/hazard | grid เดิมที่ event เรียก | เฉพาะ record/ค่าที่รองรับ รายการรอเจ้าของตรวจยังไม่กลายเป็นท่าใช้ได้เพราะมี VN |
| route ID/from/to/km/terrain/settings | เดินทางจริงและคำนวณเวลา | พิกัดหมุด/ภาพไม่กำหนด กม. และ STR/CON/ชุด/ไอเท็มรถม้าไม่เปลี่ยนความเร็วปัจจุบัน |
| event.routeChances + once + enabled | สุ่มแยกแต่ละอีเวนต์ → คิว → เซฟ | ไม่มี quest/stat/time/reputation condition; event.weight ไม่ใช้แล้ว |
| choice.quest + nextNode/nextEventId + combat.*Node | สมุดเควส/บันทึกเรื่องราว/บทตามผลสู้ | เควสเปลี่ยนสถานะจากตัวเลือกโดยตรง ไม่มีเงื่อนไขฆ่า/เก็บของ/ส่งของอัตโนมัติ |

## ควรผูกต่อ เรียงตามประโยชน์ต่อการปิดระบบ

| ลำดับ | ช่องที่มี / ข้อมูลที่จะใช้ | ควรผูกกับ | สิ่งที่ยังขาด |
|---|---|---|---|
| 1 | NPC.location (มีข้อความ 29 ตัว), NPC.id | placement {npcId,mapId,placeId} → NPC ณ สถานที่จริง | ปัจจุบันเลือกร้าน/รับเพื่อนได้ข้ามสถานที่ ห้ามเดาจับชื่อ location กับชื่อหมุด ควรเลือก ID จากรายการและคงข้อความเดิมไว้ |
| 1 | NPC.items + item/gear prices + recipe.providerNpcIds | outcome เปิดร้าน/ปรุงยาใน VN โดย npcId | เอนจินร้าน/ปรุงใช้งานอยู่ แต่หน้าคุยยังไม่เรียกบริการนั้น NPC ที่ปรากฏในบทไม่ใช่ร้านอัตโนมัติ |
| 1 | NPC.recruitable + ID | outcome ชวน/ให้ NPC ออกจากทีม | ใช้ recruit/dismiss adapter เดิม ตรวจเพดานทีมและเก็บ HP/MP ไม่แจกของหรือเงิน NPC เมื่อรับเข้าทีม |
| 1 | eventJournal.quest.status, learned, inventory, proficiencies, stats | conditions ของ event/node/choice | เปิดเรื่องตามเควส จ่าย/ส่งไอเท็ม เช็กสกิล/เจรจาได้จริง ต้องมี failure route และผลหักของแบบ atomic; ระบบปัจจุบันมอบของได้แต่ยังไม่รับส่งของเป็นเงื่อนไข |
| 2 | monster.habitat (35 ตัว), locations (ว่างทั้งหมด) | spawn table อ้าง routeId/mapId/placeId | ให้คนเลือก ID ชัดเจนและตรวจ reference ไม่แปลข้อความ «ป่า/ถ้ำ» เป็นการเกิดอัตโนมัติ |
| 2 | skill.narrativeMindReadingVisible (1 ตัว), skill ID | condition learned skill → เปิดบทความคิด/ตัวเลือกลับใน VN | อ่านใจยังไม่ทำงานกับบทสนทนา แม้มีช่อง true; ต้องตรวจท่ารายการนั้นและให้เจ้าของยืนยันขอบเขตก่อนเปิดกลไก |
| 2 | skill.craftRecipeIds (1 ตัว), recipe ID | เรียนสกิล/รับสูตร → unlockedRecipeIds → ร้านปรุง | ปัจจุบันใช้แค่ผู้ให้บริการ/ของ/เงินครบ ยังไม่บังคับเรียนสกิลปลดสูตร |
| 2 | NPC.attitude/relationships/personality/lore | เขียนบท + reputation แบบมีชนิด → เงื่อนไขตัวเลือก | เนื้อหามีค่าเป็นต้นฉบับเรื่อง แต่ข้อความไม่ควรถูกตีความเป็นคะแนนหรือเงื่อนไขเอง |
| ภายหลัง | NPC.gold | เงินร้านที่คงอยู่ในเซฟ/วงเงินรับซื้อ | ปัจจุบันร้านไม่ใช้ NPC.gold; อย่านำเงินตั้งต้นไปจ่ายซ้ำทุกครั้งที่คุย |
| ภายหลัง | spell.xpPerCast/xpUnlocks + proficiency.maxLevel/milestones | progression/ปลดท่า | กติกาฝึกปัจจุบันใช้ตารางอีกชุด ต้องย้ายโดยรักษาเซฟ ไม่ใช่แค่เปิดช่องเหล่านี้ |

แนะนำทำลำดับ 1 ก่อน เพราะจะให้สถานที่ → NPC → คุย → ร้าน/เควส/ชวนเพื่อน → ต่อสู้ เป็นวงจรเดียวที่เล่นได้จริง ไม่จำเป็นต้องเพิ่มกลไกเดินทางหรือระบบความสัมพันธ์ใหญ่เพื่อปิดงาน

## กรอกไว้ แต่ยังไม่เกิดกลไกตามช่องนั้น

- **NPC:** location, attitude (40 ตัว), personality (40), relationships (21), lore (40), occupation/category และ description เป็นข้อมูลอ่าน/เขียนในฐานข้อมูล ไม่สร้างบท/ท่าที/ตำแหน่งในโลก gold มีค่าที่ไม่เป็นศูนย์ 19 ตัว แต่ไม่ใช่เงินหมุนเวียนร้าน
- **มอนสเตอร์:** habitat, locations, aiBehavior, combatTactics, initiative, stealthDC, attackType และ monster.element ไม่กำกับ grid ปัจจุบัน AI กลางทำงานจริงจากกติกา/สกิล ไม่อ่านคำสั่งภาษาอิสระใน combatTactics ธาตุโจมตีของสกิลใช้ skill.element แยกจาก monster.element
- **เวท:** xpPerCast มีกรอก 58 ตัวแต่ยังไม่ใช้จ่าย XP ตามช่องนี้ xpUnlocks ว่าง; school/upgradeNotes เป็นคำอธิบาย consumeAllMp/mpScalingPerDice/exhaustAfterCast/interruptOnDamage และสูตรพิเศษยังไม่รองรับครบ บางค่าเปิดแล้วทำให้ทั้งท่าถูกกันไว้รอเจ้าของตรวจ
- **สกิลพิเศษ:** narrativeMindReadingVisible, craftRecipeIds, กลุ่ม powerCapacity*, maxMpMultiplier, dodgeChancePercent, instantCastSpells, castTimeReduction, weaponAccuracyPenalty*, onHitStack* และโบนัสพิเศษอื่นตามตารางรายช่อง ไม่ได้กลายเป็นกลไกจริงจากการเพิ่มสองระบบนี้ ข้อความ buff/debuff/passiveEffects ของ skill ก็ไม่ใช่ effect interpreter ทั่วไป
- **ความชำนาญ:** maxLevel/milestones มีกรอกครบ 36 records แต่ rank/เกณฑ์ฝึกที่เล่นจริงยังมาจาก creation/progression
- **ของใช้:** targetType ไม่ได้กำหนดเป้าอิสระในคำสั่งไอเท็ม ตัวประมวลผล/สมาชิกที่สั่งการเป็นตัวเลือกเป้า
- **อีเวนต์:** weight เก็บเพื่ออ่านไฟล์เก่าแต่ไม่ใช้สุ่มแล้ว; bgmId เตรียมไว้เฉย ๆ ตามที่ตกลง ยังไม่เล่นเสียง

ไม่ควรลบของบรรยาย/ของสะสมเพื่อให้จำนวน unused เป็นศูนย์ และอย่าจัดทั้ง record ว่าใช้ไม่ได้เพียงเพราะมีบางช่องที่ไม่เชื่อม ตัวอย่าง weapon.specialEffectsText/armor.passive/accessory.passiveEffects **ใช้ได้บางส่วน** ผ่านตัวอ่านโบนัสตัวเลข แต่ไม่รองรับความสามารถภาษาอิสระทั้งหมด

## หลักฐานและวิธีตรวจซ้ำ

- [ตารางรายช่องทั้งหมด](WORLD-DATABASE-FIELDS.md): label, สถานะ, ฟิลด์ที่สัมพันธ์กับระบบใหม่, จำนวน records ที่กรอกจริง และจุดโค้ดที่เกี่ยวข้อง
- [ข้อมูล JSON ของรายงาน](reports/world-database-links.json): มี ID และตัวอย่างค่าที่กรอกไว้จริงจาก source/effective catalog
- `node tools/audit-world-links.cjs` สร้างสองไฟล์ข้างบน และตรวจ engine จริง 7 กรณี: ความเร็วไม่ผูก stats, รับ NPC ไม่ผูกสถานที่, เควสไม่ใช่ event condition, metadata มอนสเตอร์ไม่เปลี่ยนสนาม, เงิน/ท่าที/สถานที่ NPC ไม่เปลี่ยนการซื้อ, สูตรไม่ต้องปลดด้วยสกิล, และ quest outcome เก็บเซฟได้
- `node tools/audit-world-links.cjs --export /path/to/evertale-content-edits.json` ตรวจ counts/ค่าของฉบับที่ส่งออกจากเกม ต้องแยกสำรองรายงานเก่าก่อนหากต้องการเก็บเทียบกัน การเรียกนี้ไม่เชื่อมบัญชีหรือแก้ฐานข้อมูล
- world-travel.test.cjs, event-story.test.cjs และ content-integration-audit.test.cjs ผ่านซ้ำรอบนี้

รอบนี้เพิ่มรายงาน/เครื่องมือตรวจเท่านั้น ไม่เปลี่ยนกติกาเกม ไม่ลบข้อมูล ไม่แก้บัญชีจริง และไม่เผยแพร่ GitHub
