# Looseleaf Paper 视觉风格档案设计

**日期：** 2026-11-03  
**目标仓库：** `chenzhe223-tech/davylab-designos`  
**上游参考：** `kevintngo/looseleaf`（只读参考，不修改上游）

## 1. 意图

将 Looseleaf 的纸张、手绘墨线、贴纸与印章式表达转化为 DAVYLAB DesignOS 中一个独立、可选择的视觉风格档案，让用户能够浏览、预览、比较，并把完整规则交给 AI 编程 Agent。它是风格档案，不是把上游 React 组件库整体搬入 DesignOS。

## 2. 已审计的现状

- DesignOS 是 Node 20+、静态 HTML/CSS/原生 JavaScript 项目；`index.html` 是单页入口。
- `profiles/index.json` 是唯一 canonical profile registry；`scripts/build.mjs` 将其转换为运行时 profiles 并注入 HTML。
- `scripts/validate-rules.mjs` 校验 profile 字段、ID、状态、版本、继承关系和循环。
- 页面已有档案卡片、搜索/筛选、收藏、最多四项比较、详情、桌面/移动预览、JSON 导出和 Agent prompt 生成。
- 当前 Playwright E2E 对 5 个档案有固定数量断言；新增档案后必须同步更新。
- Dashboard Studio audit profile 的 `protected` / `layoutPreservation` 语义必须保持只读。

## 3. 目标与非目标

### 目标
1. 新增稳定 ID `looseleaf-paper` / `davylab-looseleaf`，默认不选中、不替换默认档案。
2. 以 Looseleaf 独有的纸感、墨线、手绘边缘、贴纸/印章点缀呈现缩略卡片和实时预览。
3. 在档案详情、比较、JSON 导出与 Agent prompt 中完整保留该档案 Token、原则、响应式和无障碍规则。
4. 保留现有静态 HTML/CSS/JS 架构，不增加 React、Tailwind、Radix 或运行时依赖。
5. 在 1440px、1024px、390px 视口下检查预览，确保移动端无横向溢出。
6. 在来源与证据中清楚标记为基于上游参考改编、尚未在真实业务项目验证的档案。

### 非目标
- 不把 123 个 React 组件、61 个 Blocks 或上游 Registry 复制进 DesignOS。
- 不引入新的组件运行时或改变产品的技术栈。
- 不改变现有默认选中行为、推荐算法主流程、收藏存储格式、导出 schema。
- 不把示例预览称为目标应用真实截图，不把档案状态提升为 validated。
- 不修改 Dashboard Studio、Graphify Studio 或任何外部生产项目。

## 4. 实施路径比较

1. **完整移植 Looseleaf React/shadcn 组件库**：组件覆盖最广，但需要迁移 React/Tailwind/Radix 运行时，与当前静态工作台不兼容，风险和维护成本过高。
2. **仅新增一条 profile 数据**：改动最小，但预览仍是通用 Dashboard 样式，无法体现 Looseleaf 的视觉辨识度。
3. **独立 profile + DesignOS 原生预览适配（选定）**：沿用 canonical registry 和现有渲染器，在现有预览 DOM 上增加严格作用域的 Looseleaf 样式，并对缩略卡片做独立呈现；不引入运行时依赖。它在兼容性、可回退性和视觉表达之间最平衡。

## 5. 视觉方向与规则

- **性格：** 亲和、创意、手作、轻松但保持信息清晰。
- **底色：** 暖纸白 / 淡奶油色；墨色主文字；森林绿作为主强调，陶土橙作次强调。
- **表面：** 细颗粒纸感（CSS 渐层）、不规则/虚线墨线边界、轻微旋转的标签与贴纸点缀；装饰不得干扰文本或控件。
- **形状：** 低圆角或手绘感边界，不使用通用玻璃拟态、蓝紫渐变和厚重阴影。
- **字体：** 采用系统可用的手写/衬线 fallback 作为装饰性标题候选，正文保持系统无衬线；不打包上游字体，不宣称字体二进制已部署。未来若引入字体，必须单独核对字体许可证和网络加载情况。
- **布局：** 示例预览以轻量工作台/笔记桌为基础；桌面保留导航、内容和示例指标；窄屏隐藏侧栏并堆叠信息，按钮保持可触达。
- **无障碍：** 保持原生语义与控件，focus-visible 清晰，文字对比度目标 WCAG AA；状态不能只靠颜色表达；尊重 reduced-motion。
- **来源：** Looseleaf README 描述其为 React + Tailwind v4 + Radix/shadcn registry；上游仓库 LICENSE 为 MIT，但 IBM Plex Mono 字体另受 SIL OFL 1.1。当前实现不复制其源码、字体或图像资产，仅借鉴可见的视觉方向并保留来源说明。

## 6. 文件与接口边界

- 修改 `profiles/index.json`：新增完整 profile record，继承 `davylab-default`。
- 修改 `index.html`：在缩略预览和实时预览中加入以 `looseleaf-paper` 为条件的独立视觉分支；详情、比较、JSON 与 prompt 继续消费 canonical profile 数据。
- 修改 `tests/preview.test.mjs`：验证新 profile 被构建注入、样式作用域存在、规则出现在导出 prompt。
- 修改 `tests/e2e/designos.spec.mjs`：profile 数量由 5 更新为 6；验证 Looseleaf 选择、桌面/手机预览、比较和 Agent prompt。
- 修改 `README.md`：更新 profile 清单、预览完整性和上游来源说明。
- 新增 `docs/superpowers/specs/2026-11-03-looseleaf-style-pack-design.md` 与对应实施计划。

## 7. 验收标准

- 规则校验通过；build 输出 6 个 selectable profiles。
- 原有五个档案 ID、tokens、默认选择、搜索、收藏、比较、导出行为不变。
- Looseleaf 卡片与实时预览具有可辨识的纸张/墨线视觉，不是仅更改色板。
- 选择 Looseleaf 后详情显示完整原则、Token、来源和限制；JSON 与 Agent prompt 包含完整规则。
- 1440px、1024px、390px 视口无横向溢出；键盘焦点可见；手机预览无侧栏挤压。
- Dashboard Studio 只读边界未变化。
- 真实测试/构建输出必须记录；部署只有在 CI workflow 和 HTTP verification 成功后才能报告为已部署。
