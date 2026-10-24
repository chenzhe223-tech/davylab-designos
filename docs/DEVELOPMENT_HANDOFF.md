# DAVYLAB DesignOS — Cross-Chat Development Handoff

> Purpose: preserve the product decisions, engineering changes, verification evidence, and remaining work so another ChatGPT conversation or coding agent can continue without reconstructing this conversation.
>
> Last handoff update: 2026-10-24 (Asia/Singapore / UTC+8). Treat GitHub `main` and the latest workflow runs as the source of truth; re-check them before making further claims.

## 1. Project identity and live links

- Repository: https://github.com/chenzhe223-tech/davylab-designos
- Production website (Cloudflare Pages): https://davylab-designos.pages.dev/
- GitHub Pages preview: https://chenzhe223-tech.github.io/davylab-designos/
- CI workflow: https://github.com/chenzhe223-tech/davylab-designos/actions/workflows/ci.yml
- Cloudflare deployment workflow: https://github.com/chenzhe223-tech/davylab-designos/actions/workflows/deploy-cloudflare.yml
- GitHub Pages workflow: https://github.com/chenzhe223-tech/davylab-designos/actions/workflows/pages.yml

Product purpose: a design selection and instruction-generation workspace. People describe a project, browse/compare design profiles, choose a direction, and generate structured instructions for coding agents.

## 2. Working agreement for future sessions

1. Continue implementation; do not stop after giving a plan or a progress report when the next step can be performed safely.
2. Do not repeatedly ask for confirmation for routine, reversible engineering work. Ask only when a genuine blocker or an irreversible/product decision requires it.
3. Never claim a feature is implemented, tests pass, a deployment succeeded, or acceptance is complete unless supported by code, workflow output, or live verification.
4. Separate these states in reports: implemented, automated tests passed, deployed, production smoke-tested, and manually accepted on real devices.
5. Keep existing behavior and local user data compatible. Prefer additive, reversible migrations and stable IDs.
6. Never fabricate data, sources, profile evidence, test results, deployment URLs, or credentials. Never ask the user to paste API tokens into chat.
7. After changes, run the relevant validation/test/build and browser checks, inspect workflow results, and update this handoff with the latest commit, evidence, and unresolved issues.
8. Use Chinese for progress and handoff reports unless the user asks otherwise.

## 3. Product decisions and data architecture

### Canonical source of truth

- `profiles/index.json` is the single canonical source for design profiles.
- `scripts/build.mjs` reads this registry, resolves inherited tokens, and generates runtime profile data in the built `dist/index.html`.
- Runtime search taxonomy is derived from profile tags, aliases, principles, and mobile-fit metadata rather than maintained as a second independent list.
- Deprecated profiles must not be exposed as active runtime choices.
- Preserve legacy presentation IDs so existing favorites/selection references do not silently break.

### Known profile compatibility mapping

- `balanced-saas → davylab-default`
- `saas-product → davylab-saas`
- `analytics-dashboard → davylab-dashboard`
- `warm-editorial → davylab-warm-editorial`
- `dashboard-studio → dashboard-studio-live` (read-only audit profile)

The profile registry currently documents Balanced SaaS, SaaS Product, Analytics Dashboard, Warm Editorial, and read-only Dashboard Studio audit. Always confirm the latest `profiles/index.json` before editing.

### Rule governance

Evidence/status values include `draft`, `reviewed`, `validated`, and `deprecated`. Validation checks status values, required source/evidence, presentation ID format, and uniqueness. Do not mark rules `validated` merely because the schema is valid; validation must reflect actual supporting evidence and verification.

### UX/feature scope

- Profile previews with desktop/mobile viewport switching.
- Search and category/device filters.
- Selection, browser-local favorites, and side-by-side comparison (up to four profiles).
- Project brief with optional project type, goal, target user, device, tech stack, repository URL, and style preference.
- Agent instruction generation for Codex, Claude Code, Cursor, GitHub Copilot, Gemini CLI, WorkBuddy, and a generic coding agent.
- Copy and Markdown download for generated instructions.
- JSON export.
- Design direction: clear, warm, premium, restrained, easy to scan; prioritize information hierarchy and usable workflows over decorative effects.

