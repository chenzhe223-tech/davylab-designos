# Document Layout QA Checklist

Use this checklist before handing over any formatted document or table.

## A. Content integrity
- [ ] Source labels, values, units, dates, formulas, and business meanings are preserved.
- [ ] Totals and comparisons reconcile, or discrepancies are clearly flagged rather than silently changed.
- [ ] Any changed wording or value is documented.

## B. Alignment and consistency
- [ ] Text columns use the same alignment rule.
- [ ] Numeric columns use the same alignment rule.
- [ ] Headers align with their corresponding columns.
- [ ] Comparable tables use consistent row order, labels, and column proportions.
- [ ] Vertical alignment is consistent, especially in multi-line rows.

## C. Table geometry
- [ ] Padding and row rhythm are consistent.
- [ ] Column widths fit content and importance.
- [ ] Borders and fills follow one repeatable pattern.
- [ ] No unnecessary merged cells, blank spacer rows, or manual whitespace alignment.
- [ ] Long descriptions wrap naturally and remain readable.

## D. Typography and number formatting
- [ ] Font family, size, weight, and line spacing follow the document hierarchy.
- [ ] Chinese/Latin font fallback does not create visible baseline or size mismatches.
- [ ] Currency, thousands separators, decimal precision, percentages, and negative values are consistent.
- [ ] Emphasis is deliberate and restrained.

## E. Render inspection
- [ ] The final format was rendered to page images or browser screenshots where possible.
- [ ] No clipping, overlap, unexpected page breaks, cut-off borders, or truncated text.
- [ ] The table remains readable at realistic viewing size.
- [ ] Mobile/narrow-width behavior was checked when relevant.
- [ ] Issues found were fixed and the final render rechecked.

## F. Handover
- [ ] Report what was actually inspected and tested.
- [ ] Clearly disclose checks that could not be performed.
- [ ] Include file/repository location and commit/deployment details only when verified.

## Severity
- **Blocker:** value obscured/changed, text clipped, overlap, broken structure, misleading alignment, or important content missing.
- **Major:** inconsistent alignment or spacing within comparable elements, hard-to-read number formatting, broken responsive behavior.
- **Minor:** subtle typography or decorative inconsistency that does not impair scanning.
