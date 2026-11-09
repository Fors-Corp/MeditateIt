/**
 * Session UI — play/pause, timer, layer gains, solfeggio, beat mode,
 * mid-session preset crossfade, Media Session play/pause.
 * Calls into `src/audio` via bridges; never owns DSP nodes.
 */

export { SessionControls } from './SessionControls'
export { HeadphoneWarning } from './HeadphoneWarning'
export { SavePresetDialog } from './SavePresetDialog'
export { useSessionController } from './useSessionController'
export type {
  EqBandId,
  EqLayerId,
  SessionController,
} from './useSessionController'
