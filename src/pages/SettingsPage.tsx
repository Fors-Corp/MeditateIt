import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  applySessionHistoryRetention,
  clearSessionHistory,
  downloadBackup,
  eraseAllLocalData,
  HISTORY_RETENTION_DAY_OPTIONS,
  importBackup,
  labelForHistoryRetention,
  listSessionHistory,
  loadHistoryRetentionDays,
  MAX_BACKUP_CHARS,
  messageForStorageError,
  saveHistoryRetentionDays,
  STORAGE_ERROR,
  type BackupImportMode,
  type HistoryRetentionDays,
  type SessionRecord,
} from '../storage'

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`
}

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [history, setHistory] = useState<SessionRecord[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importMode, setImportMode] = useState<BackupImportMode>('merge')
  const [keepHistoryWhenOmitted, setKeepHistoryWhenOmitted] = useState(false)
  const [retentionDays, setRetentionDays] =
    useState<HistoryRetentionDays>(null)
  const [clearCachesOnErase, setClearCachesOnErase] = useState(false)

  const refreshHistory = useCallback(() => {
    void listSessionHistory().then(setHistory)
  }, [])

  useEffect(() => {
    refreshHistory()
    void loadHistoryRetentionDays().then(setRetentionDays)
  }, [refreshHistory])

  const handleExport = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const doc = await downloadBackup()
      const seqCount = (doc.sequences ?? []).length
      setMessage(
        `Exported ${doc.userPresets.length} preset${doc.userPresets.length === 1 ? '' : 's'}, ${seqCount} sequence${seqCount === 1 ? '' : 's'}, and ${(doc.sessionHistory ?? []).length} session${(doc.sessionHistory ?? []).length === 1 ? '' : 's'}.`,
      )
    } catch (err) {
      setError(messageForStorageError(err, STORAGE_ERROR.EXPORT_FAILED))
    } finally {
      setBusy(false)
    }
  }

  const runImport = async (text: string) => {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const result = await importBackup(text, importMode, {
        keepHistoryWhenOmitted:
          importMode === 'replace' ? keepHistoryWhenOmitted : false,
      })
      refreshHistory()
      setMessage(
        `Import (${result.mode}): ${result.userPresetCount} preset${result.userPresetCount === 1 ? '' : 's'}, ${result.userSequenceCount} sequence${result.userSequenceCount === 1 ? '' : 's'}, ${result.historyCount} history entr${result.historyCount === 1 ? 'y' : 'ies'}.`,
      )
    } catch (err) {
      setError(messageForStorageError(err, STORAGE_ERROR.IMPORT_FAILED))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleFile = async (file: File | null) => {
    if (!file) return
    if (file.size > MAX_BACKUP_CHARS) {
      setError(STORAGE_ERROR.TOO_LARGE)
      setMessage(null)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    const text = await file.text()
    await runImport(text)
  }

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        'Clear all session history on this device? Prefs and presets stay.',
      )
    ) {
      return
    }
    setBusy(true)
    try {
      await clearSessionHistory()
      setHistory([])
      setMessage('Session history cleared.')
      setError(null)
    } finally {
      setBusy(false)
    }
  }

  const handleRetentionChange = async (raw: string) => {
    const next: HistoryRetentionDays =
      raw === 'null' ? null : (Number(raw) as 7 | 30 | 90 | 365)
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const saved = await saveHistoryRetentionDays(next)
      setRetentionDays(saved)
      const purged = await applySessionHistoryRetention()
      setHistory(purged)
      setMessage(
        `History retention set to ${labelForHistoryRetention(saved).toLowerCase()}. ${purged.length} entr${purged.length === 1 ? 'y' : 'ies'} kept.`,
      )
    } catch (err) {
      setError(messageForStorageError(err, STORAGE_ERROR.RETENTION_FAILED))
    } finally {
      setBusy(false)
    }
  }

  const handleEraseAll = async () => {
    const cacheNote = clearCachesOnErase
      ? ' This also clears offline caches and unregisters the service worker.'
      : ''
    if (
      !window.confirm(
        `Erase all MeditateIt data on this device (prefs, saved presets, sequences, session history, and retention setting)?${cacheNote} This cannot be undone.`,
      )
    ) {
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const result = await eraseAllLocalData({
        clearCaches: clearCachesOnErase,
      })
      setHistory([])
      setRetentionDays(null)
      setKeepHistoryWhenOmitted(false)
      const cacheMsg = result.cachesCleared
        ? ` Caches cleared; ${result.serviceWorkersUnregistered} service worker${result.serviceWorkersUnregistered === 1 ? '' : 's'} unregistered.`
        : ''
      setMessage(
        `All local MeditateIt data erased (${result.removedKeys.length} keys).${cacheMsg}`,
      )
    } catch (err) {
      setError(messageForStorageError(err, STORAGE_ERROR.ERASE_FAILED))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="settings-page">
      <section className="settings-section" aria-labelledby="backup-heading">
        <h1 id="backup-heading">Backup</h1>
        <p className="settings-lede">
          Download or restore prefs, saved presets, sequences, and session
          history as JSON. Export includes finished listens by default. No
          account — the file stays on this device.
        </p>

        <div className="settings-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleExport()}
            disabled={busy}
          >
            Export JSON
          </button>
        </div>

        <fieldset className="settings-fieldset">
          <legend>Import mode</legend>
          <label className="settings-radio">
            <input
              type="radio"
              name="import-mode"
              value="merge"
              checked={importMode === 'merge'}
              onChange={() => setImportMode('merge')}
              disabled={busy}
            />
            <span>
              <strong>Merge</strong> — keep existing presets and sequences; same
              ids update from the file
            </span>
          </label>
          <label className="settings-radio">
            <input
              type="radio"
              name="import-mode"
              value="replace"
              checked={importMode === 'replace'}
              onChange={() => setImportMode('replace')}
              disabled={busy}
            />
            <span>
              <strong>Replace</strong> — overwrite prefs, user presets, and
              sequences; wipe session history when the file has none
            </span>
          </label>
          {importMode === 'replace' ? (
            <label className="settings-check">
              <input
                type="checkbox"
                checked={keepHistoryWhenOmitted}
                onChange={(e) => setKeepHistoryWhenOmitted(e.target.checked)}
                disabled={busy}
              />
              <span>
                Keep existing session history if the file omits history
              </span>
            </label>
          ) : null}
        </fieldset>

        <div className="settings-actions">
          <label className="btn btn-ghost settings-file-label">
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="visually-hidden"
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
            />
            Import JSON…
          </label>
        </div>

        {message ? (
          <p className="settings-status" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="settings-error" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <section className="settings-section" aria-labelledby="history-heading">
        <div className="settings-section-head">
          <h2 id="history-heading">Session history</h2>
          {history.length > 0 ? (
            <button
              type="button"
              className="settings-text-btn"
              onClick={() => void handleClearHistory()}
              disabled={busy}
            >
              Clear
            </button>
          ) : null}
        </div>
        <p className="settings-lede">
          Finished listens on this device (written when you stop or leave a
          session). Kept to at most 100 entries, plus any time limit below.
        </p>

        <label className="settings-select-label">
          <span>Retention</span>
          <select
            className="settings-select"
            value={retentionDays === null ? 'null' : String(retentionDays)}
            onChange={(e) => void handleRetentionChange(e.target.value)}
            disabled={busy}
          >
            {HISTORY_RETENTION_DAY_OPTIONS.map((days) => (
              <option
                key={days === null ? 'null' : String(days)}
                value={days === null ? 'null' : String(days)}
              >
                {labelForHistoryRetention(days)}
              </option>
            ))}
          </select>
        </label>

        {history.length === 0 ? (
          <p className="settings-empty">No sessions yet. Play something, then stop.</p>
        ) : (
          <ul className="history-list">
            {history.map((row) => (
              <li key={row.id} className="history-row">
                <span className="history-name">{row.presetName}</span>
                <span className="history-meta">{formatWhen(row.endedAt)}</span>
                <span className="history-duration">
                  {formatDuration(row.durationSec)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="settings-section" aria-labelledby="erase-heading">
        <h2 id="erase-heading">Erase all data</h2>
        <p className="settings-lede">
          Remove prefs, saved presets, sequences, session history, and the
          retention setting from this browser. Export a backup first if you may
          want it back.
        </p>
        <label className="settings-check">
          <input
            type="checkbox"
            checked={clearCachesOnErase}
            onChange={(e) => setClearCachesOnErase(e.target.checked)}
            disabled={busy}
          />
          <span>Also clear offline caches and unregister the service worker</span>
        </label>
        <div className="settings-actions">
          <button
            type="button"
            className="btn btn-ghost settings-erase-btn"
            onClick={() => void handleEraseAll()}
            disabled={busy}
          >
            Erase all local data…
          </button>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="about-heading">
        <h2 id="about-heading">About &amp; legal</h2>
        <p className="settings-lede">
          MeditateIt is a generative sound tool for personal wellness and focus.
          It is not a medical device and is not intended to diagnose, treat,
          cure, or prevent any condition. If you have health concerns, talk to a
          qualified professional.
        </p>
        <p className="settings-legal-links">
          <Link to="/privacy">Privacy</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/terms">Terms</Link>
        </p>
      </section>

      <p className="settings-foot">
        <Link to="/">← Back home</Link>
      </p>
    </div>
  )
}
