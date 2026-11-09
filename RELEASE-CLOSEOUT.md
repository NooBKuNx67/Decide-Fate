# เกณฑ์ปิดงาน — เป้าหมายศุกร์ 13 พฤศจิกายน 2026

ขอบเขตที่ผู้ใช้ยืนยัน: single player/DM, grid/2 AP, พร้อมเล่นแม้เนื้อหายังไม่เต็ม ต้องกรอกข้อมูลและใช้จริงได้ ไม่รวม multiplayer และงานอนิเมชั่น

## ลำดับส่งมอบ

1. 8 พ.ย.: เครื่องมือสร้างข้อมูลใหม่จากแม่แบบ, AI JSON ตรวจแล้วรวมข้อมูล, สำรอง/ย้อนคืน, คู่มือส่งต่อ และทดสอบข้อมูลใหม่ถึง engine
2. 9–10 พ.ย.: ตรวจเส้นทางเล่นจริง สร้างตัวละคร → รับภารกิจ → ต่อสู้ → รับรางวัล/ร้านค้า/อุปกรณ์ → จบบท ตรวจ AP/MP/สถานะ/ผลักดึง/พื้นที่ค้างและเทิร์นมอนสเตอร์ แก้ข้อผิดพลาดก่อนเพิ่มระบบ
3. 11 พ.ย.: เซฟ/โหลด ส่งออก/นำเข้า กู้ข้อมูลและการซิงก์ขัดข้อง ตรวจแยกบัญชี ทดสอบข้อมูลกำหนดเองกับเซฟหลังโหลด
4. 12 พ.ย.: รอบทดสอบผู้ใช้บนเว็บจริง/มือถือ ตรวจคู่มือให้ทำตามได้โดยไม่ใช้ Codex เก็บเฉพาะข้อผิดพลาดที่ขวางการเล่น
5. 13 พ.ย.: ตรวจ regression และเผยแพร่เมื่อได้รับคำสั่ง สรุปเวอร์ชัน/สิ่งที่ผ่าน/ข้อจำกัด ส่งไฟล์สำรองและรายการงานค้าง

นี่คือลำดับเป้าหมาย ไม่ใช่งานที่รันเองระหว่างปิดแชต แต่ละรอบต้องรายงานผลทดสอบจริง

## ต้องผ่านก่อนประกาศพร้อมเล่น

