import { BeatLayer } from './BeatLayer'
import { LayerEq } from './LayerEq'
import { NatureLayer } from './NatureLayer'
import { NoiseLayer } from './NoiseLayer'
import { ToneLayer } from './ToneLayer'
import type { EngineParams } from './types'

/**
 * One full noise/tone/beat/nature stack behind a bus gain.
 * Each layer feeds a 3-band EQ before the bank bus.
 * AudioEngine keeps two banks so preset switches can dual-ramp A→B.
 */
export class LayerBank {
  readonly bus: GainNode
  readonly noise: NoiseLayer
  readonly tone: ToneLayer
  readonly beat: BeatLayer
  readonly nature: NatureLayer
  readonly noiseEq: LayerEq
  readonly toneEq: LayerEq
  readonly beatEq: LayerEq
  readonly natureEq: LayerEq

  constructor(ctx: AudioContext) {
    this.bus = ctx.createGain()
    this.bus.gain.value = 0
    this.noise = new NoiseLayer(ctx)
    this.tone = new ToneLayer(ctx)
    this.beat = new BeatLayer(ctx)
    this.nature = new NatureLayer(ctx)
    this.noiseEq = new LayerEq(ctx)
    this.toneEq = new LayerEq(ctx)
    this.beatEq = new LayerEq(ctx)
    this.natureEq = new LayerEq(ctx)

    this.noise.connect(this.noiseEq.input)
    this.tone.connect(this.toneEq.input)
    this.beat.connect(this.beatEq.input)
    this.nature.connect(this.natureEq.input)

    this.noiseEq.connect(this.bus)
    this.toneEq.connect(this.bus)
    this.beatEq.connect(this.bus)
    this.natureEq.connect(this.bus)
  }

  connect(destination: AudioNode): void {
    this.bus.connect(destination)
  }

  start(params: EngineParams): void {
    this.noise.start(params.noise)
    this.tone.start(params.tone)
    this.beat.start(params.beat)
    this.nature.start(params.nature)
    this.applyEq(params)
  }

  stop(fadeSec: number): void {
    this.noise.stop(fadeSec)
    this.tone.stop(fadeSec)
    this.beat.stop(fadeSec)
    this.nature.stop(fadeSec)
  }

  setParams(params: EngineParams): void {
    this.noise.setParams(params.noise)
    this.tone.setParams(params.tone)
    this.beat.setParams(params.beat)
    this.nature.setParams(params.nature)
    this.applyEq(params)
  }

  dispose(): void {
    this.noise.dispose()
    this.tone.dispose()
    this.beat.dispose()
    this.nature.dispose()
    this.noiseEq.dispose()
    this.toneEq.dispose()
    this.beatEq.dispose()
    this.natureEq.dispose()
    try {
      this.bus.disconnect()
    } catch {
      /* already disconnected */
    }
  }

  private applyEq(params: EngineParams): void {
    this.noiseEq.setParams(params.noise.eq)
    this.toneEq.setParams(params.tone.eq)
    this.beatEq.setParams(params.beat.eq)
    this.natureEq.setParams(params.nature.eq)
  }
}
