import { resolve, relative, isAbsolute, dirname } from 'node:path'
import { existsSync, realpathSync, lstatSync } from 'node:fs'

/** Resolve a project-local output path and reject traversal through existing symlinks. */
export function resolveProjectOutput(root, value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Output path must be a non-empty relative path inside the project directory.')
  if (isAbsolute(value)) throw new Error(`Output path must stay inside the project directory: ${value}`)

  const projectRoot = realpathSync(resolve(root))
  const output = resolve(projectRoot, value)
  const rel = relative(projectRoot, output)
  if (!rel || rel === '.' || rel === '..' || rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(rel)) {
    throw new Error(`Output path must stay inside the project directory: ${value}`)
  }

  let ancestor = output
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor)
    if (parent === ancestor) throw new Error(`Unable to validate output path: ${value}`)
    ancestor = parent
  }
  const realAncestor = realpathSync(ancestor)
  const ancestorRel = relative(projectRoot, realAncestor)
  if (ancestorRel === '..' || ancestorRel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(ancestorRel)) {
    throw new Error(`Output path traverses a symlink outside the project directory: ${value}`)
  }
  if (existsSync(output) && lstatSync(output).isSymbolicLink()) {
    const realOutput = realpathSync(output)
    const outputRel = relative(projectRoot, realOutput)
    if (outputRel === '..' || outputRel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(outputRel)) {
      throw new Error(`Output path traverses a symlink outside the project directory: ${value}`)
    }
  }
  return output
}
