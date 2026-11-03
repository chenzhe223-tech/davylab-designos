# DAVYLAB DesignOS 3.0 — Integrated Design Platform

## Decision

Extend the existing DesignOS in place. Do not create a duplicate application or rewrite the current static site. The GitHub repository remains the source of truth; Cloudflare Pages remains the deployment target.

## Existing foundation to preserve

- Canonical profile registry: `profiles/index.json`; generated runtime profiles are built from it.
- Stable legacy presentation IDs and current profile inheritance.
- Existing visual previews, filters, favorites, selection and comparison.
- Existing agent prompt generation and JSON/Markdown exports.
- UI UX Pro Max adapter and engine-output validation.
- Document Layout QA commands and existing tests.
- Dashboard Studio remains a protected, read-only audit candidate.
- No claim of deployment or feature completion until CI and production HTTP verification pass.

## New capability providers

### Looseleaf — component and visual-style provider

Use the upstream shadcn registry selectively for a hand-drawn paper visual style, accessible React components, blocks, icons, doodles and stickers. Treat it as an optional style pack. Namespace its tokens and never let its umbrella theme overwrite DAVYLAB Core.

Compatibility gate: the current DesignOS shell is static HTML/CSS/JS, while Looseleaf is React + Tailwind CSS v4 + Radix (upstream package currently declares React 19). It must first run in an isolated React preview surface or a future React host. Do not add React-only imports to the current shell.

### Stageshow — product illustration and motion provider

Use the upstream agent skill, portable React kit, examples and filming workflow for product stills, feature cards, bento grids, cursor walkthroughs and short motion scenes.

Compatibility gate: Stageshow's kit supports React 18+ and plain CSS. Keep authored illustrations separate from live application behavior. Its scripted cursor/click interactions are visual storytelling, not real browser automation. Use Playwright filming only as a visual QA tool, with a local Chrome installation.

## Target platform architecture

1. **Design Workbench** — project brief, target audience, product type, reference inputs and output goals.
2. **Design Intelligence** — recommendation orchestration across DAVYLAB Core, UI UX Pro Max and registered providers.
3. **Design System Manager** — semantic tokens, typography, color, spacing, themes, variants and profile inheritance.
4. **Component Library** — searchable components, blocks, provider/source/license metadata, previews and install-to-project workflow.
5. **Layout Studio** — responsive page composition, grid systems, density controls and reusable page templates.
6. **Stage Studio** — product illustrations, device/window framing, feature cards, bento layouts, cursor stories and motion timelines.
7. **Asset Library** — icons, illustrations, stickers, logos and user-owned assets with provenance.
8. **Responsive Preview** — desktop/tablet/mobile previews and explicit breakpoint behavior.
9. **Design QA Lab** — accessibility, overflow, consistency, responsive, visual regression and motion review.
10. **Export & Handoff** — design tokens, component source, HTML/CSS/React output, agent instructions, preview images and video.

## Provider contract

Every external provider must declare:
- stable provider ID and display name;
- provider kind (skill, component registry, asset library or verification tool);
- upstream URL, pinned version/commit and license;
- framework/runtime compatibility;
- capability tags and supported outputs;
- required dependencies and transitive sources;
- install/enable state and explicit user action;
- token namespace and isolation strategy;
- verification commands and known limitations.

## Current implementation status (2026-11-03)

- [x] Phase 0 provider registry, source adapters, upstream skill and license notices.
- [x] First dependency-free browser workbench vertical slice: project brief, visual direction preview, provider catalog, component catalog, layout controls/export, Stage-style scene demo, heuristic QA and Markdown handoff.
- [x] Main build copies `workbench/` and `integrations/` into the production output; main UI links to the workbench.
- [ ] CI confirmation and browser-level acceptance for this change.
- [ ] React-host compatibility spike and actual Looseleaf component source installation.
- [ ] Actual Stageshow kit integration and film/rehearsal QA.

The current workbench is a functional local prototype for the first product workflow, not yet the complete production design platform. The component catalog is descriptive metadata, the Stage Studio uses an authored local scene rather than the upstream Stageshow kit, and QA is heuristic. These boundaries are visible in the UI.

## Integration phases

### Phase 0 — foundation (this change)
- Register Looseleaf and Stageshow as providers.
- Add agent-facing adapters and upstream notices.
- Document compatibility and non-destructive integration boundaries.
- No runtime dependency changes and no modification to existing UI behavior.

### Phase 1 — provider management
- Add a provider catalog with search, capability tags, source/license, compatibility and enable/disable controls.
- Add explicit import/update actions and version pinning.
- Add dependency and license review before installation.

### Phase 2 — isolated React Design Workbench
- Introduce a separate React surface only after a compatibility spike.
- Mount it behind a route or isolated application entry without replacing the existing static shell.
- First vertical slice: component preview and provider-scoped theme switching.
- Add Looseleaf as the first component pack.

### Phase 3 — Stage Studio
- Integrate the Stageshow kit and a curated set of examples.
- Provide still, feature-card, bento and motion-scene templates.
- Add filming, contact-sheet and visual review workflows.
- Keep demo interactions clearly labeled as simulated.

### Phase 4 — unified AI design workflow
- Convert user brief into design intent, recommend layout/style/components, compose previews, run QA and produce handoff artifacts.
- Keep generated outputs as drafts until reviewed.
- Add provider-specific adapters rather than hard-coding individual skills into the core.

### Phase 5 — production hardening
- Unit, integration, accessibility, responsive and Playwright visual tests.
- Performance and bundle budgets; lazy-load optional providers.
- Validate Cloudflare build and production URL.
- Document rollback and provider update procedures.

## Acceptance criteria

- Existing profiles, IDs, exports, preview behavior and read-only guards remain unchanged.
- Looseleaf and Stageshow are discoverable as separate providers with accurate descriptions.
- No global theme overwrite or silent dependency installation.
- React-only capabilities are isolated from the current static shell.
- Third-party licenses and asset notices are retained.
- Simulated demos are never represented as live product automation.
- CI build, existing test suite and new provider registry validation pass before merge/deploy.
