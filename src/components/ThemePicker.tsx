import { useI18n } from '../i18n/useI18n'
import {
  isThemeId,
  resolveThemeId,
  THEME_IDS,
  THEME_META_COLORS,
  type ThemePreference,
} from '../theme'
import { useThemePreference } from './useThemePreference'

type ThemePickerProps = {
  disabled?: boolean
  /**
   * `chrome` — compact top-bar select (default for App header).
   * `chips` — radiogroup chips (kept for reuse/tests).
   */
  variant?: 'chrome' | 'chips'
}

/**
 * Theme control — System plus named palettes. Applies live and persists.
 * Labels follow the active locale.
 */
export function ThemePicker({
  disabled = false,
  variant = 'chrome',
}: ThemePickerProps) {
  const { messages } = useI18n()
  const { themeId, setThemeId, busy } = useThemePreference()
  const label = messages.settings.themeHeading
  const resolved = resolveThemeId(themeId)
  const swatch = THEME_META_COLORS[resolved]
  const closedLabel =
    themeId === null
      ? `${label}: ${messages.settings.themeSystem}`
      : `${label}: ${messages.settings.themes[themeId]}`

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

  const choose = (next: ThemePreference) => {
    if (next === themeId) return
    setThemeId(next)
  }

  if (variant === 'chrome') {
    const selectValue = themeId ?? 'system'
    return (
      <label className="theme-chrome">
        <span className="visually-hidden">{closedLabel}</span>
        <span
          className="theme-chrome-swatch"
          style={{ backgroundColor: swatch }}
          aria-hidden="true"
        />
        <select
          className="theme-chrome-select"
          value={selectValue}
          disabled={disabled || busy}
          aria-label={closedLabel}
          onChange={(event) => {
            const raw = event.target.value
            if (raw === 'system') {
              choose(null)
              return
            }
            if (isThemeId(raw)) choose(raw)
          }}
        >
          {options.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <div
      className="chip-row theme-picker"
      role="radiogroup"
      aria-label={label}
    >
      {options.map((opt) => {
        const selected = themeId === opt.preference
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`chip${selected ? ' is-selected' : ''}`}
            disabled={disabled || busy}
            onClick={() => choose(opt.preference)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
