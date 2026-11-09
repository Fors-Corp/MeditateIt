import { RAMP_SEC } from './constants'
import { clamp, rampParam } from './ramp'
import { NEUTRAL_LAYER_EQ, type LayerEqParams } from './types'

export { NEUTRAL_LAYER_EQ }

/** Fixed band centers — not user-tunable (keeps the UI a simple 3-band). */
export const LAYER_EQ_FREQ = {
  lowShelfHz: 250,
  midHz: 1200,
  highShelfHz: 4000,
  midQ: 0.9,
} as const

export const LAYER_EQ_DB = {
  min: -12,
  max: 12,
} as const

/** Clamp a partial EQ patch into a full neutral-defaulted param set. */
export function normalizeLayerEq(
  patch?: Partial<LayerEqParams> | null,
): LayerEqParams {
  return {
    lowDb: clampDb(patch?.lowDb ?? NEUTRAL_LAYER_EQ.lowDb),
    midDb: clampDb(patch?.midDb ?? NEUTRAL_LAYER_EQ.midDb),
    highDb: clampDb(patch?.highDb ?? NEUTRAL_LAYER_EQ.highDb),
  }
}

export function clampDb(value: number): number {
  return clamp(value, LAYER_EQ_DB.min, LAYER_EQ_DB.max)
}

/**
 * Per-layer 3-band EQ: low shelf → mid presence → high shelf.
 *
 * Insert between a layer's output and the bank bus. Gain changes are
 * ramped so live tweaks stay click-free. Neutral (0 / 0 / 0) is transparent.
 */
export class LayerEq {
  readonly input: GainNode
  private readonly lowShelf: BiquadFilterNode
  private readonly midPeak: BiquadFilterNode
  private readonly highShelf: BiquadFilterNode
  private readonly ctx: AudioContext
  private disposed = false

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.input = ctx.createGain()
    this.input.gain.value = 1

    this.lowShelf = ctx.createBiquadFilter()
    this.lowShelf.type = 'lowshelf'
    this.lowShelf.frequency.value = LAYER_EQ_FREQ.lowShelfHz
    this.lowShelf.gain.value = 0

    this.midPeak = ctx.createBiquadFilter()
    this.midPeak.type = 'peaking'
    this.midPeak.frequency.value = LAYER_EQ_FREQ.midHz
    this.midPeak.Q.value = LAYER_EQ_FREQ.midQ
    this.midPeak.gain.value = 0

    this.highShelf = ctx.createBiquadFilter()
    this.highShelf.type = 'highshelf'
    this.highShelf.frequency.value = LAYER_EQ_FREQ.highShelfHz
    this.highShelf.gain.value = 0

    this.input.connect(this.lowShelf)
    this.lowShelf.connect(this.midPeak)
    this.midPeak.connect(this.highShelf)
  }

  connect(destination: AudioNode): void {
    this.highShelf.connect(destination)
  }

  setParams(params: Partial<LayerEqParams> | LayerEqParams): void {
    if (this.disposed) return
    const next = normalizeLayerEq(params)
    const t = this.ctx.currentTime
    rampParam(this.lowShelf.gain, next.lowDb, t, RAMP_SEC.filter)
    rampParam(this.midPeak.gain, next.midDb, t, RAMP_SEC.filter)
    rampParam(this.highShelf.gain, next.highDb, t, RAMP_SEC.filter)
  }

  dispose(): void {
    this.disposed = true
    try {
      this.input.disconnect()
      this.lowShelf.disconnect()
      this.midPeak.disconnect()
      this.highShelf.disconnect()
    } catch {
      /* already disconnected */
    }
  }
}
