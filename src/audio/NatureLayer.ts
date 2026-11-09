import { FREQ, GAIN, RAMP_SEC } from './constants'
import { createNoiseBuffer } from './noiseBuffers'
import { clamp, rampParam } from './ramp'
import type { NatureParams, NatureSoundId } from './types'

/**
 * Procedural nature bed — no sample downloads.
 *
 * Graph (per sound): looping noise (+ sparse impulses) → tone filters →
 * brightness shelf → gain → output.
 *
 * Sounds: rain | shore | wind | forest (approximations via filtered noise
 * and short synthesized bursts).
 */
export class NatureLayer {
  private readonly ctx: AudioContext
  private readonly bedGain: GainNode
  private readonly impulseGain: GainNode
  private readonly brightnessFilter: BiquadFilterNode
  private readonly toneFilter: BiquadFilterNode
  private readonly output: GainNode
  private source: AudioBufferSourceNode | null = null
  private swellLfo: OscillatorNode | null = null
  private swellDepth: GainNode | null = null
  private swellOffset: ConstantSourceNode | null = null
  private windLfo: OscillatorNode | null = null
  private soundId: NatureSoundId | null = null
  private running = false
  private disposed = false
  private impulseTimer: number | null = null

  constructor(ctx: AudioContext) {
    this.ctx = ctx

    this.toneFilter = ctx.createBiquadFilter()
    this.toneFilter.type = 'lowpass'
    this.toneFilter.frequency.value = 4000
    this.toneFilter.Q.value = 0.7

    this.brightnessFilter = ctx.createBiquadFilter()
    this.brightnessFilter.type = 'highshelf'
    this.brightnessFilter.frequency.value = 2500
    this.brightnessFilter.gain.value = 0

    this.bedGain = ctx.createGain()
    this.bedGain.gain.value = 0.55

    this.impulseGain = ctx.createGain()
    this.impulseGain.gain.value = 0.35

    this.output = ctx.createGain()
    this.output.gain.value = 0

    this.toneFilter.connect(this.brightnessFilter)
    this.brightnessFilter.connect(this.bedGain)
    this.bedGain.connect(this.output)
    this.impulseGain.connect(this.output)
  }

  connect(destination: AudioNode): void {
    this.output.connect(destination)
  }

  start(params: NatureParams): void {
    if (this.disposed) return
    this.running = true
    this.applyParams(params, /*forceRestart*/ true)
  }

  stop(fadeSec: number = RAMP_SEC.gain): void {
    if (!this.running) return
    rampParam(this.output.gain, 0, this.ctx.currentTime, fadeSec)
    const stopAt =
      this.ctx.currentTime + Math.max(RAMP_SEC.fadeMin, fadeSec) + 0.02
    window.setTimeout(() => {
      this.teardownGraph()
      this.running = false
    }, Math.ceil((stopAt - this.ctx.currentTime) * 1000))
  }

  setParams(params: NatureParams): void {
    if (this.disposed || !this.running) {
      this.soundId = effectiveSoundId(params)
      return
    }
    const next = effectiveSoundId(params)
    this.applyParams(params, next !== this.soundId)
  }

  dispose(): void {
    this.disposed = true
    this.teardownGraph()
    try {
      this.output.disconnect()
      this.bedGain.disconnect()
      this.impulseGain.disconnect()
      this.brightnessFilter.disconnect()
      this.toneFilter.disconnect()
    } catch {
      /* already disconnected */
    }
  }

  private applyParams(params: NatureParams, forceRestart: boolean): void {
    const t = this.ctx.currentTime
    const sound = effectiveSoundId(params)
    const brightness = clamp(params.brightness, 0, 1)
    // Shelf: −8 dB (dark) … +6 dB (bright)
    const shelfDb = -8 + brightness * 14
    rampParam(this.brightnessFilter.gain, shelfDb, t, RAMP_SEC.filter)

    const maxGain = GAIN.natureMax
    const targetGain =
      params.enabled && sound != null ? clamp(params.gain, 0, maxGain) : 0
    rampParam(this.output.gain, targetGain, t, RAMP_SEC.gain)

    if (!params.enabled || sound == null) {
      this.clearImpulseTimer()
      return
    }

    if (forceRestart || !this.source) {
      this.rebuildBed(sound)
    } else {
      this.tuneBed(sound, brightness)
    }

    this.scheduleImpulses(sound)
  }

