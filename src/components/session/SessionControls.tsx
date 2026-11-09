import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { messages } from '../../i18n'
import {
  NATURE_SOUNDS,
  NEUTRAL_LAYER_EQ,
  recipeLayerEq,
  SOLFEGGIO_FREQUENCIES,
  type LayerEqParams,
} from './bridges'
import type {
  EqBandId,
  EqLayerId,
  SessionController,
} from './useSessionController'
import { HeadphoneWarning } from './HeadphoneWarning'
import { SavePresetDialog } from './SavePresetDialog'
import './session.css'

const EQ_BANDS: { id: EqBandId; label: string }[] = [
  { id: 'lowDb', label: 'Low' },
  { id: 'midDb', label: 'Mid' },
  { id: 'highDb', label: 'High' },
]

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
    crossfading,
    switchablePresets,
    masterVolume,
    remainingSec,
    openEnded,
    showHeadphoneWarning,
    showSavePreset,
    savePresetName,
    savePresetError,
    savePresetBusy,
    canOverwritePreset,
    engineStatus,
    needsAudioGesture,
    togglePlay,
    continueAudio,
    switchPreset,
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
    setNatureSound,
    setNatureBrightness,
    setLayerEqBand,
    resetLayerEq,
    acknowledgeHeadphones,
    dismissHeadphoneWarning,
    openSavePreset,
    dismissSavePreset,
    setSavePresetName,
    savePresetAsNew,
    overwritePreset,
  } = session

  if (!ready) {
    return (
      <div className="session-loading" aria-live="polite">
        {messages.session.preparing}
      </div>
    )
  }

  const activeSolfeggio = recipe.tone.frequencyHz

  const engineStatusLabel =
    engineStatus === 'unavailable'
      ? messages.session.unavailable
      : needsAudioGesture
        ? messages.session.pausedByBrowser
        : crossfading
          ? messages.session.crossfading
          : playing
            ? messages.session.running
            : messages.session.ready

  return (
    <div className={`session-panel${playing ? ' is-playing' : ''}`}>
      <div className="session-hero">
        <p className="session-kicker">{preset.name}</p>
        {/* Timer is visual only — no per-second aria-live. Status region below. */}
        <p className="session-timer" aria-hidden="true">
          {formatTime(remainingSec, openEnded)}
        </p>
        <span className="visually-hidden">
          Remaining {formatTime(remainingSec, openEnded)}
        </span>
        <button
          type="button"
          className={`play-btn${playing ? ' is-active' : ''}`}
          onClick={() => void togglePlay()}
          aria-pressed={playing}
        >
          {playing ? messages.session.pause : messages.session.play}
        </button>
        {needsAudioGesture && (
          <button
            type="button"
            className="audio-resume-prompt"
            onClick={() => void continueAudio()}
          >
            {messages.session.continueAudio}
          </button>
        )}
        <p
          className="session-engine-status"
          data-status={engineStatus}
          role="status"
          aria-live="polite"
        >
          {engineStatusLabel}
        </p>
        <button
          type="button"
          className="btn btn-ghost save-preset-btn"
          onClick={openSavePreset}
        >
          {messages.session.saveAsPreset}
        </button>
      </div>

      <div className="control-block">
        <div className="control-row">
          <h2 id="preset-switch-label">Preset</h2>
          {crossfading && (
            <span className="crossfade-hint" aria-live="polite">
              Fading ~2s
            </span>
          )}
        </div>
        <div
          className="chip-row preset-switch-row"
          role="radiogroup"
          aria-labelledby="preset-switch-label"
        >
          {switchablePresets.map((p) => {
            const selected = preset.id === p.id
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`chip${selected ? ' is-selected' : ''}`}
                disabled={crossfading && !selected}
                onClick={() => switchPreset(p.id)}
              >
                {p.name}
              </button>
            )
          })}
        </div>
        <p className="layer-note">
          {playing
            ? 'Switching while playing crossfades over ~2 seconds.'
            : 'Pick a starting recipe, then press Play.'}
        </p>
      </div>

      <div className="control-block">
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
          aria-labelledby="master-label"
        />
      </div>

      <div className="control-block">
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
          <div
            className="chip-row"
            role="radiogroup"
            aria-labelledby="timer-label"
          >
            {DURATION_PRESETS.map((d) => {
              const selected =
                remainingSec != null &&
                Math.round(remainingSec / 60) === d.minutes
              return (
                <button
                  key={d.minutes}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`chip${selected ? ' is-selected' : ''}`}
                  onClick={() => setDurationMinutes(d.minutes)}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="control-block">
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
      </div>

      <div className="control-block">
        <h2 id="layers-label">Layers</h2>
        <p className="layer-note">
          Turn a layer on to shape its sound — each includes a simple EQ.
        </p>
        <div className="layer-list">
          <LayerRow
            name="Noise"
            enabled={recipe.noise.enabled}
            gain={recipe.gains.noise}
            onToggle={() => toggleLayer('noise')}
            onGain={(v) => setLayerGain('noise', v)}
          >
            <div
              className="chip-row"
              role="radiogroup"
              aria-label="Noise color"
            >
              {NOISE_KINDS.map((kind) => {
                const selected = recipe.noise.kind === kind
                return (
                  <button
                    key={kind}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`chip${selected ? ' is-selected' : ''}`}
                    onClick={() => setNoiseKind(kind)}
                  >
                    {kind}
                  </button>
                )
              })}
            </div>
            <LayerEqControls
              layer="noise"
              layerName="Noise"
              eq={recipeLayerEq(recipe.noise.eq)}
              onBand={(band, db) => setLayerEqBand('noise', band, db)}
              onReset={() => resetLayerEq('noise')}
            />
          </LayerRow>

          <LayerRow
            name="Tone"
            enabled={recipe.tone.enabled}
            gain={recipe.gains.tone}
            onToggle={() => toggleLayer('tone')}
            onGain={(v) => setLayerGain('tone', v)}
          >
            <div
              className="chip-row tone-hz-row"
              role="radiogroup"
              aria-label="Tone (Hz)"
            >
              {SOLFEGGIO_FREQUENCIES.map((hz) => {
                const selected = activeSolfeggio === hz
                return (
                  <button
                    key={hz}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`chip${selected ? ' is-selected' : ''}`}
                    onClick={() => setSolfeggio(hz)}
                  >
                    {hz}
                  </button>
                )
              })}
            </div>
            <p className="layer-note">
              Common named frequencies as pure tones — for listening preference,
              not proven health effects.
            </p>
            <LayerEqControls
              layer="tone"
              layerName="Tone"
              eq={recipeLayerEq(recipe.tone.eq)}
              onBand={(band, db) => setLayerEqBand('tone', band, db)}
              onReset={() => resetLayerEq('tone')}
            />
          </LayerRow>

          <LayerRow
            name="Beat"
            enabled={recipe.beat.enabled && recipe.beat.mode !== 'off'}
            gain={recipe.gains.beat}
            onToggle={() => toggleLayer('beat')}
            onGain={(v) => setLayerGain('beat', v)}
          >
            <div
              className="chip-row"
              role="radiogroup"
              aria-label="Beat mode"
            >
              {BEAT_MODES.map((mode) => {
                const selected = recipe.beat.mode === mode.id
                return (
                  <button
                    key={mode.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`chip${selected ? ' is-selected' : ''}`}
                    onClick={() => setBeatMode(mode.id)}
                  >
                    {mode.label}
                  </button>
                )
              })}
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
            <LayerEqControls
              layer="beat"
              layerName="Beat"
              eq={recipeLayerEq(recipe.beat.eq)}
              onBand={(band, db) => setLayerEqBand('beat', band, db)}
              onReset={() => resetLayerEq('beat')}
            />
          </LayerRow>

          <LayerRow
            name="Nature"
            enabled={recipe.nature.enabled}
            gain={recipe.gains.nature}
            onToggle={() => toggleLayer('nature')}
            onGain={(v) => setLayerGain('nature', v)}
          >
            <div
              className="chip-row"
              role="radiogroup"
              aria-label="Nature sound"
            >
              {NATURE_SOUNDS.map((id) => {
                const selected = (recipe.nature.soundId ?? 'rain') === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`chip${selected ? ' is-selected' : ''}`}
                    onClick={() => setNatureSound(id)}
                  >
                    {id}
                  </button>
                )
              })}
            </div>
            <label className="beat-rate">
              Brightness {Math.round((recipe.nature.brightness ?? 0.5) * 100)}%
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={recipe.nature.brightness ?? 0.5}
                onChange={(e) =>
                  setNatureBrightness(Number(e.target.value))
                }
                aria-label="Nature brightness"
              />
            </label>
            <LayerEqControls
              layer="nature"
              layerName="Nature"
              eq={recipeLayerEq(recipe.nature.eq)}
              onBand={(band, db) => setLayerEqBand('nature', band, db)}
              onReset={() => resetLayerEq('nature')}
            />
          </LayerRow>
        </div>
      </div>

      <div className="control-block session-explore">
        <h2 id="session-explore-label">{messages.session.exploreHeading}</h2>
        <p className="layer-note">{messages.session.exploreNote}</p>
        <Link className="btn btn-ghost session-explore-link" to="/#sequences">
          {messages.session.browseSequences}
        </Link>
      </div>

      <HeadphoneWarning
        open={showHeadphoneWarning}
        onConfirm={acknowledgeHeadphones}
        onCancel={dismissHeadphoneWarning}
      />
      <SavePresetDialog
        open={showSavePreset}
        name={savePresetName}
        canOverwrite={canOverwritePreset}
        saving={savePresetBusy}
        error={savePresetError}
        onNameChange={setSavePresetName}
        onCancel={dismissSavePreset}
        onSaveNew={() => void savePresetAsNew()}
        onOverwrite={() => void overwritePreset()}
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

