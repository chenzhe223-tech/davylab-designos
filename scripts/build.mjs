import { cp, mkdir, rm, copyFile, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'dist')
await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
const canonicalProfiles = JSON.parse(await readFile(resolve(root, 'profiles/index.json'), 'utf8'))
const byId = new Map(canonicalProfiles.map(p => [p.profileId, p]))
const mergedTokens = profile => {
  const chain = []
  const seen = new Set()
  let current = profile
  while (current) {
    if (seen.has(current.profileId)) throw new Error('Profile inheritance cycle at ' + current.profileId)
    seen.add(current.profileId)
    chain.unshift(current)
    current = current.extends ? byId.get(current.extends) : null
    if (chain.length > canonicalProfiles.length) throw new Error('Profile inheritance depth exceeds source profile count')
  }
  const merge = (a, b) => Object.fromEntries([...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])].map(k => [k, a?.[k] && b?.[k] && typeof a[k] === 'object' && typeof b[k] === 'object' && !Array.isArray(a[k]) && !Array.isArray(b[k]) ? merge(a[k], b[k]) : (b && Object.hasOwn(b, k) ? b[k] : a[k])]))
  return chain.reduce((tokens, p) => merge(tokens, p.tokens), {})
}
const runtimeProfiles = canonicalProfiles.filter(p => p.presentation && p.status !== 'deprecated').map(p => {
  const v = p.presentation
  const tokens = mergedTokens(p)
  const colors = tokens.color || {}
  return {
    id: v.id, profileId: p.profileId, name: v.displayName || p.name, category: v.category || p.productType,
    type: v.type || p.productType, style: v.style || p.name, desc: p.description,
    palette: [colors.canvas || '#F7F7F4', colors.text || '#202630', colors.accent || p.accent],
    principles: v.principles || p.rules.slice(0, 3), use: v.use || p.productType,
    device: v.device || 'desktop', layout: v.layout || (tokens.layout ? JSON.stringify(tokens.layout) : '按继承的设计规则组织内容'),
    interaction: v.interaction || p.rules.join('；'), limitations: v.limitations || '尚未记录具体限制；实施前需结合目标项目验证。',
    version: p.version, source: (p.source?.kind || 'unknown') + ': ' + (p.source?.evidence || 'No evidence recorded'),
    protected: Boolean(v.protected || p.layoutPreservation?.enabled),
    status: p.status, evidenceStatus: p.evidenceStatus || p.status,
    tokens, rules: p.rules, extends: p.extends, productType: p.productType,
    tags: v.tags || [], aliases: v.aliases || [], mobileFit: v.mobileFit || '按目标设备验证',
    limitationsVerified: Boolean(p.source?.verifiedAt && p.evidenceStatus === 'validated')
  }
})
if (runtimeProfiles.length === 0) throw new Error('No displayable canonical profiles found')
let html = await readFile(resolve(root, 'index.html'), 'utf8')
const profileBlock = /const profiles=\[[\s\S]*?\];\s*\nconst agents=\[/
if (!profileBlock.test(html)) throw new Error('Could not locate the profile injection point in index.html')
html = html.replace(profileBlock, 'const profiles=' + JSON.stringify(runtimeProfiles) + ';\nconst agents=[')
await writeFile(resolve(out, 'index.html'), html, 'utf8')
await cp(resolve(root, 'profiles'), resolve(out, 'profiles'), { recursive: true })
await cp(resolve(root, 'assets'), resolve(out, 'assets'), { recursive: true })
await cp(resolve(root, 'engine.lock.json'), resolve(out, 'engine.lock.json'))
console.log('PASS: static DesignOS site built from canonical profile registry (' + runtimeProfiles.length + ' selectable profiles).')
