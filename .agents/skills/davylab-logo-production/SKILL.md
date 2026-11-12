---
name: davylab-logo-production
description: "Real production workflow for one-sentence brand identity, original editable SVG, faithful previews, export and evidence-based QA."
version: "1.0.0"
owner: "DAVYLAB"
---

# DAVYLAB Logo Production Skill v1

**Purpose:** convert a one-sentence brand need into three genuinely different **model-authored** vector brand identities. A static SVG template, screenshot, LLM description or AI visual idea alone is not an accepted finished Logo.

## Input contract
- \`request\`: clear natural-language user brief (mandatory, <=1500 characters)
- \`brand\`, \`tagline\`, \`type\`, \`style\`, \`color\`, \`usage\`: optional; leave unknowns as assumptions, never fabricate audience research
- \`provider\`: \`deepseek\` by default, or an explicit approved alternative; choose real provider under Cloudflare Pages Functions, not browser fetch
- \`model\`: \`deepseek-flash\` economical default or \`deepseek-v4-pro\` by user selection, not automatic paid upgrade
- \`mode\`: generate / refine; refining must take the exact current SVG and change request

## Brand strategy
Describe positioning, audience, distinctiveness, memorable promise, brand personality, typography direction, accessible palette and unknowns.
A one-line prompt must produce a useful creative rationale without inventing market or trademark research.

## Art direction and originality
Generate three **structurally distinct** concepts: a custom letter/wordmark, an abstract geometric/symbolic mark, and a distinctive symbol-wordmark lockup.
Unless user constraints override the suggested directions. Avoid generic swooshes, commonplace hexagons, unrelated lightning bolts, cloned monograms and stock icon derivatives. Use purposeful negative space, optical centering, controlled stroke contrast, clear silhouette, balanced spacing.
Typography is a visual craft, not merely inserting arbitrary fonts. Use explicit fallback fonts; do **not** claim font files licensed or paths outlined unless independently verified.

## Machine-readable output
Return a JSON object with \`strategy\` and \`concepts\`. Each concept:
- \`name\`: original short direction name
- \`rationale\`: link brand idea to geometry
- \`construction\`: shape proportions and optical behavior
- \`color\`: semantic use of colors
- \`svg\`: complete editable SVG root with XML namespace and \`viewBox="0 0 600 240"\`

SVG supports built-in path, rect, circle, ellipse, polygon, line, polyline, groups, editable text and tspans. No script, event handler, external URL, raster image, remote font, filter, external fragment, foreignObject or embedded CSS. Use explicit fills/strokes. Never bypass the static validation by turning a logo into an image.

## Render fidelity
The visual stage, all candidate thumbnails, light/dark previews and exported PNG must render from the **same SVG bytes**. Motion Lab is a separate view-only visual effect; it must not modify exported source geometry. Provide transparent PNG at 1200×480 and 24px/32px test images. Their generation does not imply readability approval.

## Revision loop
1. Generate 3 directions with real provider provenance.
2. Choose one concept; keep the SVG editable.
3. User changes brand wordmark, color, font scale, SVG paths or gives semantic AI revision.
4. Generate a new version and visibly update every preview and delivered file.
5. Invalidate previous manual QA attestations when SVG bytes change.
6. Re-run human scoring and release gates. Preserve revision history locally unless cloud storage was actually configured.

## Export contract
\`logo.svg\`, \`logo.png\`, \`concepts/NN.svg\`, \`concepts/NN.png\`, \`preview/light.png\`, \`preview/dark.png\`, \`preview/24px.png\`, \`preview/32px.png\`, \`brand-strategy.json\`, \`brand-guide.md\`, \`agent-brief.md\`, \`motion-preview.json\`, \`qa-report.json\`, \`manifest.json\`. Every asset except manifest is SHA256 indexed in the manifest; no phantom files.

## Quality gates — fail closed
Score brand fit 20, originality 20, legibility 15, geometry 15, versatility 15, typography 10, production 5.
Score >=90 **and** independent, user-attested checks: trademark conflict search and evidence, font license, real 24/32px readability, originality review, visual/render fidelity.
Static SVG validity is **not** trademark clearance or an intellectual property warranty.
The model-generated design is a **candidate** until human review. Do not set productionReady true automatically.

## Privacy, security and costs
Do not commit API Key. Use Cloudflare \`DEEPSEEK_API_KEY\` server Secret only with \`LOGO_STUDIO_ACCESS_TOKEN\`. BYOK is held in input memory and sent only via same-origin endpoint. No default charge-generating model call, no unattended paid inference.
Always test no-key, server token, cross-origin rejection, unsafe SVG, malformed provider output, actual rendered preview and ZIP unzip.
Never claim production deployment or live provider verification from mock tests alone.
