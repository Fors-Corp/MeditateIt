import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  loadRecentSessions,
  loadSystemPresets,
  loadUserPresets,
  loadUserSequences,
  PRESET_BLURBS,
  removeUserPreset,
  removeUserSequence,
} from '../components/session/bridges'
import {
  formatSequenceDuration,
  listSystemSequences,
  type Sequence,
} from '../sequences'
import { getLastUsedPreset, type SessionRecord } from '../storage'
import type { Preset } from '../presets'

function formatDuration(sec: number | null): string {
  if (sec == null) return 'Open-ended'
  const m = Math.round(sec / 60)
  return `${m} min`
}

function formatHistoryDuration(sec: number): string {
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function formatHistoryWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HomePage() {
  const presets = loadSystemPresets()
  const sequences = listSystemSequences()
  const [quickStartId, setQuickStartId] = useState('daily-calm')
  const [userPresets, setUserPresets] = useState<Preset[]>([])
  const [userSequences, setUserSequences] = useState<Sequence[]>([])
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDeletePreset = async (id: string, name: string) => {
    if (!window.confirm(`Delete preset “${name}”? This cannot be undone.`)) {
      return
    }
    setDeletingId(id)
    try {
      await removeUserPreset(id)
      refreshUserPresets()
      if (quickStartId === id) {
        const last = await getLastUsedPreset()
        setQuickStartId(last.id)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteSequence = async (id: string, name: string) => {
    if (!window.confirm(`Delete sequence “${name}”? This cannot be undone.`)) {
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
        <p className="home-eyebrow">Generative soundscapes</p>
        <h1 id="brand-hero" className="home-brand">
          MeditateIt
        </h1>
        <p className="home-lede">
          Shape pink noise, solfeggio tones, and beats live — start calm in under
          thirty seconds.
        </p>
        <div className="home-actions">
          <Link className="btn btn-primary" to={`/session/${quickStartId}`}>
            Quick start
          </Link>
          <Link className="btn btn-ghost" to="/session/custom">
            Custom
          </Link>
          <Link className="btn btn-ghost" to="/settings">
            Settings
          </Link>
        </div>
      </section>

      <section className="preset-section" aria-labelledby="sequences-heading">
        <h2 id="sequences-heading">Sequences</h2>
        <ul className="preset-list">
          {sequences.map((seq, index) => (
            <li key={seq.id} style={{ animationDelay: `${50 + index * 45}ms` }}>
              <Link className="preset-link" to={`/sequence/${seq.id}`}>
                <span className="preset-name">{seq.name}</span>
                <span className="preset-meta">{seq.summary}</span>
                <span className="preset-duration">
                  {formatSequenceDuration(seq)}
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
          <h2 id="user-sequences-heading">Your sequences</h2>
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
                    {seq.summary || 'Saved on this device'}
                  </span>
                  <span className="preset-duration">
                    {formatSequenceDuration(seq)}
                  </span>
                </Link>
                <button
                  type="button"
                  className="preset-delete"
                  onClick={() => void handleDeleteSequence(seq.id, seq.name)}
                  disabled={deletingId === seq.id}
                  aria-label={`Delete ${seq.name}`}
                >
                  {deletingId === seq.id ? '…' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recentSessions.length > 0 ? (
        <section className="preset-section" aria-labelledby="history-heading">
          <div className="section-head">
            <h2 id="history-heading">Recent sessions</h2>
            <Link className="section-link" to="/settings">
              All & backup
            </Link>
          </div>
          <ul className="history-list">
            {recentSessions.map((row) => (
              <li key={row.id} className="history-row">
                <span className="history-name">{row.presetName}</span>
                <span className="history-meta">
                  {formatHistoryWhen(row.endedAt)}
                </span>
                <span className="history-duration">
                  {formatHistoryDuration(row.durationSec)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {userPresets.length > 0 ? (
        <section className="preset-section" aria-labelledby="user-presets-heading">
          <h2 id="user-presets-heading">Your presets</h2>
          <ul className="preset-list">
            {userPresets.map((preset, index) => (
              <li
                key={preset.id}
                className="preset-row"
                style={{ animationDelay: `${60 + index * 40}ms` }}
              >
                <Link className="preset-link" to={`/session/${preset.id}`}>
                  <span className="preset-name">{preset.name}</span>
                  <span className="preset-meta">Saved on this device</span>
                  <span className="preset-duration">
                    {formatDuration(preset.defaultDurationSec)}
                  </span>
                </Link>
                <button
                  type="button"
                  className="preset-delete"
                  onClick={() => void handleDeletePreset(preset.id, preset.name)}
                  disabled={deletingId === preset.id}
                  aria-label={`Delete ${preset.name}`}
                >
                  {deletingId === preset.id ? '…' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="preset-section" aria-labelledby="presets-heading">
        <h2 id="presets-heading">System presets</h2>
        <ul className="preset-list">
          {presets.map((preset, index) => (
            <li key={preset.id} style={{ animationDelay: `${80 + index * 50}ms` }}>
              <Link className="preset-link" to={`/session/${preset.id}`}>
                <span className="preset-name">{preset.name}</span>
                <span className="preset-meta">
                  {PRESET_BLURBS[preset.id] ?? formatDuration(preset.defaultDurationSec)}
                </span>
                <span className="preset-duration">
                  {formatDuration(preset.defaultDurationSec)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
