import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  loadRecentSessions,
  loadSystemPresets,
  loadUserPresets,
  loadUserSequences,
  removeUserPreset,
  removeUserSequence,
} from '../components/session/bridges'
import {
  formatLocaleDateTime,
  systemPresetLabel,
  systemSequenceLabel,
  type Messages,
} from '../i18n'
import { useI18n } from '../i18n/useI18n'
import { isSystemPresetId, type Preset } from '../presets'
import {
  isSystemSequenceId,
  listSystemSequences,
  totalDurationSec,
  type Sequence,
} from '../sequences'
import { getLastUsedPreset, type SessionRecord } from '../storage'

function formatDuration(sec: number | null, messages: Messages): string {
  if (sec == null) return messages.home.openEnded
  const m = Math.round(sec / 60)
  return messages.home.minutes(m)
}

function formatHistoryDuration(sec: number, messages: Messages): string {
  if (sec < 60) return messages.home.historySeconds(sec)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return messages.home.historyMinutes(m, s)
}

function formatSequenceDurationLabel(
  sequence: Sequence,
  messages: Messages,
): string {
  const total = totalDurationSec(sequence)
  const m = Math.round(total / 60)
  return messages.home.sequenceDuration(m, sequence.stages.length)
}

function presetBlurb(id: string, messages: Messages): string | undefined {
  return messages.blurbs[id]
}

/** Prefer sequence replay when resolvable; else preset session. */
function resolveHistoryHref(
  row: SessionRecord,
  knownUserPresetIds: ReadonlySet<string>,
  knownUserSequenceIds: ReadonlySet<string>,
): string | null {
  if (
    row.sequenceId &&
    (isSystemSequenceId(row.sequenceId) ||
      knownUserSequenceIds.has(row.sequenceId))
  ) {
    return `/sequence/${row.sequenceId}`
  }
  if (
    row.presetId &&
    (isSystemPresetId(row.presetId) || knownUserPresetIds.has(row.presetId))
  ) {
    return `/session/${row.presetId}`
  }
  return null
}

