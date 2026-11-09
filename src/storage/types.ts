import type { Preset, UserPrefs } from '../presets/index.ts'

/** One finished (or abandoned-while-playing) listening session. */
export interface SessionRecord {
  id: string
  /** ISO timestamp when playback started */
  startedAt: string
  /** ISO timestamp when playback stopped */
  endedAt: string
  /** Wall-clock seconds between start and end (integer ≥ 0) */
  durationSec: number
  /** Preset id at end of session; null for unnamed custom */
  presetId: string | null
  /** Display name snapshot (preset may be deleted later) */
  presetName: string
  /** Reserved for W3-2 multi-stage sequences */
  sequenceId: string | null
}

/** Backup document schema (JSON file download / paste). */
export interface BackupDocument {
  format: 'meditateit-backup'
  version: 1
  exportedAt: string
  prefs: UserPrefs
  userPresets: Preset[]
  /** Optional — present when sequences exist; ignored if empty */
  sequences?: unknown[]
  /** Optional — included so a full device restore can bring history too */
  sessionHistory?: SessionRecord[]
}

export type BackupImportMode = 'merge' | 'replace'

export interface BackupImportResult {
  mode: BackupImportMode
  prefs: UserPrefs
  userPresetCount: number
  historyCount: number
}
