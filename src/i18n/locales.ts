/** Supported product locales (Wave 5). No RTL this wave. */

export const LOCALES = ['en', 'es', 'ca', 'fr', 'pt'] as const

export type LocaleCode = (typeof LOCALES)[number]

/** Native endonym labels for the language picker. */
export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
  es: 'Español',
  ca: 'Català',
  fr: 'Français',
  pt: 'Português',
}

export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** Map a BCP-47 tag (or list) to a supported locale; else `en`. */
export function matchLocale(tag: string | null | undefined): LocaleCode | null {
  if (!tag) return null
  const normalized = tag.trim().toLowerCase().replace('_', '-')
  if (!normalized) return null
  if (isLocaleCode(normalized)) return normalized
  const base = normalized.split('-')[0]
  if (isLocaleCode(base)) return base
  return null
}

export function detectBrowserLocale(
  languages: readonly string[] | undefined = typeof navigator !== 'undefined'
    ? (navigator.languages?.length
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : [])
    : [],
): LocaleCode {
  for (const tag of languages) {
    const matched = matchLocale(tag)
    if (matched) return matched
  }
  return 'en'
}
