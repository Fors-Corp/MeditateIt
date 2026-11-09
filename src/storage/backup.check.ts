/**
 * Tiny pure check for backup parse + history normalize (no test runner yet).
 * Run: npx --yes tsx src/storage/backup.check.ts
 */
import { normalizeRecipe } from '../presets/recipe.ts'
import {
  BACKUP_FORMAT,
  BACKUP_MAX_CHARS,
  BACKUP_VERSION,
  parseBackup,
} from './backup.ts'
import { MAX_BACKUP_CHARS } from './limits.ts'
import { normalizeSessionRecord } from './sessionHistory.ts'
import { normalizePrefs } from './prefs.ts'

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

assert(BACKUP_MAX_CHARS === MAX_BACKUP_CHARS, 'BACKUP_MAX_CHARS alias')

const prefs = normalizePrefs({
  masterVolume: 0.5,
  preferHeadphonesAck: true,
})
assert(prefs.masterVolume === 0.5, 'prefs masterVolume')
assert(prefs.preferHeadphonesAck === true, 'prefs headphones')

const historyOk = normalizeSessionRecord({
  id: 'a',
  startedAt: '2026-11-09T10:00:00.000Z',
  endedAt: '2026-11-09T10:05:00.000Z',
  durationSec: 300,
  presetId: 'daily-calm',
  presetName: 'Daily calm',
  sequenceId: null,
})
assert(historyOk?.durationSec === 300, 'history duration')
assert(normalizeSessionRecord({ id: 'x' }) === null, 'history rejects junk')

const doc = parseBackup({
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  exportedAt: '2026-11-09T12:00:00.000Z',
  prefs: { masterVolume: 0.3 },
  userPresets: [],
  sequences: [],
})
assert(doc.prefs.masterVolume === 0.3, 'backup prefs')
assert(doc.userPresets.length === 0, 'backup presets empty')
assert((doc.sequences ?? []).length === 0, 'sequences ignored')

let threw = false
try {
  parseBackup({ format: 'nope', version: 1, prefs: {}, userPresets: [] })
} catch {
  threw = true
}
assert(threw, 'rejects bad format')

// --- adversarial / security probes ---

threw = false
try {
  parseBackup('x'.repeat(MAX_BACKUP_CHARS + 1))
} catch (err) {
  threw = err instanceof Error && /too large/i.test(err.message)
}
assert(threw, 'rejects oversized string')

threw = false
try {
  parseBackup(
    `{"format":"${BACKUP_FORMAT}","version":${BACKUP_VERSION},"__proto__":{"polluted":true},"userPresets":[]}`,
  )
} catch {
  threw = true
}
assert(threw, 'rejects __proto__ key')

assert(
  normalizeRecipe({
    noise: { enabled: true, kind: 'pink' },
    tone: { enabled: true, frequencyHz: Number.POSITIVE_INFINITY },
    beat: { enabled: true, mode: 'binaural', carrierHz: 200, beatHz: 8 },
    nature: { enabled: false, soundId: null },
    gains: { noise: 0.2, tone: 0.2, beat: 0.2, nature: 0.2 },
    fadeInSec: 1,
    fadeOutSec: 1,
  }) === null,
  'rejects non-finite tone Hz',
)

const evilRecipe = normalizeRecipe({
  noise: { enabled: true, kind: 'pink', highpassHz: 1e20, lowpassHz: -9 },
  tone: { enabled: true, frequencyHz: 999999 },
  beat: {
    enabled: true,
    mode: 'binaural',
    carrierHz: -1,
    beatHz: 9999,
    pulseDepth: 50,
  },
  nature: { enabled: true, soundId: 'rain', brightness: 99 },
  gains: { noise: 99, tone: -3, beat: Number.NaN, nature: 0.2 },
  fadeInSec: 1e9,
  fadeOutSec: -4,
})
assert(evilRecipe != null, 'normalize accepts shaped evil recipe')
const clamped = evilRecipe!
assert(clamped.fadeInSec <= 180, 'fadeIn capped')
assert(clamped.fadeOutSec === 0, 'fadeOut floors')
assert(clamped.tone.frequencyHz <= 2000, 'tone Hz capped')
assert(clamped.beat.beatHz <= 40, 'beat Hz capped')
assert(clamped.gains.noise <= 1, 'gain capped')
assert((clamped.noise.highpassHz ?? 0) <= 2000, 'hpf capped')
assert((clamped.noise.eq?.lowDb ?? -1) === 0, 'missing eq → neutral')

assert(
  normalizeRecipe({
    noise: {},
    tone: {},
    beat: {},
    nature: {},
    gains: {},
    fadeInSec: 1,
    fadeOutSec: 1,
  }) === null,
  'rejects empty nested recipe objects',
)

assert(
  normalizePrefs({
    lastRecipe: {
      noise: {},
      tone: {},
      beat: {},
      nature: {},
      gains: {},
      fadeInSec: 1,
      fadeOutSec: 1,
    },
    defaultFadeInSec: 1e12,
  }).lastRecipe === null,
  'prefs drops invalid lastRecipe',
)
assert(
  normalizePrefs({ defaultFadeInSec: 1e12 }).defaultFadeInSec <= 180,
  'prefs fade capped',
)

// Invalid enums / unknown keys → drop (strict), no prototype pollution.
const pollutedPrefs = normalizePrefs({
  masterVolume: 0.2,
  lastRecipe: {
    __proto__: { polluted: true },
    noise: { enabled: true, kind: 'laser', highpassHz: -9 },
    tone: { enabled: 1, frequencyHz: 'nope' },
    beat: { enabled: false, mode: 'hack', carrierHz: 240, beatHz: 8 },
    nature: { enabled: false, soundId: 'virus', brightness: 9 },
    gains: { noise: 4, tone: -1, beat: 0.1, nature: 0.1 },
    fadeInSec: 3,
    fadeOutSec: 4,
    extra: 'drop-me',
  },
})
assert(pollutedPrefs.lastRecipe === null, 'invalid enum recipe dropped')
assert(
  !Object.prototype.hasOwnProperty.call(Object.prototype, 'polluted'),
  'no Object.prototype pollution',
)

assert(normalizeRecipe(null) === null, 'normalizeRecipe rejects null')
assert(normalizeRecipe({ fadeInSec: 1 }) === null, 'normalizeRecipe rejects shallow')

const xssName = normalizeSessionRecord({
  id: 'h1',
  startedAt: '2026-11-09T10:00:00.000Z',
  endedAt: '2026-11-09T10:05:00.000Z',
  durationSec: 12,
  presetId: null,
  presetName: '<img src=x onerror=alert(1)>'.repeat(20),
  sequenceId: null,
})
assert(
  (xssName?.presetName.length ?? 0) <= 120,
  'history name truncated',
)

console.log('backup.check: ok')
