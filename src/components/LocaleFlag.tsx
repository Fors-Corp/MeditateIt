import type { LocaleCode } from '../i18n'

interface LocaleFlagProps {
  code: LocaleCode
  className?: string
}

/** Compact SVG locale marks for chrome (decorative; pair with aria-label). */
export default function LocaleFlag({ code, className }: LocaleFlagProps) {
  const title = code.toUpperCase()
  switch (code) {
    case 'en':
      return (
        <svg
          className={className}
          viewBox="0 0 16 12"
          width="16"
          height="12"
          aria-hidden="true"
          focusable="false"
        >
          <title>{title}</title>
          <rect width="16" height="12" fill="#012169" />
          <path d="M0 0 L16 12 M16 0 L0 12" stroke="#fff" strokeWidth="2.4" />
          <path d="M0 0 L16 12 M16 0 L0 12" stroke="#C8102E" strokeWidth="1.2" />
          <path d="M8 0 V12 M0 6 H16" stroke="#fff" strokeWidth="4" />
          <path d="M8 0 V12 M0 6 H16" stroke="#C8102E" strokeWidth="2" />
        </svg>
      )
    case 'es':
      return (
        <svg
          className={className}
          viewBox="0 0 16 12"
          width="16"
          height="12"
          aria-hidden="true"
          focusable="false"
        >
          <title>{title}</title>
          <rect width="16" height="12" fill="#AA151B" />
          <rect y="3" width="16" height="6" fill="#F1BF00" />
        </svg>
      )
    case 'ca':
      return (
        <svg
          className={className}
          viewBox="0 0 16 12"
          width="16"
          height="12"
          aria-hidden="true"
          focusable="false"
        >
          <title>{title}</title>
          <rect width="16" height="12" fill="#FCDD09" />
          <rect y="1.33" width="16" height="1.34" fill="#DA121A" />
          <rect y="4" width="16" height="1.34" fill="#DA121A" />
          <rect y="6.67" width="16" height="1.34" fill="#DA121A" />
          <rect y="9.33" width="16" height="1.34" fill="#DA121A" />
        </svg>
      )
    case 'fr':
      return (
        <svg
          className={className}
          viewBox="0 0 16 12"
          width="16"
          height="12"
          aria-hidden="true"
          focusable="false"
        >
          <title>{title}</title>
          <rect width="16" height="12" fill="#fff" />
          <rect width="5.33" height="12" fill="#002395" />
          <rect x="10.67" width="5.33" height="12" fill="#ED2939" />
        </svg>
      )
    case 'pt':
      return (
        <svg
          className={className}
          viewBox="0 0 16 12"
          width="16"
          height="12"
          aria-hidden="true"
          focusable="false"
        >
          <title>{title}</title>
          <rect width="16" height="12" fill="#FF0000" />
          <rect width="6.4" height="12" fill="#006600" />
          <circle cx="6.4" cy="6" r="2.1" fill="#FFCC00" />
          <circle cx="6.4" cy="6" r="1.35" fill="#fff" />
          <rect x="5.55" y="5.15" width="1.7" height="1.7" fill="#FF0000" />
        </svg>
      )
  }
}
