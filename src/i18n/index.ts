/**
 * i18n readiness scaffold — English catalog only.
 * Keep documentElement / manifest lang as `en`; no second locale this wave.
 */

import { en } from './en.ts'

export { en }
export type { EnMessages } from './en.ts'

/** Active catalog (EN-only). Swap later when a second locale ships. */
export const messages = en

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

const STORAGE_CODE_TO_COPY: Record<string, string> = {
  [STORAGE_ERROR.TOO_LARGE]: en.errors.storage.tooLarge,
  [STORAGE_ERROR.INVALID_JSON]: en.errors.storage.invalidJson,
  [STORAGE_ERROR.NOT_OBJECT]: en.errors.storage.notObject,
  [STORAGE_ERROR.FORBIDDEN_KEY]: en.errors.storage.forbiddenKey,
  [STORAGE_ERROR.BAD_FORMAT]: en.errors.storage.badFormat,
  [STORAGE_ERROR.BAD_VERSION]: en.errors.storage.badVersion,
  [STORAGE_ERROR.BAD_PRESETS]: en.errors.storage.badPresets,
  [STORAGE_ERROR.PRESETS_TOO_MANY]: en.errors.storage.presetsTooMany,
  [STORAGE_ERROR.EXPORT_FAILED]: en.errors.storage.exportFailed,
  [STORAGE_ERROR.IMPORT_FAILED]: en.errors.storage.importFailed,
  [STORAGE_ERROR.ERASE_FAILED]: en.errors.storage.eraseFailed,
  [STORAGE_ERROR.RETENTION_FAILED]: en.errors.storage.retentionFailed,
  [STORAGE_ERROR.STORAGE_UNAVAILABLE]: en.errors.storage.storageUnavailable,
}

const PRESET_CODE_TO_COPY: Record<string, string> = {
  [PRESET_ERROR.NAME_REQUIRED]: en.errors.preset.nameRequiredStrict,
  [PRESET_ERROR.INVALID_RECIPE]: en.errors.preset.invalidRecipe,
  [PRESET_ERROR.ID_REQUIRED]: en.errors.preset.idRequired,
  [PRESET_ERROR.CANNOT_OVERWRITE_SYSTEM]:
    en.errors.preset.cannotOverwriteSystem,
  [PRESET_ERROR.SAVE_FAILED]: en.errors.preset.saveFailed,
}

const KNOWN_STORAGE_COPY = new Set(Object.values(STORAGE_CODE_TO_COPY))
const KNOWN_PRESET_COPY = new Set([
  ...Object.values(PRESET_CODE_TO_COPY),
  en.errors.preset.nameRequired,
])

function copyForStorageCode(code: string): string | null {
  return STORAGE_CODE_TO_COPY[code] ?? null
}

function copyForPresetCode(code: string): string | null {
  if (code in PRESET_CODE_TO_COPY) return PRESET_CODE_TO_COPY[code]!
  if (code.startsWith(`${PRESET_ERROR.TOO_MANY}:`)) {
    const max = Number(code.slice(PRESET_ERROR.TOO_MANY.length + 1))
    if (Number.isFinite(max)) return en.errors.preset.tooMany(max)
  }
  return null
}

/** Map thrown values to stable Settings-facing EN copy. */
export function messageForStorageError(
  err: unknown,
  fallbackCode: string = STORAGE_ERROR.IMPORT_FAILED,
): string {
  const fallback =
    copyForStorageCode(fallbackCode) ?? en.errors.storage.importFailed

  if (!(err instanceof Error)) return fallback
  const m = err.message

  const fromCode = copyForStorageCode(m)
  if (fromCode) return fromCode
  if (KNOWN_STORAGE_COPY.has(m)) return m

  if (/too large/i.test(m)) return en.errors.storage.tooLarge
  if (/not valid JSON/i.test(m)) return en.errors.storage.invalidJson
  if (/must be a JSON object/i.test(m)) return en.errors.storage.notObject
  if (/__proto__/i.test(m)) return en.errors.storage.forbiddenKey
  if (/Unsupported backup format|not a MeditateIt backup/i.test(m)) {
    return en.errors.storage.badFormat
  }
  if (/Unsupported backup version|version is not supported/i.test(m)) {
    return en.errors.storage.badVersion
  }
  if (/userPresets must be an array|presets are invalid/i.test(m)) {
    return en.errors.storage.badPresets
  }
  if (/userPresets exceeds|too many presets/i.test(m)) {
    return en.errors.storage.presetsTooMany
  }
  if (/localStorage unavailable/i.test(m)) {
    return en.errors.storage.storageUnavailable
  }

  return fallback
}

/** Map thrown values to save-preset dialog EN copy. */
export function messageForPresetError(err: unknown): string {
  if (!(err instanceof Error)) return en.errors.preset.saveFailed
  const m = err.message

  const fromCode = copyForPresetCode(m)
  if (fromCode) return fromCode
  if (KNOWN_PRESET_COPY.has(m)) return m

  if (/name is required/i.test(m)) return en.errors.preset.nameRequiredStrict
  if (/invalid session recipe/i.test(m)) return en.errors.preset.invalidRecipe
  if (/preset id is required/i.test(m)) return en.errors.preset.idRequired
  if (/cannot overwrite a system preset/i.test(m)) {
    return en.errors.preset.cannotOverwriteSystem
  }
  if (/at most \d+ user presets/i.test(m)) {
    const match = m.match(/at most (\d+)/i)
    const max = match ? Number(match[1]) : NaN
    if (Number.isFinite(max)) return en.errors.preset.tooMany(max)
  }
  if (/localStorage unavailable/i.test(m)) {
    return en.errors.storage.storageUnavailable
  }

  return en.errors.preset.saveFailed
}

/** Build a coded too-many-presets error message. */
export function presetTooManyCode(max: number): string {
  return `${PRESET_ERROR.TOO_MANY}:${max}`
}
