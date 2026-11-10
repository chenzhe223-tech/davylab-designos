# DAVYLAB DesignOS 3.0 — Product blueprint

> DesignOS is an actual design-production workspace, not an index of prompts or a stack of backend settings. “Make the design visible first; expose rules only when needed.”

## Product promise

**Discover → Shape → Preview → Reuse → Deliver → Archive.**

First-run should make it obvious what this product does, show original UI examples, and let users start a real project within one action.

## Information architecture

| Module | Primary task | Hidden/secondary complexity |
| --- | --- | --- |
| Overview | Start, explore curated directions, resume | No multi-step process exposition |
| Design Studio | Live preview, inspect, edit, export | Evidence and agent implementation guardrails in detail |
| Components | Preview interactive primitives and patterns | Advanced component metadata |
| Resources | Match real public Skill metadata to a project | Full private Hub behind Access |
| Archives | Open, duplicate and restore design snapshots | Exportable backup |
| Settings | Appearance, local data, Agent target | No technical clutter on homepage |

## Visual DNA

- Contemporary editorial + restrained product software; no neon gradients, purple AI cards or fake dashboards as hero.
- Warm chalk (#f5f4ef), ink (#19221e), forest green (#52745d), white surfaces and precise neutral borders.
- Strong typographic proportions, purposeful whitespace, recognizable controls, no over-large information blocks.
- Real illustrative preview windows paired with clear *demo-data/illustrative* labelling; never imply generated app is already implemented.
- Clear 375/390/430px mobile behavior, a bottom navigation bar, touch-friendly controls and no horizontal overflow.
- Keep accessibility: landmarks, labels, focus-visible, keyboard-accessible menus, reduced motion.

## Capability boundaries

- Public profile runtime derives from canonical profiles/index.json. Preserve profile IDs, versions, evidence statuses, inheritance, and Dashboard Studio read-only guard.
- Public Skill metadata derives from resources/registry.json. The workspace can reference a Skill but cannot execute it without an authorized action or fetch private bodies.
- Preserve full legacy DesignOS at /classic/ and the protected hub at /resources/. Never copy private registry data into public homepage/bootstrap.
- LocalStorage is not cloud sync. Export/import is the current cross-device backup. Keep user-facing copy honest.
- Export JSON/CSS/Agent briefs as *artifacts*, not completed implementation or deployment evidence.
- No paid dependencies or surprise third-party service calls.

## Delivery increments

- **P0 (implemented in prototype; CI required):** visual-first homepage, complete navigation, local projects, interactive canvas, device toggles, profile selection, CSS/JSON/Agent exports, public resources, snapshots, settings, mobile QA.
- **P1 (next):** richer composable components, real production-grade Astryx adapter, theme/token import/export across DesignOS/BoardHub, visual asset previews, keyboard focus audit, user testing.
- **P2:** scoped Skill orchestration with explicit invocation permission, actual design-to-code integration, change/version diff, protected output packages and validation reports.
- **P3:** optional account synchronization with permissions, version history and conflict resolution; real project-implementation evidence, advanced collaborative delivery and plugin API.

## Definition of done

Code completed ≠ build passed ≠ runtime verified ≠ functional tested ≠ production deployed. All phases need independent evidence.

- CI: root canonical profile consistency remains tested; classic feature suite stays executable.
- Browser QA: new root, studio, component/resource/archive flows and 375, 390, 430px mobile checked.
- Cloudflare deploy: production URL content checks, access control on /resources and external runtime verification.
- Rollback: revert the P0 PR to restore the former root; legacy remains accessible for comparison.
