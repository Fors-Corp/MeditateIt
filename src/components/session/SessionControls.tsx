import type { ReactNode } from 'react'
import { SOLFEGGIO_FREQUENCIES } from './bridges'
import type { SessionController } from './useSessionController'
import { HeadphoneWarning } from './HeadphoneWarning'
import './session.css'

const NOISE_KINDS = ['pink', 'brown', 'white'] as const
const BEAT_MODES = [
  { id: 'off', label: 'Off' },
  { id: 'isochronic', label: 'Isochronic' },
  { id: 'binaural', label: 'Binaural' },
] as const

const DURATION_PRESETS = [
  { minutes: 5, label: '5m' },
  { minutes: 10, label: '10m' },
  { minutes: 15, label: '15m' },
  { minutes: 25, label: '25m' },
  { minutes: 45, label: '45m' },
] as const

function formatTime(totalSec: number | null, openEnded: boolean): string {
  if (openEnded || totalSec == null) return 'Open'
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface SessionControlsProps {
  session: SessionController
}

export function SessionControls({ session }: SessionControlsProps) {
  const {
    ready,
    preset,
    recipe,
    playing,
    masterVolume,
    remainingSec,
    openEnded,
    showHeadphoneWarning,
    engineStatus,
    togglePlay,
    setMasterVolume,
    setFadeIn,
    setFadeOut,
    setOpenEnded,
    setDurationMinutes,
    toggleLayer,
    setNoiseKind,
    setLayerGain,
    setSolfeggio,
    setBeatMode,
    setBeatHz,
    acknowledgeHeadphones,
    dismissHeadphoneWarning,
  } = session

  if (!ready) {
    return (
      <div className="session-loading" aria-live="polite">
        Preparing session…
      </div>
    )
  }

  const activeSolfeggio = recipe.tone.frequencyHz

  return (
    <div className={`session-panel${playing ? ' is-playing' : ''}`}>
      <header className="session-hero">
        <p className="session-kicker">{preset.name}</p>
        <p className="session-timer" aria-live="polite">
          {formatTime(remainingSec, openEnded)}
        </p>
        <button
          type="button"
          className={`play-btn${playing ? ' is-active' : ''}`}
          onClick={() => void togglePlay()}
          aria-pressed={playing}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <p className="session-engine-status" data-status={engineStatus}>
          {engineStatus === 'unavailable'
            ? 'Audio unavailable in this browser'
            : playing
              ? 'Soundscape running'
              : 'Ready when you are'}
        </p>
      </header>

      <section className="control-block" aria-labelledby="master-label">
        <div className="control-row">
          <h2 id="master-label">Master</h2>
          <span className="control-value">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={0.85}
          step={0.01}
          value={masterVolume}
          onChange={(e) => setMasterVolume(Number(e.target.value))}
          aria-label="Master volume"
        />
      </section>

      <section className="control-block" aria-labelledby="timer-label">
        <div className="control-row">
          <h2 id="timer-label">Duration</h2>
          <label className="open-ended">
            <input
              type="checkbox"
              checked={openEnded}
              onChange={(e) => setOpenEnded(e.target.checked)}
            />
            Open-ended
          </label>
        </div>
        {!openEnded && (
          <div className="chip-row" role="group" aria-label="Session length">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d.minutes}
                type="button"
                className={`chip${
                  remainingSec != null &&
                  Math.round(remainingSec / 60) === d.minutes
                    ? ' is-selected'
                    : ''
                }`}
                onClick={() => setDurationMinutes(d.minutes)}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="control-block" aria-labelledby="fade-label">
        <h2 id="fade-label">Fade</h2>
        <div className="fade-grid">
          <label>
            In {recipe.fadeInSec}s
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={recipe.fadeInSec}
              onChange={(e) => setFadeIn(Number(e.target.value))}
            />
          </label>
          <label>
            Out {recipe.fadeOutSec}s
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={recipe.fadeOutSec}
              onChange={(e) => setFadeOut(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="control-block" aria-labelledby="layers-label">
        <h2 id="layers-label">Layers</h2>
        <div className="layer-list">
          <LayerRow
            name="Noise"
            enabled={recipe.noise.enabled}
            gain={recipe.gains.noise}
            onToggle={() => toggleLayer('noise')}
            onGain={(v) => setLayerGain('noise', v)}
          >
            <div className="chip-row" role="group" aria-label="Noise color">
              {NOISE_KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className={`chip${recipe.noise.kind === kind ? ' is-selected' : ''}`}
                  onClick={() => setNoiseKind(kind)}
                >
                  {kind}
                </button>
              ))}
            </div>
          </LayerRow>

          <LayerRow
            name="Tone"
            enabled={recipe.tone.enabled}
            gain={recipe.gains.tone}
            onToggle={() => toggleLayer('tone')}
            onGain={(v) => setLayerGain('tone', v)}
          >
            <div className="chip-row solfeggio-row" role="group" aria-label="Solfeggio">
              {SOLFEGGIO_FREQUENCIES.map((hz) => (
                <button
                  key={hz}
                  type="button"
                  className={`chip${activeSolfeggio === hz ? ' is-selected' : ''}`}
                  onClick={() => setSolfeggio(hz)}
                >
                  {hz}
                </button>
              ))}
            </div>
          </LayerRow>

          <LayerRow
            name="Beat"
            enabled={recipe.beat.enabled && recipe.beat.mode !== 'off'}
            gain={recipe.gains.beat}
            onToggle={() => toggleLayer('beat')}
            onGain={(v) => setLayerGain('beat', v)}
          >
            <div className="chip-row" role="group" aria-label="Beat mode">
              {BEAT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`chip${recipe.beat.mode === mode.id ? ' is-selected' : ''}`}
                  onClick={() => setBeatMode(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {recipe.beat.mode !== 'off' && (
              <label className="beat-rate">
                Rate {recipe.beat.beatHz.toFixed(1)} Hz
                <input
                  type="range"
                  min={0.5}
                  max={30}
                  step={0.5}
                  value={recipe.beat.beatHz}
                  onChange={(e) => setBeatHz(Number(e.target.value))}
                />
              </label>
            )}
          </LayerRow>

          <LayerRow
            name="Nature"
            enabled={recipe.nature.enabled}
            gain={recipe.gains.nature}
            onToggle={() => toggleLayer('nature')}
            onGain={(v) => setLayerGain('nature', v)}
          >
            <p className="layer-note">Nature pack arrives in a later phase.</p>
          </LayerRow>
        </div>
      </section>

      <HeadphoneWarning
        open={showHeadphoneWarning}
        onConfirm={acknowledgeHeadphones}
        onCancel={dismissHeadphoneWarning}
      />
    </div>
  )
}

interface LayerRowProps {
  name: string
  enabled: boolean
  gain: number
  onToggle: () => void
  onGain: (value: number) => void
  children?: ReactNode
}

function LayerRow({
  name,
  enabled,
  gain,
  onToggle,
  onGain,
  children,
}: LayerRowProps) {
  return (
    <div className={`layer-row${enabled ? ' is-on' : ''}`}>
      <div className="layer-head">
        <button
          type="button"
          className={`layer-toggle${enabled ? ' is-on' : ''}`}
          aria-pressed={enabled}
          onClick={onToggle}
        >
          {name}
        </button>
        <span className="control-value">{Math.round(gain * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={gain}
        disabled={!enabled}
        onChange={(e) => onGain(Number(e.target.value))}
        aria-label={`${name} volume`}
      />
      {enabled && children}
    </div>
  )
}
