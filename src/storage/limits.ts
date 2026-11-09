/** Bounds for backup import / persisted user content (adversarial hardening). */

/** Reject backup JSON strings larger than this before parse. */
export const MAX_BACKUP_CHARS = 2 * 1024 * 1024

/** Cap on imported / stored user presets. */
export const MAX_USER_PRESETS = 200

/** Cap on imported / stored user sequences (mirrors presets). */
export const MAX_USER_SEQUENCES = 200

/** Cap on stages per user sequence. */
export const MAX_SEQUENCE_STAGES = 24

/** Cap on preset / history / sequence display names. */
export const MAX_NAME_CHARS = 120

/** Cap on sequence home-list blurbs. */
export const MAX_SUMMARY_CHARS = 200

/** Cap on persisted ids (preset, session, sequence). */
export const MAX_ID_CHARS = 128

/** Soft ceiling for fade-in / fade-out seconds (UI + engine). */
export const MAX_FADE_SEC = 180

/** Soft ceiling for default / timer duration seconds. */
export const MAX_DURATION_SEC = 24 * 60 * 60
