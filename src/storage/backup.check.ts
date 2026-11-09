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
import { normalizeSessionRecord } from './sessionHistory.ts'
import { normalizePrefs } from './prefs.ts'

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

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

threw = false
try {
  parseBackup('x'.repeat(BACKUP_MAX_CHARS + 1))
} catch (err) {
  threw = err instanceof Error && err.message.includes('too large')
}
assert(threw, 'rejects oversized backup string')

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
assert(pollutedPrefs.lastRecipe !== null, 'lastRecipe kept when shaped')
assert(pollutedPrefs.lastRecipe?.noise.kind === 'pink', 'noise kind whitelist')
assert(pollutedPrefs.lastRecipe?.beat.mode === 'off', 'beat mode whitelist')
assert(pollutedPrefs.lastRecipe?.nature.soundId === null, 'nature sound whitelist')
assert(pollutedPrefs.lastRecipe?.gains.noise === 1, 'gain clamped')
assert(
  !Object.prototype.hasOwnProperty.call(pollutedPrefs.lastRecipe, 'extra'),
  'drops unknown recipe keys',
)
assert(
  !Object.prototype.hasOwnProperty.call(Object.prototype, 'polluted'),
  'no Object.prototype pollution',
)

assert(normalizeRecipe(null) === null, 'normalizeRecipe rejects null')
assert(normalizeRecipe({ fadeInSec: 1 }) === null, 'normalizeRecipe rejects shallow')

console.log('backup.check: ok')
