# DAVYLAB Skill Resource Hub

The Resource Hub is a separate module integrated into DAVYLAB DesignOS.

## Purpose

A personal routing desk for user-authored Skills, project-integrated capabilities, visual systems, design profiles and upstream engines. It supports browsing, filtering, source verification, task matching and Agent activation briefs.

## Visual design

The interface follows the user-provided Looseleaf Paper reference: warm paper-white surfaces, ink-like borders, forest-green emphasis, editorial serif headings and restrained notebook details.

## Registry architecture and privacy

The complete canonical registry is kept in an owner-private workspace. The public DesignOS repository contains only a sanitized public projection at resources/registry.json. It includes public-source Skills and non-executable reference assets only. Private-only resources, private repository paths, private Blob SHAs and private alternate copies are excluded from the public file.

The personal private catalogue is stored in Cloudflare KV and served by a Pages Function:

- Route: /resources/private-registry.json
- Storage: a dedicated Cloudflare KV namespace, key registry
- Authentication: Cloudflare Access with an owner email allowlist and 24-hour session
- The Function validates the Cf-Access-Jwt-Assertion signature against Access JWKS, issuer, audience, expiry and owner identity before reading KV.
- Private responses disable browser caching.

The Access application protects /resources/* on the main Pages hostname and preview subdomains. It does not lock the DesignOS home page.

## Agent discovery

The Render API is public-catalog-only:

- GET /api/skills
- GET /api/skills?q=<intent>
- GET /api/skills/{id}
- POST /api/skills/match

Requests asking the public API for visibility=private are rejected. Private entries are merged into the browser only after the protected Pages Function returns the authenticated KV record. If access is unavailable, the page remains usable with the public catalogue.

Task matching uses weighted lexical matching. The browser runs local matching across its currently loaded catalogue so private entries participate without sending their metadata to the public Render API. This is advisory routing, not proof of execution or permission.

## Activation policy

1. Search by task objective, input and expected output.
2. Read the complete SKILL.md from its exact repository, ref and path before applying it.
3. Verify the source Blob SHA; reread and reconcile if it changed.
4. Private repositories must be read using an already-authorized GitHub connection or local workspace. A registry entry or URL never grants repository permission.
5. Check prerequisites and guardrails before use.
6. Never treat a matching Skill as permission to send emails, publish, deploy, pay, modify production or access an unapproved data source.
7. Report selected resources, source-read evidence, actual actions, verification and remaining blockers.

## Build

npm run build copies the sanitized public registry into dist/resources/ and embeds only that public projection into the offline HTML. The Pages Function is deployed from the repository-root functions/ directory and reads the private KV binding at runtime.
