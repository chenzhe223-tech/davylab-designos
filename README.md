# DAVYLAB DesignOS

**Design with intent. Build with evidence.**

DAVYLAB DesignOS is a visual design selection workspace. Users can preview rule-based UI examples, compare design profiles, describe project goals, and generate structured execution instructions for major AI coding agents.

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

## Local development

Requires Node.js 20+ and Python 3. Run:

```sh
npm run validate:rules
npm test
npm run build
npm run engine:status
npm run qa:layout -- ./path/to/report.html
```

Install the actual upstream engine only when GitHub access is available:

```sh
npm run engine:setup
node scripts/designos.mjs generate --query "SaaS dashboard" --project "My App" --output generated/candidate.json
npm run verify:engine-output -- generated/candidate.json
```

The engine is not ready until `npm run engine:status` reports `ready: true` and a real upstream output passes validation. Mock output is not accepted. Generated profiles remain drafts until reviewed.

## Document Layout QA skill

A reusable `document-design-layout-qa` skill lives in `.agents/skills/document-design-layout-qa/`. It defines document/table layout rules, financial-data safeguards, and a delivery checklist. A dependency-free HTML table lint command is available via `npm run qa:layout -- ./path/to/report.html`; it is a static heuristic and does not replace rendered visual inspection. See the skill's `USAGE.md` for scope and limitations.

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
