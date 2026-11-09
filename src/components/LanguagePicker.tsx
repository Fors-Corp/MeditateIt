import { LOCALES, LOCALE_LABELS, type LocaleCode } from '../i18n'
import { useI18n } from '../i18n/useI18n'
import { updatePrefs } from '../storage/prefs'

interface LanguagePickerProps {
  disabled?: boolean
}

/** Settings language control — radios for en / es / ca / fr / pt. */
export default function LanguagePicker({ disabled = false }: LanguagePickerProps) {
  const { locale, messages, setLocale } = useI18n()

  return (
    <fieldset className="settings-fieldset language-picker" disabled={disabled}>
      <legend className="visually-hidden">{messages.settings.languageHeading}</legend>
      <div
        className="chip-row language-picker-row"
        role="radiogroup"
        aria-label={messages.settings.languageHeading}
      >
        {LOCALES.map((code: LocaleCode) => {
          const selected = locale === code
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`chip${selected ? ' is-selected' : ''}`}
              lang={code}
              onClick={() => {
                setLocale(code)
                void updatePrefs({ locale: code })
              }}
            >
              {LOCALE_LABELS[code]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