- [x] เล่นจากตัวละครใหม่จนจบเนื้อหาที่มี โดยไม่ใช้ console แก้เซฟ — adventure-ui.test.cjs ผ่านเส้นทางอ้อมป่า/จบแบบคืนหัวใจธาร; ยังต้องตรวจเส้นทางทางเลือกแยก
- [x] โหลดระหว่างต่อสู้และหลังจบบทแล้วทำต่อได้ ไม่จ่ายรางวัลซ้ำ — ข้อ A: `closeout-resume.test.cjs` PASS (frozen/AP/MP/cooldown/พื้นที่ค้าง/เงิน/EXP/ของ/quest ledger), `closeout-resume-ui.test.cjs` PASS (โหลดก่อน–หลังรับรางวัลผ่าน UI), `adventure-ui.test.cjs` PASS (เล่นจบบท/โหลดกลางไฟต์/โหลดหลังจบ), `world-links-ui.test.cjs` PASS; pure รวม 45/45, browser 3/3 ด้วย mock auth/storage เท่านั้น; คลาวด์และอุปกรณ์จริงยังรอ OWNER-ACCEPTANCE.md
- [x] AP/MP คูลดาวน์ เป้าหมาย ระยะ สถานะ ผลัก/ดึง พื้นที่ค้าง ตรงกันระหว่างผู้เล่น/มอนสเตอร์ — ปิดขอบเขต grid ปัจจุบันตาม GRID-CLOSEOUT.md; 38 engine/data และ 15 grid browser suites ผ่าน
- [x] ร้านค้า ซื้อ/ขาย กระเป๋า สวมใส่/สองมือ และปรุงยา ใช้ข้อมูลใหม่จริงและคงอยู่หลังโหลด — ข้อ B: `closeout-custom-services.test.cjs` PASS (custom-* จากแม่แบบจริง/ทุกธุรกรรม/โหลดทุกขั้น/เงินไม่พอ ของไม่ครบ คลาสผิด อาวุธสองมือในมือรองไม่เสียของ), `closeout-custom-services-ui.test.cjs` PASS (UI ซื้อ/ขาย/ใช้/ปรุง/สวมมือหลัก–รองและสองมือ/โหลด), `catalog-services-ui.test.cjs`, `equipment-ui.test.cjs` PASS; pure 46/46, browser 3/3, mock เท่านั้น
- [ ] สร้างข้อมูลผ่านฟอร์ม/AI pack → ทดสอบ → ส่งออก → โหลดกลับ → ย้อนคืนได้
- [ ] แยกบัญชี ข้อมูลไม่ปน และแสดงสถานะซิงก์ล้มเหลวชัดเจน
- [ ] ตัวอย่างระบบใหม่อยู่ในสนามทดสอบอัปเดต ไม่แตะเซฟ/รางวัลจริง
- [ ] ผู้ใช้ทำตามคู่มือกรอกข้อมูลด้วย ChatGPT/Claude ฟรีได้เอง
- [ ] ชุดทดสอบ engine ผ่าน และ browser เส้นทางสำคัญผ่าน ระบุปัญหาเก่าที่ยังเหลือ
- [ ] เมื่อสั่งอัป GitHub: main ถูก push, workflow สำเร็จ, เว็บจริงเป็น revision ที่ส่ง

ยังไม่ติ๊กปิดข้อใดด้วยการทดสอบบางส่วน การตรวจ unit ของระบบมีแล้ว แต่ต้องบันทึกหลักฐาน end-to-end ก่อนปิดทั้งข้อ ขอบเขตเนื้อหาปัจจุบันจบบทที่หนึ่ง ไม่ถือว่าเป็นแคมเปญยาวที่ยังไม่ได้สร้าง

## หลักฐานรอบ 8 พ.ย.

`node tools/check.cjs`: 37 ไฟล์ผ่าน รวม data-created learn/cast, monster snapshots, buy/craft/use/equip และ safe data merge/rollback. Browser mock account: `content-authoring-ui.test.cjs` ผ่านสร้าง/แก้/ตรวจ AI pack/ยืนยัน/สำรองย้อนคืน/โหลดหน้าใหม่/มือถือ/รายการใหม่ในสนามทดสอบ และตรวจแม่แบบครบ 12 หมวด; `full-schema.test.cjs` ผ่าน 13 หมวด/255 ช่อง/504 legacy records; `monster-tactics-ui.test.cjs` ผ่าน 9 สถานการณ์และปาร์ตี้ 4 คน; `adventure-ui.test.cjs` ผ่านเล่นจนจบบทและโหลดกลับไม่มีรางวัลซ้ำ หลังแก้ test locator ให้เลือกศัตรูที่ยังไม่ตายเมื่อชื่อซ้ำ หลักฐานนี้ไม่ใช่การตรวจ Supabase จริงหรือ deploy production

รอบตรวจเพิ่ม: พบและแก้เพดาน HP ลิน 96/100 ที่ทำให้โหลดระหว่างต่อสู้ไม่ได้ เพิ่ม migration เซฟบทเดิมแบบเจาะจง และเพิ่มทดสอบไฟล์นำเข้าที่ contentEdits ผิดต้องไม่แทนที่ player state ผล browser โหลดระหว่างต่อสู้ให้บันทึกตามรอบสุดท้ายด้านล่าง

