# ส่งต่อ Decide Fate

เป้าหมาย: เกมเล่นคนเดียว/มี DM ใช้ grid และ 2 AP; ไม่รวม multiplayer, อนิเมชั่นตัวละคร หรือออกแบบ UI ใหม่ เนื้อหาสกิล/เวท/อุปกรณ์สามารถเติมภายหลังได้ แต่ต้องผ่านระบบจริง

## งานข้อมูลโดยไม่ต้องเขียนโค้ด

เปิดเกม → ฐานข้อมูล → “เพิ่มข้อมูลที่ใช้ได้จริง” คู่มือภาษาไทยอยู่ที่ `dist/maintenance-guide.html` และเปิดจากในเกมได้ เลือกแม่แบบที่รองรับแล้วสร้างเอง หรือดาวน์โหลดคำสั่ง TXT ให้ ChatGPT/Claude ฟรีช่วยทำ JSON นำกลับมาตรวจ diff และยืนยัน ไม่มี API หรือการส่งข้อมูลอัตโนมัติ

- เอกลักษณ์รายการใหม่ `custom-*`, ชื่ออ้างอิงและ templateKey คงที่; displayName แก้ได้
- สืบทอดกลไกของแม่แบบจริง ไม่ใช่รันโค้ดจากคำตอบ AI รองรับสูงสุด 200 รายการใหม่
- ชุดคำตอบ AI รวมข้อมูล ไม่แทนที่ทั้งหมด ตรวจ baseline ป้องกันทับงานที่เปลี่ยนระหว่างรอ
- สำรองอัตโนมัติก่อนสร้าง/ใช้ชุดข้อมูล/นำเข้าไฟล์ฐานข้อมูลเต็มชุด/ย้อนคืน เก็บล่าสุดหนึ่งชุดต่อบัญชีใน IndexedDB; การแก้ฟอร์มทั่วไปยังต้องส่งออกเอง
- ส่งออกฐานข้อมูลเต็มชุดและเซฟแยกกันก่อนงานใหญ่ ย้อนคืนรักษา ID ใหม่เป็น disabled เพื่อไม่ทำลายการอ้างอิง
- ข้อมูลทดสอบใช้บัญชีจำลอง ไม่ต้องส่งข้อมูลเข้าสู่ Supabase จริง

## เริ่มงานบนเครื่องอื่น

ต้องการ Node.js รุ่นปัจจุบัน ไม่ต้อง build หรือ npm install สำหรับตัวเกม

```sh
node preview.cjs
node tools/check.cjs
```

เปิด http://localhost:4173 การทดสอบเบราว์เซอร์ต้องติดตั้ง Playwright/Chromium แยก และใช้ `tools/qa-runtime.cjs` บน Linux ตั้ง `NODE_PATH` ตามที่ติดตั้ง Playwright และ `PLAYWRIGHT_CHROMIUM_EXECUTABLE` หาก browser อยู่คนละตำแหน่ง เช่น:

```sh
node tools/qa-runtime.cjs content-authoring-ui.test.cjs
node tools/qa-runtime.cjs full-schema.test.cjs
node tools/qa-runtime.cjs monster-tactics-ui.test.cjs
```

`tools/check.cjs` ตรวจ engine/data โดยไม่ใช้ dependency เพิ่ม ไม่ได้แทน browser QA ทุกหน้า ตัวอย่าง browser ใช้ mock auth/storage ไม่แตะเซฟจริง

## ขอ AI ฟรีช่วยงานในอนาคต

งานข้อมูล: ใช้ไฟล์คำสั่งจากในเกม ไม่ต้องส่งทั้ง repository

งานแก้โค้ด: ส่ง AGENTS.md, START-HERE.md, DESIGN-AGREEMENTS.md, HANDOFF.md และเฉพาะไฟล์ที่เกี่ยวข้อง บอกให้คง save IDs/Supabase config, ใช้ grid/2 AP, เพิ่มตัวอย่างในสนามทดสอบ และคืนไฟล์แก้ไขพร้อมวิธีตรวจ ห้ามเชื่อว่าแชตฟรีแก้ GitHub ให้อัตโนมัติ ให้นำไฟล์ผ่าน GitHub web editor/Upload files หรือ Git แล้วตรวจ Actions เอง

การเผยแพร่: commit/push main → Actions → Publish Decide Fate → Run workflow → รอเขียวและตรวจเว็บจริง ดู `.github/workflows/pages.yml` ไม่ถือว่าแค่ commit หรือ preview เป็นการเผยแพร่

## ข้อจำกัดที่ต้องรู้

