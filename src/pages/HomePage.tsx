import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  loadRecentSessions,
  loadSystemPresets,
  loadUserPresets,
  PRESET_BLURBS,
  removeUserPreset,
} from '../components/session/bridges'
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
  const [quickStartId, setQuickStartId] = useState('daily-calm')
  const [userPresets, setUserPresets] = useState<Preset[]>([])
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refreshUserPresets = useCallback(() => {
    void loadUserPresets().then(setUserPresets)
  }, [])

  useEffect(() => {
    let cancelled = false
    void getLastUsedPreset().then((p) => {
      if (!cancelled) setQuickStartId(p.id)
    })
    void loadUserPresets().then((list) => {
      if (!cancelled) setUserPresets(list)
    })
    void loadRecentSessions(5).then((list) => {
      if (!cancelled) setRecentSessions(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async (id: string, name: string) => {
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
                  onClick={() => void handleDelete(preset.id, preset.name)}
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
