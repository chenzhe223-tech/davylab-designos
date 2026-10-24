import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const path = resolve(process.argv[2] ?? 'generated/engine-smoke.json')
let envelope
try { envelope = JSON.parse(await readFile(path, 'utf8')) } catch (e) { console.error(`FAIL: cannot read engine output at ${path}: ${e.message}`); process.exit(1) }
const errors = []
if (envelope.kind !== 'designos-engine-candidate') errors.push('kind must be designos-engine-candidate')
if (!envelope.engine?.repository?.includes('ui-ux-pro-max-skill')) errors.push('missing upstream repository provenance')
if (!envelope.result?.design_system || typeof envelope.result.design_system !== 'object') errors.push('missing raw official design_system output')
if (!envelope.profile || typeof envelope.profile !== 'object') errors.push('missing normalized DesignOS profile')
for (const field of ['profileId','name','description','productType','status','version','accent','tokens','rules','source']) if (!(field in (envelope.profile ?? {}))) errors.push(`normalized profile missing ${field}`)
if (envelope.profile?.status !== 'draft') errors.push('generated profile must remain draft')
if (!Array.isArray(envelope.profile?.rules) || !envelope.profile.rules.length) errors.push('normalized profile must include candidate rules')
if (envelope.promotion?.approved !== false) errors.push('generated candidate must not be auto-approved')
if (errors.length) { console.error('FAIL engine output validation:\n' + errors.map(e => `- ${e}`).join('\n')); process.exit(1) }
console.log(`PASS: real UI UX Pro Max output normalized to a review-only DesignOS candidate (${envelope.profile.profileId}); raw result and provenance retained.`)
