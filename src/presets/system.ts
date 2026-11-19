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
  'Soft 396 Hz',
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
  ['396', '396hz', 'tone', 'pink'],
)

/** Bright 528 — clear 528 tone with light pink support. */
const BRIGHT_528: Preset = systemPreset(
  'bright-528',
  'Bright 528 Hz',
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
  ['528', '528hz', 'tone', 'pink'],
)

/** Clear 741 — higher tone with sparse white air. */
const CLEAR_741: Preset = systemPreset(
  'clear-741',
  'Clear 741 Hz',
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
  ['741', '741hz', 'tone', 'white'],
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

/** Soft 174 Hz — low warm tone over quiet brown. */
const SOFT_174: Preset = systemPreset(
  'soft-174',
  'Soft 174 Hz',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 25,
      lowpassHz: 900,
      eq: { lowDb: 2, midDb: -1, highDb: -4 },
    },
    tone: {
      enabled: true,
      frequencyHz: 174,
      solfeggioId: '174',
      mildDetuneCents: 4,
      eq: { lowDb: 2, midDb: 1, highDb: -2 },
    },
    beat: { enabled: false, mode: 'off', carrierHz: 180, beatHz: 4 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.22, tone: 0.24, beat: 0, nature: 0 },
    fadeInSec: 8,
    fadeOutSec: 14,
  },
  ['tones', 'sleep'],
  ['174', '174hz', 'tone', 'brown'],
)

/** Soft 285 Hz — mid-low tone over quiet pink. */
const SOFT_285: Preset = systemPreset(
  'soft-285',
  'Soft 285 Hz',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 50,
      lowpassHz: 3500,
      eq: { lowDb: 1, midDb: -1, highDb: -2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 285,
      solfeggioId: '285',
      mildDetuneCents: 3,
      eq: { lowDb: 1, midDb: 2, highDb: -1 },
    },
    beat: { enabled: false, mode: 'off', carrierHz: 200, beatHz: 8 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.18, tone: 0.26, beat: 0, nature: 0 },
    fadeInSec: 6,
    fadeOutSec: 11,
  },
  ['tones', 'calm'],
  ['285', '285hz', 'tone', 'pink'],
)

/** Soft 417 Hz — gentle clear tone over filtered pink. */
const SOFT_417: Preset = systemPreset(
  'soft-417',
  'Soft 417 Hz',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 70,
      lowpassHz: 4500,
      eq: { lowDb: 0, midDb: -1, highDb: -2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 417,
      solfeggioId: '417',
      mildDetuneCents: 2,
      eq: { lowDb: 0, midDb: 2, highDb: 0 },
    },
    beat: { enabled: false, mode: 'off', carrierHz: 210, beatHz: 9 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.15, tone: 0.27, beat: 0, nature: 0 },
    fadeInSec: 5,
    fadeOutSec: 10,
  },
  ['tones', 'calm'],
  ['417', '417hz', 'tone', 'pink'],
)

/** Soft 639 Hz — soft mid tone with light pink air. */
const SOFT_639: Preset = systemPreset(
  'soft-639',
  'Soft 639 Hz',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 90,
      lowpassHz: 6000,
      eq: { lowDb: -1, midDb: 0, highDb: 1 },
    },
    tone: {
      enabled: true,
      frequencyHz: 639,
      solfeggioId: '639',
      mildDetuneCents: 2,
      eq: { lowDb: -1, midDb: 2, highDb: 1 },
    },
    beat: { enabled: false, mode: 'off', carrierHz: 250, beatHz: 11 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.13, tone: 0.28, beat: 0, nature: 0 },
    fadeInSec: 4,
    fadeOutSec: 9,
  },
  ['tones', 'calm'],
  ['639', '639hz', 'tone', 'pink'],
)

