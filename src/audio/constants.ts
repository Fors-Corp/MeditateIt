import type { EngineParams } from './types'

/** Classic solfeggio set (Hz) for the tone picker. */
export const SOLFEGGIO_FREQUENCIES = [
  174, 285, 396, 417, 528, 639, 741, 852, 963,
] as const

export type SolfeggioHz = (typeof SOLFEGGIO_FREQUENCIES)[number]

export const GAIN = {
  masterDefault: 0.45,
  masterMax: 0.85,
  noiseDefault: 0.22,
  noiseMax: 0.55,
  brownNoiseDefault: 0.14,
  toneDefault: 0.12,
  toneMax: 0.4,
  beatDefault: 0.1,
  beatMax: 0.35,
  natureDefault: 0.2,
  natureMax: 0.45,
} as const

export const FREQ = {
  carrierMin: 80,
  carrierMax: 2000,
  beatMin: 0.5,
  beatMax: 40,
  hpfMin: 20,
  hpfMax: 2000,
  lpfMin: 200,
  lpfMax: 16_000,
  solfeggioFineTuneHz: 12,
  defaultToneHz: 528,
  defaultBeatCarrierHz: 220,
  defaultBeatHz: 6,
  natureSounds: ['rain', 'shore', 'wind', 'forest'] as const,
  defaultNatureSound: 'rain' as const,
  defaultNatureBrightness: 0.5,
} as const

export const RAMP_SEC = {
  gain: 0.04,
  filter: 0.08,
  frequency: 0.05,
  fadeMin: 0.05,
} as const

export const DEFAULT_ENGINE_PARAMS: EngineParams = {
  masterGain: GAIN.masterDefault,
  fadeInSec: 4,
  fadeOutSec: 4,
  noise: {
    enabled: true,
    kind: 'pink',
    gain: GAIN.noiseDefault,
    highpassHz: 40,
    lowpassHz: 8000,
  },
  tone: {
    enabled: true,
    frequencyHz: FREQ.defaultToneHz,
    gain: GAIN.toneDefault,
    mildDetuneCents: 0,
  },
  beat: {
    enabled: false,
    mode: 'off',
    carrierHz: FREQ.defaultBeatCarrierHz,
    beatHz: FREQ.defaultBeatHz,
    gain: GAIN.beatDefault,
    pulseDepth: 0.85,
    headphonesAcknowledged: false,
  },
  nature: {
    enabled: false,
    soundId: null,
    gain: GAIN.natureDefault,
    brightness: FREQ.defaultNatureBrightness,
  },
}
