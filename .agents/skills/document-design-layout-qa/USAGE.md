# Document Layout QA — Usage Guide

## Current capability
The initial automated checker is a dependency-free Node.js static heuristic for HTML tables. It can flag likely inconsistent explicit alignment, numeric-looking cells that are left-aligned, empty rows, likely manual spacing, non-wrapping cells, and missing semantic headers.

It does not run a browser, measure actual cell widths, reliably detect visual clipping, or certify aesthetics. The companion browser runner uses Playwright at desktop and mobile widths, saves screenshots, and flags horizontal overflow and computed column-alignment mismatches. These are still heuristics: screenshots must be visually reviewed, and Office/PDF renderers need separate adapters.

## Run
From the repository root (Node.js 20+):

```sh
npm run qa:layout -- ./path/to/report.html
npm run qa:layout -- ./path/to/report.html --json
npm run qa:layout:browser -- tests/fixtures/document-layout-sample.html --out ./artifacts/layout-qa
npm test
```

Exit codes:
- `0`: no major issues detected (warnings may remain).
- `1`: at least one major issue detected.
- `2`: missing argument or file-read error.

## Recommended workflow
1. Preserve the original artifact.
2. Run the static checker.
3. Fix source styles/components rather than inserting spaces.
4. Render the final output in its target environment.
5. Inspect desktop and narrow/mobile layouts as relevant.
6. Re-run the checker and visually inspect again.
7. Report static checks and visual checks separately.

## Browser runner

The browser runner requires Playwright and an installed Chromium browser. It writes desktop/mobile screenshots and a JSON report to the selected output directory. In CI, screenshots are uploaded as the `document-layout-qa` artifact for inspection.

## Future format adapters
HTML static lint and browser inspection; Excel workbook styles/number formats/widths/print settings; Word/PDF styles and rendered pages; PowerPoint slide geometry and rendered slides. These adapters must be implemented and tested before being described as automated support.
