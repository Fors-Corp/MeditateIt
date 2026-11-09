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

const NOISE_KINDS = new Set<NoiseKind>(['white', 'pink', 'brown'])
const BEAT_MODES = new Set<BeatMode>(['off', 'binaural', 'isochronic'])
const NATURE_SOUNDS = new Set<NatureSoundId>([
  'rain',
  'shore',
  'wind',
  'forest',
])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clampEqDb(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.min(12, Math.max(-12, value))
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function clamp01(value: unknown, fallback: number): number {
  const n = finiteOr(value, fallback)
  return Math.min(1, Math.max(0, n))
}

function clampNonNeg(value: unknown, fallback: number): number {
  const n = finiteOr(value, fallback)
  return n < 0 ? fallback : n
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
  if (!isPlainObject(value)) return false
  return (
    isPlainObject(value.noise) &&
    isPlainObject(value.tone) &&
    isPlainObject(value.beat) &&
    isPlainObject(value.nature) &&
    isPlainObject(value.gains) &&
    typeof value.fadeInSec === 'number' &&
    Number.isFinite(value.fadeInSec) &&
    typeof value.fadeOutSec === 'number' &&
    Number.isFinite(value.fadeOutSec)
  )
}

/**
 * Rebuild a recipe from untrusted JSON (backup import / localStorage).
 * Drops unknown keys, whitelists enums, and clamps numeric ranges.
 * Returns null when the shape is not a recipe at all.
 */
export function normalizeRecipe(raw: unknown): SessionRecipe | null {
  if (!isValidRecipe(raw)) return null

  const blank = createBlankRecipe()
  const noiseKind = raw.noise.kind
  const beatMode = raw.beat.mode
  const natureSound = raw.nature.soundId

  return {
    noise: {
      enabled: raw.noise.enabled === true,
      kind: NOISE_KINDS.has(noiseKind as NoiseKind)
        ? (noiseKind as NoiseKind)
        : blank.noise.kind,
      highpassHz: clampNonNeg(raw.noise.highpassHz, blank.noise.highpassHz!),
      lowpassHz: clampNonNeg(raw.noise.lowpassHz, blank.noise.lowpassHz!),
      eq: cloneLayerEq(
        isPlainObject(raw.noise.eq)
          ? (raw.noise.eq as unknown as LayerEqParams)
          : null,
      ),
    },
    tone: {
      enabled: raw.tone.enabled === true,
      frequencyHz: clampNonNeg(raw.tone.frequencyHz, blank.tone.frequencyHz),
      solfeggioId:
        typeof raw.tone.solfeggioId === 'string'
          ? raw.tone.solfeggioId.slice(0, 32)
          : blank.tone.solfeggioId,
      mildDetuneCents: (() => {
        const n = finiteOr(raw.tone.mildDetuneCents, 0)
        return Math.min(50, Math.max(-50, n))
      })(),
      eq: cloneLayerEq(
        isPlainObject(raw.tone.eq)
          ? (raw.tone.eq as unknown as LayerEqParams)
          : null,
      ),
    },
    beat: {
      enabled: raw.beat.enabled === true,
      mode: BEAT_MODES.has(beatMode as BeatMode)
        ? (beatMode as BeatMode)
        : blank.beat.mode,
      carrierHz: clampNonNeg(raw.beat.carrierHz, blank.beat.carrierHz),
      beatHz: clampNonNeg(raw.beat.beatHz, blank.beat.beatHz),
      pulseDepth: clamp01(raw.beat.pulseDepth, blank.beat.pulseDepth!),
      eq: cloneLayerEq(
        isPlainObject(raw.beat.eq)
          ? (raw.beat.eq as unknown as LayerEqParams)
          : null,
      ),
    },
    nature: {
      enabled: raw.nature.enabled === true,
      soundId:
        natureSound === null
          ? null
          : NATURE_SOUNDS.has(natureSound as NatureSoundId)
            ? (natureSound as NatureSoundId)
            : blank.nature.soundId,
      brightness: clamp01(raw.nature.brightness, blank.nature.brightness!),
      eq: cloneLayerEq(
        isPlainObject(raw.nature.eq)
          ? (raw.nature.eq as unknown as LayerEqParams)
          : null,
      ),
    },
    gains: {
      noise: clamp01(raw.gains.noise, blank.gains.noise),
      tone: clamp01(raw.gains.tone, blank.gains.tone),
      beat: clamp01(raw.gains.beat, blank.gains.beat),
      nature: clamp01(raw.gains.nature, blank.gains.nature),
    },
    fadeInSec: clampNonNeg(raw.fadeInSec, blank.fadeInSec),
    fadeOutSec: clampNonNeg(raw.fadeOutSec, blank.fadeOutSec),
  }
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

export function cloneRecipe(recipe: SessionRecipe): SessionRecipe {
  // Route through normalize so clones from partially-trusted sources stay clean.
  return normalizeRecipe(recipe) ?? createBlankRecipe()
}
