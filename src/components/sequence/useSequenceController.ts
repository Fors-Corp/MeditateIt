import { useCallback, useEffect, useRef, useState } from 'react'
import {
  bindMediaSessionHandlers,
  bindVisibilityAudioResume,
  setMediaSessionPlaybackState,
  setSessionMediaMetadata,
} from '../../audio'
import {
  CROSSFADE_SEC,
  createSessionAudio,
  loadSessionPrefs,
  persistHeadphonesAck,
  persistMasterVolume,
  persistUserSequence,
  resolveSequence,
  type SequenceStage,
  type SessionAudioEngine,
} from '../session/bridges'
import {
  cloneSequence,
  resolveStage,
  totalDurationSec,
  type ResolvedStage,
  type Sequence,
} from '../../sequences'
import type { SessionRecipe } from '../../presets'

export interface SequenceController {
  ready: boolean
  missing: boolean
  sequence: Sequence | null
  stageIndex: number
  stageCount: number
  stageName: string
  stageRemainingSec: number
  stageDurationSec: number
  /** 0–1 progress through the current stage */
  stageProgress: number
  /** 0–1 progress through the whole sequence (elapsed / total) */
  sequenceProgress: number
  recipe: SessionRecipe | null
  playing: boolean
  crossfading: boolean
  completed: boolean
  masterVolume: number
  showHeadphoneWarning: boolean
  engineStatus: string
  /** True when auto-resume after background was blocked — show tap affordance. */
  needsAudioGesture: boolean
  /** Calm status copy for the live region (skip / stage / complete). */
  statusMessage: string
  showSaveSequence: boolean
  saveSequenceName: string
  saveSequenceError: string | null
  saveSequenceBusy: boolean
  canOverwriteSequence: boolean
  togglePlay: () => Promise<void>
  continueAudio: () => Promise<void>
  skipStage: () => void
  setMasterVolume: (value: number) => void
  acknowledgeHeadphones: () => void
  dismissHeadphoneWarning: () => void
  openSaveSequence: () => void
  dismissSaveSequence: () => void
  setSaveSequenceName: (name: string) => void
  saveSequenceAsNew: () => Promise<void>
  overwriteSequence: () => Promise<void>
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

function materializeStages(resolved: ResolvedStage[]): SequenceStage[] {
  return resolved.map((r) => ({
    id: r.stage.id,
    name: r.stage.name,
    durationSec: r.stage.durationSec,
    recipe: r.recipe,
  }))
}

export function useSequenceController(
  sequenceId: string | undefined,
): SequenceController {
  const [ready, setReady] = useState(false)
  const [missing, setMissing] = useState(false)
  const [sequence, setSequence] = useState<Sequence | null>(null)
  const [resolved, setResolved] = useState<ResolvedStage[]>([])
  const [stageIndex, setStageIndex] = useState(0)
  const [stageRemainingSec, setStageRemainingSec] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [crossfading, setCrossfading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [masterVolume, setMasterVolumeState] = useState(0.45)
  const [showHeadphoneWarning, setShowHeadphoneWarning] = useState(false)
  const [engineStatus, setEngineStatus] = useState('idle')
  const [needsAudioGesture, setNeedsAudioGesture] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Ready when you are')
  const [showSaveSequence, setShowSaveSequence] = useState(false)
  const [saveSequenceName, setSaveSequenceName] = useState('')
  const [saveSequenceError, setSaveSequenceError] = useState<string | null>(
    null,
  )
  const [saveSequenceBusy, setSaveSequenceBusy] = useState(false)

  const engineRef = useRef<SessionAudioEngine | null>(null)
  const timerRef = useRef<number | null>(null)
  const crossfadePollRef = useRef<number | null>(null)
  const playingRef = useRef(false)
  const masterRef = useRef(masterVolume)
  const stageIndexRef = useRef(0)
  const resolvedRef = useRef<ResolvedStage[]>([])
  const sequenceRef = useRef<Sequence | null>(null)
  const completedRef = useRef(false)
  const fadeOutRef = useRef(10)
  const togglePlayRef = useRef<() => Promise<void>>(async () => undefined)
  const pausePlaybackRef = useRef<() => void>(() => undefined)
  const skipStageRef = useRef<() => void>(() => undefined)
  const advanceRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    playingRef.current = playing
    masterRef.current = masterVolume
    stageIndexRef.current = stageIndex
    resolvedRef.current = resolved
    sequenceRef.current = sequence
    completedRef.current = completed
    const current = resolved[stageIndex]
    if (current) {
      fadeOutRef.current = current.recipe.fadeOutSec
    }
  }, [playing, masterVolume, stageIndex, resolved, sequence, completed])

