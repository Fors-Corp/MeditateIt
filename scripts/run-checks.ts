/**
 * Discover and run every *.check.ts under the repo (excl. node_modules/dist).
 * Invoked by `npm test` via the tsx CLI.
 */
import { spawnSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tsxBin = join(root, 'node_modules', '.bin', 'tsx')

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue
    const path = join(dir, name)
    const st = statSync(path)
    if (st.isDirectory()) walk(path, out)
    else if (name.endsWith('.check.ts')) out.push(path)
  }
  return out
}

const files = walk(root).sort()
if (files.length === 0) {
  console.error('run-checks: no *.check.ts files found')
  process.exit(1)
}

let failed = 0
for (const file of files) {
  const rel = relative(root, file)
  console.log(`→ ${rel}`)
  const result = spawnSync(tsxBin, [file], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })
  if (result.status !== 0) {
    failed += 1
    console.error(`✗ ${rel} (exit ${result.status ?? 'signal'})`)
  }
}

if (failed > 0) {
  console.error(`run-checks: ${failed}/${files.length} failed`)
  process.exit(1)
}

console.log(`run-checks: ${files.length} ok`)