/** Soft 852 Hz — higher soft tone with sparse pink. */
const SOFT_852: Preset = systemPreset(
  'soft-852',
  'Soft 852 Hz',
  12 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 140,
      lowpassHz: 7500,
      eq: { lowDb: -2, midDb: 0, highDb: 2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 852,
      solfeggioId: '852',
      mildDetuneCents: 1,
      eq: { lowDb: -2, midDb: 1, highDb: 3 },
    },
    beat: { enabled: false, mode: 'off', carrierHz: 280, beatHz: 12 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.11, tone: 0.27, beat: 0, nature: 0 },
    fadeInSec: 3,
    fadeOutSec: 8,
  },
  ['tones', 'focus'],
  ['852', '852hz', 'tone', 'pink'],
)

/** Soft 963 Hz — bright high tone with sparse white air. */
const SOFT_963: Preset = systemPreset(
  'soft-963',
  'Soft 963 Hz',
  12 * 60,
  {
    noise: {
      enabled: true,
      kind: 'white',
      highpassHz: 600,
      lowpassHz: 11_000,
      eq: { lowDb: -5, midDb: -1, highDb: 2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 963,
      solfeggioId: '963',
      mildDetuneCents: 1,
      eq: { lowDb: -3, midDb: 1, highDb: 3 },
    },
    beat: { enabled: false, mode: 'off', carrierHz: 320, beatHz: 14 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.09, tone: 0.25, beat: 0, nature: 0 },
    fadeInSec: 3,
    fadeOutSec: 7,
  },
  ['tones'],
  ['963', '963hz', 'tone', 'white'],
)

/** Quiet room — sparse pink, almost empty. */
const QUIET_ROOM: Preset = systemPreset(
  'quiet-room',
  'Quiet room',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 80,
      lowpassHz: 3000,
      eq: { lowDb: 0, midDb: -2, highDb: -4 },
    },
    tone: { enabled: false, frequencyHz: 396, mildDetuneCents: 0 },
    beat: { enabled: false, mode: 'off', carrierHz: 200, beatHz: 8 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.22, tone: 0, beat: 0, nature: 0 },
    fadeInSec: 5,
    fadeOutSec: 12,
  },
  ['calm'],
  ['pink', 'quiet', 'sparse'],
)

/** Soft veil — filtered white, low gain. */
const SOFT_VEIL: Preset = systemPreset(
  'soft-veil',
  'Soft veil',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'white',
      highpassHz: 200,
      lowpassHz: 4000,
      eq: { lowDb: -4, midDb: 0, highDb: -1 },
    },
    tone: { enabled: false, frequencyHz: 528, mildDetuneCents: 0 },
    beat: { enabled: false, mode: 'off', carrierHz: 200, beatHz: 8 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.2, tone: 0, beat: 0, nature: 0 },
    fadeInSec: 4,
    fadeOutSec: 10,
  },
  ['calm'],
  ['white', 'veil', 'soft'],
)

/** Afternoon ease — warm pink + quiet 417 Hz tone. */
const AFTERNOON_EASE: Preset = systemPreset(
  'afternoon-ease',
  'Afternoon ease',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 45,
      lowpassHz: 5500,
      eq: { lowDb: 1, midDb: 0, highDb: -1 },
    },
    tone: {
      enabled: true,
      frequencyHz: 417,
      solfeggioId: '417',
      mildDetuneCents: 4,
      eq: { lowDb: 0, midDb: 1, highDb: -1 },
    },
    beat: { enabled: false, mode: 'off', carrierHz: 210, beatHz: 8 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.28, tone: 0.12, beat: 0, nature: 0 },
    fadeInSec: 6,
    fadeOutSec: 12,
  },
  ['calm'],
  ['pink', '417', 'afternoon'],
)

