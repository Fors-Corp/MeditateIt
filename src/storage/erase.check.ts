/**
 * Erase-all + retention purge against in-memory localStorage.
 * Run via: npm test  (or npx tsx src/storage/erase.check.ts)
 */
import {
  applySessionHistoryRetention,
  eraseAllLocalData,
  loadHistoryRetentionDays,
  loadPrefs,
  listSessionHistory,
  listUserPresets,
  listUserSequences,
  saveHistoryRetentionDays,
  updatePrefs,
  STORAGE_KEYS,
} from './index.ts'
import { readJson, writeJson } from './local.ts'
import { installMemoryLocalStorage } from './checkMemoryStorage.ts'

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

installMemoryLocalStorage()

await updatePrefs({
  masterVolume: 0.77,
  preferHeadphonesAck: true,
  lastPresetId: 'daily-calm',
})
await writeJson(STORAGE_KEYS.userPresets, [
  {
    id: 'u1',
    name: 'User one',
    summary: 'seed',
    source: 'user',
    tags: [],
    recipe: {
      noise: { enabled: true, kind: 'pink' },
      tone: { enabled: false, frequencyHz: 528 },
      beat: { enabled: false, mode: 'off', carrierHz: 220, beatHz: 8 },
      nature: { enabled: false, soundId: null },
      gains: { noise: 0.3, tone: 0, beat: 0, nature: 0 },
      fadeInSec: 4,
      fadeOutSec: 8,
    },
  },
])
await writeJson(STORAGE_KEYS.userSequences, [])

// Write history raw so TTL is not applied until we call apply with a fixed now.
await writeJson(STORAGE_KEYS.sessionHistory, [
  {
    id: 'old',
    startedAt: '2026-01-01T10:00:00.000Z',
    endedAt: '2026-01-01T10:05:00.000Z',
    durationSec: 300,
    presetId: 'daily-calm',
    presetName: 'Daily calm',
    sequenceId: null,
  },
  {
    id: 'new',
    startedAt: '2026-11-08T10:00:00.000Z',
    endedAt: '2026-11-08T10:05:00.000Z',
    durationSec: 300,
    presetId: 'daily-calm',
    presetName: 'Daily calm',
    sequenceId: null,
  },
])
await saveHistoryRetentionDays(30)

const seeded = await readJson<unknown[]>(STORAGE_KEYS.sessionHistory)
assert(Array.isArray(seeded) && seeded.length === 2, 'seeded two history rows')

const purged = await applySessionHistoryRetention(
  Date.parse('2026-11-09T12:00:00.000Z'),
)
assert(purged.length === 1 && purged[0]!.id === 'new', 'TTL purge keeps recent only')
assert((await listSessionHistory()).length === 1, 'purged history persisted')
assert((await loadHistoryRetentionDays()) === 30, 'retention setting intact')

const erased = await eraseAllLocalData()
assert(
  erased.removedKeys.length === Object.keys(STORAGE_KEYS).length,
  'erase removes every STORAGE_KEYS entry',
)
for (const key of Object.values(STORAGE_KEYS)) {
  assert(erased.removedKeys.includes(key), `erase listed ${key}`)
}
assert(erased.cachesCleared === false, 'default erase skips caches')
assert(erased.serviceWorkersUnregistered === 0, 'default erase skips SW')

const prefs = await loadPrefs()
assert(prefs.masterVolume === 0.45, 'erase restores default prefs on load')
assert(prefs.lastPresetId === null, 'erase cleared lastPresetId')
assert((await listUserPresets()).length === 0, 'erase cleared presets')
assert((await listUserSequences()).length === 0, 'erase cleared sequences')
assert((await listSessionHistory()).length === 0, 'erase cleared history')
assert((await loadHistoryRetentionDays()) === null, 'erase cleared retention')

console.log('erase.check: ok')
