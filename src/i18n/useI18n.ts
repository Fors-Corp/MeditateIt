import { useCallback, useSyncExternalStore } from 'react'
import {
  getLocale,
  getMessages,
  setActiveLocale,
  subscribeLocale,
  type LocaleCode,
  type Messages,
} from './index.ts'

export interface I18nApi {
  locale: LocaleCode
  messages: Messages
  /** Apply locale live (catalog + documentElement.lang). Persist separately. */
  setLocale: (locale: LocaleCode) => void
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
  const messages = useSyncExternalStore(
    subscribeLocale,
    getMessages,
    getMessages,
  )

  const setLocale = useCallback((next: LocaleCode) => {
    setActiveLocale(next)
  }, [])

  return { locale, messages, setLocale }
}