## 4. Implemented engineering work recorded in this conversation

The following work was committed to the repository before this handoff; re-check `main` and commit history for the newest state.

- Expanded profile metadata and introduced Warm Editorial.
- Reworked `scripts/build.mjs` to generate runtime profile data from `profiles/index.json`, resolve inherited tokens, omit deprecated profiles, and validate the injection point.
- Derived runtime search taxonomy from the profile registry.
- Added rule governance validation for evidence status, sources, presentation IDs, and ID uniqueness.
- Added recommendation regression cases covering SaaS, analytics dashboards, mobile workspaces, warm editorial, content/idea management, admin, audit protection, ambiguous/short/unmatched queries.
- Added profile consistency checks to compare built runtime profiles against canonical registry data and test legacy IDs/inheritance/read-only protection.
- Updated preview tests to use built `dist/index.html`.
- Added Playwright configuration and `tests/e2e/designos.spec.mjs` covering desktop search/recommendation/instruction generation, mobile viewport and overflow checks, and JSON export parsing.
- Added Playwright/browser checks to CI, Cloudflare deployment, and GitHub Pages deployment workflows.
- Added README documentation for the canonical source, ID compatibility, governance states, and test commands.

## 5. Verification evidence and known workflow issue

### App code commit previously verified

- Application commit: `240e257b33e781f320d6f6fb020c1a99d776fed0`
- CI run: https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40077856468
- Cloudflare deployment run: https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40077856467

The previous conversation record says the CI and Cloudflare workflow for `240e257b` completed successfully, including validation/tests/build, Playwright E2E, production URL checks, and post-deployment browser regression. These are historical results for that commit, not proof that the latest commit is green.

### GitHub Pages preview workflow issue

- A Pages workflow run failed at deployed browser acceptance because the deploy job did not check out test files (`Error: No tests found`).
- A workflow-only fix was committed, adding checkout before running the deployed preview acceptance tests.
- Latest commit known at the last checkpoint: `4ad04e82cb1861b034d9fb9fc44deadab1bca184`, message: “Checkout browser test files before running deployed preview acceptance”.
- Latest action runs seen at the last checkpoint:
  - CI: https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40077978393
  - Cloudflare deployment: https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40077978267
  - GitHub Pages deployment: https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40077978234
- These runs were still in progress/pending at the last checkpoint. **First task in the next session: inspect the current latest `main` SHA and all three runs; do not assume these runs are still pending or successful.** Inspect failed job logs and fix any real regression, then re-run until green where feasible.

## 6. Outstanding work / acceptance gaps

1. Confirm the latest CI, Cloudflare deploy, and GitHub Pages deploy runs on current `main` are successful.
2. Verify the current production site and deployed preview are serving the expected build; run deployed browser acceptance and check console/page errors.
3. Continue auditing recommendation semantics: ensure hard constraints genuinely exclude incompatible options and soft preferences affect ranking transparently. Avoid tests that only encode current behavior without validating the intended product logic.
4. Inspect all profiles for accurate evidence metadata and honest governance status. Schema validity alone is not evidence of design-rule validity.
5. Review empty/no-match/error/loading states, keyboard navigation, labels/contrast, focus states, and responsive comparison layout.
6. Automated mobile viewport checks are not real-device acceptance. No confirmed hands-on iPhone/iPad test was completed in the recorded work; label this clearly until actually done.
7. Check compatibility of old favorites and selected-profile state with legacy IDs. Do not claim full migration acceptance until verified with representative old stored data.
8. If any further changes are made, update this document with the actual current commit and the new test/deployment evidence.

## 7. Recommended next-session runbook

