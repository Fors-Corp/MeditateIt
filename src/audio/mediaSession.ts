/**
 * Media Session wiring for PWA / lock-screen / headset media keys.
 * No-ops when `navigator.mediaSession` is missing.
 */

export interface MediaSessionHandlers {
  onPlay: () => void | Promise<void>
  onPause: () => void
}

export interface SessionMediaMetadata {
  title: string
  artist?: string
  album?: string
}

const DEFAULT_ARTIST = 'MeditateIt'

export function isMediaSessionAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator
}

export function setSessionMediaMetadata(meta: SessionMediaMetadata): void {
  if (!isMediaSessionAvailable()) return
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: meta.title,
      artist: meta.artist ?? DEFAULT_ARTIST,
      album: meta.album ?? 'Meditation session',
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

/**
 * Bind play/pause action handlers. Returns an unbind function.
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

  try {
    navigator.mediaSession.setActionHandler('play', onPlay)
    navigator.mediaSession.setActionHandler('pause', onPause)
  } catch {
    /* action handlers rejected */
  }

  return () => {
    try {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.playbackState = 'none'
      navigator.mediaSession.metadata = null
    } catch {
      /* ignore */
    }
  }
}