การมี record เก่าครบไม่ได้หมายความว่าทุกคำบรรยายเก่ามี engine รองรับ ใช้แม่แบบที่เครื่องมือเสนอเพื่อสร้างข้อมูลเล่นได้จริง กลไกใหม่ที่ไม่มีแม่แบบยังต้องแก้โค้ด AI ฟรีช่วยเขียนข้อมูลได้ แต่ไม่สามารถสร้างกลไกจากข้อความบรรยายเฉย ๆ โปรเจคนี้ยังต้องตรวจปิดงานตาม RELEASE-CLOSEOUT.md ก่อนประกาศเสร็จ

## เซฟบทเก่าที่ต้องรักษา

ลินมี HP สูงสุด 100 ตามข้อมูลบท เมื่อสร้างสนามด้วยตัวละครระบบใหม่ต้องตั้ง `maxHp/baseMaxHp` ให้ตรงกัน `rules.validate` ย้ายเฉพาะ snapshot บท forest/cave ของ ally-0 ชื่อลิน job ranger ที่เคยบันทึก maxHp 96 ให้เป็น 100 โดยไม่เปลี่ยนต้นฉบับ ทดสอบทั้ง pure และโหลดระหว่างต่อสู้ใน browser แล้ว การนำเข้าไฟล์ต้องตรวจ contentEdits ก่อนแทนที่สถานะผู้เล่น (มี regression สำหรับไฟล์ฐานข้อมูลผิด)

## Player recovery and failed network writes

Load menu now offers account-scoped local backup download/restore. It works offline, validates before loading, asks before replacement and retains a current character as the next backup for undo. Corrupt JSON is downloadable but cannot be restored. Browser regression: `save-recovery-ui.test.cjs` (mock account, offline, cancel, download, undo, corruption, account isolation). This is an account-flow check outside the combat field. Cloud regression also covers a rejected gameplay network request: unsynced state survives, before-unload warns even with autosync paused, and explicit upload retries. Real Supabase outage/recovery is not simulated against player accounts.

## Grid acceptance

See GRID-CLOSEOUT.md. `node tools/check-grid.cjs` runs the maintained current-grid browser suites (requires Playwright/Chromium as above); `node tools/check.cjs` runs all pure engine/data tests. Use the new weapon presets and left-hand control in Update Test Field for manual checks. Legacy browser scripts asserting the old 1 AP rules are historical and are not the current acceptance suite.

## Data integration audit

Read CONTENT-INTEGRATION-AUDIT.md before claiming every database record/field works. Reproduce the read-only baseline with `node tools/audit-content.cjs`, or include a database export with `--export /path/to/content.json`. Per-record results and known ignored fields are in reports/content-integration.json. Do not delete library-only records automatically. The audit test now verifies working adapters and explicit owner-review separation; the original pre-fix evidence is archived in docs/CONTENT-INTEGRATION-AUDIT-BEFORE.md.

## Database links — 9 Nov 2026

See DATABASE-LIVE-LINKS.md: 95 actual catalog commands, 30 class definition snapshots, 29 recruitable database NPCs, 21 usable item effects and 77 owner-review records. The owner explicitly asked to keep unusual/story-specific mechanics separate for later review. New NPC roster/vitals are account-save fields; member actions and class values are frozen with encounters. No production account data was fetched or modified.

## แผนที่และการเดินทาง — 9 พ.ย. 2026

ดู [WORLD-TRAVEL.md](WORLD-TRAVEL.md) สำหรับอัปโหลดรูป/ไอคอน เส้นทาง ID/กม. คำนวณเวลา อีเวนต์ตัวเลือกและสู้ grid พร้อมสนามทดสอบแยกเซฟ

ฐานข้อมูลมีหมวดอีเวนต์/บทสนทนาแล้ว: [EVENT-AUTHORING.md](EVENT-AUTHORING.md) อธิบาย % แยกต่อเส้นทาง คิวหลายเหตุการณ์ NPC ครึ่งตัว และผลไอเท็ม/เควส/บทหลังสู้จริง ช่อง BGM เตรียมไว้ ยังไม่เล่นเสียง

ตรวจฟิลด์หลังเพิ่มระบบโลก/อีเวนต์: [WORLD-DATABASE-AUDIT.md](WORLD-DATABASE-AUDIT.md) และตารางครบ 271 ช่อง [WORLD-DATABASE-FIELDS.md](WORLD-DATABASE-FIELDS.md); รัน `node tools/audit-world-links.cjs` เพื่อตรวจซ้ำจากข้อมูลในโปรเจค (ไม่ใช่บัญชี Supabase จริง)