  useEffect(() => {
    let cancelled = false
    const engine = createSessionAudio()
    engineRef.current = engine

    ;(async () => {
      const prefs = await loadSessionPrefs()
      if (cancelled) return

      setMasterVolumeState(prefs.masterVolume)
      setEngineStatus(engine.getStatus())

      if (!sequenceId) {
        setMissing(true)
        setReady(true)
        return
      }

      const found = await resolveSequence(sequenceId)
      if (!found || found.stages.length === 0) {
        setMissing(true)
        setReady(true)
        return
      }

      const seq = cloneSequence(found)
      const stages = await Promise.all(seq.stages.map((s) => resolveStage(s)))
      if (cancelled) return

      setSequence(seq)
      setResolved(stages)
      setStageIndex(0)
      setStageRemainingSec(stages[0]!.stage.durationSec)
      setCompleted(false)
      setMissing(false)
      setStatusMessage('Ready when you are')
      setReady(true)

      const needsPhones = stages.some(
        (s) => s.recipe.beat.enabled && s.recipe.beat.mode === 'binaural',
      )
      if (needsPhones && !prefs.preferHeadphonesAck) {
        setShowHeadphoneWarning(true)
      }
    })()

    return () => {
      cancelled = true
      if (timerRef.current != null) window.clearInterval(timerRef.current)
      if (crossfadePollRef.current != null) {
        window.clearInterval(crossfadePollRef.current)
      }
      engineRef.current?.stop(0.05)
    }
  }, [sequenceId])

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const watchCrossfade = useCallback(() => {
    if (crossfadePollRef.current != null) {
      window.clearInterval(crossfadePollRef.current)
    }
    setCrossfading(true)
    crossfadePollRef.current = window.setInterval(() => {
      const still = engineRef.current?.isCrossfading() ?? false
      if (!still) {
        setCrossfading(false)
        if (crossfadePollRef.current != null) {
          window.clearInterval(crossfadePollRef.current)
          crossfadePollRef.current = null
        }
      }
    }, 80)
  }, [])

  const updateMediaMeta = useCallback((seqName: string, stageName: string) => {
    setSessionMediaMetadata({
      title: `${seqName} · ${stageName}`,
      artist: 'MeditateIt',
      album: 'Sequence',
    })
  }, [])

  const pausePlayback = useCallback(() => {
    clearTimer()
    engineRef.current?.stop(fadeOutRef.current)
    setPlaying(false)
    setNeedsAudioGesture(false)
    setEngineStatus(engineRef.current?.getStatus() ?? 'idle')
    setStatusMessage('Paused')
    setMediaSessionPlaybackState('paused')
  }, [clearTimer])

  const continueAudio = useCallback(async () => {
    if (!playingRef.current) return
    const result = await engineRef.current?.resumeContext()
    if (result === 'running') {
      setNeedsAudioGesture(false)
      setMediaSessionPlaybackState('playing')
    } else if (result === 'suspended') {
      setNeedsAudioGesture(true)
    }
  }, [])

  const finishSequence = useCallback(() => {
    clearTimer()
    if (crossfadePollRef.current != null) {
      window.clearInterval(crossfadePollRef.current)
      crossfadePollRef.current = null
    }
    engineRef.current?.stop(fadeOutRef.current)
    setPlaying(false)
    setCrossfading(false)
    setNeedsAudioGesture(false)
    setCompleted(true)
    completedRef.current = true
    setStageRemainingSec(0)
    setEngineStatus(engineRef.current?.getStatus() ?? 'idle')
    setStatusMessage('Sequence complete')
    setMediaSessionPlaybackState('paused')
  }, [clearTimer])

