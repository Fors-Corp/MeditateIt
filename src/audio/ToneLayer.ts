import { FREQ, GAIN, RAMP_SEC } from './constants'
import { clamp, rampParam } from './ramp'
import type { ToneParams } from './types'

/**
 * Pure (optionally lightly detuned) sine for solfeggio / custom carriers.
 * Graph: Oscillator → gain → output
 *        [optional detune osc] → gain → output
 */
export class ToneLayer {
  private readonly ctx: AudioContext
  private readonly gainNode: GainNode
  private readonly detuneGain: GainNode
  private osc: OscillatorNode | null = null
  private detuneOsc: OscillatorNode | null = null
  private running = false
  private disposed = false

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.gainNode = ctx.createGain()
    this.gainNode.gain.value = 0
    this.detuneGain = ctx.createGain()
    this.detuneGain.gain.value = 0
  }

  connect(destination: AudioNode): void {
    this.gainNode.connect(destination)
    this.detuneGain.connect(destination)
  }

  start(params: ToneParams): void {
    if (this.disposed) return
    this.ensureOscillators()
    this.running = true
    this.applyParams(params)
  }

  stop(fadeSec: number = RAMP_SEC.gain): void {
    if (!this.running) return
    const t = this.ctx.currentTime
    rampParam(this.gainNode.gain, 0, t, fadeSec)
    rampParam(this.detuneGain.gain, 0, t, fadeSec)
    const stopAt = t + Math.max(RAMP_SEC.fadeMin, fadeSec) + 0.02
    window.setTimeout(() => {
      this.teardownOscillators()
      this.running = false
    }, Math.ceil((stopAt - this.ctx.currentTime) * 1000))
  }

  setParams(params: ToneParams): void {
    if (this.disposed) return
    if (!this.running) return
    this.ensureOscillators()
    this.applyParams(params)
  }

  dispose(): void {
    this.disposed = true
    this.teardownOscillators()
    try {
      this.gainNode.disconnect()
      this.detuneGain.disconnect()
    } catch {
      /* already disconnected */
    }
  }

  private applyParams(params: ToneParams): void {
    const t = this.ctx.currentTime
    const freq = clampToneFrequency(params.frequencyHz)
    const detuneCents = clamp(params.mildDetuneCents, -50, 50)

    if (this.osc) {
      rampParam(this.osc.frequency, freq, t, RAMP_SEC.frequency)
    }
    if (this.detuneOsc) {
      const ratio = Math.pow(2, detuneCents / 1200)
      rampParam(this.detuneOsc.frequency, freq * ratio, t, RAMP_SEC.frequency)
    }

    const base = params.enabled ? clamp(params.gain, 0, GAIN.toneMax) : 0
    const detuneMix = Math.abs(detuneCents) > 0.5 ? 0.35 : 0
    rampParam(this.gainNode.gain, base * (1 - detuneMix * 0.5), t, RAMP_SEC.gain)
    rampParam(this.detuneGain.gain, base * detuneMix, t, RAMP_SEC.gain)
  }

  private ensureOscillators(): void {
    if (this.osc && this.detuneOsc) return

    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = FREQ.defaultToneHz
    osc.connect(this.gainNode)
    osc.start()
    this.osc = osc

    const detune = this.ctx.createOscillator()
    detune.type = 'sine'
    detune.frequency.value = FREQ.defaultToneHz
    detune.connect(this.detuneGain)
    detune.start()
    this.detuneOsc = detune
  }

  private teardownOscillators(): void {
    for (const node of [this.osc, this.detuneOsc]) {
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
    this.osc = null
    this.detuneOsc = null
  }
}

/** Clamp tone carriers to the comfortable audible band. */
export function clampToneFrequency(hz: number): number {
  return clamp(hz, FREQ.carrierMin, FREQ.carrierMax)
}
