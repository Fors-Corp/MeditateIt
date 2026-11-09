/**
 * Attempt to resume a suspended AudioContext when the page becomes visible
 * again (tab foreground, pageshow from bfcache, lock-screen return).
 *
 * Browsers often block resume without a user gesture — callers should surface
 * a calm "Tap to continue audio" affordance when this returns `blocked`.
 */

export type ContextResumeResult = 'running' | 'suspended' | 'none'

export interface VisibilityResumeHandlers {
  /** True when the UI session expects audio to keep playing. */
  shouldBePlaying: () => boolean
  /** Resume only — no graph rebuild, no gain ramps (avoids clicks). */
  resumeContext: () => Promise<ContextResumeResult>
  onResumed?: () => void
  onBlocked?: () => void
}

/**
 * Bind `visibilitychange` + `pageshow` resume attempts.
 * Returns an unbind function.
 */
export function bindVisibilityAudioResume(
  handlers: VisibilityResumeHandlers,
): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined
  }

  let inFlight = false

  const attempt = () => {
    if (inFlight) return
    if (document.visibilityState === 'hidden') return
    if (!handlers.shouldBePlaying()) return

    inFlight = true
    void (async () => {
      try {
        const result = await handlers.resumeContext()
        if (result === 'running') {
          handlers.onResumed?.()
        } else if (result === 'suspended') {
          handlers.onBlocked?.()
        }
      } finally {
        inFlight = false
      }
    })()
  }

  const onVisibility = () => {
    if (document.visibilityState === 'visible') attempt()
  }
  const onPageShow = () => {
    attempt()
  }

  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pageshow', onPageShow)

  return () => {
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pageshow', onPageShow)
  }
}
