/** Domain types for session recipes and presets (MVP data model). */

export type NoiseKind = 'white' | 'pink' | 'brown'
export type BeatMode = 'off' | 'binaural' | 'isochronic'
export type PresetSource = 'system' | 'user'

export interface LayerGains {
  /** 0–1 capped */
  noise: number
  tone: number
  beat: number
  nature: number
}

/**
 * Per-layer 3-band EQ in dB. Omit or leave at 0 for a transparent chain.
 * Values outside −12…+12 are clamped in the audio engine.
 */
export interface LayerEqParams {
  lowDb: number
  midDb: number
  highDb: number
}

export const NEUTRAL_LAYER_EQ: Readonly<LayerEqParams> = {
  lowDb: 0,
  midDb: 0,
  highDb: 0,
}

export interface NoiseParams {
  kind: NoiseKind
  highpassHz?: number
  lowpassHz?: number
  /** Omit → neutral (0 / 0 / 0) */
  eq?: LayerEqParams
}

export interface ToneParams {
  /** Solfeggio catalog or custom Hz */
  frequencyHz: number
  /** e.g. "528" */
  solfeggioId?: string
  mildDetuneCents?: number
  /** Omit → neutral (0 / 0 / 0) */
  eq?: LayerEqParams
}

export interface BeatParams {
  mode: BeatMode
  carrierHz: number
  /** Difference (binaural) or pulse rate (isochronic) */
  beatHz: number
  /** Isochronic pulse depth 0–1 */
  pulseDepth?: number
  /** Omit → neutral (0 / 0 / 0) */
  eq?: LayerEqParams
}

export type NatureSoundId = 'rain' | 'shore' | 'wind' | 'forest'

export interface NatureParams {
  /**
   * Procedural bed id — `"rain" | "shore" | "wind" | "forest"`.
   * `null` + enabled falls back to rain in the audio engine.
   */
  soundId: NatureSoundId | null
  /** 0–1 high-shelf brightness; omit → engine default 0.5 */
  brightness?: number
  /** Omit → neutral (0 / 0 / 0) */
  eq?: LayerEqParams
}

export interface SessionRecipe {
  noise: NoiseParams & { enabled: boolean }
  tone: ToneParams & { enabled: boolean }
  beat: BeatParams & { enabled: boolean }
  nature: NatureParams & { enabled: boolean }
  gains: LayerGains
  fadeInSec: number
  fadeOutSec: number
}

export interface Preset {
  id: string
  name: string
  source: PresetSource
  recipe: SessionRecipe
  /** null = open-ended */
  defaultDurationSec: number | null
  /** ISO timestamp */
  updatedAt: string
}

export interface UserPrefs {
  lastPresetId: string | null
  lastRecipe: SessionRecipe | null
  masterVolume: number
  /** Default fade-in when starting without a recipe fade override */
  defaultFadeInSec: number
  /** Default fade-out on stop / timer end */
  defaultFadeOutSec: number
  preferHeadphonesAck: boolean
  reduceMotion: boolean
  defaultDurationSec: number | null
  /**
   * UI locale preference (`en` | `es` | `ca` | `fr` | `pt`).
   * `null` = follow the browser language when supported, else `en`.
   */
  locale: string | null
}
