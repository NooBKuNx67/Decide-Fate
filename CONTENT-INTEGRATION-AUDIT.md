# ฐานข้อมูลเชื่อมใช้งานจริง / รายการรอเจ้าของตรวจ

อัปเดต 9 พ.ย. 2026 หลังแก้การเชื่อมต่อ ตรวจ 550 รายการใน source catalog ไม่รวมข้อมูลแก้เฉพาะบัญชีบน Supabase

| กลุ่ม | จำนวน |
|---|---:|
| ผู้เล่น: adapter ฐานข้อมูล (บางช่องยังคงค่าจากโค้ด) | 95 |
| ผู้เล่น: สกิลประจำคลาส ใช้ snapshot ค่าจากฐานข้อมูล | 30 |
| Unique จากระบบสร้างตัวละคร ใช้ค่าจากโค้ด | 10 |
| เวทตามบท ใช้ค่าหลักจากโค้ด | 1 |
| มอนสเตอร์: active adapter | 9 |
| มอนสเตอร์: passive ตัวเลข | 6 |
| ผลกิจกรรมนอก grid | 2 |
| ใช้รับจากเหตุการณ์และเงื่อนไขเรียน นอก grid | 1 |
| รับ/สะสมจากเหตุการณ์ ยังไม่มีเอฟเฟกต์ grid ของ record นี้ | 8 |
| รายการเก่าที่แยกรอเจ้าของตรวจ ไม่เปิดให้เสียเงินเรียน | 52 |
| มอนสเตอร์ใช้ค่าสถานะ/ท่า/ธาตุ/loot บางช่อง | 35 |
| สวมใส่ได้ตามเงื่อนไข โบนัสรองรับเฉพาะที่ parser อ่าน | 158 |
| ไอเท็มใช้จริง: ฟื้นพลัง/ล้างสถานะ/ควันตามชนิด | 21 |
| วัตถุดิบ/ของใช้ที่แยกรอเจ้าของตรวจ | 6 |
| NPC รับเข้าทีมได้ ใช้ค่าสถานะ/อุปกรณ์/วิชาที่รองรับใน grid | 29 |
| ร้านค้า/ผู้ให้บริการสูตร ไม่มีระบบใช้ NPC นี้เป็นสมาชิก grid | 4 |
| NPC โลก/ข้อมูลบรรยาย ไม่เปิด recruitable | 8 |
| สูตรปรุงนอก grid | 5 |
| ของดรอป/วัตถุดิบ/ซื้อขาย ไม่ใช่คำสั่งต่อสู้ | 34 |
| เงื่อนไข/ค้นพบ/ความก้าวหน้า ไม่ใช่คำสั่ง grid | 36 |

## ที่เชื่อมแล้ว

- Catalog ผู้เล่น 95 รายการ: เต๋าดาเมจ/รักษา/บาเรีย, MP/CD, ธาตุ/สถานะที่รองรับ, เป้าหมายเดี่ยว/ทั้งหมด/รูปพื้นที่, hitCount และ lifesteal ตามช่องข้อมูล ไม่ alias ทับ ID สกิลคลาส
- สกิลประจำคลาส 30 รายการ: snapshot ค่า MP/CD/damage/healing/element/actionRange/actionPower/castTime และ enabled ตอนเริ่มไฟต์; editor แสดงช่องที่รองรับให้กลุ่มนี้; เซฟเก่าใช้กติกาเดิมจนเริ่มไฟต์ใหม่
- รายการเก่า 6 ชื่อที่เคยเสียเงินเรียนแล้วไม่มีคำสั่งมี catalog adapter และทดสอบร่ายจริงแล้ว
- Zafkiel/Whip มีชนิด firearm/whip; ranger ใช้ปืนและ rogue ใช้แส้; เก็บกติกามือและระยะจริง
- Antidote/Maomao antidote/Panacea ใช้ล้างสถานะ; Smoke Bomb วางควัน 2×2 ด้วย 1 AP; ไอเท็มที่เหลือยังเก็บซื้อขาย/ปรุงยาได้
- NPC recruitable รับ/ออก/พักทีมได้ ใช้ค่าสถานะและอุปกรณ์จาก DB มี AP/MP และวิชาที่รองรับของตนเอง ใช้ในสนามอิสระและบท มี snapshot/เซฟ/settle และป้องกันออกแล้วรับใหม่เพื่อเติมพลังฟรี

## รายการรอเจ้าของตรวจ — 77