/** Candle hour — low brown + soft shore. */
const CANDLE_HOUR: Preset = systemPreset(
  'candle-hour',
  'Candle hour',
  25 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 22,
      lowpassHz: 500,
      eq: { lowDb: 3, midDb: -1, highDb: -4 },
    },
    tone: { enabled: false, frequencyHz: 174, mildDetuneCents: 0 },
    beat: { enabled: false, mode: 'off', carrierHz: 180, beatHz: 3 },
    nature: { enabled: true, soundId: 'shore', brightness: 0.28 },
    gains: { noise: 0.32, tone: 0, beat: 0, nature: 0.18 },
    fadeInSec: 10,
    fadeOutSec: 18,
  },
  ['calm', 'nature'],
  ['brown', 'shore', 'evening'],
)

/** Warm arrival — short fade-in welcome with soft 528 Hz. */
const WARM_ARRIVAL: Preset = systemPreset(
  'warm-arrival',
  'Warm arrival',
  8 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 55,
      lowpassHz: 6500,
      eq: { lowDb: 0, midDb: 0, highDb: 1 },
    },
    tone: {
      enabled: true,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 2,
      eq: { lowDb: 0, midDb: 1, highDb: 1 },
    },
    beat: { enabled: false, mode: 'off', carrierHz: 220, beatHz: 8 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.24, tone: 0.14, beat: 0, nature: 0 },
    fadeInSec: 2,
    fadeOutSec: 6,
  },
  ['calm'],
  ['pink', '528', 'welcome'],
)

/** Velvet brown — deeper brown-only night. */
const VELVET_BROWN: Preset = systemPreset(
  'velvet-brown',
  'Velvet brown',
  40 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 18,
      lowpassHz: 220,
      eq: { lowDb: 5, midDb: -4, highDb: -7 },
    },
    tone: { enabled: false, frequencyHz: 174, mildDetuneCents: 0 },
    beat: { enabled: false, mode: 'off', carrierHz: 160, beatHz: 1.5 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.48, tone: 0, beat: 0, nature: 0 },
    fadeInSec: 12,
    fadeOutSec: 28,
  },
  ['sleep'],
  ['brown', 'noise', 'velvet', 'night'],
)

/** Late harbour — shore + brown, long fade. */
const LATE_HARBOUR: Preset = systemPreset(
  'late-harbour',
  'Late harbour',
  35 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 24,
      lowpassHz: 450,
      eq: { lowDb: 3, midDb: -2, highDb: -5 },
    },
    tone: { enabled: false, frequencyHz: 174, mildDetuneCents: 0 },
    beat: { enabled: false, mode: 'off', carrierHz: 170, beatHz: 2 },
    nature: { enabled: true, soundId: 'shore', brightness: 0.26 },
    gains: { noise: 0.34, tone: 0, beat: 0, nature: 0.22 },
    fadeInSec: 12,
    fadeOutSec: 30,
  },
  ['sleep', 'nature'],
  ['shore', 'brown', 'harbour', 'night'],
)

/** Midnight shore — shore-led night bed. */
const MIDNIGHT_SHORE: Preset = systemPreset(
  'midnight-shore',
  'Midnight shore',
  45 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 30,
      lowpassHz: 380,
      eq: { lowDb: 2, midDb: -2, highDb: -5 },
    },
    tone: { enabled: false, frequencyHz: 174, mildDetuneCents: 0 },
    beat: { enabled: false, mode: 'off', carrierHz: 175, beatHz: 2 },
    nature: { enabled: true, soundId: 'shore', brightness: 0.22 },
    gains: { noise: 0.2, tone: 0, beat: 0, nature: 0.36 },
    fadeInSec: 14,
    fadeOutSec: 26,
  },
  ['sleep', 'nature'],
  ['shore', 'midnight', 'night'],
)

