/**
 * Media Session wiring for PWA / lock-screen / headset media keys.
 * No-ops when `navigator.mediaSession` is missing.
 */

import { getMessages } from '../i18n'

export interface MediaSessionHandlers {
  onPlay: () => void | Promise<void>
  onPause: () => void
  /** Optional — headset / lock-screen Stop. */
  onStop?: () => void
  /**
   * Optional — sequence skip-stage via `nexttrack` where the OS exposes it.
   * Omit for single-preset sessions.
   */
  onNextTrack?: () => void
}

export interface SessionMediaMetadata {
  title: string
  artist?: string
  album?: string
}

const ACTION_KEYS = [
  'play',
  'pause',
  'stop',
  'nexttrack',
] as const satisfies readonly MediaSessionAction[]

export function isMediaSessionAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator
}

export function setSessionMediaMetadata(meta: SessionMediaMetadata): void {
  if (!isMediaSessionAvailable()) return
  try {
    const m = getMessages()
    navigator.mediaSession.metadata = new MediaMetadata({
      title: meta.title,
      artist: meta.artist ?? m.app.brand,
      album: meta.album ?? m.media.defaultAlbum,
    })
  } catch {
    /* MediaMetadata unsupported or blocked */
  }
}

export function setMediaSessionPlaybackState(
  state: MediaSessionPlaybackState,
): void {
  if (!isMediaSessionAvailable()) return
  try {
    navigator.mediaSession.playbackState = state
  } catch {
    /* ignore */
  }
}

function setAction(
  action: MediaSessionAction,
  handler: MediaSessionActionHandler | null,
): void {
  try {
    navigator.mediaSession.setActionHandler(action, handler)
  } catch {
    /* action unsupported on this platform */
  }
}

/**
 * Bind Media Session action handlers. Returns an unbind function.
 * Clears handlers and playback state on unbind.
 */
export function bindMediaSessionHandlers(
  handlers: MediaSessionHandlers,
): () => void {
  if (!isMediaSessionAvailable()) {
    return () => undefined
  }

  const onPlay = () => {
    void handlers.onPlay()
  }
  const onPause = () => {
    handlers.onPause()
  }
  const onStop = () => {
    if (handlers.onStop) {
      handlers.onStop()
    } else {
      handlers.onPause()
    }
  }
  const onNext =
    handlers.onNextTrack != null
      ? () => {
          handlers.onNextTrack?.()
        }
      : null

  setAction('play', onPlay)
  setAction('pause', onPause)
  setAction('stop', onStop)
  setAction('nexttrack', onNext)

  return () => {
    for (const action of ACTION_KEYS) {
      setAction(action, null)
    }
    try {
      navigator.mediaSession.playbackState = 'none'
      navigator.mediaSession.metadata = null
    } catch {
      /* ignore */
    }
  }
}
