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
- DeepSeek server endpoint and opt-in UI wiring exist in branch with mocked API tests; live DeepSeek call, provider credentials and authorization end-to-end are NOT verified. Remotion CLI/composition code exists separately but has NOT produced an actual MP4 in this environment; browser WebM is not MP4.
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
- Added `tests/vibe-storyboard-api.test.mjs` (8 tests), `tests/vibe-ai-to-render.test.mjs` (1 integration-contract test) and reused `vibe-renderer/tests/render-input.test.mjs` (4 tests).
- **Actual Node.js tests: 13/13 passed** on the GitHub source files reproduced in the local environment. Exact Git object SHA matches verified for API handler `687ef20032d9960d27cbc9916c518cb61d01d04d`, engine contract `47f9f9a29aa2dbf6c2b46dbeb3380eb83c629129`, timeline `2221002c88e8a4deb9289e70d8d3757bd7b527e4`, renderer input `896f41fd570ad2c36632c7145215423427fda8e8`, API tests `13a329484769c04b92a33e579628aa37bb9aca47`, render-input tests `cfcbf185c3bc040fb96bfca0235b70c9ef0de7e0`, AI-to-render test `57f8ed216d40c26bf848c4ca878b166097312c72`.
- Cloudflare Pages API method precedence (specific `onRequestPost` over generic `onRequest`) was checked against official documentation (Apr 2026) and matches this module’s exports.
- Limitations: no repository-wide `npm run check` or browser QA yet (GitHub checkout unavailable in local container), no Remotion package installation or real MP4, no real API key / provider call, no online deployment. Add usage rate limits/quotas prior to exposing this endpoint publicly.

Next task: test the existing Remotion CLI with actual Node dependencies in a connected runner, generate and visually inspect ≥15s MP4 plus ffprobe/metadata evidence; validate 3 responsive browser sizes; improve engine adapters after license checks.

