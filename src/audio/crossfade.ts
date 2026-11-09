import { clamp, rampParam } from './ramp'

/** Mid-session preset crossfade window (seconds). */
export const CROSSFADE_SEC = {
  min: 1,
  max: 3,
  default: 2,
} as const

/** Clamp a requested crossfade length into the 1–3s band. */
export function clampCrossfadeDuration(sec: number): number {
  if (!Number.isFinite(sec)) return CROSSFADE_SEC.default
  return clamp(sec, CROSSFADE_SEC.min, CROSSFADE_SEC.max)
}

/**
 * Dual-ramp A→B: fade `fromGain` to 0 while `toGain` rises to 1.
 * Click-free — cancels prior automation on both params first.
 */
export function dualRampCrossfade(
  fromGain: AudioParam,
  toGain: AudioParam,
  currentTime: number,
  durationSec: number = CROSSFADE_SEC.default,
): number {
  const dur = clampCrossfadeDuration(durationSec)
  rampParam(fromGain, 0, currentTime, dur)
  rampParam(toGain, 1, currentTime, dur)
  return dur
}
