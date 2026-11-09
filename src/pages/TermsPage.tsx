import { Link } from 'react-router-dom'

/**
 * Light product terms stub for personal local use.
 * Not a counsel-approved terms of service.
 */
export default function TermsPage() {
  return (
    <div className="legal-page">
      <h1>Terms</h1>
      <p className="legal-lede">
        Brief product notes for personal use of MeditateIt. This is not a formal
        terms of service and is not legal advice.
      </p>

      <section className="legal-section" aria-labelledby="terms-use">
        <h2 id="terms-use">Local personal use</h2>
        <p>
          MeditateIt is a generative wellness sound tool you run locally in the
          browser. Use it for personal listening and sound design.
        </p>
      </section>

      <section className="legal-section" aria-labelledby="terms-as-is">
        <h2 id="terms-as-is">As-is</h2>
        <p>
          The software is provided as-is, without warranties of any kind. Audio
          playback, timers, and persistence may fail or behave differently across
          browsers and devices.
        </p>
      </section>

      <section className="legal-section" aria-labelledby="terms-wellness">
        <h2 id="terms-wellness">Not medical treatment</h2>
        <p>
          MeditateIt is not a medical device and is not intended to diagnose,
          treat, cure, or prevent any condition. If you have health concerns,
          talk to a qualified professional.
        </p>
        <p>
          Keep listening volume comfortable. Use stereo headphones when a
          binaural beat mode asks for them — that is a listening technique, not
          therapy.
        </p>
      </section>

      <p className="settings-foot">
        <Link to="/settings">← Settings</Link>
        {' · '}
        <Link to="/privacy">Privacy</Link>
        {' · '}
        <Link to="/">Home</Link>
      </p>
    </div>
  )
}
