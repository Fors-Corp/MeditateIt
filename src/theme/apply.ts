import {
  normalizeThemePreference,
  resolveThemeId,
  THEME_META_COLORS,
  type ThemeId,
  type ThemePreference,
} from './ids.ts'

const THEME_ATTR = 'data-theme'

/** Last preference applied (null = system). OS listener reads this. */
let currentPreference: ThemePreference = null

export function getThemePreference(): ThemePreference {
  return currentPreference
}

export function readDocumentTheme(): ThemeId | null {
  if (typeof document === 'undefined') return null
  const raw = document.documentElement.getAttribute(THEME_ATTR)
  return normalizeThemePreference(raw) as ThemeId | null
}

/** Paint a resolved theme onto <html> + theme-color meta (no prefs I/O). */
export function applyResolvedTheme(id: ThemeId): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute(THEME_ATTR, id)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_META_COLORS[id])
}

/** Resolve preference (null = system) and apply. Returns the painted id. */
export function applyThemePreference(preference: ThemePreference): ThemeId {
  currentPreference = preference
  const resolved = resolveThemeId(preference)
  applyResolvedTheme(resolved)
  return resolved
}

/**
 * Subscribe to prefers-color-scheme. Only repaints when the active
 * preference is system (null).
 */
export function subscribeSystemColorScheme(
  onChange?: (prefersDark: boolean) => void,
): () => void {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return () => undefined
  }
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (event: MediaQueryListEvent) => {
    onChange?.(event.matches)
    if (currentPreference != null) return
    applyResolvedTheme(resolveThemeId(null, event.matches))
  }
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}
