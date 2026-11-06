# DAVYLAB DesignOS — UI Engine Integration Audit

**Status:** Phase 0 audit started  
**Branch:** `feat/ui-engine-integration-audit`  
**Baseline repository:** `chenzhe223-tech/davylab-designos`  
**Decision:** Integrate by capability and verified interfaces; do not wholesale copy upstream platforms.

## 1. Executive decision

The three sources are complementary, but they are not three interchangeable component libraries:

| Source | Primary role | Preferred integration | Initial decision |
|---|---|---|---|
| VantaUI | Production-pattern inspiration, components, blocks, app/site templates and Figma assets | User-directed, item-by-item use of official site/registry, subject to plan and terms | **Restricted / manual only** until licensing and automation permissions are clarified |
| Watermelon UI | Open-source React/Tailwind components, animated components, blocks, dashboards and templates | Hosted read-only MCP for discovery; official shadcn registry for selected source installation | **Approved for connector-first integration** |
| Libraries.dev | Seven focused React visual-effect packages and agent Skill | Install the free Skill from upstream source; add individual MIT npm packages only after project compatibility and per-feature review | **Approved for selective integration** |

The intended product is a DAVYLAB-owned orchestration and quality layer, not a mirror of upstream catalogues.

## 2. Verified source inventory

### VantaUI

- Website: https://www.vantaui.com
- Official registry guide identifies the shadcn registry at `https://vantaui.com/r/registry.json` and individual item endpoints under `/r/[name].json`.
- Its terms describe a curated library of design inspiration, templates, components, blocks, implementation references, source code and design files.
- **Material restriction:** current Terms prohibit unauthorised scraping/crawling, mirroring, caching, archiving, re-hosting, commercial exploitation beyond the selected plan, and using platform content to create derivative works or to train, test, index, benchmark or improve AI/ML systems unless expressly permitted by the Terms or written consent.
- Terms also prohibit creating a standalone content repository that substitutes for VantaUI.
- Permitted use is described as personal/internal business use or integration into proprietary products/services, subject to the licence and restrictions.
- No authoritative public GitHub source repository or official MCP server was verified in this audit.

**Integration boundary:** do not crawl VantaUI, bulk-import its catalogue, persist its component source/screenshots/design files in DesignOS, create embeddings or searchable mirrors, or expose VantaUI assets as a competing catalogue. Until written clarification or plan-specific permission is obtained, retain only a source link and user-authored notes; the user must select and retrieve each item through the official product interface. Review the applicable plan and asset-specific rights before any commercial shipment.

### Watermelon UI

- Platform repository: https://github.com/WatermelonCorp/watermelon-platform
- Installable registry repository: https://github.com/WatermelonCorp/watermellon-registry
- Hosted site: https://ui.watermelon.sh
- Hosted read-only MCP: https://mcp.watermelon.sh/mcp
- Official Skill: `skills/watermelon-ui/SKILL.md`
- MCP documentation lists `search`, `get_component`, `get_inspiration`, `compose_page`, and `list_categories`; legacy catalog methods remain compatibility aliases.
- Official registry install example: `npx shadcn@latest add https://registry.watermelon.sh/r/<slug>.json`
- Both platform and registry repositories declare MIT licences.
- Platform stack: React 19, TypeScript, Vite, Tailwind CSS 4, Motion, React Router, Bun.
- Registry stack: React 19, TypeScript, Vite, Tailwind CSS 4 and shadcn registry tooling.

**Integration boundary:** use MCP for discovery and retrieve only selected items. Keep installed source in the consuming application and preserve the upstream MIT notice for copied substantial portions. Do not treat a catalogue search result as proof of framework compatibility; inspect each selected item's dependencies, source and responsive/accessibility behavior.

### Libraries.dev

- Repository: https://github.com/Jakubantalik/Libraries.dev
- Website/Skill docs: https://libraries.dev/skill
- Official free Skill install command: `npx skills add Jakubantalik/Libraries.dev`
- Skill source path: `skills/libraries-dev/SKILL.md`
- Skill blob at audit time: `ccef420413f7893027556c7e400c0139df2abd81`
- Repository declares MIT. Its Skill documents seven packages:
  - `border-beam` / `BorderBeam`
  - `thinking-orbs` / `ThinkingOrb`
  - `liquid-gooey` / `Liquid`
  - `voice-glow` / `VoiceBeam`
  - `bot-avatars` / `BotAvatar`
  - `metal-fx` / `MetalFx`
  - `img-fx` / `ImageGeneration`
- React 18+ is required; Image also requires the `three` peer dependency.
- Free Skill commands: `libraries reveal`, `libraries review`, `libraries apply`. Pro-only `libraries tune` and Studio exports require a paid plan.
- Skill rules require reading the matching reference before coding, asking before package installation unless installation was explicitly requested, wiring effects to real application state, preserving reduced-motion behavior, and avoiding stacked effects.
- Package code is MIT; Pro Studio exports/presets/recipes and separately licensed model files must be reviewed independently. Commercial use of licensed model files may require Pro/Business.

**Integration boundary:** prefer the free Skill and individual MIT packages. Do not install Pro Skill, buy a plan, or use separately licensed model files without explicit approval. Do not infer props; read each package reference first.

## 3. DesignOS baseline and compatibility risk

The current DesignOS README describes a profile-driven visual workspace with locally rendered HTML/CSS previews, build-time profile generation, a Skill Resource Hub, and a Node-based build/test pipeline. The current root `package.json` declares no React, Next.js, Tailwind, Motion or Vite runtime dependencies.