เปิดฐานข้อมูลจากเมนูหลัก แล้วติ๊ก “แสดงเฉพาะรอเจ้าของตรวจ” ข้อมูลยังอยู่ครบ ไม่เปิดให้เสียเงินเรียนหรือสุ่มแจก/ค้นพบเป็นความสามารถใช้งานจริง จนกว่าข้อมูล/กลไกจะรองรับ

- `accessory:preset-accessory-sage-pendant` — Sage Pendant — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-holy-symbol` — Holy Symbol — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-charmers-locket` — Charmer's Locket — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-copper-ring-of-the-novice` — แหวนทองแดงของผู้เริ่มต้น (Copper Ring of the Novice) — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-carved-wooden-travelers-pendant` — จี้ไม้แกะสลักนักเดินทาง (Carved Wooden Traveler's Pendant) — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-coastal-seashell-necklace` — สร้อยคอเปลือกหอยชายฝั่ง (Coastal Seashell Necklace) — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-silver-ring-of-fortune` — แหวนเงินแห่งโชค (Silver Ring of Fortune) — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-amber-traveler-pendant` — จี้อำพันนักเดินทาง (Amber Traveler Pendant) — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-circlet-of-minor-wisdom` — มงกุฎเล็กแห่งปัญญา (Circlet of Minor Wisdom) — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-holy-clerics-talisman` — เครื่องรางนักบวชศักดิ์สิทธิ์ (Holy Cleric's Talisman) — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `accessory:preset-accessory-high-archmages-circlet` — มงกุฎเล็กจอมเวทชั้นสูง (High Archmage's Circlet) — ของสะสม/โบนัสคำบรรยาย ไม่มีโบนัสตัวเลขต่อสู้ — เจ้าของตรวจว่าคงเป็นของตกแต่งหรือกำหนดตัวเลข
- `spell:preset-spell-sanctuary` — Sanctuary — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `spell:preset-spell-weaken-mind` — Weaken Mind — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `spell:preset-spell-haste` — Haste — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `spell:preset-spell-enfeeble` — Enfeeble — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `spell:preset-spell-mirror-image` — Mirror Image — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `spell:preset-spell-charm` — Charm — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `spell:preset-spell-resurrection` — Resurrection — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `spell:preset-spell-explosion` — Explosion — เวทพิเศษ: ใช้ MP ทั้งหมด/สะสมร่าย/สเกลดาเมจ/หมดแรง — แยกให้เจ้าของตรวจขอบเขตก่อนเปิดใช้
- `spell:preset-spell-shamak` — Shamak — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `spell:preset-spell-nuclear-explosion` — Nuclear Explosion — เวทพิเศษ: ใช้ MP ทั้งหมด/สะสมร่าย/สเกลดาเมจ/หมดแรง — แยกให้เจ้าของตรวจขอบเขตก่อนเปิดใช้
- `spell:preset-spell-piercing-bolt` — Piercing Bolt — เวทพิเศษ: ใช้ MP ทั้งหมด/สะสมร่าย/สเกลดาเมจ/หมดแรง — แยกให้เจ้าของตรวจขอบเขตก่อนเปิดใช้
- `skill:preset-skill-heal` — Heal — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-prayer` — Prayer — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-divine-guard` — Divine Guard — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-haste` — Haste — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-mind-break` — Mind Break — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-sever-arm-tendon` — Sever Arm Tendon — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-sever-leg-tendon` — Sever Leg Tendon — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-throat-cut` — Throat Cut — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-assassinate` — Assassinate — เวทพิเศษ: ใช้ MP ทั้งหมด/สะสมร่าย/สเกลดาเมจ/หมดแรง — แยกให้เจ้าของตรวจขอบเขตก่อนเปิดใช้
- `skill:preset-skill-steal` — Steal — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-kazuma-luck` — Kazuma's Luck — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-enemy-detection` — Enemy Detection — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-drain-touch` — Drain Touch — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-goddess-of-water` — Goddess of Water — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-divine-blessing` — Divine Blessing — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-masochism` — Masochism — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-iron-resolve` — Iron Resolve — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-hopeless-swordsmanship` — Hopeless Swordsmanship — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-invisible-providence` — Invisible Providence — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-aura-sense` — Aura Sense — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-return-by-death` — Return by Death — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-spirit-arts` — Spirit Arts — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-ice-affinity` — Ice Affinity — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-rams-wind-affinity` — Ram's Wind Affinity — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-oni-transformation` — Oni Transformation — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-laplace-factor` — Laplace Factor — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-uncast-magic` — Uncast Magic — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-demon-eye` — Demon Eye — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-wind-affinity` — Wind Affinity — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-gentle-healing` — Gentle Healing — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-roxy-water-ice-affinity` — Water/Ice Affinity — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-roxy-mana-efficiency` — Mana Efficiency — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-eris-blade-prodigy` — Blade Prodigy — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-frieren-massive-magical-power` — พลังเวทมหาศาล — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-frieren-barrier` — บาเรีย — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-fern-mana-discipline` — วินัยแห่งมานา — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-fern-rapid-casting` — ร่ายเวทฉับไว — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-kurumi-clock-eye` — Zafkiel: ตาปีศาจแห่งเวลา — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-ryza-brew-potion` — ปรุงยา — ท่าพิเศษหรือผลบรรยายที่ยังไม่มีตัวประมวลผลตรงกับข้อมูล — ไม่เปิดให้เสียเงินเรียนหรือใช้ต่อสู้
- `skill:preset-skill-kishirika-identification` — Identification — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-kishirika-magic-power` — Magic Power — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-kishirika-clairvoyance` — Clairvoyance — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-kishirika-thousand-mile-eye` — Thousand-Mile Eye — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-kishirika-mind-reading-eye` — Mind Reading Eye — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-kishirika-copy-eye` — Copy Eye — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-kishirika-hypnosis-eye` — Hypnosis Eye — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-kirito-dual-blade-instinct` — Dual Blade Instinct — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-sealed-oni-power` — Sealed Oni Power — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `skill:preset-skill-rams-full-trust` — Ram's Full Trust — Passive/เรื่องราวจากเกมเก่า — เก็บให้เจ้าของตรวจ ไม่อ่านคำบรรยายเป็นกลไกอัตโนมัติ
- `item:item-preset-torch` — Torch — อุปกรณ์/วัตถุดิบจากเกมเก่า ยังไม่กำหนดผลกดใช้ใน grid; เจ้าของตรวจและเลือก itemAction ได้
- `item:item-preset-holy-water` — Holy Water — อุปกรณ์/วัตถุดิบจากเกมเก่า ยังไม่กำหนดผลกดใช้ใน grid; เจ้าของตรวจและเลือก itemAction ได้
- `item:item-preset-spider-silk` — Spider Silk — อุปกรณ์/วัตถุดิบจากเกมเก่า ยังไม่กำหนดผลกดใช้ใน grid; เจ้าของตรวจและเลือก itemAction ได้
- `item:item-preset-moon-kissed-herb` — Moon-Kissed Herb — อุปกรณ์/วัตถุดิบจากเกมเก่า ยังไม่กำหนดผลกดใช้ใน grid; เจ้าของตรวจและเลือก itemAction ได้
- `item:item-preset-silver-root` — Silver Root — อุปกรณ์/วัตถุดิบจากเกมเก่า ยังไม่กำหนดผลกดใช้ใน grid; เจ้าของตรวจและเลือก itemAction ได้
- `item:item-preset-crimson-toadstool` — Crimson Toadstool — อุปกรณ์/วัตถุดิบจากเกมเก่า ยังไม่กำหนดผลกดใช้ใน grid; เจ้าของตรวจและเลือก itemAction ได้

## ขอบเขตที่ยังไม่ตีความเป็นกลไก

Unique ของระบบสร้างตัวละครยังเป็นกลไกเฉพาะจากโค้ด ไม่รันข้อความ passiveEffects อิสระ; NPC lore/attitude/relationships/gold เป็นข้อมูลโลก ไม่จำลองความสัมพันธ์หรือโอนกระเป๋า NPC ให้ผู้เล่น; ช่อง AI behavior/initiative ของมอนสเตอร์ยังไม่เปลี่ยนระบบ AI/ทีมเทิร์นปัจจุบัน; ข้อความบรรยายอุปกรณ์ไม่ใช่สคริปต์ ต้องใช้โบนัสตัวเลขที่รองรับ ท่าพิเศษที่ระบุในหมวดรอตรวจไม่ถูกลดรูปเป็นท่าโจมตีปลอม

## ตรวจซ้ำ

`node tools/audit-content.cjs` หรือ `node tools/audit-content.cjs --export /path/to/content.json` อ่านข้อมูลโดยไม่เชื่อม Supabase; ราย record ใน reports/content-integration.json; หลักฐานก่อนแก้ใน docs/CONTENT-INTEGRATION-AUDIT-BEFORE.md และ reports/content-integration-before.json

การอ้างอิงแบบ schema reference/loot/stock/recipe ที่หาเป้าหมายไม่พบ: 0 รายการ ไม่มี incoming reference ไม่ได้หมายความว่าลบทิ้งได้ เพราะมีการเลือก/ค้นพบ/วางโดยตรง
