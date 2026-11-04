import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'

test('public build includes the preview and design profiles, not private project metadata', async () => {
  const dist = resolve('dist')
  const html = await readFile(join(dist, 'index.html'), 'utf8')
  assert.match(html, /DAVYLAB DesignOS/)
  const profiles = JSON.parse(await readFile(join(dist, 'profiles', 'index.json'), 'utf8'))
  assert.equal(profiles.length, 6)
  assert.ok(profiles.some(profile => profile.presentation?.id === 'looseleaf-paper'))
  await assert.rejects(stat(join(dist, 'projects')))
  const files = await readdir(dist)
  assert.ok(files.includes('engine.lock.json'))
  assert.ok(files.includes('profiles'))
  assert.ok(files.includes('examples'))
  const showcase = await readFile(join(dist, 'examples', 'looseleaf-showcase.html'), 'utf8')
  assert.match(showcase, /Looseleaf Paper/)
  assert.match(showcase, /data-tab/)
  assert.match(showcase, /aria-live/)
  const components = await readFile(join(dist, 'examples', 'looseleaf-components.html'), 'utf8')
  assert.match(components, /Reusable UI primitives/)
  assert.match(components, /class="ll-dialog"/)
  assert.match(components, /class="ll-feedback/)
  const looseleafCss = await readFile(join(dist, 'assets', 'looseleaf', 'looseleaf.css'), 'utf8')
  for (const primitive of ['.ll-field', '.ll-feedback--warning', '.ll-list-item', '.ll-empty-state', '.ll-dialog-backdrop']) {
    assert.ok(looseleafCss.includes(primitive), 'missing reusable primitive ' + primitive)
  }
  const assets = await readdir(join(dist, 'assets'))
  assert.ok(assets.includes('davylab-motion.js'))
  assert.ok(assets.includes('motion-tokens.css'))
  assert.ok(assets.includes('designos-motion-lab.js'))
  assert.ok(assets.includes('designos-motion-lab.css'))
  const looseleafAssets = await readdir(join(dist, 'assets', 'looseleaf'))
  assert.ok(looseleafAssets.includes('looseleaf.css'))
  assert.ok(looseleafAssets.includes('looseleaf-tokens.css'))
})
