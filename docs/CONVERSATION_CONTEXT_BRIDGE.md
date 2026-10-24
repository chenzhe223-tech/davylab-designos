# DAVYLAB DesignOS — Conversation Context Bridge

> This is the compact cross-window memory for ChatGPT, WorkBuddy, Codex, or another coding agent. Read this first, then read `docs/DEVELOPMENT_HANDOFF.md` and `docs/REBUILD_AUDIT.md`. The repository and latest workflow runs are the source of truth; re-check live state before claiming anything is complete.
>
> Last verified checkpoint: 2026-10-24, Singapore time (UTC+8).

## 1. Project and links

- Repository: https://github.com/chenzhe223-tech/davylab-designos
- Production: https://davylab-designos.pages.dev/
- GitHub Pages preview: https://chenzhe223-tech.github.io/davylab-designos/
- Live Skill API: https://davylab-designos-engine.onrender.com
- Full development handoff: https://github.com/chenzhe223-tech/davylab-designos/blob/main/docs/DEVELOPMENT_HANDOFF.md
- Rebuild/acceptance ledger: https://github.com/chenzhe223-tech/davylab-designos/blob/main/docs/REBUILD_AUDIT.md
- This context bridge: https://github.com/chenzhe223-tech/davylab-designos/blob/main/docs/CONVERSATION_CONTEXT_BRIDGE.md

## 2. User's standing instructions

- Continue work without pausing for routine confirmations. Ask the user only for a real blocker, access/authorization that cannot be bypassed, or an irreversible decision that genuinely requires them.
- Do not merely provide plans. Take the next safe engineering action, test it, and continue until delivered or genuinely blocked.
- Keep Chinese as the default communication language.
- Do not fabricate data, citations, upstream capabilities, test results, deployment status, or device acceptance.
- Explicitly separate: implemented, automated tests passed, deployed, production-smoke-tested, and manually accepted on real devices.
- Never request API tokens or credentials in chat; keep secrets server-side.
- After each meaningful tranche, update this file and the main development handoff so a new chat can continue without relying on the old conversation.

## 3. Product vision — do not regress to a dashboard-only tool

**DAVYLAB DesignOS is an AI Product Design Decision & Preview Platform for all product categories.** It must not be bound to the user's separate Dashboard project, and Dashboard must not be the default or defining product category.

Product promise: a person describes what they want to build; DesignOS uses real UI UX Pro Max Skill knowledge to search and reason about design options, generate meaningfully different candidate directions, let the user inspect/compare/refine them, and export grounded design instructions for a coding agent.

Design philosophy: premium, restrained, clear hierarchy, warm but technological, readable and practical. Avoid decorative clutter, fake AI capabilities, static number badges pretending to be working features, and generic dashboard-first UX.

Core flow:
1. Describe the product naturally; optional audience, platform, constraints and stack.
2. Search actual upstream Skill data and generate multiple grounded directions.
3. Preview desktop/mobile layouts, compare trade-offs, choose a direction and refine with feedback.
4. Export provenance-aware JSON, a readable design specification and a stack-aware coding-agent brief.
5. State clearly what is a preview, what is a candidate, what is implemented, and what remains unverified.

## 4. Upstream Skill and verified data

Pinned upstream source: `nextlevelbuilder/ui-ux-pro-max-skill`, Skill v2.15.0, commit `d14efff8ed1faa4187f004f79926f428c8074ec7`, CLI 2.5.0. The engine must be installed and called through the server-side adapter; do not pretend the static HTML alone executes the Python CLI.

Inventory counts from the pinned upstream CSV data:
- 35 configured domains; 4,319 records total; inventory reported no missing configured domains.
- UI styles: 88 rows (50 active, 9 deprecated, 29 supplemental), not the informal 79 count.
- Industry/product palettes: 192.
- Typography pairings: 74.
- Chart recommendations: 25.
- UX guidelines: 119.
- Industry reasoning rules: 192.
- Tech-stack guideline datasets: 22.
- Google Fonts catalog: 1,934 (these are font records, not pairings).
- Other data (landing patterns, icons, motion, React performance, app interface): 232.
Counts and statuses must come from the source inventory. If the upstream file has no status field, report status as unspecified; never assume every row is active.

