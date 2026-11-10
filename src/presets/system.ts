import type { PresetCategoryId } from './categories.ts'
import { cloneRecipe } from './recipe.ts'
import type { Preset, SessionRecipe } from './types.ts'

const STABLE_UPDATED_AT = '2026-11-09T00:00:00.000Z'

function systemPreset(
  id: string,
  name: string,
  defaultDurationSec: number | null,
  recipe: SessionRecipe,
  categories: readonly PresetCategoryId[],
  tags: readonly string[] = [],
): Preset {
  return {
    id,
    name,
    source: 'system',
    defaultDurationSec,
    updatedAt: STABLE_UPDATED_AT,
    recipe,
    categories,
    tags,
  }
}

/**
 * Daily calm — speaker-friendly quick start (isochronic, not binaural).
 * Good default for one-tap / last-used fallback.
 */
const DAILY_CALM: Preset = systemPreset(
  'daily-calm',
  'Daily calm',
  10 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 40,
      lowpassHz: 7000,
    },
    tone: {
      enabled: true,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 0,
    },
    beat: {
      enabled: true,
      mode: 'isochronic',
      carrierHz: 200,
      beatHz: 8,
      pulseDepth: 0.65,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.3, tone: 0.15, beat: 0.12, nature: 0 },
    fadeInSec: 5,
    fadeOutSec: 10,
  },
  ['calm', 'tones'],
  ['pink', '528', 'isochronic', 'speakers'],
)

/** Sleep — deep brown bed + slow ~2 Hz binaural; long fade-out. */
const SLEEP: Preset = systemPreset(
  'sleep',
  'Sleep',
  45 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 20,
      lowpassHz: 400,
    },
    tone: {
      enabled: true,
      frequencyHz: 174,
      solfeggioId: '174',
      mildDetuneCents: 3,
    },
    beat: {
      enabled: true,
      mode: 'binaural',
      carrierHz: 200,
      beatHz: 2,
    },
    nature: { enabled: true, soundId: 'rain', brightness: 0.35 },
    gains: { noise: 0.38, tone: 0.1, beat: 0.14, nature: 0.18 },
    fadeInSec: 10,
    fadeOutSec: 20,
  },
  ['sleep'],
  ['brown', 'rain', 'binaural', '174'],
)

/** Focus — pink + 528 + mid-rate ~16 Hz binaural. */
const FOCUS: Preset = systemPreset(
  'focus',
  'Focus',
  25 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 60,
      lowpassHz: 6000,
    },
    tone: {
      enabled: true,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 2,
    },
    beat: {
      enabled: true,
      mode: 'binaural',
      carrierHz: 280,
      beatHz: 16,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.28, tone: 0.16, beat: 0.14, nature: 0 },
    fadeInSec: 4,
    fadeOutSec: 8,
  },
  ['focus', 'beats'],
  ['pink', '528', 'binaural', '16hz'],
)

/** Soft calm — soft pink + 396 + gentle ~10 Hz binaural. Id kept for last-used prefs. */
const ANXIETY_SOFTENER: Preset = systemPreset(
  'anxiety-softener',
  'Soft calm',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 50,
      lowpassHz: 4500,
      eq: { lowDb: 1, midDb: 0, highDb: -2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 396,
      solfeggioId: '396',
      mildDetuneCents: 4,
    },
    beat: {
      enabled: true,
      mode: 'binaural',
      carrierHz: 220,
      beatHz: 10,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.3, tone: 0.14, beat: 0.12, nature: 0 },
    fadeInSec: 8,
    fadeOutSec: 12,
  },
  ['calm'],
  ['pink', '396', 'binaural', 'soften'],
)