interface LayerEqControlsProps {
  layer: EqLayerId
  layerName: string
  eq: LayerEqParams
  onBand: (band: EqBandId, valueDb: number) => void
  onReset: () => void
}

function formatEqDb(db: number): string {
  if (Math.abs(db) < 0.05) return '0 dB'
  return `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`
}

function isNeutralEq(eq: LayerEqParams): boolean {
  return (
    eq.lowDb === NEUTRAL_LAYER_EQ.lowDb &&
    eq.midDb === NEUTRAL_LAYER_EQ.midDb &&
    eq.highDb === NEUTRAL_LAYER_EQ.highDb
  )
}

function LayerEqControls({
  layer,
  layerName,
  eq,
  onBand,
  onReset,
}: LayerEqControlsProps) {
  const neutral = isNeutralEq(eq)
  return (
    <div className="layer-eq" role="group" aria-label={`${layerName} EQ`}>
      <div className="layer-eq-head">
        <span className="layer-eq-label">EQ</span>
        <button
          type="button"
          className="layer-eq-reset"
          disabled={neutral}
          onClick={onReset}
        >
          Flat
        </button>
      </div>
      <div className="layer-eq-bands">
        {EQ_BANDS.map((band) => (
          <label key={band.id} className="layer-eq-band">
            <span>
              {band.label}{' '}
              <span className="control-value">{formatEqDb(eq[band.id])}</span>
            </span>
            <input
              type="range"
              min={-12}
              max={12}
              step={0.5}
              value={eq[band.id]}
              onChange={(e) => onBand(band.id, Number(e.target.value))}
              aria-label={`${layerName} ${band.label} EQ`}
              data-layer={layer}
              data-eq-band={band.id}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