ระยะ/พื้นที่อาวุธกรอกในฐานข้อมูลได้แล้ว: [WEAPON-GRID.md](WEAPON-GRID.md) มีขั้นต่ำ–สูงสุด รูปพื้นที่/ระยะอ้างอิง/จำนวนเป้า ใช้กับมือหลัก มือรอง และ NPC พร้อม preset ทดสอบและเลือกอาวุธ catalog จริงในสนาม

ผลประเมินความพร้อมปัจจุบัน: [GAME-READINESS.md](GAME-READINESS.md) — กลไกเล่นทดสอบได้ วงจรโลก/NPC/เควสเชื่อมแล้ว งานค้างหลักคือเจ้าของลองกรอกข้อมูลและตรวจรับคลาวด์/อุปกรณ์จริง; แยกโค้ด workspace ออกจากเวอร์ชันที่เผยแพร่แล้ว

วงจรโลก/NPC/เควสเชื่อมแล้ว: [WORLD-QUEST-LOOP.md](WORLD-QUEST-LOOP.md) มี placement, บริการใน VN, conditions, เป้าหมาย kill/item, ส่งของ/กันรางวัลซ้ำ และ chapter bridge; ตรวจรับบัญชีจริงตาม [OWNER-ACCEPTANCE.md](OWNER-ACCEPTANCE.md)

## รอบปิดงาน A–F — ระงับการเผยแพร่

คำสั่งเจ้าของรอบนี้: push main ได้ แต่ **ห้ามรัน Publish Decide Fate และห้ามเผยแพร่เว็บ** จนกว่าเจ้าของสั่งหลังตรวจรับ ไม่ทำ Prettier/CSP/กลไกใหม่ และไม่เปลี่ยน schema/config/identifiers

ข้อ A ปิดในขอบเขต mock แล้ว: closeout-resume.test.cjs (pure, เข้า check.cjs อัตโนมัติและ Pages Validate), closeout-resume-ui.test.cjs, adventure-ui.test.cjs, world-links-ui.test.cjs ผ่าน; pure 45/45 และ browser 3/3 ครอบคลุม frozen encounter, AP/MP/held cast/cooldown/hazard, เซฟก่อน–หลังรับเงิน/EXP/ของ/เควสและจบบท ไม่จ่ายซ้ำ ข้อมูลทดสอบสร้างผ่าน production adapters ไม่แก้ระบบเกม เซฟก่อนรับรางวัลที่โหลดซ้ำเป็นการย้อนเวลา: ได้ยอดปลายทางเท่าเดิม ไม่ใช่เพิ่มสะสมจากเซฟหลังรับรางวัล คลาวด์จริงยังรอเจ้าของตรวจ

สถานะล่าสุด: A–D ผ่าน mock E2E; E เจ้าของตัดสินใจเลิกใช้ legacy 3 ไฟล์แล้ว (ไม่ใช่ acceptance); F เอกสาร/เครื่องมือส่งต่อผ่าน technical QA แล้ว รอเจ้าของทำตามคู่มือด้วย AI ฟรีเอง

ข้อ B ปิดในขอบเขต mock: closeout-custom-services.test.cjs + closeout-custom-services-ui.test.cjs ตรวจร้าน/ยา/วัตถุดิบ/สูตร/อาวุธ custom-* ที่สร้างด้วย ContentAuthoring.create/validateRegistry จริง แล้วซื้อ/ขาย/ใช้/ปรุง/สวมมือหลัก–รอง/สองมือ/โหลดครบทุกขั้น รวม atomic rejection; catalog-services-ui.test.cjs และ equipment-ui.test.cjs ผ่านเดิม Pure 46/46, browser 3/3 ไม่มีการแก้เกมหรือ assertion เดิม ข้อสังเกตตามพฤติกรรมเดิม: เปลี่ยนไปสวมอาวุธมือรองหนึ่งมือขณะถือสองมือจะถอดอาวุธสองมือกลับคลังอัตโนมัติ ไม่ถือว่าเป็นการสวมที่ผิดเงื่อนไข; อาวุธสองมือใส่ในมือรองไม่ได้

ข้อ C ปิดด้วย pure 47/47 และ browser 4/4: closeout-authoring.test.cjs, closeout-authoring-ui.test.cjs, content-authoring-ui.test.cjs, full-schema.test.cjs, frontend-security-ui.test.cjs ใช้ไฟล์ TXT ที่ดาวน์โหลดจริง สร้าง AI pack ดู diff/ยืนยัน ร่ายเวท custom ผ่านสนามจริง ส่งออก/นำเข้าบัญชีใหม่ แล้วย้อนคืน ID ใหม่เป็น disabled เกมยังเล่นได้ คำตอบ AI ผิดทั้งหมดไม่ทำลายข้อมูลเดิม HTML แสดงเตือนว่าเป็นข้อความ ไม่รันโค้ด