/** Deep rest — brown rumble + low tone + slow ~1.5 Hz beat; open-ended. */
const DEEP_REST: Preset = systemPreset(
  'deep-rest',
  'Deep rest',
  null,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 20,
      lowpassHz: 350,
    },
    tone: {
      enabled: true,
      frequencyHz: 285,
      solfeggioId: '285',
      mildDetuneCents: 2,
    },
    beat: {
      enabled: true,
      mode: 'binaural',
      carrierHz: 180,
      beatHz: 1.5,
    },
    nature: { enabled: true, soundId: 'shore', brightness: 0.4 },
    gains: { noise: 0.36, tone: 0.08, beat: 0.12, nature: 0.16 },
    fadeInSec: 12,
    fadeOutSec: 24,
  },
  ['sleep', 'calm'],
  ['brown', 'shore', '285', 'open'],
)

/** Forest canopy — nature-forward canopy wash; no beat. */
const FOREST_CANOPY: Preset = systemPreset(
  'forest-canopy',
  'Forest canopy',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 80,
      lowpassHz: 3500,
      eq: { lowDb: -2, midDb: 1, highDb: 2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 285,
      solfeggioId: '285',
      mildDetuneCents: 6,
      eq: { lowDb: 0, midDb: -1, highDb: -3 },
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 200,
      beatHz: 8,
    },
    nature: { enabled: true, soundId: 'forest', brightness: 0.62 },
    gains: { noise: 0.18, tone: 0.07, beat: 0, nature: 0.42 },
    fadeInSec: 8,
    fadeOutSec: 14,
  },
  ['nature', 'calm'],
  ['forest', 'pink', '285'],
)

/** Rain window — rain-led bed with muted brown; no tone or beat. */
const RAIN_WINDOW: Preset = systemPreset(
  'rain-window',
  'Rain window',
  30 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 30,
      lowpassHz: 500,
      eq: { lowDb: 3, midDb: -2, highDb: -4 },
    },
    tone: {
      enabled: false,
      frequencyHz: 174,
      mildDetuneCents: 0,
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 200,
      beatHz: 2,
    },
    nature: { enabled: true, soundId: 'rain', brightness: 0.55 },
    gains: { noise: 0.22, tone: 0, beat: 0, nature: 0.48 },
    fadeInSec: 6,
    fadeOutSec: 16,
  },
  ['nature', 'sleep'],
  ['rain', 'brown'],
)

/** Shore wash — shoreline nature + soft white veil + gentle isochronic. */
const SHORE_WASH: Preset = systemPreset(
  'shore-wash',
  'Shore wash',
  25 * 60,
  {
    noise: {
      enabled: true,
      kind: 'white',
      highpassHz: 200,
      lowpassHz: 4500,
      eq: { lowDb: -4, midDb: 0, highDb: 1 },
    },
    tone: {
      enabled: false,
      frequencyHz: 396,
      mildDetuneCents: 0,
    },
    beat: {
      enabled: true,
      mode: 'isochronic',
      carrierHz: 160,
      beatHz: 5,
      pulseDepth: 0.4,
      eq: { lowDb: 2, midDb: 0, highDb: -2 },
    },
    nature: { enabled: true, soundId: 'shore', brightness: 0.48 },
    gains: { noise: 0.14, tone: 0, beat: 0.1, nature: 0.4 },
    fadeInSec: 7,
    fadeOutSec: 14,
  },
  ['nature', 'calm'],
  ['shore', 'white', 'isochronic'],
)

/** Open wind — wind layer with airy white; no tone or beat. */
const OPEN_WIND: Preset = systemPreset(
  'open-wind',
  'Open wind',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'white',
      highpassHz: 400,
      lowpassHz: 9000,
      eq: { lowDb: -6, midDb: -1, highDb: 3 },
    },
    tone: {
      enabled: false,
      frequencyHz: 528,
      mildDetuneCents: 0,
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 200,
      beatHz: 8,
    },
    nature: { enabled: true, soundId: 'wind', brightness: 0.7 },
    gains: { noise: 0.16, tone: 0, beat: 0, nature: 0.44 },
    fadeInSec: 5,
    fadeOutSec: 12,
  },
  ['nature'],
  ['wind', 'white'],
)

