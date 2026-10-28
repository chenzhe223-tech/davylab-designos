# Document Design System — V1.0

This is a conservative default system. An existing user-approved template takes precedence unless the user requests a redesign.

## 1. Alignment matrix

| Content type | Default horizontal alignment | Default vertical alignment |
|---|---|---|
| Row labels, names, descriptive text | Left | Top for multiline; otherwise middle if consistent |
| Long notes and explanations | Left | Top |
| Currency, numeric amounts, quantities | Right | Middle or top consistently within the table |
| Percentages, rates, ratios | Right | Consistent with numeric column |
| Dates and IDs | Consistent within their column; usually left for identifiers, right or centered only if a deliberate convention exists | Consistent |
| Status labels | Left or centered as a deliberate component; never vary randomly | Middle |
| Column headings | Match the data type of the column below | Middle |
| Totals and key figures | Preserve the alignment of their data type; emphasize with weight/fill/border | Consistent |

Do not center all cells as a shortcut. Do not use spaces or tabs to imitate alignment.

## 2. Spacing and geometry

Use these as starting values, not universal laws; adapt to the output format and density.

- Compact business table: cell padding around 8–12 px vertically and 10–14 px horizontally in HTML; equivalent consistent padding in Office formats.
- Comfortable report table: around 10–14 px vertically and 12–16 px horizontally.
- Body line-height: about 1.35–1.55 for web and HTML documents; use equivalent consistent paragraph line spacing in Office.
- Keep heading-to-table spacing consistent across sections.
- Use one row-height strategy per table: content-driven height with consistent padding is preferred over forcing every row to the same fixed height when wrapping differs.
- Use top vertical alignment for rows with multi-line explanatory text to prevent inconsistent visual centering.
- Use one border system per document: subtle internal dividers, clear header boundary, and stronger separation only for totals or section breaks.
- Avoid empty spacer rows inside data tables. Use section spacing outside the table instead.

## 3. Typography hierarchy

Use a small, repeatable scale:
- Page/report title: clearly largest.
- Section title: one level below page title.
- Table header: medium emphasis, semibold/bold.
- Body cells: consistent regular weight.
- Total/decision row: semibold/bold; avoid bolding arbitrary individual values.
- Footnotes and provenance: smaller but still comfortably readable.

Do not mix multiple unrelated font families without a clear reason. Prefer fonts with complete glyph coverage for the language used. Chinese-English mixed documents must be checked for fallback-font differences.

## 4. Numeric formatting

- Keep the underlying value numeric wherever the format supports numeric values.
- Use thousands separators consistently.
- Within a comparable column, use the same decimal precision unless source data or accounting policy explicitly requires a different precision.
- Apply currency symbols and currency codes consistently. Avoid switching unpredictably between formats such as €494,569, 494,569 EUR, and €494,569.00 in the same comparable column.
- Keep negative amounts, zero values, percentages, and missing values visually distinguishable according to one documented convention.
- Do not add or remove decimal places if it could change the apparent precision or meaning.
- Align decimal points where supported by the format; otherwise right-align the numeric column and use tabular numerals when available.

## 5. Color and emphasis

- Use restrained color: one primary header treatment, neutral body background, subtle alternating row fill only if it improves tracking, and a deliberate total/exception treatment.
- Use color with labels, icons, or text to communicate meaning; never rely on color alone.
- Keep text contrast accessible.
- Avoid applying bold, underline, color, and fill simultaneously to ordinary cells.
- A highlighted total row should be styled consistently across related tables.

## 6. Column-width strategy

- Assign width based on information priority, not equal width by default.
- Labels need enough width to scan without excessive wrapping.
- Numeric columns should be wide enough for the longest formatted value plus padding.
- Explanatory columns usually receive the most width in business comparison tables.
- Keep equivalent columns at equivalent widths across tables intended to be compared.
- If the table is too wide, prefer concise labels, landscape layout, or a well-structured split over unreadably small type.
- Never truncate a material note or figure without an explicit indication and an accessible way to inspect the full value.

## 7. Table patterns

### Financial summary
1. Item / metric (left)
2. Amount (right)
3. Explanation / basis (left)

Totals should use the same alignment as the amount column, with a stronger but restrained visual distinction.

### Option comparison
- Keep metric labels and row order identical across options.
- Put each alternative in a consistent column.
- Use consistent currency precision and define whether totals include taxes, fees, or sunk costs.
- Add a separate note for assumptions and non-comparable costs.

### Long notes
- Left-align, top-align, wrap text.
- Keep punctuation, spaces, and line breaks natural; do not manually pad text to create columns.

## 8. Preserve existing design

When a supplied screenshot, template, or existing document is the target:
1. Extract its spacing, type hierarchy, colors, borders, and column proportions.
2. Identify which aspects are inconsistent versus intentional.
3. Preserve intentional design decisions.
4. Correct only the inconsistencies requested, unless the user explicitly asks for a redesign.