/** Long fade night — sleep bed with long fade-out. */
const LONG_FADE_NIGHT: Preset = systemPreset(
  'long-fade-night',
  'Long fade night',
  50 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 20,
      lowpassHz: 360,
      eq: { lowDb: 3, midDb: -2, highDb: -5 },
    },
    tone: {
      enabled: true,
      frequencyHz: 174,
      solfeggioId: '174',
      mildDetuneCents: 5,
      eq: { lowDb: 1, midDb: 0, highDb: -3 },
    },
    beat: { enabled: true, mode: 'binaural', carrierHz: 180, beatHz: 2 },
    nature: { enabled: true, soundId: 'rain', brightness: 0.25 },
    gains: { noise: 0.28, tone: 0.08, beat: 0.1, nature: 0.16 },
    fadeInSec: 10,
    fadeOutSec: 40,
  },
  ['sleep'],
  ['brown', '174', 'rain', 'longfade'],
)

/** Deep work pulse — stronger mid-rate focus. */
const DEEP_WORK_PULSE: Preset = systemPreset(
  'deep-work-pulse',
  'Deep work pulse',
  25 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 60,
      lowpassHz: 7000,
      eq: { lowDb: -1, midDb: 1, highDb: 1 },
    },
    tone: {
      enabled: true,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 1,
      eq: { lowDb: -1, midDb: 1, highDb: 2 },
    },
    beat: { enabled: true, mode: 'binaural', carrierHz: 220, beatHz: 15 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.26, tone: 0.12, beat: 0.18, nature: 0 },
    fadeInSec: 3,
    fadeOutSec: 8,
  },
  ['focus', 'beats'],
  ['pink', '528', 'binaural', '15hz', 'work'],
)

/** Reading haze — soft white + low beat. */
const READING_HAZE: Preset = systemPreset(
  'reading-haze',
  'Reading haze',
  30 * 60,
  {
    noise: {
      enabled: true,
      kind: 'white',
      highpassHz: 150,
      lowpassHz: 4800,
      eq: { lowDb: -3, midDb: 0, highDb: -1 },
    },
    tone: { enabled: false, frequencyHz: 528, mildDetuneCents: 0 },
    beat: {
      enabled: true,
      mode: 'isochronic',
      carrierHz: 200,
      beatHz: 9,
      pulseDepth: 0.45,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.28, tone: 0, beat: 0.1, nature: 0 },
    fadeInSec: 4,
    fadeOutSec: 10,
  },
  ['focus', 'calm'],
  ['white', 'isochronic', '9hz', 'reading'],
)

/** Clear desk — bright pink + light pulse. */
const CLEAR_DESK: Preset = systemPreset(
  'clear-desk',
  'Clear desk',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 100,
      lowpassHz: 8000,
      eq: { lowDb: -2, midDb: 1, highDb: 2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 741,
      solfeggioId: '741',
      mildDetuneCents: 1,
      eq: { lowDb: -1, midDb: 1, highDb: 2 },
    },
    beat: {
      enabled: true,
      mode: 'isochronic',
      carrierHz: 240,
      beatHz: 12,
      pulseDepth: 0.5,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.22, tone: 0.14, beat: 0.12, nature: 0 },
    fadeInSec: 3,
    fadeOutSec: 7,
  },
  ['focus'],
  ['pink', '741', 'isochronic', '12hz'],
)

/** Deadline soft — focus without harsh edge. */
const DEADLINE_SOFT: Preset = systemPreset(
  'deadline-soft',
  'Deadline soft',
  25 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 50,
      lowpassHz: 5000,
      eq: { lowDb: 0, midDb: 0, highDb: -2 },
    },
    tone: {
      enabled: true,
      frequencyHz: 396,
      solfeggioId: '396',
      mildDetuneCents: 3,
      eq: { lowDb: 1, midDb: 1, highDb: -1 },
    },
    beat: { enabled: true, mode: 'binaural', carrierHz: 200, beatHz: 12 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.24, tone: 0.1, beat: 0.12, nature: 0 },
    fadeInSec: 5,
    fadeOutSec: 10,
  },
  ['focus', 'calm'],
  ['pink', '396', 'binaural', '12hz', 'soft'],
)