## 5. Implemented capability tranches

The current codebase has been extended beyond the original five-profile selector:
- Canonical local profile registry remains `profiles/index.json`, with legacy IDs preserved.
- Real pinned Skill CLI setup, search, design-system generation and output validation.
- Server-side API bridge in `engine-api/server.py` with `/health`, `/api/status`, `/api/capabilities`, `/api/search`, `/api/generate`; request size bounds, rate limiting, explicit CORS origin allowlist and no prompt-body logging.
- Render service `davylab-designos-engine`, ID `srv-dbe8obss728c73bdno40`, URL above.
- Real source-backed capability explorer in the frontend: expandable catalogue, domains/counts from inventory, search across raw fields, status/source row details, raw record inspection and pagination.
- Up to three Skill-derived candidate directions; candidate preview with token-driven desktop/mobile layout; direction selection; feedback-driven regeneration.
- Candidate JSON export uses a versioned schema, preserves the raw upstream payload, and keeps unmeasured hard-constraint eligibility/preference scores null rather than fabricating scores.
- Markdown design brief and stack-aware coding-agent handoff export, including responsive/accessibility/component-state checks, provenance, assumptions, risks and acceptance checklist.
- Agent prompt export is not agent execution. Candidate preview is not a fully implemented application. Human review remains necessary.
- Automated tests include unit/contract checks, profile/rule validation, desktop/mobile Playwright, live inventory generation, real CLI generation and production API smoke workflows.

Important files:
- `index.html`: frontend and live candidate/catalog interactions
- `engine-api/server.py`: live API bridge
- `engine-api/Dockerfile`: pinned server image
- `scripts/capability-inventory.py`: upstream data inventory, including raw fields
- `scripts/designos.mjs`: pinned CLI adapter
- `schemas/design-candidate.schema.json`: candidate contract
- `tests/preview.test.mjs`, `tests/engine-api-contract.test.mjs`, `tests/design-candidate-schema.test.mjs`
- `.github/workflows/ci.yml`, `.github/workflows/deploy-cloudflare.yml`, `.github/workflows/pages.yml`, `.github/workflows/engine-api-smoke.yml`

## 6. Latest verified checkpoint — 2026-10-24 23:22 SGT (15:22 UTC)

This checkpoint supersedes the older status notes in this file. The code, workflow and Render revisions below were verified through GitHub Actions and Render records. This documentation synchronization will itself create a follow-up commit; query current HEAD again in the next session.

### Current revisions and deployments

- Main before this documentation sync: 96e13b9f5ec0da98c2fe6a78fd76f2e0f09c30e7 (strict live CORS smoke checks).
- Engine API source fix: 2710bce8e46aef39aeac03e5f7d9710c0c810885 — consolidated safe request logging so a disconnected client/log pipe does not create another handler traceback.
- CORS fix: 84732ed26e2003278e87df7b179ff7f6577b7940 — reflect only the exact allowed origin once; no wildcard.
- Cloudflare production deployment of the current frontend source: [workflow run 40106461152](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40106461152), commit 2710bce8e46aef39aeac03e5f7d9710c0c810885 — **success**, including production URL verification and deployed desktop/mobile Playwright regression.
- DesignOS CI: [workflow run 40106475350](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40106475350), commit 96e13b9f5ec0da98c2fe6a78fd76f2e0f09c30e7 — **success**.
- Live Engine API Smoke Test: [workflow run 40106551875](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40106551875), commit 96e13b9f5ec0da98c2fe6a78fd76f2e0f09c30e7 — **success**.
- Render live deployment: dep-dbecpr8473hc73ct3610, commit 96e13b9f5ec0da98c2fe6a78fd76f2e0f09c30e7, state **live**, finished 2026-10-24 15:22:06 UTC.

