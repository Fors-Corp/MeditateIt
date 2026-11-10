import { useCallback, useSyncExternalStore } from 'react'
import {
  applyLocalePreference,
  getLocale,
  getLocalePreference,
  getMessages,
  setActiveLocale,
  subscribeLocale,
  type LocaleCode,
  type Messages,
} from './index.ts'

export interface I18nApi {
  locale: LocaleCode
  /** `null` = System (browser auto-detect). */
  localePreference: LocaleCode | null
  messages: Messages
  /** Apply a concrete locale live (catalog + documentElement.lang). Persist separately. */
  setLocale: (locale: LocaleCode) => void
  /**
   * Apply preference (`null` = System). Resolves catalog + lang immediately.
   * Persist separately via `updatePrefs({ locale })`.
   */
  setLocalePreference: (preferred: LocaleCode | null) => void
}

/**
 * Subscribe to the active locale/catalog. Changing locale re-renders callers.
 * Preference persistence is owned by LanguagePicker (via `updatePrefs`).
 */
export function useI18n(): I18nApi {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocale,
    () => 'en' as LocaleCode,
  )
  const localePreference = useSyncExternalStore(
    subscribeLocale,
    getLocalePreference,
    () => null as LocaleCode | null,
  )
  const messages = useSyncExternalStore(
    subscribeLocale,
    getMessages,
    getMessages,
  )

  const setLocale = useCallback((next: LocaleCode) => {
    setActiveLocale(next)
  }, [])

  const setLocalePreference = useCallback((preferred: LocaleCode | null) => {
    applyLocalePreference(preferred)
  }, [])

  return { locale, localePreference, messages, setLocale, setLocalePreference }
}