แก้ช่องโหว่การกู้ข้อมูล: **นำเข้าไฟล์ฐานข้อมูลเต็มชุดจะสำรองผ่าน IndexedDB ก่อนเปลี่ยนข้อมูลแล้ว** เช่นเดียวกับ AI merge; หากสำรองไม่สำเร็จจะไม่นำเข้า ทำตามปุ่มสำรอง/ย้อนคืนในฐานข้อมูล ข้อมูลใหม่ที่ไม่อยู่ใน backup จะยังอยู่เป็น disabled เพื่อรักษาอ้างอิง การแก้นี้เป็น authoring/account flow นอก combat field; ตัวอย่างสกิลที่สร้างถูกทดสอบผ่าน Update Test Field จริงใน closeout-authoring-ui ไม่เพิ่มกลไกหรือเซฟใหม่ Cache สำหรับ script เปลี่ยนเป็น 70 แต่ยังไม่เผยแพร่

ข้อ D ปิดในขอบเขต mock ด้วย pure 48/48 และ browser 3/3: closeout-sync.test.cjs, closeout-accounts-ui.test.cjs, image-cloud.test.cjs, save-recovery-ui.test.cjs การ login สลับ A/B ใน browser เดียวไม่ปนเซฟ/คลัง Failed writes แสดง “ยังไม่ซิงก์” เก็บสำเนาล่าสุดในเครื่อง ส่งออกเซฟ/ฐานข้อมูลได้ โหลด remote เก่ามีการยืนยันและยกเลิกได้ แล้ว retry สำเร็จ CAS ยังกันทับ remote ใหม่ ไม่มี config/schema/identifier เปลี่ยน; cloud.test.cjs เพิ่มเพียง export/พารามิเตอร์ของ harness เพื่อ reuse ไม่เปลี่ยน assertion เดิม Cache 71 ยังระงับเผยแพร่

ข้อ D เป็น account/recovery flow นอกสนามต่อสู้ จึงใช้หน้า login/load/database กับ backend จำลองแยกแทนการทำปุ่มสนามที่แตะบัญชีผู้เล่น ไม่เพิ่มกลไกเกม ตัวอย่างการแสดงสถานะ/กู้ข้อมูลทำซ้ำได้ด้วย closeout-accounts-ui และ save-recovery-ui ยังไม่ได้ทดสอบ Supabase หรืออุปกรณ์จริง

ข้อ E: pure 48/48 และ browser ปัจจุบัน creation-ui/tactical-v2-ui/combat-polish 3/3 ผ่าน เทสต์เก่า browser/combat/tactical-ui ยังไม่ผ่านตามสาเหตุ/วิธีทำซ้ำใน MAINTENANCE-PHASES.md ไม่แก้ assertion หรือถอยเกมไปกติกาเก่า เจ้าของตัดสินใจแล้วให้เก็บเป็นประวัติ โดยไม่แก้ assertion รายงาน reports/closeout-E.json รวม watchdog/diagnostic ตามจริง ไม่ถือว่าได้แก้สามไฟล์ให้เขียวแล้ว

## เมื่อมีอะไรพัง

