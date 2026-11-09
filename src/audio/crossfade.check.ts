/**
 * Tiny pure check for crossfade helpers (no test runner in repo yet).
 * Run: npx --yes tsx src/audio/crossfade.check.ts
 */
import { clampCrossfadeDuration, CROSSFADE_SEC } from './crossfade'

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

assert(clampCrossfadeDuration(2) === 2, 'default mid stays')
assert(clampCrossfadeDuration(0.2) === CROSSFADE_SEC.min, 'floors to min')
assert(clampCrossfadeDuration(9) === CROSSFADE_SEC.max, 'caps to max')
assert(
  clampCrossfadeDuration(Number.NaN) === CROSSFADE_SEC.default,
  'NaN → default',
)
assert(
  clampCrossfadeDuration(Number.POSITIVE_INFINITY) === CROSSFADE_SEC.default,
  'Inf → default',
)

console.log('crossfade.check: ok')
