/**
 * Backup replace / history semantics against in-memory localStorage.
 * Run via: npm test
 */
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  importBackup,
  listSessionHistory,
  normalizePrefs,
  replaceSessionHistory,
  stringifyBackup,
  updatePrefs,
  type BackupDocument,
} from './index.ts'
import { installMemoryLocalStorage } from './checkMemoryStorage.ts'

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

function baseDoc(
  extra: Partial<BackupDocument> = {},
): BackupDocument {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: '2026-11-09T12:00:00.000Z',
    prefs: normalizePrefs({ masterVolume: 0.22 }),
    userPresets: [],
    sequences: [],
    ...extra,
  }
}

installMemoryLocalStorage()

await updatePrefs({ masterVolume: 0.5 })
await replaceSessionHistory([
  {
    id: 'keep-me',
    startedAt: '2026-11-08T10:00:00.000Z',
    endedAt: '2026-11-08T10:05:00.000Z',
    durationSec: 300,
    presetId: 'daily-calm',
    presetName: 'Daily calm',
    sequenceId: null,
  },
])

// replace + omitted history → wipe (honest full replace)
const wiped = await importBackup(stringifyBackup(baseDoc()), 'replace')
assert(wiped.historyCount === 0, 'replace without history wipes')
assert((await listSessionHistory()).length === 0, 'history empty after wipe')

await replaceSessionHistory([
  {
    id: 'keep-me',
    startedAt: '2026-11-08T10:00:00.000Z',
    endedAt: '2026-11-08T10:05:00.000Z',
    durationSec: 300,
    presetId: 'daily-calm',
    presetName: 'Daily calm',
    sequenceId: null,
  },
])

const kept = await importBackup(stringifyBackup(baseDoc()), 'replace', {
  keepHistoryWhenOmitted: true,
})
assert(kept.historyCount === 1, 'keepHistoryWhenOmitted preserves count')
assert(
  (await listSessionHistory())[0]?.id === 'keep-me',
  'keepHistoryWhenOmitted preserves id',
)

const replaced = await importBackup(
  stringifyBackup(
    baseDoc({
      sessionHistory: [
        {
          id: 'from-file',
          startedAt: '2026-11-07T10:00:00.000Z',
          endedAt: '2026-11-07T10:10:00.000Z',
          durationSec: 600,
          presetId: null,
          presetName: 'Imported',
          sequenceId: null,
        },
      ],
    }),
  ),
  'replace',
)
assert(replaced.historyCount === 1, 'replace with history uses file')
assert(
  (await listSessionHistory())[0]?.id === 'from-file',
  'file history replaces device history',
)

// merge without history leaves device history alone
await replaceSessionHistory([
  {
    id: 'device',
    startedAt: '2026-11-08T10:00:00.000Z',
    endedAt: '2026-11-08T10:05:00.000Z',
    durationSec: 300,
    presetId: 'daily-calm',
    presetName: 'Daily calm',
    sequenceId: null,
  },
])
const merged = await importBackup(stringifyBackup(baseDoc()), 'merge')
assert(merged.historyCount === 1, 'merge omitted history keeps device')
assert(
  (await listSessionHistory())[0]?.id === 'device',
  'merge does not wipe history',
)

console.log('backup-import.check: ok')
