# ตรวจการเชื่อมฐานข้อมูลกับ Grid

**ผล: ยังเชื่อมไม่ครบ** การปิดกลไก grid ไม่ใช่การยืนยันว่าข้อมูลเก่าทุก record/ทุกช่องมี engine รองรับ

ตรวจจาก source catalog ปัจจุบัน ไม่ได้อ่านข้อมูลแก้ไขเฉพาะบัญชีบน Supabase ทั้งหมด 550 รายการ ข้อมูลต้นฉบับ 504 รายการยังอยู่ รายการ runtime ที่เพิ่มจากโค้ดนับรวมด้วย

| กลุ่ม | จำนวน |
|---|---:|
| ผู้เล่น: adapter ฐานข้อมูล (บางช่องยังคงค่าจากโค้ด) | 29 |
| ผู้เล่น: สกิลประจำคลาส/เสริม ใช้ค่าหลักจากโค้ด | 30 |
| Unique จากระบบสร้างตัวละคร ใช้ค่าจากโค้ด | 10 |
| เวทตามบท ใช้ค่าหลักจากโค้ด | 1 |
| มอนสเตอร์: active adapter | 9 |
| มอนสเตอร์: passive ตัวเลข | 6 |
| ผลกิจกรรมนอก grid | 2 |
| ใช้รับจากเหตุการณ์และเงื่อนไขเรียน นอก grid | 1 |
| รับ/สะสมจากเหตุการณ์ ยังไม่มีเอฟเฟกต์ grid ของ record นี้ | 8 |
| ข้อมูลเก่ายังไม่มีเอฟเฟกต์ grid ที่เชื่อมกับ record นี้ | 118 |
| มอนสเตอร์ใช้ค่าสถานะ/ท่า/ธาตุ/loot บางช่อง | 35 |
| สวมใส่ได้ตามเงื่อนไข โบนัสรองรับเฉพาะที่ parser อ่าน | 156 |
| อาวุธ/การใช้มือไม่ครบตาม adapter | 2 |
| ใช้ฟื้น HP หรือ MP ใน/นอก grid | 17 |
| ซื้อ/ขาย/เก็บ/วัตถุดิบได้ แต่ใช้เอฟเฟกต์ไม่ได้ | 10 |
| ร้านค้า/ผู้ให้บริการสูตร ไม่มีระบบใช้ NPC นี้เป็นสมาชิก grid | 10 |
| ข้อมูล NPC ยังไม่มีบริการ/สมาชิก grid ที่เชื่อม | 31 |
| สูตรปรุงนอก grid | 5 |
| ของดรอป/วัตถุดิบ/ซื้อขาย ไม่ใช่คำสั่งต่อสู้ | 34 |
| เงื่อนไข/ค้นพบ/ความก้าวหน้า ไม่ใช่คำสั่ง grid | 36 |

## ช่องที่แก้ในฐานข้อมูลแล้วไม่เปลี่ยนกติกาปัจจุบัน

- สกิล `decide-*`: cost/cooldown/power/range และกลไกหลักมาจาก creation-data/character-combat; ฐานข้อมูลเชื่อมรูปพื้นที่/สถานะ/ผลักดึง/พื้นค้างเฉพาะท่าที่รองรับ ไม่ได้เชื่อมช่อง damage/resourceCost/cooldown ทุกช่อง การปิด enabled ของ record สกิลประจำคลาสก็ยังไม่ถอนคำสั่งที่ตัวละครมีแล้ว
- Unique `unique-*`: ใช้ตัวเลือกของ character.unique และโค้ด ไม่ได้อ่าน passiveEffects ของ record นี้
- สกิล/เวท catalog ที่รองรับ: อ่านเต๋าดาเมจ/MP/CD/ธาตุ/สถานะ/พื้นที่ แต่ระยะเดิม อาวุธ จำนวน cast points และชนิดเอฟเฟกต์ยังมาจาก adapter; target/targetType และข้อความ buff/debuff ไม่ใช่ตัวสร้างกลไก
- Heal แบบ catalog ต้นฉบับใช้เต๋าคงที่จาก adapter; custom template จึงค่อยอ่าน healing/healDice ที่แก้ได้
- castTime/consumeAllMp/hitCount/XP unlocks และโบนัสพิเศษหลายช่องยังไม่ถูกใช้ รวมถึงคำบรรยาย revival ของไอเท็มไม่ใช่ระบบชุบชีวิต
- monster: อ่านค่าสถานะ/skills/weakness/immunity/loot แต่ stealthDC/initiative/attackType/aiBehavior/combatTactics ไม่ได้ควบคุม engine ปัจจุบัน และไม่ได้สร้างธาตุโจมตีปกติจาก monster.element
- NPC: ใช้ stock/providers สำหรับบริการ แต่ stats/equipment/skills/spells/recruitable ไม่ได้สร้างเพื่อนร่วมทีม; ลินและ NPC ในบทใช้ข้อมูลบทแยก
- อุปกรณ์: ใช้เต๋า/มือ/ธาตุ/DEF และตัวเลขที่ parser รองรับ ไม่รัน special abilities จากข้อความ

