import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useI18n } from '../i18n/useI18n'

/** Chromium beforeinstallprompt (not in all DOM lib versions). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

/**
 * Safer PWA update UX (prompt, not silent claim) + discreet install affordance.
 * No nag modal — only surfaces when an update is waiting or install is available.
 */
export default function PwaChrome() {
  const { messages } = useI18n()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  })

  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installHidden, setInstallHidden] = useState(false)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstallEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const showInstall = installEvent != null && !installHidden && !needRefresh

  if (!needRefresh && !showInstall) return null

  return (
    <div className="pwa-chrome" role="status" aria-live="polite">
      {needRefresh ? (
        <div className="pwa-chrome-row">
          <p className="pwa-chrome-copy">{messages.pwa.updateAvailable}</p>
          <div className="pwa-chrome-actions">
            <button
              type="button"
              className="btn btn-primary pwa-chrome-btn"
              onClick={() => void updateServiceWorker(true)}
            >
              {messages.pwa.reload}
            </button>
            <button
              type="button"
              className="btn btn-ghost pwa-chrome-btn"
              onClick={() => setNeedRefresh(false)}
            >
              {messages.pwa.later}
            </button>
          </div>
        </div>
      ) : (
        <div className="pwa-chrome-row">
          <p className="pwa-chrome-copy">{messages.pwa.installPrompt}</p>
          <div className="pwa-chrome-actions">
            <button
              type="button"
              className="btn btn-ghost pwa-chrome-btn"
              onClick={() => {
                const event = installEvent
                if (!event) return
                void event.prompt().then(() => {
                  setInstallEvent(null)
                })
              }}
            >
              {messages.pwa.install}
            </button>
            <button
              type="button"
              className="btn btn-ghost pwa-chrome-btn"
              onClick={() => setInstallHidden(true)}
            >
              {messages.pwa.dismiss}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
