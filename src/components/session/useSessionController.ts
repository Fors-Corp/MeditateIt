import { useCallback, useEffect, useRef, useState } from 'react'
import {
  bindMediaSessionHandlers,
  setMediaSessionPlaybackState,
  setSessionMediaMetadata,
} from '../../audio'
import { cloneRecipe } from '../../presets'
import type { Preset, SessionRecipe } from '../../presets'
import {
  blankCustomPreset,
  CROSSFADE_SEC,
  createSessionAudio,
  loadSessionPrefs,
  loadSystemPresets,
  persistHeadphonesAck,
  persistMasterVolume,
  persistUserPreset,
  recordFinishedSession,
  rememberLastPreset,
  resolveSessionPreset,
  type BeatMode,
  type NatureSoundId,
  type NoiseKind,
  type SessionAudioEngine,
} from './bridges'
import type { SolfeggioHz } from '../../audio'

export interface SessionController {
  ready: boolean
  preset: Preset
  recipe: SessionRecipe
  playing: boolean
  crossfading: boolean
  switchablePresets: Preset[]
  masterVolume: number
  remainingSec: number | null
  openEnded: boolean
  headphonesAck: boolean
  showHeadphoneWarning: boolean
  showSavePreset: boolean
  savePresetName: string
  savePresetError: string | null
  savePresetBusy: boolean
  canOverwritePreset: boolean
  engineStatus: string
  togglePlay: () => Promise<void>
  switchPreset: (presetId: string) => void
  setMasterVolume: (value: number) => void
  setFadeIn: (sec: number) => void
  setFadeOut: (sec: number) => void
  setOpenEnded: (open: boolean) => void
  setDurationMinutes: (minutes: number) => void
  toggleLayer: (layer: 'noise' | 'tone' | 'beat' | 'nature') => void
  setNoiseKind: (kind: NoiseKind) => void
  setLayerGain: (layer: keyof SessionRecipe['gains'], value: number) => void
  setSolfeggio: (hz: SolfeggioHz) => void
  setBeatMode: (mode: BeatMode) => void
  setBeatHz: (hz: number) => void
  setNatureSound: (soundId: NatureSoundId) => void
  setNatureBrightness: (brightness: number) => void
  acknowledgeHeadphones: () => void
  dismissHeadphoneWarning: () => void
  openSavePreset: () => void
  dismissSavePreset: () => void
  setSavePresetName: (name: string) => void
  savePresetAsNew: () => Promise<void>
  overwritePreset: () => Promise<void>
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

export function useSessionController(
  routePresetId: string | undefined,
): SessionController {
  const [ready, setReady] = useState(false)
  const [preset, setPreset] = useState<Preset>(() => blankCustomPreset())
  const [recipe, setRecipe] = useState<SessionRecipe>(
    () => blankCustomPreset().recipe,
  )
  const [playing, setPlaying] = useState(false)
  const [crossfading, setCrossfading] = useState(false)
  const [switchablePresets] = useState<Preset[]>(() => loadSystemPresets())
  const [masterVolume, setMasterVolumeState] = useState(0.45)
  const [remainingSec, setRemainingSec] = useState<number | null>(10 * 60)
  const [openEnded, setOpenEndedState] = useState(false)
  const [headphonesAck, setHeadphonesAck] = useState(false)
  const [showHeadphoneWarning, setShowHeadphoneWarning] = useState(false)
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [savePresetName, setSavePresetName] = useState('')
  const [savePresetError, setSavePresetError] = useState<string | null>(null)
  const [savePresetBusy, setSavePresetBusy] = useState(false)
  const [engineStatus, setEngineStatus] = useState('idle')

  const engineRef = useRef<SessionAudioEngine | null>(null)
  const timerRef = useRef<number | null>(null)
  const crossfadePollRef = useRef<number | null>(null)
  const recipeRef = useRef(recipe)
  const masterRef = useRef(masterVolume)
  const playingRef = useRef(playing)
  const fadeOutRef = useRef(10)
  const presetRef = useRef(preset)
  const togglePlayRef = useRef<() => Promise<void>>(async () => undefined)
  const stopPlaybackRef = useRef<() => void>(() => undefined)
  const openEndedRef = useRef(openEnded)
  const configuredDurationRef = useRef<number | null>(10 * 60)
  /** ISO start time of the current play bout; null when idle. */
  const sessionStartedAtRef = useRef<string | null>(null)

  useEffect(() => {
    recipeRef.current = recipe
    masterRef.current = masterVolume
    playingRef.current = playing
    fadeOutRef.current = recipe.fadeOutSec
    presetRef.current = preset
    openEndedRef.current = openEnded
  }, [recipe, masterVolume, playing, preset, openEnded])

  const pushToEngine = useCallback((next: SessionRecipe, volume: number) => {
    engineRef.current?.applyRecipe(next, volume)
  }, [])

  const updateRecipe = useCallback(
    (updater: (prev: SessionRecipe) => SessionRecipe) => {
      setRecipe((prev) => {
        const next = updater(prev)
        if (playingRef.current) {
          pushToEngine(next, masterRef.current)
        }
        return next
      })
    },
    [pushToEngine],
  )

  useEffect(() => {
    let cancelled = false
    const engine = createSessionAudio()
    engineRef.current = engine

    ;(async () => {
      const [prefs, resolved] = await Promise.all([
        loadSessionPrefs(),
        resolveSessionPreset(routePresetId),
      ])
      if (cancelled) return

      setEngineStatus(engine.getStatus())
      setMasterVolumeState(prefs.masterVolume)
      setHeadphonesAck(prefs.preferHeadphonesAck)

      setPreset(resolved)
      setRecipe(cloneRecipe(resolved.recipe))
      const open = resolved.defaultDurationSec == null
      setOpenEndedState(open)
      configuredDurationRef.current = open ? null : resolved.defaultDurationSec
      setRemainingSec(open ? null : resolved.defaultDurationSec)
      setReady(true)

      if (resolved.id !== 'custom') {
        void rememberLastPreset(resolved.id, resolved.recipe)
      }
    })()

    return () => {
      cancelled = true
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current)
      }
      if (crossfadePollRef.current != null) {
        window.clearInterval(crossfadePollRef.current)
      }
      // Leaving the session while playing still counts as a finished bout.
      const startedAt = sessionStartedAtRef.current
      if (startedAt) {
        sessionStartedAtRef.current = null
        const current = presetRef.current
        void recordFinishedSession({
          startedAt,
          presetId: current.id === 'custom' ? null : current.id,
          presetName: current.name,
          sequenceId: null,
        })
      }
      engineRef.current?.stop(0.05)
    }
  }, [routePresetId])

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const commitSessionHistory = useCallback(() => {
    const startedAt = sessionStartedAtRef.current
    if (!startedAt) return
    sessionStartedAtRef.current = null
    const current = presetRef.current
    void recordFinishedSession({
      startedAt,
      presetId: current.id === 'custom' ? null : current.id,
      presetName: current.name,
      sequenceId: null,
    })
  }, [])

  const stopPlayback = useCallback(() => {
    clearTimer()
    if (crossfadePollRef.current != null) {
      window.clearInterval(crossfadePollRef.current)
      crossfadePollRef.current = null
    }
    engineRef.current?.stop(fadeOutRef.current)
    setPlaying(false)
    setCrossfading(false)
    setEngineStatus(engineRef.current?.getStatus() ?? 'idle')
    setMediaSessionPlaybackState('paused')
    commitSessionHistory()
  }, [clearTimer, commitSessionHistory])

  const startTimer = useCallback(() => {
    clearTimer()
    if (openEnded) return
    timerRef.current = window.setInterval(() => {
      setRemainingSec((prev) => {
        if (prev == null) return prev
        if (prev <= 1) {
          stopPlayback()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer, openEnded, stopPlayback])

  const togglePlay = useCallback(async () => {
    if (playing) {
      stopPlayback()
      return
    }

    const engine = engineRef.current
    if (!engine) return

    pushToEngine(recipeRef.current, masterRef.current)
    await engine.start(recipeRef.current.fadeInSec)
    sessionStartedAtRef.current = new Date().toISOString()
    setPlaying(true)
    setEngineStatus(engine.getStatus())
    setSessionMediaMetadata({
      title: presetRef.current.name,
      artist: 'MeditateIt',
      album: 'Live session',
    })
    setMediaSessionPlaybackState('playing')
    if (!openEnded && (remainingSec == null || remainingSec <= 0)) {
      setRemainingSec(preset.defaultDurationSec ?? 10 * 60)
    }
    startTimer()
  }, [
    playing,
    stopPlayback,
    pushToEngine,
    openEnded,
    remainingSec,
    preset.defaultDurationSec,
    startTimer,
  ])

  useEffect(() => {
    togglePlayRef.current = togglePlay
    stopPlaybackRef.current = stopPlayback
  }, [togglePlay, stopPlayback])

  // Media Session play/pause while a session screen is mounted.
  useEffect(() => {
    const unbind = bindMediaSessionHandlers({
      onPlay: async () => {
        if (!playingRef.current) {
          await togglePlayRef.current()
        }
      },
      onPause: () => {
        if (playingRef.current) {
          stopPlaybackRef.current()
        }
      },
    })
    return unbind
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

  const switchPreset = useCallback(
    (presetId: string) => {
      if (presetId === presetRef.current.id) return
      const next = switchablePresets.find((p) => p.id === presetId)
      if (!next) return

      const nextRecipe = cloneRecipe(next.recipe)
      setPreset(next)
      setRecipe(nextRecipe)
      presetRef.current = next
      recipeRef.current = nextRecipe

      setSessionMediaMetadata({
        title: next.name,
        artist: 'MeditateIt',
        album: 'Live session',
      })

      if (playingRef.current) {
        engineRef.current?.crossfadeToRecipe(
          nextRecipe,
          masterRef.current,
          CROSSFADE_SEC.default,
        )
        watchCrossfade()
      }

      if (next.id !== 'custom') {
        void rememberLastPreset(next.id, nextRecipe)
      }

      // Keep remaining time; only adopt open-ended flag from the template
      // when not currently playing a timed session.
      if (!playingRef.current) {
        const open = next.defaultDurationSec == null
        setOpenEndedState(open)
        configuredDurationRef.current = open ? null : next.defaultDurationSec
        setRemainingSec(open ? null : next.defaultDurationSec)
      }
    },
    [switchablePresets, watchCrossfade],
  )

  const setMasterVolume = useCallback(
    (value: number) => {
      const next = clamp01(value)
      setMasterVolumeState(next)
      if (playingRef.current) {
        pushToEngine(recipeRef.current, next)
      }
      void persistMasterVolume(next)
    },
    [pushToEngine],
  )

  const setFadeIn = useCallback(
    (sec: number) => {
      updateRecipe((r) => ({ ...r, fadeInSec: Math.max(0, sec) }))
    },
    [updateRecipe],
  )

  const setFadeOut = useCallback(
    (sec: number) => {
      updateRecipe((r) => ({ ...r, fadeOutSec: Math.max(0, sec) }))
    },
    [updateRecipe],
  )

  const setOpenEnded = useCallback(
    (open: boolean) => {
      setOpenEndedState(open)
      if (open) {
        configuredDurationRef.current = null
        setRemainingSec(null)
        clearTimer()
      } else {
        const fallback =
          configuredDurationRef.current ??
          preset.defaultDurationSec ??
          10 * 60
        configuredDurationRef.current = fallback
        setRemainingSec(fallback)
        if (playingRef.current) startTimer()
      }
    },
    [clearTimer, preset.defaultDurationSec, startTimer],
  )

  const setDurationMinutes = useCallback(
    (minutes: number) => {
      const sec = Math.max(1, Math.round(minutes)) * 60
      setOpenEndedState(false)
      configuredDurationRef.current = sec
      setRemainingSec(sec)
      if (playingRef.current) {
        clearTimer()
        window.setTimeout(() => {
          if (playingRef.current) {
            timerRef.current = window.setInterval(() => {
              setRemainingSec((prev) => {
                if (prev == null) return prev
                if (prev <= 1) {
                  stopPlayback()
                  return 0
                }
                return prev - 1
              })
            }, 1000)
          }
        }, 0)
      }
    },
    [clearTimer, stopPlayback],
  )

  const toggleLayer = useCallback(
    (layer: 'noise' | 'tone' | 'beat' | 'nature') => {
      updateRecipe((r) => {
        if (layer === 'beat') {
          const enabling = !r.beat.enabled
          return {
            ...r,
            beat: {
              ...r.beat,
              enabled: enabling,
              mode: enabling
                ? r.beat.mode === 'off'
                  ? 'isochronic'
                  : r.beat.mode
                : 'off',
            },
          }
        }
        if (layer === 'nature') {
          const enabling = !r.nature.enabled
          return {
            ...r,
            nature: {
              ...r.nature,
              enabled: enabling,
              soundId: enabling
                ? (r.nature.soundId ?? 'rain')
                : r.nature.soundId,
              brightness: r.nature.brightness ?? 0.5,
            },
            gains: {
              ...r.gains,
              nature:
                enabling && r.gains.nature <= 0 ? 0.2 : r.gains.nature,
            },
          }
        }
        return {
          ...r,
          [layer]: { ...r[layer], enabled: !r[layer].enabled },
        }
      })
    },
    [updateRecipe],
  )

  const setNoiseKind = useCallback(
    (kind: NoiseKind) => {
      updateRecipe((r) => ({
        ...r,
        noise: { ...r.noise, kind, enabled: true },
      }))
    },
    [updateRecipe],
  )

  const setLayerGain = useCallback(
    (layer: keyof SessionRecipe['gains'], value: number) => {
      updateRecipe((r) => ({
        ...r,
        gains: { ...r.gains, [layer]: clamp01(value) },
      }))
    },
    [updateRecipe],
  )

  const setSolfeggio = useCallback(
    (hz: SolfeggioHz) => {
      updateRecipe((r) => ({
        ...r,
        tone: {
          ...r.tone,
          enabled: true,
          frequencyHz: hz,
          solfeggioId: String(hz),
        },
      }))
    },
    [updateRecipe],
  )

  const setBeatMode = useCallback(
    (mode: BeatMode) => {
      if (mode === 'binaural' && !headphonesAck) {
        setShowHeadphoneWarning(true)
        return
      }
      updateRecipe((r) => ({
        ...r,
        beat: {
          ...r.beat,
          mode,
          enabled: mode !== 'off',
        },
      }))
    },
    [headphonesAck, updateRecipe],
  )

  const setBeatHz = useCallback(
    (hz: number) => {
      const clamped = Math.min(40, Math.max(0.5, hz))
      updateRecipe((r) => ({
        ...r,
        beat: { ...r.beat, beatHz: clamped },
      }))
    },
    [updateRecipe],
  )

  const setNatureSound = useCallback(
    (soundId: NatureSoundId) => {
      updateRecipe((r) => ({
        ...r,
        nature: {
          ...r.nature,
          enabled: true,
          soundId,
          brightness: r.nature.brightness ?? 0.5,
        },
        gains: {
          ...r.gains,
          nature: r.gains.nature <= 0 ? 0.2 : r.gains.nature,
        },
      }))
    },
    [updateRecipe],
  )

  const setNatureBrightness = useCallback(
    (brightness: number) => {
      updateRecipe((r) => ({
        ...r,
        nature: {
          ...r.nature,
          brightness: clamp01(brightness),
        },
      }))
    },
    [updateRecipe],
  )

  const acknowledgeHeadphones = useCallback(() => {
    setHeadphonesAck(true)
    setShowHeadphoneWarning(false)
    void persistHeadphonesAck(true)
    updateRecipe((r) => ({
      ...r,
      beat: {
        ...r.beat,
        mode: 'binaural',
        enabled: true,
      },
    }))
  }, [updateRecipe])

  const dismissHeadphoneWarning = useCallback(() => {
    setShowHeadphoneWarning(false)
  }, [])

  const canOverwritePreset =
    preset.source === 'user' && preset.id !== 'custom'

  const openSavePreset = useCallback(() => {
    const defaultName =
      preset.id === 'custom' || preset.source === 'system'
        ? preset.name === 'Custom'
          ? 'My preset'
          : `${preset.name} (mine)`
        : preset.name
    setSavePresetName(defaultName)
    setSavePresetError(null)
    setShowSavePreset(true)
  }, [preset])

  const dismissSavePreset = useCallback(() => {
    if (savePresetBusy) return
    setShowSavePreset(false)
    setSavePresetError(null)
  }, [savePresetBusy])

  const durationForSave = useCallback((): number | null => {
    if (openEndedRef.current) return null
    return configuredDurationRef.current
  }, [])

  const commitPreset = useCallback(
    async (mode: 'new' | 'overwrite') => {
      const name = savePresetName.trim()
      if (!name) {
        setSavePresetError('Name is required')
        return
      }
      setSavePresetBusy(true)
      setSavePresetError(null)
      try {
        const saved = await persistUserPreset({
          id: mode === 'overwrite' && canOverwritePreset ? preset.id : undefined,
          name,
          recipe: recipeRef.current,
          defaultDurationSec: durationForSave(),
        })
        setPreset(saved)
        setRecipe(cloneRecipe(saved.recipe))
        setShowSavePreset(false)
      } catch (err) {
        setSavePresetError(
          err instanceof Error ? err.message : 'Could not save preset',
        )
      } finally {
        setSavePresetBusy(false)
      }
    },
    [canOverwritePreset, durationForSave, preset.id, savePresetName],
  )

  const savePresetAsNew = useCallback(async () => {
    await commitPreset('new')
  }, [commitPreset])

  const overwritePreset = useCallback(async () => {
    if (!canOverwritePreset) return
    await commitPreset('overwrite')
  }, [canOverwritePreset, commitPreset])

  return {
    ready,
    preset,
    recipe,
    playing,
    crossfading,
    switchablePresets,
    masterVolume,
    remainingSec,
    openEnded,
    headphonesAck,
    showHeadphoneWarning,
    showSavePreset,
    savePresetName,
    savePresetError,
    savePresetBusy,
    canOverwritePreset,
    engineStatus,
    togglePlay,
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
    acknowledgeHeadphones,
    dismissHeadphoneWarning,
    openSavePreset,
    dismissSavePreset,
    setSavePresetName,
    savePresetAsNew,
    overwritePreset,
  }
}