รายละเอียดต่อ record และช่องที่ตรวจแล้วอยู่ reports/content-integration.json; ช่องที่ไม่อยู่ในรายการดังกล่าวไม่ได้แปลว่ารองรับทั้งหมด ต้องอ่านตามเงื่อนไข adapter

## รายการที่ยังไม่มีเอฟเฟกต์ grid จาก record

### skill — 76 รายการ

- `preset-skill-heavy-blow` — Heavy Blow
- `preset-skill-battle-cry` — Battle Cry
- `preset-skill-guard-ally` — Guard Ally
- `preset-skill-taunt` — Taunt
- `preset-skill-backstab` — Backstab
- `preset-skill-shadow-step` — Shadow Step
- `preset-skill-hunters-mark` — Hunter's Mark
- `preset-skill-twin-shot` — Twin Shot
- `preset-skill-trap` — Trap
- `preset-skill-arcane-bolt` — Arcane Bolt
- `preset-skill-fire-burst` — Fire Burst
- `preset-skill-frost-lance` — Frost Lance
- `preset-skill-arcane-surge` — Arcane Surge
- `preset-skill-holy-strike` — Holy Strike
- `preset-skill-prayer` — Prayer
- `preset-skill-divine-guard` — Divine Guard
- `preset-skill-haste` — Haste
- `preset-skill-mind-break` — Mind Break
- `preset-skill-sever-arm-tendon` — Sever Arm Tendon
- `preset-skill-sever-leg-tendon` — Sever Leg Tendon
- `preset-skill-eye-stab` — Eye Stab
- `preset-skill-throat-cut` — Throat Cut
- `preset-skill-assassinate` — Assassinate
- `preset-skill-steal` — Steal
- `preset-skill-kazuma-luck` — Kazuma's Luck
- `preset-skill-enemy-detection` — Enemy Detection
- `preset-skill-drain-touch` — Drain Touch
- `preset-skill-goddess-of-water` — Goddess of Water
- `preset-skill-divine-blessing` — Divine Blessing
- `preset-skill-god-bowl` — God Bowl
- `preset-skill-masochism` — Masochism
- `preset-skill-iron-resolve` — Iron Resolve
- `preset-skill-hopeless-swordsmanship` — Hopeless Swordsmanship
- `preset-skill-powerful-slash` — Powerful Slash
- `preset-skill-invisible-providence` — Invisible Providence
- `preset-skill-aura-sense` — Aura Sense
- `preset-skill-return-by-death` — Return by Death
- `preset-skill-spirit-arts` — Spirit Arts
- `preset-skill-ice-affinity` — Ice Affinity
- `preset-skill-rams-wind-affinity` — Ram's Wind Affinity
- `preset-skill-oni-transformation` — Oni Transformation
- `preset-skill-laplace-factor` — Laplace Factor
- `preset-skill-uncast-magic` — Uncast Magic
- `preset-skill-wind-affinity` — Wind Affinity
- `preset-skill-gentle-healing` — Gentle Healing
- `preset-skill-roxy-water-ice-affinity` — Water/Ice Affinity
- `preset-skill-roxy-mana-efficiency` — Mana Efficiency
- `preset-skill-eris-sword-strike` — Sword Strike
- `preset-skill-eris-quick-slash` — Flash Slash
- `preset-skill-eris-cross-slash` — Cross Slash
- `preset-skill-eris-beast-sword` — Beast Sword
- `preset-skill-eris-blade-prodigy` — Blade Prodigy
- `preset-skill-frieren-massive-magical-power` — พลังเวทมหาศาล
- `preset-skill-frieren-barrier` — บาเรีย
- `preset-skill-fern-mana-discipline` — วินัยแห่งมานา
- `preset-skill-fern-rapid-casting` — ร่ายเวทฉับไว
- `preset-skill-kurumi-clock-eye` — Zafkiel: ตาปีศาจแห่งเวลา
- `preset-skill-kurumi-aleph` — Aleph
- `preset-skill-kurumi-bet` — Bet
- `preset-skill-kurumi-zayin` — Zayin
- `preset-skill-kurumi-zafkiel-judgment` — Zafkiel: Final Judgment
- `preset-skill-ryza-brew-potion` — ปรุงยา
- `preset-skill-kirito-horizontal-arc` — Horizontal Arc
- `preset-skill-kirito-sword-dance` — Sword Dance
- `preset-skill-kirito-starburst-stream` — Starburst Stream
- `preset-skill-kirito-dual-blade-instinct` — Dual Blade Instinct
- `preset-skill-asuna-linear` — Linear
- `preset-skill-asuna-star-splash` — Star Splash
- `preset-skill-asuna-healing-light` — Healing Light
- `preset-skill-asuna-mothers-rosario` — Mother's Rosario
- `preset-skill-yuuki-horizontal-square` — Horizontal Square
- `preset-skill-yuuki-vertical` — Vertical
- `preset-skill-yuuki-vorpal-strike` — Vorpal Strike
- `preset-skill-yuuki-eighteen-style-sword` — Eighteen-Style Sword
- `preset-skill-sealed-oni-power` — Sealed Oni Power
- `preset-skill-rams-full-trust` — Ram's Full Trust

