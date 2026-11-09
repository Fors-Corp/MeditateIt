/**
 * Continuous white / pink / brown noise on the audio thread.
 * No imports — AudioWorklet global scope only.
 *
 * Pink: Paul Kellet approximate filter (same scale as noiseBuffers.ts).
 * Brown: leaky integrator with soft clip.
 */
class MeditateItNoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    /** @type {'white' | 'pink' | 'brown'} */
    this.kind = 'pink'
    this.b0 = 0
    this.b1 = 0
    this.b2 = 0
    this.b3 = 0
    this.b4 = 0
    this.b5 = 0
    this.b6 = 0
    this.brownLast = 0

    this.port.onmessage = (event) => {
      const data = event.data
      if (!data || data.type !== 'setKind') return
      if (data.kind === 'white' || data.kind === 'pink' || data.kind === 'brown') {
        this.kind = data.kind
      }
    }
  }

  /**
   * @param {Float32Array[][]} _inputs
   * @param {Float32Array[][]} outputs
   */
  process(_inputs, outputs) {
    const channel = outputs[0] && outputs[0][0]
    if (!channel) return true

    for (let i = 0; i < channel.length; i++) {
      channel[i] = this.nextSample()
    }
    return true
  }

  nextSample() {
    if (this.kind === 'white') {
      return Math.random() * 2 - 1
    }
    if (this.kind === 'brown') {
      const white = Math.random() * 2 - 1
      let next = this.brownLast + white * 0.02
      if (next > 1) next = 1
      if (next < -1) next = -1
      this.brownLast = next
      return next
    }

    // pink (default)
    const white = Math.random() * 2 - 1
    this.b0 = 0.99886 * this.b0 + white * 0.0555179
    this.b1 = 0.99332 * this.b1 + white * 0.0750759
    this.b2 = 0.969 * this.b2 + white * 0.153852
    this.b3 = 0.8665 * this.b3 + white * 0.3104856
    this.b4 = 0.55 * this.b4 + white * 0.5329522
    this.b5 = -0.7616 * this.b5 - white * 0.016898
    const pink =
      this.b0 +
      this.b1 +
      this.b2 +
      this.b3 +
      this.b4 +
      this.b5 +
      this.b6 +
      white * 0.5362
    this.b6 = white * 0.115926
    return pink * 0.11
  }
}

registerProcessor('meditateit-noise', MeditateItNoiseProcessor)
