import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, symlink, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { resolveProjectOutput } from '../scripts/path-safety.mjs'

test('accepts a relative output path inside the project', async () => {
  const root = await mkdtemp(join(tmpdir(), 'designos-path-ok-'))
  try {
    assert.equal(resolveProjectOutput(root, 'generated/candidate.json'), resolve(root, 'generated/candidate.json'))
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('rejects absolute paths and parent traversal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'designos-path-reject-'))
  try {
    assert.throws(() => resolveProjectOutput(root, resolve(root, '..', 'escape.json')), /stay inside/)
    assert.throws(() => resolveProjectOutput(root, '../escape.json'), /stay inside/)
    assert.throws(() => resolveProjectOutput(root, ''), /non-empty relative path/)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('rejects a symlinked output directory that escapes the project', async () => {
  const root = await mkdtemp(join(tmpdir(), 'designos-path-link-'))
  const outside = await mkdtemp(join(tmpdir(), 'designos-outside-'))
  try {
    await symlink(outside, join(root, 'generated'), 'dir')
    assert.throws(() => resolveProjectOutput(root, 'generated/candidate.json'), /symlink outside/)
  } finally {
    await rm(root, { recursive: true, force: true })
    await rm(outside, { recursive: true, force: true })
  }
})