1. **นำเข้า JSON ไม่ผ่าน:** หยุดก่อนกดยืนยัน อ่าน authorStatus/dbEditStatus/loadStatus เก็บไฟล์เดิมไว้ คำตอบ AI เป็น decide-fate-data-pack-v1; ไฟล์ฐานข้อมูลเต็มเป็น evervale-content-v1 คนละช่องนำเข้า หาก baseline เปลี่ยน ดาวน์โหลด TXT ใหม่และให้ AI ตอบจากชุดใหม่ ห้ามแก้ fingerprint เพื่อฝืนผ่าน รายการซ้ำ/แม่แบบผิด/เกิน 200/ฟิลด์แต่งเองไม่ผ่าน จำนวน 200 รวม disabled ที่รักษา ID ไว้ด้วย
2. **ซิงก์ล้ม/ยังไม่ซิงก์:** อย่าโหลด remote เก่าทับหรือเคลียร์ข้อมูล browser ก่อนส่งออกล่าสุด เปิดเมนูหลัก → โหลดเกม → ส่งออกเซฟ และฐานข้อมูล → ส่งออกฐานข้อมูล เก็บไฟล์ทั้งคู่ไว้นอก browser กดซิงก์ฐานข้อมูลใหม่และอัปโหลดเซฟเมื่อเน็ตกลับ อ่านและยืนยันว่าจะใช้ชุดใดก่อนแทนที่ อย่าสรุปว่าเก็บในเครื่องคือขึ้นคลาวด์แล้ว
3. **ย้อนคืน/กู้:** ฐานข้อมูล → สำรอง/ย้อนคืน → ดู diff → ยืนยัน ย้อนคืนเก็บ ID ที่เพิ่มใหม่เป็น disabled หากต้องกู้จากไฟล์ ให้ใช้ปุ่มนำเข้าฐานข้อมูลสำหรับไฟล์ library JSON (≤2 MB) หรือนำเข้าเซฟในเมนูโหลดสำหรับ save JSON (≤12 MB) ระบบตรวจไฟล์ก่อนแทนที่และขอยืนยัน การกู้ player backup ในเครื่องเก็บเซฟปัจจุบันไว้ให้ undo หากไม่มี IndexedDB/localStorage หรือ backup เสีย ให้เก็บไฟล์ที่ดาวน์โหลดได้ไว้ตรวจ ห้ามสัญญาว่ากู้ได้โดยไม่มี backup
4. **บัญชีผิด:** ออกจากระบบเฉพาะเมื่อเก็บไฟล์ค้างส่งแล้ว เข้าบัญชีเดิม ตรวจชื่อ/ความก้าวหน้า อย่านำไฟล์ของอีกบัญชีมาทับโดยไม่ตั้งใจ ข้อมูลในเครื่องและ backup แยกตามบัญชี

### คำสั่งตรวจทั้งหมด

ตัวเกมไม่ต้อง build เริ่ม `node preview.cjs` แล้วเปิด localhost:4173 ใช้ Node รุ่นปัจจุบันและ Playwright/Chromium ตาม VISUAL-UPDATE.md การทดสอบทั้งหมดต้องใช้ mock auth/storage เท่านั้น

```sh
node tools/check.cjs
node closeout-resume.test.cjs
node closeout-custom-services.test.cjs
node closeout-authoring.test.cjs
node closeout-sync.test.cjs
node closeout-handoff.test.cjs
node tools/check-grid.cjs
node tools/qa-runtime.cjs closeout-resume-ui.test.cjs
node tools/qa-runtime.cjs closeout-custom-services-ui.test.cjs
node tools/qa-runtime.cjs closeout-authoring-ui.test.cjs
node tools/qa-runtime.cjs closeout-accounts-ui.test.cjs
node tools/qa-runtime.cjs adventure-ui.test.cjs
node tools/qa-runtime.cjs content-authoring-ui.test.cjs
node tools/qa-runtime.cjs full-schema.test.cjs
node tools/qa-runtime.cjs catalog-services-ui.test.cjs
node tools/qa-runtime.cjs equipment-ui.test.cjs
node tools/qa-runtime.cjs image-cloud.test.cjs
node tools/qa-runtime.cjs save-recovery-ui.test.cjs
node tools/qa-runtime.cjs frontend-security-ui.test.cjs
node tools/qa-runtime.cjs creation-ui.test.cjs
node tools/qa-runtime.cjs tactical-v2-ui.test.cjs
node tools/qa-runtime.cjs combat-polish.test.cjs
```

check.cjs ค้นหา pure test ใหม่อัตโนมัติและรันแต่ละไฟล์ด้วย Node; ทุก closeout pure test อยู่ใน Pages Validate ด้วย คำสั่ง direct ทั้งห้าใช้ซ้ำเฉพาะเวลาต้องแยกสาเหตุ เพราะ check.cjs รวมไว้แล้ว check-grid.cjs เป็นชุดกลไก grid แบบกว้างที่มีอยู่ ไม่ใช่หลักฐานว่ารันใหม่ทั้งชุดในรอบนี้ รายงานรายไฟล์รอบ A–F อยู่ reports/closeout-*.json และผล E/ข้อจำกัดอยู่ MAINTENANCE-PHASES.md

เทสต์ legacy-browser.test.cjs, legacy-combat.test.cjs, legacy-tactical-ui.test.cjs เลิกใช้/สเปกเก่า เก็บไว้เป็นประวัติ ไม่นับใน acceptance และไม่แก้ assertion ถ้าเทสต์อื่นที่เคยผ่านพังให้หยุดและเก็บ stderr/ขั้นตอน/commit