/** Pink bed — noise-only pink blanket. */
const PINK_BED: Preset = systemPreset(
  'pink-bed',
  'Pink bed',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 35,
      lowpassHz: 8000,
      eq: { lowDb: 2, midDb: 0, highDb: -1 },
    },
    tone: {
      enabled: false,
      frequencyHz: 528,
      mildDetuneCents: 0,
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 200,
      beatHz: 8,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.42, tone: 0, beat: 0, nature: 0 },
    fadeInSec: 4,
    fadeOutSec: 10,
  },
  ['calm'],
  ['pink', 'noise'],
)

/** Brown depth — deep brown rumble only. */
const BROWN_DEPTH: Preset = systemPreset(
  'brown-depth',
  'Brown depth',
  null,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 20,
      lowpassHz: 280,
      eq: { lowDb: 4, midDb: -3, highDb: -6 },
    },
    tone: {
      enabled: false,
      frequencyHz: 174,
      mildDetuneCents: 0,
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 180,
      beatHz: 2,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.46, tone: 0, beat: 0, nature: 0 },
    fadeInSec: 10,
    fadeOutSec: 22,
  },
  ['sleep', 'calm'],
  ['brown', 'noise', 'deep'],
)

/** White haze — filtered white veil for light masking. */
const WHITE_HAZE: Preset = systemPreset(
  'white-haze',
  'White haze',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'white',
      highpassHz: 120,
      lowpassHz: 5500,
      eq: { lowDb: -3, midDb: 1, highDb: 0 },
    },
    tone: {
      enabled: false,
      frequencyHz: 528,
      mildDetuneCents: 0,
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 200,
      beatHz: 8,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.34, tone: 0, beat: 0, nature: 0 },
    fadeInSec: 3,
    fadeOutSec: 8,
  },
  ['calm', 'focus'],
  ['white', 'noise', 'mask'],
)

/** Soft 396 — tone-forward 396 over a quiet pink bed. */
const SOFT_396: Preset = systemPreset(
  'soft-396',
  'Soft 396',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 60,
      lowpassHz: 4000,
      eq: { lowDb: 0, midDb: -2, highDb: -3 },
    },
    tone: {
      enabled: true,
      frequencyHz: 396,
      solfeggioId: '396',
      mildDetuneCents: 5,
      eq: { lowDb: 1, midDb: 2, highDb: -1 },
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 220,
      beatHz: 10,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.16, tone: 0.28, beat: 0, nature: 0 },
    fadeInSec: 6,
    fadeOutSec: 10,
  },
  ['tones', 'calm'],
  ['396', 'tone', 'pink'],
)

/** Bright 528 — clear 528 tone with light pink support. */
const BRIGHT_528: Preset = systemPreset(
  'bright-528',
  'Bright 528',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 100,
      lowpassHz: 7000,
      eq: { lowDb: -2, midDb: 0, highDb: 2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 1,
      eq: { lowDb: -1, midDb: 2, highDb: 3 },
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 240,
      beatHz: 12,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.14, tone: 0.3, beat: 0, nature: 0 },
    fadeInSec: 4,
    fadeOutSec: 8,
  },
  ['tones', 'focus'],
  ['528', 'tone', 'pink'],
)

/** Clear 741 — higher tone with sparse white air. */
const CLEAR_741: Preset = systemPreset(
  'clear-741',
  'Clear 741',
  12 * 60,
  {
    noise: {
      enabled: true,
      kind: 'white',
      highpassHz: 500,
      lowpassHz: 10_000,
      eq: { lowDb: -5, midDb: -1, highDb: 2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 741,
      solfeggioId: '741',
      mildDetuneCents: 2,
      eq: { lowDb: -2, midDb: 1, highDb: 3 },
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 300,
      beatHz: 12,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.1, tone: 0.26, beat: 0, nature: 0 },
    fadeInSec: 3,
    fadeOutSec: 7,
  },
  ['tones'],
  ['741', 'tone', 'white'],
)

/** ~10 Hz glide — gentle binaural with quiet carrier focus. */
const ALPHA_GLIDE: Preset = systemPreset(
  'alpha-glide',
  '~10 Hz glide',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 70,
      lowpassHz: 3000,
      eq: { lowDb: 0, midDb: -1, highDb: -3 },
    },
    tone: {
      enabled: false,
      frequencyHz: 396,
      mildDetuneCents: 0,
    },
    beat: {
      enabled: true,
      mode: 'binaural',
      carrierHz: 220,
      beatHz: 10,
      eq: { lowDb: 1, midDb: 2, highDb: 0 },
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.18, tone: 0, beat: 0.26, nature: 0 },
    fadeInSec: 6,
    fadeOutSec: 10,
  },
  ['beats', 'calm'],
  ['binaural', '10hz'],
)

