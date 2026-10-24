# DAVYLAB DesignOS

**Design with intent. Build with evidence.**

DAVYLAB DesignOS is a design governance and UI decision workspace with versioned design profiles and a real UI UX Pro Max adapter.

## Current capabilities

- Responsive interactive preview for profile browsing, filtering, selection, comparison, and JSON export.
- Versioned design profiles, schema, and inheritance validation.
- Read-only Dashboard Studio audit profile; no automatic source or production writes.
- Pinned upstream UI UX Pro Max adapter with commit and file-integrity checks.
- Safe project-local output paths, preservation of raw engine results, and candidate-only promotion rules.
- GitHub Actions checks for profiles, tests, static build, actual engine installation, real output generation, and output validation.
- GitHub Pages preview workflow with a post-deploy HTTP/content check.
- Manual Cloudflare Pages deployment workflow with credentials checks and a post-deploy HTTP/content check.

## Local development

Requires Node.js 20+ and Python 3. Run:

```sh
npm run validate:rules
npm test
npm run build
npm run engine:status
```

Install the actual upstream engine only when GitHub access is available:

```sh
npm run engine:setup
node scripts/designos.mjs generate --query "SaaS dashboard" --project "My App" --output generated/candidate.json
npm run verify:engine-output -- generated/candidate.json
```

The engine is not ready until `npm run engine:status` reports `ready: true` and a real upstream output passes validation. Mock output is not accepted. Generated profiles remain drafts until reviewed.

## Deployment

- Repository: https://github.com/chenzhe223-tech/davylab-designos
- Expected GitHub Pages URL: https://chenzhe223-tech.github.io/davylab-designos/
- Cloudflare Pages production target: https://davylab-designos.pages.dev/

These URLs must not be treated as live until their respective workflow succeeds and its HTTP verification step passes.

For Cloudflare deployment, add repository secret `CLOUDFLARE_API_TOKEN` with Pages project permissions and repository variable `CLOUDFLARE_ACCOUNT_ID`. Then run the `Deploy DesignOS to Cloudflare Pages` workflow manually.

## Safety boundaries

Dashboard Studio is a read-only audit candidate. This repository does not apply tokens to the source project, access its cloud data, or modify production. Production deployment is separate from profile generation and requires explicit configuration. See `engine.lock.json` and `THIRD_PARTY_NOTICES.md` for engine provenance.
