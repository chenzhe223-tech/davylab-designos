# DAVYLAB DesignOS

**Design with intent. Build with evidence.**

DAVYLAB DesignOS is a visual design selection workspace. Users can preview rule-based UI examples, compare design profiles, describe project goals, and generate structured execution instructions for major AI coding agents.

## DesignOS 3.0 — visual-first studio (current front door)

The homepage is now a purpose-built design production workspace instead of an exposed collection of research, rules, and back-office controls.

- **/**: curated visual directions, six clear destinations, live design canvas, local projects, components, Skill references, archives and preferences.
- **/classic/**: preserved original, evidence-aware DesignOS research and Agent-brief workflow. Existing tests continue to validate this experience independently.
- **/resources/**: protected Skill Resource Hub with public and private catalog handling; access controls remain unchanged.

The new workspace can create and save local projects, choose canonical design profiles, preview rule-driven desktop/phone UI, adjust tokens, associate **public Skill references** and export JSON, CSS tokens, and a truthful Agent implementation brief. Version snapshots and portable backup are included. No new cloud sync is implied, no external Skill is invoked by adding its reference, and preview screens are illustrative, not implemented target applications.

### 3.0 visual / product boundaries

Design language: warm paper, quiet greens, deep ink, editorial typography, no fake AI hero dashboards. Designed for mobile widths 375/390/430px and accessible keyboard interaction. No protected Dashboard Studio audit profile can be applied to a project. Only canonical **public** metadata is bootstrapped into the root page. See [DesignOS 3.0 blueprint](docs/designos-3-product-blueprint.md).

Build uses the existing canonical profile source and produces the new root plus classic compatibility route. Browser QA for the new workspace lives at `tests/e2e/designos3.spec.mjs`; GitHub Actions retains desktop and phone screenshots. For the phase-gated delivery roadmap and required verification evidence, consult the blueprint.

## DesignOS 2.0 experience

- Profile-driven HTML/CSS visual previews with desktop/mobile viewport switching.
- Selectable profiles are generated at build time from `profiles/index.json`, the canonical source of truth. Legacy UI IDs remain stable through each profile's `presentation.id` mapping. The registry currently includes Balanced SaaS, SaaS Product, Analytics Dashboard, Warm Editorial, and read-only Dashboard Studio audit.
- Search, category/device filters, selection, favorites (browser-local), and side-by-side comparison for up to four profiles.
- Project brief form with optional project type, goal, target user, device, tech stack, repository URL, and style preference.
- Agent instruction generation for Codex, Claude Code, Cursor, GitHub Copilot, Gemini CLI, WorkBuddy, and a generic coding agent.
- Copy and Markdown download for generated instructions; generation/copy/export are explicitly distinguished from actual agent execution.
- JSON export for all or selected design rules, with a preview and explanation of what the file contains.
- Dashboard Studio remains read-only; the preview never connects to or modifies the protected project.
- Canonical profiles include inherited tokens, source/evidence metadata, evidence status, and stable legacy IDs. Deprecated profiles are excluded from selectable runtime output.
- Automated regression includes a 30-case recommendation matrix, canonical/runtime consistency checks, and Playwright desktop/mobile browser acceptance.
- Existing versioned profile schema, inheritance validation, pinned UI UX Pro Max adapter, output-path guard, and engine-output validation remain in the repository.

### Preview integrity

The UI examples are locally rendered HTML/CSS templates based on documented profile descriptions and tokens. They are illustrative previews, not screenshots of a target application. KPI values and activity rows are example data. Where a profile is only an audit candidate, the interface labels its read-only boundary and does not apply it to a production project.

The generated agent prompt includes the selected profile rules, source notes, project brief, implementation steps, safety constraints, and acceptance criteria. It is generated locally in the browser. Copying or downloading it does not send it to an agent or claim the agent has executed it.

## Skill Resource Hub

A Looseleaf Paper-inspired resource center is available at `/resources/`. It catalogs 29 reusable Skills, integrated engines, design profiles and visual reference packs from 28 personal repositories (46 discovered `SKILL.md` paths, with repeated project copies and versions consolidated) in the canonical `resources/registry.json`. Private Skill bodies remain in their source repository; the public registry contains summaries, source paths and blob fingerprints only.

Agent discovery protocol: see [resources/agent-discovery.md](resources/agent-discovery.md). The DesignOS Render API provides read-only `GET /api/skills`, `GET /api/skills/{id}`, and `POST /api/skills/match` endpoints. Matching is deterministic keyword ranking and does not grant access to private source files or authorize external actions.


## Design Intelligence · 12 public upstream references (P0)

This repository now has a DAVYLAB-authored [DESIGN.md](DESIGN.md), establishing five layers (primitive tokens, semantic tokens, components, rules and Skills) and non-negotiable accessibility, responsive and asset-provenance gates.

The public Resource Hub tracks 36 entries, including **11 newly curated upstream design references**. UI UX Pro Max already exists as one pinned engine entry and is not duplicated. The eleven additional resources are marked **reference-only / not installed / not executed** until source, license, compatibility and browser-based quality checks are completed. The Hub explicitly shows `仅供参考 · 未接入` rather than reporting these as integrated.

See [the 12-source implementation plan](docs/design-intelligence-12-sources.md) for P0/P1/P2/P3 sequencing and acceptance boundaries. No additional model API requests, MCP calls or paid deployments are introduced by these catalog changes.

## Logo Studio · live AI-assisted brand identity (release candidate)

The new `/logo-studio/` route offers a one-sentence quick brief, advanced brand controls, three clearly marked **offline SVG templates**, and an independently triggered **real AI generation** workflow at `POST /api/logo/generate` (Cloudflare Pages Function). Model-generated concepts can be refined by instruction or no-code SVG wordmark/color/font-size edits, exported to SVG/PNG and saved locally. Full agent-targeted handoffs support ChatGPT, Claude, WorkBuddy, Qwen, Kimi, GLM, Gemini and Cursor. External agents are not executed by exporting instructions.

The API needs either a temporary user-supplied provider key or a server `OPENAI_API_KEY` **with** `LOGO_STUDIO_ACCESS_TOKEN`. Live provider integration is not considered tested merely because a mocked provider UI test succeeds. Independent originality, trademark, font-license, small-size readability and final vector-image parity remain mandatory before commercial release. See [Logo Studio release runbook](docs/logo-studio-release-runbook.md). The static server used by the test suite cannot execute Pages Functions.

## Local development

Requires Node.js 20+ and Python 3. Run:

```sh
npm run validate:rules
npm test
npm run build
npm run engine:status
npm run qa:layout -- ./path/to/report.html
npm run qa:layout:excel -- ./path/to/costs.xlsx --json
npm run qa:layout:word -- ./path/to/report.docx --json
npm run qa:layout:pptx -- ./path/to/deck.pptx --json
npm run qa:layout:pdf -- ./path/to/report.pdf --out ./artifacts/pdf-layout --dpi 120 --json
npm run qa:layout:browser -- tests/fixtures/document-layout-sample.html --out ./artifacts/layout-qa
npm run install:skill:layout -- --dry-run
```

Install the actual upstream engine only when GitHub access is available:

```sh
npm run engine:setup
node scripts/designos.mjs generate --query "SaaS dashboard" --project "My App" --output generated/candidate.json
npm run verify:engine-output -- generated/candidate.json
```

The engine is not ready until `npm run engine:status` reports `ready: true` and a real upstream output passes validation. Mock output is not accepted. Generated profiles remain drafts until reviewed.

## Document Layout QA skill

A reusable `document-design-layout-qa` skill lives in `.agents/skills/document-design-layout-qa/`. It defines document/table layout rules, financial-data safeguards, and a delivery checklist. A dependency-free HTML table lint command is available via `npm run qa:layout -- ./path/to/report.html`; the static HTML command is a heuristic; the Excel command checks workbook alignment and number-format consistency; the Word command checks DOCX table alignment and style consistency; the PowerPoint command checks table alignment and slide-canvas boundaries; the PDF command renders pages to PNG and checks text bounds and page consistency; the Playwright browser command checks desktop/mobile overflow and alignment and saves screenshots for review. Neither replaces human visual inspection. Install the skill into Codex's global skill directory with `npm run install:skill:layout` (preview first with `--dry-run`; existing installations require explicit `--force`). Install Python adapter dependencies with `python3 -m pip install -r requirements-layout-qa.txt`. See the skill's `USAGE.md` for scope and limitations.

## Deployment

- Repository: https://github.com/chenzhe223-tech/davylab-designos
- Expected GitHub Pages URL: https://chenzhe223-tech.github.io/davylab-designos/
- Cloudflare Pages target: https://davylab-designos.pages.dev/

Treat a deployment as verified only after the corresponding workflow succeeds and its HTTP verification step passes.

Cloudflare deployment is triggered automatically on pushes to `main` and can also be run manually. The workflow runs rule validation, unit/regression tests, and the production build before checking credentials and deploying. It verifies the production URL with an HTTP request. Required configuration: repository secret `CLOUDFLARE_API_TOKEN` with Pages project permissions and repository variable `CLOUDFLARE_ACCOUNT_ID`. If either is absent, deployment intentionally fails before publishing.

## Safety boundaries

Dashboard Studio is a read-only audit candidate. This repository does not apply tokens to the source project, access its cloud data, or modify production. Production deployment is separate from profile generation and requires explicit configuration. See `engine.lock.json` and `THIRD_PARTY_NOTICES.md` for engine provenance.

## Canonical profile data and migration compatibility

- Canonical source: `profiles/index.json`. The build script resolves inherited tokens and generates the browser runtime profile list from records with a `presentation` mapping.
- Legacy runtime ID mapping: `balanced-saas → davylab-default`, `saas-product → davylab-saas`, `analytics-dashboard → davylab-dashboard`, `warm-editorial → davylab-warm-editorial`, `dashboard-studio → dashboard-studio-live`.
- Existing local favorite IDs remain stable through `presentation.id`; selected profiles remain session-local as before. No destructive local-storage migration is performed.
- Evidence statuses: `draft`, `reviewed`, `validated`, and `deprecated` are distinct from workflow lifecycle `status`. Only rules with real evidence may claim validated status; illustrative previews remain clearly labeled.
