#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { readFile, mkdir, writeFile, cp, mkdtemp, rm, rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { resolveProjectOutput } from './path-safety.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const lock = JSON.parse(await readFile(join(root, 'engine.lock.json'), 'utf8'))
const args = process.argv.slice(2)
const command = args.shift() ?? 'help'
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback }
const skillRoot = join(root, lock.expectedSkillPath)
const searchScript = join(skillRoot, lock.searchEntry)
const python = process.env.PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3')

function help() {
  console.log(`DAVYLAB DesignOS CLI

Commands:
  node scripts/designos.mjs engine-status
  node scripts/designos.mjs setup-engine
  node scripts/designos.mjs generate --query "SaaS dashboard" --project "My App" [--stack react] [--output generated/candidate.json]
  node scripts/designos.mjs search --query "dashboard accessibility" --domain ux [--output generated/search.json]

Engine: ${lock.provider} / CLI ${lock.cliVersion}; source is pinned to ${lock.upstreamCommit}.`)
}

if (command === 'help' || command === '--help' || command === '-h') help()
else if (command === 'engine-status') {
  const exists = existsSync(searchScript)
  const py = spawnSync(python, ['--version'], { encoding: 'utf8' })
  const status = { provider: lock.provider, expectedSkillVersion: lock.skillVersion, cliPackage: lock.cliPackage, cliVersion: lock.cliVersion, skillPath: skillRoot, searchScriptExists: exists, python: py.status === 0 ? (py.stdout || py.stderr).trim() : null, ready: exists && py.status === 0 }
  console.log(JSON.stringify(status, null, 2))
  if (!status.ready) process.exitCode = 2
}
else if (command === 'setup-engine') {
  const git = process.platform === 'win32' ? 'git.exe' : 'git'
  const temp = await mkdtemp(join(tmpdir(), 'designos-uipro-'))
  const source = join(temp, 'upstream')
  const target = skillRoot
  try {
    console.log(`Fetching UI UX Pro Max source at pinned commit ${lock.upstreamCommit}...`)
    let result = spawnSync(git, ['init', source], { cwd: temp, encoding: 'utf8', timeout: 30000 })
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'git init failed')
    result = spawnSync(git, ['-C', source, 'remote', 'add', 'origin', 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git'], { encoding: 'utf8', timeout: 30000 })
    if (result.status !== 0) throw new Error(result.stderr || 'git remote add failed')
    result = spawnSync(git, ['-C', source, 'fetch', '--depth=1', 'origin', lock.upstreamCommit], { encoding: 'utf8', stdio: 'inherit', timeout: 180000 })
    if (result.status !== 0) throw new Error('Pinned upstream fetch failed; check GitHub network access and retry.')
    result = spawnSync(git, ['-C', source, 'checkout', '--detach', 'FETCH_HEAD'], { encoding: 'utf8', stdio: 'inherit', timeout: 30000 })
    if (result.status !== 0) throw new Error('Unable to check out pinned upstream commit.')
    const head = spawnSync(git, ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' })
    if (head.status !== 0 || head.stdout.trim() !== lock.upstreamCommit) throw new Error('Upstream commit mismatch.')
    const upstreamSkill = join(source, 'src', 'ui-ux-pro-max')
    const metadata = JSON.parse(await readFile(join(source, 'skill.json'), 'utf8'))
    if (metadata.version !== lock.skillVersion) throw new Error(`Upstream skill version mismatch: expected ${lock.skillVersion}, got ${metadata.version}`)
    for (const [relativePath, expectedBlob] of Object.entries(lock.upstreamFiles ?? {})) {
      if (!existsSync(join(source, relativePath))) throw new Error(`Pinned upstream file is missing: ${relativePath}`)
      const hash = spawnSync(git, ['-C', source, 'hash-object', relativePath], { encoding: 'utf8' })
      if (hash.status !== 0 || hash.stdout.trim() !== expectedBlob) throw new Error(`Pinned upstream integrity check failed for ${relativePath}`)
    }
    if (!existsSync(join(upstreamSkill, lock.searchEntry))) throw new Error('Pinned upstream source is missing the declared search entry.')
    const staged = `${target}.staged-${process.pid}`
    await rm(staged, { recursive: true, force: true })
    await mkdir(dirname(target), { recursive: true })
    await cp(upstreamSkill, staged, { recursive: true })
    if (!existsSync(join(staged, lock.searchEntry))) { await rm(staged, { recursive: true, force: true }); throw new Error('Staged engine is missing its search entry.') }
    const backup = `${target}.previous-${process.pid}`
    await rm(backup, { recursive: true, force: true })
    const hadTarget = existsSync(target)
    if (hadTarget) await rename(target, backup)
    try { await rename(staged, target) } catch (error) { if (hadTarget && existsSync(backup)) await rename(backup, target); throw error }
    await rm(backup, { recursive: true, force: true })
    const check = spawnSync(process.execPath, [fileURLToPath(import.meta.url), 'engine-status'], { cwd: root, encoding: 'utf8' })
    process.stdout.write(check.stdout ?? '')
    if (check.status !== 0) throw new Error('Installed engine did not pass the readiness check.')
    console.log(`PASS: installed real UI UX Pro Max ${metadata.version} from ${lock.upstreamCommit}.`)
  } catch (error) {
    console.error(`Engine setup failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  } finally { await rm(temp, { recursive: true, force: true }) }
}
else if (command === 'generate' || command === 'search') {
  if (!existsSync(searchScript)) { console.error(`UI UX Pro Max search script not found at ${searchScript}. Run: npm run engine:setup`); process.exit(2) }
  const query = opt('--query')
  if (!query?.trim()) { console.error('Missing required --query'); process.exit(2) }
  const project = opt('--project', 'DAVYLAB DesignOS Candidate')
  let output
  try { output = resolveProjectOutput(root, opt('--output', `generated/${command}-${Date.now()}.json`)) }
  catch (error) { console.error(error.message); process.exit(2) }
  const engineArgs = [searchScript, query]
  if (command === 'generate') engineArgs.push('--design-system', '--json', '--project-name', project)
  else engineArgs.push('--json', '--domain', opt('--domain', 'ux'))
  const stack = opt('--stack')
  if (stack && command === 'search') engineArgs.push('--stack', stack)
  const result = spawnSync(python, engineArgs, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
  if (result.status !== 0) { console.error(result.stderr || result.stdout || `Engine exited with status ${result.status}`); process.exit(result.status ?? 1) }
  let parsed
  try { parsed = JSON.parse(result.stdout) } catch { console.error('Official engine returned invalid JSON; output was not promoted.'); process.exit(3) }
  if (command === 'generate' && (!parsed.design_system || typeof parsed.design_system !== 'object')) { console.error('Official engine JSON did not contain a design_system object.'); process.exit(3) }
  let stackGuidelines = null
  if (command === 'generate' && stack) {
    const stackResult = spawnSync(python, [searchScript, query, '--stack', stack, '--json'], { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
    if (stackResult.status !== 0) { console.error(stackResult.stderr || 'Stack guideline search failed.'); process.exit(stackResult.status ?? 1) }
    try { stackGuidelines = JSON.parse(stackResult.stdout) } catch { console.error('Stack search returned invalid JSON.'); process.exit(3) }
  }
  const ds = parsed.design_system
  const slug = value => String(value || 'designos-candidate').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'designos-candidate'
  const ruleCandidates = [
    ds?.style?.best_for ? `适用场景：${ds.style.best_for}` : '',
    ds?.style?.accessibility ? `无障碍要求：${ds.style.accessibility}` : '',
    ds?.style?.performance ? `性能要求：${ds.style.performance}` : '',
    ds?.pattern?.sections ? `推荐页面结构：${ds.pattern.sections}` : '',
    ds?.key_effects ? `视觉与动效：${ds.key_effects}` : '',
    ds?.anti_patterns ? `避免的设计反模式：${ds.anti_patterns}` : '',
    ...(Array.isArray(ds?.constraints) ? ds.constraints.map(x => `引擎约束：${typeof x === 'string' ? x : JSON.stringify(x)}`) : [])
  ].filter(Boolean)
  const profile = command === 'generate' ? {
    profileId: slug(project), name: project, description: `由 UI UX Pro Max ${lock.skillVersion} 根据需求生成的候选设计系统。`,
    productType: ds.category || 'general', status: 'draft', version: '0.1.0', extends: 'davylab-default', accent: ds.colors?.accent || ds.colors?.primary || '#617e9c',
    tokens: { color: Object.fromEntries(Object.entries({ primary: ds.colors?.primary, onPrimary: ds.colors?.on_primary, secondary: ds.colors?.secondary, onSecondary: ds.colors?.on_secondary, accent: ds.colors?.accent, onAccent: ds.colors?.on_accent, background: ds.colors?.background, foreground: ds.colors?.foreground, card: ds.colors?.card, cardForeground: ds.colors?.card_foreground, muted: ds.colors?.muted, mutedForeground: ds.colors?.muted_foreground, border: ds.colors?.border, destructive: ds.colors?.destructive, ring: ds.colors?.ring }).filter(([,v]) => typeof v === 'string' && v.trim())), typography: { heading: ds.typography?.heading, body: ds.typography?.body, mood: ds.typography?.mood, googleFontsUrl: ds.typography?.google_fonts_url, cssImport: ds.typography?.css_import }, style: { id: ds.style?.id, name: ds.style?.name, keywords: ds.style?.keywords, bestFor: ds.style?.best_for, accessibility: ds.style?.accessibility, performance: ds.style?.performance }, pattern: ds.pattern, spacing: ds.spacing_scale || null, motion: ds.motion_snippet || null },
    rules: ruleCandidates.length ? ruleCandidates : ['未提取到非空规则；必须人工复核原始引擎输出。'],
    source: { kind: 'ui-ux-pro-max', repository: lock.provider, skillVersion: lock.skillVersion, cliVersion: lock.cliVersion, query, generatedAt: new Date().toISOString(), rawOutputPreserved: true }
  } : null
  const envelope = { schemaVersion: '1.0.0', kind: command === 'generate' ? 'designos-engine-candidate' : 'designos-engine-search', generatedAt: new Date().toISOString(), project, query, engine: { repository: lock.provider, skillVersion: lock.skillVersion, cliPackage: lock.cliPackage, cliVersion: lock.cliVersion, command: engineArgs.map((v, i) => i === 0 ? '<installed-search.py>' : v) }, status: 'candidate', ...(profile ? { profile } : {}), ...(stackGuidelines ? { stackGuidelines } : {}), result: parsed, promotion: { approved: false, reason: 'Generated engine output must be reviewed and validated before becoming an approved profile.' } }
  await mkdir(dirname(output), { recursive: true }); await writeFile(output, JSON.stringify(envelope, null, 2) + '\n', 'utf8')
  console.log(JSON.stringify({ status: 'success', output, kind: envelope.kind, engineVersion: lock.skillVersion, promotedToApproved: false }, null, 2))
}
else { help(); process.exitCode = 2 }
