# ผลตรวจเกมเก่าและการนำ engine กลับมาใช้ — 5 พฤศจิกายน 2026

อัปเดตล่าสุด: เชื่อมไอเท็มในสนาม ของดรอป และช่องอุปกรณ์แล้ว ดู EQUIPMENT-SYSTEM.md สำหรับขอบเขตผลอุปกรณ์และไอคอนใหม่ ตารางด้านล่างบันทึกสถานะตอนย้าย economy ครั้งแรก ไม่ใช่รายการงานคงเหลือทั้งหมด

ตรวจจากไฟล์ที่ผู้ใช้แนบ `dnd-dm-game-v20.3-login-white-fields.jsx` (16,404 บรรทัด) โดยแยกอ่าน declaration ข้อมูลและฟังก์ชัน ไม่รันแอป React ทั้งไฟล์ ไม่ใช้คีย์หรือระบบเรียก AI/บัญชีของไฟล์เก่า

## ฐานข้อมูลดึงมาครบหรือไม่

**ครบตรงกับไฟล์แนบ: 504 รายการ / 13 หมวด / 205 ฟิลด์ใน schema** เทียบราย ID และค่าทุกฟิลด์ รวมลำดับ array; ประเภทฟอร์ม ตัวเลือก และข้อความช่วยเหลือตรงกันทั้งหมด ไม่พบ typed reference ที่ชี้ไป ID/ชื่อที่ไม่มีในหมวดปลายทาง การตรวจนี้ไม่ได้อ่านข้อมูลส่วนตัว/รายการแก้ไขที่มีเฉพาะบน Supabase เดิม และไม่ได้สรุปว่าเอฟเฟกต์ทุกรายการทำงานในเกมใหม่แล้ว

| หมวด | ในไฟล์แนบ | ในโปรเจกต์ | รายการขาด / เปลี่ยนค่า |
| --- | ---: | ---: | ---: |
| NPC | 40 | 40 | 0 |
| มอนสเตอร์ | 35 | 35 | 0 |
| อาวุธ | 31 | 31 | 0 |
| เกราะ | 25 | 25 | 0 |
| เครื่องประดับ | 50 | 50 | 0 |
| หมวก | 25 | 25 | 0 |
| รองเท้า | 25 | 25 | 0 |
| เวท | 59 | 59 | 0 |
| สกิล | 112 | 112 | 0 |
| ความชำนาญ | 36 | 36 | 0 |
| ไอเท็ม | 27 | 27 | 0 |
| สูตรปรุง | 5 | 5 | 0 |
| ของดรอป | 34 | 34 | 0 |

สกิล/เวทของระบบใหม่ถูกเพิ่มผ่าน `rules.records()` ขณะใช้งาน แยกจาก 504 รายการตั้งต้น จึงไม่ถือว่าเป็นรายการที่ตกหล่นจากไฟล์เก่า

หลักฐาน: `docs/legacy-source-manifest.json` มี SHA-256 ของไฟล์ต้นทาง fingerprint รายรายการ/schema และชื่อ+บรรทัดฟังก์ชันที่นำมาใช้; `legacy-content-parity.test.cjs` ตรวจซ้ำกับโปรเจกต์ได้โดยไม่ต้องรันไฟล์เก่า

## ข้อตกลงและขอบเขตรอบนี้

ผู้ใช้เลือก **คง grid / 2 AP และนำ engine เก่ามาเชื่อมทีละส่วน** การตรวจจับ d100 และระบบคลาส/ตัวละครรุ่นใหม่ยังใช้กติกาปัจจุบัน

