# Looseleaf Paper Starter

Copy this folder into a static web project and open `index.html` through a local/static server.

## Files
- `index.html`: semantic, responsive starter page and interaction demo.
- `looseleaf-tokens.css`: editable scoped CSS custom properties.
- `looseleaf.css`: reusable visual primitives, focus states and reduced-motion rules.
- `looseleaf.js`: accessible demo dialog and local-only form feedback.

## Install
Keep the three asset files beside `index.html`. The page loads CSS in this order: tokens first, components second. No npm package, framework, external font, API or backend is required.

## Customize
Override the `--ll-*` custom properties on `.ll-theme` in your own stylesheet. Use semantic HTML and retain visible focus states. Buttons and inputs target at least 44px. The demo form does not submit data; replace its handler with your own application logic.

No font binary is included. The page uses system font stacks. Verify contrast, responsive behavior and accessibility in the target application before production use.
