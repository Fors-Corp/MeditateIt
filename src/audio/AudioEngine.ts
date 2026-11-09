import {
  CROSSFADE_SEC,
  clampCrossfadeDuration,
  dualRampCrossfade,
} from './crossfade'
import { DEFAULT_ENGINE_PARAMS, GAIN, RAMP_SEC } from './constants'
import { LayerBank } from './LayerBank'
import { normalizeLayerEq } from './LayerEq'
import { clamp, rampParam } from './ramp'
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

export interface CrossfadeOptions {
  /**
   * Crossfade length in seconds (clamped to 1–3).
   * Defaults to {@link CROSSFADE_SEC.default}.
   */
  durationSec?: number
}

type BankKey = 'a' | 'b'

/**
 * Singleton Web Audio engine.
 *
 * Master chain: dual layer banks → masterGain → softLimiter → destination
 *
 * UI should call only this class (via {@link audioEngine}): never touch raw nodes.
 */
export class AudioEngine {
  static readonly binauralRequiresHeadphones = BINAURAL_REQUIRES_HEADPHONES

  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private limiter: DynamicsCompressorNode | null = null
  private sumBus: GainNode | null = null
  private bankA: LayerBank | null = null
  private bankB: LayerBank | null = null
  private active: BankKey = 'a'
  private params: EngineParams = structuredClone(DEFAULT_ENGINE_PARAMS)
  private status: AudioEngineStatus = 'idle'
  private stopTimer: number | null = null
  private crossfadeTimer: number | null = null
  private crossfading = false

  getStatus(): AudioEngineStatus {
    return this.status
  }

  getParams(): EngineParams {
    return structuredClone(this.params)
  }

  /** True while a mid-session preset crossfade is in flight. */
  isCrossfading(): boolean {
    return this.crossfading
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
    this.settleCrossfadeImmediate()

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

    const activeBank = this.activeBank()
    const idleBank = this.idleBank()
    idleBank.bus.gain.setValueAtTime(0, ctx.currentTime)
    activeBank.bus.gain.setValueAtTime(1, ctx.currentTime)

    this.masterGain!.gain.setValueAtTime(0, ctx.currentTime)
    activeBank.start(this.params)

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
    this.settleCrossfadeImmediate()

    const fadeOut = Math.max(
      RAMP_SEC.fadeMin,
      options.fadeOutSec ?? this.params.fadeOutSec,
    )
    const t = this.ctx.currentTime
    rampParam(this.masterGain.gain, 0, t, fadeOut)
    this.activeBank().stop(fadeOut)

    this.stopTimer = window.setTimeout(() => {
      void this.ctx?.suspend()
      this.status = 'idle'
      this.stopTimer = null
    }, Math.ceil(fadeOut * 1000) + 40)
  }

  /**
   * Crossfade from the current recipe to `next` over ~1–3s using dual bus gains.
   * No-ops (params still updated) when not running.
   */
  crossfadeTo(next: EngineParams, options: CrossfadeOptions = {}): void {
    this.params = normalizeParams(next)

    if (this.status !== 'running' || !this.ctx) {
      return
    }

    this.clearStopTimer()
    this.settleCrossfadeImmediate()

    const ctx = this.ctx
    const from = this.activeBank()
    const to = this.idleBank()
    const duration = clampCrossfadeDuration(
      options.durationSec ?? CROSSFADE_SEC.default,
    )

    to.bus.gain.setValueAtTime(0, ctx.currentTime)
    to.start(this.params)

    const used = dualRampCrossfade(
      from.bus.gain,
      to.bus.gain,
      ctx.currentTime,
      duration,
    )

    this.crossfading = true
    const nextActive: BankKey = this.active === 'a' ? 'b' : 'a'
    this.crossfadeTimer = window.setTimeout(() => {
      this.active = nextActive
      this.crossfading = false
      this.crossfadeTimer = null
      from.stop(RAMP_SEC.fadeMin)
      from.bus.gain.setValueAtTime(0, this.ctx?.currentTime ?? 0)
    }, Math.ceil(used * 1000) + 30)
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
    const sumBus = ctx.createGain()
    sumBus.gain.value = 1

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0

    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -8
    limiter.knee.value = 8
    limiter.ratio.value = 12
    limiter.attack.value = 0.003
    limiter.release.value = 0.12

    const bankA = new LayerBank(ctx)
    const bankB = new LayerBank(ctx)
    bankA.connect(sumBus)
    bankB.connect(sumBus)

    sumBus.connect(masterGain)
    masterGain.connect(limiter)
    limiter.connect(ctx.destination)

    this.ctx = ctx
    this.sumBus = sumBus
    this.masterGain = masterGain
    this.limiter = limiter
    this.bankA = bankA
    this.bankB = bankB
    this.active = 'a'

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
    const target = this.crossfading ? this.idleBank() : this.activeBank()
    target.setParams(this.params)
  }

  private activeBank(): LayerBank {
    return this.active === 'a' ? this.bankA! : this.bankB!
  }

  private idleBank(): LayerBank {
    return this.active === 'a' ? this.bankB! : this.bankA!
  }

  private settleCrossfadeImmediate(): void {
    if (!this.crossfading || !this.ctx) {
      this.clearCrossfadeTimer()
      this.crossfading = false
      return
    }

    const from = this.activeBank()
    const to = this.idleBank()
    const t = this.ctx.currentTime
    from.bus.gain.cancelScheduledValues(t)
    from.bus.gain.setValueAtTime(0, t)
    to.bus.gain.cancelScheduledValues(t)
    to.bus.gain.setValueAtTime(1, t)
    from.stop(RAMP_SEC.fadeMin)
    this.active = this.active === 'a' ? 'b' : 'a'
    this.clearCrossfadeTimer()
    this.crossfading = false
  }

  private clearStopTimer(): void {
    if (this.stopTimer != null) {
      window.clearTimeout(this.stopTimer)
      this.stopTimer = null
    }
  }

  private clearCrossfadeTimer(): void {
    if (this.crossfadeTimer != null) {
      window.clearTimeout(this.crossfadeTimer)
      this.crossfadeTimer = null
    }
  }

  private hasMasterChain(): boolean {
    return (
      this.sumBus != null &&
      this.limiter != null &&
      this.bankA != null &&
      this.bankB != null
    )
  }
}

function normalizeParams(params: EngineParams): EngineParams {
  return mergeParams(DEFAULT_ENGINE_PARAMS, {
    masterGain: params.masterGain,
    fadeInSec: params.fadeInSec,
    fadeOutSec: params.fadeOutSec,
    noise: params.noise,
    tone: params.tone,
    beat: params.beat,
    nature: params.nature,
  })
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
      eq: normalizeLayerEq({
        ...base.noise.eq,
        ...patch.noise?.eq,
      }),
    },
    tone: {
      ...base.tone,
      ...patch.tone,
      gain: clamp(patch.tone?.gain ?? base.tone.gain, 0, GAIN.toneMax),
      eq: normalizeLayerEq({
        ...base.tone.eq,
        ...patch.tone?.eq,
      }),
    },
    beat: {
      ...base.beat,
      ...patch.beat,
      gain: clamp(patch.beat?.gain ?? base.beat.gain, 0, GAIN.beatMax),
      eq: normalizeLayerEq({
        ...base.beat.eq,
        ...patch.beat?.eq,
      }),
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
      eq: normalizeLayerEq({
        ...base.nature.eq,
        ...patch.nature?.eq,
      }),
    },
  }
}

/** Process-wide singleton — import this from UI. */
export const audioEngine = new AudioEngine()
