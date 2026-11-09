/** Shared audio-engine types for UI + layer modules. */

export type NoiseKind = 'white' | 'pink' | 'brown'
export type BeatMode = 'off' | 'binaural' | 'isochronic'
export type NatureSoundId = 'rain' | 'shore' | 'wind' | 'forest'
export type AudioEngineStatus = 'idle' | 'running' | 'unavailable'

export interface NoiseParams {
  enabled: boolean
  kind: NoiseKind
  gain: number
  highpassHz: number
  lowpassHz: number
}

export interface ToneParams {
  enabled: boolean
  /** Carrier in Hz — prefer a solfeggio catalog value. */
  frequencyHz: number
  gain: number
  /** Optional mild chorus-like detune in cents (−50…50). */
  mildDetuneCents: number
}

/**
 * Beat layer params.
 *
 * `binaural` requires stereo headphones (two carriers, L/R). Speakers /
 * mono routes will not produce a perceptible beat difference — UI should
 * warn before enabling. `isochronic` is speaker-safe (single AM pulse).
 */
export interface BeatParams {
  enabled: boolean
  mode: BeatMode
  carrierHz: number
  /** Binaural difference or isochronic pulse rate (Hz). */
  beatHz: number
  gain: number
  /** Isochronic pulse depth 0–1 (ignored for binaural). */
  pulseDepth: number
  /**
   * Set true after the UI has shown the headphone requirement for binaural.
   * Engine does not enforce UI; this is documented for callers.
   */
  headphonesAcknowledged: boolean
}

/**
 * Procedural nature bed (no licensed sample downloads).
 * `soundId` null + enabled → engine falls back to `"rain"`.
 */
export interface NatureParams {
  enabled: boolean
  soundId: NatureSoundId | null
  gain: number
  /** 0–1: darker → brighter high shelf. */
  brightness: number
}

export interface EngineParams {
  masterGain: number
  fadeInSec: number
  fadeOutSec: number
  noise: NoiseParams
  tone: ToneParams
  beat: BeatParams
  nature: NatureParams
}

export type EngineParamsPatch = {
  masterGain?: number
  fadeInSec?: number
  fadeOutSec?: number
  noise?: Partial<NoiseParams>
  tone?: Partial<ToneParams>
  beat?: Partial<BeatParams>
  nature?: Partial<NatureParams>
}

/** Documented constraint for binaural mode. */
export const BINAURAL_REQUIRES_HEADPHONES =
  'Binaural beats require stereo headphones. Use isochronic mode for speakers.' as const
