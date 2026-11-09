/** localStorage keys for MeditateIt persistence. */
export const STORAGE_KEYS = {
  prefs: 'meditateit:prefs:v1',
  userPresets: 'meditateit:user-presets:v1',
  sessionHistory: 'meditateit:session-history:v1',
  /** Time-based history retention preference (days or forever). */
  historyRetention: 'meditateit:history-retention:v1',
} as const