### spell — 42 รายการ

- `preset-spell-void-bolt` — Void Bolt
- `preset-spell-frostbolt` — Frostbolt
- `preset-spell-sanctuary` — Sanctuary
- `preset-spell-weaken-mind` — Weaken Mind
- `preset-spell-haste` — Haste
- `preset-spell-enfeeble` — Enfeeble
- `preset-spell-mirror-image` — Mirror Image
- `preset-spell-charm` — Charm
- `preset-spell-create-water` — Create Water
- `preset-spell-healing-word` — Healing Word
- `preset-spell-cure-wounds` — Cure Wounds
- `preset-spell-sacred-flame` — Sacred Flame
- `preset-spell-turn-undead` — Turn Undead
- `preset-spell-resurrection` — Resurrection
- `preset-spell-explosion` — Explosion
- `preset-spell-basic-fire-magic` — Basic Fire Magic
- `preset-spell-shamak` — Shamak
- `preset-spell-huma` — Huma
- `preset-spell-ice-barrier` — Ice Barrier
- `preset-spell-greater-huma` — Greater Huma
- `preset-spell-wind-bolt` — Fura
- `preset-spell-wind-cutter` — El Fura
- `preset-spell-wind-barrier` — Wind Ward
- `preset-spell-wind-bind` — Wind Bind
- `preset-spell-rams-critical-wind` — Ul Fura
- `preset-spell-stone-cannon` — Stone Cannon
- `preset-spell-quagmire` — Quagmire
- `preset-spell-electric` — Electric
- `preset-spell-explosive-stone-cannon` — Explosive Stone Cannon
- `preset-spell-nuclear-explosion` — Nuclear Explosion
- `preset-spell-wind-blade` — Wind Blade
- `preset-spell-sonic-boom` — Sonic Boom
- `preset-spell-healing-wind` — Healing Wind
- `preset-spell-sylphy-wind-barrier` — Wind Barrier
- `preset-spell-grand-tempest` — Grand Tempest
- `preset-spell-water-ball` — Water Ball
- `preset-spell-ice-lance` — Ice Lance
- `preset-spell-aqua-stream` — Aqua Stream
- `preset-spell-frost-prison` — Frost Prison
- `preset-spell-absolute-zero` — Absolute Zero
- `preset-spell-zoltraak` — Zoltraak
- `preset-spell-piercing-bolt` — Piercing Bolt

