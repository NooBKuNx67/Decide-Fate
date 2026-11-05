# ช่องอุปกรณ์และไอคอน — 5 พฤศจิกายน 2026

เปิด “อุปกรณ์สวมใส่” บนหน้าตัวละคร มี 10 ช่องรอบไอคอนผู้เล่น: หมวก, เกราะ, ผ้าคลุม, รองเท้า, มือขวา, มือซ้าย, เครื่องประดับ 1–4 ไม่มีตัวละครเคลื่อนไหว

## การใส่/ถอด

คลิกช่อง แล้วเลือกของที่มีอยู่จริงในคลัง ระบบแยกจำนวนของแต่ละชิ้น; ใส่เครื่องประดับชื่อเดียวกันสี่ช่องต้องมีครบสี่ชิ้น การเปลี่ยนชิ้นจะคืนชิ้นเดิมเข้าคลังในธุรกรรมเดียว อาวุธสองมือใส่มือขวาและกันมือซ้าย; ของที่ถูกแทนที่กลับเข้าคลัง ไม่สร้างสำเนาอาวุธสองมือสองชิ้น ถอดของหรือสลับระหว่างอาวุธฝึกกับอุปกรณ์จากฐานข้อมูลได้

ยังใช้เงื่อนไขคลาส/ความชำนาญของเกมปัจจุบัน: อาวุธคู่ต้องมี Dual Wield, โล่ใช้กับอัศวิน, อาวุธต้องอยู่ในชนิดที่คลาสใช้ได้ เปลี่ยนของไม่ได้ระหว่างสนาม เหตุการณ์ หรือเมื่อตัวละครตาย การบันทึกเป็น optional catalogEquipment ใน save v3; เซฟเก่าไม่ถูกบังคับเปลี่ยนอุปกรณ์เมื่อโหลด

## ของและไอคอน

ไฟล์ต้นทางเก่าไม่มีรายการผ้าคลุมหรือโล่ที่สวมได้จริง จึงเพิ่ม Traveler's Cape และ Wooden Shield เป็นรายการเสริมของเกมใหม่ โดยไม่เปลี่ยน 504 รายการเดิม เพิ่มผู้ขาย “ช่างอุปกรณ์” สำหรับของพื้นฐานระดับ Common ใช้ราคาและธุรกรรมร้านค้าเดิม

มีไฟล์ไอคอน SVG เริ่มต้นแยกรายการ 219 รายการ (รวมของใช้/ของดรอป) และอาวุธฝึก ภาพเป็นสัญลักษณ์ตามหมวดที่มีสี/รหัสแยกรายการ ไม่ใช่ภาพวาดเฉพาะชิ้นระดับงานภาพสำเร็จ ผู้ใช้เปลี่ยนรูปได้จากเมนูหลัก → ฐานข้อมูล → รายการ → ไอคอนของชิ้นนี้ รองรับระบบอัปโหลด/เซฟ/ซิงก์ฐานข้อมูลเดิม ไอคอนในช่องและคลังอ่านจากรายการเดียวกัน

schema เดิม 205 ฟิลด์ถูกเก็บครบ เพิ่ม icon ใน weapon/armor/helmet/boots/accessory/item/dropItem และ equipSlot ใน armor (armor/cloak/leftHand) รวมเป็น 213 ฟิลด์ ส่วนข้อมูลใหม่เพิ่มขณะอ่านผ่าน rules.records() จึงไม่เปลี่ยน snapshot ข้อมูลเก่าที่ตรวจไว้

## ผลในสนาม

- อาวุธหลัก/รองจากคลังมีข้อมูลต่อ unit และตรึงไว้กับสนามที่เริ่มแล้ว เปลี่ยน icon/ฐานข้อมูลระหว่างสนามไม่เปลี่ยนค่าสนามนั้นย้อนหลัง
- ดาเมจอาวุธอ่าน damageDice ของรายการจริงและทอยด้วย RNG ที่บันทึกในสนาม; ability STR/DEX เลือกสเกล, ระยะใช้ชนิด bow/crossbow/spear และจำนวนมือที่ระบบ grid ปัจจุบันรองรับ
- Attack Bonus จากระบบ d20 เดิมแปลงเป็นโอกาสโดน +5 จุดเปอร์เซ็นต์ต่อ 1 ภายใต้สูตร accuracy ปัจจุบัน; ไม่ยก turn order/d20 attack ของเก่ามาทับ 2 AP
- DEF จากเกราะ/หมวก/รองเท้า/ผ้าคลุม/โล่รวมกัน; เมื่อใส่เกราะจากฐานข้อมูล จะใช้แทนเกราะพื้นฐานของคลาส
- ใช้ตัว parse passive ตัวเลขเดิมสำหรับ STR, DEX, HP, MP, DEF, ATK, Crit Rate และ Resistance; โบนัส HP/MP ไม่ฮีลฟรีหรือเพิ่มซ้ำเมื่อสลับของ
- ธาตุและ specialEffectsText แบบบรรยายยังไม่รองรับครบ ระบบแจ้งในรายละเอียดของชิ้นนั้น ไม่อ้างว่าทุกเอฟเฟกต์ในฐานข้อมูลทำงานแล้ว ชนิดอาวุธที่ยังไม่ตรงชนิดที่ engine รองรับจะถูกปฏิเสธพร้อมเหตุผล

## การตรวจ

