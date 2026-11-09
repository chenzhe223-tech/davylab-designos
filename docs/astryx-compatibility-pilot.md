# Astryx × DAVYLAB DesignOS — Compatibility Pilot

Status: **Design approved; integration and runtime testing pending**. This is an isolated experiment, not a production deployment.

## Verified baseline
- DesignOS uses a static HTML/CSS, rule/profile-driven preview architecture and Node-based build scripts (see README and package.json).
- Meta Astryx is MIT licensed, currently Beta, and its component library requires React 19+.
- Astryx consumers can use prebuilt CSS and override styling via CSS custom properties / className; StyleX is an implementation detail.

## P0 compatibility gate
1. Build a separate React 19 + Vite sandbox, without changing DesignOS production entrypoints.
2. Install pinned versions of `@astryxdesign/core`, `@astryxdesign/theme-neutral`, `@stylexjs/stylex`, and `@astryxdesign/cli`.
3. Render representative navigation, button, form, dialog and data-table examples; verify actual exported component names against installed package docs before coding.
4. Map DAVYLAB brand tokens (typography, neutral palette, spacing, radius, focus/hover, light/dark) to Astryx CSS custom properties; do not copy a third-party theme blindly.
5. Run build, interaction tests, keyboard accessibility checks and mobile widths 375/390/430px; confirm no horizontal overflow.
6. Record package versions, screenshots, test output, performance, limitations, and rollback instructions.

## Integration boundaries
- Preserve canonical profiles, generated agent instructions, resource registry and existing tests.
- No React migration of the main DesignOS site until the pilot passes.
- Do not modify Dashboard Studio's protected layouts or rules.
- No paid services, credentials, production publishing or destructive changes without approval.

## Acceptance
- Build passed; component interactions tested; responsive and keyboard QA passed.
- Evidence links (commit, test output and preview URL) provided before claiming completion.
- Failure means maintain current DesignOS implementation and document the incompatibility.

## Next implementation task
Create `experiments/astryx-pilot/` with isolated package manifest, sample components, token adapter, automated smoke tests and reproducible instructions. Keep this branch separate from `main`.