| ระบบในเกมเก่า | ผลตรวจ / สถานะ |
| --- | --- |
| คลังไอเท็มรวมปาร์ตี้, คลังอุปกรณ์สำรอง | ดึงฟังก์ชันเดิมมาใช้; ตัวเชื่อมปัจจุบันมีผู้เล่นหลักหนึ่งคน |
| ร้านค้า/ตรวจสินค้าของ NPC/ราคา/ขอบเขตต่อรอง | เชื่อมแล้ว ซื้อจาก NPC และขายคืนได้จากหน้าเกม ราคาซื้อ UI ใช้ราคาอ้างอิงที่ผู้สร้างตั้งไว้; engine ยังคง clamp ราคาตามกติกาเดิม |
| สูตรปรุง/ผู้ให้บริการ/วัตถุดิบ/ค่าบริการ | เชื่อมแล้ว ใช้สูตรเดิมและรายการจริง เช็กทุกเงื่อนไขก่อนบันทึก |
| ผลไอเท็ม HP/MP | ดึงตัวคำนวณเดิมมาใช้กับการฟื้นฟูนอกสนาม; ใช้หนึ่งชิ้นและไม่ใช้เมื่อพลังเต็ม |
| cure_status และเอฟเฟกต์อื่นที่ตัวคำนวณเดิมไม่รองรับ | ไม่ทำสำเร็จปลอม ปุ่มใช้ไม่เปิดสำหรับเอฟเฟกต์ที่ยังไม่รองรับ |
| ช่องสวมอุปกรณ์เดิม/บัฟอุปกรณ์ | ซื้อ–เก็บ–ขายในคลังได้ แต่ยังไม่สวมเข้าระบบต่อสู้ใหม่ อุปกรณ์เก่าใช้ damageDice/slot objects ส่วนเกมใหม่ใช้ IDs และพลังตัวเลข จึงต้องมี adapter และทดสอบแยก |
| ของดรอปจากชัยชนะ | มี engine เดิม ต้องเชื่อม reference มอนสเตอร์กับผลชนะใน grid ต่อ วัตถุดิบปรุงยายังไม่ถูกแจกให้ผู้เล่นอัตโนมัติในรอบนี้ |
| ดาเมจ d20, คริทิคอล, หลายฮิต, ธาตุ, เกราะ, barrier, passives | พบโค้ดเดิมจริง ยังไม่แทนสูตรต่อสู้ปัจจุบัน ต้องทำ mapping กติกาเป็นส่วน ๆ |
| Initiative / turn order / action budget | มีของเดิม แต่ไม่ย้ายทับ 2 AP |
| สกิล/เวท, cast/interrupt, cooldown | มีทั้งเก่าและใหม่ ต้องเทียบผลและความต่างก่อนเชื่อม |
| downed/death save/revive, transformation, return-by-death | พบโค้ดเดิม ยังไม่เปิดใช้กับเซฟปัจจุบัน |
| ระบบ DM/AI, React UI, auth/save เดิม | ไม่ยกทั้งแอปมาทับ ไม่ย้ายการเชื่อมต่อบัญชีหรือคีย์ |

`docs/legacy-engine-inventory.json` เป็นดัชนีฟังก์ชัน non-JSX ที่ parser อ่านได้ 314 ตัว ไม่ได้หมายความว่าทุกตัวเป็น pure function หรือเชื่อมเข้าระบบใหม่แล้ว

## สิ่งที่เปลี่ยนในโปรเจกต์จริง

- `dist/legacy-economy.js`: 20 ฟังก์ชันเดิมและค่าคงที่ที่จำเป็น ดึงเนื้อหาฟังก์ชันตรงจากต้นฉบับ มี provenance/hash
- `dist/catalog-economy.js`: ตัวเชื่อมกับเซฟใหม่; รายการผ่านแล้วจึงสร้าง snapshot ใหม่ บล็อกระหว่างต่อสู้/เหตุการณ์ ตรวจจำนวนและขนาดคลัง ป้องกันสูตรส่วนผสมชื่อซ้ำถูกหักไม่ครบ
- `dist/catalog-services.js`: หน้า “ร้านค้า คลังไอเท็ม และปรุงยา” ใช้ข้อมูลผ่าน `rules.records()` จึงอ่าน overrides ของฐานข้อมูลปัจจุบันด้วย
- เพิ่ม optional `catalogInventory` ใน save v3; โหลดเซฟเก่าที่ไม่มี field นี้ได้โดยไม่เติมคลังหรือเปลี่ยนอุปกรณ์เดิมอัตโนมัติ ใช้ gold และ HP/MP ของตัวละครจริง
- คลังใหม่นี้ยังไม่รวมเป็นจำนวนเดียวกับ potions/reagents/อาวุธฝึกของระบบใหม่ ต้องเชื่อมอย่างเจาะจงเมื่อย้ายไอเท็มในสนามและของดรอปต่อ

