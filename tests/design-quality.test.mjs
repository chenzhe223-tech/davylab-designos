import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {auditBrandProject,contrastRatio,luminance,inspectSVGSource} from '../design-agent/quality.js';
const project={
 source:'live-deepseek',vectors:false,
 strategy:{brand_name:'ISLAND DAYS',positioning:'亲子海岛度假'},
 directions:[
 {id:'A',name:'自然',rationale:'自然松弛',symbol:'日出',palette:['#FFFFFF','#111111','#B5A382','#246047']},
 {id:'B',name:'活力',rationale:'海洋活力',symbol:'海浪',palette:['#FFFFFF','#123456','#EFAB67','#345678']},
 {id:'C',name:'极简',rationale:'克制极简',symbol:'棕榈',palette:['#FFFFFF','#000000','#DDDDDD','#444444']}
 ]};
test('WCAG relative luminance and contrast are computed from actual HEX colors',()=>{
 assert.equal(luminance('#000000'),0);
 assert.equal(luminance('#FFFFFF'),1);
 assert.equal(contrastRatio('#FFFFFF','#000000'),21);
 assert.equal(contrastRatio('#abc','#000000'),null);
});
test('native audit distinguishes a legitimate planning preview from final assets',()=>{
 const a=auditBrandProject(project);
 assert.equal(a.passed,true);
 assert.ok(a.issues.some(x=>x.code==='NO_FINAL_ASSET'&&x.severity==='info'));
 assert.equal(a.engine,'native-static-heuristics');
 assert.ok(a.limits.some(x=>x.includes('真实浏览器')));
});
test('audit blocks fake demo and detects duplicated directions and poor preview contrast',()=>{
 const p=structuredClone(project);
 p.source='example-only';
 p.directions[1].name=p.directions[0].name;
 p.directions[1].palette[0]='#FFFFFF';
 p.directions[1].palette[1]='#EEEEEE';
 const a=auditBrandProject(p);
 assert.equal(a.passed,false);
 for(const code of ['DEMO_ONLY','DIRECTION_DUPLICATE','PREVIEW_CONTRAST'])assert.ok(a.issues.some(x=>x.code===code),code);
});
test('audit blocks inconsistent SVG provenance and missing generated assets',()=>{
 const p=structuredClone(project);
 p.vectors=true;p.directions[0].svg='<svg>not validated</svg>';
 const a=auditBrandProject(p);
 assert.ok(a.issues.some(x=>x.code==='VECTOR_MISSING'));
});
test('Design Agent UI has real QA action, honest caveats and export',async()=>{
 const html=await readFile(new URL('../design-agent/index.html',import.meta.url),'utf8');
 const js=await readFile(new URL('../design-agent/app.js',import.meta.url),'utf8');
 assert.match(html,/id="runDesignQA"/);
 assert.match(html,/id="exportDesignQA"/);
 assert.match(html,/不等于真实浏览器视觉验收/);
 assert.match(js,/auditBrandProject\(p\)/);
 assert.match(js,/DAVYLAB-design-QA-/);
});

test('planning pass never implies production delivery readiness',()=>{
 const a=auditBrandProject(project);
 assert.equal(a.passed,true);
 assert.equal(a.automated_asset_gate_passed,false);
});
test('SVG security source checks reject active content and missing viewBox',()=>{
 const base='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0 0 L100 100" fill="none" stroke="#111111"/></svg>';
 const safe=base+' '.repeat(60);
 assert.equal(inspectSVGSource(safe).safe,true);
 assert.equal(inspectSVGSource(safe.replace('<path','<script>alert(1)</script><path')).safe,false);
 assert.equal(inspectSVGSource(safe.replace('viewBox','data-box')).safe,false);
 const p=structuredClone(project);
 p.vectors=true;p.directions.forEach(d=>d.svg=safe);
 assert.equal(auditBrandProject(p).automated_asset_gate_passed,true);
 p.directions[0].svg=safe.replace('<path','<script>alert(1)</script><path');
 const result=auditBrandProject(p);
 assert.equal(result.automated_asset_gate_passed,false);
 assert.ok(result.issues.some(x=>x.code==='SVG_UNSAFE'));
});
