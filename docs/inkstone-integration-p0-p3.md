# Inkstone × DAVYLAB DesignOS — P0–P3 implementation contract

Source: https://github.com/Konata9/inkstone (MIT; preserve attribution and verify upstream palette licensing separately).
Status: integration specification; NOT production deployed.

## P0 Source and safety
- Pin an upstream commit SHA before copying source. Record license and third-party palette provenance.
- Extract semantic color roles, not editor-specific JSON. Preserve existing DesignOS profiles and localStorage schema.
- Six variants: xuanmo, xuanmo-dimmed, xuanzhi, xuanzhi-dimmed, canghai, qingci.
- Tokens: canvas, surface, elevated, text, muted, border, primary, primary-text, focus, selection, success, warning, danger.
- Do not mistake syntax-highlighting reds for action colors. Red signals destructive actions; blue signals primary interactions.

## P1 Theme runtime
- Add optional themeId to DesignOS project settings with backward-compatible default.
- Preview desktop/mobile for all six variants; ensure export JSON/CSS includes selected token values.
- No existing route or saved profile may be overwritten. Theme reset restores previous values.

## P2 Motion Lab bridge
- Export versioned design tokens and motion-safe CSS custom properties; animate opacity/color only when reduced-motion is not requested.
- No fake motion engine: bridge only after checking the actual Motion Lab interface.
- Before/after comparison and accessibility checks required.

## P3 Consumers
- Logo Studio: apply palette to brand preview only when explicitly selected; preserve logo vectors and brand identity.
- Academy: optional reading theme; never overwrite learner progress or notes.
- Shared package API with explicit version and fallback; no implicit cross-app writes.

## Acceptance gates
- P0: pinned source and attribution, token map, independent contrast test.
- P1: six selectable themes, persisted selection, correct CSS/JSON export, desktop and 375/390/430px mobile browser tests.
- P2: reduced-motion, visual consistency and rollback tests.
- P3: verified integration tests in each consumer repository; production URLs and deployment commit IDs recorded.
- Release states: Code Completed / Build Passed / Runtime Verified / Functional Tested / Production Deployed. Never claim later gates from earlier ones.
