import { Link, useParams } from 'react-router-dom'
import {
  SessionControls,
  useSessionController,
} from '../components/session'
import { useI18n } from '../i18n/useI18n'

export default function SessionPage() {
  const { presetId } = useParams<{ presetId?: string }>()
  const session = useSessionController(presetId)
  const { messages } = useI18n()

  return (
    <section className="session-page" aria-labelledby="session-heading">
      <div className="session-top">
        <Link className="session-back" to="/">
          {messages.app.homeLink}
        </Link>
        <h1 id="session-heading" className="visually-hidden">
          {messages.session.heading}
        </h1>
      </div>
      <SessionControls session={session} />
    </section>
  )
}