/** ~6 Hz drift — binaural over soft brown. */
const THETA_DRIFT: Preset = systemPreset(
  'theta-drift',
  '~6 Hz drift',
  25 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 25,
      lowpassHz: 600,
      eq: { lowDb: 2, midDb: -1, highDb: -4 },
    },
    tone: {
      enabled: true,
      frequencyHz: 174,
      solfeggioId: '174',
      mildDetuneCents: 3,
      eq: { lowDb: 2, midDb: 0, highDb: -3 },
    },
    beat: {
      enabled: true,
      mode: 'binaural',
      carrierHz: 160,
      beatHz: 6,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.28, tone: 0.08, beat: 0.22, nature: 0 },
    fadeInSec: 9,
    fadeOutSec: 16,
  },
  ['beats', 'sleep'],
  ['binaural', '6hz', 'brown'],
)

/** ~1.5 Hz night bed — very slow binaural for night listening. */
const DELTA_SETTLE: Preset = systemPreset(
  'delta-settle',
  '~1.5 Hz night bed',
  40 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 20,
      lowpassHz: 320,
      eq: { lowDb: 3, midDb: -2, highDb: -5 },
    },
    tone: {
      enabled: false,
      frequencyHz: 174,
      mildDetuneCents: 0,
    },
    beat: {
      enabled: true,
      mode: 'binaural',
      carrierHz: 140,
      beatHz: 1.5,
      eq: { lowDb: 3, midDb: 0, highDb: -4 },
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.32, tone: 0, beat: 0.2, nature: 0 },
    fadeInSec: 14,
    fadeOutSec: 28,
  },
  ['beats', 'sleep'],
  ['binaural', '1.5hz', 'brown'],
)

/** Speaker pulse — deeper isochronic pulse for speakers. */
const SPEAKER_PULSE: Preset = systemPreset(
  'speaker-pulse',
  'Speaker pulse',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 50,
      lowpassHz: 6500,
    },
    tone: {
      enabled: true,
      frequencyHz: 432,
      mildDetuneCents: 0,
      eq: { lowDb: 0, midDb: 1, highDb: 0 },
    },
    beat: {
      enabled: true,
      mode: 'isochronic',
      carrierHz: 180,
      beatHz: 7,
      pulseDepth: 0.85,
      eq: { lowDb: 2, midDb: 1, highDb: -1 },
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.24, tone: 0.12, beat: 0.22, nature: 0 },
    fadeInSec: 4,
    fadeOutSec: 9,
  },
  ['beats', 'calm'],
  ['isochronic', 'speakers', '7hz', '432'],
)

/** Night rain — sleep bed with stronger rain and slow beat. */
const NIGHT_RAIN: Preset = systemPreset(
  'night-rain',
  'Night rain',
  50 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 20,
      lowpassHz: 450,
      eq: { lowDb: 2, midDb: -2, highDb: -3 },
    },
    tone: {
      enabled: true,
      frequencyHz: 174,
      solfeggioId: '174',
      mildDetuneCents: 4,
    },
    beat: {
      enabled: true,
      mode: 'binaural',
      carrierHz: 190,
      beatHz: 2.5,
    },
    nature: { enabled: true, soundId: 'rain', brightness: 0.42 },
    gains: { noise: 0.3, tone: 0.08, beat: 0.12, nature: 0.32 },
    fadeInSec: 12,
    fadeOutSec: 24,
  },
  ['sleep', 'nature'],
  ['rain', 'brown', 'binaural', 'night'],
)

