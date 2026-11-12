# DAVYLAB Logo Studio · P0–P3 DeepSeek Production Release

Updated: 2026-11-12. This is a **code and QA contract**, not a claim that any paid model call or trademark search has succeeded.

## P0 — True model connection
- Same existing Cloudflare Pages site: \`/logo-studio/\`. The endpoint is \`POST /api/logo/generate\`.
- \`provider=deepseek\` targets \`https://api.deepseek.com/chat/completions\`, with \`deepseek-flash\` default and \`deepseek-v4-pro\` available only through an explicit user selection.
- OpenAI remains opt-in compatible; no model inference occurs on initial page load.
- Two credential modes: temporary BYOK (memory-only request header) and Cloudflare Secret \`DEEPSEEK_API_KEY\`. The latter is disabled unless \`LOGO_STUDIO_ACCESS_TOKEN\` is configured. Never commit keys to public repository.
- Provider parameters and model names are strictly allowlisted. Same-origin, JSON length, short prompt, access token, provider error and malformed SVG checks fail closed. No secrets in error responses.

## P1 — Brand planning and bespoke editable SVGs
- One-sentence mode triggers *real* generation; legacy deterministic SVG preview stays explicitly marked offline/non-AI.
- The backend model returns \`strategy\` and three differentiated \`concepts\` using the instruction standard in \`.agents/skills/davylab-logo-production/SKILL.md\`.
- Directions: wordmark, abstract symbol, combination mark unless the user specifies otherwise.
- Every concept is a standalone SVG with editable shapes and text, and is validated against disallowed active content, raster embeds, URLs and copied geometry.

## P2 — Workbench and visual parity
- Editor preserves all SVG source paths and text. Quick controls modify brand name, selected shape color and text size; full SVG edit and one-concept AI refinement remain available.
- Brand strategy panel shows rationale, positioning, audience and typography, not invented competitor or trademark research.
- The comparison cards, stage animation, 24/32px previews, light/dark mockups and downloaded PNG rasterize **the exact selected SVG**. CSS Motion Lab presets are visual-only; the export explicitly says no video was created.
- Mobile first: retain existing 375/390/430 responsive layouts, reduced-motion controls and independent dark mode.

## P3 — Evidence-based QA, archive and one-click ZIP
- Existing seven-part 100-point manual score and five mandatory legal/visual gates are retained. A changed asset resets the previous attestations.
- ZIP ships: canonical SVG/PNG, all candidate SVG/PNG files, light/dark/24/32px renders, brand strategy, brand guide, Agent brief, motion settings, QA report and manifest with SHA256 of every preceding asset.
- No automatic trademark clearance, brand copyright warranty or paid image engine; \`productionReady=false\` until independent checks.
- Local drafts/version archive remains browser-local; no cloud sync is claimed.

## Production setup (once)
1. Keep current Cloudflare Pages project \`davylab-designos\`. Deployment is already configured using GitHub Actions and Wrangler to include the \`functions/\` folder.
2. Preferred personal mode: open Logo Studio, select DeepSeek, paste a **temporary** DeepSeek API Key, then click **一句话 AI 生成 Logo**. It is not written to GitHub or browser localStorage. Standard DeepSeek API billing may apply.
3. Admin mode (optional): Cloudflare Dashboard → Workers & Pages → davylab-designos → Settings → Variables and Secrets. Add \`DEEPSEEK_API_KEY\` and \`LOGO_STUDIO_ACCESS_TOKEN\` as **encrypted Secrets**; deploy again. Admin access token is separate from DeepSeek Key.
4. Never put any key in Cloudflare public vars, static HTML, GitHub repo, screenshot, console logs or export ZIP.
5. Complete a live inference test with an approved budget and real authorization, confirm three different SVG concepts, edit source, download ZIP, extract and independently compare SHA256, then review visual typography and 24/32px legibility.
6. Review live URLs and GitHub Actions tests. Do not call this production-verified if the API still returns 503 because no provider credential is installed.

## Evidence ladder
- **Code Completed**: real GitHub commits and files.
- **Build Passed**: GitHub Actions \`npm run check\`.
- **Runtime Verified**: Cloudflare deployment ID matches a release commit, static route and Functions route respond.
- **Functional Tested**: browser E2E plus real-provider test (separately reported).
- **Production Deployed**: live site responds and new app controls/endpoint verified; **model provisioning** remains a distinct gate.

## Known limitations
- LLM-generated SVG can still be mediocre; creative quality requires human art direction and iteration.
- Chinese wordmarks may render with platform-specific fallback fonts; typography and licensing must be reviewed before commercial use.
- A vector can be readable in 1200px preview yet fail at 24px; check the actual preview.
- Real image diffusion and advanced mascot vectorization are an optional later plugin, not silently represented as part of P0–P3.
