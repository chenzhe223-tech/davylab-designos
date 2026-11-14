# DAVYLAB Vibe Studio · Continuity

Updated: 2026-11-14 (Asia/Singapore)
Branch: `feat/vibe-studio-architecture-20261114`

## Locked product decisions
- User-approved design: iOS-inspired blue/gray glassmorphism; professional utility rather than overt AI visuals; responsive desktop/iPad/mobile.
- Four creation paths share one production pipeline.
- DeepSeek handles demand analysis/storyboards; ChatGPT handles advanced creative planning/review; WorkBuddy handles authorized external execution/handoff. These integrations must be validated, not inferred.
- Remotion is the composition foundation; anidoodle, vibe-knowledge-film, Stickman Director, Shotcraft, and Manim require separate feasibility/license/render verification.
- No production-complete claim before a real editable, replayable, ≥15s MP4 passes QA. No paid-resource provisioning without approval.

## Evidence in this branch
- Build script copies `vibe-studio/` to `dist/vibe-studio/`.
- Responsive UI files: `vibe-studio/index.html`, `premium.css`; existing Canvas preview and browser WebM recording remain separate from MP4.
- New editor model: `vibe-studio/timeline.mjs`; automatically recomputes consecutive start/end times after duration edits, shot moves or deletion; supports old start/end-only saved projects.
- `vibe-studio/studio.js` now edits title, seconds and visual description; renders proportional shot timeline; saves/exports a normalized project; imports JSON with max 2 MB and validation without automatically overwriting saved local draft.
- New tests: `tests/vibe-timeline.test.mjs`, `tests/vibe-import.test.mjs`.
- Exact GitHub version of `timeline.mjs` was locally decoded and passed `node --check` and eight behavior assertions (normalization, duration updates, reorder, delete, export, invalid duration, legacy schema).
- GitHub readback confirmed no duplicated DOM IDs, no unresolved studio.js $() lookups, preserved responsive breakpoints and import/export element wiring.

## Unverified / remaining
- Full repository `npm run check` was NOT run: the current local container could not resolve github.com to clone repository. Node timeline unit smoke check is not a substitute for full test run.
- Real desktop/iPad/mobile browser visual and interaction QA pending; no claim of deploy.
- DeepSeek API integration, Remotion service and real MP4 render not yet implemented; browser WebM is not MP4.
- LocalStorage does not provide multi-device persistence; needs later backend integration.

## Next executable task
1. Run complete repository build + tests in an environment with repo checkout; fix failures without changing approved UI direction.
2. Verify shot editing/import/export on desktop, iPad and mobile browsers and fix any clipping/scroll issues.
3. Implement safe server-side DeepSeek storyboard route (no frontend keys) and real Remotion MP4 renderer in a separate worker, followed by ≥15-second render test and ffprobe evidence.

Delivery states: Code Completed (editor increment only); Build Passed: unverified; Runtime Verified: unverified; Functional Tested: limited Node timeline assertions only; Production Deployed: no.


## 2026-11-14 P0 DeepSeek → renderer integration increment

- Implemented Cloudflare Pages Function `functions/api/vibe/storyboard.js` for POST `/api/vibe/storyboard`, importing the existing storyboard schema in `vibe-studio/engine-contract.mjs`.
- Authentication: same-origin requests and ephemeral bearer access token matched to `VIBE_STUDIO_ACCESS_TOKEN` secret; `DEEPSEEK_API_KEY` is server-side only. Missing secrets return 503, JSON/body/duration/aspect limits enforced, upstream error details sanitized, responses are `no-store`. **No live deployment, live model call or billing authorization is implied.**
- Existing approved glass UI now includes optional AI button, ephemeral access field and a user-selectable 15/30/60/90/120-second target. Local storyboard generation continues working without AI credentials.
- `vibe-studio/timeline.mjs` now retains AI scene `motion` and `narration` metadata in project JSON. AI scenes are rendered as editable shot timeline data; **Canvas demonstration playback still does not reflect AI-generated visual instructions**.
- Existing `vibe-renderer/` Remotion package, sample 15-second project, render CLI and metadata verifier were found in GitHub; preserved instead of duplicating them. No MP4 rendering was performed or claimed in this increment.
- Added `tests/vibe-storyboard-api.test.mjs` (6 tests), `tests/vibe-ai-to-render.test.mjs` (1 integration-contract test) and reused `vibe-renderer/tests/render-input.test.mjs` (4 tests).
- **Actual Node.js tests: 11/11 passed** on the GitHub source files reproduced in the local environment. Exact Git object SHA matches verified for API handler `687ef20032d9960d27cbc9916c518cb61d01d04d`, engine contract `47f9f9a29aa2dbf6c2b46dbeb3380eb83c629129`, timeline `2221002c88e8a4deb9289e70d8d3757bd7b527e4`, renderer input `896f41fd570ad2c36632c7145215423427fda8e8`, API tests `6e02c611487a130c76ef585e0acc1c96c3f10904`, render-input tests `cfcbf185c3bc040fb96bfca0235b70c9ef0de7e0`, AI-to-render test `57f8ed216d40c26bf848c4ca878b166097312c72`.
- Cloudflare Pages API method precedence (specific `onRequestPost` over generic `onRequest`) was checked against official documentation (Apr 2026) and matches this module’s exports.
- Limitations: no repository-wide `npm run check` or browser QA yet (GitHub checkout unavailable in local container), no Remotion package installation or real MP4, no real API key / provider call, no online deployment. Add usage rate limits/quotas prior to exposing this endpoint publicly.

Next task: test the existing Remotion CLI with actual Node dependencies in a connected runner, generate and visually inspect ≥15s MP4 plus ffprobe/metadata evidence; validate 3 responsive browser sizes; improve engine adapters after license checks.
