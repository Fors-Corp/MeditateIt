import { BeatLayer } from './BeatLayer'
import { NoiseLayer } from './NoiseLayer'
import { ToneLayer } from './ToneLayer'
import type { EngineParams } from './types'

/**
 * One full noise/tone/beat stack behind a bus gain.
 * AudioEngine keeps two banks so preset switches can dual-ramp A→B.
 */
export class LayerBank {
  readonly bus: GainNode
  readonly noise: NoiseLayer
  readonly tone: ToneLayer
  readonly beat: BeatLayer

  constructor(ctx: AudioContext) {
    this.bus = ctx.createGain()
    this.bus.gain.value = 0
    this.noise = new NoiseLayer(ctx)
    this.tone = new ToneLayer(ctx)
    this.beat = new BeatLayer(ctx)
    this.noise.connect(this.bus)
    this.tone.connect(this.bus)
    this.beat.connect(this.bus)
  }

  connect(destination: AudioNode): void {
    this.bus.connect(destination)
  }

  start(params: EngineParams): void {
    this.noise.start(params.noise)
    this.tone.start(params.tone)
    this.beat.start(params.beat)
  }

  stop(fadeSec: number): void {
    this.noise.stop(fadeSec)
    this.tone.stop(fadeSec)
    this.beat.stop(fadeSec)
  }

  setParams(params: EngineParams): void {
    this.noise.setParams(params.noise)
    this.tone.setParams(params.tone)
    this.beat.setParams(params.beat)
  }

  dispose(): void {
    this.noise.dispose()
    this.tone.dispose()
    this.beat.dispose()
    try {
      this.bus.disconnect()
    } catch {
      /* already disconnected */
    }
  }
}
