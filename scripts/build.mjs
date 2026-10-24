import { cp, mkdir, rm, copyFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'dist')
await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
await copyFile(resolve(root, 'index.html'), resolve(out, 'index.html'))
await cp(resolve(root, 'profiles'), resolve(out, 'profiles'), { recursive: true })
await cp(resolve(root, 'engine.lock.json'), resolve(out, 'engine.lock.json'))
console.log('PASS: static DesignOS site built to dist/ (no npm runtime dependencies).')