## ตรวจซ้ำ

```
node legacy-content-parity.test.cjs
node catalog-economy.test.cjs
NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules node tools/qa-runtime.cjs catalog-services-ui.test.cjs
node tools/audit-legacy-source.cjs /path/to/original.jsx
```

เครื่องมือตรวจ source ใช้ parser ที่มาพร้อม Node 24 ของ environment นี้ และเขียนผลละเอียดใต้ artifacts/legacy-audit (ignored) ควรเก็บไฟล์ต้นฉบับของผู้ใช้ไว้สำหรับตรวจซ้ำ ไม่ต้องนำทั้ง JSX ไปโหลดในหน้าเกม

ทดสอบราคา/ซื้อ–ขาย/ปรุง/ใช้ยา/ความล้มเหลวแบบไม่หักของ–เงิน/เก็บและโหลดเซฟ/คลังอุปกรณ์/ปิดธุรกรรมขณะต่อสู้; browser ใช้ mock auth/storage ไม่แก้เซฟผู้เล่นจริง

## ลำดับถัดไปที่แนะนำ

1. เชื่อมของดรอปจากฐานข้อมูลเดิมกับชัยชนะบน grid เพื่อให้ได้วัตถุดิบจริง โดยป้องกันการรับรางวัลซ้ำ
2. เชื่อมใช้ไอเท็มจากคลังนี้ในสนามให้กิน 1 AP และใช้ effect calculator เดิม
3. ทำ adapter อุปกรณ์/ช่องสวมและผล passive โดยคง ID ของเก่าและเซฟเดิม พร้อมข้อกำหนด conversion ที่ตรวจได้
4. ค่อยเทียบระบบดาเมจ ธาตุ สถานะ สกิล/เวททีละส่วนภายใต้ grid/2 AP

## เชื่อมของดรอป — 2026-11-05

นำ `getMonsterLootEntries`, `pickWeightedLootItem`, `rollMonsterLootDrop` และตารางน้ำหนัก/โอกาสโบนัสเดิมมาใช้ใน `legacy-loot.js`: หนึ่งชิ้นเมื่อมีรายการที่เปิดใช้ และโอกาสโบนัส 40% ตามต้นฉบับ ไม่มีการเพิ่มวัตถุดิบที่ไม่ได้อยู่ในตารางมอนสเตอร์

ศัตรูในสนามใหม่เก็บ monsterId ของรายการต้นทาง ผลดรอปคำนวณด้วย seed จาก encounter ID และแช่ไว้ใน catalogDrops ของสนามเมื่อเปิดเล่นครั้งแรก จากนั้นเซฟ/ผลรางวัลอ่านชุดเดิม การรับผลชนะเพิ่มไอเท็มและวัตถุดิบเข้า catalogInventory.items ส่วนอุปกรณ์เข้า gearStash และล้าง expedition ใน snapshot เดียวกับรางวัลเดิม จึงไม่แจกซ้ำจากการโหลดเซฟหลังรับผล ไม่มีการเปลี่ยนทอง/EXP/2 AP เดิม

แพ้ ถอนตัว สนามฝึกอาวุธคู่ หรือสนามเก่าที่ไม่มี monsterId ไม่ให้ของดรอปย้อนหลังจากการเดาชื่อมอนสเตอร์ ข้อมูลรางวัลมีขอบเขตและตรวจชนิดในตัวตรวจเซฟ

