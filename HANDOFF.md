# ส่งต่อ Decide Fate

เป้าหมาย: เกมเล่นคนเดียว/มี DM ใช้ grid และ 2 AP; ไม่รวม multiplayer, อนิเมชั่นตัวละคร หรือออกแบบ UI ใหม่ เนื้อหาสกิล/เวท/อุปกรณ์สามารถเติมภายหลังได้ แต่ต้องผ่านระบบจริง

## งานข้อมูลโดยไม่ต้องเขียนโค้ด

เปิดเกม → ฐานข้อมูล → “เพิ่มข้อมูลที่ใช้ได้จริง” คู่มือภาษาไทยอยู่ที่ `dist/maintenance-guide.html` และเปิดจากในเกมได้ เลือกแม่แบบที่รองรับแล้วสร้างเอง หรือดาวน์โหลดคำสั่ง TXT ให้ ChatGPT/Claude ฟรีช่วยทำ JSON นำกลับมาตรวจ diff และยืนยัน ไม่มี API หรือการส่งข้อมูลอัตโนมัติ

- เอกลักษณ์รายการใหม่ `custom-*`, ชื่ออ้างอิงและ templateKey คงที่; displayName แก้ได้
- สืบทอดกลไกของแม่แบบจริง ไม่ใช่รันโค้ดจากคำตอบ AI รองรับสูงสุด 200 รายการใหม่
- ชุดคำตอบ AI รวมข้อมูล ไม่แทนที่ทั้งหมด ตรวจ baseline ป้องกันทับงานที่เปลี่ยนระหว่างรอ
- สำรองอัตโนมัติก่อนสร้าง/ใช้ชุดข้อมูล/ย้อนคืน เก็บล่าสุดหนึ่งชุดต่อบัญชีใน IndexedDB; การแก้ฟอร์มทั่วไปยังต้องส่งออกเอง
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

ตรวจฟิลด์หลังเพิ่มระบบโลก/อีเวนต์: [WORLD-DATABASE-AUDIT.md](WORLD-DATABASE-AUDIT.md) และตารางครบ 262 ช่อง [WORLD-DATABASE-FIELDS.md](WORLD-DATABASE-FIELDS.md); รัน `node tools/audit-world-links.cjs` เพื่อตรวจซ้ำจากข้อมูลในโปรเจค (ไม่ใช่บัญชี Supabase จริง)
