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

export interface NoiseParams {
  kind: NoiseKind
  highpassHz?: number
  lowpassHz?: number
}

export interface ToneParams {
  /** Solfeggio catalog or custom Hz */
  frequencyHz: number
  /** e.g. "528" */
  solfeggioId?: string
  mildDetuneCents?: number
}

export interface BeatParams {
  mode: BeatMode
  carrierHz: number
  /** Difference (binaural) or pulse rate (isochronic) */
  beatHz: number
  /** Isochronic pulse depth 0–1 */
  pulseDepth?: number
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
}
