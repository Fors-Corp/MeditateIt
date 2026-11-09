import { Link, useParams } from 'react-router-dom'
import {
  SequenceControls,
  useSequenceController,
} from '../components/sequence'
import { messages } from '../i18n'

export default function SequencePage() {
  const { sequenceId } = useParams<{ sequenceId?: string }>()
  const session = useSequenceController(sequenceId)

  return (
    <section className="session-page" aria-labelledby="sequence-heading">
      <div className="session-top">
        <Link className="session-back" to="/">
          {messages.app.homeLink}
        </Link>
        <h1 id="sequence-heading" className="visually-hidden">
          {messages.sequence.heading}
        </h1>
      </div>
      <SequenceControls session={session} />
    </section>
  )
}