### Verified behavior

- CI passed repository rule validation, unit/contract tests, desktop/mobile browser E2E, build, pinned upstream Skill installation, real dataset inventory, CLI generation and output contract validation.
- The Cloudflare workflow's post-deploy browser regression is **green**. It had previously failed at the real Skill search UI state (“引擎暂不可用”); after the CORS and safe logging fixes, the same production regression completed successfully.
- The engine smoke workflow verifies /health, readiness at UI UX Pro Max **2.15.0**, source-backed capability inventory with no missing configured domains, filtered/paginated raw records, live /api/search, real /api/generate, and React stack-specific guidance.
- CORS smoke verification passed for https://davylab-designos.pages.dev and an approved project-owned Pages preview origin, with exactly one matching Access-Control-Allow-Origin header. https://untrusted.example is rejected with HTTP 403 and no CORS permission.
- Render logs from production browser acceptance show successful POST /api/search (HTTP 200), POST /api/generate (HTTP 200), and GET /api/capabilities (HTTP 200). Approved-origin preflights returned 204.
- The live inventory's measured source counts are 35 configured domains and 4,319 total records; UI styles are 88 rows (50 active, 9 deprecated, 29 supplemental), not 79 active styles. Other verified counts: palettes 192, typography pairings 74, chart recommendations 25, UX guidelines 119, industry reasoning rules 192, and tech-stack datasets 22.

### Status that must remain distinct

- **Implemented and automated tests passed:** pinned real engine integration, source-backed capability explorer, candidate generation, preview/comparison and export workflow covered by current automated gates.
- **Deployed and production browser-tested:** Cloudflare production source for commit 2710bce8e46aef39aeac03e5f7d9710c0c810885 passed the workflow's post-deploy browser regression.
- **Render engine live:** commit 96e13b9f5ec0da98c2fe6a78fd76f2e0f09c30e7.
- **Not manually accepted:** no independent physical iPhone/iPad or human visual acceptance was performed in this session. Do not claim such device acceptance.
- A design-system candidate and locally rendered preview are not a full implementation of the user's target application. Agent instructions/exports do not execute an external coding agent.

## 7. Remaining work — continue from verified production state

1. After this documentation sync, check the new latest main SHA, CI, Cloudflare production browser regression, live engine smoke and Render deployment. Documentation-only changes should not be assumed deployed until workflows prove it.
2. Perform additional targeted quality checks for requirement-to-candidate mapping across different product categories (SaaS, mobile, e-commerce, content, AI tool, dashboard), active/deprecated handling, meaningful differences between multiple candidates, and design rationale/trade-offs.
3. Validate that the selected direction remains consistent through comparison, candidate JSON, design-spec and Agent instruction exports; extend schema-backed tests where needed.
4. Review loading, timeout, error and rate-limit states, keyboard/focus behavior, viewport overflow and accessibility. Physical iPhone/iPad validation remains pending.
5. Keep the versioned context bridge, development handoff and delivery checkpoint synchronized with evidence-backed status. Do not mark the whole product “finally accepted” until the remaining quality and human/device acceptance gates are completed.

## 8. Session startup protocol

When continuing in a different ChatGPT window:
1. Read this file.
2. Read `docs/DEVELOPMENT_HANDOFF.md` and `docs/REBUILD_AUDIT.md`.
3. Query current GitHub main commit and latest CI/Cloudflare/Pages/API-smoke workflows; query Render's latest deployment.
4. Inspect live status before repeating any old status claim.
5. Perform the next priority item; don't just summarize or ask the user what to do next.
6. When the user says “继续”, continue from the latest unresolved priority without asking routine confirmation.

## 9. Copy/paste continuation command

