import { useCallback, useEffect, useRef, useState } from 'react'
import {
  bindMediaSessionHandlers,
  setMediaSessionPlaybackState,
  setSessionMediaMetadata,
} from '../../audio'
import {
  CROSSFADE_SEC,
  createSessionAudio,
  loadSessionPrefs,
  persistHeadphonesAck,
  persistMasterVolume,
  type SessionAudioEngine,
} from '../session/bridges'
import {
  cloneSequence,
  getSystemSequence,
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
  togglePlay: () => Promise<void>
  skipStage: () => void
  setMasterVolume: (value: number) => void
  acknowledgeHeadphones: () => void
  dismissHeadphoneWarning: () => void
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
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

      const found = getSystemSequence(sequenceId)
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
    setEngineStatus(engineRef.current?.getStatus() ?? 'idle')
    setMediaSessionPlaybackState('paused')
  }, [clearTimer])

  const finishSequence = useCallback(() => {
    clearTimer()
    if (crossfadePollRef.current != null) {
      window.clearInterval(crossfadePollRef.current)
      crossfadePollRef.current = null
    }
    engineRef.current?.stop(fadeOutRef.current)
    setPlaying(false)
    setCrossfading(false)
    setCompleted(true)
    completedRef.current = true
    setStageRemainingSec(0)
    setEngineStatus(engineRef.current?.getStatus() ?? 'idle')
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
    (index: number, opts: { crossfade: boolean }) => {
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

    applyStage(nextIndex, { crossfade: playingRef.current })

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
      applyStage(0, { crossfade: false })
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
    setCompleted(false)
    completedRef.current = false
    setEngineStatus(engine.getStatus())
    updateMediaMeta(seq.name, current.stage.name)
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

  useEffect(() => {
    const unbind = bindMediaSessionHandlers({
      onPlay: async () => {
        if (!playingRef.current) await togglePlayRef.current()
      },
      onPause: () => {
        if (playingRef.current) pausePlaybackRef.current()
      },
    })
    return unbind
  }, [])

  const skipStage = useCallback(() => {
    if (completedRef.current) return
    const stages = resolvedRef.current
    if (stageIndexRef.current >= stages.length - 1) {
      finishSequence()
      return
    }
    advance()
  }, [advance, finishSequence])

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
    togglePlay,
    skipStage,
    setMasterVolume,
    acknowledgeHeadphones,
    dismissHeadphoneWarning,
  }
}
