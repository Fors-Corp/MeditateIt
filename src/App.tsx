import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import SequencePage from './pages/SequencePage'
import SessionPage from './pages/SessionPage'

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
          <p className="app-tagline">Generative soundscapes</p>
        </header>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/session/:presetId" element={<SessionPage />} />
          <Route path="/sequence/:sequenceId" element={<SequencePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
