import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  clearSessionHistory,
  downloadBackup,
  importBackup,
  listSessionHistory,
  MAX_BACKUP_CHARS,
  type BackupImportMode,
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

  const refreshHistory = useCallback(() => {
    void listSessionHistory().then(setHistory)
  }, [])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  const handleExport = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const doc = await downloadBackup()
      setMessage(
        `Exported ${doc.userPresets.length} preset${doc.userPresets.length === 1 ? '' : 's'} and ${(doc.sessionHistory ?? []).length} session${(doc.sessionHistory ?? []).length === 1 ? '' : 's'}.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setBusy(false)
    }
  }

  const runImport = async (text: string) => {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const result = await importBackup(text, importMode)
      refreshHistory()
      setMessage(
        `Import (${result.mode}): ${result.userPresetCount} preset${result.userPresetCount === 1 ? '' : 's'}, ${result.historyCount} history entr${result.historyCount === 1 ? 'y' : 'ies'}.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleFile = async (file: File | null) => {
    if (!file) return
    if (file.size > MAX_BACKUP_CHARS) {
      setError(
        `Backup too large (max ${Math.floor(MAX_BACKUP_CHARS / (1024 * 1024))} MB)`,
      )
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

  return (
    <div className="settings-page">
      <section className="settings-section" aria-labelledby="backup-heading">
        <h1 id="backup-heading">Backup</h1>
        <p className="settings-lede">
          Download or restore prefs and saved presets as JSON. No account —
          the file stays on this device.
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
              <strong>Merge</strong> — keep existing presets; same ids update
              from the file
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
              <strong>Replace</strong> — overwrite prefs and user presets with
              the file
            </span>
          </label>
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
          session).
        </p>

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

      <p className="settings-foot">
        <Link to="/">← Back home</Link>
      </p>
    </div>
  )
}
