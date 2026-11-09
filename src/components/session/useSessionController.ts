import { useCallback, useEffect, useRef, useState } from 'react'
import { cloneRecipe } from '../../presets'
import type { Preset, SessionRecipe } from '../../presets'
import {
  blankCustomPreset,
  createSessionAudio,
  loadSessionPrefs,
  persistHeadphonesAck,
  persistMasterVolume,
  rememberLastPreset,
  resolveSessionPreset,
  type BeatMode,
  type NoiseKind,
  type SessionAudioEngine,
} from './bridges'
import type { SolfeggioHz } from '../../audio'

export interface SessionController {
  ready: boolean
  preset: Preset
  recipe: SessionRecipe
  playing: boolean
  masterVolume: number
  remainingSec: number | null
  openEnded: boolean
  headphonesAck: boolean
  showHeadphoneWarning: boolean
  engineStatus: string
  togglePlay: () => Promise<void>
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
  acknowledgeHeadphones: () => void
  dismissHeadphoneWarning: () => void
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
  const [masterVolume, setMasterVolumeState] = useState(0.45)
  const [remainingSec, setRemainingSec] = useState<number | null>(10 * 60)
  const [openEnded, setOpenEndedState] = useState(false)
  const [headphonesAck, setHeadphonesAck] = useState(false)
  const [showHeadphoneWarning, setShowHeadphoneWarning] = useState(false)
  const [engineStatus, setEngineStatus] = useState('idle')

  const engineRef = useRef<SessionAudioEngine | null>(null)
  const timerRef = useRef<number | null>(null)
  const recipeRef = useRef(recipe)
  const masterRef = useRef(masterVolume)
  const playingRef = useRef(playing)
  const fadeOutRef = useRef(10)

  useEffect(() => {
    recipeRef.current = recipe
    masterRef.current = masterVolume
    playingRef.current = playing
    fadeOutRef.current = recipe.fadeOutSec
  }, [recipe, masterVolume, playing])

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
      engineRef.current?.stop(0.05)
    }
  }, [routePresetId])

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stopPlayback = useCallback(() => {
    clearTimer()
    engineRef.current?.stop(fadeOutRef.current)
    setPlaying(false)
    setEngineStatus(engineRef.current?.getStatus() ?? 'idle')
  }, [clearTimer])

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
    setPlaying(true)
    setEngineStatus(engine.getStatus())
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
        setRemainingSec(null)
        clearTimer()
      } else {
        const fallback = preset.defaultDurationSec ?? 10 * 60
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
      setRemainingSec(sec)
      if (playingRef.current) {
        clearTimer()
        // restart interval after state settles
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

  return {
    ready,
    preset,
    recipe,
    playing,
    masterVolume,
    remainingSec,
    openEnded,
    headphonesAck,
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
  }
}
