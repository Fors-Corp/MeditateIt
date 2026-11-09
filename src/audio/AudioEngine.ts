import { BeatLayer } from './BeatLayer'
import { DEFAULT_ENGINE_PARAMS, GAIN, RAMP_SEC } from './constants'
import { NatureLayer } from './NatureLayer'
import { NoiseLayer } from './NoiseLayer'
import { clamp, rampParam } from './ramp'
import { ToneLayer } from './ToneLayer'
import type {
  AudioEngineStatus,
  BeatParams,
  EngineParams,
  EngineParamsPatch,
  NatureParams,
  NoiseParams,
  ToneParams,
} from './types'
import { BINAURAL_REQUIRES_HEADPHONES } from './types'

export interface StartOptions {
  /** Override fade-in seconds for this start (defaults to params.fadeInSec). */
  fadeInSec?: number
}

export interface StopOptions {
  /** Override fade-out seconds for this stop (defaults to params.fadeOutSec). */
  fadeOutSec?: number
}

/**
 * Singleton Web Audio engine.
 *
 * Master chain: layer sum → masterGain → softLimiter (DynamicsCompressor) → destination
 *
 * UI should call only this class (via {@link audioEngine}): never touch raw nodes.
 */
export class AudioEngine {
  static readonly binauralRequiresHeadphones = BINAURAL_REQUIRES_HEADPHONES

  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private limiter: DynamicsCompressorNode | null = null
  private bus: GainNode | null = null
  private noise: NoiseLayer | null = null
  private tone: ToneLayer | null = null
  private beat: BeatLayer | null = null
  private nature: NatureLayer | null = null
  private params: EngineParams = structuredClone(DEFAULT_ENGINE_PARAMS)
  private status: AudioEngineStatus = 'idle'
  private stopTimer: number | null = null

  getStatus(): AudioEngineStatus {
    return this.status
  }

  getParams(): EngineParams {
    return structuredClone(this.params)
  }

  /**
   * Resume/create AudioContext, wire layers, fade master in.
   * Must be called from a user gesture on first use (browser autoplay policy).
   */
  async start(options: StartOptions = {}): Promise<void> {
    if (typeof window === 'undefined') {
      this.status = 'unavailable'
      return
    }
    this.clearStopTimer()

    try {
      this.ensureGraph()
    } catch {
      this.status = 'unavailable'
      return
    }

    const ctx = this.ctx!
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const fadeIn = Math.max(
      RAMP_SEC.fadeMin,
      options.fadeInSec ?? this.params.fadeInSec,
    )

    // Start layers muted; master fades in.
    this.masterGain!.gain.setValueAtTime(0, ctx.currentTime)
    this.noise!.start(this.params.noise)
    this.tone!.start(this.params.tone)
    this.beat!.start(this.params.beat)
    this.nature!.start(this.params.nature)

    const targetMaster = clamp(this.params.masterGain, 0, GAIN.masterMax)
    rampParam(this.masterGain!.gain, targetMaster, ctx.currentTime, fadeIn)
    this.status = 'running'
  }

  /** Fade out master + layers, then suspend the context. */
  stop(options: StopOptions = {}): void {
    if (this.status !== 'running' || !this.ctx || !this.masterGain) {
      this.status = this.ctx ? 'idle' : this.status
      return
    }

    this.clearStopTimer()
    const fadeOut = Math.max(
      RAMP_SEC.fadeMin,
      options.fadeOutSec ?? this.params.fadeOutSec,
    )
    const t = this.ctx.currentTime
    rampParam(this.masterGain.gain, 0, t, fadeOut)
    this.noise?.stop(fadeOut)
    this.tone?.stop(fadeOut)
    this.beat?.stop(fadeOut)
    this.nature?.stop(fadeOut)

    this.stopTimer = window.setTimeout(() => {
      void this.ctx?.suspend()
      this.status = 'idle'
      this.stopTimer = null
    }, Math.ceil(fadeOut * 1000) + 40)
  }

