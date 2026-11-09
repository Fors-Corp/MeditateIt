/**
 * CSP presence smoke: source index.html, public/_headers, and built dist
 * HTML when present (string asserts — no browser).
 * Run via: npm test
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const CSP_NEEDLE = 'Content-Security-Policy'
const DEFAULT_SRC = "default-src 'self'"
const WORKER_SRC = "worker-src 'self'"

function assertCspBlob(label: string, text: string): void {
  assert(text.includes(CSP_NEEDLE), `${label}: missing Content-Security-Policy`)
  assert(text.includes(DEFAULT_SRC), `${label}: missing default-src 'self'`)
  assert(text.includes(WORKER_SRC), `${label}: missing worker-src 'self'`)
}

const indexHtml = readFileSync(join(root, 'index.html'), 'utf8')
assertCspBlob('index.html', indexHtml)
assert(
  indexHtml.includes('http-equiv="Content-Security-Policy"'),
  'index.html: CSP must be a meta http-equiv',
)

const headers = readFileSync(join(root, 'public/_headers'), 'utf8')
assertCspBlob('public/_headers', headers)

const distHtmlPath = join(root, 'dist/index.html')
if (existsSync(distHtmlPath)) {
  assertCspBlob('dist/index.html', readFileSync(distHtmlPath, 'utf8'))
  console.log('csp.check: ok (source + headers + dist)')
} else {
  console.log('csp.check: ok (source + headers; dist/index.html absent — run build to smoke built HTML)')
}
