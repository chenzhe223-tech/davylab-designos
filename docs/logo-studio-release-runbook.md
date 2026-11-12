# Logo Studio · P0–P4 release runbook

## What works in code
- Primary navigation and dual-mode brand brief.
- Clearly labelled deterministic offline SVG exploration (NOT AI).
- Live OpenAI-compatible chat-completions SVG generation via Cloudflare Pages Function. Model output is rejected if missing structured three-concept data or failing static SVG safety rules.
- Iterative AI refinement and manual SVG source editing, downloadable SVG and PNG.
- Temporary provider API key held in input memory only (not saved in localStorage). Configure a server-owned key only together with `LOGO_STUDIO_ACCESS_TOKEN`.
- User-controlled local archive, external Agent task instructions (ChatGPT, Claude, WorkBuddy, Qwen, Kimi, GLM, Gemini, Cursor), and import checks.
- Score-based QA with five manually attested release gates and source SHA256.

## Important boundaries
- A valid SVG parser result DOES NOT prove trademark clearance, font licensing, brand originality or quality.
- The front end can generate live SVG only when a valid model key is provided. No production key is currently committed, and no model-generated response has been live-tested using a paid provider credential.
- Built-in diagrams (offline templates) are not an AI result.
- A local backup is localStorage, not account sync.
- A reviewer's checkbox means self-attestation, not verified trademark registration.
- The static development server does NOT execute Cloudflare Pages Functions; provider integration requires a Pages runtime (or compatible local emulator).

## Production setup
1. Verify the Cloudflare Pages production project is `davylab-designos` and deploy using the existing deployment process. Preserve /classic/ and /resources/ access behavior.
2. Publish the repository root `functions/api/logo/generate.js` together with `dist/` assets. If the existing deployment pipeline only uploads dist without Pages Functions, upgrade the deployment pipeline before claiming that the live AI endpoint works.
3. Prefer temporary BYOK mode if no service-managed API budget is approved. To use a server-owned key, configure **both** `OPENAI_API_KEY` and `LOGO_STUDIO_ACCESS_TOKEN` as Cloudflare environment secrets, never put them in the repository, static bundle, or logs. Optional model name: `LOGO_STUDIO_MODEL` (default `gpt-4.1-mini`). Do not set these production credentials until billing and exposure controls are approved.
4. Check /logo-studio/ 200, /logo-studio/ai-session.js 200, and POST /api/logo/generate; a request with no token must not invoke server-funded AI.
5. Test on 375, 390, 430 and 1440 px, and test API 401/422/503/200 with real provider authorization. Verify SVG/PNG output from the same selected concept, revised asset history, and all QA gates.
6. Check empty brief, no provider key, provider timeout/error, invalid JSON, malicious SVG, missing xmlns, long input, and declined trademark clearance.
7. Publish only after `npm run check`, `npx playwright test`, actual Pages runtime test and production smoke checks succeed. Record production URL, deployment ID and commit SHA.

## QA evidence terminology
Code Completed → Build Passed → Runtime Verified → Functional Tested → Production Deployed.
Do not call this rollout fully accepted until all five levels have evidence.