1. Read the current `main` commit and this file.
2. Inspect the newest CI, Cloudflare Pages, and GitHub Pages workflow runs, including logs for failures.
3. Fetch the current `profiles/index.json`, `scripts/build.mjs`, recommendation implementation, tests, and workflow files before changing them.
4. Fix the smallest root cause, commit the fix, and wait for workflow evidence.
5. Run/verify:
   - rule/profile validation
   - unit/regression tests
   - production build
   - Playwright desktop and mobile viewport E2E
   - deployed URL smoke test and deployed browser regression
   - JSON export parsing and legacy-ID compatibility
6. Inspect live production and preview behavior; report exactly what was and was not verified.
7. Update this file with current commit SHA, workflow links/results, changes, and remaining risks.

## 8. Full rebuild continuation (2026-10-24)

The user has now authorized a full product rebuild: reposition DesignOS from a UI profile selector into a product-category-agnostic AI product design decision and preview platform. Dashboard must not be the default category or define the product experience.

- New audit ledger: [docs/REBUILD_AUDIT.md](REBUILD_AUDIT.md). Read this before further implementation; it records verified engine facts, the target architecture, the acceptance status and the next sequence.
- Homepage first tranche commit: `bae04a069d1e3fb98eff574033cca81a589959ae`. It changes the hero to product-first language, changes the step sequence to product brief → design directions → preview/compare → design spec, updates the first example to an AI travel app, adds broader product-category shortcuts and broadens the project-type options.
- Audit ledger commit: `f872ad63d491cb3e3f3ebf7de7ef7f1edefa35ea`.
- Important verified gap: `engine.lock.json` pins UI UX Pro Max Skill v2.15.0 at upstream commit `d14efff8ed1faa4187f004f79926f428c8074ec7`; `scripts/designos.mjs` has a real pinned CLI setup/search/generate path, and CI installs it for a real generation smoke test. However, `.agents/skills/ui-ux-pro-max` is not present on repository main (path lookup returned 404), and the static browser application currently relies on its local profile matcher rather than directly invoking the full engine. Do not claim the browser UI already uses all upstream capabilities.
- Added `scripts/capability-inventory.py`, `npm run inventory:skill`, and a CI step after pinned engine setup. It reads actual upstream CSVs via the upstream Python configuration, calculates record counts and SHA-256 hashes, and records style statuses; its new workflow result must still be checked before claiming it passes.
- Added `schemas/design-candidate.schema.json` and `tests/design-candidate-schema.test.mjs` to establish a provenance-aware candidate contract.
- Added a product-first E2E regression in `tests/e2e/designos.spec.mjs`.
- Latest implementation commits include `04bf39bd82e2da2ec06ba41dd1d70e71edd12761`, `c53c76a5d345b6e135e24065d7a93ee80383857e`, `9167eee2b2b042f8a31de6450692034c22097787`, and `feddd8fdd0e6b201414f1a2b57109df5cbc5dd6a`; check current main SHA and workflows before proceeding.
- Added `engine-api/server.py` plus Docker/Render configuration and created Render service `davylab-designos-engine` (Singapore, free plan). The first build successfully installed the pinned Skill and confirmed `ready: true`, but failed in the inventory step because the script checked `scripts/scripts/search.py`. Fixed this in `a8da3c6b245493a0f5619f7f72c46aa4d15149ab`; next automatic Render deployment still needs verification.
- The frontend is not yet wired to the bridge. Do not claim the live UI uses the upstream engine until the service health/status and browser integration are verified.
- Added `tests/engine-api-contract.test.mjs` to check API routes and safety limits.
- Next: check latest CI, Cloudflare and GitHub Pages runs; inspect Render deployment/build logs after the inventory fix; run the real capability inventory and inspect its output; then connect product-first UI to the bridge, normalize the real engine output into multiple candidates, and validate the full journey. Never bundle secrets into the static client.

## 9. Live Skill integration tranche (2026-10-24)

The rebuild is actively progressing beyond the product-first homepage:

