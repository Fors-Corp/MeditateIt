import type { NoiseKind } from './types'

const BUFFER_SECONDS = 2

/** Build a looping mono noise buffer for the given color. */
export function createNoiseBuffer(
  ctx: BaseAudioContext,
  kind: NoiseKind,
): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * BUFFER_SECONDS))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  switch (kind) {
    case 'white':
      fillWhite(data)
      break
    case 'pink':
      fillPink(data)
      break
    case 'brown':
      fillBrown(data)
      break
  }

  normalizePeak(data, 0.9)
  return buffer
}

function fillWhite(data: Float32Array): void {
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1
  }
}

/** Paul Kellet approximate pink filter on white noise. */
function fillPink(data: Float32Array): void {
  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    b3 = 0.8665 * b3 + white * 0.3104856
    b4 = 0.55 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.016898
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
    b6 = white * 0.115926
    data[i] = pink * 0.11
  }
}

function fillBrown(data: Float32Array): void {
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    last = clampSample(last + white * 0.02)
    data[i] = last
  }
}

function clampSample(v: number): number {
  if (v > 1) return 1
  if (v < -1) return -1
  return v
}

function normalizePeak(data: Float32Array, peak: number): void {
  let max = 0
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]!)
    if (a > max) max = a
  }
  if (max < 1e-8) return
  const scale = peak / max
  for (let i = 0; i < data.length; i++) {
    data[i]! *= scale
  }
}
