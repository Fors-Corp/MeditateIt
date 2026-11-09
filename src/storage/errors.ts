/**
 * Stable user-facing EN strings for storage / backup failures.
 * Full message catalog is W4-7; keep these short and fixed for Settings.
 */

export const STORAGE_ERROR = {
  TOO_LARGE: 'Backup file is too large.',
  INVALID_JSON: 'Backup file is not valid JSON.',
  NOT_OBJECT: 'Backup file must be a JSON object.',
  FORBIDDEN_KEY: 'Backup file contains forbidden keys.',
  BAD_FORMAT: 'This file is not a MeditateIt backup.',
  BAD_VERSION: 'This backup version is not supported.',
  BAD_PRESETS: 'Backup presets are invalid.',
  PRESETS_TOO_MANY: 'Backup has too many presets.',
  EXPORT_FAILED: 'Could not export backup.',
  IMPORT_FAILED: 'Could not import backup.',
  ERASE_FAILED: 'Could not erase local data.',
  RETENTION_FAILED: 'Could not update history retention.',
  STORAGE_UNAVAILABLE: 'Local storage is unavailable.',
} as const

export type StorageErrorCode = keyof typeof STORAGE_ERROR

const KNOWN_MESSAGES = new Set<string>(Object.values(STORAGE_ERROR))

/** Map thrown values to a stable Settings-facing string. */
export function messageForStorageError(
  err: unknown,
  fallback: string = STORAGE_ERROR.IMPORT_FAILED,
): string {
  if (err instanceof Error && KNOWN_MESSAGES.has(err.message)) {
    return err.message
  }
  if (err instanceof Error) {
    const m = err.message
    if (/too large/i.test(m)) return STORAGE_ERROR.TOO_LARGE
    if (/not valid JSON/i.test(m)) return STORAGE_ERROR.INVALID_JSON
    if (/must be a JSON object/i.test(m)) return STORAGE_ERROR.NOT_OBJECT
    if (/__proto__/i.test(m)) return STORAGE_ERROR.FORBIDDEN_KEY
    if (/Unsupported backup format/i.test(m)) return STORAGE_ERROR.BAD_FORMAT
    if (/Unsupported backup version/i.test(m)) return STORAGE_ERROR.BAD_VERSION
    if (/userPresets must be an array/i.test(m)) return STORAGE_ERROR.BAD_PRESETS
    if (/userPresets exceeds/i.test(m)) return STORAGE_ERROR.PRESETS_TOO_MANY
    if (/localStorage unavailable/i.test(m)) return STORAGE_ERROR.STORAGE_UNAVAILABLE
  }
  return fallback
}
