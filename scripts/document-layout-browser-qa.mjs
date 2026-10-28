#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const target = args.find(a => !a.startsWith("--"));
const outArg = args.indexOf("--out");
const outDir = outArg >= 0 ? path.resolve(args[outArg + 1] || "") : path.join(os.tmpdir(), "davylab-layout-qa");
if (!target) {
  console.error("Usage: npm run qa:layout:browser -- <file.html> [--out <directory>]");
  process.exit(2);
}
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright is not installed. Install @playwright/test and Chromium, then rerun this command.");
  process.exit(2);
}
const file = path.resolve(target);
if (!fs.existsSync(file)) {
  console.error("Input file not found: " + file);
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 }
  ]) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(file).href);
    await page.screenshot({ path: path.join(outDir, path.basename(file, path.extname(file)) + "-" + viewport.name + ".png"), fullPage: true });
    const report = await page.evaluate(() => {
      const tables = [...document.querySelectorAll("table")];
      const issues = [];
      const docWidth = document.documentElement.scrollWidth;
      if (docWidth > window.innerWidth + 1) issues.push({ severity: "major", code: "DOCUMENT_HORIZONTAL_OVERFLOW", message: "Document scroll width " + docWidth + " exceeds viewport width " + window.innerWidth + "." });
      tables.forEach((table, ti) => {
        const rows = [...table.querySelectorAll("tr")];
        const cellCounts = rows.map(row => row.querySelectorAll(":scope > th, :scope > td").length);
        if (new Set(cellCounts).size > 1) issues.push({ severity: "warning", code: "INCONSISTENT_ROW_CELL_COUNTS", message: "Table " + (ti + 1) + " has rows with different direct cell counts; inspect intentional spans." });
        const cellsByCol = [];
        rows.forEach(row => [...row.querySelectorAll(":scope > th, :scope > td")].forEach((cell, ci) => {
          (cellsByCol[ci] ||= []).push({ cell, style: getComputedStyle(cell), text: (cell.innerText || "").trim() });
          if (cell.scrollWidth > cell.clientWidth + 2 && getComputedStyle(cell).overflowX !== "visible") {
            issues.push({ severity: "warning", code: "CELL_HORIZONTAL_CLIP_RISK", message: "Table " + (ti + 1) + " row " + (rows.indexOf(row) + 1) + " column " + (ci + 1) + " has scrollWidth greater than clientWidth." });
          }
        }));
        cellsByCol.forEach((cells, ci) => {
          const aligns = [...new Set(cells.filter(x => x.text).map(x => x.align))];
          if (aligns.length > 1) issues.push({ severity: "major", code: "COMPUTED_COLUMN_ALIGNMENT_MISMATCH", message: "Table " + (ti + 1) + " column " + (ci + 1) + " has computed alignments: " + aligns.join(", ") + "." });
        });
      });
      return { viewport: { width: innerWidth, height: innerHeight }, document: { scrollWidth: docWidth, clientWidth: document.documentElement.clientWidth }, tables: tables.length, issues };
    });
    results.push({ viewport: viewport.name, ...report });
    await page.close();
  }
} finally {
  await browser.close();
}
const report = { tool: "DAVYLAB Document Layout Browser QA", version: "0.1.0", file, outputDirectory: outDir, screenshots: fs.readdirSync(outDir).filter(n => n.endsWith(".png")), results };
console.log(JSON.stringify(report, null, 2));
if (results.some(r => r.issues.some(i => i.severity === "major"))) process.exitCode = 1;
