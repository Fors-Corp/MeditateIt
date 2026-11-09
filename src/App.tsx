import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import SessionPage from './pages/SessionPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className={`app-shell${isHome ? ' is-home' : ''}`}>
      {!isHome && (
        <header className="app-header">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true" />
            MeditateIt
          </Link>
          <p className="app-tagline">
            {pathname.startsWith('/settings') ? 'Settings' : 'Generative soundscapes'}
          </p>
        </header>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/session/:presetId" element={<SessionPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
