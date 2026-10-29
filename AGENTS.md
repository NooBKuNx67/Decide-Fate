# Decide Fate working instructions

- This checkout is the user's primary working project. Read README.md, START-HERE.md, DESIGN-AGREEMENTS.md and VISUAL-UPDATE.md before substantial work.
- The current user-facing game name is Decide Fate. Internal Evervale/EverTale identifiers intentionally preserve compatibility with existing accounts, saves and modules.
- Continue from this checkout, not /workspace/scratch/EverTale. Cloud tasks are already isolated; do not create worktrees unless the user requests one.
- The app is static HTML/CSS/classic JavaScript in dist/. Start with node preview.cjs; no application build is needed.
- The owner clarified that the original was files tested in Codex, not a deployed website. Use this checkout directly; do not block development on Sites access or retrieval of a supposed production source. .openai/hosting.json is historical metadata. Preserve existing Supabase configuration and save compatibility.
- QA must use mocked authentication/storage and must not modify real player saves. Existing browser tests need the compatibility runner documented in VISUAL-UPDATE.md.
- Keep view/render changes separate from battle-data movement and saved schemas. Verify camera picking and desktop/mobile rendering after visual changes.
- The current goal is local development and testing in this primary chat. Do not assume deployment is pending or ask the user to return to the old chat. Reassess hosting only if the user explicitly requests an online deployment.
