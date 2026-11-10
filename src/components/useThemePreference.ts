import { useCallback, useEffect, useState } from 'react'
import { loadPrefs, updatePrefs } from '../storage'
import { applyThemePreference, type ThemePreference } from '../theme'

const reloadListeners = new Set<() => void>()

/** Ask every mounted theme-preference hook to re-read prefs (import / erase). */
export function requestThemePreferenceReload(): void {
  for (const listener of reloadListeners) listener()
}

/** Load / persist themeId and keep the document attribute in sync. */
export function useThemePreference(): {
  themeId: ThemePreference
  setThemeId: (next: ThemePreference) => void
  busy: boolean
  /** Re-sync after erase / import wiped or replaced prefs. */
  reload: () => void
} {
  const [themeId, setThemeIdState] = useState<ThemePreference>(null)
  const [busy, setBusy] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const onReload = () => setTick((n) => n + 1)
    reloadListeners.add(onReload)
    return () => {
      reloadListeners.delete(onReload)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void loadPrefs().then((prefs) => {
      if (cancelled) return
      setThemeIdState(prefs.themeId)
      applyThemePreference(prefs.themeId)
    })
    return () => {
      cancelled = true
    }
  }, [tick])

  const setThemeId = useCallback((next: ThemePreference) => {
    setThemeIdState(next)
    applyThemePreference(next)
    setBusy(true)
    void updatePrefs({ themeId: next })
      .catch(() => {
        /* painted theme stays; next load re-syncs */
      })
      .finally(() => setBusy(false))
  }, [])

  const reload = useCallback(() => {
    requestThemePreferenceReload()
  }, [])

  return { themeId, setThemeId, busy, reload }
}
