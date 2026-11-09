import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  loadSystemPresets,
  loadUserPresets,
  PRESET_BLURBS,
  removeUserPreset,
} from '../components/session/bridges'
import {
  formatSequenceDuration,
  listSystemSequences,
} from '../sequences'
import { getLastUsedPreset } from '../storage'
import type { Preset } from '../presets'

function formatDuration(sec: number | null): string {
  if (sec == null) return 'Open-ended'
  const m = Math.round(sec / 60)
  return `${m} min`
}

export default function HomePage() {
  const presets = loadSystemPresets()
  const sequences = listSystemSequences()
  const [quickStartId, setQuickStartId] = useState('daily-calm')
  const [userPresets, setUserPresets] = useState<Preset[]>([])
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
