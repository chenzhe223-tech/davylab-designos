#!/usr/bin/env python3
"""Render PDF pages and run conservative page-level layout QA heuristics."""
import argparse
import json
import os
import sys
from pathlib import Path

try:
    import fitz
except ImportError:
    print("Missing dependency: install requirements-layout-qa.txt (PyMuPDF).", file=sys.stderr)
    raise SystemExit(2)


def inspect_pdf(filename, output_dir=None, dpi=120):
    path = Path(filename)
    doc = fitz.open(path)
    issues = []
    pages = []
    if output_dir is None:
        output = path.parent / (path.stem + "-layout-qa")
    else:
        output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)

    def add(severity, code, message, page=None):
        item = {"severity": severity, "code": code, "message": message}
        if page is not None:
            item["page"] = page
        issues.append(item)

    dimensions = []
    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)
    for page_index, page in enumerate(doc, start=1):
        rect = page.rect
        width, height = float(rect.width), float(rect.height)
        dimensions.append((round(width, 1), round(height, 1)))
        text_dict = page.get_text("dict")
        spans = []
        chars = 0
        for block in text_dict.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    text = (span.get("text") or "").strip()
                    if not text:
                        continue
                    chars += len(text)
                    x0, y0, x1, y1 = map(float, span["bbox"])
                    spans.append({"text": text, "bbox": [x0, y0, x1, y1], "size": float(span.get("size", 0))})
                    if x0 < -1 or y0 < -1 or x1 > width + 1 or y1 > height + 1:
                        add("major", "TEXT_OUTSIDE_PAGE_BOUNDS",
                            f"Text span {text[:50]!r} extends outside the page rectangle.", page_index)
                    margin = min(x0, y0, width - x1, height - y1)
                    if margin < 4:
                        add("warning", "TEXT_NEAR_PAGE_EDGE",
                            f"Text span {text[:50]!r} is within 4 pt of a page edge; verify intended bleed/margins.", page_index)
                    if 0 < float(span.get("size", 0)) < 5:
                        add("warning", "VERY_SMALL_TEXT",
                            f"Text span {text[:50]!r} uses a font size below 5 pt.", page_index)
        if chars == 0:
            add("warning", "PAGE_WITHOUT_EXTRACTABLE_TEXT",
                "No extractable text found; this may be an intentional image-only page or a blank page.", page_index)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        screenshot = output / f"{path.stem}-page-{page_index:03d}.png"
        pix.save(screenshot)
        pages.append({
            "page": page_index,
            "width_pt": round(width, 2),
            "height_pt": round(height, 2),
            "rotation": int(page.rotation),
            "text_characters": chars,
            "text_spans": len(spans),
            "render": str(screenshot),
            "render_width_px": pix.width,
            "render_height_px": pix.height
        })
    if len(set(dimensions)) > 1:
        add("warning", "INCONSISTENT_PAGE_SIZES",
            "PDF contains pages with different page dimensions; verify this is intentional.")
    doc.close()
    summary = {key: 0 for key in ("blocker", "major", "warning", "info")}
    for issue in issues:
        summary[issue["severity"]] += 1
    report = {
        "tool": "DAVYLAB Document Layout PDF QA",
        "version": "0.1.0",
        "mode": "rendered-page-and-text-bounds-heuristics",
        "file": str(path),
        "pages": len(pages),
        "dpi": dpi,
        "output_directory": str(output),
        "summary": summary,
        "issues": issues,
        "page_details": pages,
        "limitations": [
            "PDF pages are rendered to PNG, but automated issue detection remains heuristic.",
            "Image-only pages cannot be assessed for text alignment without OCR.",
            "The checker does not understand business meaning, formula correctness, or visual aesthetics.",
            "Human review of rendered pages is still required for final acceptance."
        ]
    }
    (output / "pdf-layout-qa-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report


def main():
    parser = argparse.ArgumentParser(description="Render PDF pages and inspect likely layout issues")
    parser.add_argument("file", help="Path to PDF file")
    parser.add_argument("--out", help="Directory for rendered page PNGs and JSON report")
    parser.add_argument("--dpi", type=int, default=120, help="Render resolution (default: 120 DPI)")
    parser.add_argument("--json", action="store_true", help="Print JSON report to stdout")
    args = parser.parse_args()
    if not os.path.isfile(args.file):
        print(f"Input file not found: {args.file}", file=sys.stderr)
        return 2
    if args.dpi < 36 or args.dpi > 600:
        print("DPI must be between 36 and 600.", file=sys.stderr)
        return 2
    try:
        report = inspect_pdf(args.file, args.out, args.dpi)
    except Exception as exc:
        print(f"Unable to inspect PDF: {exc}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f"PDF Layout QA — {report['file']}")
        print(f"Pages: {report['pages']}; issues: {len(report['issues'])}; renders: {report['output_directory']}")
        for issue in report["issues"]:
            page = f" (page {issue['page']})" if "page" in issue else ""
            print(f"[{issue['severity'].upper()}] {issue['code']}{page}: {issue['message']}")
        print("Rendered PNGs and pdf-layout-qa-report.json were written to the output directory.")
        print("Limitations: heuristic detection only; inspect rendered pages for final visual acceptance.")
    return 1 if any(i["severity"] in ("blocker", "major") for i in report["issues"]) else 0


if __name__ == "__main__":
    raise SystemExit(main())
