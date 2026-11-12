# DAVYLAB Design Agent 4.0 · P0 implementation contract

## Product intent
One brand project, from free-text requirement to editable strategy → 3 differentiated directions → real SVG exploration → chosen direction → dual-track handoff → archive.

### Routes
- /design-agent/: new P0 workspace.
- /logo-studio/: preserved production/refinement workbench.
- /classic/, /resources/, /: untouched DesignOS compatibility.
- POST /api/brand/plan: real DeepSeek JSON brand strategy and exactly 3 distinct directions.
- POST /api/logo/generate: existing server-side DeepSeek/OpenAI SVG generation; workspace uses DeepSeek by default.

### Provenance rules
- plan.source=live-deepseek only after a completed upstream API call and validated JSON response.
- sample source=example-only; this is a labeled showcase, never a substitute for live AI.
- No SVG logo created: initial card shows typographic exploration and CSS-based UI *simulation*, explicitly marked non-final.
- SVG received from generation endpoint: marked as real model SVG, with same brand scene still presented as an illustration rather than approved final design.
- Missing API key, 401, upstream failure, malformed/duplicate directions: visible error, no fake results.

### P0 data model
Project: id, brief, strategy, directions[3], selected, source, model, updated, vectors.
Strategy: brand_name, tagline, positioning, audience, personality, core_value, brand_story, usage, keywords[], assumptions[].
Direction: id A/B/C, name, positioning, rationale, symbol, typography, logo_type, headline, palette[], optional validated svg.
LocalStorage holds at most 25 projects in the current browser; exports provide JSON backup. No API key or access token is stored. This is **not multi-device sync**.

### Flow
1. Free-text brand brief (8-1600 chars).
2. POST /api/brand/plan with DeepSeek provider key via session-only X-Provider-Key (or a server key behind access token).
3. User edits strategy and confirms; editing after SVG generation invalidates stale vector output.
4. Three concept cards, each with a distinct rationale, safe palette, simulated responsive website and typography.
5. Optional POST /api/logo/generate, same user-supplied key, to get 3 separate real SVG concepts.
6. Select direction. Dual-track P0 handoff:
   - Native: same-origin localStorage handoff to preserved Logo Studio; SVG imported when available.
   - External: target-specific task brief copied for ChatGPT/Claude/Gemini/WorkBuddy/GLM/Kimi/豆包/通义千问. Copying is **not** execution.
7. Local project archive and JSON export.

### Credential / access model
- Provider URL is fixed server-side; no user-supplied arbitrary proxy URLs.
- BYOK is preferred over platform key so personal requests do not consume platform quota.
- No platform-key spending without LOGO_STUDIO_ACCESS_TOKEN.
- Origin and sec-fetch-site checks, body length caps, controlled model allowlist.
- no-store response headers and no raw upstream errors that expose keys.
- Production tokens must be configured only through Cloudflare secret controls, not GitHub.

### Acceptance: P0
- Code Completed: new route/API/bridge/tests committed.
- Build Passed: npm run check, includes the route copied to dist.
- Runtime Verified: tested with Pages Functions runtime, not only a static dev server.
- Functional Tested: desktop 1440 and mobile 375/390/430; test genuine mock API contract + explicitly labeled sample; genuine paid-provider integration requires an authorized credential and a separate evidence run.
- Production Deployed: after main deployment URL verification, GET /api/brand/plan, and real three-way handoff confirmation.

### P1-P3 roadmap
P1: native image models via Provider adapters, model-level capability tests, vector/raster parity, visual identity asset pack, async task progress, quota controls.
P2: signed GitHub Webhook and manifest contract, idempotent task intake, agent-specific execution authorization, safe file download into object storage, unified task states and QA.
P3: PDCA tracking and revisions, user sign-off, true trademark/license gate, RBAC, optional D1/R2 multi-device project storage, private-by-default Logo gallery, commercial billing with explicit approval.

Do not show completion, deployment or production-ready claims without corresponding records.