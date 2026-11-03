# Looseleaf Paper Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 DAVYLAB DesignOS 中新增一个独立、可选择、可预览和可导出的 Looseleaf Paper 视觉档案。

**Architecture:** 继续使用 `profiles/index.json` 作为 canonical source；build 时注入运行时 profiles。预览仅通过原生 HTML/CSS 和严格的 profile ID 作用域实现，不引入 React/Tailwind/Radix，不改变现有交互状态结构。

**Tech Stack:** Node.js 20+, 静态 HTML/CSS/JavaScript, Node test runner, Playwright。

**Spec:** `docs/superpowers/specs/2026-11-03-looseleaf-style-pack-design.md`

## Global Constraints

- 只修改 `chenzhe223-tech/davylab-designos` 仓库的 feature branch。
- `profiles/index.json` 是唯一 canonical profile registry。
- 不增加 runtime dependencies；不迁移 React 或 CSS 框架。
- 新 profile ID 固定为 `davylab-looseleaf`，运行时 ID 固定为 `looseleaf-paper`。
- 不改变既有 profile IDs、默认选中值、收藏存储 key、导出 schema。
- Dashboard Studio audit profile 保持只读；不触碰外部 Dashboard Studio / Graphify Studio。
- 不复制 Looseleaf 源码、字体或图像资产；注明 MIT 源码许可与 IBM Plex Mono OFL 字体边界。
- 示例数据必须继续明确标注为示例数据。

## Review Focus

- canonical profile 缺字段、重复 ID、错误继承：由规则校验和 profile 测试覆盖。
- 收藏/默认选择因 profile 数量增加而改变：由 E2E 默认选择与旧档案回归覆盖。
- Looseleaf CSS 泄漏到其他 profile：由 CSS 作用域测试和 E2E 对比检查覆盖。
- 移动端手绘装饰导致溢出：由 390px E2E viewport overflow 断言覆盖。
- Agent prompt/JSON 丢失档案规则：由预览测试对 buildPrompt/profile registry 的检查覆盖。

---

### Task 1: Add canonical Looseleaf profile and validation tests

**Files:**
- Modify: `profiles/index.json`
- Modify: `tests/preview.test.mjs`
- Test: `scripts/validate-rules.mjs`

**Interfaces:**
- Produces profile ID `davylab-looseleaf`, presentation ID `looseleaf-paper`; inherits `davylab-default`.
- Runtime renderer receives merged tokens, rules, tags, aliases, presentation and provenance via existing build pipeline.

- [ ] Add failing tests asserting the canonical profile exists, has the stable IDs, inherits the default, and records MIT/upstream provenance without claiming validated status.
- [ ] Run `npm run validate:rules && node --test tests/preview.test.mjs`; confirm the new profile assertions fail before implementation.
- [ ] Add profile with paper canvas `#F7F1E5`, surface `#FFFCF4`, ink `#282923`, muted `#716E63`, border `#D8CFBD`, accent `#426B50`, secondary accent `#B96E45`; define typography, spacing, radius and responsive tokens.
- [ ] Add explicit rules for hand-drawn linework, restrained stickers, readable hierarchy, focus, reduced motion, contrast and mobile stacking.
- [ ] Run rule validation and focused tests; expect all pass.

### Task 2: Add profile-specific thumbnail and live preview

**Files:**
- Modify: `index.html`
- Modify: `tests/preview.test.mjs`

**Interfaces:**
- Keep `previewThumb(profile)` and `renderPreview(id)` signatures.
- Scope all new CSS to `[data-profile="looseleaf-paper"]` or a class explicitly added only for this profile.

- [ ] Add failing tests asserting Looseleaf thumbnail markup includes paper/ink identity and that live preview includes a profile-specific preview state.
- [ ] Run focused tests and confirm RED.
- [ ] Add a dedicated Looseleaf thumbnail composition with notebook/paper surface and a small stamp/hand-drawn accent; retain semantic labels and escaped profile content.
- [ ] Add scoped CSS for warm paper texture, ink outlines, low-radius paper panels, restrained stamp/sticker accents, and visible focus; no global CSS overrides.
- [ ] Extend live preview rendering with a Looseleaf-specific heading/description and class/data attribute. Preserve the existing DOM IDs used by other features.
- [ ] Run focused tests; expect GREEN.

### Task 3: Ensure comparison, exports and agent prompt carry complete rules

**Files:**
- Modify: `tests/preview.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Reuse existing `showDetail(id)`, `showCompare()`, `buildPrompt()`, and JSON export path.
- Do not introduce a parallel export schema.

- [ ] Add failing assertions for Looseleaf rules in detail rendering and Agent prompt generation.
- [ ] Run focused tests and confirm RED.
- [ ] Add profile-specific source/evidence and rule details to the canonical record; rely on existing generic detail/compare/prompt/export functions.
- [ ] If preview-specific requirements are absent from prompt, add a short profile-specific implementation note in the record's rules and presentation metadata rather than branching export code.
- [ ] Run focused tests; expect GREEN.

### Task 4: Regression, responsive E2E and documentation

**Files:**
- Modify: `tests/e2e/designos.spec.mjs`
- Modify: `README.md`\n- Create: `docs/looseleaf-integration.md`

- [ ] Update selectable profile count assertions from 5 to 6.
- [ ] Add E2E assertions for Looseleaf card, selection, preview data-profile, mobile viewport width, compare inclusion and prompt content.
- [ ] Run `npm run validate:rules`, `npm test`, `npm run build`.
- [ ] Run Playwright E2E at 1440px, 1024px and 390px when the repository's configured browser tooling is available; record unavailable checks honestly.
- [ ] Update README profile list and upstream provenance/license notes.
- [ ] Review all diffs and confirm no files outside the approved repository/scope were changed.
- [ ] Commit feature branch changes with descriptive messages. Do not merge or deploy without separate authorization and successful CI/HTTP verification.