### ขอ AI ฟรีช่วยแก้โค้ด

ใช้ dist/free-ai-code-help.txt เป็นข้อความตั้งต้น แนบ AGENTS.md, HANDOFF.md, RELEASE-CLOSEOUT.md, MAINTENANCE-PHASES.md และเฉพาะ JS/CSS/HTML/เทสต์ที่เกี่ยวข้อง พร้อมขั้นตอนและข้อความผิดพลาด ถ้าเป็นปัญหาข้อมูลให้แนบแม่แบบ TXT ล่าสุดกับ JSON จำลอง ไม่ส่ง token/password/เซฟจริง ขอไฟล์ฉบับเต็มหรือ patch และคำสั่งทดสอบ ให้ AI ระบุชัดหากรันไม่ได้

**อย่าเชื่อว่า AI ฟรีแก้ GitHub ให้อัตโนมัติ:** เจ้าของต้องตรวจคำตอบ สำรองไฟล์ นำ patch/ไฟล์เข้าเครื่องหรือ GitHub เอง และรันเทสต์ ก่อน commit/push main อย่ากด Publish Decide Fate ในรอบนี้จนกว่าจะตรวจรับและสั่งเผยแพร่เอง แชตฟรีมีข้อจำกัดโควตา/ความสามารถต่างกัน ไม่ได้รับรองว่าจะตรวจหรือแก้เกมได้ครบเอง

ข้อ F ส่งมอบเอกสาร/ไฟล์คำขอแล้ว หลักฐาน technical flow ใช้ closeout-handoff.test.cjs และ closeout-authoring-ui.test.cjs; **ยังไม่ได้ให้เจ้าของใช้ ChatGPT/Claude ฟรีทำเองจริง** จึงยังไม่ติ๊กช่องตรวจรับผู้ใช้ และไม่ได้ทดสอบ Supabase/อุปกรณ์จริง

### ผลสุดท้ายของ F — 10 พ.ย. 2026

`node tools/check.cjs` ผ่าน 49 ไฟล์; browser ผ่าน 6/6: closeout-authoring-ui.test.cjs, closeout-accounts-ui.test.cjs, content-authoring-ui.test.cjs, handoff-guide-ui.test.cjs, grid-closeout-ui.test.cjs, world-links-ui.test.cjs ไฟล์ TXT กรอกข้อมูลแสดงโควตาที่เหลือจริง รวม disabled และเพดานไฟล์/ตัวอักษร ส่วนคำขอแก้โค้ดดาวน์โหลดได้จาก dist/free-ai-code-help.txt ผ่านคู่มือ กรณี IndexedDB ปฏิเสธ backup ทดสอบแล้วว่า full import ไม่เปลี่ยนข้อมูลเดิม

เมื่อ preview ไม่ได้รัน การเข้า localhost:4173 จะถูกปฏิเสธ ไม่ใช่ผลว่าเกมผ่าน เปิด preview ตามขั้นตอนก่อนรันใหม่ รอบแรกของ F มี 3 environment-blocked attempts และเก็บไว้ใน reports/closeout-F.json; รอบสุดท้ายรันเดิมผ่านโดยไม่แก้ assertion ดูผลแยกข้อ/สิ่งยังเปิดที่ CLOSEOUT-RESULTS.md

Source cache 72, ให้ push main เท่านั้น ยังห้าม Publish workflow/เว็บจริงจนกว่าเจ้าของสั่ง ผู้ใช้ยังต้องตรวจ OWNER-ACCEPTANCE.md และลองกรอกข้อมูลหนึ่งชุดด้วย ChatGPT/Claude ฟรีเอง ไม่ถือว่าผ่านแทนด้วย mock

## ย้าย legacy specs — ข้อ A รอบถัดมา

เจ้าของเลือกเก็บประวัติด้วย git mv: legacy-browser.test.cjs → ใช้ creation-ui.test.cjs, legacy-tactical-ui.test.cjs → tactical-v2-ui.test.cjs, legacy-combat.test.cjs → combat-polish.test.cjs ตรวจ bytes/SHA-256 ตรงต้นฉบับทุกไฟล์ ไม่เพิ่มคอมเมนต์ ไม่แก้ assertion ตัวอ่าน SDK mock ใน orientation/visual tools ใช้ชื่อ legacy ใหม่เป็นข้อมูล ไม่รัน suite นั้น ภาพรวม engine ไม่มีการเปลี่ยน schema/config/ID และยังระงับเผยแพร่

