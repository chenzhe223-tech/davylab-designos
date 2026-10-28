---
name: document-design-layout-qa
description: Enforce consistent typography, alignment, spacing, table geometry, numeric formatting, and render-based visual QA for business documents, financial tables, Office files, PDFs, Markdown, and web dashboards. Use whenever creating, editing, formatting, or reviewing a document or data table where visual consistency matters.
---

# Document Design & Layout QA

## Mission
Produce business-ready documents and tables that are visually consistent, legible, aligned, and verifiable. Do not interpret "make it professional" as permission to change business meaning, figures, formulas, or source data.

## When to use
Activate this skill when creating, revising, polishing, formatting, comparing, or QA-ing:
- Business or financial tables, procurement cost comparisons, budgets, settlement reviews, and management reports.
- Word, Excel, PowerPoint, PDF, Markdown, HTML, or dashboard outputs.
- AI-generated content that must preserve an existing template or visual system.

## Required workflow
1. **Identify output format and constraints.** Inspect the existing file, template, repo conventions, page size, audience, and destination. Preserve established layout unless the user asks for a redesign.
2. **Separate content from presentation.** Lock source figures, formulas, labels, units, dates, and business meaning before styling. Never silently recalculate or "correct" a figure; flag inconsistencies separately.
3. **Apply the design rules** in [references/design-system.md](references/design-system.md). Use format-specific conventions and keep like elements consistent.
4. **Generate or edit the artifact.** Prefer native structure and styles over manual spaces, repeated tabs, blank rows, or one-off formatting. Use reusable styles, tokens, table components, or named cell formats.
5. **Run structural QA.** Check alignment, number formats, column widths, spacing, text wrapping, overflow, merged cells, headings, and consistency across comparable tables. For HTML tables, run `npm run qa:layout -- path/to/file.html` when the repository checker is available; treat its output as heuristic, not visual proof.
6. **Render the actual output.** When a rendering route exists, render the final artifact to page images or browser screenshots. Inspect at realistic viewing sizes, including a narrow/mobile viewport when relevant. Do not claim visual QA if no render was inspected.
7. **Fix and re-check.** Repair issues, render again, and repeat until checks pass or clearly report the remaining limitation.
8. **Report completion honestly.** Summarize the artifact changed, checks performed, failures/limitations, and where the output can be found. Never claim a file was committed, deployed, tested, or visually verified unless evidence confirms it.

## Non-negotiable layout rules
- Text labels and prose are left-aligned by default.
- Numeric values (money, counts, percentages, rates) are right-aligned by default; use consistent decimal precision and number formatting within comparable columns.
- Column headers align with the content type of their column by default. Do not center every header automatically.
- Align cell content to the top when rows contain multi-line text, unless a deliberate design system specifies otherwise.
- Use consistent table padding, row rhythm, border weight, heading hierarchy, and font scale within the same document.
- Keep like columns the same width where information architecture is comparable. Allocate width according to content priority; give explanatory text sufficient space.
- Avoid manual whitespace alignment, arbitrary blank rows, unnecessary merged cells, and inconsistent one-off formatting.
- Highlight totals and key decisions using a repeatable style (weight, subtle fill, border, or spacing), not random combinations of colors and alignment.
- Ensure contrast and readable font size; never use color as the only signal for financial risk or status.
- Do not make the table "look aligned" by changing source data, hiding precision, truncating labels, or inserting misleading symbols.
- Do not redesign a supplied template unless explicitly asked. Match the existing visual system first.

## Format-specific rules

### Markdown
- Use consistent heading levels, list indentation, table header alignment, currency notation, and blank-line rhythm.
- Markdown tables have limited control over padding and vertical alignment. If precise visual layout is required, recommend or produce HTML, spreadsheet, or PDF instead of pretending Markdown supports pixel-level control.

