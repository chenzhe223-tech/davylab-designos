import tempfile
import unittest
from pathlib import Path

import fitz

from scripts.document_layout_pdf_qa import inspect_pdf


class PDFLayoutQATest(unittest.TestCase):
    def make_pdf(self, mixed_sizes=False, text=True):
        temp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        temp.close()
        path = Path(temp.name)
        doc = fitz.open()
        page = doc.new_page(width=595, height=842)
        if text:
            page.insert_text((72, 72), "Procurement cost summary", fontsize=12)
            page.insert_text((72, 110), "Total investment: EUR 494,569.00", fontsize=10)
        if mixed_sizes:
            second = doc.new_page(width=420, height=595)
            if text:
                second.insert_text((40, 40), "Appendix", fontsize=11)
        doc.save(path)
        doc.close()
        return path

    def test_renders_pages_and_writes_json_report(self):
        path = self.make_pdf()
        out = Path(tempfile.mkdtemp())
        try:
            report = inspect_pdf(path, out, dpi=72)
            self.assertEqual(report["pages"], 1)
            self.assertTrue((out / "pdf-layout-qa-report.json").exists())
            self.assertTrue((out / "tmp-page-001.png").exists() or list(out.glob("*-page-001.png")))
            self.assertEqual(report["page_details"][0]["render_width_px"], 595)
        finally:
            path.unlink(missing_ok=True)

    def test_flags_inconsistent_page_sizes(self):
        path = self.make_pdf(mixed_sizes=True)
        try:
            report = inspect_pdf(path, Path(tempfile.mkdtemp()), dpi=72)
            self.assertIn("INCONSISTENT_PAGE_SIZES", {i["code"] for i in report["issues"]})
        finally:
            path.unlink(missing_ok=True)

    def test_flags_page_without_extractable_text(self):
        path = self.make_pdf(text=False)
        try:
            report = inspect_pdf(path, Path(tempfile.mkdtemp()), dpi=72)
            self.assertIn("PAGE_WITHOUT_EXTRACTABLE_TEXT", {i["code"] for i in report["issues"]})
        finally:
            path.unlink(missing_ok=True)


if __name__ == "__main__":
    unittest.main()
