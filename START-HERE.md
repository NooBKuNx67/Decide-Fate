> Current owner clarification: this project was files tested in Codex, not a deployed website. Continue from /workspace/Decide-Fate. Sites and URL references below are historical handoff metadata and must not block development or local testing. See README.md and VISUAL-UPDATE.md for the implemented Decide Fate update.

# EverTale — เริ่มทำงานต่อบนคอมเครื่องใหม่

เวอร์ชันส่งต่อ: Prototype 13 (27 ตุลาคม 2026)
Source commit: 0d246b798e07dabc4b81b7a7a588c393cfa9761e
เว็บเดิม: https://evervale-life-demo.kindllama22.chatgpt.site
Sites project_id: appgprj_6adf07c6cb84819180fd12c010abb306

## สำหรับเจ้าของเกม
1. เครื่องเดิม: บันทึกฉาก/ฐานข้อมูลและรอ Supabase แจ้งว่าบันทึกสำเร็จ ถ้ามีตัวละครให้ซิงก์เซฟเกมด้วย ส่งออกไฟล์ JSON สำรองจากเมนูเกมได้
2. คัดลอก ZIP นี้ไปเครื่องใหม่แล้วแตกไฟล์ เปิดโฟลเดอร์ EverTale ใน Codex โดยใช้บัญชี OpenAI เดิม
3. ให้ Codex อ่านไฟล์นี้และ DESIGN-AGREEMENTS.md ก่อนพัฒนา
4. เปิดเว็บเดิม ลงชื่อเข้าใช้บัญชี OpenAI ที่มีสิทธิ์เว็บ แล้วเข้าเกมด้วย ID/รหัสผ่านเกมเดิม ข้อมูลฐานข้อมูล/ฉากที่ซิงก์แล้วจะโหลดจาก Supabase ส่วนตัวละครให้โหลดเซฟคลาวด์
5. ZIP นี้มีโค้ดและข้อมูลตั้งต้น ส่วนเซฟผู้เล่นและรายการที่แก้ในเกมอยู่บน Supabase หรือในเบราว์เซอร์เครื่องเดิม ข้อมูลที่ยังไม่ซิงก์จะไม่ย้ายมากับ ZIP

ข้อความที่คัดลอกส่งให้ Codex เครื่องใหม่:
“ทำโปรเจกต์ EverTale นี้ต่อ อ่าน START-HERE.md และ DESIGN-AGREEMENTS.md ก่อน ใช้เว็บไซต์และ Supabase เดิม อย่าสร้าง Site หรือตารางใหม่ ตรวจเวอร์ชันล่าสุดจาก source repository ของ Sites ก่อนแก้ เพื่อไม่ให้ใช้สำเนาที่เก่า จากนั้นช่วยเปิดเกมให้ทดสอบ”

## Technical handoff for the next coding session
- Static HTML/CSS/classic JS; dist/ is the full deployed app. No npm install or build required for the game.
- .openai/hosting.json binds the existing Site. Preserve project identity and owner-only access. Use the Sites skill and its source workflow to open the latest repository before editing/publishing. Acquire a fresh credential through the tool; none is included here. This ZIP deliberately excludes .git and machine-specific auth/config.
- Local preview with Node: node preview.cjs, then http://127.0.0.1:4173 (online connection needed for Supabase SDK/auth). Do not run setup.sql again against the established DB unless a real schema change is needed.
- dist/cloud.js configures the existing Supabase URL and public publishable key. The key is intended for the browser; RLS controls per-user saves. No service-role/admin secret is included. Do not change the ID alias domain or existing storage names: internal Evervale identifiers preserve account compatibility.
- Existing table evervale_saves has RLS user ownership and revision-CAS. Independent contentLibrary and gameplay share one JSON row; preserve both when saving. No extra database migration needed for Prototype 13.
- Content library: 504 original records plus 2 prototype records, all 13 original schemas/205 fields. Original content is embedded in dist/content.js and content-schema.js; no dependency on the old computer's original JSX.
- Independent user content overrides include worldMap:main and battleScenes:main. Aggregate library limit remains 2,000,000 serialized chars. Uploaded images are Base64 or URLs. User overrides are not in this source archive.
- Map tool: image maps, place pins, nested maps and existing activity actions.
- Battle workshop: 30 scenes, meadow/forest/cave, 6–40 cells/axis, presets and custom rectangle sizes, terrain/elevation/climb flags, spawn markers with monster IDs, seeded generation, undo/redo, strict validation. Pure simulation in battle-data.js; isometric renderer/camera/picking in battle-view.js; editor in battle-editor.js.
- Test sandbox supports 4-way pathfinding, 6 MP/turn, stepped elevation, tree base/perch ascent/descent and cliff climb routes. Enemy placeholders stay at spawn. Attacks, enemy AI, skills, cover/LOS, rewards and automatic campaign encounters are not connected. Character combat images remain separate from placeholder pawns. Campaign time/state is unchanged by playtesting.
- Character creation supports 9 root races, 8 main classes and 3 image slots (icon/portrait/combat). Activities/skills/learning/rare Kishirika eyes use existing prototype rules. Secondary/special classes, offspring and full combat are future work.
- Pure tests: node rules.test.cjs; node battle-data.test.cjs; node battle-view.test.cjs; node library-merge.test.cjs; node cloud.test.cjs.
- Browser tests use Playwright + Edge and mock Supabase. Their require path currently references the original machine's bundled Playwright runtime; locate the new machine's runtime and adapt that import before running. Do not install browsers or touch real player saves merely to run mocked QA. Server must run first. Tests include battle-editor.test.cjs, battle-isometric.test.cjs, maps.test.cjs, character-art.test.cjs, browser.test.cjs and full-schema.test.cjs.
- Latest verified release: isometric view, 40x40 save and second-browser restore, camera picking after zoom/pan, rectangular generation, mobile overflow, 144 seeded layouts, tree/cliff movement and prior cloud/game preservation checks.

## Files
- dist/: all game code/assets and original DB content
- .openai/hosting.json: existing site binding
- DESIGN-AGREEMENTS.md: implementation scope and verification history
- *.test.cjs: source tests (browser runtime path may need adaptation)
- preview.cjs: local HTTP preview server
