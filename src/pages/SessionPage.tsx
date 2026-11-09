import { Link, useParams } from 'react-router-dom'
import { SessionControlsStub } from '../components/session'

/**
 * Session route stub.
 * Ownership: sibling agents own this page + `src/components/session/**`
 * and wire it to `src/audio/**`. Keep this file thin until that work lands.
 */
export default function SessionPage() {
  const { presetId } = useParams<{ presetId?: string }>()

  return (
    <section className="session-stub" aria-labelledby="session-heading">
      <h1 id="session-heading">Session</h1>
      <p className="session-stub-meta">
        preset: {presetId ?? 'quick-start (default)'}
      </p>
      <p className="ownership-callout">
        Owned by sibling agents: replace this stub with the live session UI
        (<code>src/components/session/**</code>), audio engine (
        <code>src/audio/**</code>), and recipe/persistence (
        <code>src/presets/**</code>, <code>src/storage/**</code>). Scaffold
        agents should not deepen this page.
      </p>
      <SessionControlsStub />
      <Link className="btn btn-ghost" to="/">
        Back home
      </Link>
    </section>
  )
}
