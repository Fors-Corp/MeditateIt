import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'

/** Shared disclaimer + legal links (product hygiene stub, not counsel copy). */
export default function AppFooter() {
  const { messages } = useI18n()
  return (
    <footer className="app-footer">
      <p className="app-disclaimer">{messages.app.disclaimer}</p>
      <p className="app-footer-links">
        <Link to="/privacy">{messages.app.privacy}</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/terms">{messages.app.terms}</Link>
      </p>
    </footer>
  )
}
