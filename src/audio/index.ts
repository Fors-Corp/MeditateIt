/**
 * MeditateIt generative audio engine (crossfade + Media Session + nature).
 *
 * Master chain: dual layer banks → master gain → soft limiter → destination
 * Layers per bank: Noise|Tone|Beat|Nature → LayerEq (3-band) → bank bus
 *
 * UI usage (from a click/tap handler):
 *
 * ```ts
 * import {
 *   audioEngine,
 *   DEFAULT_ENGINE_PARAMS,
 *   SOLFEGGIO_FREQUENCIES,
 *   NATURE_SOUNDS,
 *   BINAURAL_REQUIRES_HEADPHONES,
 *   CROSSFADE_SEC,
 * } from '../audio'
 *
 * audioEngine.setParams({
 *   nature: {
 *     enabled: true,
 *     soundId: 'rain',
 *     gain: 0.2,
 *     brightness: 0.55,
 *     eq: { lowDb: 0, midDb: 0, highDb: 2 },
 *   },
 * })
 * await audioEngine.start()
 * audioEngine.setNature({ soundId: 'shore', brightness: 0.4 })
 * audioEngine.crossfadeTo(nextParams, { durationSec: 2 })
 * audioEngine.stop({ fadeOutSec: 5 })
 * ```
 */

import { FREQ } from './constants'

export { AudioEngine, audioEngine } from './AudioEngine'
export type {
  CrossfadeOptions,
  StartOptions,
  StopOptions,
} from './AudioEngine'
export {
  CROSSFADE_SEC,
  clampCrossfadeDuration,
  dualRampCrossfade,
} from './crossfade'
export {
  DEFAULT_ENGINE_PARAMS,
  FREQ,
  GAIN,
  RAMP_SEC,
  SOLFEGGIO_FREQUENCIES,
} from './constants'
export type { SolfeggioHz } from './constants'
export { BeatLayer } from './BeatLayer'
export { LayerBank } from './LayerBank'
export {
  LAYER_EQ_DB,
  LAYER_EQ_FREQ,
  LayerEq,
  NEUTRAL_LAYER_EQ,
  clampDb,
  normalizeLayerEq,
} from './LayerEq'
export { NatureLayer } from './NatureLayer'
export { NoiseLayer } from './NoiseLayer'
export { ToneLayer, clampToneFrequency } from './ToneLayer'
export {
  bindMediaSessionHandlers,
  isMediaSessionAvailable,
  setMediaSessionPlaybackState,
  setSessionMediaMetadata,
} from './mediaSession'
export type {
  MediaSessionHandlers,
  SessionMediaMetadata,
} from './mediaSession'
export {
  NOISE_WORKLET_CONTENT_HASH,
  NOISE_WORKLET_NAME,
  NOISE_WORKLET_URL,
  ensureNoiseWorklet,
} from './noiseWorklet'
export { bindVisibilityAudioResume } from './visibilityResume'
export type {
  ContextResumeResult,
  VisibilityResumeHandlers,
} from './visibilityResume'
export { BINAURAL_REQUIRES_HEADPHONES } from './types'
export type {
  AudioEngineStatus,
  BeatMode,
  BeatParams,
  EngineParams,
  EngineParamsPatch,
  LayerEqParams,
  NatureParams,
  NatureSoundId,
  NoiseKind,
  NoiseParams,
  ToneParams,
} from './types'

/** Catalog of procedural nature beds (synthesized, not sample packs). */
export const NATURE_SOUNDS = FREQ.natureSounds
