/**
 * MeditateIt generative audio engine (MVP + Phase 2 crossfade / media session).
 *
 * Master chain: dual layer banks → master gain → soft limiter → destination
 * Layers per bank: NoiseLayer | ToneLayer | BeatLayer
 *
 * UI usage (from a click/tap handler):
 *
 * ```ts
 * import {
 *   audioEngine,
 *   DEFAULT_ENGINE_PARAMS,
 *   SOLFEGGIO_FREQUENCIES,
 *   BINAURAL_REQUIRES_HEADPHONES,
 *   CROSSFADE_SEC,
 * } from '../audio'
 *
 * audioEngine.setParams({ ... })
 * await audioEngine.start()
 * // Mid-session preset switch (1–3s dual-ramp, no clicks):
 * audioEngine.crossfadeTo(nextParams, { durationSec: 2 })
 * audioEngine.stop({ fadeOutSec: 5 })
 * ```
 */

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
  NoiseKind,
  NoiseParams,
  ToneParams,
} from './types'