- `engine-api/server.py` exposes `/health`, `/api/status`, `/api/capabilities`, `/api/search`, and `/api/generate`, invoking the pinned CLI server-side. It bounds request bodies, rate-limits POSTs, restricts CORS origins and avoids logging prompt bodies.
- `engine-api/Dockerfile` packages the pinned upstream engine and generated inventory. The first Render build failed: logs show `npm run engine:setup` printed `ready: true`, but the following inventory step said the source was missing. Dockerfile now explicitly verifies the installed search script and inventory file. Render deploy `dep-dbebfv9srm7s73f5gau0` reached `live`. The live API smoke run [40100196664](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40100196664) passed `/health`, `/api/status`, `/api/capabilities`, real upstream search, base design-system generation, and React stack-specific generation.
- Render service created: `davylab-designos-engine`, ID `srv-dbe8obss728c73bdno40`, URL `https://davylab-designos-engine.onrender.com`. Its first deployment failed. Do not treat the API as live until a fresh deploy is successful and health/status/search/generate endpoints are verified.
- Homepage now requests official upstream search for style, color, typography and UX when a user submits a product brief. API failure is visibly labeled; the UI must not claim local profile matches are live Skill output.
- Homepage now exposes an explicit real-engine candidate generation action and JSON export. Candidate output is labeled as pending review, not a completed implementation.
- CI now preserves `generated/skill-capability-inventory.json` as an artifact for 30 days so the actual catalog counts can be audited.
- CI run [40100135868](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40100135868) on commit `dbf1fb2c` passed unit tests, desktop/mobile Playwright, real upstream inventory generation, real CLI design-system generation, and output validation. Live API smoke run [40100196664](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40100196664) passed the deployed API health/status/capabilities/search/generate checks, including React-specific guidance.
- Current source of truth for remaining tasks: [docs/REBUILD_AUDIT.md](REBUILD_AUDIT.md). The product still needs real multi-direction generation, normalized evidence-aware candidate comparison, preview renderer integration, and complete JSON/Markdown design-spec delivery.

Next sequence:
1. Verify the newest GitHub CI run and repair any actual test failure.
2. Trigger/verify a new Render build after the Dockerfile correction. If auto-deploy does not pick up the pushed commit, use Render's deployment action only after confirming no deploy is queued.
3. Verify `/health`, `/api/status`, `/api/capabilities`, a real `/api/search` request, and a real `/api/generate` request.
4. Check the generated inventory artifact and record real upstream counts in the audit ledger.
5. Continue the product decision flow: candidate schema → multiple grounded candidates → meaningful preview/compare → complete spec export → browser acceptance.
6. Update this handoff again with exact current commit SHA, workflow URLs, Render deployment ID/status and API smoke-test results.

## 10. Useful file map

- `docs/REBUILD_AUDIT.md` — full-rebuild evidence ledger and acceptance gaps
- `schemas/design-candidate.schema.json` — normalized candidate schema
- `scripts/capability-inventory.py` — actual upstream dataset inventory generator
- `profiles/index.json` — canonical design profile registry
- `scripts/build.mjs` — build-time profile generation/injection
- `scripts/validate-rules.mjs` — profile/rule governance validation
- `tests/recommendation.test.mjs` — recommendation regression matrix
- `tests/profile-consistency.test.mjs` — registry/runtime consistency and compatibility
- `tests/preview.test.mjs` — preview behavior tests
- `tests/build-output.test.mjs` — built artifact checks
- `tests/e2e/designos.spec.mjs` — Playwright browser tests
- `playwright.config.mjs` — Playwright configuration
- `.github/workflows/ci.yml` — CI quality gate
- `.github/workflows/deploy-cloudflare.yml` — Cloudflare Pages deploy and production acceptance
- `.github/workflows/pages.yml` — GitHub Pages preview deploy and acceptance

---

## Session continuation prompt

When this file is supplied to a new ChatGPT conversation or coding agent, continue as the DAVYLAB DesignOS product/engineering lead. Start by checking the latest `main` commit and workflow statuses, then continue implementation and verification from the outstanding work above. Do not merely summarize this file; perform the next safe engineering actions and keep the handoff current.
