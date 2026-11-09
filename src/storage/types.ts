import type { Preset, UserPrefs } from '../presets/index.ts'
import type { Sequence } from '../sequences/types.ts'

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
  /** Multi-stage sequence id when the listen came from a sequence */
  sequenceId: string | null
}

/** Backup document schema (JSON file download / paste). */
export interface BackupDocument {
  format: 'meditateit-backup'
  version: 1
  exportedAt: string
  prefs: UserPrefs
  userPresets: Preset[]
  /**
   * User sequences. Always present on export (may be `[]`).
   * On import `replace`, omitted / non-array → wipe stored sequences
   * (same honesty as history when omitted).
   */
  sequences?: Sequence[] | unknown[]
  /** Optional — included so a full device restore can bring history too */
  sessionHistory?: SessionRecord[]
}

export type BackupImportMode = 'merge' | 'replace'

export interface BackupImportResult {
  mode: BackupImportMode
  prefs: UserPrefs
  userPresetCount: number
  userSequenceCount: number
  historyCount: number
}
