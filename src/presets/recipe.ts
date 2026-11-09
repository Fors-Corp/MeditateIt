import type { LayerGains, SessionRecipe } from './types.ts'

/** Conservative layer defaults — brown-friendly, below soft-limiter risk. */
export const DEFAULT_GAINS: Readonly<LayerGains> = {
  noise: 0.32,
  tone: 0.18,
  beat: 0.16,
  nature: 0.2,
}

export const DEFAULT_FADE_IN_SEC = 6
export const DEFAULT_FADE_OUT_SEC = 10

/** Blank / custom starting recipe (pink + soft 528, beats off). */
export function createBlankRecipe(): SessionRecipe {
  return {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 40,
      lowpassHz: 8000,
    },
    tone: {
      enabled: false,
      frequencyHz: 528,
      solfeggioId: '528',
      mildDetuneCents: 0,
    },
    beat: {
      enabled: false,
      mode: 'off',
      carrierHz: 240,
      beatHz: 8,
      pulseDepth: 0.7,
    },
    nature: {
      enabled: false,
      soundId: null,
      brightness: 0.5,
    },
    gains: { ...DEFAULT_GAINS },
    fadeInSec: DEFAULT_FADE_IN_SEC,
    fadeOutSec: DEFAULT_FADE_OUT_SEC,
  }
}

export function cloneRecipe(recipe: SessionRecipe): SessionRecipe {
  return {
    noise: { ...recipe.noise },
    tone: { ...recipe.tone },
    beat: { ...recipe.beat },
    nature: { ...recipe.nature },
    gains: { ...recipe.gains },
    fadeInSec: recipe.fadeInSec,
    fadeOutSec: recipe.fadeOutSec,
  }
}
