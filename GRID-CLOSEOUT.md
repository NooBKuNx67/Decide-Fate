# ปิดงานระบบต่อสู้ Grid

> ตรวจเพิ่มเติม 8 พ.ย. 2026: การปิดงานนี้ครอบคลุม engine ที่รองรับ ไม่ใช่การเชื่อมทุก record/ทุกช่องในฐานข้อมูล ตรวจพบช่องว่างตาม [CONTENT-INTEGRATION-AUDIT.md](CONTENT-INTEGRATION-AUDIT.md) ซึ่งต้องแก้แยกก่อนอ้างว่าเชื่อมฐานข้อมูลครบ

ขอบเขต: ระบบ single-player/DM ปัจจุบัน ใช้ 2 AP, grid isometric, ตัวผู้เล่นเป็นไอคอนจากหน้าสร้างตัวละคร และกติกาที่ engine รองรับอยู่ ไม่รวมการเขียนกลไกใหม่จากคำบรรยายสกิลเก่าที่ยังไม่มี implementation

## เกณฑ์ยอมรับและหลักฐาน

| เรื่อง | หลักฐาน |
|---|---|
| เดิน/โจมตี/ใช้ AP/MP/คูลดาวน์, ปฏิเสธคำสั่งไม่ถูกต้องโดยไม่เสียทรัพยากร | tactical-v2.test.cjs, tactical-v2-ui.test.cjs, grid-closeout.test.cjs |
| อาวุธเริ่มต้น 10 แบบ, ดาบสองมือ, ธนู/หน้าไม้, มือซ้าย/อาวุธคู่, ไม่โจมตีซ้ำหลังเป้าตาย | grid-closeout.test.cjs, catalog-equipment.test.cjs, grid-closeout-ui.test.cjs |
| ช่องเดียว/สี่เหลี่ยม/เส้น/กรวย/รอบตัว, สี่ทิศ, จำนวนเป้า, มอง/ได้ยิน | grid-patterns.test.cjs, grid-patterns-ui.test.cjs |
| ขอบสนาม 160 masks, ผนัง/สิ่งบัง/ความสูง/ช่องไม่เดินได้ | grid-closeout.test.cjs, grid-patterns.test.cjs, displacement.test.cjs, monster-grid.test.cjs |
| สถานะ/ต้านทาน/ภูมิคุ้มกัน/ล้างสถานะ, ผลักดึงหยุดเมื่อชนหรือเป้าตาย | status-effects.test.cjs, status-immunity.test.cjs, displacement.test.cjs และ UI คู่กัน |
| พื้นไฟ/พิษ, อายุพื้นที่, เข้า/เริ่มเทิร์น, ไม่เสียซ้ำจาก field เดิมในรอบเดียว, รางวัลไม่ซ้ำ | grid-hazards.test.cjs, grid-hazards-ui.test.cjs |
| มอนสเตอร์ใช้กติกาเดียวกัน, หลบอันตราย, เลือกท่า/เป้า/จุดเล็ง | monster-grid.test.cjs, hazard-navigation.test.cjs, monster-tactics.test.cjs และ UI คู่กัน |
| เซฟ/โหลดเวทค้าง, ผลสถานะ/field hit ledger/seed และการตัดสินใจถัดไป | tactical-v2-ui.test.cjs, grid-closeout.test.cjs (12 สถานการณ์ โหลดซ้ำหลังแต่ละเทิร์น) |
| ปาร์ตี้/สั่งสมาชิก/AP แยก, sandbox ไม่เปลี่ยนเซฟหรือรางวัลจริง | combat-lab-party.test.cjs, monster-tactics-ui.test.cjs, grid-closeout-ui.test.cjs |
| แตะเลือกช่อง ลาก/ซูม แล้วเลือกตรงช่อง, keyboard, เดสก์ท็อป/มือถือแนวนอน | grid-closeout-ui.test.cjs, combat-lab-ui.test.cjs, combat-polish.test.cjs |
| ใช้เล่นจริงและจบบท โหลดกลับไม่เสียค่าเข้าซ้ำ/รับรางวัลซ้ำ | adventure-ui.test.cjs |

## การแก้ในรอบปิดงาน

- สนามทดสอบเคยแสดงอาวุธที่คลาสใช้ได้ แต่สร้างไม่ได้ถ้าไม่ใช่อาวุธเริ่มต้น แก้ให้สร้างตัวละครจำลองด้วย starter แล้วสวมอาวุธผ่าน `DecideCreation.equip` จริง
- เพิ่มตัวเลือกมือซ้าย เงื่อนไขสองมือ/โล่/คลาส และให้ความชำนาญอาวุธคู่ D เฉพาะตัวจำลอง ไม่แจกให้เซฟจริง
- เพิ่มสถานการณ์ `weapon-dual`, `weapon-twohand`, `weapon-bow` และทดสอบกดใช้จริง มีรหัสสุ่มคงที่เพื่อเห็นผลซ้ำได้
- ขนาดสนามทดสอบปัจจุบัน 12×10 ช่อง; 3×3 คือแม่แบบพื้นที่โจมตี ไม่ใช่ขนาดสนาม

## ตรวจซ้ำ

```sh
node tools/check.cjs
# ต้องมี Playwright และ Chromium ตาม HANDOFF.md
node tools/check-grid.cjs
```

เครื่องมือ browser ใช้ mock auth/storage ทุกครั้ง ไม่เข้าถึงบัญชีหรือเซฟผู้เล่นจริง ภาพหลักฐานอยู่ `artifacts/qa/grid-closeout-desktop.png`, `grid-closeout-touch-landscape.png` และภาพ scenario จากชุด grid ต่าง ๆ

## ขอบเขตการปิดงาน

ปิดระบบ grid ตามความสามารถปัจจุบันเมื่อชุดตรวจข้างบนผ่าน การเพิ่มชนิดกลไกใหม่ในอนาคตต้องเพิ่มการทดสอบและสถานการณ์ในสนามทดสอบเหมือนเดิม ข้อมูลที่แก้ระหว่างมีการต่อสู้ไม่เปลี่ยน action snapshot ของไฟต์เดิม ให้เริ่มไฟต์/สถานการณ์ใหม่เพื่อใช้ค่าฐานข้อมูลล่าสุด โปรเจคทั้งเกมและการเผยแพร่ GitHub มีเกณฑ์แยกใน RELEASE-CLOSEOUT.md

ผลตรวจรอบสุดท้าย: ผ่าน 38 ไฟล์ engine/data และ 15/15 ชุด browser สำหรับ grid ตามคำสั่งด้านบน ตรวจภาพเดสก์ท็อป/มือถือแล้ว ไม่มีปัญหาที่ขวางการเล่นในขอบเขตที่ตรวจ รอบนี้ทดสอบด้วย mock accounts และยังไม่เผยแพร่ GitHub

## เชื่อมฐานข้อมูลเพิ่มเติม — 9 พ.ย. 2026

แก้ช่องว่างหลักตาม DATABASE-LIVE-LINKS.md แล้ว: 95 catalog commands, 30 class data snapshots, ทีม NPC recruitable, ไอเท็มและอาวุธที่เพิ่ม พร้อมตัวอย่างสนามทดสอบ ทุก mechanic พิเศษที่ไม่เปิดใช้แยกเป็นรายการรอเจ้าของตรวจ ไม่รวมว่าเป็นท่าที่เล่นได้ การตั้งค่าบรรยายหรือช่องโลกที่ไม่ควบคุม engine ยังระบุขอบเขตไว้ชัดเจน
