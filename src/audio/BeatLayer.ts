import { FREQ, GAIN, RAMP_SEC } from './constants'
import { clamp, rampParam } from './ramp'
import type { BeatMode, BeatParams } from './types'
import { BINAURAL_REQUIRES_HEADPHONES } from './types'

/**
 * Beat engine with mode switch: binaural | isochronic | off.
 *
 * Binaural: two sines (carrier, carrier+beat) → L / R via ChannelMerger.
 * Requires stereo headphones — see {@link BINAURAL_REQUIRES_HEADPHONES}.
 *
 * Isochronic: single carrier amplitude-modulated by a pulse LFO (speaker-safe).
 */
export class BeatLayer {
  private readonly ctx: AudioContext
  private readonly output: GainNode
  private mode: BeatMode = 'off'
  private running = false
  private disposed = false

  // Binaural nodes
  private leftOsc: OscillatorNode | null = null
  private rightOsc: OscillatorNode | null = null
  private leftGain: GainNode | null = null
  private rightGain: GainNode | null = null
  private merger: ChannelMergerNode | null = null

  // Isochronic nodes
  private carrierOsc: OscillatorNode | null = null
  private amGain: GainNode | null = null
  private pulseLfo: OscillatorNode | null = null
  private pulseDepthGain: GainNode | null = null
  private pulseOffset: ConstantSourceNode | null = null

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.output = ctx.createGain()
    this.output.gain.value = 0
  }

  /** Human-readable constraint for UI copy / docs. */
  static readonly headphoneConstraint = BINAURAL_REQUIRES_HEADPHONES

  connect(destination: AudioNode): void {
    this.output.connect(destination)
  }

  start(params: BeatParams): void {
    if (this.disposed) return
    this.running = true
    this.applyParams(params, /*forceRebuild*/ true)
  }

  stop(fadeSec: number = RAMP_SEC.gain): void {
    if (!this.running) return
    rampParam(this.output.gain, 0, this.ctx.currentTime, fadeSec)
    const stopAt =
      this.ctx.currentTime + Math.max(RAMP_SEC.fadeMin, fadeSec) + 0.02
    window.setTimeout(() => {
      this.teardownAll()
      this.running = false
      this.mode = 'off'
    }, Math.ceil((stopAt - this.ctx.currentTime) * 1000))
  }

  setParams(params: BeatParams): void {
    if (this.disposed || !this.running) return
    const nextMode = effectiveMode(params)
    this.applyParams(params, nextMode !== this.mode)
  }

  dispose(): void {
    this.disposed = true
    this.teardownAll()
    try {
      this.output.disconnect()
    } catch {
      /* already disconnected */
    }
  }

  private applyParams(params: BeatParams, forceRebuild: boolean): void {
    const t = this.ctx.currentTime
    const mode = effectiveMode(params)
    const carrier = clamp(params.carrierHz, FREQ.carrierMin, FREQ.carrierMax)
    const beat = clamp(params.beatHz, FREQ.beatMin, FREQ.beatMax)
    const layerGain = params.enabled && mode !== 'off'
      ? clamp(params.gain, 0, GAIN.beatMax)
      : 0
    const depth = clamp(params.pulseDepth, 0, 1)

    if (forceRebuild || mode !== this.mode) {
      this.teardownAll()
      this.mode = mode
      if (mode === 'binaural') {
        this.buildBinaural(carrier, beat)
      } else if (mode === 'isochronic') {
        this.buildIsochronic(carrier, beat, depth, layerGain)
      }
    } else if (mode === 'binaural') {
      this.updateBinaural(carrier, beat)
    } else if (mode === 'isochronic') {
      this.updateIsochronic(carrier, beat, depth, layerGain)
    }

    rampParam(this.output.gain, layerGain, t, RAMP_SEC.gain)
  }

  private buildBinaural(carrier: number, beat: number): void {
    const leftOsc = this.ctx.createOscillator()
    leftOsc.type = 'sine'
    leftOsc.frequency.value = carrier

    const rightOsc = this.ctx.createOscillator()
    rightOsc.type = 'sine'
    rightOsc.frequency.value = carrier + beat

    const leftGain = this.ctx.createGain()
    leftGain.gain.value = 0.5
    const rightGain = this.ctx.createGain()
    rightGain.gain.value = 0.5

    const merger = this.ctx.createChannelMerger(2)

    leftOsc.connect(leftGain)
    rightOsc.connect(rightGain)
    leftGain.connect(merger, 0, 0)
    rightGain.connect(merger, 0, 1)
    merger.connect(this.output)

    leftOsc.start()
    rightOsc.start()

    this.leftOsc = leftOsc
    this.rightOsc = rightOsc
    this.leftGain = leftGain
    this.rightGain = rightGain
    this.merger = merger
  }

  private updateBinaural(carrier: number, beat: number): void {
    const t = this.ctx.currentTime
    if (this.leftOsc) {
      rampParam(this.leftOsc.frequency, carrier, t, RAMP_SEC.frequency)
    }
    if (this.rightOsc) {
      rampParam(
        this.rightOsc.frequency,
        carrier + beat,
        t,
        RAMP_SEC.frequency,
      )
    }
  }

  private buildIsochronic(
    carrier: number,
    beat: number,
    depth: number,
    layerGain: number,
  ): void {
    const carrierOsc = this.ctx.createOscillator()
    carrierOsc.type = 'sine'
    carrierOsc.frequency.value = carrier

    const amGain = this.ctx.createGain()
    // AM starts at mid level; LFO + offset set the pulse shape.
    amGain.gain.value = 0

    const pulseLfo = this.ctx.createOscillator()
    // Square-ish pulses via sine with high depth still reads as pulsing;
    // use 'square' for distinct isochronic clicks.
    pulseLfo.type = 'square'
    pulseLfo.frequency.value = beat

    const pulseDepthGain = this.ctx.createGain()
    const pulseOffset = this.ctx.createConstantSource()
    this.setIsochronicAm(pulseOffset, pulseDepthGain, depth, /*base*/ 1)

    carrierOsc.connect(amGain)
    amGain.connect(this.output)
    pulseOffset.connect(amGain.gain)
    pulseLfo.connect(pulseDepthGain)
    pulseDepthGain.connect(amGain.gain)

    carrierOsc.start()
    pulseLfo.start()
    pulseOffset.start()

    this.carrierOsc = carrierOsc
    this.amGain = amGain
    this.pulseLfo = pulseLfo
    this.pulseDepthGain = pulseDepthGain
    this.pulseOffset = pulseOffset

    // layerGain is applied on this.output; keep AM normalized to ~0…1
    void layerGain
  }

  private updateIsochronic(
    carrier: number,
    beat: number,
    depth: number,
    _layerGain: number,
  ): void {
    const t = this.ctx.currentTime
    if (this.carrierOsc) {
      rampParam(this.carrierOsc.frequency, carrier, t, RAMP_SEC.frequency)
    }
    if (this.pulseLfo) {
      rampParam(this.pulseLfo.frequency, beat, t, RAMP_SEC.frequency)
    }
    if (this.pulseOffset && this.pulseDepthGain) {
      this.setIsochronicAm(this.pulseOffset, this.pulseDepthGain, depth, 1)
    }
  }

  /**
   * Map depth so pulse goes from ~(1-depth) to 1 (square ±1 * depth/2 + offset).
   */
  private setIsochronicAm(
    offset: ConstantSourceNode,
    depthGain: GainNode,
    depth: number,
    base: number,
  ): void {
    const t = this.ctx.currentTime
    const d = clamp(depth, 0, 1)
    const center = base * (1 - d / 2)
    const amount = base * (d / 2)
    rampParam(offset.offset, center, t, RAMP_SEC.gain)
    rampParam(depthGain.gain, amount, t, RAMP_SEC.gain)
  }

  private teardownAll(): void {
    const oscs: Array<OscillatorNode | ConstantSourceNode | null> = [
      this.leftOsc,
      this.rightOsc,
      this.carrierOsc,
      this.pulseLfo,
      this.pulseOffset,
    ]
    for (const node of oscs) {
      if (!node) continue
      try {
        node.stop()
      } catch {
        /* already stopped */
      }
      try {
        node.disconnect()
      } catch {
        /* already disconnected */
      }
    }
    for (const node of [
      this.leftGain,
      this.rightGain,
      this.merger,
      this.amGain,
      this.pulseDepthGain,
    ]) {
      if (!node) continue
      try {
        node.disconnect()
      } catch {
        /* already disconnected */
      }
    }
    this.leftOsc = null
    this.rightOsc = null
    this.leftGain = null
    this.rightGain = null
    this.merger = null
    this.carrierOsc = null
    this.amGain = null
    this.pulseLfo = null
    this.pulseDepthGain = null
    this.pulseOffset = null
  }
}

function effectiveMode(params: BeatParams): BeatMode {
  if (!params.enabled) return 'off'
  return params.mode
}
