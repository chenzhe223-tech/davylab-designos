# Looseleaf Paper Style Pack

This folder contains the reusable CSS layer for the optional Looseleaf Paper profile in DAVYLAB DesignOS. The portable, copy-ready starter is published under `starter/looseleaf/` in the repository and build output.

## Preview and examples

- [Visual showcase](https://looseleaf-preview.davylab-designos.pages.dev/examples/looseleaf-showcase.html): responsive visual direction and local-only interactions.
- [Component reference](https://looseleaf-preview.davylab-designos.pages.dev/examples/looseleaf-components.html): buttons, form controls, feedback, lists, empty states and keyboard-accessible dialog.
- [Functional workspace](https://looseleaf-preview.davylab-designos.pages.dev/examples/looseleaf-workspace.html): local-first create/edit/search/filter with browser persistence. No account, server API, cloud sync or cross-device sync.
- [Portable starter](https://looseleaf-preview.davylab-designos.pages.dev/starter/looseleaf/): copy-ready static HTML/CSS/JS starter.

## Portable installation

Copy the contents of `starter/looseleaf/` into a static web project, preserving the three asset filenames. Open `index.html` directly or serve the folder through your normal development server. The starter has no npm dependency, framework requirement, build plugin, API or remote font dependency.

Files:
- `index.html`: semantic example page with paper surface, card, button, form and dialog.
- `looseleaf-tokens.css`: editable CSS custom properties, scoped under `.ll-theme`.
- `looseleaf.css`: reusable visual primitives and responsive/reduced-motion rules.
- `looseleaf.js`: small accessible dialog behavior (focus entry, Tab loop, Escape, backdrop dismissal and focus restoration).

The starter is deliberately a visual/integration baseline, not an application backend. Replace sample copy and connect form actions to your own application logic. Do not treat the demo form as data submission.

## Design tokens

Apply `.ll-theme` to the page root or a containing element. Override individual custom properties in a project-specific stylesheet; do not edit the source pack if you want straightforward future upgrades.

Supported tokens: `--ll-paper`, `--ll-surface`, `--ll-ink`, `--ll-muted`, `--ll-line`, `--ll-line-strong`, `--ll-accent`, `--ll-terra`, `--ll-shadow`, and `--ll-radius`.

## Available primitives

- `.ll-paper-surface`, `.ll-paper-card`
- `.ll-ink-button` (minimum 44px target), `.ll-ink-button--secondary`, `.ll-ink-button--danger`
- `.ll-ink-input`, `.ll-field`, `.ll-checkline`
- `.ll-sticker`, `.ll-ink-divider`
- `.ll-feedback`, `.ll-feedback--warning`, `.ll-feedback--error`
- `.ll-list`, `.ll-list-item`, `.ll-list-item__meta`
- `.ll-empty-state`, `.ll-empty-state__symbol`
- `.ll-dialog-backdrop`, `.ll-dialog`, `.ll-dialog-actions`

The CSS provides presentation only. The included JavaScript handles the example dialog; application-specific form validation, persistence, routing and server actions remain the adopting project's responsibility.

## Typography and licensing

No font binary is bundled or loaded. The starter uses system font stacks; handwriting fallbacks are optional and vary by device. Do not claim a font is deployed unless the target project adds and verifies an appropriately licensed font file.

The visual direction is adapted from [kevintngo/looseleaf](https://github.com/kevintngo/looseleaf). The upstream repository declares MIT for its source and art; its README identifies IBM Plex Mono as SIL OFL 1.1. This pack does not copy upstream code, font binaries or image assets. Retain upstream attribution when redistributing substantial adapted portions.
