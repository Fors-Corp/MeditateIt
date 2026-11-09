import { Link, useParams } from 'react-router-dom'
import {
  SessionControls,
  useSessionController,
} from '../components/session'

export default function SessionPage() {
  const { presetId } = useParams<{ presetId?: string }>()
  const session = useSessionController(presetId)

  return (
    <section className="session-page" aria-labelledby="session-heading">
      <div className="session-top">
        <Link className="session-back" to="/">
          ← Home
        </Link>
        <h1 id="session-heading" className="visually-hidden">
          Session
        </h1>
      </div>
      <SessionControls session={session} />
    </section>
  )
}
