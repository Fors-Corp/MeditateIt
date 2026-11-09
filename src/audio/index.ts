/**
 * Audio engine ownership: sibling agents.
 * Web Audio + AudioWorklet layers (noise / tone / beat / nature), master
 * chain, and imperative `setParams` API live here.
 * Scaffold only — do not implement synthesis in the shell PR.
 */

export type AudioEngineStatus = 'idle' | 'running' | 'unavailable'

export interface AudioEngineStub {
  status: AudioEngineStatus
  start: () => Promise<void>
  stop: () => void
}

/** Stub export so routes/types can import without a real engine yet. */
export function createAudioEngineStub(): AudioEngineStub {
  return {
    status: 'idle',
    async start() {
      /* sibling: resume AudioContext + fade-in */
    },
    stop() {
      /* sibling: fade-out + suspend */
    },
  }
}
