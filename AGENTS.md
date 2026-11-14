# DAVYLAB DesignOS · coding agent instructions

Before changing any UI, interaction, design system, motion, Design Agent or Logo Studio feature:

1. Read `DESIGN.md` and the relevant existing route implementation. Treat `profiles/index.json` as the canonical DesignOS profile source; preserve existing compatibility routes, privacy boundaries and protected Dashboard Studio read-only status.
2. Read `docs/design-intelligence-12-sources.md` if evaluating an upstream design tool. In `resources/registry.json`, `status: reference` and `activation.mode: reference-only` mean **not installed and not callable**. Do not automatically execute, copy, vendor or market these sources as integrated capabilities.
3. Derive designs from the user's concrete product task, data and confirmed brand direction. Use the five-layer contract: primitives → semantic tokens → components → rules → scoped Skills. Preserve existing app behavior and previously accepted design standards.
4. Never claim a template preview, generated brief, mocked model result, linked Skill or Figma URL is an executed production asset. Real capability requires a functioning provider/adapter, explicit permission when required and tangible output.
5. Maintain desktop and mobile layouts, visible focus, keyboard access, contrast, reasonable motion and `prefers-reduced-motion`. Capture real browser evidence at 375/390/430px and desktop for visual changes.
6. Run `npm run validate:rules`, `npm test` and, for rendered visual changes, the applicable Playwright tests. Report each delivery stage separately: Code Completed, Build Passed, Runtime Verified, Functional Tested, Production Deployed. No deployment, payment or paid-provider calls without relevant authorization.

For the new 12-source effort, the first implementation gate is source metadata plus a human-authored design contract. Adapter integration and actual AI-quality auditing are future tasks, not implied by this instruction file.
