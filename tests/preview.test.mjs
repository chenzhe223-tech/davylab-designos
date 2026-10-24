import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script, runInNewContext } from "node:vm";

const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");

test("preview contains the DesignOS entry point and accessible landmarks", () => {
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>DAVYLAB DesignOS/);
  assert.match(html, /<main class="panel main">/);
  assert.match(html, /aria-label="搜索设计档案"/);
});

test("all four documented visual profiles are present", () => {
  for (const id of ["balanced-saas", "analytics-dashboard", "warm-editorial", "dashboard-studio"]) {
    assert.ok(html.includes('"id":"' + id + '"'), "missing profile " + id);
  }
  assert.match(html, /"protected":true/);
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
    assert.ok(html.includes('id:"' + agent + '"'), "missing agent " + agent);
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

test("mobile quick-action dock exposes preview, phone view, and Agent prompt actions", () => {
  assert.match(html, /class="mobile-action-dock"/);
  assert.match(html, /id="mobilePreview"/);
  assert.match(html, /id="mobileDevice"/);
  assert.match(html, /id="mobilePrompt"/);
  assert.match(html, /\$\("mobilePreview"\)\.addEventListener\("click"/);
  assert.match(html, /\$\("mobileDevice"\)\.addEventListener\("click"/);
  assert.match(html, /\$\("mobilePrompt"\)\.addEventListener\("click",openPrompt\)/);
});

test("intent-led search provides synonym matching and explainable recommendations", () => {
  const profileStart = html.indexOf("const profiles=[");
  const agentsStart = html.indexOf("const agents=[", profileStart);
  const searchStart = html.indexOf("const searchTaxonomy=");
  const renderStart = html.indexOf("function render(){", searchStart);
  assert.ok(profileStart >= 0 && agentsStart > profileStart, "profile data exists");
  assert.ok(searchStart >= 0 && renderStart > searchStart, "search engine exists");
  const profileBlock = html.slice(profileStart, agentsStart);
  const searchBlock = html.slice(searchStart, renderStart);
  const sandbox = {};
  runInNewContext(profileBlock + searchBlock + "globalThis.__searchTest={profiles,getRankedProfiles,scoreProfile,searchTaxonomy};", sandbox);
  const ranked = query => sandbox.__searchTest.getRankedProfiles(query).filter(item => item.score > 0);
  assert.ok(ranked("科技感").some(item => item.profile.id === "analytics-dashboard" || item.profile.id === "balanced-saas"), "technology query finds relevant profiles");
  const complex = ranked("高级、有科技感、适合手机的 AI 数据看板");
  assert.equal(complex[0].profile.id, "analytics-dashboard", "compound dashboard query ranks analytics first");
  assert.ok(complex[0].reasons.length > 0, "recommendation includes explanation");
  assert.ok(ranked("温暖品牌官网").some(item => item.profile.id === "warm-editorial"), "warm brand-site query finds editorial profile");
  assert.ok(!ranked("手机数据看板").some(item => item.profile.id === "dashboard-studio"), "read-only audit profile is excluded from ordinary recommendations");
  assert.ok(ranked("现有项目规则对照审查").some(item => item.profile.id === "dashboard-studio"), "read-only profile remains discoverable for explicit audit intent");
});

test("preview has an explicit confirmation step before Agent prompt generation", () => {
  assert.match(html, /id="confirmDesign"/);
  assert.match(html, /确认方案并继续/);
  assert.match(html, /\$\("confirmDesign"\)\.addEventListener\("click"/);
  assert.match(html, /function buildPrompt\(\)\{const chosen=\[activeProfile,/);
});

test("intent discovery UI includes natural-language examples, shortcut chips, and no-result recovery", () => {
  assert.match(html, /id="intentInput"/);
  assert.match(html, /id="matchIntent"/);
  assert.match(html, /data-intent="科技感"/);
  assert.match(html, /data-intent="移动端优先"/);
  assert.match(html, /id="browseAll"/);
  assert.match(html, /没有找到直接匹配的档案/);
  assert.match(html, /id="clearSearch"/);
});

test("responsive layout covers tablet and mobile breakpoints", () => {
  assert.match(html, /@media\(max-width:900px\)/);
  assert.match(html, /@media\(max-width:560px\)/);
  assert.match(html, /env\(safe-area-inset-bottom\)/);
});

test("inline application JavaScript parses without syntax errors", () => {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, "inline application script exists");
  assert.doesNotThrow(() => new Script(match[1]), "inline application script should parse");
});

test("mobile keyboard handling hides the fixed dock and keeps focused fields in view", () => {
  assert.match(html, /body\.keyboard-open \.mobile-action-dock\{display:none!important\}/);
  assert.match(html, /function syncKeyboardState\(\)/);
  assert.match(html, /visualViewport\.addEventListener\("resize"/);
  assert.match(html, /focused\.scrollIntoView\(\{block:"center"/);
  assert.match(html, /orientationchange/);
});

test("workflow step indicators respond to navigation and project brief editing", () => {
  assert.match(html, /function setStep\(n\)/);
  assert.match(html, /setStep\(3\)/);
  assert.match(html, /setStep\(4\)/);
  assert.match(html, /data-step="4"><b>4<\/b><span>生成 Agent 指令<\/span>/);
});
