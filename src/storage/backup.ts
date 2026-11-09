import type { Preset, UserPrefs } from '../presets/index.ts'
import { loadPrefs, normalizePrefs, savePrefs } from './prefs.ts'
import {
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
import { MAX_BACKUP_CHARS, MAX_USER_PRESETS } from './limits.ts'
import {
  listUserPresets,
  mergeUserPresets,
  replaceUserPresets,
} from './userPresets.ts'

export const BACKUP_FORMAT = 'meditateit-backup' as const
export const BACKUP_VERSION = 1 as const

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Build a downloadable backup of prefs + user presets (+ optional history). */
export async function exportBackup(options?: {
  includeHistory?: boolean
}): Promise<BackupDocument> {
  const includeHistory = options?.includeHistory !== false
  const [prefs, userPresets, sessionHistory] = await Promise.all([
    loadPrefs(),
    listUserPresets(),
    includeHistory ? listSessionHistory() : Promise.resolve([] as SessionRecord[]),
  ])

  const doc: BackupDocument = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    prefs,
    userPresets,
    sequences: [],
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
 * Throws on unrecognized format / oversized payloads.
 */
export function parseBackup(raw: unknown): BackupDocument {
  if (typeof raw === 'string' && raw.length > MAX_BACKUP_CHARS) {
    throw new Error(
      `Backup too large (max ${Math.floor(MAX_BACKUP_CHARS / (1024 * 1024))} MB)`,
    )
  }

  let value: unknown
  try {
    value = typeof raw === 'string' ? (JSON.parse(raw) as unknown) : raw
  } catch {
    throw new Error('Backup is not valid JSON')
  }

  if (!isObject(value)) {
    throw new Error('Backup must be a JSON object')
  }
  if (Object.prototype.hasOwnProperty.call(value, '__proto__')) {
    throw new Error('Backup contains forbidden __proto__ key')
  }
  if (value.format !== BACKUP_FORMAT) {
    throw new Error(`Unsupported backup format (expected ${BACKUP_FORMAT})`)
  }
  if (value.version !== BACKUP_VERSION) {
    throw new Error(`Unsupported backup version (expected ${BACKUP_VERSION})`)
  }
  if (!Array.isArray(value.userPresets)) {
    throw new Error('Backup userPresets must be an array')
  }
  if (value.userPresets.length > MAX_USER_PRESETS * 2) {
    // Allow a little headroom in the file; persist path still caps.
    throw new Error(`Backup userPresets exceeds ${MAX_USER_PRESETS * 2} entries`)
  }

  const prefs = normalizePrefs(value.prefs)
  const sessionHistory = Array.isArray(value.sessionHistory)
    ? (value.sessionHistory as SessionRecord[])
    : undefined
  // Sequences are reserved; drop anything oversized / non-array.
  const sequences = Array.isArray(value.sequences)
    ? value.sequences.slice(0, 50)
    : []

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt:
      typeof value.exportedAt === 'string' && value.exportedAt.length > 0
        ? value.exportedAt.slice(0, 64)
        : new Date().toISOString(),
    prefs,
    userPresets: value.userPresets as Preset[],
    sequences,
    ...(sessionHistory ? { sessionHistory } : {}),
  }
}

/**
 * Import a backup.
 * - `replace`: overwrite prefs + user presets (+ history when present)
 * - `merge`: imported prefs fields win; presets/history merge by id
 */
export async function importBackup(
  raw: unknown,
  mode: BackupImportMode,
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

  let historyCount = 0
  if (doc.sessionHistory) {
    const history =
      mode === 'replace'
        ? await replaceSessionHistory(doc.sessionHistory)
        : await mergeSessionHistory(doc.sessionHistory)
    historyCount = history.length
  } else if (mode === 'replace') {
    // Replace without history field leaves existing history intact
    // (prefs/presets only). Callers who want a full wipe clear history first.
    historyCount = (await listSessionHistory()).length
  } else {
    historyCount = (await listSessionHistory()).length
  }

  return {
    mode,
    prefs,
    userPresetCount: userPresets.length,
    historyCount,
  }
}

/** Trigger a browser download of the current backup. */
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
