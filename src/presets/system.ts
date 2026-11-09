import { cloneRecipe } from './recipe.ts'
import type { Preset, SessionRecipe } from './types.ts'

const STABLE_UPDATED_AT = '2026-11-09T00:00:00.000Z'

function systemPreset(
  id: string,
  name: string,
  defaultDurationSec: number | null,
  recipe: SessionRecipe,
): Preset {
  return {
    id,
    name,
    source: 'system',
    defaultDurationSec,
    updatedAt: STABLE_UPDATED_AT,
    recipe,
  }
}

/** Sleep — deep brown bed + delta binaural; long fade-out. */
const SLEEP: Preset = systemPreset('sleep', 'Sleep', 45 * 60, {
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
  nature: { enabled: false, soundId: null },
  gains: { noise: 0.38, tone: 0.1, beat: 0.14, nature: 0 },
  fadeInSec: 10,
  fadeOutSec: 20,
})

/** Focus — pink + 528 + mid-beta binaural. */
const FOCUS: Preset = systemPreset('focus', 'Focus', 25 * 60, {
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
  nature: { enabled: false, soundId: null },
  gains: { noise: 0.28, tone: 0.16, beat: 0.14, nature: 0 },
  fadeInSec: 4,
  fadeOutSec: 8,
})

/** Anxiety softener — soft pink + 396 + alpha binaural. */
const ANXIETY_SOFTENER: Preset = systemPreset(
  'anxiety-softener',
  'Anxiety softener',
  15 * 60,
  {
    noise: {
      enabled: true,
      kind: 'pink',
      highpassHz: 50,
      lowpassHz: 4500,
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
    nature: { enabled: false, soundId: null },
    gains: { noise: 0.3, tone: 0.14, beat: 0.12, nature: 0 },
    fadeInSec: 8,
    fadeOutSec: 12,
  },
)

/** Deep rest — brown rumble + low tone + slow delta; open-ended. */
const DEEP_REST: Preset = systemPreset('deep-rest', 'Deep rest', null, {
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
  nature: { enabled: false, soundId: null },
  gains: { noise: 0.36, tone: 0.08, beat: 0.12, nature: 0 },
  fadeInSec: 12,
  fadeOutSec: 24,
})

/**
 * Daily calm — speaker-friendly quick start (isochronic, not binaural).
 * Good default for one-tap / last-used fallback.
 */
const DAILY_CALM: Preset = systemPreset('daily-calm', 'Daily calm', 10 * 60, {
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
  nature: { enabled: false, soundId: null },
  gains: { noise: 0.3, tone: 0.15, beat: 0.12, nature: 0 },
  fadeInSec: 5,
  fadeOutSec: 10,
})

/** Read-only system templates — clone before editing. */
export const SYSTEM_PRESETS: readonly Preset[] = Object.freeze([
  DAILY_CALM,
  SLEEP,
  FOCUS,
  ANXIETY_SOFTENER,
  DEEP_REST,
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
