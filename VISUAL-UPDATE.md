# Decide Fate — Anime visual update

Working source: this folder, based on the uploaded Prototype 13 archive. The owner clarified that the earlier game was files tested in Codex, not an existing deployed website. Continue local development and testing from this version.

## Changes
- The approved title illustration has been cleaned of painted menu buttons; the original ID/password authentication form is now on the opening screen. No extra enter screen is required.
- The grid workshop uses a local transparent illustrated atlas for oak, cherry blossom, pine, flowering shrub, mossy rock and cave crystal props.
- Terrain lighting, grass details, cliff faces, biome palettes and workshop panels have been refined.
- Geometry, camera picking, movement rules and save format are unchanged. If the atlas cannot load, the procedural objects remain available.
- Existing Supabase configuration, storage identifiers and Site binding are retained. No schema migration is needed.

## Run
From this directory, run `node preview.cjs`. The server uses port 4173. The app itself requires no install or build. Supabase login requires access to the original backend and esm.sh SDK. Do not run setup.sql against the established database.

## Validation
Pure checks: `node battle-view.test.cjs` and `node battle-data.test.cjs`.
Browser checks use Playwright and installed Chromium with mocked Supabase; no player saves are touched. The adapter handles the Windows-specific imports in the original handoff tests and supports the original handoff tests.

In this cloud machine:
```sh
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
export PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium
node tools/qa-runtime.cjs battle-editor.test.cjs
node tools/qa-runtime.cjs battle-isometric.test.cjs
node tools/capture-visuals.cjs
```

On another machine, make Playwright available to Node and set PLAYWRIGHT_CHROMIUM_EXECUTABLE to its Chromium binary. Screenshots from the visual capture script are written to artifacts/qa/. The original handoff tests also write screenshots one directory above the working directory.

Online deployment is outside the clarified local-testing workflow. Historical Sites metadata is not required to run or edit the game.

## Camp props
Six new placeable props: tent, treasure chest, campfire, crate, barrel and signpost. All are one-cell obstacles with illustrated sprites and procedural fallback. They persist in the existing battleScenes library section; no SQL migration is needed. Props are scene decoration/obstacles only; looting and resting interactions are not implemented. Existing scenes remain compatible. Browser coverage: `node tools/qa-runtime.cjs battle-props.test.cjs` with the same NODE_PATH as above.

## Forest and cavern props
Added stump, fallen log, fern, cave mushroom, stalagmite and mineral crystal brushes, usable across all biomes alongside camp props. Newly generated forests include ferns, stumps and logs; newly generated caves include mushrooms, stalagmites and crystals. Existing saved scene definitions are not rewritten. Ferns/mushrooms are traversable at +1 movement cost; the solid props block movement. All use the existing scene library and require no SQL migration. Browser coverage: battle-biome-props.test.cjs (forest/cave painting, undo/redo, mocked cloud persistence and second-browser restore).