  private rebuildBed(sound: NatureSoundId): void {
    this.teardownSourcesOnly()
    this.soundId = sound

    const kind =
      sound === 'shore' || sound === 'forest'
        ? 'brown'
        : sound === 'wind'
          ? 'pink'
          : 'white'
    const buffer = createNoiseBuffer(this.ctx, kind)
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(this.toneFilter)
    source.start()
    this.source = source

    this.tuneBed(sound, 0.5)

    if (sound === 'shore') {
      this.attachShoreSwell()
    } else if (sound === 'wind') {
      this.attachWindSweep()
    }
  }

  private tuneBed(sound: NatureSoundId, brightness: number): void {
    const t = this.ctx.currentTime
    const brightBoost = brightness * 0.35

    switch (sound) {
      case 'rain':
        this.toneFilter.type = 'bandpass'
        rampParam(this.toneFilter.frequency, 1800 + brightBoost * 2200, t, RAMP_SEC.filter)
        this.toneFilter.Q.value = 0.55
        rampParam(this.bedGain.gain, 0.5, t, RAMP_SEC.gain)
        rampParam(this.impulseGain.gain, 0.45, t, RAMP_SEC.gain)
        break
      case 'shore':
        this.toneFilter.type = 'lowpass'
        rampParam(this.toneFilter.frequency, 700 + brightBoost * 900, t, RAMP_SEC.filter)
        this.toneFilter.Q.value = 0.7
        // Bed gain is LFO-driven once swell is attached.
        if (!this.swellLfo) {
          rampParam(this.bedGain.gain, 0.62, t, RAMP_SEC.gain)
        }
        rampParam(this.impulseGain.gain, 0.28, t, RAMP_SEC.gain)
        break
      case 'wind':
        this.toneFilter.type = 'bandpass'
        // Filter center is LFO-driven once wind sweep is attached.
        if (!this.windLfo) {
          rampParam(this.toneFilter.frequency, 500 + brightBoost * 900, t, RAMP_SEC.filter)
        } else if (this.swellOffset) {
          this.swellOffset.offset.setTargetAtTime(
            500 + brightBoost * 900,
            t,
            0.08,
          )
        }
        this.toneFilter.Q.value = 0.9
        rampParam(this.bedGain.gain, 0.48, t, RAMP_SEC.gain)
        rampParam(this.impulseGain.gain, 0.12, t, RAMP_SEC.gain)
        break
      case 'forest':
        this.toneFilter.type = 'lowpass'
        rampParam(this.toneFilter.frequency, 450 + brightBoost * 500, t, RAMP_SEC.filter)
        this.toneFilter.Q.value = 0.6
        rampParam(this.bedGain.gain, 0.28, t, RAMP_SEC.gain)
        rampParam(this.impulseGain.gain, 0.55, t, RAMP_SEC.gain)
        break
    }
  }

  private attachShoreSwell(): void {
    // Slow amplitude swell on the bed (~0.08 Hz).
    const lfo = this.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.08

    const depth = this.ctx.createGain()
    depth.gain.value = 0.22

    const offset = this.ctx.createConstantSource()
    offset.offset.value = 0.55

    lfo.connect(depth)
    depth.connect(this.bedGain.gain)
    offset.connect(this.bedGain.gain)
    lfo.start()
    offset.start()

    this.swellLfo = lfo
    this.swellDepth = depth
    this.swellOffset = offset
  }

  private attachWindSweep(): void {
    const lfo = this.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.12

    const depth = this.ctx.createGain()
    depth.gain.value = 280

    const offset = this.ctx.createConstantSource()
    offset.offset.value = 650

    // Drive filter center frequency: base + LFO.
    this.toneFilter.frequency.value = 650
    lfo.connect(depth)
    depth.connect(this.toneFilter.frequency)
    offset.connect(this.toneFilter.frequency)
    lfo.start()
    offset.start()

    this.windLfo = lfo
    this.swellDepth = depth
    this.swellOffset = offset
  }