/** Study grove — focus binaural with soft forest air. */
const STUDY_GROVE: Preset = systemPreset(
  'study-grove',
  'Study grove',
  30 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 70,
      lowpassHz: 5500,
      eq: { lowDb: -1, midDb: 1, highDb: 0 },
    },
    tone: {
      enabled: true,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 2,
    },
    beat: {
      enabled: true,
      mode: 'binaural',
      carrierHz: 260,
      beatHz: 14,
    },
    nature: { enabled: true, soundId: 'forest', brightness: 0.38 },
    gains: { noise: 0.22, tone: 0.12, beat: 0.14, nature: 0.16 },
    fadeInSec: 5,
    fadeOutSec: 10,
  },
  ['focus', 'nature'],
  ['forest', 'binaural', '14hz', '528'],
)

/** Morning clear — brighter mix with mid-rate isochronic. */
const MORNING_CLEAR: Preset = systemPreset(
  'morning-clear',
  'Morning clear',
  12 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 90,
      lowpassHz: 9000,
      eq: { lowDb: -2, midDb: 1, highDb: 3 },
    },
    tone: {
      enabled: true,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 0,
      eq: { lowDb: -1, midDb: 1, highDb: 2 },
    },
    beat: {
      enabled: true,
      mode: 'isochronic',
      carrierHz: 220,
      beatHz: 10,
      pulseDepth: 0.55,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.26, tone: 0.18, beat: 0.14, nature: 0 },
    fadeInSec: 3,
    fadeOutSec: 7,
  },
  ['calm', 'focus'],
  ['pink', '528', 'isochronic', 'morning'],
)

/** Dusk hum — evening brown + low tone + soft shore; no beat. */
const DUSK_HUM: Preset = systemPreset(
  'dusk-hum',
  'Dusk hum',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 25,
      lowpassHz: 700,
      eq: { lowDb: 2, midDb: 0, highDb: -2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 174,
      solfeggioId: '174',
      mildDetuneCents: 7,
      eq: { lowDb: 2, midDb: 1, highDb: -2 },
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 180,
      beatHz: 4,
    },
    nature: { enabled: true, soundId: 'shore', brightness: 0.32 },
    gains: { noise: 0.3, tone: 0.16, beat: 0, nature: 0.2 },
    fadeInSec: 9,
    fadeOutSec: 18,
  },
  ['calm', 'nature'],
  ['brown', '174', 'shore', 'dusk'],
)

/** Read-only system templates — clone before editing. */
export const SYSTEM_PRESETS: readonly Preset[] = Object.freeze([
  DAILY_CALM,
  SLEEP,
  FOCUS,
  ANXIETY_SOFTENER,
  DEEP_REST,
  FOREST_CANOPY,
  RAIN_WINDOW,
  SHORE_WASH,
  OPEN_WIND,
  PINK_BED,
  BROWN_DEPTH,
  WHITE_HAZE,
  SOFT_396,
  BRIGHT_528,
  CLEAR_741,
  ALPHA_GLIDE,
  THETA_DRIFT,
  DELTA_SETTLE,
  SPEAKER_PULSE,
  NIGHT_RAIN,
  STUDY_GROVE,
  MORNING_CLEAR,
  DUSK_HUM,
])

const BY_ID = new Map(SYSTEM_PRESETS.map((p) => [p.id, p]))

export function listSystemPresets(): readonly Preset[] {
  return SYSTEM_PRESETS
}

export function getSystemPreset(id: string): Preset | undefined {
  const preset = BY_ID.get(id)
  return preset ? structuredClone(preset) : undefined
}

export function isSystemPresetId(id: string): boolean {
  return BY_ID.has(id)
}

/** Clone a preset (system or user) into a new editable user preset draft. */
export function cloneAsUserPreset(
  preset: Preset,
  name?: string,
  id?: string,
): Preset {
  return {
    id: id ?? crypto.randomUUID(),
    name: name ?? `${preset.name} (copy)`,
    source: 'user',
    recipe: cloneRecipe(preset.recipe),
    defaultDurationSec: preset.defaultDurationSec,
    updatedAt: new Date().toISOString(),
  }
}
