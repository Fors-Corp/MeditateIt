import { Link } from 'react-router-dom'
import { STORAGE_KEYS } from '../storage'

/**
 * Product privacy stub for a local-first wellness sound tool.
 * Not a counsel-approved privacy policy.
 */
export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <h1>Privacy</h1>
      <p className="legal-lede">
        Short product note about what MeditateIt stores on this device. This is
        not a formal privacy policy and is not legal advice.
      </p>

      <section className="legal-section" aria-labelledby="privacy-local">
        <h2 id="privacy-local">Local-only storage</h2>
        <p>
          MeditateIt has no accounts and does not sync data to a MeditateIt
          server. Preferences, saved presets, and session history stay in this
          browser&apos;s <code>localStorage</code> on your device.
        </p>
        <p>
          Export and import are user-initiated JSON files you choose to save or
          load. Clearing site data in the browser removes what the app stored.
        </p>
      </section>

      <section className="legal-section" aria-labelledby="privacy-keys">
        <h2 id="privacy-keys">Storage keys</h2>
        <ul className="legal-list">
          <li>
            <code>{STORAGE_KEYS.prefs}</code> — volume and session preferences
          </li>
          <li>
            <code>{STORAGE_KEYS.userPresets}</code> — presets you save
          </li>
          <li>
            <code>{STORAGE_KEYS.sessionHistory}</code> — finished listen history
          </li>
        </ul>
      </section>

      <section className="legal-section" aria-labelledby="privacy-network">
        <h2 id="privacy-network">Network</h2>
        <p>
          Fonts used by the UI are self-hosted with the app. There is no
          first-party analytics in the current build. Hosting your own copy may
          still involve whatever your host or CDN logs; that is outside this
          app&apos;s storage.
        </p>
      </section>

      <p className="settings-foot">
        <Link to="/settings">← Settings</Link>
        {' · '}
        <Link to="/terms">Terms</Link>
        {' · '}
        <Link to="/">Home</Link>
      </p>
    </div>
  )
}
