/**
 * MeditateIt generative audio engine (crossfade + Media Session + nature).
 *
 * Master chain: dual layer banks → master gain → soft limiter → destination
 * Layers per bank: NoiseLayer | ToneLayer | BeatLayer | NatureLayer
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
 *   nature: { enabled: true, soundId: 'rain', gain: 0.2, brightness: 0.55 },
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
export { BINAURAL_REQUIRES_HEADPHONES } from './types'
export type {
  AudioEngineStatus,
  BeatMode,
  BeatParams,
  EngineParams,
  EngineParamsPatch,
  NatureParams,
  NatureSoundId,
  NoiseKind,
  NoiseParams,
  ToneParams,
} from './types'

/** Catalog of procedural nature beds (synthesized, not sample packs). */
export const NATURE_SOUNDS = FREQ.natureSounds
