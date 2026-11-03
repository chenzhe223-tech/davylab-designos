import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const file = resolve(root, 'integrations/design-capability-registry.json')
const registry = JSON.parse(await readFile(file, 'utf8'))
const errors = []
const ids = new Set()
if (registry.schemaVersion !== 1) errors.push('schemaVersion must equal 1')
if (!registry.policy?.preserveExistingProfiles) errors.push('existing profiles must be protected')
if (!registry.policy?.preserveLegacyIds) errors.push('legacy profile IDs must be protected')
if (!registry.policy?.noAutomaticGlobalThemeOverwrite) errors.push('global theme overwrite must be disabled')
if (!Array.isArray(registry.capabilities) || registry.capabilities.length === 0) errors.push('capabilities must be a non-empty array')
for (const provider of registry.capabilities || []) {
  if (!provider.id || ids.has(provider.id)) errors.push('provider IDs must be present and unique: ' + provider.id)
  ids.add(provider.id)
  if (!provider.name || !provider.kind || !provider.status) errors.push('provider metadata incomplete: ' + provider.id)
  if (provider.kind !== 'native' && (!provider.upstream || !provider.license)) errors.push('external provider requires upstream URL and license: ' + provider.id)
  if (provider.kind !== 'native' && !provider.integrationBoundary) errors.push('external provider requires an integration boundary: ' + provider.id)
  if (provider.kind === 'component-library-adapter' && !provider.compatibility?.framework) errors.push('component library requires framework compatibility metadata: ' + provider.id)
  if (provider.kind === 'product-illustration-and-motion-skill' && !provider.skillAdapter) errors.push('skill provider requires a local skill adapter path: ' + provider.id)
}
for (const required of ['davylab-core', 'looseleaf', 'stageshow']) if (!ids.has(required)) errors.push('required provider missing: ' + required)
if (errors.length) {
  console.error('FAIL: provider registry validation')
  for (const error of errors) console.error('- ' + error)
  process.exitCode = 1
} else {
  console.log('PASS: provider registry (' + ids.size + ' providers) satisfies metadata, compatibility and protection rules.')
}