  private scheduleImpulses(sound: NatureSoundId): void {
    this.clearImpulseTimer()
    if (sound === 'wind') return

    const tick = () => {
      if (!this.running || this.disposed || this.soundId !== sound) return
      if (sound === 'rain') this.fireRainDrop()
      else if (sound === 'shore') this.fireShoreHiss()
      else if (sound === 'forest') this.fireForestChirp()

      const delayMs =
        sound === 'rain'
          ? 40 + Math.random() * 180
          : sound === 'shore'
            ? 1800 + Math.random() * 3200
            : 900 + Math.random() * 2800
      this.impulseTimer = window.setTimeout(tick, delayMs)
    }

    const firstMs =
      sound === 'rain' ? 80 + Math.random() * 200 : 600 + Math.random() * 1200
    this.impulseTimer = window.setTimeout(tick, firstMs)
  }

  private fireRainDrop(): void {
    const duration = 0.035 + Math.random() * 0.05
    const buffer = this.ctx.createBuffer(
      1,
      Math.max(1, Math.floor(this.ctx.sampleRate * duration)),
      this.ctx.sampleRate,
    )
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      const env = Math.exp(-i / (data.length * 0.22))
      data[i] = (Math.random() * 2 - 1) * env
    }

    const src = this.ctx.createBufferSource()
    src.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2500 + Math.random() * 4500
    filter.Q.value = 1.2

    const pan = this.ctx.createStereoPanner()
    pan.pan.value = Math.random() * 2 - 1

    const g = this.ctx.createGain()
    g.gain.value = 0.15 + Math.random() * 0.35

    src.connect(filter)
    filter.connect(pan)
    pan.connect(g)
    g.connect(this.impulseGain)
    src.start()
    src.stop(this.ctx.currentTime + duration + 0.02)
  }

  private fireShoreHiss(): void {
    const duration = 1.4 + Math.random() * 1.8
    const buffer = createNoiseBuffer(this.ctx, 'white')
    const src = this.ctx.createBufferSource()
    src.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 900 + Math.random() * 700
    filter.Q.value = 0.6

    const g = this.ctx.createGain()
    const t = this.ctx.currentTime
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.35 + Math.random() * 0.25, t + duration * 0.35)
    g.gain.linearRampToValueAtTime(0, t + duration)

    src.connect(filter)
    filter.connect(g)
    g.connect(this.impulseGain)
    src.start()
    src.stop(t + duration + 0.05)
  }

  private fireForestChirp(): void {
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    const startHz = 1800 + Math.random() * 2200
    const endHz = startHz * (0.65 + Math.random() * 0.25)
    const t = this.ctx.currentTime
    const dur = 0.12 + Math.random() * 0.22
    osc.frequency.setValueAtTime(startHz, t)
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, endHz), t + dur)

    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.18 + Math.random() * 0.12, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)

    const pan = this.ctx.createStereoPanner()
    pan.pan.value = Math.random() * 1.6 - 0.8

    osc.connect(g)
    g.connect(pan)
    pan.connect(this.impulseGain)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  private clearImpulseTimer(): void {
    if (this.impulseTimer != null) {
      window.clearTimeout(this.impulseTimer)
      this.impulseTimer = null
    }
  }

  private teardownSourcesOnly(): void {
    this.clearImpulseTimer()
    if (this.source) {
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
    for (const node of [this.swellLfo, this.windLfo]) {
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
    this.swellLfo = null
    this.windLfo = null
    if (this.swellDepth) {
      try {
        this.swellDepth.disconnect()
      } catch {
        /* already disconnected */
      }
      this.swellDepth = null
    }
    if (this.swellOffset) {
      try {
        this.swellOffset.stop()
      } catch {
        /* already stopped */
      }
      try {
        this.swellOffset.disconnect()
      } catch {
        /* already disconnected */
      }
      this.swellOffset = null
    }
  }

  private teardownGraph(): void {
    this.teardownSourcesOnly()
    this.soundId = null
  }
}

function effectiveSoundId(params: NatureParams): NatureSoundId | null {
  if (!params.enabled) return null
  if (params.soundId && FREQ.natureSounds.includes(params.soundId)) {
    return params.soundId
  }
  // Enabling with null / unknown id falls back to rain so toggles always work.
  return 'rain'
}
