/**
 * Locale-aware message catalogs (en, es, ca, fr, pt).
 * Active catalog swaps live; documentElement.lang tracks the locale.
 */

import { ca } from './ca.ts'
import { en, type EnMessages, type Messages } from './en.ts'
import { es } from './es.ts'
import { fr } from './fr.ts'
import {
  detectBrowserLocale,
  isLocaleCode,
  type LocaleCode,
  LOCALES,
  LOCALE_LABELS,
  matchLocale,
} from './locales.ts'
import { pt } from './pt.ts'

export { en, ca, es, fr, pt }
export type { EnMessages, Messages }
export {
  detectBrowserLocale,
  isLocaleCode,
  LOCALES,
  LOCALE_LABELS,
  matchLocale,
}
export type { LocaleCode }

const CATALOGS: Record<LocaleCode, Messages> = {
  en,
  es,
  ca,
  fr,
  pt,
}

let activeLocale: LocaleCode = 'en'
let activeMessages: Messages = en
const listeners = new Set<() => void>()

function notify(): void {
  for (const listener of listeners) listener()
}

function applyDocumentLang(locale: LocaleCode): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale
}

/** Current locale (always a concrete supported code). */
export function getLocale(): LocaleCode {
  return activeLocale
}

/** Current message catalog for the active locale. */
export function getMessages(): Messages {
  return activeMessages
}

/**
 * Live catalog binding. Prefer `useI18n()` / `getMessages()` in new code;
 * this getter keeps module-level call sites locale-aware.
 */
export const messages: Messages = new Proxy({} as Messages, {
  get(_target, prop, receiver) {
    return Reflect.get(activeMessages, prop, receiver)
  },
}) as Messages

/** Subscribe to locale changes (for React `useSyncExternalStore`). */
export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Resolve prefs locale (null/invalid → browser → en). */
export function resolveLocale(
  preferred: string | null | undefined,
  languages?: readonly string[],
): LocaleCode {
  if (isLocaleCode(preferred)) return preferred
  const matched = matchLocale(preferred ?? undefined)
  if (matched) return matched
  return detectBrowserLocale(languages)
}

/** Apply a locale immediately (catalog + documentElement.lang). */
export function setActiveLocale(locale: LocaleCode): LocaleCode {
  const next = isLocaleCode(locale) ? locale : 'en'
  if (next === activeLocale && activeMessages === CATALOGS[next]) {
    applyDocumentLang(next)
    return next
  }
  activeLocale = next
  activeMessages = CATALOGS[next] ?? en
  applyDocumentLang(next)
  notify()
  return next
}

/** Read a stored prefs locale from localStorage without async helpers. */
export function readStoredLocalePreference(): LocaleCode | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const raw = window.localStorage.getItem('meditateit:prefs:v1')
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'locale' in parsed &&
      isLocaleCode((parsed as { locale: unknown }).locale)
    ) {
      return (parsed as { locale: LocaleCode }).locale
    }
  } catch {
    /* ignore corrupt prefs */
  }
  return null
}

/**
 * Bootstrap locale before first paint: stored preference, else browser, else en.
 * Safe to call from `main.tsx`.
 */
export function bootstrapLocale(): LocaleCode {
  const stored = readStoredLocalePreference()
  return setActiveLocale(resolveLocale(stored))
}

/** System preset display name via catalog (falls back to stored EN name). */
export function systemPresetLabel(id: string, fallback: string): string {
  return getMessages().systemPresets[id] ?? fallback
}

/** System sequence name/summary via catalog. */
export function systemSequenceLabel(
  id: string,
  field: 'name' | 'summary',
  fallback: string,
): string {
  const entry = getMessages().systemSequences[id]
  return entry?.[field] ?? fallback
}

/** System sequence stage name via catalog. */
export function systemStageLabel(
  sequenceId: string,
  stageId: string,
  fallback: string,
): string {
  const entry = getMessages().systemSequences[sequenceId]
  return entry?.stages[stageId] ?? fallback
}

