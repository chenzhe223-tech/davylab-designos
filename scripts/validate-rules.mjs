import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(process.argv[2] ?? resolve(root, 'profiles/index.json'))
const profiles = JSON.parse(readFileSync(sourcePath, 'utf8'))
const errors = []
const ids = new Set()
const allowedStatuses = new Set(['draft', 'review', 'approved', 'deprecated'])
if (!Array.isArray(profiles) || profiles.length === 0) errors.push('profiles/index.json must be a non-empty array')
const byId = new Map((Array.isArray(profiles) ? profiles : []).map(p => [p.profileId, p]))
for (const [i, p] of profiles.entries()) {
  const at = `profiles[${i}]`
  for (const key of ['profileId','name','description','productType','status','version','accent','tokens','rules','source']) if (!(key in p)) errors.push(`${at}: missing ${key}`)
  if (!/^[a-z0-9-]+$/.test(p.profileId ?? '')) errors.push(`${at}: invalid profileId`)
  if (ids.has(p.profileId)) errors.push(`${at}: duplicate profileId ${p.profileId}`)
  ids.add(p.profileId)
  if (!allowedStatuses.has(p.status)) errors.push(`${at}: invalid status ${p.status}`)
  if (!/^\d+\.\d+\.\d+$/.test(p.version ?? '')) errors.push(`${at}: version must be semver`)
  if (!/^#[0-9a-f]{6}$/i.test(p.accent ?? '')) errors.push(`${at}: accent must be a six-digit hex color`)
  if (!p.tokens || typeof p.tokens !== 'object' || Array.isArray(p.tokens)) errors.push(`${at}: tokens must be an object`)
  if (!Array.isArray(p.rules) || p.rules.length === 0 || p.rules.some(r => typeof r !== 'string' || !r.trim())) errors.push(`${at}: rules must be a non-empty string array`)
  if (p.extends && !byId.has(p.extends)) errors.push(`${at}: extends unknown profile ${p.extends}`)
  if (p.extends === p.profileId) errors.push(`${at}: profile cannot extend itself`)
}
for (const p of profiles) {
  const seen = new Set([p.profileId]); let parent = p.extends
  while (parent) {
    if (seen.has(parent)) { errors.push(`${p.profileId}: inheritance cycle detected at ${parent}`); break }
    seen.add(parent); parent = byId.get(parent)?.extends ?? null
  }
}
if (errors.length) { console.error('FAIL rule validation:\n' + errors.map(e => `- ${e}`).join('\n')); process.exit(1) }
console.log(`PASS: ${profiles.length} profiles; unique IDs; valid statuses/versions/tokens/rules; inheritance references and cycles checked.`)
