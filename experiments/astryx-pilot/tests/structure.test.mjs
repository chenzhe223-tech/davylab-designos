import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(new URL(path, import.meta.url),'utf8');
test('pilot stays independent of production root',()=>{const pkg=JSON.parse(read('../package.json'));assert.equal(pkg.private,true);assert.equal(pkg.dependencies.react.startsWith('^19'),true);assert.equal(pkg.dependencies['@astryxdesign/core'],'0.7.12')});
test('official Astryx theme and button imports are present',()=>{const source=read('../src/main.jsx');for(const token of ['@astryxdesign/core/theme','@astryxdesign/core/Button','@astryxdesign/theme-neutral/built','@astryxdesign/core/reset.css'])assert.ok(source.includes(token))});
test('responsive viewport and mobile breakpoint present',()=>{assert.match(read('../index.html'),/width=device-width/);assert.match(read('../src/tokens.css'),/@media\(max-width:480px\)/)});