> 你现在是 DAVYLAB DesignOS 的长期产品负责人、UI/UX 设计总监、AI 架构师和全栈工程负责人。先读取仓库里的 `docs/CONVERSATION_CONTEXT_BRIDGE.md`、`docs/DEVELOPMENT_HANDOFF.md`、`docs/REBUILD_AUDIT.md`，再检查 GitHub main 最新 commit、所有相关 Actions 状态和 Render 最新部署。严格遵守仓库里记录的产品定位和用户指令：平台面向所有产品类别，不与 Dashboard 项目绑定；真实调用 UI UX Pro Max Skill；不伪造数据/评分/验收。不要只给计划，不要擅自暂停或反复请示；持续执行当前最高优先级任务，修复真实问题，测试、部署、验证，并将实际结果和未完成项写回这三份上下文文件。只有遇到必须由我授权或提供的真实阻塞时才询问我。


## Latest verified checkpoint — 2026-10-24 23:40 SGT (15:40 UTC)

This checkpoint supersedes older pending-deployment or transient-failure notes above. Latest repository source of truth at the time of this update: `main` commit `83a9488a298cc387e418fe89a16d3090422671ab`.

### Latest successful evidence

- **DesignOS CI passed** on the current source commit: [run 40107578430](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40107578430). Includes Python unit tests for proxy-aware client identity, JavaScript test suite, browser E2E, build, pinned Skill installation, real dataset inventory and generated-output checks.
- **Cloudflare production deployment passed** on the current source commit: [run 40107578397](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40107578397).
- **Live Engine API smoke passed** on the current source commit: [run 40107678857](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40107678857). Verified exact CORS allow-origin headers, rejected untrusted origins, confirmed Skill v2.15.0 and data inventory, source-backed search, travel-category generation, and non-empty active React stack guidance.
- **GitHub Pages deployed browser acceptance passed on retry attempt 2** for the current source commit: [run 40107578422](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40107578422). First attempt started during the previous Render service version / rate-limit incident and failed with “引擎暂不可用”; the rerun after the new Render deployment completed successfully.
- **Render engine deployment is live** at commit `83a9488a298cc387e418fe89a16d3090422671ab`, deployment `dep-dbed0ea9lscs73aokph0`, completed 2026-10-24 15:35:57 UTC.
- Production Render logs during the latest GitHub Pages run recorded successful `POST /api/search` (HTTP 200), `POST /api/generate` (HTTP 200), and `GET /api/capabilities` (HTTP 200); browser preflights returned 204. No 429 occurred in that accepted rerun.
- The stricter travel-generation assertion returned product type/category/palette source all as `Travel/Tourism Agency`.
- The React stack query returned 3 real records; the first was an active `Use useReducer for complex state` rule. Empty stack guidance no longer qualifies as compatibility.
- The real upstream inventory remains 35 configured domains, 4,319 records and no missing configured domains: styles 88 rows (50 active, 9 deprecated, 29 supplemental), palettes 192, typography pairings 74, chart recommendations 25, UX guidelines 119, industry reasoning rules 192, and 22 stack datasets.
- Rate limiting now keys traffic by a validated Cloudflare client IP only when the socket peer is the trusted local proxy; direct peers do not get to spoof forwarding headers. It retains a per-client limit of 60 requests/minute and returns `Retry-After` for 429 responses. New tests cover loopback proxy, forged/invalid headers and IPv6 normalization.

### Acceptance boundary

- Automated CI, live engine smoke, Cloudflare production deployment and production-browser regressions are green for this code revision.
- **Physical iPhone/iPad validation and human-led visual acceptance remain outstanding.** Do not claim either was performed.
- Candidate previews are still previews of generated design systems, not complete generated user applications. Exporting an Agent brief does not prove that an external coding agent executed it.
- Continue with cross-category quality evaluation (SaaS, mobile, e-commerce, content, AI product and dashboard), candidate comparison/decision-rationale quality, export consistency, accessibility and viewport edge cases before final product-wide acceptance.

