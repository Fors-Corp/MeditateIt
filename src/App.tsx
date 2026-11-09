import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import AppFooter from './components/AppFooter'
import PwaChrome from './components/PwaChrome'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'
import SequencePage from './pages/SequencePage'
import SessionPage from './pages/SessionPage'
import SettingsPage from './pages/SettingsPage'
import TermsPage from './pages/TermsPage'

function headerLabel(pathname: string): string {
  if (pathname.startsWith('/settings')) return 'Settings'
  if (pathname.startsWith('/privacy')) return 'Privacy'
  if (pathname.startsWith('/terms')) return 'Terms'
  return 'Generative soundscapes'
}

function App() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className={`app-shell${isHome ? ' is-home' : ''}`}>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      {!isHome && (
        <header className="app-header">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true" />
            MeditateIt
          </Link>
          <p className="app-tagline">{headerLabel(pathname)}</p>
        </header>
      )}

      <main id="main" className="app-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/session/:presetId" element={<SessionPage />} />
          <Route path="/sequence/:sequenceId" element={<SequencePage />} />
        </Routes>
      </main>

      <PwaChrome />
      <AppFooter />
    </div>
  )
}

export default App
