import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="home">
      <div className="home-lead">
        <h1>Start a calm session</h1>
        <p>
          Shape pink noise, solfeggio tones, and beats live — not a static
          playlist. Pick a preset or go custom in under thirty seconds.
        </p>
      </div>

      <div className="home-actions">
        <Link className="btn btn-primary" to="/session">
          Quick start
        </Link>
        <Link className="btn btn-ghost" to="/session/custom">
          Custom session
        </Link>
      </div>

      <p className="home-note">
        Preset list and last-used quick start will land when{' '}
        <code>src/presets/**</code> and <code>src/storage/**</code> are owned
        by sibling agents. This shell only routes into the session stub.
      </p>
    </section>
  )
}
