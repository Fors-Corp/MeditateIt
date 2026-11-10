import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import { STORAGE_KEYS } from '../storage'

/**
 * Product privacy stub for a local-first wellness sound tool.
 * Not a counsel-approved privacy policy.
 */
export default function PrivacyPage() {
  const { messages } = useI18n()
  const legal = messages.legal

  return (
    <div className="legal-page">
      <h1>{legal.privacyTitle}</h1>
      <p className="legal-lede">{legal.privacyLede}</p>

      <section className="legal-section" aria-labelledby="privacy-local">
        <h2 id="privacy-local">{legal.privacyLocalHeading}</h2>
        <p>{legal.privacyLocalP1}</p>
        <p>{legal.privacyLocalP2}</p>
      </section>

      <section className="legal-section" aria-labelledby="privacy-keys">
        <h2 id="privacy-keys">{legal.privacyKeysHeading}</h2>
        <ul className="legal-list">
          <li>
            <code>{STORAGE_KEYS.prefs}</code> — {legal.privacyKeyPrefs}
          </li>
          <li>
            <code>{STORAGE_KEYS.userPresets}</code> — {legal.privacyKeyPresets}
          </li>
          <li>
            <code>{STORAGE_KEYS.sessionHistory}</code> —{' '}
            {legal.privacyKeyHistory}
          </li>
        </ul>
      </section>

      <section className="legal-section" aria-labelledby="privacy-network">
        <h2 id="privacy-network">{legal.privacyNetworkHeading}</h2>
        <p>{legal.privacyNetworkBody}</p>
      </section>

      <p className="settings-foot">
        <Link to="/settings">{legal.backSettings}</Link>
        {' · '}
        <Link to="/terms">{messages.app.terms}</Link>
        {' · '}
        <Link to="/">{legal.home}</Link>
      </p>
    </div>
  )
}
