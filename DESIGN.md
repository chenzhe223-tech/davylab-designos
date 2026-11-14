# DAVYLAB DesignOS · DESIGN.md
> Owner-authored design contract. References are inspirations, not permission to reproduce a third party's visual identity.

## 0. Product and users
DesignOS is a production-oriented visual decision workspace; Design Agent turns a brand brief into an editable strategy, three distinct proposals, optional real SVG concepts and an explicit native/external handoff. DesignOS must help the user **finish a task**, not browse an endless gallery.

Canonical truth remains `profiles/index.json` and the active route's own documented tokens. This charter is a review guide, not a replacement for existing profiles, route IDs or signed-off screens. Protected Dashboard Studio profiles are never overwritten.

## 1. Five-layer design system
1. **Primitive tokens:** colors, typography, spacing (4px base), radius, borders, elevation and motion durations; named and versioned in the project's token store.
2. **Semantic tokens:** canvas, surface, text, muted, accent, focus, success, warning, danger and interactive states, available for light/dark and high contrast.
3. **Components:** buttons, forms, navigation, cards, comparison views, live previews, history, export controls and feedback; each has hover, focus, disabled, loading, error and empty states.
4. **Rules:** predictable hierarchy, no orphan calls to action, device-aware layout, real provenance, no inaccessible animation and no click-only operations.
5. **Skills:** rule references or tested adapters, routed to a **specific job**; never represent a linked or installed Skill as an already executed operation.

## 2. Visual identity and variant boundaries
- Core editorial direction: warm paper `#f5f4ef`, ink `#19221e`, restrained forest green `#52745d`, white surfaces, precise neutral borders.
- The Design Agent route uses the existing `#f6f5f0` canvas / `#172c24` ink / `#1f6047` action theme; honor the current live screen before changing tokens.
- Typography: editorial serif for selective storytelling; crisp sans for UI, form controls, numeric content and dense information. Ensure Chinese and English fallback fonts.
- Use whitespace **to group or emphasize** real content; not giant empty cards or stretched hero sections. Align rows and control baselines.
- Motion should communicate state, transition, selection or preview; use existing DAVYLAB Motion Lab tokens, avoid gratuitous effects, support `prefers-reduced-motion`.

## 3. Design Agent experience
**Brief → validated strategy → exactly three differentiated directions → select/refine → real asset generation (optional) → QA → native/external handoff → archive.**
All stages should have obvious Back / Next affordances and explicit progress. Keep the primary action visible at 375, 390 and 430px without horizontal scrolling. Do not conflate sample cards, typographic placeholders, rendered SVGs or actual published assets.

## 4. Mandatory acceptance gates
- **Interaction:** every visible button leads to a real action or is explicitly disabled with a reason; empty/loading/error/success states tested.
- **Visual quality:** check hierarchy, alignment, density, consistent components, type sizes and non-overflow on 375/390/430/768/1440px.
- **Accessibility:** semantic landmarks and labels; keyboard navigation, visible focus, text alternatives, sufficient contrast, `prefers-reduced-motion`.
- **Motion/performance:** mobile touch and scrolling remain usable; no unnecessary heavy third-party JS or downloaded browser packages in production.
- **Source integrity:** real model output marked as live only after completed model call, valid response and source evidence; no mock preview sold as final.
- **Delivery:** exported files open successfully; raster/vector parity checked; trademark, font and third-party image permissions checked before commercial use.

## 5. Third-party reference policy
- Existing pinned `ui-ux-pro-max` is a candidate generation/search engine, not a license to skip QA.
- Eleven additional items in `resources/registry.json` are **reference-only, not installed, not invoked**. Read each exact upstream README, LICENSE, dependencies, revision and source files before any installation.
- `awesome-design-md` informs the structure of this document. `design-extract` may propose DTCG tokens in an isolated, user-authorized environment. Impeccable/Hallmark may inform design critique. React Bits/transitions.dev may inform individual motion implementations; do not redistribute a restricted component library.
- Do not import external brands' trademarks, layouts or images verbatim. Do not expose API keys or private source metadata in public registries.

## 6. Honest delivery states
Report **Code Completed → Build Passed → Runtime Verified → Functional Tested → Production Deployed** independently, with links and actual tests. An informative catalog entry or copied prompt is neither a functioning integration nor a deployed feature.

Related: `docs/designos-3-product-blueprint.md`, `docs/design-agent-4-p0.md`, `docs/design-intelligence-12-sources.md`.
