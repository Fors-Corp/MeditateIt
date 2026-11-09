import type { Preset, UserPrefs } from '../presets/index.ts'
import type { Sequence } from '../sequences/types.ts'
import { STORAGE_ERROR } from './errors.ts'
import {
  MAX_BACKUP_CHARS,
  MAX_USER_PRESETS,
  MAX_USER_SEQUENCES,
} from './limits.ts'
import { loadPrefs, normalizePrefs, savePrefs } from './prefs.ts'
import {
  clearSessionHistory,
  listSessionHistory,
  mergeSessionHistory,
  replaceSessionHistory,
} from './sessionHistory.ts'
import type {
  BackupDocument,
  BackupImportMode,
  BackupImportResult,
  SessionRecord,
} from './types.ts'
import {
  listUserPresets,
  mergeUserPresets,
  replaceUserPresets,
} from './userPresets.ts'
import {
  clearUserSequences,
  listUserSequences,
  mergeUserSequences,
  replaceUserSequences,
} from './userSequences.ts'

export const BACKUP_FORMAT = 'meditateit-backup' as const
export const BACKUP_VERSION = 1 as const

/** Alias kept for callers that imported the security-branch name. */
export const BACKUP_MAX_CHARS = MAX_BACKUP_CHARS

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Build a downloadable backup of prefs + user presets + sequences (+ optional history). */
export async function exportBackup(options?: {
  includeHistory?: boolean
}): Promise<BackupDocument> {
  const includeHistory = options?.includeHistory !== false
  const [prefs, userPresets, sequences, sessionHistory] = await Promise.all([
    loadPrefs(),
    listUserPresets(),
    listUserSequences(),
    includeHistory ? listSessionHistory() : Promise.resolve([] as SessionRecord[]),
  ])

  const doc: BackupDocument = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    prefs,
    userPresets,
    sequences,
  }
  if (includeHistory) {
    doc.sessionHistory = sessionHistory
  }
  return doc
}

export function stringifyBackup(doc: BackupDocument): string {
  return `${JSON.stringify(doc, null, 2)}\n`
}

/**
 * Parse + soft-validate a backup JSON string or object.
 * Throws with stable STORAGE_ERROR messages.
 * Sequences are capped; invalid entries are dropped later on persist.
 */
export function parseBackup(raw: unknown): BackupDocument {
  if (typeof raw === 'string' && raw.length > MAX_BACKUP_CHARS) {
    throw new Error(STORAGE_ERROR.TOO_LARGE)
  }

  let value: unknown
  try {
    value = typeof raw === 'string' ? (JSON.parse(raw) as unknown) : raw
  } catch {
    throw new Error(STORAGE_ERROR.INVALID_JSON)
  }

  if (!isObject(value)) {
    throw new Error(STORAGE_ERROR.NOT_OBJECT)
  }
  if (Object.prototype.hasOwnProperty.call(value, '__proto__')) {
    throw new Error(STORAGE_ERROR.FORBIDDEN_KEY)
  }
  if (value.format !== BACKUP_FORMAT) {
    throw new Error(STORAGE_ERROR.BAD_FORMAT)
  }
  if (value.version !== BACKUP_VERSION) {
    throw new Error(STORAGE_ERROR.BAD_VERSION)
  }
  if (!Array.isArray(value.userPresets)) {
    throw new Error(STORAGE_ERROR.BAD_PRESETS)
  }
  if (value.userPresets.length > MAX_USER_PRESETS * 2) {
    // Allow a little headroom in the file; persist path still caps.
    throw new Error(STORAGE_ERROR.PRESETS_TOO_MANY)
  }
  if (
    Array.isArray(value.sequences) &&
    value.sequences.length > MAX_USER_SEQUENCES * 2
  ) {
    throw new Error(STORAGE_ERROR.PRESETS_TOO_MANY)
  }

  const prefs = normalizePrefs(value.prefs)
  const sessionHistory = Array.isArray(value.sessionHistory)
    ? (value.sessionHistory as SessionRecord[])
    : undefined
  // Preserve presence: omitted sequences → undefined (replace can wipe).
  const sequences = Array.isArray(value.sequences)
    ? (value.sequences.slice(0, MAX_USER_SEQUENCES * 2) as Sequence[])
    : undefined

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt:
      typeof value.exportedAt === 'string' && value.exportedAt.length > 0
        ? value.exportedAt.slice(0, 64)
        : new Date().toISOString(),
    prefs,
    // Raw array is re-normalized in replaceUserPresets / mergeUserPresets.
    userPresets: value.userPresets as Preset[],
    ...(sequences ? { sequences } : {}),
    ...(sessionHistory ? { sessionHistory } : {}),
  }
}

export type ImportBackupOptions = {
  /**
   * When mode is `replace` and the file omits `sessionHistory`:
   * - false (default): wipe existing history (honest full replace)
   * - true: keep existing history on device
   */
  keepHistoryWhenOmitted?: boolean
}

/**
 * Import a backup.
 * - `replace`: overwrite prefs + user presets + sequences; history from file,
 *   or wipe when omitted unless `keepHistoryWhenOmitted`. Omitted sequences
 *   wipe stored user sequences.
 * - `merge`: imported prefs fields win; presets/sequences/history merge by id
 */
export async function importBackup(
  raw: unknown,
  mode: BackupImportMode,
  options?: ImportBackupOptions,
): Promise<BackupImportResult> {
  const doc = parseBackup(raw)

  let prefs: UserPrefs
  if (mode === 'replace') {
    prefs = await savePrefs(doc.prefs)
  } else {
    const current = await loadPrefs()
    prefs = await savePrefs({ ...current, ...doc.prefs })
  }

  const userPresets =
    mode === 'replace'
      ? await replaceUserPresets(doc.userPresets)
      : await mergeUserPresets(doc.userPresets)

  let userSequences: Sequence[]
  if (doc.sequences) {
    userSequences =
      mode === 'replace'
        ? await replaceUserSequences(doc.sequences)
        : await mergeUserSequences(doc.sequences)
  } else if (mode === 'replace') {
    await clearUserSequences()
    userSequences = []
  } else {
    userSequences = await listUserSequences()
  }

  let historyCount = 0
  if (doc.sessionHistory) {
    const history =
      mode === 'replace'
        ? await replaceSessionHistory(doc.sessionHistory)
        : await mergeSessionHistory(doc.sessionHistory)
    historyCount = history.length
  } else if (mode === 'replace') {
    if (options?.keepHistoryWhenOmitted) {
      historyCount = (await listSessionHistory()).length
    } else {
      await clearSessionHistory()
      historyCount = 0
    }
  } else {
    historyCount = (await listSessionHistory()).length
  }

  return {
    mode,
    prefs,
    userPresetCount: userPresets.length,
    userSequenceCount: userSequences.length,
    historyCount,
  }
}

/** Trigger a browser download of the current backup (includes history). */
export async function downloadBackup(filename?: string): Promise<BackupDocument> {
  const doc = await exportBackup({ includeHistory: true })
  const blob = new Blob([stringifyBackup(doc)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = doc.exportedAt.slice(0, 10)
  a.href = url
  a.download = filename ?? `meditateit-backup-${stamp}.json`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return doc
}