/** Format an ISO timestamp with the active locale. */
export function formatLocaleDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(getLocale(), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Stable storage / backup error codes thrown into Error.message. */
export const STORAGE_ERROR = {
  TOO_LARGE: 'storage.tooLarge',
  INVALID_JSON: 'storage.invalidJson',
  NOT_OBJECT: 'storage.notObject',
  FORBIDDEN_KEY: 'storage.forbiddenKey',
  BAD_FORMAT: 'storage.badFormat',
  BAD_VERSION: 'storage.badVersion',
  BAD_PRESETS: 'storage.badPresets',
  PRESETS_TOO_MANY: 'storage.presetsTooMany',
  EXPORT_FAILED: 'storage.exportFailed',
  IMPORT_FAILED: 'storage.importFailed',
  ERASE_FAILED: 'storage.eraseFailed',
  RETENTION_FAILED: 'storage.retentionFailed',
  STORAGE_UNAVAILABLE: 'storage.unavailable',
} as const

export type StorageErrorCode = keyof typeof STORAGE_ERROR

/** Stable preset-save error codes. */
export const PRESET_ERROR = {
  NAME_REQUIRED: 'preset.nameRequired',
  INVALID_RECIPE: 'preset.invalidRecipe',
  ID_REQUIRED: 'preset.idRequired',
  CANNOT_OVERWRITE_SYSTEM: 'preset.cannotOverwriteSystem',
  TOO_MANY: 'preset.tooMany',
  SAVE_FAILED: 'preset.saveFailed',
} as const

export type PresetErrorCode = keyof typeof PRESET_ERROR

function storageCopyMap(m: Messages): Record<string, string> {
  return {
    [STORAGE_ERROR.TOO_LARGE]: m.errors.storage.tooLarge,
    [STORAGE_ERROR.INVALID_JSON]: m.errors.storage.invalidJson,
    [STORAGE_ERROR.NOT_OBJECT]: m.errors.storage.notObject,
    [STORAGE_ERROR.FORBIDDEN_KEY]: m.errors.storage.forbiddenKey,
    [STORAGE_ERROR.BAD_FORMAT]: m.errors.storage.badFormat,
    [STORAGE_ERROR.BAD_VERSION]: m.errors.storage.badVersion,
    [STORAGE_ERROR.BAD_PRESETS]: m.errors.storage.badPresets,
    [STORAGE_ERROR.PRESETS_TOO_MANY]: m.errors.storage.presetsTooMany,
    [STORAGE_ERROR.EXPORT_FAILED]: m.errors.storage.exportFailed,
    [STORAGE_ERROR.IMPORT_FAILED]: m.errors.storage.importFailed,
    [STORAGE_ERROR.ERASE_FAILED]: m.errors.storage.eraseFailed,
    [STORAGE_ERROR.RETENTION_FAILED]: m.errors.storage.retentionFailed,
    [STORAGE_ERROR.STORAGE_UNAVAILABLE]: m.errors.storage.storageUnavailable,
  }
}

function presetCopyMap(m: Messages): Record<string, string> {
  return {
    [PRESET_ERROR.NAME_REQUIRED]: m.errors.preset.nameRequiredStrict,
    [PRESET_ERROR.INVALID_RECIPE]: m.errors.preset.invalidRecipe,
    [PRESET_ERROR.ID_REQUIRED]: m.errors.preset.idRequired,
    [PRESET_ERROR.CANNOT_OVERWRITE_SYSTEM]:
      m.errors.preset.cannotOverwriteSystem,
    [PRESET_ERROR.SAVE_FAILED]: m.errors.preset.saveFailed,
  }
}

function copyForStorageCode(code: string): string | null {
  return storageCopyMap(getMessages())[code] ?? null
}

function copyForPresetCode(code: string): string | null {
  const m = getMessages()
  const map = presetCopyMap(m)
  if (code in map) return map[code]!
  if (code.startsWith(`${PRESET_ERROR.TOO_MANY}:`)) {
    const max = Number(code.slice(PRESET_ERROR.TOO_MANY.length + 1))
    if (Number.isFinite(max)) return m.errors.preset.tooMany(max)
  }
  return null
}

/** Map thrown values to Settings-facing copy in the active locale. */
export function messageForStorageError(
  err: unknown,
  fallbackCode: string = STORAGE_ERROR.IMPORT_FAILED,
): string {
  const m = getMessages()
  const fallback =
    copyForStorageCode(fallbackCode) ?? m.errors.storage.importFailed

  if (!(err instanceof Error)) return fallback
  const text = err.message

  const fromCode = copyForStorageCode(text)
  if (fromCode) return fromCode

  const known = new Set(Object.values(storageCopyMap(m)))
  if (known.has(text)) return text

  if (/too large/i.test(text)) return m.errors.storage.tooLarge
  if (/not valid JSON/i.test(text)) return m.errors.storage.invalidJson
  if (/must be a JSON object/i.test(text)) return m.errors.storage.notObject
  if (/__proto__/i.test(text)) return m.errors.storage.forbiddenKey
  if (/Unsupported backup format|not a MeditateIt backup/i.test(text)) {
    return m.errors.storage.badFormat
  }
  if (/Unsupported backup version|version is not supported/i.test(text)) {
    return m.errors.storage.badVersion
  }
  if (/userPresets must be an array|presets are invalid/i.test(text)) {
    return m.errors.storage.badPresets
  }
  if (/userPresets exceeds|too many presets/i.test(text)) {
    return m.errors.storage.presetsTooMany
  }
  if (/localStorage unavailable/i.test(text)) {
    return m.errors.storage.storageUnavailable
  }

  return fallback
}

/** Map thrown values to save-preset dialog copy in the active locale. */
export function messageForPresetError(err: unknown): string {
  const m = getMessages()
  if (!(err instanceof Error)) return m.errors.preset.saveFailed
  const text = err.message

  const fromCode = copyForPresetCode(text)
  if (fromCode) return fromCode

  const known = new Set([
    ...Object.values(presetCopyMap(m)),
    m.errors.preset.nameRequired,
  ])
  if (known.has(text)) return text

  if (/name is required/i.test(text)) return m.errors.preset.nameRequiredStrict
  if (/invalid session recipe/i.test(text)) return m.errors.preset.invalidRecipe
  if (/preset id is required/i.test(text)) return m.errors.preset.idRequired
  if (/cannot overwrite a system preset/i.test(text)) {
    return m.errors.preset.cannotOverwriteSystem
  }
  if (/at most \d+ user presets/i.test(text)) {
    const match = text.match(/at most (\d+)/i)
    const max = match ? Number(match[1]) : NaN
    if (Number.isFinite(max)) return m.errors.preset.tooMany(max)
  }
  if (/localStorage unavailable/i.test(text)) {
    return m.errors.storage.storageUnavailable
  }

  return m.errors.preset.saveFailed
}

/** Build a coded too-many-presets error message. */
export function presetTooManyCode(max: number): string {
  return `${PRESET_ERROR.TOO_MANY}:${max}`
}

/** Catalogs for coverage checks / tooling. */
export function allCatalogs(): Record<LocaleCode, Messages> {
  return { ...CATALOGS }
}
