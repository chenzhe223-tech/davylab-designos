# VoxCPM2 P0 integration — 2026-11-21

Status: contract implementation only; no GPU inference or production deployment verified.

## Existing architecture
- `vibe-studio/`: storyboard, editable timeline and Canvas preview.
- `vibe-renderer/`: separate Remotion composition and media QA.
- `functions/api/vibe/`: Cloudflare Pages Functions, existing storyboard authorization.
- `tests/`: Node test runner.

## Minimal non-disruptive plan
1. Add dependency-free voice request contract and consent gate (this increment).
2. Add authenticated server-only voice job endpoint; reject requests without configured backend and access token. Never accept arbitrary reference URLs or client-provided backend URLs.
3. Run VoxCPM2 in a separate Python/CUDA worker. Pin upstream release and dependencies, load the model once, use bounded queues and job timeout. Worker returns verified 48kHz WAV and receipt.
4. Store authorized voice reference assets privately; server resolves opaque IDs and checks owner, consent and retention before cloning.
5. Add a small voice panel to the existing editor and associate resulting audio asset IDs with storyboard shots. Preserve all existing timeline data and routes.
6. Extend Remotion input validation to accept only verified voice asset metadata and use real audio duration, then perform an actual >=15s edit-and-rerender QA.

## Acceptance gates
- Code Completed: contract + tests committed; backend/UI/render integration pending.
- Build Passed: run `npm run check` on actual branch checkout.
- Runtime Verified: run real VoxCPM2 TTS, design and consented cloning on GPU.
- Functional Tested: verify WAV playback, Mandarin/English pronunciation, stable voice, duration sync, invalid requests and fail-closed authentication.
- Production Deployed: only after authorization, security review and actual live smoke test.

Upstream: https://github.com/OpenBMB/VoxCPM (Apache-2.0).
No paid GPU provisioning, credential changes, deployment or merge authorized by this increment.
