import {
  LOCALES,
  LOCALE_LABELS,
  isLocaleCode,
  type LocaleCode,
} from '../i18n'
import { useI18n } from '../i18n/useI18n'
import { updatePrefs } from '../storage/prefs'

interface LanguagePickerProps {
  disabled?: boolean
  /**
   * `chrome` — compact top-bar select (default for App header).
   * `chips` — settings-style chip radiogroup (kept for reuse/tests).
   */
  variant?: 'chrome' | 'chips'
}

function persistPreference(preferred: LocaleCode | null): void {
  void updatePrefs({ locale: preferred })
}

/** Language control — System (browser) plus en / es / ca / fr / pt. */
export default function LanguagePicker({
  disabled = false,
  variant = 'chrome',
}: LanguagePickerProps) {
  const { localePreference, messages, setLocalePreference } = useI18n()
  const label = messages.app.languageLabel

  const choose = (preferred: LocaleCode | null) => {
    setLocalePreference(preferred)
    persistPreference(preferred)
  }

  if (variant === 'chrome') {
    const selectValue = localePreference ?? 'system'
    return (
      <label className="language-chrome">
        <span className="visually-hidden">{label}</span>
        <select
          className="language-chrome-select"
          value={selectValue}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => {
            const raw = event.target.value
            if (raw === 'system') {
              choose(null)
              return
            }
            if (isLocaleCode(raw)) choose(raw)
          }}
        >
          <option value="system">{messages.settings.languageSystem}</option>
          {LOCALES.map((code) => (
            <option key={code} value={code} lang={code}>
              {LOCALE_LABELS[code]}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <fieldset className="settings-fieldset language-picker" disabled={disabled}>
      <legend className="visually-hidden">{label}</legend>
      <div
        className="chip-row language-picker-row"
        role="radiogroup"
        aria-label={label}
      >
        <button
          type="button"
          role="radio"
          aria-checked={localePreference === null}
          className={`chip${localePreference === null ? ' is-selected' : ''}`}
          onClick={() => choose(null)}
        >
          {messages.settings.languageSystem}
        </button>
        {LOCALES.map((code: LocaleCode) => {
          const selected = localePreference === code
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`chip${selected ? ' is-selected' : ''}`}
              lang={code}
              onClick={() => choose(code)}
            >
              {LOCALE_LABELS[code]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