## ไอเท็มที่มีผลใช้งานไม่รองรับ

- `item-preset-antidote` — Antidote
- `item-preset-torch` — Torch
- `item-preset-smoke-bomb` — Smoke Bomb
- `item-preset-panacea` — Panacea
- `item-preset-holy-water` — Holy Water
- `item-preset-spider-silk` — Spider Silk
- `item-preset-maomao-potent-antidote` — Maomao's Potent Antidote
- `item-preset-moon-kissed-herb` — Moon-Kissed Herb
- `item-preset-silver-root` — Silver Root
- `item-preset-crimson-toadstool` — Crimson Toadstool

## อาวุธที่ adapter ยังไม่รองรับชนิด

- `preset-weapon-zafkiel` — Zafkiel
- `preset-weapon-whip` — Whip

รายการเหล่านี้ยังเก็บ ซื้อขาย ดรอป หรือใช้เป็นวัตถุดิบได้ จึงไม่ควรลบทิ้งเพราะใช้เอฟเฟกต์ไม่ได้

## NPC ที่ไม่มีบริการหรือสมาชิก grid เชื่อม

- `preset-npc-mira-duskwind` — Mira Duskwind
- `preset-npc-talia-goldweaver` — Talia Goldweaver
- `preset-npc-bramwell-stonewatch` — Bramwell Stonewatch
- `preset-npc-roderick-vance` — Captain Roderick Vance
- `preset-npc-old-tam` — Old Tam
- `preset-npc-lyra-emberweave` — Lyra Emberweave
- `preset-npc-fenwick-sly` — Fenwick Sly
- `preset-npc-petra-vale` — Petra Vale
- `preset-npc-magister-corwin` — Magister Corwin
- `preset-npc-bosun-callahan` — Bosun Callahan
- `preset-npc-isolde-draven` — Lady Isolde Draven
- `preset-npc-grey-wanderer` — The Grey Wanderer
- `preset-npc-satou-kazuma` — Satou Kazuma
- `preset-npc-aqua` — Aqua
- `preset-npc-megumin` — Megumin
- `preset-npc-darkness` — Darkness
- `preset-npc-natsuki-subaru` — Natsuki Subaru
- `preset-npc-emilia` — Emilia
- `preset-npc-ram` — Ram
- `preset-npc-rem` — Rem
- `preset-npc-rudeus-greyrat` — Rudeus Greyrat
- `preset-npc-sylphiette` — Sylphiette
- `preset-npc-roxy-migurdia` — Roxy Migurdia
- `preset-npc-eris-greyrat` — Eris Boreas Greyrat
- `preset-npc-kirito` — Kirito
- `preset-npc-asuna` — Asuna
- `preset-npc-yuuki` — Yuuki
- `preset-npc-frieren` — Frieren
- `preset-npc-fern` — Fern
- `preset-npc-kurumi` — Tokisaki Kurumi
- `preset-npc-kishirika-kishirisu` — Kishirika Kishirisu

## การอ้างอิงแบบ reference/loot/stock/recipe ที่หาเป้าหมายไม่พบ — 0


## อุปกรณ์สวมได้แต่ไม่มีโบนัสต่อสู้ตัวเลข — 11