/** Moss rain — forest + light pink underlay. */
const MOSS_RAIN: Preset = systemPreset(
  'moss-rain',
  'Moss rain',
  25 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 40,
      lowpassHz: 4000,
      eq: { lowDb: 1, midDb: -1, highDb: -2 },
    },
    tone: { enabled: false, frequencyHz: 285, mildDetuneCents: 0 },
    beat: { enabled: false, mode: 'off', carrierHz: 200, beatHz: 6 },
    nature: { enabled: true, soundId: 'forest', brightness: 0.4 },
    gains: { noise: 0.16, tone: 0, beat: 0, nature: 0.34 },
    fadeInSec: 7,
    fadeOutSec: 14,
  },
  ['nature'],
  ['forest', 'moss', 'pink'],
)

/** Canyon wind — wind-forward open space. */
const CANYON_WIND: Preset = systemPreset(
  'canyon-wind',
  'Canyon wind',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'white',
      highpassHz: 250,
      lowpassHz: 7000,
      eq: { lowDb: -4, midDb: 0, highDb: 1 },
    },
    tone: { enabled: false, frequencyHz: 528, mildDetuneCents: 0 },
    beat: { enabled: false, mode: 'off', carrierHz: 220, beatHz: 8 },
    nature: { enabled: true, soundId: 'wind', brightness: 0.55 },
    gains: { noise: 0.14, tone: 0, beat: 0, nature: 0.38 },
    fadeInSec: 5,
    fadeOutSec: 12,
  },
  ['nature'],
  ['wind', 'canyon', 'white'],
)

/** Tide pool — shore + sparse 285 Hz tone. */
const TIDE_POOL: Preset = systemPreset(
  'tide-pool',
  'Tide pool',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 70,
      lowpassHz: 2500,
      eq: { lowDb: 0, midDb: -2, highDb: -3 },
    },
    tone: {
      enabled: true,
      frequencyHz: 285,
      solfeggioId: '285',
      mildDetuneCents: 6,
      eq: { lowDb: 1, midDb: 0, highDb: -2 },
    },
    beat: { enabled: false, mode: 'off', carrierHz: 190, beatHz: 5 },
    nature: { enabled: true, soundId: 'shore', brightness: 0.35 },
    gains: { noise: 0.14, tone: 0.1, beat: 0, nature: 0.3 },
    fadeInSec: 8,
    fadeOutSec: 15,
  },
  ['nature', 'calm'],
  ['shore', '285', 'tide'],
)

/** Cedar dusk — forest evening with soft brown. */
const CEDAR_DUSK: Preset = systemPreset(
  'cedar-dusk',
  'Cedar dusk',
  25 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 28,
      lowpassHz: 800,
      eq: { lowDb: 2, midDb: -1, highDb: -3 },
    },
    tone: { enabled: false, frequencyHz: 174, mildDetuneCents: 0 },
    beat: { enabled: false, mode: 'off', carrierHz: 180, beatHz: 4 },
    nature: { enabled: true, soundId: 'forest', brightness: 0.3 },
    gains: { noise: 0.26, tone: 0, beat: 0, nature: 0.28 },
    fadeInSec: 9,
    fadeOutSec: 16,
  },
  ['nature', 'calm'],
  ['forest', 'brown', 'dusk', 'cedar'],
)

/** Beta nudge — higher ~18 Hz work beat. */
const BETA_NUDGE: Preset = systemPreset(
  'beta-nudge',
  '~18 Hz nudge',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 80,
      lowpassHz: 7500,
      eq: { lowDb: -1, midDb: 1, highDb: 1 },
    },
    tone: {
      enabled: true,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 0,
      eq: { lowDb: -1, midDb: 1, highDb: 2 },
    },
    beat: { enabled: true, mode: 'binaural', carrierHz: 240, beatHz: 18 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.2, tone: 0.1, beat: 0.16, nature: 0 },
    fadeInSec: 3,
    fadeOutSec: 7,
  },
  ['beats', 'focus'],
  ['binaural', '18hz', '528', 'beta'],
)

