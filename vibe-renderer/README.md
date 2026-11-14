# DAVYLAB Vibe Renderer P0 (isolated Node process)

This is a **real Remotion composition and render CLI**, not a Cloudflare Worker. Requires Node >=20, local Chromium and native media tools supported by Remotion. The UI/Canvas demo is separate.

## Setup (local; only where Remotion licensing and resource usage are authorized)
```bash
cd vibe-renderer
npm install
npm test
npm run render -- ./examples/p0-city-15s.json
```
The command creates `output/vibe-*.mp4` and verifies file size and media duration. Render status must only be marked completed after this command succeeds. No render/test/deployment success is claimed merely because files exist in GitHub.

The standalone package deliberately does not change the DesignOS root npm scripts or production deployment. The renderer runs only where Node/Chromium are available; never in Cloudflare Workers. Input is validated using the existing Vibe Studio timeline contract, including a 15–120-second duration gate, and shot edits affect the output timing and text.

**Important:** This first composition makes real, code-generated typography, grids, light/orbit motion and transitions based on shot titles/descriptions. It does **not** pretend to implement anidoodle, Stickman, Manim or image/video AI generations; these require separate tested adapters.

## Licensing
Remotion is source-available under its own Remotion License rather than standard OSI open source. Current free-license eligibility and use cases must be checked before deployment: https://www.remotion.dev/docs/license/pricing

## Test evidence required
1. `npm test` passes.
2. `npm run render -- ./examples/p0-city-15s.json` succeeds.
3. Inspect rendered MP4 visually, verify duration, resolution, playable video, transitions and no black frames.
4. Modify a shot title/duration, re-render, compare rendered frames and new duration.
5. Only then mark Functional Tested.

## Independent media QA (actual execution evidence)

The rendering CLI also invokes `scripts/qa-video.mjs` before it reports success. This invokes local `ffprobe` and `ffmpeg` to check H.264, dimensions, duration and black-frame regions >= 0.15s.

```bash
node scripts/qa-video.mjs output/your-video.mp4 15
```

On 2026-11-14, a byte-for-byte verified copy of `qa-video.mjs` (Git blob SHA `2566d08becbcf39e7f2b1fae4d343e70d1c1a808`) passed a real 15-second, 480x320 H.264 synthetic *QA fixture* (not a Vibe Studio render): 2,756,322 bytes, 15.0s, 0 black regions. A synthetic 2s black fixture was rejected with `Black frame region(s) detected: black_start:0 black_end:1.966667`. This **validates the QA checker**, not the Remotion pipeline or P0 final video.

The package install/render could not be executed in the current sandbox because `registry.npmjs.org` could not be resolved (EAI_AGAIN). Run it in an authorized checkout with network access before changing Build Passed / Runtime Verified status.

## Verified delivery receipt

After a successful Remotion render and media QA, the CLI writes both `render-job-<uuid>.json` and `render-receipt-<uuid>.json` next to the MP4 under `output/`. The receipt records the normalized project input SHA-256, rendered MP4 SHA-256, duration, codec, dimensions and QA status. A failed render does not keep a deliverable MP4 or a successful receipt.

Independently verify that a received artifact is byte-identical to its QA-tested MP4:

```bash
npm run verify:receipt -- output/render-receipt-<uuid>.json
# On a different computer, override the video path:
npm run verify:receipt -- receipt.json /path/to/transferred-video.mp4
```

Hash verification **checks integrity, not video quality by itself**. Use it only with a receipt produced after successful actual FFprobe/FFmpeg QA. The initial receipt implementation has no digital signature or authenticated publisher identity; do not treat an arbitrary externally supplied receipt as trustworthy.

**Current evidence:** receipt logic was tested with temporary binary fixtures, including altered-size and same-size tampering rejection (3/3). This is not evidence of a real Remotion MP4 render.

## License & cost gating before real renders (Remotion 4.0.543)

The isolated render CLI defaults to **development renders** (`--is-production=false`) and fails before creating a render job if no licensing declaration has been configured. The implementation follows the official Remotion CLI flags available in 4.0.539+.

If you have independently verified that you qualify for the Remotion Free License, configure the following values in your **private runtime environment** (never GitHub or browser JavaScript):

```bash
VIBE_REMOTION_LICENSE_KEY=free-license
VIBE_FREE_LICENSE_CONFIRMED=true
```

If you are **not** eligible for the free license, follow Remotion's terms and obtain a suitable paid company license with a server-side `rm_sec_` key. Do not enable paid resources without approval.

Only after explicit cost authorization may production rendering be enabled:

```bash
VIBE_RENDER_PRODUCTION=true
VIBE_RENDER_COST_APPROVED=true
```

Do not commit secret license keys, place them in browser bundles, or paste them into shared logs. No actual Remotion render has been executed in the current environment. See https://www.remotion.dev/docs/options/license-key and https://www.remotion.dev/docs/license/pricing.
