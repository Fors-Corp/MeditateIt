import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import LanguagePicker from '../components/LanguagePicker'
import {
  formatLocaleDateTime,
  type Messages,
} from '../i18n'
import { useI18n } from '../i18n/useI18n'
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

function formatDuration(sec: number, messages: Messages): string {
  if (sec < 60) return messages.home.historySeconds(sec)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m < 60) return messages.home.historyMinutes(m, s)
  const h = Math.floor(m / 60)
  const rm = m % 60
  return messages.home.historyHours(h, rm)
}

export default function SettingsPage() {
  const { messages } = useI18n()
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
        messages.settings.exported(
          doc.userPresets.length,
          seqCount,
          (doc.sessionHistory ?? []).length,
        ),
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
        messages.settings.imported(
          result.mode,
          result.userPresetCount,
          result.userSequenceCount,
          result.historyCount,
        ),
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
      setError(messageForStorageError(new Error(STORAGE_ERROR.TOO_LARGE)))
      setMessage(null)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    const text = await file.text()
    await runImport(text)
  }

  const handleClearHistory = async () => {
    if (!window.confirm(messages.settings.clearHistoryConfirm)) {
      return
    }
    setBusy(true)
    try {
      await clearSessionHistory()
      setHistory([])
      setMessage(messages.settings.historyCleared)
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
        messages.settings.retentionUpdated(
          labelForHistoryRetention(saved),
          purged.length,
        ),
      )
    } catch (err) {
      setError(messageForStorageError(err, STORAGE_ERROR.RETENTION_FAILED))
    } finally {
      setBusy(false)
    }
  }

  const handleEraseAll = async () => {
    if (
      !window.confirm(
        clearCachesOnErase
          ? messages.settings.eraseConfirmWithCaches
          : messages.settings.eraseConfirm,
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
        ? messages.settings.erasedCaches(result.serviceWorkersUnregistered)
        : ''
      setMessage(
        `${messages.settings.erased(result.removedKeys.length)}${cacheMsg}`,
      )
    } catch (err) {
      setError(messageForStorageError(err, STORAGE_ERROR.ERASE_FAILED))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="settings-page">
      <section className="settings-section" aria-labelledby="language-heading">
        <h1 id="language-heading">{messages.settings.languageHeading}</h1>
        <p className="settings-lede">{messages.settings.languageLede}</p>
        <LanguagePicker disabled={busy} />
      </section>

      <section className="settings-section" aria-labelledby="backup-heading">
        <h2 id="backup-heading">{messages.settings.backupHeading}</h2>
        <p className="settings-lede">{messages.settings.backupLede}</p>

        <div className="settings-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleExport()}
            disabled={busy}
          >
            {messages.settings.exportJson}
          </button>
        </div>

        <fieldset className="settings-fieldset">
          <legend>{messages.settings.importModeLegend}</legend>
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
              <strong>{messages.settings.mergeTitle}</strong>
              {messages.settings.mergeDetail}
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
              <strong>{messages.settings.replaceTitle}</strong>
              {messages.settings.replaceDetail}
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
              <span>{messages.settings.keepHistoryWhenOmitted}</span>
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
            {messages.settings.importJson}
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
          <h2 id="history-heading">{messages.settings.historyHeading}</h2>
          {history.length > 0 ? (
            <button
              type="button"
              className="settings-text-btn"
              onClick={() => void handleClearHistory()}
              disabled={busy}
            >
              {messages.settings.clear}
            </button>
          ) : null}
        </div>
        <p className="settings-lede">{messages.settings.historyLede}</p>

        <label className="settings-select-label">
          <span>{messages.settings.retention}</span>
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
          <p className="settings-empty">{messages.settings.historyEmpty}</p>
        ) : (
          <ul className="history-list">
            {history.map((row) => (
              <li key={row.id} className="history-row">
                <span className="history-name">{row.presetName}</span>
                <span className="history-meta">
                  {formatLocaleDateTime(row.endedAt)}
                </span>
                <span className="history-duration">
                  {formatDuration(row.durationSec, messages)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="settings-section" aria-labelledby="erase-heading">
        <h2 id="erase-heading">{messages.settings.eraseHeading}</h2>
        <p className="settings-lede">{messages.settings.eraseLede}</p>
        <label className="settings-check">
          <input
            type="checkbox"
            checked={clearCachesOnErase}
            onChange={(e) => setClearCachesOnErase(e.target.checked)}
            disabled={busy}
          />
          <span>{messages.settings.clearCachesToo}</span>
        </label>
        <div className="settings-actions">
          <button
            type="button"
            className="btn btn-ghost settings-erase-btn"
            onClick={() => void handleEraseAll()}
            disabled={busy}
          >
            {messages.settings.eraseButton}
          </button>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="about-heading">
        <h2 id="about-heading">{messages.settings.aboutHeading}</h2>
        <p className="settings-lede">{messages.settings.aboutLede}</p>
        <p className="settings-legal-links">
          <Link to="/privacy">{messages.app.privacy}</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/terms">{messages.app.terms}</Link>
        </p>
      </section>

      <p className="settings-foot">
        <Link to="/">{messages.app.backHome}</Link>
      </p>
    </div>
  )
}
