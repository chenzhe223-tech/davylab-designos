# Looseleaf Paper Style Pack

This folder contains the reusable CSS layer for the optional Looseleaf Paper profile in DAVYLAB DesignOS.

## Interactive showcase

Open `examples/looseleaf-showcase.html` from the repository, the built site's `/examples/looseleaf-showcase.html`, or the isolated review preview at https://looseleaf-preview.davylab-designos.pages.dev/examples/looseleaf-showcase.html after its deployment workflow succeeds. It demonstrates the responsive visual language with sample KPI tiles, navigation, task controls, a quick-add interaction and mobile layout. All data is illustrative and all interactions are local to the page; nothing is persisted or sent to a server.

The component reference is available at `examples/looseleaf-components.html` and `/examples/looseleaf-components.html` in the built site. It demonstrates primary/secondary/danger/disabled buttons, labeled form controls, success/warning/error feedback, task lists, empty states, and a modal dialog with focus entry, Escape dismissal, backdrop dismissal and focus restoration. Its interactions are local-only and explicitly do not submit or persist data. The shared `.ll-ink-button` primitive enforces a 44px minimum target; verify the full layout at desktop, tablet and mobile widths before production use.\n\n## Files

- `looseleaf-tokens.css`: paper, surface, ink, muted, line, accent, terracotta, shadow and radius tokens.
- `looseleaf.css`: DesignOS preview styling plus small reusable CSS primitives.

## Use in another static web project

Copy both files into the target project's public/static assets and load them in this order:

```html
<link rel="stylesheet" href="/assets/looseleaf-tokens.css">
<link rel="stylesheet" href="/assets/looseleaf.css">
```

Available primitives:

- `.ll-paper-surface` — ruled paper texture and warm paper canvas.
- `.ll-paper-card` — ink-outlined paper card.
- `.ll-ink-button` — hand-drawn-style button with a 44px minimum target; apply modifier classes for secondary/danger states in the reference page.
- `.ll-ink-input` — paper input control.
- `.ll-sticker` — restrained sticker/tag accent.
- `.ll-ink-divider` — dashed ink divider.
- `.ll-field` and `.ll-checkline` — labeled form rows and touch-friendly checkboxes.
- `.ll-feedback`, `.ll-feedback--warning`, `.ll-feedback--error` — semantic feedback states.
- `.ll-list` and `.ll-list-item` — structured rows with optional `.ll-list-item__meta`.
- `.ll-empty-state` and `.ll-empty-state__symbol` — explanatory empty state with a clear next action.
- `.ll-dialog-backdrop`, `.ll-dialog`, and `.ll-dialog-actions` — modal presentation primitives; the adopting app must implement focus management, Escape handling, focus restoration and dismissal behavior.

These are CSS primitives, not React components. They do not require React, Tailwind, Radix, a build plugin or a JavaScript runtime. Use semantic HTML controls and keep visible focus. Check text contrast and touch target sizing in the target application before shipping.

## Typography and licensing

The current pack does not bundle or load a font binary. It uses system font stacks and optional system handwriting fallbacks; actual font availability varies by device. Do not describe a handwritten font as deployed unless the target project adds and verifies an appropriately licensed font file.

The visual direction is adapted from [kevintngo/looseleaf](https://github.com/kevintngo/looseleaf). The upstream repository declares MIT for its source and art; its README identifies IBM Plex Mono as SIL OFL 1.1. This pack does not copy upstream code, font binaries or image assets. Retain upstream attribution when redistributing substantial adapted portions of upstream material.