ข้อ A ย้าย legacy ผ่าน: pure 49/49, browser creation-ui/tactical-v2-ui/combat-polish/orientation 4/4, visual tools 2/2 ไม่ได้รัน legacy specs เป็น acceptance ไม่พบชื่อไฟล์เก่าใน references ที่ใช้จริง (รายงาน stack ย้อนหลังเก็บเส้นทางเดิมตามจริง) ขั้นถัดไปคือ fixture โหลดเซฟรุ่นเก่าและ closeout-legacy-saves.test.cjs; ยังไม่อ้างว่าตรวจ compatibility รุ่นเก่าเสร็จแล้ว

## เซฟเก่า — ข้อ B รอบถัดมา

closeout-legacy-saves.test.cjs เข้า CI และ check.cjs แล้ว ผล pure 50/50, browser closeout-legacy-saves-ui.test.cjs / closeout-resume-ui.test.cjs / adventure-ui.test.cjs 3/3 ผ่าน Fixture จำลอง 6 รุ่นอยู่ tools/closeout/legacy-saves/ พร้อม provenance/full commit/hash และตัวสร้างจาก source ประวัติ ตรวจ branch checkpoint/legacy-systems-2026-11-05 จริงแล้ว ไม่มีข้อมูลผู้เล่นจริง

ไม่พบรุ่นที่โหลดไม่ผ่านในชุดนี้: v2 ก่อน identity, v3 ตัวละครเดิม, creation v1, ก่อน 2 AP, checkpoint พร้อมของ/อุปกรณ์/ไฟต์ชนะค้างรับรางวัล และก่อน world placements พร้อมเควส/ตำแหน่งโลก ตรวจโหลดซ้ำ/serialize/ยอดรางวัล/EXP/ไอเท็ม/เควส/ตำแหน่ง/จบบทคงเดิมและไม่เปิด enforceLocations เอง โดยไม่แก้ engine/loader/schema/config/identifiers รุ่น v2 ไม่มีตัวละครอยู่แต่เดิม UI ให้เลือก identity ตาม migration เดิม ไม่ได้กู้ชื่อหรือเลเวลที่ไม่เคยมี; producer v2 เก่ากว่า Git ที่มี ใช้ branch validate v2 ที่เก่าสุดเป็นหลักฐาน

รัน pure ได้ด้วย Node ล้วน ไม่ต้องมีประวัติ Git หรือ browser ใน CI ตัวสร้าง fixture ต้องมี historical Git objects เฉพาะตอนต้องการสร้าง fixture ใหม่ ดู README ในโฟลเดอร์และ reports/legacy-saves-B.json ยังระงับ Publish workflow/เว็บจริง

## ภาพที่ไม่ถูกใช้ — ข้อ C รอบถัดมา

ตรวจ literal/dynamic references และประวัติก่อน/หลัง phase 4 แล้ว title-screen.webp ไม่ถูกใช้ จึงย้ายด้วย git mv ไป source-assets/webp/title-screen.webp เก็บ bytes/hash เดิม ลด dist 2,081,894 ไบต์: 18,460,881 → 16,378,987 ไบต์ Pure 50/50; battle-isometric.test.cjs, orientation.test.cjs 2/2 และ asset-visual-check ผ่าน ไม่ย้าย forest/cave extras ที่ประกอบชื่อแบบ dynamic เพราะใช้งานจริง Source cache 74 ยังระงับ Publish workflow/เว็บจริง ผลข้อ A–C รอบนี้อยู่ reports/legacy-archive-A.json, reports/legacy-saves-B.json, reports/unused-title-C.json ข้อ B ไม่พบ fixture เก่าที่โหลดไม่ผ่านทั้ง 6 รุ่น และไม่ได้แก้ loader/schema/engine

## Data Template — ส่วน A

ตัวสร้างใหม่ dist/data-template.js ใช้ได้ทั้ง classic browser และ require ใน Node รับ {db,schema,selected} คืนข้อความไทย/characterCount/คำเตือน/ตัวอย่าง pack เดิม สร้าง fingerprint ใหม่ทุกครั้ง ไม่แก้ validators หรือรูปแบบ decide-fate-data-pack-v1 รองรับ 12 หัวข้อจาก templates()/kinds; proficiency ยังไม่รองรับ ตัวอย่าง custom-example-* ผ่าน decode/stage/validateRegistry จริง รวมหลายชนิดใน create เดียว

