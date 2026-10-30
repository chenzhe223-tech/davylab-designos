import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'

test('public build includes the preview and design profiles, not private project metadata', async () => {
  const dist = resolve('dist')
  const html = await readFile(join(dist, 'index.html'), 'utf8')
  assert.match(html, /DAVYLAB DesignOS/)
  const profiles = JSON.parse(await readFile(join(dist, 'profiles', 'index.json'), 'utf8'))
  assert.equal(profiles.length, 5)
  await assert.rejects(stat(join(dist, 'projects')))
  const files = await readdir(dist)
  assert.ok(files.includes('engine.lock.json'))
  assert.ok(files.includes('profiles'))
  const assets = await readdir(join(dist, 'assets'))
  assert.ok(assets.includes('davylab-motion.js'))
  assert.ok(assets.includes('motion-tokens.css'))
  assert.ok(assets.includes('designos-motion-lab.js'))
  assert.ok(assets.includes('designos-motion-lab.css'))
})
