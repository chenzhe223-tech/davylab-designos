import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script } from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("preview contains the DesignOS entry point and accessible landmarks", () => {
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>DAVYLAB DesignOS/);
  assert.match(html, /<main class="panel main">/);
  assert.match(html, /aria-label="搜索设计档案"/);
});

test("all four documented visual profiles are present", () => {
  for (const id of ["balanced-saas", "analytics-dashboard", "warm-editorial", "dashboard-studio"]) {
    assert.ok(html.includes('id:"' + id + '"'), "missing profile " + id);
  }
  assert.match(html, /protected:true/);
});

test("visual preview is a rendered, profile-driven interface with an explicit demo-data disclaimer", () => {
  assert.match(html, /id="livePreview"/);
  assert.match(html, /function renderPreview\(id\)/);
  assert.match(html, /示例数据/);
  assert.match(html, /规则渲染的界面示例/);
  assert.match(html, /data-device="mobile"/);
  assert.match(html, /data-device="desktop"/);
});

test("search, category and device filters plus favorites are wired", () => {
  assert.match(html, /addEventListener\("input",render\)/);
  assert.match(html, /addEventListener\("change",render\)/);
  assert.match(html, /localStorage\.setItem\("designos-favorites"/);
  assert.match(html, /data-compare=/);
});

test("agent prompt generation includes selected profile rules and distinct agent adapters", () => {
  assert.match(html, /function buildPrompt\(\)/);
  assert.match(html, /## 3\. 选定设计档案与来源/);
  assert.match(html, /const agents=\[/);
  for (const agent of ["codex", "claude", "cursor", "copilot", "gemini", "workbuddy", "generic"]) {
    assert.ok(html.includes('id:"' + agent + '"'), "missing agent adapter " + agent);
  }
  assert.match(html, /持续推进所有可自主完成的工作/);
  assert.match(html, /尚未发送给 Agent/);
});

test("JSON export explains its scope and supports selected and all profiles", () => {
  assert.match(html, /下载完整设计规则/);
  assert.match(html, /下载我选择的规则/);
  assert.match(html, /function exportData\(all\)/);
  assert.match(html, /This JSON contains structured design profile rules/);
  assert.match(html, /function openExport\(all\)/);
  assert.match(html, /application\/json/);
});

test("protected project remains read-only and private project data is not fetched", () => {
  assert.match(html, /Dashboard Studio：只读/);
  assert.match(html, /不得自动将其应用(?:于|到)目标项目/);
  assert.doesNotMatch(html, /fetch\s*\(/);
  assert.doesNotMatch(html, /https?:\/\/(?!fonts\.googleapis\.com)[\w.-]+\/api\//i);
  assert.doesNotMatch(html, /(?:sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,})/);
});

test("responsive layout covers tablet and mobile breakpoints", () => {
  assert.match(html, /@media\(max-width:900px\)/);
  assert.match(html, /@media\(max-width:560px\)/);
  assert.match(html, /env\(safe-area-inset-bottom\)/);
});

test("inline application JavaScript parses without syntax errors", () => {
  const match = html.match(/<script>([\\s\\S]*?)<\\/script>/);
  assert.ok(match, "inline application script exists");
  assert.doesNotThrow(() => new Script(match[1]), "inline application script should parse");
});
