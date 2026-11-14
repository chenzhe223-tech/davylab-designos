# DAVYLAB Design Intelligence · 12 upstream references / P0 integration
Status: **P0 public reference catalog and project design charter**. No external packages installed or executed. Branch feature only; production remains unchanged until merge, CI and deployment verification.

## Why this work matters
The supplied README lists 12 GitHub resources, but a library of 12 names does not make a design-native Agent. Real production means **source knowledge → project-specific rules → applied components → browser audit → user-approved artifacts**, with origin, cost and licensing recorded.

## Deduplication and implementation order
| Source | Role | Phase / current state | Production rule |
| --- | --- | --- | --- |
| nextlevelbuilder/ui-ux-pro-max-skill | candidate generator and design heuristics | **Already pinned** in `engine.lock.json`; no duplicate registry item | real engine readiness and provenance are independently verified |
| VoltAgent/awesome-design-md | DESIGN.md examples | P0 reference catalog; adapted as original DAVYLAB `DESIGN.md` | do not copy third-party branding |
| Manavarya09/design-extract | browser-extracted DTCG and layout intelligence | P1 isolated proof | require Node 20+, Playwright/Chrome, permitted URL and local artifact validation |
| Owl-Listener/designer-skills | research, IA, UX workflows | P1 selective routing | install only a narrowly needed Skill, not all skills |
| Graphify-Labs/graphify | code/docs/PDF relationship graph | P2 evaluation | not yet verified as brand style memory |
| pbakaus/impeccable | critique, audit, polish | P1 visual review proof | deterministic lint and **real rendered screenshots** are separate gates |
| Nutlope/hallmark | anti-template design checks | P1 mobile/a11y pilot | browser checks and subjective quality review both required |
| alchaincyf/huashu-design | multi-asset concept/prototype pipeline | P2 controlled proof | ancillary visual assets can carry separate licenses; editable output QA required |
| GLips/Figma-Context-MCP | Figma context to code | P2 authorized connection | do not ingest private files without access grant |
| open-pencil/open-pencil | editable vector/editor prototype | P2 compatibility spike | verify .fig import/export fidelity, not marketing claims |
| DavidHDev/react-bits | animation components | P1 isolated component proof | reuse only compatible React stack; check license/dependencies |
| Jakubantalik/transitions.dev | motion recipes/transitions | P1 individual-transition proof | restrictions on republishing the library; evaluate terms before reuse |

## P0 delivered in this branch
1. Keep existing `ui-ux-pro-max` without duplicating it.
2. Register the other 11 as explicitly **reference-only**, public-source, uninstalled metadata in `resources/registry.json`.
3. Fix Resource Hub badge text so an external reference never displays as **已集成**.
4. Add a native `DESIGN.md` five-layer quality charter rooted in existing DesignOS visual and behavioral constraints.
5. Extend regression tests for public-only registry, reference-only semantics, deduplication and navigation labeling.

## Next implementation contracts
**P1**: choose one real Design Agent project; baseline desktop/mobile captures; extract *its own* tokens, compare against existing canonical profiles, run one isolated UI critique + mobile audit, output a machine-readable issue list with screenshots and severity; verify no third-party package secretly contacts paid services. Add a visible QA step only after it has evidence.

**P2**: expose scoped adapters `extract`, `recommend`, `critique`, `generate-preview`, `export`; per-user authorization, version pinning, timeout/error budget, provider key isolation and local artifact storage. Integrate useful parts into the *existing* flow rather than creating 12 new menu modules.

**P3**: verify real source-to-design-to-code production on an end-to-end example: 3 concept directions, one chosen design, editable assets, cross-device rendered QA, license manifest, approved output, re-open/re-edit tests and independent production URL verification.

## Safety and license review
README counts and star ratings in the user's source are snapshots or author claims, not acceptance evidence. Upstream features, licensing and dependencies must be checked at the pinned revision immediately before implementation. Some repos include mixed or component-specific terms; do not copy their full codebase, branded examples or assets to a public DAVYLAB product without review. External design data must not include user secrets or confidential material.

## Acceptance
P0 = catalog + honest status labels + unique IDs + native design charter + automated regression. P0 does **not** mean UI generation, MCP invocation, live Figma connectivity or customer-visible AI critique is functional. Build, browser, CI and deployment statuses must be reported separately.