  /** Merge a partial param update; applies immediately when running. */
  setParams(patch: EngineParamsPatch): void {
    this.params = mergeParams(this.params, patch)
    if (this.status !== 'running') return
    this.applyRunningParams()
  }

  setMasterGain(gain: number): void {
    this.setParams({ masterGain: gain })
  }

  setNoise(patch: Partial<NoiseParams>): void {
    this.setParams({ noise: patch })
  }

  setTone(patch: Partial<ToneParams>): void {
    this.setParams({ tone: patch })
  }

  setBeat(patch: Partial<BeatParams>): void {
    this.setParams({ beat: patch })
  }

  setNature(patch: Partial<NatureParams>): void {
    this.setParams({ nature: patch })
  }

  private ensureGraph(): void {
    if (this.ctx) return

    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) {
      throw new Error('Web Audio API unavailable')
    }

    const ctx = new Ctx()
    const bus = ctx.createGain()
    bus.gain.value = 1

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0

    // Soft peak ceiling — gentle limiting on param spikes / sum peaks.
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -8
    limiter.knee.value = 8
    limiter.ratio.value = 12
    limiter.attack.value = 0.003
    limiter.release.value = 0.12

    bus.connect(masterGain)
    masterGain.connect(limiter)
    limiter.connect(ctx.destination)

    const noise = new NoiseLayer(ctx)
    const tone = new ToneLayer(ctx)
    const beat = new BeatLayer(ctx)
    const nature = new NatureLayer(ctx)
    noise.connect(bus)
    tone.connect(bus)
    beat.connect(bus)
    nature.connect(bus)

    this.ctx = ctx
    this.bus = bus
    this.masterGain = masterGain
    this.limiter = limiter
    this.noise = noise
    this.tone = tone
    this.beat = beat
    this.nature = nature

    if (!this.hasMasterChain()) {
      throw new Error('Audio master chain failed to initialize')
    }
  }

  private applyRunningParams(): void {
    if (!this.ctx || !this.masterGain) return
    const t = this.ctx.currentTime
    rampParam(
      this.masterGain.gain,
      clamp(this.params.masterGain, 0, GAIN.masterMax),
      t,
      RAMP_SEC.gain,
    )
    this.noise?.setParams(this.params.noise)
    this.tone?.setParams(this.params.tone)
    this.beat?.setParams(this.params.beat)
    this.nature?.setParams(this.params.nature)
  }

  private clearStopTimer(): void {
    if (this.stopTimer != null) {
      window.clearTimeout(this.stopTimer)
      this.stopTimer = null
    }
  }

  /** True once the master bus + limiter are connected to the destination. */
  private hasMasterChain(): boolean {
    return this.bus != null && this.limiter != null
  }
}

function mergeParams(
  base: EngineParams,
  patch: EngineParamsPatch,
): EngineParams {
  return {
    masterGain: clamp(
      patch.masterGain ?? base.masterGain,
      0,
      GAIN.masterMax,
    ),
    fadeInSec: Math.max(0, patch.fadeInSec ?? base.fadeInSec),
    fadeOutSec: Math.max(0, patch.fadeOutSec ?? base.fadeOutSec),
    noise: {
      ...base.noise,
      ...patch.noise,
      gain: clamp(
        patch.noise?.gain ?? base.noise.gain,
        0,
        GAIN.noiseMax,
      ),
    },
    tone: {
      ...base.tone,
      ...patch.tone,
      gain: clamp(patch.tone?.gain ?? base.tone.gain, 0, GAIN.toneMax),
    },
    beat: {
      ...base.beat,
      ...patch.beat,
      gain: clamp(patch.beat?.gain ?? base.beat.gain, 0, GAIN.beatMax),
    },
    nature: {
      ...base.nature,
      ...patch.nature,
      gain: clamp(
        patch.nature?.gain ?? base.nature.gain,
        0,
        GAIN.natureMax,
      ),
      brightness: clamp(
        patch.nature?.brightness ?? base.nature.brightness,
        0,
        1,
      ),
    },
  }
}

/** Process-wide singleton — import this from UI. */
export const audioEngine = new AudioEngine()
