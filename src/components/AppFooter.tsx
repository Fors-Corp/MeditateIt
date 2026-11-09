import { Link } from 'react-router-dom'

/** Shared disclaimer + legal links (product hygiene stub, not counsel copy). */
export default function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-disclaimer">
        MeditateIt is a generative sound tool for personal wellness and focus. It
        is not a medical device and is not intended to diagnose, treat, cure, or
        prevent any condition.
      </p>
      <p className="app-footer-links">
        <Link to="/privacy">Privacy</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/terms">Terms</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/settings">Settings</Link>
      </p>
    </footer>
  )
}
