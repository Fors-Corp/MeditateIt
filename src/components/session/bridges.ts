/**
 * Thin adapters: session UI → audio engine + presets/storage.
 */

import {
  audioEngine,
  BINAURAL_REQUIRES_HEADPHONES,
  CROSSFADE_SEC,
  DEFAULT_ENGINE_PARAMS,
  NATURE_SOUNDS,
  NEUTRAL_LAYER_EQ,
  normalizeLayerEq,
  SOLFEGGIO_FREQUENCIES,
  type AudioEngineStatus,
  type EngineParams,
  type EngineParamsPatch,
  type NatureSoundId,
} from '../../audio'
import {
  cloneRecipe,
  createBlankRecipe,
  listSystemPresets,
  type BeatMode,
  type LayerEqParams,
  type NoiseKind,
  type Preset,
  type SessionRecipe,
} from '../../presets'
import {
  appendSessionRecord,
  deleteUserPresetAndForget,
  getLastUsedPreset,
  getPreset,
  listSessionHistory,
  listUserPresets,
  loadPrefs,
  rememberLastPreset as persistLastPreset,
  saveUserPreset,
  updatePrefs,
  type AppendSessionInput,
  type SaveUserPresetInput,
  type SessionRecord,
} from '../../storage'

export {
  BINAURAL_REQUIRES_HEADPHONES,
  CROSSFADE_SEC,
  NATURE_SOUNDS,
  NEUTRAL_LAYER_EQ,
  normalizeLayerEq,
  SOLFEGGIO_FREQUENCIES,
}
export type {
  BeatMode,
  LayerEqParams,
  NatureSoundId,
  NoiseKind,
  Preset,
  SessionRecipe,
}

export interface SessionAudioEngine {
  getStatus: () => AudioEngineStatus
  isCrossfading: () => boolean
  start: (fadeInSec?: number) => Promise<void>
  stop: (fadeOutSec?: number) => void
  applyRecipe: (recipe: SessionRecipe, masterVolume: number) => void
  crossfadeToRecipe: (
    recipe: SessionRecipe,
    masterVolume: number,
    durationSec?: number,
  ) => void
}

export function recipeToEngineParams(
  recipe: SessionRecipe,
  masterVolume: number,
): EngineParams {
  const patch = recipeToPatch(recipe, masterVolume)
  return {
    ...DEFAULT_ENGINE_PARAMS,
    masterGain: patch.masterGain ?? DEFAULT_ENGINE_PARAMS.masterGain,
    fadeInSec: patch.fadeInSec ?? DEFAULT_ENGINE_PARAMS.fadeInSec,
    fadeOutSec: patch.fadeOutSec ?? DEFAULT_ENGINE_PARAMS.fadeOutSec,
    noise: { ...DEFAULT_ENGINE_PARAMS.noise, ...patch.noise },
    tone: { ...DEFAULT_ENGINE_PARAMS.tone, ...patch.tone },
    beat: { ...DEFAULT_ENGINE_PARAMS.beat, ...patch.beat },
    nature: { ...DEFAULT_ENGINE_PARAMS.nature, ...patch.nature },
  }
}

function recipeToPatch(
  recipe: SessionRecipe,
  masterVolume: number,
): EngineParamsPatch {
  return {
    masterGain: masterVolume,
    fadeInSec: recipe.fadeInSec,
    fadeOutSec: recipe.fadeOutSec,
    noise: {
      enabled: recipe.noise.enabled,
      kind: recipe.noise.kind,
      gain: recipe.gains.noise,
      highpassHz: recipe.noise.highpassHz ?? 40,
      lowpassHz: recipe.noise.lowpassHz ?? 8000,
      eq: normalizeLayerEq(recipe.noise.eq),
    },
    tone: {
      enabled: recipe.tone.enabled,
      frequencyHz: recipe.tone.frequencyHz,
      gain: recipe.gains.tone,
      mildDetuneCents: recipe.tone.mildDetuneCents ?? 0,
      eq: normalizeLayerEq(recipe.tone.eq),
    },
    beat: {
      enabled: recipe.beat.enabled && recipe.beat.mode !== 'off',
      mode: recipe.beat.mode,
      carrierHz: recipe.beat.carrierHz,
      beatHz: recipe.beat.beatHz,
      gain: recipe.gains.beat,
      pulseDepth: recipe.beat.pulseDepth ?? 0.7,
      headphonesAcknowledged: true,
      eq: normalizeLayerEq(recipe.beat.eq),
    },
    nature: {
      enabled: recipe.nature.enabled,
      soundId: recipe.nature.soundId,
      gain: recipe.gains.nature,
      brightness: recipe.nature.brightness ?? 0.5,
      eq: normalizeLayerEq(recipe.nature.eq),
    },
  }
}

