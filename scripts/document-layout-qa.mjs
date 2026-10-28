#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const NUMERIC = /^[\s(\[]*[-+]?\s*(?:€|\$|£)?\s*\d[\d,.\s]*(?:%|\s*(?:EUR|USD|GBP))?\s*[)\]]?$/i;
const stripTags = value => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/\s+/g, " ").trim();

function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  return result;
}
function align(tag) {
  const a = attrs(tag);
  return (a.style || "").match(/(?:^|;)\s*text-align\s*:\s*(left|right|center|start|end)\b/i)?.[1]?.toLowerCase() || a.align?.toLowerCase() || "unspecified";
}
function inspectHtml(html, filename = "<input>") {
  const issues = [];
  const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table\s*>/gi)];
  const add = (severity, code, message, table) => issues.push({ severity, code, message, file: filename, ...(table ? { table } : {}) });
  if (!tables.length) add("info", "NO_TABLES_FOUND", "No HTML table detected; this checker audits HTML tables only.");
  tables.forEach((match, offset) => {
    const tableNo = offset + 1;
    const rows = [...match[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)].map(r => r[1]);
    if (!rows.length) { add("warning", "TABLE_WITHOUT_ROWS", "Table has no detectable rows.", tableNo); return; }
    const parsed = rows.map(row => [...row.matchAll(/<(th|td)\b([^>]*)>([\s\S]*?)<\/\s*\1\s*>/gi)].map(cell => {
      const tag = "<" + cell[1] + " " + cell[2] + ">";
      return { type: cell[1].toLowerCase(), tag, attrs: attrs(tag), text: stripTags(cell[3]), align: align(tag) };
    }));
    if (new Set(parsed.map(r => r.length)).size > 1) add("warning", "INCONSISTENT_CELL_COUNT", "Rows have different detected cell counts; inspect colspan/rowspan and table structure.", tableNo);
    const maxCols = Math.max(...parsed.map(r => r.length), 0);
    for (let col = 0; col < maxCols; col++) {
      const cells = parsed.map(row => row[col]).filter(Boolean);
      const body = cells.filter(c => c.type === "td" && c.text);
      const explicit = body.map(c => c.align).filter(a => a !== "unspecified");
      if (new Set(explicit).size > 1) add("major", "MIXED_COLUMN_ALIGNMENT", "Column " + (col + 1) + " has conflicting explicit alignments: " + [...new Set(explicit)].join(", ") + ".", tableNo);
      const numeric = body.some(c => NUMERIC.test(c.text));
      const text = body.some(c => c.text && !NUMERIC.test(c.text));
      if (numeric && explicit.includes("left")) add("warning", "NUMERIC_COLUMN_LEFT_ALIGNED", "Column " + (col + 1) + " contains numeric-looking cells that are explicitly left-aligned.", tableNo);
      if (text && explicit.includes("right") && !numeric) add("info", "TEXT_COLUMN_RIGHT_ALIGNED", "Column " + (col + 1) + " is text-heavy but right-aligned; confirm this is intentional.", tableNo);
    }
    parsed.forEach((row, ri) => {
      if (!row.length || row.every(c => !c.text)) add("warning", "EMPTY_TABLE_ROW", "Row " + (ri + 1) + " appears empty.", tableNo);
      row.forEach((cell, ci) => {
        if (/\s{4,}/.test(cell.text)) add("info", "POSSIBLE_MANUAL_SPACING", "Cell row " + (ri + 1) + ", column " + (ci + 1) + " contains repeated spaces; check for manual alignment.", tableNo);
        if (/\bnowrap\b/i.test(cell.tag) || /white-space\s*:\s*nowrap/i.test(cell.attrs.style || "")) add("info", "NO_WRAP_CELL", "Cell row " + (ri + 1) + ", column " + (ci + 1) + " disables wrapping; check overflow in narrow layouts.", tableNo);
      });
    });
    if (!(parsed[0] || []).some(c => c.type === "th")) add("info", "NO_SEMANTIC_HEADER", "First row has no detected <th> cells.", tableNo);
  });
  const summary = { blocker: 0, major: 0, warning: 0, info: 0 };
  for (const issue of issues) summary[issue.severity] = (summary[issue.severity] || 0) + 1;
  return { tool: "DAVYLAB Document Layout QA", version: "0.1.0", mode: "static-html-heuristic", file: filename, tablesDetected: tables.length, summary, issues };
}
function printReport(report, json) {
  if (json) { console.log(JSON.stringify(report, null, 2)); return; }
  console.log("Document Layout QA — " + report.file);
  console.log("Tables detected: " + report.tablesDetected);
  console.log("Issues: " + report.issues.length + " (major " + report.summary.major + ", warnings " + report.summary.warning + ", info " + report.summary.info + ")");
  for (const issue of report.issues) console.log("[" + issue.severity.toUpperCase() + "] " + issue.code + ": " + issue.message);
  console.log("\nScope: static heuristic only; it cannot measure rendered geometry, clipping, or visual aesthetics.");
}
const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const target = args.find(arg => !arg.startsWith("--"));
  if (!target) { console.error("Usage: node scripts/document-layout-qa.mjs <file.html> [--json]"); process.exitCode = 2; }
  else {
    try {
      const report = inspectHtml(fs.readFileSync(target, "utf8"), target);
      printReport(report, json);
      if (report.issues.some(i => i.severity === "major" || i.severity === "blocker")) process.exitCode = 1;
    } catch (error) { console.error("Unable to inspect file: " + error.message); process.exitCode = 2; }
  }
}
export { inspectHtml };
