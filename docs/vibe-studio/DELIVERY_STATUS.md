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

## Consolidated local verification addendum (2026-11-15)

- Local Node 22 cross-module suite executed for director planning, local revision history, Schema V2 metadata, and renderer input validation: **21/21 tests passed**, 0 failed. The local Schema V2 `timeline.mjs` and `render-input.mjs` matched current GitHub Git-blob SHAs `a0059ce9972167db3f8865cba728ddb6754d9d34` and `9d835e8c197a9d200bb86a88112bd16605f2fb53`, respectively. Director/revisions tests used tested local implementations plus GitHub source-level readback checks; the 21 tests are not a full GitHub checkout test run.
- Actual FFprobe after rendering proved 30fps / H.264 / 854×480 / exactly 15.000s and 17.000s; original and edited SHA-256 different. Both real FFmpeg blackdetect checks reported no qualifying black regions.
- Local proof ZIP integrity passed `unzip -t` with no errors; ZIP is a downloadable Chat artifact, not a GitHub release.
- Remotion official API documentation checked: `@remotion/renderer.getVideoMetadata()`, CLI `--props`, `--license-key`, and `--is-production=false` are documented. Missing dependencies remain the block; this check is not runtime evidence.
- Additional UI implemented: editable source/claim references, character registry, per-shot engine tags, and local 12-version restore; source-level JS syntax and DOM reference checks passed. Actual full desktop/iPad/mobile browser E2E remains pending.

**Do not downgrade P0 or P1–P3 acceptance criteria** to the FFmpeg technical proof or metadata-only implementations.

## 2026-11-15 · Incremental P0 receipt gate

- Source fix: renderer now independently reopens the persisted receipt and hashes the final MP4 before publishing a `verified` job. Commit: `d72b7c3a9a2a208ec0f31776323a300e4f88079b`.
- **Validation performed:** GitHub source readback confirmed the receipt verification executes before verified job persistence, with the existing failure cleanup preserved. **Not performed:** fresh-checkout executable tests, Remotion installation, typecheck, actual Remotion MP4 render, browser device QA, cloud job/deploy.
- Delivery gates unchanged: **Code Completed (incremental only)**; **Build Passed: NO**; **Runtime Verified: only previous targeted utilities**; **Functional Tested: no Remotion E2E**; **Production Deployed: NO**.

## 2026-11-15 · Visual edit-and-rerender QA increment

- Added a real decoded-frame comparison gate at 6 seconds to the **manual-only** P0 acceptance workflow, using FFmpeg frame MD5; source implementation in `vibe-renderer/frame-qa.mjs`.
- Local reproduced-code verification: **3/3 Node unit tests passed**; separate actual FFmpeg H.264 fixtures demonstrated differing colors pass and identical decoded frames reject. Fixture videos are not Remotion outputs.
- P0 has **NOT** passed: no Remotion install, real Remotion MP4 or browser E2E in this increment. Build Passed NO; full Runtime Verified NO; full Functional Tested NO; Production Deployed NO. No CI workflow run or charge was initiated.

## 2026-11-16 · P0 renderer setup failure-handling increment

- Source fix `f3e67e0448e01827557ecddc82255f841d184555`: initial render-job and confidential props writes are now guarded by try/finally. Failed renders remove unverified MP4/receipt and best-effort persist a failed status; props cleanup runs even on setup failures.
- GitHub source readback passed. No full build, runtime renderer test, true Remotion MP4, desktop/iPad/mobile browser E2E or production deployment executed in this increment due npm/GitHub DNS unavailability and unconfirmed license authorization.
- Delivery gates unchanged: incremental Code Completed; Build Passed **NO**; Remotion Runtime Verified **NO**; P0 Functional Tested **NO**; Production Deployed **NO**.
