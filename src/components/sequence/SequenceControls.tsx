import { Link } from 'react-router-dom'
import { messages } from '../../i18n'
import { HeadphoneWarning } from '../session/HeadphoneWarning'
import { SavePresetDialog } from '../session/SavePresetDialog'
import '../session/session.css'
import type { SequenceController } from './useSequenceController'
import './sequence.css'

function formatTime(totalSec: number): string {
  const m = Math.floor(Math.max(0, totalSec) / 60)
  const s = Math.max(0, totalSec) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface SequenceControlsProps {
  session: SequenceController
}

export function SequenceControls({ session }: SequenceControlsProps) {
  const {
    ready,
    missing,
    sequence,
    stageIndex,
    stageCount,
    stageName,
    stageRemainingSec,
    stageDurationSec,
    stageProgress,
    sequenceProgress,
    playing,
    crossfading,
    completed,
    masterVolume,
    showHeadphoneWarning,
    engineStatus,
    needsAudioGesture,
    statusMessage,
    showSaveSequence,
    saveSequenceName,
    saveSequenceError,
    saveSequenceBusy,
    canOverwriteSequence,
    togglePlay,
    continueAudio,
    skipStage,
    setMasterVolume,
    acknowledgeHeadphones,
    dismissHeadphoneWarning,
    openSaveSequence,
    dismissSaveSequence,
    setSaveSequenceName,
    saveSequenceAsNew,
    overwriteSequence,
  } = session

  if (!ready) {
    return (
      <div className="sequence-loading" aria-live="polite">
        {messages.sequence.preparing}
      </div>
    )
  }

  if (missing || !sequence) {
    return (
      <div className="sequence-missing">
        <p>{messages.sequence.missing}</p>
        <Link className="btn btn-ghost" to="/">
          {messages.app.backHomeShort}
        </Link>
      </div>
    )
  }

  const statusLabel = completed
    ? messages.sequence.complete
    : engineStatus === 'unavailable'
      ? messages.sequence.unavailable
      : needsAudioGesture
        ? messages.sequence.pausedByBrowser
        : crossfading
          ? messages.sequence.crossfadingTo(
              stageName || messages.sequence.nextStage,
            )
          : statusMessage

  const timerText = completed
    ? messages.sequence.done
    : formatTime(stageRemainingSec)
  const stageProgressLabel = completed
    ? messages.sequence.allStagesComplete(stageCount)
    : messages.sequence.stageProgress(
        stageName,
        formatTime(stageRemainingSec),
        formatTime(stageDurationSec),
        Math.min(stageIndex + 1, stageCount),
        stageCount,
        crossfading,
      )

  return (
    <div className={`sequence-panel${playing ? ' is-playing' : ''}`}>
      <div className="sequence-hero">
        <p className="sequence-kicker">{sequence.name}</p>
        <h2 className="sequence-stage-name">{stageName || sequence.name}</h2>
        <p className="sequence-stage-sub">
          {completed
            ? messages.sequence.finished
            : messages.sequence.stageOf(
                Math.min(stageIndex + 1, stageCount),
                stageCount,
              )}
        </p>
        {/* Timer is visual only — no per-second aria-live. Status region below. */}
        <p className="sequence-timer" aria-hidden="true">
          {timerText}
        </p>
        <span className="visually-hidden">
          {completed
            ? messages.sequence.doneTitle
            : messages.sequence.stageRemaining(timerText)}
        </span>

        <div
          className="sequence-progress"
          role="progressbar"
          aria-label={messages.sequence.stageProgressAria(
            stageName || messages.sequence.heading,
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(stageProgress * 100)}
        >
          <div
            className="sequence-progress-fill"
            style={{ width: `${stageProgress * 100}%` }}
          />
        </div>
        <p className="sequence-progress-label">{stageProgressLabel}</p>

        <div className="sequence-actions">
          <button
            type="button"
            className={`play-btn${playing ? ' is-active' : ''}`}
            onClick={() => void togglePlay()}
            aria-pressed={playing}
          >
            {completed
              ? messages.sequence.playAgain
              : playing
                ? messages.session.pause
                : messages.session.play}
          </button>
          <button
            type="button"
            className="btn btn-ghost sequence-skip"
            onClick={skipStage}
            disabled={completed}
          >
            {stageIndex >= stageCount - 1
              ? messages.sequence.endSequence
              : messages.sequence.skipStage}
          </button>
          <button
            type="button"
            className="btn btn-ghost save-preset-btn"
            onClick={openSaveSequence}
          >
            {sequence.source === 'user'
              ? messages.sequence.saveSequence
              : messages.sequence.saveACopy}
          </button>
        </div>

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
          className="sequence-engine-status"
          data-status={engineStatus}
          role="status"
          aria-live="polite"
        >
          {statusLabel}
        </p>
      </div>

      <div className="control-block">
        <div className="control-row">
          <h2 id="seq-overall-label">{messages.sequence.heading}</h2>
          <span className="control-value">
            {Math.round(sequenceProgress * 100)}%
          </span>
        </div>
        <div
          className="sequence-progress sequence-progress-overall"
          role="progressbar"
          aria-label={messages.sequence.stageProgressAria(sequence.name)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sequenceProgress * 100)}
        >
          <div
            className="sequence-progress-fill"
            style={{ width: `${sequenceProgress * 100}%` }}
          />
        </div>
        <ol className="sequence-stage-list">
          {sequence.stages.map((stage, i) => {
            const state =
              i < stageIndex || completed
                ? 'done'
                : i === stageIndex
                  ? 'current'
                  : 'upcoming'
            return (
              <li
                key={stage.id}
                className={`sequence-stage-item is-${state}`}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className="sequence-stage-item-name">{stage.name}</span>
                <span className="sequence-stage-item-meta">
                  {formatTime(stage.durationSec)}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="control-block">
        <div className="control-row">
          <h2 id="seq-master-label">{messages.sequence.master}</h2>
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
          aria-labelledby="seq-master-label"
        />
      </div>

      <HeadphoneWarning
        open={showHeadphoneWarning}
        onConfirm={acknowledgeHeadphones}
        onCancel={dismissHeadphoneWarning}
      />

      <SavePresetDialog
        open={showSaveSequence}
        name={saveSequenceName}
        canOverwrite={canOverwriteSequence}
        saving={saveSequenceBusy}
        error={saveSequenceError}
        onNameChange={setSaveSequenceName}
        onCancel={dismissSaveSequence}
        onSaveNew={() => void saveSequenceAsNew()}
        onOverwrite={() => void overwriteSequence()}
        title={messages.dialogs.saveSequenceTitle}
        description={messages.dialogs.saveSequenceBody}
      />
    </div>
  )
}
