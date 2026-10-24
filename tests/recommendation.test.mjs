import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const profileStart = html.indexOf('const profiles=');
const agentsStart = html.indexOf('const agents=', profileStart);
const searchStart = html.indexOf('const searchTaxonomy=', agentsStart);
const renderStart = html.indexOf('function render(){', searchStart);
const sandbox = {};
runInNewContext(html.slice(profileStart, agentsStart) + html.slice(searchStart, renderStart) + 'globalThis.engine={profiles,getRankedProfiles,scoreProfile};', sandbox);
const engine = sandbox.engine;

const cases = [
  ['科技感 SaaS', '科技感 SaaS 产品', 'saas-product'],
  ['商业数据看板', '商业数据看板 指标 趋势图', 'analytics-dashboard'],
  ['移动端工作台', '手机移动端工作台', 'balanced-saas'],
  ['温暖品牌官网', '温暖品牌官网', 'warm-editorial'],
  ['内容编辑与灵感管理', '温暖的内容产品和灵感记录', 'warm-editorial'],
  ['高信息密度管理后台', '高密度数据管理后台', 'analytics-dashboard'],
  ['现有项目只读审计', '现有项目规则对照审计只读', 'dashboard-studio'],
  ['极简留白', '极简留白', 'warm-editorial'],
  ['商务专业', '商务专业', 'balanced-saas'],
  ['AI 工具工作台', 'AI 工具工作台', 'balanced-saas'],
  ['SaaS 表单任务流', 'SaaS 表单任务流', 'saas-product'],
  ['品牌叙事专题页', '品牌官网叙事专题页', 'warm-editorial'],
  ['运营监控指标', '运营看板监控指标', 'analytics-dashboard'],
  ['图表与数据分析', '图表数据分析 dashboard', 'analytics-dashboard'],
  ['移动优先内容阅读', '移动端优先内容产品阅读', 'warm-editorial'],
  ['清晰信息层级', '清晰信息层级稳定间距', 'balanced-saas'],
  ['表单验证反馈', '表单验证反馈危险操作确认', 'saas-product'],
  ['低饱和暖色品牌', '温暖柔和品牌官网', 'warm-editorial'],
  ['桌面端专业工作台', '桌面端专业工作台设置页', 'balanced-saas'],
  ['SaaS 管理工具', '企业 SaaS 管理工具', 'saas-product'],
  ['仪表盘 KPI', '仪表盘 KPI 指标趋势', 'analytics-dashboard'],
  ['内容产品留白', '内容产品大留白温润', 'warm-editorial'],
  ['工作空间交互', '工作台明确主操作交互反馈', 'balanced-saas'],
  ['无障碍表单', '语义化 HTML 键盘导航表单', 'saas-product'],
  ['现有布局保护审查', '既有项目布局冻结审查', 'dashboard-studio'],
  ['只读保护边界', '只读审计保护边界', 'dashboard-studio'],
  ['温润编辑式排版', '温润编辑式排版', 'warm-editorial'],
  ['业务数据明细', '商业分析数据明细表格', 'analytics-dashboard'],
  ['任务导向导航', '任务导向导航分组表单', 'saas-product'],
  ['模糊但有方向的科技产品', '科技产品', 'analytics-dashboard']
];

test('30 representative natural-language queries return relevant profiles with explanations', () => {
  assert.equal(cases.length, 30);
  for (const [label, query, expectedId] of cases) {
    const results = engine.getRankedProfiles(query).filter(item => item.score > 0);
    assert.ok(results.length > 0, label + ': expected at least one result');
    assert.ok(results.some(item => item.profile.id === expectedId), label + ': expected ' + expectedId);
    assert.ok(results.filter(item => item.profile.id !== 'dashboard-studio').every(item => item.reasons.length > 0), label + ': each normal recommendation should be explainable');
  }
});

test('ordinary implementation recommendations never include the read-only audit profile', () => {
  for (const query of ['科技感 SaaS', '商业数据看板', '手机工作台', '温暖品牌官网', 'AI 工具']) {
    const results = engine.getRankedProfiles(query).filter(item => item.score > 0);
    assert.ok(!results.some(item => item.profile.id === 'dashboard-studio'), query + ': audit profile must be excluded');
  }
});

test('explicit audit intent can discover the protected profile without weakening its guard', () => {
  const results = engine.getRankedProfiles('现有项目规则对照审计').filter(item => item.score > 0);
  assert.ok(results.some(item => item.profile.id === 'dashboard-studio'));
  assert.equal(engine.profiles.find(profile => profile.id === 'dashboard-studio').protected, true);
});

test('empty and unrelated queries do not fabricate a match', () => {
  assert.equal(engine.getRankedProfiles('').every(item => item.score === 0), true);
  assert.equal(engine.getRankedProfiles('qzxv-unknown-topic-94821').filter(item => item.score > 0).length, 0);
});
