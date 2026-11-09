import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import SessionPage from './pages/SessionPage'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          MeditateIt
        </Link>
        <p className="app-tagline">Generative soundscapes</p>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/session/:presetId" element={<SessionPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