ผลรอบสุดท้าย: `adventure-ui.test.cjs` ผ่านโหลดเซฟขณะอยู่ในถ้ำ เปรียบเทียบ snapshot ครบ กลับเข้าสนามเดิม ต่อสู้จนจบและโหลดหลังรับรางวัลโดยไม่รับซ้ำ; `content-authoring-ui.test.cjs` ผ่านปฏิเสธไฟล์ contentEdits ผิดโดย player state คงเดิม; engine/data 37 ไฟล์ผ่านหลังแก้ migration ปัญหาการกู้เมื่อซิงก์จริงล้มเหลวและการให้เจ้าของลองกรอกเองยังไม่ปิด

## Continuation — recovery tools

Added load-menu player backup download/restore and an offline browser regression covering restore/undo/cancel/corrupt JSON/account separation. Fixed lost dirty state after a rejected cloud gameplay network request and the unload-warning condition while autosync is paused; cloud.test.cjs covers failure and explicit upload retry. Final production connectivity acceptance remains open; these checks deliberately use mock accounts.

## Grid closeout completed

See GRID-CLOSEOUT.md for the acceptance matrix and reproducible runner. Fixed simulation non-starter weapon selection and added real validated left-hand equipment plus dual/two-hand/bow presets. Touch picking/panning/zooming, keyboard, normal-combat touch movement, death/invalid-target atomicity, 160 edge masks and deterministic save/load across statuses/fields/AI passed. This closes current grid scope; remaining whole-game, owner acceptance and publication criteria above stay separate.

## Database audit correction — 8 Nov 2026

- [x] Close core database/runtime integration gaps and separate special records for owner review, as clarified by the owner — DATABASE-LIVE-LINKS.md. This does not claim every legacy story mechanic is implemented.

Engine grid acceptance remains a mechanical test result, not proof of full imported catalog integration. Read-only baseline audit classified all 550 runtime records and found 118 legacy abilities without grid adapters, 10 unusable item effects, 2 unsupported weapon categories, 31 NPC library-only records and 11 accessories without numeric combat bonuses (some intentionally cosmetic). All 35 monsters have valid stats and linked active/passive skill handlers, but descriptive behavior/initiative fields remain unused. Account-specific Supabase overrides were not accessed; audit can also consume the owner’s exported JSON.

## 9 Nov 2026 — implemented database links

95 catalog actions are exercised through actual casts; 30 class snapshots read editable values; 29 recruitable NPC source profiles support ownership/AP/healing/roster/settlement/reload in free and chapter encounters. Consumable cures/smoke and firearm/whip are connected. 77 legacy/special/cosmetic records remain explicitly in owner review, per instruction. Every new mechanic has a direct test-field entry. See DATABASE-LIVE-LINKS.md for limits and source-preservation details.

## ประเมินปัจจุบัน — 9 พ.ย. 2026

ดู [GAME-READINESS.md](GAME-READINESS.md) สำหรับสถานะล่าสุดแทนการตีความกล่อง checklist เก่าที่เป็นประวัติหลักฐาน บทตัวอย่าง/authoring/recovery/services และ cloud/economy mock ผ่านตรวจเพิ่มรอบนี้ งานที่ยังขวางการปิดงานแบบเหลือเพียงกรอกข้อมูลคือ placement/บริการ NPC เชื่อมโลก, quest/event conditions/ส่งของ และตรวจรับคลาวด์/เปลี่ยนเครื่องจริง งานระยะอาวุธใหม่ยังอยู่ใน workspace ไม่ได้เผยแพร่พร้อม eaa776d

## วงจรโลกเชื่อมแล้ว

placement/บริการ NPC ใน VN, conditions, เป้าหมาย kill/item, การส่งของ/กันรับรางวัลซ้ำ และ chapter bridge ดำเนินการแล้ว: WORLD-QUEST-LOOP.md ผล engine 44 และ browser grid 20/20 ผ่าน พร้อม authoring/recovery/services/adventure และ cloud mock เหลือ owner acceptance/ข้อมูลจริง/คลาวด์สองเครื่องตาม OWNER-ACCEPTANCE.md งานรอบนี้ยังไม่ได้เผยแพร่