Therefore:
- Do not add React or convert the existing DesignOS application merely to host these sources.
- Keep DesignOS core framework-neutral unless repository source inspection proves a safe existing React surface.
- Integrate discovery through a provider adapter and a source metadata model.
- Use Watermelon and VantaUI assets in downstream React projects only when that target project is compatible and the user selects the item.
- Libraries.dev effects can be offered as optional React-specific implementation recipes; do not represent them as native DesignOS preview components until a React host exists.
- Preserve all existing profile IDs, profile inheritance, local favorites, read-only Dashboard Studio boundaries, output-path guards and current build/test behavior.

## 4. Target architecture

```text
DAVYLAB DesignOS
├── Design Intelligence
│   ├── intent classification
│   ├── project stack / framework detection
│   ├── design profile and token selection
│   └── accessibility / responsive constraints
├── Provider adapters
│   ├── Watermelon MCP adapter (read-only discovery)
│   ├── Libraries.dev Skill / package reference adapter
│   └── VantaUI outbound-link adapter (manual, terms-restricted)
├── Normalized recommendation layer
│   ├── source + licence + version evidence
│   ├── compatibility and dependency checks
│   ├── recommendation rationale
│   └── user approval gate
└── Implementation & QA
    ├── selected source install (target app only)
    ├── token adaptation
    ├── responsive / keyboard / reduced-motion checks
    └── build + browser visual regression
```

The normalized layer stores only allowed metadata: provider name, canonical URL, user-visible item slug/title when permitted, source revision where public, licence/terms reference, compatibility findings, audit timestamp and user selection state. It must not become a mirror of restricted upstream content.

## 5. Phased implementation plan

### Phase 0 — Audit (in progress)
- [x] Identify the actual DesignOS repository and inspect README, package manifest, resource protocol and third-party notices.
- [x] Read the complete Watermelon Skill and inspect both platform and registry licences.
- [x] Read the complete Libraries.dev Skill and repository licence.
- [x] Inspect VantaUI terms and identify automation, mirroring and AI-indexing restrictions.
- [ ] Inspect DesignOS app entry points, build pipeline and test conventions before touching runtime code.
- [ ] Verify upstream revisions and package reference files for the exact first-wave components.

### Phase 1 — Safe resource-provider foundation
- Add a provider contract with capabilities: `search`, `getItem`, `getInstallPlan`, `getLicenceEvidence`.
- Implement Watermelon read-only MCP integration without scraping the website.
- Implement Libraries.dev reference lookup using upstream Skill/package references.
- Implement VantaUI as outbound-link/manual selection only; do not fetch or persist catalogue data.
- Add provider-level timeouts, error states, source attribution and freshness metadata.

### Phase 2 — DesignOS Resource Hub
- Add a dedicated UI-engine collection without changing the existing Skill registry schema in-place until migration tests exist.
- Add filters for role (structure / visual effect / inspiration), framework, runtime dependency, licence, access model and integration maturity.
- Distinguish `reference-only`, `discoverable`, `source-verified`, `installable`, and `tested-in-target` states.
- Require explicit selection before source installation or dependency changes.

### Phase 3 — First-wave integration proof
- Watermelon: choose one small, accessible component and one block after MCP retrieval; test shadcn installation in a disposable React fixture, not DesignOS core.
- Libraries.dev: choose Thinking Orbs or Border Beam only if a real target app has a matching state and React 18+; verify reduced motion, light/dark theme, bundle impact and cleanup.
- VantaUI: user manually selects one item; validate its plan-specific permission and use only the official install path. No bulk retrieval.

### Phase 4 — Product integration and release
- Connect the provider layer to DesignOS recommendations and agent instruction generation.
- Add automated compatibility checks and Playwright desktop/mobile QA.
- Run all existing rule validation, regression tests and production build.
- Update Skill Resource Hub metadata, docs and third-party notices only after evidence and schema validation.
- Deploy only after the existing workflow and HTTP verification pass.

## 6. Acceptance criteria

1. Existing DesignOS behavior and profile IDs remain unchanged.
2. No React framework migration is introduced into DesignOS core without a separate approved decision.
3. Watermelon discovery uses the official read-only MCP; no HTML scraping.
4. Libraries.dev props come from the exact package reference, not model guesses.
5. VantaUI content is not scraped, mirrored, indexed, cached or re-hosted; all usage follows its current plan and terms.
6. Every recommendation shows source, licence/access status, dependencies and compatibility.
7. No package is installed into the main project without a target-specific compatibility review and explicit approval.
8. Reduced-motion, keyboard access, mobile layout, light/dark theme and production build are tested for each selected UI integration.
9. All existing DesignOS validation, tests and build pass.
10. Deployment is not claimed until CI and production HTTP verification succeed.

## 7. Evidence links

- DesignOS: https://github.com/chenzhe223-tech/davylab-designos
- Watermelon platform: https://github.com/WatermelonCorp/watermelon-platform
- Watermelon Skill: https://github.com/WatermelonCorp/watermelon-platform/blob/main/skills/watermelon-ui/SKILL.md
- Watermelon registry: https://github.com/WatermelonCorp/watermellon-registry
- Watermelon MCP docs: https://ui.watermelon.sh/developers/mcp
- Libraries.dev repository: https://github.com/Jakubantalik/Libraries.dev
- Libraries.dev Skill: https://github.com/Jakubantalik/Libraries.dev/blob/main/skills/libraries-dev/SKILL.md
- VantaUI registry guide: https://www.vantaui.com/blog/shadcn-ui-registry-guide-2026-copy-paste-react-ui
- VantaUI Terms: https://www.vantaui.com/terms

---
Audit date: 2026-11-06. Re-check live source revisions and terms before implementation or commercial release.
