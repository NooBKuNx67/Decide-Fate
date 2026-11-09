# Front-end HTML sink audit — phase 3

Inspected every innerHTML occurrence in all dist/*.js: **40 assignments in 15 files**, including the six requested files. character-customizer.js is retained legacy code and is not loaded by index.html; its sole sink is static. The complete inventory follows.

## Actual editable-data risks fixed

- game.js render: imported saves may contain additional character.stats keys/values beyond the six validated stats. These were directly interpolated. Both key and value now pass through escapeHTML, without deleting data or changing validation/save schemas. A real DOM payload executed before the fix (window.__xss became 1) and remains inert afterward.
- creation-ui.js character: a newly authored weapon may have a canonical name containing HTML. Its equipped main-hand name was directly interpolated. Escape the resolved label before interpolation. Built-in offhand labels are fixed shipped definitions.

Character name, learned ability labels and buff text in game.js were already escaped. Database record names/descriptions/full-field summaries/references in content-editor.js were already escaped. Content overrides do not replace the shipped creation race/class/Unique definition tables. Combat/editor shell markup is static; dynamic enemy/skill/scene labels elsewhere are assigned through textContent/Option/DOM properties.

Image flows: content-editor.js sets preview.src/alt through DOM properties, with the existing raster/http(s) allowlist. character-art.js/maps.js use DOM image properties too. A URL containing a quote and onerror remains one src value, not an attribute. No URL rules, save validation or Supabase configuration were changed. The two additional insertAdjacentHTML sites are escaped fieldHelp in content-editor.js and maps.js's fallback SVG copied from the shipped HTML before user edits, not user SVG.

## Regression coverage

frontend-security-ui.test.cjs uses a real browser DOM and mock auth/cloud with fresh context storage. It checks `<img src=x onerror=__xss=1>` in imported character names/additional stat keys and values, an actually authored/equipped weapon, database display overrides, and an image URL attribute-breakout attempt. Requires no CSP to pass. It checks both no execution and no injected event attributes, while preserving literal display text.

## CSP proposal only — no index.html change

The following policy passed an ephemeral route-injected meta test for mocked login/logout and the real grid lab, with no securitypolicyviolation events:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://esm.sh; connect-src 'self' https://esm.sh https://*.supabase.co wss://*.supabase.co; img-src 'self' data: blob: https: http:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:">
```

Inline styles are needed by current layout/DOM style attributes; the two Google font hosts match style.css. Image sources preserve existing remote and uploaded images. esm.sh is needed for the dynamic SDK import; Supabase HTTPS/WebSocket hosts are needed for the backend. Do not assume wildcard backend access is necessary forever: an eventual production policy should use the configured project host.

**Not committed as an active meta tag:** mocked SDK/auth does not verify the actual remote esm.sh dependency graph, real Supabase authentication/network behavior or every owner-supplied asset host. Those remain unverified under this policy. Real player accounts/saves were not accessed. This is the requested textual proposal, pending separate acceptance.

## Complete innerHTML inventory

| File:line | Target | Assessment |
| --- | --- | --- |
| `dist/battle-editor.js:6` | `section` | Static shipped HTML; no editable data interpolated. |
| `dist/catalog-party-ui.js:1` | `panel` | Static shipped HTML; no editable data interpolated. |
| `dist/catalog-party-ui.js:1` | `box` | Static shipped HTML; no editable data interpolated. |
| `dist/character-customizer.js:1` | `box` | Static shipped HTML; no editable data interpolated. |
| `dist/combat-lab.js:3` | `button` | Static shipped HTML; no editable data interpolated. |
| `dist/combat-lab.js:4` | `section` | Static shipped HTML; no editable data interpolated. |
| `dist/combat-lab.js:26` | `el('labLog')` | Editable unit/action names, logs and status strings pass through escapeHTML; geometry/HP deltas come from validated engine state. |
| `dist/combat-lab.js:26` | `el('labLast')` | Editable unit/action names, logs and status strings pass through escapeHTML; geometry/HP deltas come from validated engine state. |
| `dist/combat.js:5` | `panel` | Static shipped HTML; no editable data interpolated. |
| `dist/combat.js:13` | `section` | Static shipped HTML; no editable data interpolated. |
| `dist/combat.js:28` | `$('combatHelp')` | Static shipped HTML; no editable data interpolated. |
| `dist/combat.js:58` | `rulesDialog` | Static shipped HTML; no editable data interpolated. |
| `dist/content-authoring-ui.js:2` | `panel` | Static shipped HTML; no editable data interpolated. |
| `dist/content-editor.js:16` | `$('dbList')` | Escaped editable names, descriptions, field summaries, support/review messages and reference keys. Pagination numbers and category keys are trusted numeric/static values. |
| `dist/content-editor.js:17` | `$('dbPagination')` | Escaped editable names, descriptions, field summaries, support/review messages and reference keys. Pagination numbers and category keys are trusted numeric/static values. |
| `dist/content-editor.js:30` | `$('dbKind')` | Escaped editable names, descriptions, field summaries, support/review messages and reference keys. Pagination numbers and category keys are trusted numeric/static values. |
| `dist/creation-ui.js:4` | `mode` | Shipped creation definitions plus validated enum/numeric draft or character fields. |
| `dist/creation-ui.js:8` | `$('genderChoices')` | Shipped creation definitions plus validated enum/numeric draft or character fields. |
| `dist/creation-ui.js:8` | `$('raceChoices')` | Shipped creation definitions plus validated enum/numeric draft or character fields. |
| `dist/creation-ui.js:8` | `$('classChoices')` | Shipped creation definitions plus validated enum/numeric draft or character fields. |
| `dist/creation-ui.js:9` | `$('uniqueChoices')` | Shipped creation definitions plus validated enum/numeric draft or character fields. |
| `dist/creation-ui.js:10` | `host` | Shipped creation definitions plus validated enum/numeric draft or character fields. |
| `dist/creation-ui.js:12` | `$('creationSummary')` | Shipped creation definitions plus validated enum/numeric draft or character fields. |
| `dist/creation-ui.js:17` | `side` | FIXED: authored weapon canonical name can contain markup; escaped at render. Remaining labels are shipped definitions and validated enums. |
| `dist/creation-ui.js:21` | `box` | Shipped creation definitions plus validated enum/numeric draft or character fields. |
| `dist/data-review-ui.js:1` | `label` | Static shipped HTML; no editable data interpolated. |
| `dist/event-editor.js:3` | `screenNode` | Static shipped HTML; no editable data interpolated. |
| `dist/game.js:12` | `$('creationSummary')` | Shipped race/class/activity/achievement labels and validated numeric/enum state; editable character/learned/buff labels are escaped. |
| `dist/game.js:13` | `$('raceChoices')` | Shipped race/class/activity/achievement labels and validated numeric/enum state; editable character/learned/buff labels are escaped. |
| `dist/game.js:14` | `$('classChoices')` | Shipped race/class/activity/achievement labels and validated numeric/enum state; editable character/learned/buff labels are escaped. |
| `dist/game.js:28` | `$('characterPanel')` | FIXED: imported character.stats retains extra arbitrary keys/values. Escape both before interpolation; character name/learned names/buff already escaped. |
| `dist/game.js:30` | `$('stats')` | Shipped race/class/activity/achievement labels and validated numeric/enum state; editable character/learned/buff labels are escaped. |
| `dist/game.js:30` | `$('location')` | Shipped race/class/activity/achievement labels and validated numeric/enum state; editable character/learned/buff labels are escaped. |
| `dist/game.js:31` | `$('achievements')` | Shipped race/class/activity/achievement labels and validated numeric/enum state; editable character/learned/buff labels are escaped. |
| `dist/game.js:31` | `$('event')` | Shipped race/class/activity/achievement labels and validated numeric/enum state; editable character/learned/buff labels are escaped. |
| `dist/save-recovery.js:2` | `panel` | Static shipped HTML; no editable data interpolated. |
| `dist/world-links-editor.js:8` | `article` | Static shipped HTML; no editable data interpolated. |
| `dist/world-travel-sandbox.js:2` | `dialog` | Static shipped HTML; no editable data interpolated. |
| `dist/world-travel-ui.js:2` | `editor` | Static shipped HTML; no editable data interpolated. |
| `dist/world-travel-ui.js:3` | `panel` | Static shipped HTML; no editable data interpolated. |