- `accessory:preset-accessory-sage-pendant` — Sage Pendant
- `accessory:preset-accessory-holy-symbol` — Holy Symbol
- `accessory:preset-accessory-charmers-locket` — Charmer's Locket
- `accessory:preset-accessory-copper-ring-of-the-novice` — แหวนทองแดงของผู้เริ่มต้น (Copper Ring of the Novice)
- `accessory:preset-accessory-carved-wooden-travelers-pendant` — จี้ไม้แกะสลักนักเดินทาง (Carved Wooden Traveler's Pendant)
- `accessory:preset-accessory-coastal-seashell-necklace` — สร้อยคอเปลือกหอยชายฝั่ง (Coastal Seashell Necklace)
- `accessory:preset-accessory-silver-ring-of-fortune` — แหวนเงินแห่งโชค (Silver Ring of Fortune)
- `accessory:preset-accessory-amber-traveler-pendant` — จี้อำพันนักเดินทาง (Amber Traveler Pendant)
- `accessory:preset-accessory-circlet-of-minor-wisdom` — มงกุฎเล็กแห่งปัญญา (Circlet of Minor Wisdom)
- `accessory:preset-accessory-holy-clerics-talisman` — เครื่องรางนักบวชศักดิ์สิทธิ์ (Holy Cleric's Talisman)
- `accessory:preset-accessory-high-archmages-circlet` — มงกุฎเล็กจอมเวทชั้นสูง (High Archmage's Circlet)

บางชิ้นตั้งใจเป็นเครื่องประดับ/ของสะสม ไม่ถือเป็นบั๊กทั้งหมด แต่ชื่อหรือคำบรรยาย INT/WIS/CHA ไม่ได้เพิ่มค่าสถานะจริง

## ชื่อเก่าที่ผ่าน allowlist เรียน แต่ไม่มีคำสั่ง grid จาก record นี้ — 6

- `skill:preset-skill-guard-ally` — Guard Ally
- `skill:preset-skill-backstab` — Backstab
- `skill:preset-skill-hunters-mark` — Hunter's Mark
- `skill:preset-skill-arcane-bolt` — Arcane Bolt
- `skill:preset-skill-fire-burst` — Fire Burst
- `skill:preset-skill-holy-strike` — Holy Strike

รายการ 118 รายการอาจยังถูกค้นพบหรือแสดงในห้องสมุด จึงไม่ใช่ข้อมูลที่ควรลบอัตโนมัติ การมีชื่อเหมือนสกิลใหม่ไม่ทำให้ ID เก่าใช้กลไกใหม่โดยอัตโนมัติ

## ลำดับแก้ที่แนะนำ

1. ป้องกันการเรียน/เสียเงินกับ 6 รายการเก่าที่ไม่มีคำสั่ง grid (ทดสอบ R.learn จริงแล้วทั้ง 6 รายการหัก 20 เหรียญและเพิ่ม learned แต่ไม่มี catalog adapter) และแสดงสถานะรองรับชัดเจน
2. ให้ช่องแก้ฐานข้อมูลตรงกับค่าที่ engine ใช้จริง โดยเฉพาะสกิลประจำคลาสและ heal; ไม่ควรแสดงว่าบันทึกค่าแล้วมีผลถ้ายังอ่านค่าคงที่
3. จัดประเภทไอเท็มที่ใช้ได้/วัตถุดิบ/ของใช้ที่ยังไม่มีระบบ แยกจากการมีราคาในร้าน
4. เชื่อมชนิดอาวุธใหม่และ NPC เข้าปาร์ตี้เฉพาะเมื่อเลือกพัฒนา ไม่ลบข้อมูลเก่าหรือจับคู่ชื่อทับ ID ใหม่อัตโนมัติ

## วิธีตรวจซ้ำ

`node tools/audit-content.cjs` สร้างรายงาน baseline ใหม่ หรือ `node tools/audit-content.cjs --export /path/to/content.json` เพื่อรวมไฟล์ส่งออกฐานข้อมูลบัญชีจริงโดยไม่เชื่อม Supabase เครื่องมือไม่แก้ข้อมูลเกมหรือเซฟ

ห้ามตีความ incoming=0 ว่าเป็นข้อมูลทิ้ง: เกมมีการค้นพบ/เลือก/วางมอนสเตอร์โดยตรง รายการนี้ตรวจการเชื่อมของโค้ด ไม่ใช่สถิติว่าเจ้าของเคยใช้ record ไหนจริง
