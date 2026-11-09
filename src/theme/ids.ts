/** Named theme ids + preference resolution (null = follow system). */

export const THEME_IDS = ['light', 'dark', 'dusk', 'mist', 'forest'] as const

export type ThemeId = (typeof THEME_IDS)[number]

/** Saved preference: a named theme, or null to follow prefers-color-scheme. */
export type ThemePreference = ThemeId | null

/** Browser chrome / PWA theme-color per resolved theme. */
export const THEME_META_COLORS: Readonly<Record<ThemeId, string>> = {
  light: '#e4efe9',
  dark: '#121a18',
  dusk: '#1a2230',
  mist: '#d8e2e8',
  forest: '#e6ebe4',
}

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === 'string' &&
    (THEME_IDS as readonly string[]).includes(value)
  )
}

/** Soft-normalize a stored / imported preference. Unknown → system (null). */
export function normalizeThemePreference(raw: unknown): ThemePreference {
  if (raw === null || raw === undefined || raw === 'system') return null
  return isThemeId(raw) ? raw : null
}

export function resolveThemeId(
  preference: ThemePreference,
  prefersDark?: boolean,
): ThemeId {
  if (preference) return preference
  const dark =
    prefersDark ??
    (typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  return dark ? 'dark' : 'light'
}
