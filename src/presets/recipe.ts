import {
  NEUTRAL_LAYER_EQ,
  type BeatMode,
  type LayerEqParams,
  type LayerGains,
  type NatureSoundId,
  type NoiseKind,
  type SessionRecipe,
} from './types.ts'

/** Conservative layer defaults — brown-friendly, below soft-limiter risk. */
export const DEFAULT_GAINS: Readonly<LayerGains> = {
  noise: 0.32,
  tone: 0.18,
  beat: 0.16,
  nature: 0.2,
}

export const DEFAULT_FADE_IN_SEC = 6
export const DEFAULT_FADE_OUT_SEC = 10

/** Keep in sync with storage/audio fade ceilings. */
const FADE_SEC_MAX = 180
const GAIN_MAX = 1
const CARRIER_MIN = 80
const CARRIER_MAX = 2000
const BEAT_MIN = 0.5
const BEAT_MAX = 40
const HPF_MIN = 20
const HPF_MAX = 2000
const LPF_MIN = 200
const LPF_MAX = 16_000

const NOISE_KINDS = new Set<NoiseKind>(['white', 'pink', 'brown'])
const BEAT_MODES = new Set<BeatMode>(['off', 'binaural', 'isochronic'])
const NATURE_IDS = new Set<NatureSoundId>(['rain', 'shore', 'wind', 'forest'])

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clampEqDb(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.min(12, Math.max(-12, value))
}

function clampFinite(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

function clampGain(value: unknown, fallback: number): number {
  return clampFinite(value, 0, GAIN_MAX, fallback)
}

function clampFade(value: unknown, fallback: number): number {
  return clampFinite(value, 0, FADE_SEC_MAX, fallback)
}

/** Safe EQ snapshot for recipes / presets (neutral when missing or invalid). */
export function cloneLayerEq(eq?: LayerEqParams | null): LayerEqParams {
  if (!eq || typeof eq !== 'object') {
    return { ...NEUTRAL_LAYER_EQ }
  }
  return {
    lowDb: clampEqDb(eq.lowDb),
    midDb: clampEqDb(eq.midDb),
    highDb: clampEqDb(eq.highDb),
  }
}

/**
 * Structural gate used by import / prefs. Does not trust nested field types —
 * pair with {@link normalizeRecipe} before persistence or playback.
 */
export function isValidRecipe(value: unknown): value is SessionRecipe {
  if (!isObject(value)) return false
  return (
    isObject(value.noise) &&
    isObject(value.tone) &&
    isObject(value.beat) &&
    isObject(value.nature) &&
    isObject(value.gains) &&
    typeof value.fadeInSec === 'number' &&
    Number.isFinite(value.fadeInSec) &&
    typeof value.fadeOutSec === 'number' &&
    Number.isFinite(value.fadeOutSec)
  )
}

/** Blank / custom starting recipe (pink + soft 528, beats off). */
export function createBlankRecipe(): SessionRecipe {
  return {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 40,
      lowpassHz: 8000,
      eq: { ...NEUTRAL_LAYER_EQ },
    },
    tone: {
      enabled: false,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 0,
      eq: { ...NEUTRAL_LAYER_EQ },
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 240,
      beatHz: 8,
      pulseDepth: 0.7,
      eq: { ...NEUTRAL_LAYER_EQ },
    },
    nature: {
      enabled: false,
      soundId: null,
      brightness: 0.5,
      eq: { ...NEUTRAL_LAYER_EQ },
    },
    gains: { ...DEFAULT_GAINS },
    fadeInSec: DEFAULT_FADE_IN_SEC,
    fadeOutSec: DEFAULT_FADE_OUT_SEC,
  }
}

/**
 * Deep-normalize an unknown recipe from backup / prefs.
 * Returns null when the shape is not a usable SessionRecipe.
 * Whitelists enums, clamps audio-safe numeric ranges, drops unknown keys.
 */
