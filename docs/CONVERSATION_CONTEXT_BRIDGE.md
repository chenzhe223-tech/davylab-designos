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

## 6. Latest known verification checkpoint

Latest main commit at the checkpoint: `2f06aa1083b59de74562661613b8448a21aafb3a`.

- CI: [run 40104641077](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40104641077) — **success**.
- GitHub Pages preview: [run 40104641112](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40104641112) — **success**.
- Cloudflare production deploy: [run 40104641171](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40104641171) — deployment and production URL checks succeeded; deployed browser regression was still in progress at last inspection. Re-check final conclusion before claiming the whole workflow passed.
- Render engine: deployment `dep-dbebr7rrjlhs73f6hpqg` was **live** on commit `867fc5e2b546c924e1d9f3e0ec72083bd95e4f07`.
- Previous live API smoke [run 40101896777](https://github.com/chenzhe223-tech/davylab-designos/actions/runs/40101896777) was recorded as passing filtered capability API, raw fields, pagination, search and generation checks. Re-run smoke after backend code changes or if the service revision changes.
- Earlier workflow failures exposed two stale test assertions after the inventory API/UI changed; those assertions were corrected. Latest CI run above passed.
- Smoke workflow runs may show `skipped` when the trigger is tied to a successful Cloudflare workflow and the relevant deployment has not completed yet; a skipped run is not a passing smoke test.

## 7. Remaining work — continue from here

Priority order:
1. **Close the current Cloudflare workflow:** inspect run 40104641171 until the deployed desktop/mobile browser regression reaches a final result. Fix any actual failure and rerun.
2. **Re-verify the live API**: health, pinned version/readiness, catalog metadata, filtered/paginated raw records, official search, base design-system generation and a stack-specific generation. If the Render service is not at the expected source revision, trigger a rebuild and verify the exact deployment.
3. **Validate the capability explorer in the production browser**, including selecting a domain, searching raw fields, paging through results, empty/error states and mobile layout.
4. Improve candidate reasoning: industry/category mapping, active/deprecated filtering, explicit hard constraints, evidence-linked reasons, trade-offs and explainable scoring. Do not produce scores unless actually computed and validated.
5. Improve candidate comparison and full implementation-ready specification generation; ensure selected direction is the one used by all exports.
6. Check candidate schema against actual JSON exports and validate exports programmatically, not only via static string tests.
7. Add/verify accessibility and responsive acceptance: keyboard, focus, contrast, long strings, reduced motion, empty/error/loading states, mobile overflow.
8. Verify legacy profile/favorite ID compatibility.
9. Manually inspect the live production and preview sites; physical iPhone/iPad acceptance has not been confirmed and must not be claimed.
10. Update this file and `docs/DEVELOPMENT_HANDOFF.md` with actual current SHA, workflows, Render deployment, evidence and remaining gaps.

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
