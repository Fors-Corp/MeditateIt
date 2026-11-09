import { FREQ, GAIN, RAMP_SEC } from './constants'
import { createNoiseBuffer } from './noiseBuffers'
import { clamp, rampParam } from './ramp'
import type { NoiseKind, NoiseParams } from './types'

/**
 * Filtered looping noise (white / pink / brown).
 * Graph: BufferSource(loop) → HPF → LPF → gain → output
 */
export class NoiseLayer {
  private readonly ctx: AudioContext
  private readonly hpf: BiquadFilterNode
  private readonly lpf: BiquadFilterNode
  private readonly gainNode: GainNode
  private source: AudioBufferSourceNode | null = null
  private kind: NoiseKind = 'pink'
  private running = false
  private disposed = false

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.hpf = ctx.createBiquadFilter()
    this.hpf.type = 'highpass'
    this.hpf.frequency.value = 40
    this.hpf.Q.value = 0.707

    this.lpf = ctx.createBiquadFilter()
    this.lpf.type = 'lowpass'
    this.lpf.frequency.value = 8000
    this.lpf.Q.value = 0.707

    this.gainNode = ctx.createGain()
    this.gainNode.gain.value = 0

    this.hpf.connect(this.lpf)
    this.lpf.connect(this.gainNode)
  }

  connect(destination: AudioNode): void {
    this.gainNode.connect(destination)
  }

  start(params: NoiseParams): void {
    if (this.disposed) return
    this.running = true
    this.applyParams(params, /*forceRestart*/ true)
  }

  stop(fadeSec: number = RAMP_SEC.gain): void {
    if (!this.running) return
    rampParam(this.gainNode.gain, 0, this.ctx.currentTime, fadeSec)
    const stopAt = this.ctx.currentTime + Math.max(RAMP_SEC.fadeMin, fadeSec) + 0.02
    window.setTimeout(() => {
      this.teardownSource()
      this.running = false
    }, Math.ceil((stopAt - this.ctx.currentTime) * 1000))
  }

  setParams(params: NoiseParams): void {
    if (this.disposed || !this.running) {
      this.kind = params.kind
      return
    }
    this.applyParams(params, params.kind !== this.kind)
  }

  dispose(): void {
    this.disposed = true
    this.teardownSource()
    try {
      this.gainNode.disconnect()
      this.lpf.disconnect()
      this.hpf.disconnect()
    } catch {
      /* already disconnected */
    }
  }

  private applyParams(params: NoiseParams, forceRestart: boolean): void {
    const t = this.ctx.currentTime
    const hpf = clamp(params.highpassHz, FREQ.hpfMin, FREQ.hpfMax)
    const lpf = clamp(params.lowpassHz, FREQ.lpfMin, FREQ.lpfMax)
    // Keep LPF above HPF so the band is never inverted.
    const safeLpf = Math.max(lpf, hpf + 50)

    rampParam(this.hpf.frequency, hpf, t, RAMP_SEC.filter)
    rampParam(this.lpf.frequency, safeLpf, t, RAMP_SEC.filter)

    const maxGain = GAIN.noiseMax
    const targetGain = params.enabled
      ? clamp(params.gain, 0, maxGain)
      : 0
    rampParam(this.gainNode.gain, targetGain, t, RAMP_SEC.gain)

    if (forceRestart || !this.source) {
      this.restartSource(params.kind)
    }
  }

  private restartSource(kind: NoiseKind): void {
    this.teardownSource()
    this.kind = kind
    const buffer = createNoiseBuffer(this.ctx, kind)
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(this.hpf)
    source.start()
    this.source = source
  }

  private teardownSource(): void {
    if (!this.source) return
    try {
      this.source.stop()
    } catch {
      /* already stopped */
    }
    try {
      this.source.disconnect()
    } catch {
      /* already disconnected */
    }
    this.source = null
  }
}