  const startTimer = useCallback(() => {
    clearTimer()
    timerRef.current = window.setInterval(() => {
      setStageRemainingSec((prev) => {
        if (prev <= 1) {
          if (timerRef.current != null) {
            window.clearInterval(timerRef.current)
            timerRef.current = null
          }
          // Advance on next tick so we don't nest setState updates.
          window.setTimeout(() => advanceRef.current(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  const applyStage = useCallback(
    (
      index: number,
      opts: { crossfade: boolean; announce?: 'skip' | 'advance' | 'start' },
    ) => {
      const stages = resolvedRef.current
      const seq = sequenceRef.current
      const next = stages[index]
      if (!next || !seq) return

      setStageIndex(index)
      stageIndexRef.current = index
      setStageRemainingSec(next.stage.durationSec)
      setCompleted(false)
      completedRef.current = false
      fadeOutRef.current = next.recipe.fadeOutSec
      updateMediaMeta(seq.name, next.stage.name)

      const label = `Stage ${index + 1} of ${stages.length} · ${next.stage.name}`
      if (opts.announce === 'skip') {
        setStatusMessage(`Skipped to ${next.stage.name}`)
      } else if (opts.announce === 'advance') {
        setStatusMessage(`Now playing ${next.stage.name}`)
      } else if (opts.announce === 'start') {
        setStatusMessage(label)
      }

      if (!playingRef.current) return

      const engine = engineRef.current
      if (!engine) return

      if (opts.crossfade) {
        engine.crossfadeToRecipe(
          next.recipe,
          masterRef.current,
          CROSSFADE_SEC.default,
        )
        watchCrossfade()
      } else {
        engine.applyRecipe(next.recipe, masterRef.current)
      }
    },
    [updateMediaMeta, watchCrossfade],
  )

  const advance = useCallback(() => {
    if (completedRef.current) return
    const stages = resolvedRef.current
    const nextIndex = stageIndexRef.current + 1

    if (nextIndex >= stages.length) {
      finishSequence()
      return
    }

    applyStage(nextIndex, {
      crossfade: playingRef.current,
      announce: 'advance',
    })

    if (playingRef.current) {
      startTimer()
    }
  }, [applyStage, finishSequence, startTimer])

  useEffect(() => {
    advanceRef.current = advance
  }, [advance])

  const togglePlay = useCallback(async () => {
    if (playing) {
      pausePlayback()
      return
    }

    if (completedRef.current) {
      // Restart from stage 0
      applyStage(0, { crossfade: false, announce: 'start' })
    }

    const engine = engineRef.current
    const stages = resolvedRef.current
    const idx = stageIndexRef.current
    const current = stages[idx]
    const seq = sequenceRef.current
    if (!engine || !current || !seq) return

    engine.applyRecipe(current.recipe, masterRef.current)
    await engine.start(current.recipe.fadeInSec)
    setPlaying(true)
    setNeedsAudioGesture(false)
    setCompleted(false)
    completedRef.current = false
    setEngineStatus(engine.getStatus())
    updateMediaMeta(seq.name, current.stage.name)
    setStatusMessage(
      `Playing ${current.stage.name} · stage ${idx + 1} of ${stages.length}`,
    )
    setMediaSessionPlaybackState('playing')

    if (stageRemainingSec <= 0) {
      setStageRemainingSec(current.stage.durationSec)
    }
    startTimer()
  }, [
    playing,
    pausePlayback,
    applyStage,
    updateMediaMeta,
    stageRemainingSec,
    startTimer,
  ])

  useEffect(() => {
    togglePlayRef.current = togglePlay
    pausePlaybackRef.current = pausePlayback
  }, [togglePlay, pausePlayback])

  const skipStage = useCallback(() => {
    if (completedRef.current) return
    const stages = resolvedRef.current
    if (stageIndexRef.current >= stages.length - 1) {
      finishSequence()
      return
    }
    const nextIndex = stageIndexRef.current + 1
    applyStage(nextIndex, {
      crossfade: playingRef.current,
      announce: 'skip',
    })
    if (playingRef.current) {
      startTimer()
    }
  }, [applyStage, finishSequence, startTimer])

  useEffect(() => {
    skipStageRef.current = skipStage
  }, [skipStage])

  useEffect(() => {
    const unbind = bindMediaSessionHandlers({
      onPlay: async () => {
        if (!playingRef.current) {
          await togglePlayRef.current()
        } else {
          const result = await engineRef.current?.resumeContext()
          if (result === 'running') setNeedsAudioGesture(false)
        }
      },
      onPause: () => {
        if (playingRef.current) pausePlaybackRef.current()
      },
      onStop: () => {
        if (playingRef.current) pausePlaybackRef.current()
      },
      onNextTrack: () => {
        skipStageRef.current()
      },
    })
    return unbind
  }, [])

  useEffect(() => {
    return bindVisibilityAudioResume({
      shouldBePlaying: () => playingRef.current,
      resumeContext: async () => {
        const engine = engineRef.current
        if (!engine) return 'none'
        if (engine.getContextState() === 'running') return 'running'
        return engine.resumeContext()
      },
      onResumed: () => {
        setNeedsAudioGesture(false)
        setMediaSessionPlaybackState('playing')
      },
      onBlocked: () => {
        setNeedsAudioGesture(true)
      },
    })
  }, [])

  const setMasterVolume = useCallback((value: number) => {
    const next = clamp01(value)
    setMasterVolumeState(next)
    masterRef.current = next
    if (playingRef.current) {
      const current = resolvedRef.current[stageIndexRef.current]
      if (current) {
        engineRef.current?.applyRecipe(current.recipe, next)
      }
    }
    void persistMasterVolume(next)
  }, [])

  const acknowledgeHeadphones = useCallback(() => {
    setShowHeadphoneWarning(false)
    void persistHeadphonesAck(true)
  }, [])

  const dismissHeadphoneWarning = useCallback(() => {
    setShowHeadphoneWarning(false)
  }, [])

  const canOverwriteSequence =
    sequence?.source === 'user' && Boolean(sequence.id)

  const openSaveSequence = useCallback(() => {
    if (!sequence) return
    const defaultName =
      sequence.source === 'system'
        ? `${sequence.name} (mine)`
        : sequence.name
    setSaveSequenceName(defaultName)
    setSaveSequenceError(null)
    setShowSaveSequence(true)
  }, [sequence])

  const dismissSaveSequence = useCallback(() => {
    if (saveSequenceBusy) return
    setShowSaveSequence(false)
    setSaveSequenceError(null)
  }, [saveSequenceBusy])

  const commitSequence = useCallback(
    async (mode: 'new' | 'overwrite') => {
      const name = saveSequenceName.trim()
      if (!name) {
        setSaveSequenceError('Name is required')
        return
      }
      const seq = sequenceRef.current
      const stages = resolvedRef.current
      if (!seq || stages.length === 0) {
        setSaveSequenceError('Nothing to save')
        return
      }

      setSaveSequenceBusy(true)
      setSaveSequenceError(null)
      try {
        const saved = await persistUserSequence({
          id:
            mode === 'overwrite' && canOverwriteSequence
              ? seq.id
              : undefined,
          name,
          summary:
            seq.source === 'system'
              ? `Saved from ${seq.name}`
              : seq.summary || `${stages.length} stages`,
          stages: materializeStages(stages),
        })
        setSequence(saved)
        sequenceRef.current = saved
        setShowSaveSequence(false)
        setStatusMessage(`Saved “${saved.name}” on this device`)
      } catch (err) {
        setSaveSequenceError(
          err instanceof Error ? err.message : 'Could not save sequence',
        )
      } finally {
        setSaveSequenceBusy(false)
      }
    },
    [canOverwriteSequence, saveSequenceName],
  )

  const saveSequenceAsNew = useCallback(async () => {
    await commitSequence('new')
  }, [commitSequence])

  const overwriteSequence = useCallback(async () => {
    await commitSequence('overwrite')
  }, [commitSequence])

  const current = resolved[stageIndex]
  const stageDurationSec = current?.stage.durationSec ?? 0
  const elapsedInStage = Math.max(0, stageDurationSec - stageRemainingSec)
  const stageProgress =
    stageDurationSec > 0 ? clamp01(elapsedInStage / stageDurationSec) : 0

  let sequenceElapsed = 0
  if (sequence) {
    for (let i = 0; i < stageIndex; i++) {
      sequenceElapsed += sequence.stages[i]?.durationSec ?? 0
    }
    sequenceElapsed += elapsedInStage
  }
  const sequenceTotal = sequence ? totalDurationSec(sequence) : 0
  const sequenceProgress =
    sequenceTotal > 0 ? clamp01(sequenceElapsed / sequenceTotal) : 0

  return {
    ready,
    missing,
    sequence,
    stageIndex,
    stageCount: resolved.length,
    stageName: current?.stage.name ?? '',
    stageRemainingSec,
    stageDurationSec,
    stageProgress,
    sequenceProgress,
    recipe: current?.recipe ?? null,
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
  }
}
