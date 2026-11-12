# Local DM setup

Recommended starting point for Windows / RAM 16 GB / RTX 4060: LM Studio with a 7–8B instruct GGUF Q4 model. Model quality, Thai comprehension and actual memory use must be checked on the owner's machine. Start with a modest context window (4096 tokens), close other GPU-heavy applications and reduce model/context size if memory is insufficient.

1. Install LM Studio from its official website and download a suitable instruct model.
2. Load the model and start its OpenAI-compatible local server, normally port 1234.
3. Open Decide Fate on the same computer. Open the story screen and Local AI settings.
4. Enter http://127.0.0.1:1234/v1 and the exact model identifier exposed by the server. Save settings.
5. Allow the game's origin in the server's CORS configuration if required. Keep the server on loopback; the game currently accepts only localhost endpoints.
6. Test through Update Test Field first. Ask for one available action, inspect the proposed command, confirm and compare the engine result. The game must retain its state if the model returns invalid JSON or stops responding.

The local model supplies narration and supported action proposals; it cannot directly create inventory, award money or replace engine results. Unsupported intentions need clarification. No model is bundled. Authentication/cloud saves still use the existing online service; local inference does not make account login fully offline. A phone's localhost points to the phone, not the PC.

Current transport tests use mocks. Real server connectivity, browser local-network permissions, Thai response quality and performance are not yet accepted. Check HANDOFF.md for implementation status before treating the game as release-ready.
