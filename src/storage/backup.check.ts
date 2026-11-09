/**
 * Tiny pure check for backup parse + history normalize (no test runner yet).
 * Run: npx --yes tsx src/storage/backup.check.ts
 */
import { BACKUP_FORMAT, BACKUP_VERSION, parseBackup } from './backup.ts'
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

let threw = false
try {
  parseBackup({ format: 'nope', version: 1, prefs: {}, userPresets: [] })
} catch {
  threw = true
}
assert(threw, 'rejects bad format')

console.log('backup.check: ok')
