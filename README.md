# DAVYLAB DesignOS

GitHub-first design system workspace and UI/UX Pro Max adapter.

## Status

The project is under active development. See `docs/DELIVERY_CHECKPOINT.md` for verified state and remaining release blockers.

## Local development

Requires Node.js 20+.

```sh
npm test
npm run validate:rules
npm run build
npm run engine:status
```

The UI UX Pro Max runtime is pinned to an immutable upstream commit. Do not treat the engine as ready until `npm run engine:status` reports ready and a real output passes `npm run verify:engine-output`.

## Deployment

The Cloudflare Pages workflow requires repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, plus the Pages project `davylab-designos`. Production is not considered released until the deployed URL is fetched and verified by the workflow.
