import { Link } from 'react-router-dom'
import { messages } from '../i18n'

/** Shared disclaimer + legal links (product hygiene stub, not counsel copy). */
export default function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-disclaimer">{messages.app.disclaimer}</p>
      <p className="app-footer-links">
        <Link to="/privacy">{messages.app.privacy}</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/terms">{messages.app.terms}</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/settings">{messages.app.settings}</Link>
      </p>
    </footer>
  )
}
