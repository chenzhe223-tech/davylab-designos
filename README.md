# DAVYLAB DesignOS

**Design with intent. Build with evidence.**

DAVYLAB DesignOS is a design governance and UI decision workspace. This repository currently contains the interactive static preview and its GitHub Pages deployment workflow.

## Current preview

The preview provides:
- Responsive design-profile browsing and filtering
- Selection and comparison of design profiles
- JSON export for all profiles or selected profiles
- A read-only governance boundary for Dashboard Studio
- Client-side interaction without account creation or backend writes

## Verified release status

- The static preview source is committed on `main`.
- GitHub Pages deployment is configured in `.github/workflows/pages.yml`; the public URL must not be considered live until the workflow succeeds and its post-deploy HTTP checks pass.
- The full local engineering package contains the pinned UI/UX Pro Max adapter, schemas, validation scripts, and automated tests. Those engine-integration files are not yet fully mirrored into this repository.
- The upstream engine must be installed and must produce a real, validated output before the engine integration can be marked ready. Mock output is not accepted.
- Cloudflare Pages remains the intended production target; no production release should be claimed before deployment and URL verification.

## Safety boundary

Dashboard Studio is marked read-only. This preview does not access or modify its source project, cloud data, credentials, or deployments. Any future write integration requires explicit authorization and independent verification.

## Deployment workflow

A push to `main` that changes `index.html` or `.github/workflows/pages.yml` triggers the GitHub Pages workflow. The workflow uploads the static site, deploys it, then requests the resulting URL and checks for the DesignOS entry point.

For Cloudflare Pages, configure `CLOUDFLARE_API_TOKEN` as a repository secret and `CLOUDFLARE_ACCOUNT_ID` as a repository variable/secret before enabling the production deployment workflow.
