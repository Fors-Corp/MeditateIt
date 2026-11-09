import { useI18n } from '../i18n/useI18n'
import {
  applyThemePreference,
  THEME_IDS,
  type ThemePreference,
} from '../theme'

type ThemePickerProps = {
  value: ThemePreference
  onChange: (next: ThemePreference) => void
  disabled?: boolean
}

/**
 * Accessible theme chips (radiogroup + aria-checked). Applies live;
 * parent persists via onChange. Labels follow the active locale.
 */
export function ThemePicker({ value, onChange, disabled }: ThemePickerProps) {
  const { messages } = useI18n()
  const options: {
    preference: ThemePreference
    label: string
    key: string
  }[] = [
    {
      key: 'system',
      preference: null,
      label: messages.settings.themeSystem,
    },
    ...THEME_IDS.map((id) => ({
      key: id,
      preference: id as ThemePreference,
      label: messages.settings.themes[id],
    })),
  ]

  return (
    <div
      className="chip-row theme-picker"
      role="radiogroup"
      aria-labelledby="theme-heading"
    >
      {options.map((opt) => {
        const selected = value === opt.preference
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`chip${selected ? ' is-selected' : ''}`}
            disabled={disabled}
            onClick={() => {
              if (selected) return
              applyThemePreference(opt.preference)
              onChange(opt.preference)
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