export function normalizeRecipe(raw: unknown): SessionRecipe | null {
  if (!isValidRecipe(raw)) return null

  const noiseKind = raw.noise.kind
  if (typeof noiseKind !== 'string' || !NOISE_KINDS.has(noiseKind as NoiseKind)) {
    return null
  }

  const beatMode = raw.beat.mode
  if (typeof beatMode !== 'string' || !BEAT_MODES.has(beatMode as BeatMode)) {
    return null
  }

  const toneHz = raw.tone.frequencyHz
  if (typeof toneHz !== 'number' || !Number.isFinite(toneHz)) return null

  const carrierHz = raw.beat.carrierHz
  if (typeof carrierHz !== 'number' || !Number.isFinite(carrierHz)) return null

  const beatHz = raw.beat.beatHz
  if (typeof beatHz !== 'number' || !Number.isFinite(beatHz)) return null

  let soundId: NatureSoundId | null = null
  if (raw.nature.soundId === null || raw.nature.soundId === undefined) {
    soundId = null
  } else if (
    typeof raw.nature.soundId === 'string' &&
    NATURE_IDS.has(raw.nature.soundId as NatureSoundId)
  ) {
    soundId = raw.nature.soundId as NatureSoundId
  } else {
    return null
  }

  const blank = createBlankRecipe()
  const hpf = clampFinite(
    raw.noise.highpassHz,
    HPF_MIN,
    HPF_MAX,
    blank.noise.highpassHz ?? 40,
  )
  const lpf = clampFinite(
    raw.noise.lowpassHz,
    LPF_MIN,
    LPF_MAX,
    blank.noise.lowpassHz ?? 8000,
  )

  return {
    noise: {
      enabled: raw.noise.enabled === true,
      kind: noiseKind as NoiseKind,
      highpassHz: hpf,
      lowpassHz: Math.max(lpf, hpf + 50),
      eq: cloneLayerEq(
        isObject(raw.noise.eq)
          ? (raw.noise.eq as unknown as LayerEqParams)
          : null,
      ),
    },
    tone: {
      enabled: raw.tone.enabled === true,
      frequencyHz: clampFinite(toneHz, CARRIER_MIN, CARRIER_MAX, 528),
      solfeggioId:
        typeof raw.tone.solfeggioId === 'string'
          ? raw.tone.solfeggioId.slice(0, 32)
          : undefined,
      mildDetuneCents: clampFinite(raw.tone.mildDetuneCents, -50, 50, 0),
      eq: cloneLayerEq(
        isObject(raw.tone.eq)
          ? (raw.tone.eq as unknown as LayerEqParams)
          : null,
      ),
    },
    beat: {
      enabled: raw.beat.enabled === true,
      mode: beatMode as BeatMode,
      carrierHz: clampFinite(carrierHz, CARRIER_MIN, CARRIER_MAX, 240),
      beatHz: clampFinite(beatHz, BEAT_MIN, BEAT_MAX, 8),
      pulseDepth: clampFinite(raw.beat.pulseDepth, 0, 1, 0.7),
      eq: cloneLayerEq(
        isObject(raw.beat.eq)
          ? (raw.beat.eq as unknown as LayerEqParams)
          : null,
      ),
    },
    nature: {
      enabled: raw.nature.enabled === true,
      soundId,
      brightness: clampFinite(raw.nature.brightness, 0, 1, 0.5),
      eq: cloneLayerEq(
        isObject(raw.nature.eq)
          ? (raw.nature.eq as unknown as LayerEqParams)
          : null,
      ),
    },
    gains: {
      noise: clampGain(raw.gains.noise, DEFAULT_GAINS.noise),
      tone: clampGain(raw.gains.tone, DEFAULT_GAINS.tone),
      beat: clampGain(raw.gains.beat, DEFAULT_GAINS.beat),
      nature: clampGain(raw.gains.nature, DEFAULT_GAINS.nature),
    },
    fadeInSec: clampFade(raw.fadeInSec, DEFAULT_FADE_IN_SEC),
    fadeOutSec: clampFade(raw.fadeOutSec, DEFAULT_FADE_OUT_SEC),
  }
}

export function cloneRecipe(recipe: SessionRecipe): SessionRecipe {
  // Route through normalize so clones from partially-trusted sources stay clean.
  return normalizeRecipe(recipe) ?? createBlankRecipe()
}