### HTML and web dashboards
- Use shared design tokens and reusable table components.
- Define column alignment by data type, e.g. text left, numeric right; use tabular numerals for figures where supported.
- Prevent layout shift and overflow; test horizontal scrolling or responsive transformation on narrow screens.
- Inspect browser screenshots at desktop and mobile widths. Do not rely on DOM/CSS inspection alone for visual QA.

### Excel
- Use consistent named styles, number formats, column widths, row heights, wrapping, and vertical alignment.
- Right-align numeric cells and use true numeric values for calculations; do not store numbers as text solely to control appearance.
- Freeze panes and filters only when they improve usability. Avoid excessive merged cells.
- Check print area, page orientation, scaling, repeated header rows, and page breaks if the workbook is intended for printing or PDF export.

### Word and PDF
- Use paragraph and table styles instead of per-paragraph overrides.
- Keep cell padding, paragraph spacing, line spacing, table widths, and page margins consistent.
- Inspect page breaks, split rows, orphan headings, clipped text, footers, and page-number consistency after rendering.
- If PDF is the final output, inspect the PDF render rather than relying solely on the source document.

### PowerPoint
- Establish a grid, consistent margins, type scale, and alignment anchors.
- Keep table cells and text boxes aligned; avoid ad hoc font-size reductions to force content into a slide.
- Check actual slide renders at presentation size and ensure no clipped or overlapping content.

## Financial and business table safeguards
- Preserve all source amounts, signs, units, dates, quantities, and formulas.
- Standardize comparable currency values (for example, EUR with thousands separators and consistent decimal precision) unless the source or business convention requires otherwise.
- Make explicit whether amounts are actual, committed, forecast, paid, remaining, or disputed; do not conflate categories.
- For comparison tables, use identical row order and labels across alternatives where possible.
- Distinguish common costs from option-specific costs and avoid implying a difference where the values are not comparable.
- If totals do not reconcile, flag the arithmetic and explain the exact formula or missing assumption; do not silently amend the source.
- Keep explanatory notes readable and separate from the numeric value where needed.

## QA gate
Before delivery, use [references/qa-checklist.md](references/qa-checklist.md). At minimum, verify:
- [ ] Same data type uses same alignment rule.
- [ ] Same table uses consistent padding, row rhythm, borders, and typography.
- [ ] Numbers, currency symbols, decimal places, and percentages are consistent.
- [ ] No clipping, overlap, accidental truncation, or awkward wrapping.
- [ ] Header-to-column alignment and comparable-table row order are consistent.
- [ ] Content and calculations remain unchanged, or explicitly documented changes are approved.
- [ ] Rendered output was inspected when a render path is available.
- [ ] Any remaining unverified checks are disclosed.

## Available static checker

The repository includes `scripts/document-layout-qa.mjs` for dependency-free HTML table linting, `scripts/document-layout-browser-qa.mjs` for Playwright-based desktop/mobile checks and screenshots,  `scripts/document_layout_excel_qa.py` for static Excel workbook style checks, and `scripts/document_layout_word_qa.py` for static Word DOCX table-style checks, and `scripts/document_layout_pptx_qa.py` for PowerPoint table alignment and slide-boundary checks, and `scripts/document_layout_pdf_qa.py` for PDF page rendering, text bounds, and page consistency. See [USAGE.md](USAGE.md). Both tools are heuristic; browser checks cannot certify aesthetics or replace human screenshot review, and Excel/Word/PowerPoint visual inspection still requires format-specific rendering. PDF pages are rendered to PNG, but the rendered images still require human review. All Python adapters require `requirements-layout-qa.txt`. Do not claim visual acceptance until the rendered output has been inspected.

## Working style
- Prefer small, targeted corrections over wholesale redesign.
- For an existing artifact, first identify inconsistencies, then apply the smallest coherent set of changes.
- Ask a question only when a missing detail blocks safe progress. Otherwise use defaults in the design system and state material assumptions.
- When asked to create an artifact, deliver the artifact or implementation—not only advice.