/** Soft iso 12 — ~12 Hz isochronic. */
const SOFT_ISO_12: Preset = systemPreset(
  'soft-iso-12',
  '~12 Hz soft pulse',
  18 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 55,
      lowpassHz: 6000,
      eq: { lowDb: 0, midDb: 0, highDb: -1 },
    },
    tone: {
      enabled: true,
      frequencyHz: 432,
      mildDetuneCents: 2,
      eq: { lowDb: 0, midDb: 1, highDb: 0 },
    },
    beat: {
      enabled: true,
      mode: 'isochronic',
      carrierHz: 210,
      beatHz: 12,
      pulseDepth: 0.55,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.22, tone: 0.1, beat: 0.14, nature: 0 },
    fadeInSec: 4,
    fadeOutSec: 9,
  },
  ['beats', 'calm'],
  ['isochronic', '12hz', '432', 'soft'],
)

/** Binaural seven — ~7 Hz glide. */
const BINAURAL_SEVEN: Preset = systemPreset(
  'binaural-seven',
  '~7 Hz glide',
  25 * 60,
  {
    noise: {
      enabled: true,
      kind: 'brown',
      highpassHz: 25,
      lowpassHz: 600,
      eq: { lowDb: 2, midDb: -1, highDb: -3 },
    },
    tone: {
      enabled: true,
      frequencyHz: 174,
      solfeggioId: '174',
      mildDetuneCents: 4,
      eq: { lowDb: 1, midDb: 0, highDb: -2 },
    },
    beat: { enabled: true, mode: 'binaural', carrierHz: 190, beatHz: 7 },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.26, tone: 0.1, beat: 0.14, nature: 0 },
    fadeInSec: 8,
    fadeOutSec: 16,
  },
  ['beats', 'sleep'],
  ['binaural', '7hz', '174', 'brown'],
)

/** Pulse walk — walking-pace iso pulse. */
const PULSE_WALK: Preset = systemPreset(
  'pulse-walk',
  'Pulse walk',
  20 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 70,
      lowpassHz: 5500,
      eq: { lowDb: 0, midDb: 0, highDb: 0 },
    },
    tone: { enabled: false, frequencyHz: 528, mildDetuneCents: 0 },
    beat: {
      enabled: true,
      mode: 'isochronic',
      carrierHz: 200,
      beatHz: 1.7,
      pulseDepth: 0.7,
    },
    nature: { enabled: false, soundId: null, brightness: 0.5 },
    gains: { noise: 0.24, tone: 0, beat: 0.16, nature: 0 },
    fadeInSec: 4,
    fadeOutSec: 10,
  },
  ['beats', 'calm'],
  ['isochronic', '1.7hz', 'walk', 'pulse'],
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
  SOFT_174,
  SOFT_285,
  SOFT_396,
  SOFT_417,
  BRIGHT_528,
  SOFT_639,
  CLEAR_741,
  SOFT_852,
  SOFT_963,
  ALPHA_GLIDE,
  THETA_DRIFT,
  DELTA_SETTLE,
  SPEAKER_PULSE,
  BETA_NUDGE,
  SOFT_ISO_12,
  BINAURAL_SEVEN,
  PULSE_WALK,
  NIGHT_RAIN,
  STUDY_GROVE,
  MORNING_CLEAR,
  DUSK_HUM,
  QUIET_ROOM,
  SOFT_VEIL,
  AFTERNOON_EASE,
  CANDLE_HOUR,
  WARM_ARRIVAL,
  VELVET_BROWN,
  LATE_HARBOUR,
  MIDNIGHT_SHORE,
  LONG_FADE_NIGHT,
  DEEP_WORK_PULSE,
  READING_HAZE,
  CLEAR_DESK,
  DEADLINE_SOFT,
  MOSS_RAIN,
  CANYON_WIND,
  TIDE_POOL,
  CEDAR_DUSK,
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
