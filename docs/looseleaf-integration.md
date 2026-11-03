# Looseleaf Paper Style Pack

This folder contains the reusable CSS layer for the optional Looseleaf Paper profile in DAVYLAB DesignOS.

## Files

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
- `.ll-ink-button` — hand-drawn-style primary button.
- `.ll-ink-input` — paper input control.
- `.ll-sticker` — restrained sticker/tag accent.
- `.ll-ink-divider` — dashed ink divider.

These are CSS primitives, not React components. They do not require React, Tailwind, Radix, a build plugin or a JavaScript runtime. Use semantic HTML controls and keep visible focus. Check text contrast and touch target sizing in the target application before shipping.

## Typography and licensing

The current pack does not bundle or load a font binary. It uses system font stacks and optional system handwriting fallbacks; actual font availability varies by device. Do not describe a handwritten font as deployed unless the target project adds and verifies an appropriately licensed font file.

The visual direction is adapted from [kevintngo/looseleaf](https://github.com/kevintngo/looseleaf). The upstream repository declares MIT for its source and art; its README identifies IBM Plex Mono as SIL OFL 1.1. This pack does not copy upstream code, font binaries or image assets. Retain upstream attribution when redistributing substantial adapted portions of upstream material.
