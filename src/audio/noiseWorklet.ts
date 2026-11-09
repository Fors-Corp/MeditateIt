/** Must match `registerProcessor` name in public/worklets/noise-processor.js. */
export const NOISE_WORKLET_NAME = 'meditateit-noise' as const

/** Stable public URL — do not inline as data: (AudioWorklet.addModule rejects that). */
export const NOISE_WORKLET_URL = '/worklets/noise-processor.js' as const

const loadByContext = new WeakMap<BaseAudioContext, Promise<boolean>>()

/**
 * Load the noise AudioWorklet module once per AudioContext.
 * Returns false when AudioWorklet is missing or addModule fails
 * (caller should keep the looping-buffer path).
 */
export function ensureNoiseWorklet(ctx: BaseAudioContext): Promise<boolean> {
  const existing = loadByContext.get(ctx)
  if (existing) return existing

  const pending = (async (): Promise<boolean> => {
    if (!('audioWorklet' in ctx) || !ctx.audioWorklet) return false
    try {
      await ctx.audioWorklet.addModule(NOISE_WORKLET_URL)
      return true
    } catch {
      return false
    }
  })()

  loadByContext.set(ctx, pending)
  return pending
}

export function tryCreateNoiseWorkletNode(
  ctx: BaseAudioContext,
): AudioWorkletNode | null {
  try {
    return new AudioWorkletNode(ctx, NOISE_WORKLET_NAME, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    })
  } catch {
    return null
  }
}
