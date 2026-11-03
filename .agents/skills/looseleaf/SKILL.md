---
name: davylab-looseleaf-adapter
description: Use Looseleaf as an optional hand-drawn paper-style React component and block source when designing a compatible React application or visual prototype inside DAVYLAB DesignOS. Never apply its global theme or replace existing DAVYLAB profiles without explicit project-level selection.
---

# DAVYLAB Looseleaf Adapter

## Purpose
Use the upstream Looseleaf library as an optional component and visual-style capability. Looseleaf is not a generic page-layout engine and is not a drop-in runtime dependency for the current static HTML DesignOS shell.

## Upstream
- Repository: https://github.com/kevintngo/looseleaf
- Documentation and registry: https://kevintngo.github.io/looseleaf/
- Registry pattern: https://kevintngo.github.io/looseleaf/r/{name}.json
- License: MIT for Looseleaf code, art and Kevin Sans; IBM Plex Mono is SIL OFL 1.1.
- Upstream package metadata observed: 0.1.0; React 19, Tailwind CSS v4, Radix UI and shadcn registry.

## When to use
- The user explicitly selects a hand-drawn, paper, notebook, sketch or playful editorial visual direction.
- A React-based project can support Tailwind CSS v4 and the upstream component requirements.
- A component or block from the upstream registry materially improves the target interface.

Do not use Looseleaf as the default visual language for enterprise dashboards, procurement systems, financial workflows or existing DAVYLAB layouts unless the brief calls for that aesthetic.

## Integration workflow
1. Inspect the target project's framework, React version, Tailwind version, shadcn configuration and existing design tokens.
2. Select only the required component or block from the registry; do not install the umbrella style by default.
3. Review every transitive registry dependency and preserve its license notices.
4. Map Looseleaf tokens into a namespaced theme (for example, `--ll-*`) and a project-level theme adapter.
5. Never overwrite DAVYLAB Core semantic tokens globally. Theme switching must be explicit, reversible and scoped.
6. Keep components as source under the consuming project's component directory; document upstream version and source.
7. Verify keyboard navigation, visible focus, contrast, reduced motion, RTL, mobile behavior and the consuming project's existing tests.

## DesignOS integration boundary
- Register Looseleaf as an optional style/component provider, not as the canonical design system.
- Existing profile IDs, profile inheritance, exports, previews and Dashboard Studio read-only protections remain unchanged.
- The current DesignOS application is a static HTML/CSS/JS application. Do not import React-only Looseleaf components into it directly. First provide a separate React preview/workbench surface or a compatible React host.
- Do not install or fetch components automatically at runtime. Component acquisition must be explicit and version/license reviewed.

## Quality bar
A Looseleaf-based output must look intentionally hand-drawn, not like a standard SaaS screen with random doodles. Use the paper, ink, typography and decorative assets as one coherent system. Keep the interface accessible and the content hierarchy clear.
