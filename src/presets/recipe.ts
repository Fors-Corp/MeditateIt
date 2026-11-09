import {
  NEUTRAL_LAYER_EQ,
  type LayerEqParams,
  type LayerGains,
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

function clampEqDb(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.min(12, Math.max(-12, value))
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
  return {
    noise: { ...recipe.noise, eq: cloneLayerEq(recipe.noise.eq) },
    tone: { ...recipe.tone, eq: cloneLayerEq(recipe.tone.eq) },
    beat: { ...recipe.beat, eq: cloneLayerEq(recipe.beat.eq) },
    nature: { ...recipe.nature, eq: cloneLayerEq(recipe.nature.eq) },
    gains: { ...recipe.gains },
    fadeInSec: recipe.fadeInSec,
    fadeOutSec: recipe.fadeOutSec,
  }
}