catalog-equipment.test.cjs: ครบ 10 ช่อง, ของจริง/จำนวนเครื่องประดับ, swap/ถอด, มือเดียว–สองมือ, คลาส, โบนัสไม่สะสม, เซฟ, ดาเมจเต๋าในตัวคำนวณจริง และสลับกลับอาวุธฝึก

equipment-ui.test.cjs: ใส่ครบสิบช่อง, icon โหลดได้, สองมือกันช่องซ้าย, reload, มือถือ และค่าบนอุปกรณ์ในสนาม

equipment-icon-ui.test.cjs: อัปโหลดภาพที่รายการในฐานข้อมูล โหลดกลับ และภาพในคลัง/ช่องสวมตรงกับรูปที่อัปโหลด

full-schema.test.cjs ตรวจ 213 ฟิลด์และรายการเสริม; legacy-content-parity.test.cjs ยังคงตรวจ 504 รายการ/205 ฟิลด์ต้นทางเดิม Browser ใช้ mock authentication/storage ไม่แก้เซฟผู้เล่นจริง

## ธาตุดาเมจ — 2026-11-05

เชื่อม element/elementDamage ของอาวุธกับ elementWeakness/immunities ของมอนสเตอร์แล้ว โดยใช้ฟังก์ชัน getActionElement, normalizeElementTag, getElementInteraction และ applyElementModifier จากเกมเก่า: แพ้ธาตุ ×1.5, ภูมิคุ้มกัน 0 และภูมิคุ้มกันชนะจุดอ่อน เปรียบเทียบแบบ trim/lowercase เท่านั้น ไม่สร้าง synonym เช่น Holy กับ Light

ดาเมจธาตุเพิ่มรวมกับฐานก่อนคริติคอล จากนั้นคูณธาตุก่อนเกราะ/การลดดาเมจตามระบบ grid ปัจจุบัน ภูมิคุ้มกันข้าม minimum damage floor และไม่ใช้ barrier/แชร์ดาเมจ/ขัดการร่ายจากดาเมจ 0 ไอเท็มเปล่าและธาตุไม่ตรงเป็นกลาง ไม่มีการเปลี่ยน AP หรือสูตรตรวจโดน

ข้อมูลอาวุธตรึงอยู่กับ unit จากระบบสวม และข้อมูลจุดอ่อน/ภูมิคุ้มกันของมอนสเตอร์คัดลอกเมื่อตั้งสนาม จึงโหลดกลับได้เหมือนเดิม เซฟสนามเก่าที่ไม่มีข้อมูลธาตุยังทำงานแบบเป็นกลาง

สกิลโจมตีเวทที่ทำงานในระบบใหม่มี element ที่กำหนดในข้อมูลชัดเจน (Arcane Bolt, Fire Burst, Frostbolt, Holy Light, Lightning Lance, Wind Blade, Quagmire) ไม่ยืมธาตุจากอาวุธที่ถือ ธาตุของอาวุธรองคิดแยกจากมือหลัก ยังไม่ได้ย้ายเอฟเฟกต์ทุกชนิดของสกิล/เวทเดิม 59/112 รายการ และภูมิคุ้มกันสถานะเช่น Poison ไม่ได้หมายความว่าการลบ/กันสถานะทุกระบบถูกเชื่อมครบแล้ว

ทดสอบ elements.test.cjs และ elements-ui.test.cjs ครอบคลุมอาวุธจริง โบนัสธาตุ จุดอ่อน ภูมิคุ้มกัน 0 ลำดับความสำคัญ ความเป็นกลาง เวทไม่รับธาตุอาวุธ AP/ผลจริงใน browser และ reload ใช้คลาวด์จำลอง

## Status immunity adapter — 2026-11-05

Implemented debuff application now checks the encounter's saved `immunities` tags through `DecideCharacterCombat.applyStatus`: Poison Blade, fire/ice form follow-ups, Frost, Armor Break/Acid, Battle Cry, Taunt and Hypnosis. Explicit tags are `Poison`, `Burn`, `Slow`, `Broken`, `Weaken`, `Taunt`, `Blind` (with `Stun`/`Silence` available to the shared application helper). Comparisons trim whitespace and ignore case, preserving original saved tags. A shorter reapplication cannot shorten an existing duration. Stun durations now decrement with the other timed debuffs.

Real catalog Skeleton Warrior/Zombie/Stone Golem poison immunity prevents poison application, without suppressing a successful physical hit or refunding AP, MP or cooldown. Antidote still blocks poison. The log identifies resisted status applications. Existing saved immunities are used without changing the save schema; missing tags retain previous behavior. This prevents new applications; it does not retroactively cleanse pre-existing statuses.

`Fire`/`Ice` damage immunity is not an alias for `Burn`/`Slow`. `Bleed` remains catalog data: no bleed action or arbitrary free-text special-effect interpreter was added. No new stun/silence abilities were granted. Existing grid/2 AP rules remain unchanged.

Validation: `status-immunity.test.cjs` exercises real catalog poison immunity, direct hit versus damage-over-time, AP/MP/cooldown, duration expiry, Antidote, save validation, explicit status tags and live Frost/Armor Break/Battle Cry/form follow-ups. `status-immunity-ui.test.cjs` uses mock cloud, presses Poison Blade against a catalog skeleton, reloads the save and compares a susceptible target. Screenshot: `artifacts/qa/status-immunity.png`.