ผ่าน catalog-loot.test.cjs, ชุดกติกา/ข้อมูลรวม 19 ไฟล์ และ catalog-loot-ui.test.cjs (ชนะด้วยการโจมตีจริงใน browser, preview/reload, รับของ, reload หลังรับ และยืนยันครั้งเดียว; ใช้ mock cloud)

## ใช้ไอเท็มจากคลังในสนาม — 2026-11-05

เพิ่ม useInCombat ใน adapter โดยใช้ resolveItemEffect เดิม ไอเท็ม heal_hp/restore_mp ใช้กับสมาชิกที่กำลังสั่งการและยังมีชีวิตได้ครั้งละหนึ่งชิ้น/1 AP ไม่ได้เพิ่มระยะใช้กับคนอื่นหรือชุบชีวิต คิดผลจาก HP/มานาของ unit ในสนามและจำกัดด้วยค่าสูงสุดของ unit นั้น สมาชิกทีมใช้คลังเดียวกัน จำนวนถูกหักจาก catalogInventory ทันทีและบันทึกพร้อม AP/ผลการใช้ ไม่หักยาพก/reagents ซ้ำ

ไม่มี AP, กำลังร่าย, ติดสตัน, พลังเต็ม, ไอเท็มหมด/ปิดใช้งาน หรือ effect ที่ยังไม่รองรับ จะไม่เปลี่ยน snapshot และไม่เสียของ/AP เมนูสนามแยก “ยาพก” กับ “ไอเท็มจากคลัง” ชัดเจน ไอเท็มอื่นที่ยังไม่รองรับไม่ถูกแสดงเป็นคำสั่งใช้

พบและแก้ settle ที่เรียก validator แบบเก่าโดยตรง ให้เรียก validator ของระบบต่อสู้ปัจจุบัน เพื่อรับผลได้เมื่อสมาชิกอื่นยังเหลือ 2 AP

ทดสอบ catalog-combat-items.test.cjs และ catalog-combat-items-ui.test.cjs ครอบคลุม HP/MP, สมาชิกที่สั่งการ, ไม่หักยาพกซ้ำ, ปฏิเสธโดยไม่เสียของ, จำนวน/AP/ผลหลัง reload และคลังหลังรับผล/ถอนตัว

## Catalog action migration, phase 1

26 legacy skill/spell records now have explicit current-combat adapters; see [CATALOG-COMBAT-ACTIONS.md](CATALOG-COMBAT-ACTIONS.md). Learned canonical keys are snapshotted into the encounter without replacing class skills. Damage dice, MP, cooldown and elements reuse source data; formerly descriptive healing/buff records use clearly identified new grid formulas. Remaining actions, spell progression and monster-skill AI are not counted as migrated.

## Monster action migration, phase 1

Nine active monster skill adapters now cover references on all 35 source monster records, with saved source stats/actions, MP/cooldown enforcement, deterministic target/movement decisions and old-encounter compatibility. See [MONSTER-AI.md](MONSTER-AI.md). This does not count the six monster passives or the old d20 defense/accuracy/evasion model as migrated.

## Monster passive migration

The six original monster passive records now have typed, snapshotted adapters backed by the original aggregation helpers. See [MONSTER-PASSIVES.md](MONSTER-PASSIVES.md) for the explicit conversion of hit-roll bonuses to current grid accuracy, physical/magic mitigation and additive attack percentages. Base monster d20 defense/accuracy/evasion and HP balance are still separate work.

## Monster base stats migration

New design-1 free fields snapshot actual source HP/MP/normal ATK and explicit Defense/Accuracy/Evasion/physical/magic reduction inputs for all 35 original monsters. Existing fights are preserved. See [MONSTER-STATS.md](MONSTER-STATS.md); hit conversion is a new grid rule, not the old d20 engine. Rewards, initiative and detection base stats are not migrated by this phase.
