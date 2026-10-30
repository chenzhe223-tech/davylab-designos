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
  assert.match(html, /const ENGINE_API_BASE="https:\/\/davylab-designos-engine\.onrender\.com"/);
  assert.match(html, /fetch\(ENGINE_API_BASE\+"\/api\/search"/);
  assert.doesNotMatch(html, /fetch\s*\(\s*["']https?:\/\/(?!davylab-designos-engine\.onrender\.com)[^"']+\/api\//i);
  assert.doesNotMatch(html, /https?:\/\/(?!fonts\.googleapis\.com|davylab-designos-engine\.onrender\.com)[\w.-]+\/api\//i);
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
  assert.match(html, /data-step="4"><b>4<\/b><span>交付设计规范<\/span>/);
});

test("profile details and comparison expose evidence status and full design tokens", () => {
  assert.match(html, /function profileEvidenceLabel\(p\)/);
  assert.match(html, /治理状态/);
  assert.match(html, /真实项目已验证/);
  assert.match(html, /Typography|字体/);
  assert.match(html, /间距 \/ 圆角/);
  assert.match(html, /JSON\.stringify\(sp\)/);
});

test("product brief performs live upstream Skill search and clearly labels unavailable-engine fallback", () => {
  assert.match(html, /id="engineEvidence"/);
  assert.match(html, /id="engineStatus"/);
  assert.match(html, /function queryOfficialEngine\(query\)/);
  assert.match(html, /ENGINE_DOMAINS=\[\{id:"product",label:"产品类别映射"\},\{id:"style"/);
  assert.match(html, /\{id:"color",label:"行业配色"\}/);
  assert.match(html, /\{id:"typography",label:"字体配对"\}/);
  assert.match(html, /\{id:"ux",label:"UX 指南"\}/);
  assert.match(html, /引擎暂不可用/);
  assert.match(html, /不会以示例或硬编码结果冒充引擎输出/);
});

test("real design-system generation is an explicit action and labels its output as a pending candidate", () => {
  assert.match(html, /id="generateEngineCandidate"/);
  assert.match(html, /async function generateEngineCandidate\(\)/);
  assert.match(html, /fetch\(ENGINE_API_BASE\+"\/api\/generate"/);
  assert.match(html, /个真实引擎候选/);
  assert.match(html, /待评审/);
  assert.match(html, /下载此方向 JSON/);
});

test("candidate generation uses active styles returned by live Skill search and exports JSON plus Markdown", () => {
  assert.match(html, /function getCandidateDirections\(\)/);
  assert.match(html, /lastEngineSearchResults/);
  assert.match(html, /async function generateEngineCandidate\(\)/);
  assert.match(html, /Promise\.all\(selected\.map/);
  assert.match(html, /下载此方向 JSON/);
  assert.match(html, /下载此方向 Markdown/);
  assert.match(html, /候选尚未完成真实目标应用实现/);
  assert.match(html, /需要复核：引擎将产品归类为 General/);
});

test("candidate cards render a responsive token-driven preview with explicit prototype limitations", () => {
  assert.match(html, /candidate-live-preview/);
  assert.match(html, /candidate-preview-sections/);
  assert.match(html, /candidate-preview-device/);
  assert.match(html, /textContent="桌面"/);
  assert.match(html, /textContent="手机"/);
  assert.match(html, /不是已实现的目标应用/);
  assert.match(html, /不保证 Google Fonts 已加载/);
});

test("candidate decisions support selecting a direction and regenerating from user feedback", () => {
  assert.match(html, /选择此方向/);
  assert.match(html, /已选择/);
  assert.match(html, /id="engineRefineFeedback"/);
  assert.match(html, /按反馈重新生成/);
  assert.match(html, /用户调整要求/);
  assert.match(html, /selectedEngineCandidate/);
});

test("candidate export includes a stack-aware coding Agent implementation brief", () => {
  assert.match(html, /下载 Agent 执行指令/);
  assert.match(html, /DAVYLAB DesignOS — Agent Implementation Brief/);
  assert.match(html, /Target stack/);
  assert.match(html, /Explicit boundary/);
  assert.match(html, /does not mean any Agent has been called/);
});

test("JSON candidate export wraps upstream output in the versioned provenance schema", () => {
  assert.match(html, /function normalizeCandidate\(candidate,entry,index\)/);
  assert.match(html, /schemaVersion:"1\.0\.0"/);
  assert.match(html, /reviewStatus:"not-reviewed"/);
  assert.match(html, /softPreferenceScore:null/);
  assert.match(html, /rawEngineOutput:candidate/);
  assert.match(html, /JSON\.stringify\(normalizeCandidate\(candidate,entry,index\),null,2\)/);
});

test("Markdown export contains implementation, responsive, accessibility, provenance and risk sections", () => {
  assert.match(html, /function buildCandidateMarkdown\(candidate,entry,index\)/);
  assert.match(html, /## Interaction and component states/);
  assert.match(html, /## Responsive rules/);
  assert.match(html, /## Accessibility acceptance/);
  assert.match(html, /## Assumptions and risks/);
  assert.match(html, /## Provenance and review/);
  assert.match(html, /Remaining acceptance checklist/);
});

test("capability explorer searches real upstream records with source/status detail and pagination", () => {
  assert.match(html, /id="skillCatalog"/);
  assert.match(html, /id="skillCatalogDomain"/);
  assert.match(html, /id="skillCatalogSearch"/);
  assert.match(html, /async function openSkillCatalog\(\)/);
  assert.match(html, /async function loadSkillCatalog\(append=false\)/);
  assert.match(html, /SKILL_CATALOG_API/);
  assert.match(html, /sourceRow/);
  assert.match(html, /record\.fields/);
  assert.match(html, /加载更多/);
});

test("candidate review calculates WCAG text contrast and records unknown or failing constraints honestly", () => {
  assert.match(html, /function parseHexColor\(value\)/);
  assert.match(html, /function contrastCheck\(foreground,background,label\)/);
  assert.match(html, /ratio>=4\.5/);
  assert.match(html, /hardConstraints:\[bodyContrast,buttonContrast\]/);
  assert.match(html, /正文对比度：无法自动计算，需人工检查/);
  assert.match(html, /低于 4\.5:1，需调整/);
});

test("contrast calculation returns a WCAG 21:1 ratio for black on white", () => {
  const start = html.indexOf("function parseHexColor(");
  const end = html.indexOf("function normalizeCandidate(", start);
  assert.ok(start >= 0 && end > start, "contrast helpers are present");
  const sandbox = {};
  runInNewContext(html.slice(start, end) + "globalThis.__contrast={contrastCheck};", sandbox);
  const result = sandbox.__contrast.contrastCheck("#000000", "#ffffff", "body");
  assert.equal(result.ratio, 21);
  assert.equal(result.passed, true);
  const low = sandbox.__contrast.contrastCheck("#777777", "#ffffff", "body");
  assert.equal(low.passed, false);
});

test("normalized candidate carries UX rules and provenance from live Skill search results", () => {
  assert.match(html, /const uxSearch=lastEngineSearchResults\.find/);
  assert.match(html, /evidenceId:"live-ux-search"/);
  assert.match(html, /lastEngineSearchResults\.flatMap/);
  assert.match(html, /domain:item\.id/);
  assert.match(html, /upstream CLI search output \(source path not exposed\)/);
});

test("Visual DNA Motion Lab is integrated into candidate generation, previews and exports", () => {
  assert.match(html, /assets\/davylab-motion\.js/);
  assert.match(html, /assets\/designos-motion-lab\.js/);
  assert.match(html, /assets\/designos-motion-lab\.css/);
  assert.match(html, /DesignOSMotionLab\.mount\(host\)/);
  assert.match(html, /motion:window\.DesignOSMotionLab\?\.getConfig\(\)/);
  assert.match(html, /window\.DesignOSMotionLab\.getMarkdown\(\)/);
  assert.match(html, /## Design system/);
});

test("Markdown export can append the selected Motion Lab specification", () => {
  assert.match(html, /let lines=\["# "\+d\.name/);
  assert.match(html, /lines\+="\\n\\n"\+window\.DesignOSMotionLab\.getMarkdown\(\)/);
});
