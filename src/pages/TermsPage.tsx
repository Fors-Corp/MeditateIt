import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'

/**
 * Light product terms stub for personal local use.
 * Not a counsel-approved terms of service.
 */
export default function TermsPage() {
  const { messages } = useI18n()
  const legal = messages.legal

  return (
    <div className="legal-page">
      <h1>{legal.termsTitle}</h1>
      <p className="legal-lede">{legal.termsLede}</p>

      <section className="legal-section" aria-labelledby="terms-use">
        <h2 id="terms-use">{legal.termsUseHeading}</h2>
        <p>{legal.termsUseBody}</p>
      </section>

      <section className="legal-section" aria-labelledby="terms-as-is">
        <h2 id="terms-as-is">{legal.termsAsIsHeading}</h2>
        <p>{legal.termsAsIsBody}</p>
      </section>

      <section className="legal-section" aria-labelledby="terms-wellness">
        <h2 id="terms-wellness">{legal.termsWellnessHeading}</h2>
        <p>{legal.termsWellnessP1}</p>
        <p>{legal.termsWellnessP2}</p>
      </section>

      <p className="settings-foot">
        <Link to="/settings">{legal.backSettings}</Link>
        {' · '}
        <Link to="/privacy">{messages.app.privacy}</Link>
        {' · '}
        <Link to="/">{legal.home}</Link>
      </p>
    </div>
  )
}
