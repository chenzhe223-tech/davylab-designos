# DAVYLAB DesignOS — Isolated React Host

This is a separate React preview surface. It does **not** replace, import into, or mutate the existing static DesignOS shell.

## Runtime

- React / React DOM 19.3.0
- Vite 8.3.1
- Tailwind CSS 4.3.3 with the Vite plugin
- Node.js >= 20.19
- Looseleaf shadcn registry: `https://kevintngo.github.io/looseleaf/r/{name}.json`

## Run locally

```bash
cd workbench-react
npm install
npm run dev
npm run build
```

## Add a reviewed Looseleaf component

The registry is configured in `components.json`. Install components selectively into this sandbox:

```bash
npx shadcn@latest add @looseleaf/button
```

Review the generated source, transitive dependencies, CSS variables and license before promoting any component into a reusable DesignOS provider package. Do not install the umbrella theme globally. Scope provider tokens under a dedicated wrapper and preserve DAVYLAB Core as the default.

## Current status

- [x] Isolated React host scaffold and Tailwind v4 pipeline configuration.
- [x] Looseleaf registry endpoint configured.
- [x] Interactive preview controls and responsive layout.
- [ ] Install and compile a real upstream Looseleaf component.
- [ ] Verify generated source, peer dependencies, keyboard behavior and reduced motion.
- [ ] Integrate a Stageshow scene in a separate provider-scoped module.
- [ ] Add dedicated browser and visual regression tests.

The preview currently uses native demonstration components; it does not claim that Looseleaf source has been installed yet.
