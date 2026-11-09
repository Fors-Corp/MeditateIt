import { getMessages } from '../i18n'
import type { SessionRecipe } from '../presets'
import type { Sequence, SequenceStage } from './types'
import { cloneSequence, totalDurationSec } from './resolve'

const STABLE_UPDATED_AT = '2026-11-09T00:00:00.000Z'

function stage(
  id: string,
  name: string,
  durationSec: number,
  ref: { presetId: string } | { recipe: SessionRecipe },
): SequenceStage {
  if ('presetId' in ref) {
    return { id, name, durationSec, presetId: ref.presetId }
  }
  return { id, name, durationSec, recipe: ref.recipe }
}

/** Soft pink bed — warm-up / buffer without beats. */
const PINK_BED: SessionRecipe = {
  noise: {
    enabled: true,
    kind: 'pink',
    highpassHz: 40,
    lowpassHz: 7000,
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
    carrierHz: 220,
    beatHz: 8,
    pulseDepth: 0.7,
  },
  nature: { enabled: false, soundId: null, brightness: 0.5 },
  gains: { noise: 0.32, tone: 0, beat: 0, nature: 0 },
  fadeInSec: 6,
  fadeOutSec: 10,
}

/** Slow ~5 Hz binaural glide for night wind-down. */
const THETA_GLIDE: SessionRecipe = {
  noise: {
    enabled: true,
    kind: 'brown',
    highpassHz: 20,
    lowpassHz: 500,
  },
  tone: {
    enabled: true,
    frequencyHz: 174,
    solfeggioId: '174',
    mildDetuneCents: 2,
  },
  beat: {
    enabled: true,
    mode: 'binaural',
    carrierHz: 200,
    beatHz: 5,
  },
  nature: { enabled: true, soundId: 'rain', brightness: 0.3 },
  gains: { noise: 0.3, tone: 0.08, beat: 0.13, nature: 0.14 },
  fadeInSec: 8,
  fadeOutSec: 14,
}

function systemSequence(
  id: string,
  name: string,
  summary: string,
  stages: SequenceStage[],
): Sequence {
  return {
    id,
    name,
    summary,
    source: 'system',
    stages,
    updatedAt: STABLE_UPDATED_AT,
  }
}

/** Soft calm → pink bed → sleep. */
const WIND_DOWN: Sequence = systemSequence(
  'wind-down',
  'Wind down',
  'Soft calm → pink bed → sleep',
  [
    stage('wd-1', 'Soft landing', 10 * 60, { presetId: 'anxiety-softener' }),
    stage('wd-2', 'Pink settle', 10 * 60, { recipe: PINK_BED }),
    stage('wd-3', 'Settle', 15 * 60, { presetId: 'sleep' }),
  ],
)

/** Arrive calm → focus work → soft close. */
const FOCUS_BLOCK: Sequence = systemSequence(
  'focus-block',
  'Focus block',
  'Calm arrive → focus → soft close',
  [
    stage('fb-1', 'Arrive', 5 * 60, { presetId: 'daily-calm' }),
    stage('fb-2', 'Focus work', 20 * 60, { presetId: 'focus' }),
    stage('fb-3', 'Soft close', 5 * 60, { presetId: 'anxiety-softener' }),
  ],
)

/** Pink → slow ~5 Hz beat → night bed (id kept for prefs / history). */
const DEEP_SLEEP_RAMP: Sequence = systemSequence(
  'deep-sleep-ramp',
  'Night wind-down',
  'Pink → ~5 Hz glide → night bed',
  [
    stage('ds-1', 'Pink unwind', 10 * 60, { recipe: PINK_BED }),
    stage('ds-2', '~5 Hz glide', 15 * 60, { recipe: THETA_GLIDE }),
    stage('ds-3', 'Night bed', 20 * 60, { presetId: 'sleep' }),
  ],
)

export const SYSTEM_SEQUENCES: readonly Sequence[] = Object.freeze([
  WIND_DOWN,
  FOCUS_BLOCK,
  DEEP_SLEEP_RAMP,
])

const BY_ID = new Map(SYSTEM_SEQUENCES.map((s) => [s.id, s]))

export function listSystemSequences(): readonly Sequence[] {
  return SYSTEM_SEQUENCES
}

export function getSystemSequence(id: string): Sequence | undefined {
  const found = BY_ID.get(id)
  return found ? cloneSequence(found) : undefined
}

export function isSystemSequenceId(id: string): boolean {
  return BY_ID.has(id)
}

export function formatSequenceDuration(sequence: Sequence): string {
  const total = totalDurationSec(sequence)
  const m = Math.round(total / 60)
  return getMessages().home.sequenceDuration(m, sequence.stages.length)
}
