# DAVYLAB Vibe Studio · Delivery Gates / 2026-11-15

Status: **Active development; P0 Remotion acceptance NOT passed.** No production deployment.

## Actual evidence and precise boundaries

| Stage | Actual code shipped to feature branch | Verified | Missing acceptance |
| --- | --- | --- | --- |
| P0 | Four entry paths, editable multi-shot workspace, Canvas preview, 15–120s browser WebM, safe optional DeepSeek API, independent Remotion renderer, FFmpeg media QA + SHA receipts | Local tests for schema, director and version history; 15s + edited 17s **FFmpeg technical proof** (H.264, 854×480), no black-region detections | Remotion npm install/typecheck, live Remotion render ≥15s, edit/rerender in Remotion, device QA, real DeepSeek API, project backend |
| P1 | Schema V2 knowledge sources + claims, source URL/excerpt editor, explicit source-to-claim/shot references, fact-coverage validation, knowledge-film routing | Source registry, JSON normalization and director routing checks; **no remote retrieval or independent fact verification** | Actual vibe-knowledge-film engine integration, factual source retrieval/citation checking, complete ≥30s knowledge MP4 |
| P2 | Character definitions/appearance metadata, scene references, consistency-of-ID checks, story routing and Shotcraft recommendations | Data integrity and routing only; **not visual character consistency** | Stickman runtime, Shotcraft runtime, actual scene continuity and product-ad MP4 |
| P3 | Single project schema / shot routing registry with fail-closed unintegrated engines; local 12-version snapshots & restore; Manim routing tag | Pure Node tests and DOM/source wiring checks; not server persistence | Real Manim adapter, server-side trusted engine registry, queue, multi-engine composition, cross-device/cloud storage, integration E2E |

## Offline MP4 proof, not the Remotion success criterion

Local FFmpeg proof rendered two **real playable videos**, not static concept screenshots:
- Original: 15.000s, 30fps, H.264, 854×480, SHA256 `d44d74ebf27c1f5c903daff98f396945e1e0c382c86b5cdc842989e5e081295e`
- Changed storyboard: 17.000s, 30fps, H.264, 854×480, SHA256 `1f453411bafd95ad6fbe5d2741ee41c1af2a02eac79a75371e162da781b57dd4`
- Both passed actual FFprobe inspection and actual FFmpeg blackdetect with no ≥0.15s black-region events.
- The local script used for the proof was subsequently adapted into `vibe-renderer/scripts/render-ffmpeg-proof.mjs`; that GitHub version additionally invokes shared FFmpeg QA. The exact committed script has **not yet been executed from a fresh GitHub checkout**. The MP4s are technical-quality gradients and text with captions, **not polished anidoodle/Remotion compositions**. No paid AI calls or cloud deployments occurred.

## Gate assessment

1. Code Completed: partial by phase, incremental code in GitHub.
2. Build Passed: **NO** (full repository + Remotion typecheck not run in this environment).
3. Runtime Verified: FFmpeg fallback + pure JS modules only; Remotion runtime NOT verified.
4. Functional Tested: local proof 15s/17s + pure JS; browser end-to-end and Remotion edit/rerender NOT verified.
5. Production Deployed: **NO**.

## Blockers

- Current Chat container cannot resolve GitHub/npm registry hostnames for installing pinned Remotion dependencies; no preinstalled Remotion. Must not substitute FFmpeg fallback for Remotion acceptance.
- No confirmed license eligibility and private Remotion key/consent configured. Production render cost protections remain fail-closed.
- No real connected runtime adapters for anidoodle, vibe-knowledge-film, Stickman, Shotcraft, or Manim. Registry entries are marked not-integrated.
- localStorage revisions are device-local. Supabase, RLS, cross-device recovery and asset storage remain pending.
- No verified deployment URL for latest feature branch.

## Next non-negotiable steps

1. In a user-authorized network-enabled runner, run root `npm run check` and renderer `npm install && npm test && npm run typecheck`. Confirm licensing first; no automatic paid run.
2. Execute existing manual 15s + changed 17s Remotion render acceptance workflow, inspect both actual MP4s, FFprobe metrics, black frames, and QA receipts. Fix failures and rerun.
3. Implement real DeepSeek service integration and rate limits, then validate 4 creation modes on desktop, iPad and mobile.
4. P1 knowledge-film first, then P2 Stickman/Shotcraft, then P3 Manim/engine adapters, with actual exported videos for each.
5. Maintain `docs/vibe-studio/CONTINUITY.md` after each major tested increment. Never mark a task passed from source-only tests.
