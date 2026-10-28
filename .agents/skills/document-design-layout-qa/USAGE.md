# Document Layout QA — Usage Guide

## Current capability
The initial automated checker is a dependency-free Node.js static heuristic for HTML tables. It can flag likely inconsistent explicit alignment, numeric-looking cells that are left-aligned, empty rows, likely manual spacing, non-wrapping cells, and missing semantic headers.

It does not run a browser, measure actual cell widths, reliably detect visual clipping, or certify aesthetics. The companion browser runner uses Playwright at desktop and mobile widths, saves screenshots, and flags horizontal overflow and computed column-alignment mismatches. These are still heuristics: screenshots must be visually reviewed, and Office/PDF renderers need separate adapters.

## Run
From the repository root (Node.js 20+):

```sh
npm run qa:layout -- ./path/to/report.html
npm run qa:layout -- ./path/to/report.html --json
npm run qa:layout:excel -- ./path/to/costs.xlsx --json
npm run qa:layout:word -- ./path/to/report.docx --json
npm run qa:layout:pptx -- ./path/to/deck.pptx --json
npm run qa:layout:pdf -- ./path/to/report.pdf --out ./artifacts/pdf-layout --dpi 120 --json
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

## Install the skill for Codex

From the repository root, first preview the target path:

```sh
npm run install:skill:layout -- --dry-run
```

Install into `$CODEX_HOME/skills/document-design-layout-qa` (or `~/.codex/skills/document-design-layout-qa` when `CODEX_HOME` is unset):

```sh
npm run install:skill:layout
```

The installer refuses to overwrite an existing skill unless `--force` is explicitly provided. After installation, restart or refresh Codex if needed. The repository-local copy under `.agents/skills/` remains available when working in this repository.

## Excel adapter

The Excel adapter uses `openpyxl` to inspect workbook styles and can flag explicitly left-aligned numeric cells, conflicting explicit alignment within a column, mixed number formats among numeric/formula cells, multiline cells without wrapping, and large merged ranges. Install its dependency with `python3 -m pip install -r requirements-layout-qa.txt`.

This adapter does not evaluate formulas, certify business calculations, render print pages, or guarantee there is no visual clipping. Keep numeric values numeric and visually inspect the final workbook or PDF.

## Word DOCX adapter

The Word adapter uses `python-docx` to inspect table-cell paragraph alignment, numeric-looking cells, vertical alignment, width metadata, and named table styles. It can flag conflicting alignment within a column and numeric-looking cells aligned left.

It does not render page layout, verify pagination, or guarantee there is no clipping. For final acceptance, render the DOCX to PDF or page images and inspect page breaks, margins, cell padding, and overflow.

## PowerPoint PPTX adapter

The PowerPoint adapter uses `python-pptx` to check slide-canvas boundaries and table-cell paragraph alignment. It flags shapes that extend beyond the slide and table columns with conflicting explicit alignments.

It does not render slides or reliably detect all text overflow, overlap, or aesthetic issues. Render slides to images and inspect them at presentation size before delivery.

## Browser runner

The browser runner requires Playwright and an installed Chromium browser. It writes desktop/mobile screenshots and a JSON report to the selected output directory. In CI, screenshots are uploaded as the `document-layout-qa` artifact for inspection.

## PDF page-rendering adapter

The PDF adapter uses PyMuPDF to render every page to PNG and write a JSON report. It records page dimensions, rotation, extracted text spans, and rendered pixel dimensions; it flags text spans outside page bounds, text within 4 pt of an edge, very small text, pages without extractable text, and inconsistent page sizes.

Run `python3 -m pip install -r requirements-layout-qa.txt` before using it. The renderer can inspect image-only pages visually through the PNGs, but automatic detection cannot assess image-only content without OCR. These heuristics do not verify business figures or aesthetics; inspect the rendered PNGs manually.

## Future format adapters
Remaining enhancements include OCR-assisted inspection for image-only PDFs, deeper Excel print-layout checks, and full rendered-page review workflows for Office documents.
