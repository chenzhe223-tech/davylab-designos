import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("preview contains the DesignOS entry point and accessible landmarks", () => {
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>DAVYLAB DesignOS/);
  assert.match(html, /<main class="panel main">/);
  assert.match(html, /aria-label="搜索设计档案"/);
});

test("all four documented profiles are present", () => {
  for (const id of ["balanced-saas", "analytics-dashboard", "warm-editorial", "dashboard-studio"]) {
    assert.ok(html.includes('id:"' + id + '"'), "missing profile " + id);
  }
  assert.match(html, /protected:true/);
});

test("profile filtering, compare, and JSON export are wired", () => {
  assert.match(html, /addEventListener\("input",render\)/);
  assert.match(html, /showCompare\(\)/);
  assert.match(html, /designos-profiles\.json/);
  assert.match(html, /designos-selected-profiles\.json/);
});

test("responsive layout covers mobile and desktop breakpoints", () => {
  assert.match(html, /@media\(max-width:850px\)/);
  assert.match(html, /@media\(max-width:420px\)/);
});

test("preview does not include remote API calls or secret-like values", () => {
  assert.doesNotMatch(html, /fetch\s*\(/);
  assert.doesNotMatch(html, /https?:\/\/(?!fonts\.googleapis\.com)[\w.-]+\/api\//i);
  assert.doesNotMatch(html, /(?:sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,})/);
});
