/**
 * Locale catalog coverage + resolve/bootstrap helpers.
 * Run via `npm test` (scripts/run-checks.ts).
 */
import assert from 'node:assert/strict'
import {
  allCatalogs,
  applyLocalePreference,
  detectBrowserLocale,
  getLocale,
  getLocalePreference,
  getMessages,
  LOCALES,
  matchLocale,
  resolveLocale,
  setActiveLocale,
  type LocaleCode,
} from './index.ts'
import { en } from './en.ts'

function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value === 'function') return [prefix || '(root)']
  if (value === null || typeof value !== 'object') return [prefix || '(root)']
  const out: string[] = []
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof child === 'function' || child === null || typeof child !== 'object') {
      out.push(path)
    } else if (Array.isArray(child)) {
      out.push(path)
    } else {
      out.push(...leafPaths(child, path))
    }
  }
  return out.sort()
}

function valueAt(root: unknown, path: string): unknown {
  let cur: unknown = root
  for (const part of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return cur
}

const enPaths = leafPaths(en)
assert.ok(enPaths.length > 40, `expected a rich EN catalog, got ${enPaths.length}`)

for (const locale of LOCALES) {
  const catalog = allCatalogs()[locale]
  const paths = leafPaths(catalog)
  assert.deepEqual(
    paths,
    enPaths,
    `${locale} leaf paths must match en (${paths.length} vs ${enPaths.length})`,
  )
  for (const path of enPaths) {
    const enVal = valueAt(en, path)
    const locVal = valueAt(catalog, path)
    assert.equal(
      typeof locVal,
      typeof enVal,
      `${locale}.${path} type ${typeof locVal} !== ${typeof enVal}`,
    )
    if (typeof enVal === 'string') {
      assert.ok(
        typeof locVal === 'string' && locVal.trim().length > 0,
        `${locale}.${path} must be a non-empty string`,
      )
    }
  }
}

assert.equal(matchLocale('pt-BR'), 'pt')
assert.equal(matchLocale('ca-ES'), 'ca')
assert.equal(matchLocale('fr-CA'), 'fr')
assert.equal(matchLocale('es-MX'), 'es')
assert.equal(matchLocale('de-DE'), null)
assert.equal(detectBrowserLocale(['de-DE', 'fr-FR']), 'fr')
assert.equal(detectBrowserLocale(['pt-BR', 'en']), 'pt')
assert.equal(detectBrowserLocale(['zz']), 'en')
assert.equal(resolveLocale(null, ['ca']), 'ca')
assert.equal(resolveLocale('pt', ['en']), 'pt')
assert.equal(resolveLocale('nope', ['es-ES']), 'es')

const previous = getLocale()
const previousPref = getLocalePreference()
for (const locale of LOCALES) {
  setActiveLocale(locale as LocaleCode)
  assert.equal(getLocale(), locale)
  assert.equal(getMessages().app.brand, 'MeditateIt')
  assert.ok(getMessages().app.disclaimer.length > 20)
  assert.match(getMessages().controls.toneHz, /Hz|Hz\)|\(Hz\)/i)
  assert.ok(getMessages().app.languageLabel.trim().length > 0)
  assert.ok(getMessages().settings.languageSystem.trim().length > 0)
  assert.ok(getMessages().settings.languageChromeNote.trim().length > 0)
}

assert.equal(applyLocalePreference(null, ['es-MX']), 'es')
assert.equal(getLocalePreference(), null)
assert.equal(getLocale(), 'es')
assert.equal(applyLocalePreference('fr', ['en']), 'fr')
assert.equal(getLocalePreference(), 'fr')
assert.equal(getLocale(), 'fr')
assert.equal(applyLocalePreference(null, ['pt-BR']), 'pt')
assert.equal(getLocalePreference(), null)
assert.equal(getLocale(), 'pt')

applyLocalePreference(previousPref)
setActiveLocale(previous)

// Soften / Tone (Hz) / listening-preference spirit (no treatment claims).
for (const locale of LOCALES) {
  const catalog = allCatalogs()[locale]
  assert.match(catalog.controls.toneHz, /Hz/)
  const toneNote = catalog.controls.toneNote.toLowerCase()
  assert.ok(
    /listening|écoute|escuch|escolta|prefer/.test(toneNote),
    `${locale} tone note missing listening/preference spirit`,
  )
  assert.ok(
    !/\b(diagnos|diagnóst|cura\b|cure\b|traitement médical|tratamiento médico|tractament mèdic|tratamento médico)\b/.test(
      toneNote,
    ),
    `${locale} tone note must not claim medical treatment`,
  )
  const headphones = catalog.dialogs.headphonesBody.toLowerCase()
  assert.ok(
    /listening|écoute|escuch|escolta|escuta/.test(headphones),
    `${locale} headphones copy missing listening-effect spirit`,
  )
}

console.log(`i18n.check: ok (${LOCALES.join(', ')}; ${enPaths.length} leaves)`)