/** Resolve recipe-layer EQ with a neutral fallback (for UI display). */
export function recipeLayerEq(
  eq: LayerEqParams | undefined,
): LayerEqParams {
  return normalizeLayerEq(eq)
}

export function createSessionAudio(): SessionAudioEngine {
  return {
    getStatus: () => audioEngine.getStatus(),
    isCrossfading: () => audioEngine.isCrossfading(),
    start: (fadeInSec) => audioEngine.start({ fadeInSec }),
    stop: (fadeOutSec) => audioEngine.stop({ fadeOutSec }),
    applyRecipe(recipe, masterVolume) {
      audioEngine.setParams(recipeToPatch(recipe, masterVolume))
    },
    crossfadeToRecipe(recipe, masterVolume, durationSec) {
      audioEngine.crossfadeTo(recipeToEngineParams(recipe, masterVolume), {
        durationSec,
      })
    },
  }
}

export function blankCustomPreset(): Preset {
  return {
    id: 'custom',
    name: 'Custom',
    source: 'user',
    recipe: createBlankRecipe(),
    defaultDurationSec: null,
    updatedAt: new Date().toISOString(),
  }
}

/** Home list — system templates (cloned). */
export function loadSystemPresets(): Preset[] {
  return listSystemPresets().map((p) => ({
    ...p,
    recipe: cloneRecipe(p.recipe),
  }))
}

export async function resolveSessionPreset(
  routePresetId: string | undefined,
): Promise<Preset> {
  if (routePresetId === 'custom') {
    return blankCustomPreset()
  }

  if (routePresetId) {
    const found = await getPreset(routePresetId)
    if (found) {
      return {
        ...found,
        recipe: cloneRecipe(found.recipe),
      }
    }
  }

  const last = await getLastUsedPreset()
  return {
    ...last,
    recipe: cloneRecipe(last.recipe),
  }
}

export async function loadSessionPrefs() {
  return loadPrefs()
}

export async function rememberLastPreset(
  presetId: string,
  recipe?: SessionRecipe,
): Promise<void> {
  if (presetId === 'custom') return
  await persistLastPreset(presetId, recipe)
}

export async function persistHeadphonesAck(acked: boolean): Promise<void> {
  await updatePrefs({ preferHeadphonesAck: acked })
}

export async function persistMasterVolume(masterVolume: number): Promise<void> {
  await updatePrefs({ masterVolume })
}

export async function persistUserPreset(
  input: SaveUserPresetInput,
): Promise<Preset> {
  const saved = await saveUserPreset(input)
  await persistLastPreset(saved.id, saved.recipe)
  return saved
}

export async function loadUserPresets(): Promise<Preset[]> {
  return listUserPresets()
}

export async function removeUserPreset(id: string): Promise<boolean> {
  return deleteUserPresetAndForget(id)
}

export async function recordFinishedSession(
  input: AppendSessionInput,
): Promise<SessionRecord | null> {
  return appendSessionRecord(input)
}

export async function loadRecentSessions(
  limit = 10,
): Promise<SessionRecord[]> {
  const all = await listSessionHistory()
  return all.slice(0, Math.max(0, limit))
}

export const PRESET_BLURBS: Record<string, string> = {
  'daily-calm': 'Speaker-friendly pink + 528 + soft pulse',
  sleep: 'Deep brown bed, soft rain, slow delta',
  focus: 'Pink + 528 with mid-beta beat',
  'anxiety-softener': 'Soft pink, 396 Hz, gentle alpha',
  'deep-rest': 'Open-ended brown + shore wash + low tone',
}
