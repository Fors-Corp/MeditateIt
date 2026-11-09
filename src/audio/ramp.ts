import { RAMP_SEC } from './constants'

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

/**
 * Click-free AudioParam change: cancel prior automation, hold current
 * value, then linear-ramp to the target.
 */
export function rampParam(
  param: AudioParam,
  value: number,
  currentTime: number,
  durationSec: number = RAMP_SEC.gain,
): void {
  const t0 = Math.max(0, currentTime)
  const dur = Math.max(RAMP_SEC.fadeMin, durationSec)
  const now = param.value
  param.cancelScheduledValues(t0)
  param.setValueAtTime(now, t0)
  param.linearRampToValueAtTime(value, t0 + dur)
}

/** Immediate hold (no audible jump) — used before stop/disconnect. */
export function holdParam(param: AudioParam, currentTime: number): void {
  const t0 = Math.max(0, currentTime)
  param.cancelScheduledValues(t0)
  param.setValueAtTime(param.value, t0)
}
