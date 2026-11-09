/**
 * Tiny pure check for LayerEq helpers (no test runner in repo yet).
 * Run: npx --yes tsx src/audio/layerEq.check.ts
 */
import {
  LAYER_EQ_DB,
  NEUTRAL_LAYER_EQ,
  clampDb,
  normalizeLayerEq,
} from './LayerEq'

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

assert(NEUTRAL_LAYER_EQ.lowDb === 0, 'neutral low')
assert(NEUTRAL_LAYER_EQ.midDb === 0, 'neutral mid')
assert(NEUTRAL_LAYER_EQ.highDb === 0, 'neutral high')

assert(clampDb(0) === 0, 'clamp 0')
assert(clampDb(-40) === LAYER_EQ_DB.min, 'clamp floors')
assert(clampDb(40) === LAYER_EQ_DB.max, 'clamp caps')
assert(clampDb(Number.NaN) === LAYER_EQ_DB.min, 'NaN → min')

const fromPartial = normalizeLayerEq({ lowDb: 3 })
assert(fromPartial.lowDb === 3, 'partial low')
assert(fromPartial.midDb === 0, 'partial mid defaults')
assert(fromPartial.highDb === 0, 'partial high defaults')

const fromEmpty = normalizeLayerEq(undefined)
assert(
  fromEmpty.lowDb === 0 && fromEmpty.midDb === 0 && fromEmpty.highDb === 0,
  'undefined → neutral',
)

const clipped = normalizeLayerEq({ lowDb: -99, midDb: 99, highDb: 1.25 })
assert(clipped.lowDb === LAYER_EQ_DB.min, 'normalize floors low')
assert(clipped.midDb === LAYER_EQ_DB.max, 'normalize caps mid')
assert(clipped.highDb === 1.25, 'normalize keeps mid-range')

console.log('layerEq.check: ok')
