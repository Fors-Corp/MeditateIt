/**
 * Local persistence for prefs, user presets, user sequences, session history,
 * and backups (localStorage, async API). System presets stay in `src/presets`;
 * system sequences stay in `src/sequences`.
 */

import {
  getSystemPreset,
  listSystemPresets,
  type Preset,
  type UserPrefs,
} from '../presets/index.ts'
import {
  cloneSequence,
  getSystemSequence,
  listSystemSequences,
  type Sequence,
} from '../sequences/index.ts'
import { loadPrefs, updatePrefs } from './prefs.ts'
import {
  deleteUserPreset,
  getUserPreset,
  listUserPresets,
} from './userPresets.ts'
import {
  deleteUserSequence,
  getUserSequence,
  listUserSequences,
} from './userSequences.ts'

export { STORAGE_KEYS } from './keys.ts'

export {
  MAX_BACKUP_CHARS,
  MAX_DURATION_SEC,
  MAX_FADE_SEC,
  MAX_ID_CHARS,
  MAX_NAME_CHARS,
  MAX_SEQUENCE_STAGES,
  MAX_SUMMARY_CHARS,
  MAX_USER_PRESETS,
  MAX_USER_SEQUENCES,
} from './limits.ts'

export type {
  BackupDocument,
  BackupImportMode,
  BackupImportResult,
  SessionRecord,
} from './types.ts'

export {
  DEFAULT_PREFS,
  loadPrefs,
  normalizePrefs,
  savePrefs,
  updatePrefs,
} from './prefs.ts'

export {
  deleteUserPreset,
  getUserPreset,
  listUserPresets,
  mergeUserPresets,
  replaceUserPresets,
  saveUserPreset,
  type SaveUserPresetInput,
} from './userPresets.ts'

export {
  clearUserSequences,
  deleteUserSequence,
  getUserSequence,
  listUserSequences,
  mergeUserSequences,
  normalizeUserSequence,
  replaceUserSequences,
  saveUserSequence,
  type SaveUserSequenceInput,
} from './userSequences.ts'

export {
  appendSessionRecord,
  applySessionHistoryRetention,
  clearSessionHistory,
  filterHistoryByRetention,
  listSessionHistory,
  mergeSessionHistory,
  MIN_SESSION_DURATION_SEC,
  normalizeSessionRecord,
  replaceSessionHistory,
  SESSION_HISTORY_LIMIT,
  type AppendSessionInput,
} from './sessionHistory.ts'

export {
  HISTORY_RETENTION_DAY_OPTIONS,
  labelForHistoryRetention,
  loadHistoryRetentionDays,
  normalizeHistoryRetentionDays,
  saveHistoryRetentionDays,
  type HistoryRetentionDays,
} from './historyRetention.ts'

export {
  eraseAllLocalData,
  type EraseAllOptions,
  type EraseAllResult,
} from './erase.ts'

export {
  messageForStorageError,
  STORAGE_ERROR,
  type StorageErrorCode,
} from './errors.ts'

export {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  downloadBackup,
  exportBackup,
  importBackup,
  parseBackup,
  stringifyBackup,
  type ImportBackupOptions,
} from './backup.ts'

/** System templates first, then user presets (insertion / save order). */
export async function listAllPresets(): Promise<Preset[]> {
  const user = await listUserPresets()
  return [...listSystemPresets().map((p) => structuredClone(p)), ...user]
}

/** Resolve system or user preset by id. */
export async function getPreset(id: string): Promise<Preset | null> {
  const system = getSystemPreset(id)
  if (system) return system
  return getUserPreset(id)
}

/** System templates first, then user sequences. */
export async function listAllSequences(): Promise<Sequence[]> {
  const user = await listUserSequences()
  return [...listSystemSequences().map((s) => cloneSequence(s)), ...user]
}

/** Resolve system or user sequence by id. */
export async function getSequence(id: string): Promise<Sequence | null> {
  const system = getSystemSequence(id)
  if (system) return system
  return getUserSequence(id)
}

/**
 * Last-used preset for quick start.
 * Falls back to Daily calm when unset / missing.
 */
export async function getLastUsedPreset(): Promise<Preset> {
  const prefs = await loadPrefs()
  if (prefs.lastPresetId) {
    const found = await getPreset(prefs.lastPresetId)
    if (found) return found
  }
  return getSystemPreset('daily-calm') ?? listSystemPresets()[0]!
}

/** Record which preset the session started from (and optional recipe snapshot). */
export async function rememberLastPreset(
  presetId: string,
  recipe?: UserPrefs['lastRecipe'],
): Promise<UserPrefs> {
  return updatePrefs({
    lastPresetId: presetId,
    ...(recipe !== undefined ? { lastRecipe: recipe } : {}),
  })
}

/** Delete a user preset and clear lastPresetId when it pointed there. */
export async function deleteUserPresetAndForget(
  id: string,
): Promise<boolean> {
  const removed = await deleteUserPreset(id)
  if (!removed) return false
  const prefs = await loadPrefs()
  if (prefs.lastPresetId === id) {
    await updatePrefs({ lastPresetId: null })
  }
  return true
}

/** Delete a user sequence (system ids are no-ops). */
export async function deleteUserSequenceAndForget(
  id: string,
): Promise<boolean> {
  return deleteUserSequence(id)
}