export default function HomePage() {
  const { messages } = useI18n()
  const presets = loadSystemPresets()
  const sequences = listSystemSequences()
  const [quickStartId, setQuickStartId] = useState('daily-calm')
  const [userPresets, setUserPresets] = useState<Preset[]>([])
  const [userSequences, setUserSequences] = useState<Sequence[]>([])
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const knownUserPresetIds = useMemo(
    () => new Set(userPresets.map((p) => p.id)),
    [userPresets],
  )

  const refreshUserPresets = useCallback(() => {
    void loadUserPresets().then(setUserPresets)
  }, [])

  const refreshUserSequences = useCallback(() => {
    void loadUserSequences().then(setUserSequences)
  }, [])

  useEffect(() => {
    let cancelled = false
    void getLastUsedPreset().then((p) => {
      if (!cancelled) setQuickStartId(p.id)
    })
    void loadUserPresets().then((list) => {
      if (!cancelled) setUserPresets(list)
    })
    void loadUserSequences().then((list) => {
      if (!cancelled) setUserSequences(list)
    })
    void loadRecentSessions(5).then((list) => {
      if (!cancelled) setRecentSessions(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const knownUserSequenceIds = useMemo(
    () => new Set(userSequences.map((s) => s.id)),
    [userSequences],
  )

  useEffect(() => {
    if (window.location.hash !== '#sequences') return
    const el = document.getElementById('sequences')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleDeletePreset = async (id: string, name: string) => {
    if (!window.confirm(messages.home.deleteConfirm(name))) {
      return
    }
    setDeletingId(id)
    try {
      await removeUserPreset(id)
      refreshUserPresets()
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteSequence = async (id: string, name: string) => {
    if (!window.confirm(messages.home.deleteSequenceConfirm(name))) {
      return
    }
    setDeletingId(id)
    try {
      await removeUserSequence(id)
      refreshUserSequences()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="brand-hero">
        <div className="home-hero-glow" aria-hidden="true" />
        <p className="home-eyebrow">{messages.home.eyebrow}</p>
        <h1 id="brand-hero" className="home-brand">
          {messages.app.brand}
        </h1>
        <p className="home-lede">{messages.home.lede}</p>
        <div className="home-actions">
          <Link className="btn btn-primary" to={`/session/${quickStartId}`}>
            {messages.home.quickStart}
          </Link>
          <Link className="btn btn-ghost" to="/session/custom">
            {messages.home.custom}
          </Link>
          <Link className="btn btn-ghost" to="/settings">
            {messages.home.settings}
          </Link>
        </div>
      </section>

      <section
        id="sequences"
        className="preset-section"
        aria-labelledby="sequences-heading"
      >
        <div className="section-head">
          <h2 id="sequences-heading">{messages.home.sequences}</h2>
          <p className="section-aside">{messages.home.sequencesAside}</p>
        </div>
        <ul className="preset-list">
          {sequences.map((seq, index) => (
            <li key={seq.id} style={{ animationDelay: `${50 + index * 45}ms` }}>
              <Link className="preset-link" to={`/sequence/${seq.id}`}>
                <span className="preset-name">
                  {systemSequenceLabel(seq.id, 'name', seq.name)}
                </span>
                <span className="preset-meta">
                  {systemSequenceLabel(seq.id, 'summary', seq.summary)}
                </span>
                <span className="preset-duration">
                  {formatSequenceDurationLabel(seq, messages)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {userSequences.length > 0 ? (
        <section
          className="preset-section"
          aria-labelledby="user-sequences-heading"
        >
          <h2 id="user-sequences-heading">{messages.home.yourSequences}</h2>
          <ul className="preset-list">
            {userSequences.map((seq, index) => (
              <li
                key={seq.id}
                className="preset-row"
                style={{ animationDelay: `${55 + index * 40}ms` }}
              >
                <Link className="preset-link" to={`/sequence/${seq.id}`}>
                  <span className="preset-name">{seq.name}</span>
                  <span className="preset-meta">
                    {seq.summary || messages.home.savedOnDevice}
                  </span>
                  <span className="preset-duration">
                    {formatSequenceDurationLabel(seq, messages)}
                  </span>
                </Link>
                <button
                  type="button"
                  className="preset-delete"
                  onClick={() => void handleDeleteSequence(seq.id, seq.name)}
                  disabled={deletingId === seq.id}
                  aria-label={messages.home.deleteAria(seq.name)}
                >
                  {deletingId === seq.id ? '…' : messages.home.delete}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recentSessions.length > 0 ? (
        <section className="preset-section" aria-labelledby="history-heading">
          <div className="section-head">
            <h2 id="history-heading">{messages.home.recentSessions}</h2>
            <Link className="section-link" to="/settings">
              {messages.home.allAndBackup}
            </Link>
          </div>
          <ul className="history-list">
            {recentSessions.map((row) => {
              const href = resolveHistoryHref(
                row,
                knownUserPresetIds,
                knownUserSequenceIds,
              )
              const meta = [
                formatLocaleDateTime(row.endedAt),
                row.sequenceId &&
                (isSystemSequenceId(row.sequenceId) ||
                  knownUserSequenceIds.has(row.sequenceId))
                  ? messages.home.sequenceTag
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')

              return (
                <li key={row.id} className="history-row">
                  {href ? (
                    <Link className="history-link" to={href}>
                      <span className="history-name">{row.presetName}</span>
                      <span className="history-meta">{meta}</span>
                      <span className="history-duration">
                        {formatHistoryDuration(row.durationSec, messages)}
                      </span>
                      <span className="history-replay">
                        {messages.home.replay}
                      </span>
                    </Link>
                  ) : (
                    <>
                      <span className="history-name">{row.presetName}</span>
                      <span className="history-meta">{meta}</span>
                      <span className="history-duration">
                        {formatHistoryDuration(row.durationSec, messages)}
                      </span>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {userPresets.length > 0 ? (
        <section className="preset-section" aria-labelledby="user-presets-heading">
          <h2 id="user-presets-heading">{messages.home.yourPresets}</h2>
          <ul className="preset-list">
            {userPresets.map((preset, index) => (
              <li
                key={preset.id}
                className="preset-row"
                style={{ animationDelay: `${60 + index * 40}ms` }}
              >
                <Link className="preset-link" to={`/session/${preset.id}`}>
                  <span className="preset-name">{preset.name}</span>
                  <span className="preset-meta">{messages.home.savedOnDevice}</span>
                  <span className="preset-duration">
                    {formatDuration(preset.defaultDurationSec, messages)}
                  </span>
                </Link>
                <button
                  type="button"
                  className="preset-delete"
                  onClick={() => void handleDeletePreset(preset.id, preset.name)}
                  disabled={deletingId === preset.id}
                  aria-label={messages.home.deleteAria(preset.name)}
                >
                  {deletingId === preset.id ? '…' : messages.home.delete}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="preset-section" aria-labelledby="presets-heading">
        <h2 id="presets-heading">{messages.home.systemPresets}</h2>
        <ul className="preset-list">
          {presets.map((preset, index) => (
            <li key={preset.id} style={{ animationDelay: `${80 + index * 50}ms` }}>
              <Link className="preset-link" to={`/session/${preset.id}`}>
                <span className="preset-name">
                  {systemPresetLabel(preset.id, preset.name)}
                </span>
                <span className="preset-meta">
                  {presetBlurb(preset.id, messages) ??
                    formatDuration(preset.defaultDurationSec, messages)}
                </span>
                <span className="preset-duration">
                  {formatDuration(preset.defaultDurationSec, messages)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
