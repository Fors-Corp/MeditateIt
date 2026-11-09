/**
 * MeditateIt generative audio engine (MVP).
 *
 * Master chain: layers → master gain → soft limiter → destination
 * Layers: NoiseLayer | ToneLayer | BeatLayer
 *
 * UI usage (from a click/tap handler):
 *
 * ```ts
 * import {
 *   audioEngine,
 *   DEFAULT_ENGINE_PARAMS,
 *   SOLFEGGIO_FREQUENCIES,
 *   BINAURAL_REQUIRES_HEADPHONES,
 * } from '../audio'
 *
 * // Configure before or after start
 * audioEngine.setParams({
 *   masterGain: 0.45,
 *   noise: { enabled: true, kind: 'pink', gain: 0.22 },
 *   tone: { enabled: true, frequencyHz: 528, gain: 0.12 },
 *   beat: {
 *     enabled: true,
 *     mode: 'binaural', // requires headphones — show BINAURAL_REQUIRES_HEADPHONES
 *     carrierHz: 220,
 *     beatHz: 6,
 *     gain: 0.1,
 *     headphonesAcknowledged: true,
 *   },
 * })
 *
 * await audioEngine.start()          // user gesture required first time
 * audioEngine.setMasterGain(0.4)
 * audioEngine.setNoise({ kind: 'brown', gain: 0.14 })
 * audioEngine.setTone({ frequencyHz: 396 })
 * audioEngine.setBeat({ mode: 'isochronic', beatHz: 4 })
 * audioEngine.stop({ fadeOutSec: 5 })
 * ```
 */

export { AudioEngine, audioEngine } from './AudioEngine'
export type { StartOptions, StopOptions } from './AudioEngine'
export {
  DEFAULT_ENGINE_PARAMS,
  FREQ,
  GAIN,
  RAMP_SEC,
  SOLFEGGIO_FREQUENCIES,
} from './constants'
export type { SolfeggioHz } from './constants'
export { BeatLayer } from './BeatLayer'
export { NoiseLayer } from './NoiseLayer'
export { ToneLayer, clampToneFrequency } from './ToneLayer'
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