## 2026-11-14 · Additional render/QA increment
- Isolated renderer package `vibe-renderer/` added with pinned Remotion 4.0.543 packages, typed React compositions, sample `examples/p0-city-15s.json`, validated Node render inputs, and a CLI that invokes Remotion + metadata checks + real FFmpeg black-frame QA. This package is **not** installed in the DesignOS root build and is not a Cloudflare Worker.
- Node tests executed using byte-identical Git blob copies: `vibe-renderer/render-input.mjs` SHA `896f41fd570ad2c36632c7145215423427fda8e8`, `tests/render-input.test.mjs` SHA `cfcbf185c3bc040fb96bfca0235b70c9ef0de7e0`: **4/4 passed** (15-second 450-frame project, portrait dimensions, invalid inputs, legacy project). These test normalization only, **not** video rendering.
- Media QA implementation `vibe-renderer/scripts/qa-video.mjs` SHA `2566d08becbcf39e7f2b1fae4d343e70d1c1a808` was executed with FFmpeg-generated synthetic H.264 clips: valid 15-second 480×320 sample accepted (2,756,322 bytes, 0 black regions), solid black 2-second clip rejected after black detection. This validates the **checker**, NOT a Remotion-produced final video.
- Root test `tests/vibe-renderer-contract.test.mjs` added (not yet run as part of full root build). Independent renderer `tsconfig.json` and `.gitignore` added.
- `npm view remotion@4.0.543` failed with `EAI_AGAIN registry.npmjs.org` in the current sandbox; no dependency install, actual Remotion MP4 rendering, visual frame inspection, or deployed runtime tests have happened.
- Updated legal note: Remotion is *source-available under a proprietary Remotion License* with eligibility-based free use; check licensing before commercial rollout (https://www.remotion.dev/docs/license/pricing).

### Next minimal executable work
1. On a checkout with npm registry access: `cd vibe-renderer && npm install && npm test && npm run typecheck && npm run render -- ./examples/p0-city-15s.json`. Check the output file visually; inspect ffprobe logs and black frames; change duration/visual and re-render to validate editability.
2. In root checkout, `npm run check` and responsive browser tests at desktop/iPad/mobile widths. Fix any failures before deployment.
3. Only after true video and model API tests: integrate render job queue/status persistence and authenticated upload/download into UI; do not represent standalone sample video as an already completed live user job.

Current statuses: **Code Completed** (renderer skeleton and media QA code); **Build Passed** (unverified for package/root); **Runtime Verified** (QA utility only); **Functional Tested** (Node normalization 4/4 + synthetic QA checker; actual Remotion rendering unverified); **Production Deployed** (no).

## Same-turn continuation: render jobs and local MP4 preview
- Renderer now creates UUID-based output and atomically persists `output/render-job-<uuid>.json`: `queued -> running -> qa -> verified` or `failed`. Verification needs real media QA evidence. This is **local worker persistence only**, not cross-device sync.
- New `vibe-renderer/job-state.mjs` and `vibe-renderer/tests/job-state.test.mjs`. Git blob SHAs of locally tested copies: `359d4b0db006913cd7e543b93aca89ff950c44bd`, `68ee12a10e745c5ffe553401e06b05312654335d`. `node --test vibe-renderer/tests/*.test.mjs`: **8/8 passed** (input 4; state 4).
- User-facing workbench can now import local MP4 for native playback and switch back to Canvas. Imported videos are explicitly marked as **not QA-verified**. New source test `tests/vibe-video-import.test.mjs`, not yet run as part of root test.
- CLI calls Remotion metadata validation and FFmpeg black-frame QA before verified; **real Remotion video output has still not been executed** because npm registry is unavailable in this environment.
- Next: install Remotion in authorized network-enabled environment; execute >=15s sample render; visually inspect, modify and re-render; run root build, unit tests and browser viewport checks; then connect render queue and persistent storage.

## 2026-11-15 · Chat-only renderer improvement

User explicitly requires development to remain in this Chat conversation (no Work handoff, no automations). Keep performing authorized safe increments in Chat and GitHub; don't imply background execution.

### Changed and GitHub read back
- `vibe-renderer/src/scene-art.tsx` (blob `a2760f46550a0d6f901a0a538a476886d70fd052`): deterministic per-frame SVG visual assets for three simple families (city skyline, particles/orbits, and mountains). Classification uses shot title/visual description; gradients and motion are frame-driven. **P0 procedural imagery only**, not anidoodle / knowledge-film / Stickman, and not a replacement for professional scene rendering.
- `vibe-renderer/src/film.tsx` (blob `a08648c93ab2871338e72ab3a72ac6e17a610ef2`): integrates `SceneArt` beneath existing readable animated shot captions. Existing 15-second render example and root composition remain intact.
- `vibe-renderer/job-state.mjs` (blob `8fdfadff22b21b4973881e698682e878ed2c9b62`): canonical SHA-256 `inputSha256` records exact normalized project data (no raw secret storage); `verified` now also requires valid QA duration within .5 second, dimensions >=320 px, and file size >=10 KB.
- `vibe-renderer/tests/job-state.test.mjs` (blob `72d45b087b845ee4a6faece6637508458b4f6a1c`): added fingerprint order-independence/content-change tests and invalid evidence rejection. **6/6 tests passed using local byte-identical Git blob copies**, SHA cross-checked by `git hash-object`.
- `vibe-renderer/scripts/render.mjs` (blob `6cba4d7e2d039bcfa96408a81b47b40b7425ac7b`): now SHA-256 hashes QA-verified MP4 to evidence, and deletes partial/unverified MP4 on render failure while preserving failed job status.
- No production environment changed, no model API or paid service called.

### Still blocked / pending
- No network DNS for github.com / registry.npmjs.org in this container. Root `npm run check`, renderer `npm install && npm run typecheck`, actual Remotion render, browser device QA, and independent MP4 playback are **not** verified.
- Next priority in a runnable environment: install pinned Remotion dependencies, compile/typecheck the new SceneArt TSX, run real >=15s example MP4, visually inspect all shots, run ffprobe/black-frame QA, change a shot and rerender. Do not mark P0 complete before this.
- Render-state unit tests confirm validation logic but do not prove the video is playable.

## 2026-11-15 · Chat-only preview synchronization and render process safeguards

The user requires this project to continue **in Chat mode only**, without automatic scheduling or Work handoff. Maintain the approved blue-gray iOS glass visual language and existing repositories.

### Implemented and GitHub-read-back
- `vibe-studio/canvas-plan.mjs`: pure mapping from editable scene duration/title/visual into current timeline position and procedural preview family. Frame timing wraps around full total duration and responds immediately to shot duration edits.
- `vibe-studio/studio.js`: preview frame now follows the actual storyboard model rather than the old unconditional fixed 10-second city loop; camera/landscape/particle scene variants, vertical/horizontal canvas sizing and click-to-seek timeline. **Still only a procedural Canvas approximation; does not claim to match final Remotion output.**
- `tests/vibe-canvas-preview.test.mjs`: 5/5 local Node tests passed using GitHub SHA-matching copies (planner `d318b2e254cc05c15a56f551bfea000f6be38c2b`, test `b751f010008fff8140a4783630ad47795ecc1b0c`).
- Repaired an actual dead button: existing `load-mp4` / `render-file` UI had no listener in `studio.js`. Now imports a local MP4 to the native video element with Blob URL lifecycle cleanup, explicit not-QA-verified status, and Canvas/video switching. Updated responsive media CSS. Source-level checks verified all DOM IDs/references, JS parse and import handling; browser playback has **not yet been tested**.
- `vibe-renderer/scripts/process-runner.mjs`: encapsulates spawned subprocess, detects nonzero exit, stops timed-out rendering (10 minute default) and safely rejects bad command settings. `render.mjs` uses it; receives actual input/output SHA-256 in successful CLI receipt.
- `vibe-renderer/tests/process-runner.test.mjs`: **4/4 actual Node subprocess tests passed**, including deliberately hung process termination; GitHub SHA-matching copies verified (runner `ff2bd2536e6f2db8667a0685ee0166b79aff65d1`, tests `ace66e99d391a86bc5251a0e76790bc9facd5e85`).
- New `tests/vibe-preview-wiring.test.mjs` was committed but full build-distribution test cannot run without entire root repository checkout. Source checks confirmed syntax, unique IDs and missing DOM refs = 0.

### Current state and next step
- This increment: 9/9 verified targeted Node tests. No full root build, TypeScript typecheck, browser test or Remotion >=15s MP4 rendering has been demonstrated in this turn.
- Current container has Node 22, FFmpeg and FFprobe but no access to GitHub checkout or npmjs registry for Remotion dependency installation; do **not** substitute FFmpeg synthetic QA clips for real Remotion renders.
- Next: run full `npm run check` when full repo is accessible, install pinned Remotion dependencies, `npm run typecheck`, execute sample `npm run render -- ./examples/p0-city-15s.json`, visual frame QA, change a shot then re-render. Validate desktop/iPad/mobile and persistent saved data.
- Delivery gates: Code Completed for incremental changes; Build Passed: unverified; Runtime Verified: targeted Node functions only; Functional Tested: partial local components, no end-to-end; Production Deployed: no.

## 2026-11-15 · Chat-only continuation: preview, local MP4 playback, bounded renderer

- Added `vibe-studio/canvas-plan.mjs`: map editable storyboard timings and shot descriptions to deterministic Canvas preview family and seek position. Local independent Node tests: **5/5 passed**, verified byte-identical to GitHub blobs.
- Updated `vibe-studio/studio.js` to use timeline-aware scene preview with canvas portrait/landscape sizing, shot seeking, current shot name and timecode, active track segment highlighting. This is an **approximate procedural preview**, not the final Remotion composition.
- Fixed a pre-existing broken local MP4 button: `load-mp4` and `render-file` now bind real native video playback, Blob URL cleanup and explicit warning that importing a file does not mean QA was performed.
- `vibe-renderer/scripts/process-runner.mjs` adds 10-minute Remotion subprocess timeout, failed process detection and termination for hangs. Local Node subprocess tests: **4/4 passed**, verified byte-identical Git blobs. Render CLI uses it and includes input/output SHA-256 in successful delivery receipts.
- Additional root regression tests: `tests/vibe-canvas-preview.test.mjs`, `tests/vibe-preview-wiring.test.mjs` updated; full root build-distribution tests not executed.
- Source-level readback checks passed JS parsing, all DOM IDs resolving, no duplicated IDs, timecode/active track wiring, media URL cleanup and mobile CSS. These are not a replacement for browser QA.
- **9/9 newly executed local Node assertions passed**. No Remotion dependency install, actual Remotion MP4, full root build, desktop/iPad/mobile E2E tests, or production deployment in this increment; avoid claiming P0 passed.
- Current GitHub branch is `feat/vibe-studio-architecture-20261114`. Preserve approved blue-gray iOS glass visual.
- Next priority: complete repo `npm run check`; renderer `npm install && npm test && npm run typecheck`; 15s Remotion render + visual/ffprobe QA + edit-and-rerender test in a connected environment. Then add real persisted render jobs and authenticated downloads without false completion states.
