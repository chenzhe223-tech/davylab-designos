import test from "node:test";
import assert from "node:assert/strict";
import { inspectHtml } from "../scripts/document-layout-qa.mjs";

test("reports conflicting explicit alignment within a column", () => {
  const html = '<table><tr><th>Item</th><th>Amount</th></tr><tr><td>Rollout</td><td style="text-align:right">120</td></tr><tr><td>Props</td><td style="text-align:left">30</td></tr></table>';
  const report = inspectHtml(html, "sample.html");
  assert.ok(report.issues.some(issue => issue.code === "MIXED_COLUMN_ALIGNMENT"));
  assert.ok(report.issues.some(issue => issue.code === "NUMERIC_COLUMN_LEFT_ALIGNED"));
});

test("accepts consistent text and numeric columns", () => {
  const html = '<table><tr><th style="text-align:left">Item</th><th style="text-align:right">EUR</th></tr><tr><td style="text-align:left">Rollout</td><td style="text-align:right">€1,200.00</td></tr><tr><td style="text-align:left">Props</td><td style="text-align:right">€300.00</td></tr></table>';
  const report = inspectHtml(html);
  assert.equal(report.issues.filter(issue => issue.severity === "major").length, 0);
  assert.equal(report.issues.filter(issue => issue.code === "NUMERIC_COLUMN_LEFT_ALIGNED").length, 0);
});

test("flags empty rows and missing semantic headers", () => {
  const report = inspectHtml("<table><tr><td> </td><td></td></tr><tr><td>Label</td><td>Value</td></tr></table>");
  assert.ok(report.issues.some(issue => issue.code === "EMPTY_TABLE_ROW"));
  assert.ok(report.issues.some(issue => issue.code === "NO_SEMANTIC_HEADER"));
});

test("handles input without tables without throwing", () => {
  const report = inspectHtml("<main><p>hello</p></main>");
  assert.equal(report.tablesDetected, 0);
  assert.ok(report.issues.some(issue => issue.code === "NO_TABLES_FOUND"));
});
