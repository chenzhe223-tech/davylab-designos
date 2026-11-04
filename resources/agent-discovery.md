# DAVYLAB Skill Resource Hub — Agent Discovery Protocol

This document describes how agents discover public resources and how the authenticated Resource Hub loads the personal private catalogue.

## Public discovery endpoints

Base URL: https://davylab-designos-engine.onrender.com

- GET /api/skills — list public resources and reference assets.
- GET /api/skills?q=<intent> — filter the public catalogue with deterministic weighted keyword matching.
- GET /api/skills?type=skill&category=design&agent=WorkBuddy — constrain the public result set.
- GET /api/skills/{id} — fetch one public resource record.
- POST /api/skills/match — rank public resources for a task.

The public API does not provide private-catalogue access. Supplying visibility=private returns HTTP 403.

## Authenticated private catalogue

The personal Resource Hub loads private metadata from the Access-protected Pages Function at /resources/private-registry.json. The Function independently validates the signed Access JWT, issuer, audience, expiry and owner identity before reading Cloudflare KV.

The public DesignOS repository contains only a sanitized public projection. Never add private repository names, paths, Blob SHAs or private-only resource summaries to that projection.

## Matching and activation

The browser performs local weighted keyword matching over the catalogue it has loaded. Private resources participate only after the authenticated private endpoint succeeds. The public Render API receives the task query and returns public results only; it never receives or returns private metadata.

Matching is a discovery aid, not a semantic LLM judgment and not proof of applicability. Before applying a Skill:

1. Read the complete SKILL.md from the exact repository/ref/path.
2. Verify the Blob SHA and reconcile changes before use.
3. For private sources, use only the user's existing authorized GitHub connection or local workspace. A URL does not grant access.
4. Check prerequisites, supported inputs, outputs and guardrails.
5. Never treat a matching Skill as permission to send messages, email, deploy, publish, spend money, modify production or access unapproved data.
6. Report selected resources, source-read evidence, actions, tests and blockers.

## Public routing examples

| User intent | Suggested public resources | Notes |
|---|---|---|
| Design a new web app or redesign a product workspace | Visual DNA public skill copy, UI UX Pro Max, Looseleaf Paper and DesignOS profile library | Looseleaf Paper is a visual reference pack, not an executable Skill. |
| Prepare a business report, Excel, PPT, PDF or web dashboard | Document Design & Layout QA | Preserve values and formulas. Render and inspect when visual QA is required. |
| Create coordinated article illustrations | Baoyu Article Illustrator and DAVYLAB Asset Intelligence | Distinguish generated images from factual photos and record source/licence metadata. |
| Build scroll-led interactive experiences | GSAP Core, GSAP ScrollTrigger and GSAP Timeline | Verify device performance and reduced-motion behavior. |

## Source of truth

- The complete canonical registry is stored in an owner-private workspace.
- Public projection: davylab-designos/resources/registry.json.
- Private runtime projection: Cloudflare KV, read only through the Access-protected Pages Function.
- Add or modify resources only after verifying the complete source file and updating its Blob SHA.
- Duplicate release copies should be recorded as alternate copies, not separate Skills.