คำอธิบาย/สถานะ 271 ช่องสร้างอัตโนมัติจาก audit เดิมใน dist/field-guide.js (พร้อมฟิลด์ adapter accessory.passive); ตรวจด้วย node tools/check-field-guide.cjs เมื่อ schema เพิ่มช่องแต่ไม่มีคำอธิบายจะล้ม ตัวอย่างใน docs/samples/template-one-topic.txt (6,004 ตัวอักษร) และ template-three-topics.txt (12,292) สร้างซ้ำด้วย tools/generate-template-sample.cjs ห้ามใช้ fingerprint ในไฟล์ตัวอย่างกับบัญชีจริง ต้องสร้างใหม่จาก library ปัจจุบัน รายการอ้างอิงถูกจำกัดพร้อมแจ้งว่าตัดแล้ว บางหัวข้อยังเกินเป้าหมายอ่อน 8,000; เตือนเมื่อรวมเกิน 40,000

ผล A: pure 51/51; content-authoring-ui.test.cjs, handoff-guide-ui.test.cjs, closeout-authoring-ui.test.cjs 3/3 ผ่าน ยังคงปุ่มเดิม ณ ส่วน A ส่วน B–D จะทำแยกทีละ commit; ไม่เพิ่มตัวอย่าง lab เพราะเป็นเครื่องมือข้อมูลตามคำสั่งเจ้าของ Source cache 75 แต่ยังระงับ Publish/เว็บจริง

คำยืนยันส่วน C: HTML ภายในข้อความ JSON คงอนุญาตพร้อมเตือน/แสดงเป็นข้อความ ไม่รันโค้ด; ปฏิเสธ HTML/สคริปต์ที่ไม่ใช่ JSON ไม่แก้ assertion เดิม

## Data Template — ส่วน B

เพิ่ม Import / Export / Template ในหน้าฐานข้อมูล มี dialog เลือกหัวข้อ เลือกทั้งหมด/ล้าง จำนวนตัวอักษรและคำเตือนเกิน 40,000 ดาวน์โหลดโดยสร้าง fingerprint จาก snapshot ล่าสุด ปุ่มดาวน์โหลดคำสั่งต่อแม่แบบเดิมยังใช้ได้ proficiency แสดงจางและเลือกไม่ได้ มือถือปุ่มสูงอย่างน้อย 44px

ผล B: pure 51/51; data-template-ui.test.cjs, content-authoring-ui.test.cjs, handoff-guide-ui.test.cjs ผ่าน 3/3 ไม่แก้ assertion/ขั้นตอนเดิม Source cache 76 ยังไม่เผยแพร่ ส่วน C จะเชื่อม Import ทั้งสอง format กับ diff/backup ใน commit ถัดไป

## Data Template — ส่วน C

ปุ่ม Import เดียวอ่าน format อัตโนมัติ: AI pack ใช้ decode/stage/validator เดิม; evervale-content-v1 ใช้ validator เดิมแล้วเข้าสู่ diff และยืนยัน/สำรองก่อนบันทึกเหมือนกัน ไม่มีการเขียนข้อมูลเมื่อเพียงเลือกไฟล์ ไฟล์ Export แทน overrides ทั้งชุด จึงมีคำเตือนชัดเจน รวมรายการที่หายไปซึ่งยังไม่แสดง diff ตามขอบเขตงาน Export ส่งออกทั้งหมดเท่านั้นเพื่อไม่ให้ reference/แผนที่/ฉากขาด ไม่รวมเซฟตัวละครหรือบัญชี

JSON เสีย/format แปลก/ช่องระดับบนเกิน/ไฟล์เกิน 2 MB/HTML ที่ไม่ใช่ JSON ถูกปฏิเสธพร้อมข้อความไทย ไม่เปลี่ยนข้อมูลเดิม HTML ภายในข้อความ JSON คงอนุญาตพร้อมคำเตือนและแสดงเป็นข้อความตามที่เจ้าของยืนยัน ไม่มีการเปลี่ยน pack/fingerprint/200 รายการ/validators/schema/config/identifiers

ผล C: pure 52/52; data-transfer-ui.test.cjs, closeout-authoring-ui.test.cjs, handoff-guide-ui.test.cjs, content-authoring-ui.test.cjs, data-template-ui.test.cjs, frontend-security-ui.test.cjs, full-schema.test.cjs ผ่าน 7/7 รายไฟล์อยู่ reports/data-template-C.json ปรับขั้นตอน 2 suite เดิมเฉพาะรอ diff/กดยืนยัน; กรณี backup ถูกบล็อกอ่านสถานะ authorStatus ของการยืนยันแทน globalStatus ยังคง assertion เดิมว่าข้อมูลต้องไม่เปลี่ยน ไม่แตะ legacy tests Source cache 77 ยังไม่เผยแพร่
