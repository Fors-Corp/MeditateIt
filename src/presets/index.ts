/**
 * Presets — system templates + recipe helpers.
 * Persistence (save/load/delete user presets, prefs) lives in `src/storage`.
 */

export type {
  BeatMode,
  BeatParams,
  LayerGains,
  NatureParams,
  NatureSoundId,
  NoiseKind,
  NoiseParams,
  Preset,
  PresetSource,
  SessionRecipe,
  ToneParams,
  UserPrefs,
} from './types.ts'

export {
  cloneRecipe,
  createBlankRecipe,
  DEFAULT_FADE_IN_SEC,
  DEFAULT_FADE_OUT_SEC,
  DEFAULT_GAINS,
} from './recipe.ts'

export {
  cloneAsUserPreset,
  getSystemPreset,
  isSystemPresetId,
  listSystemPresets,
  SYSTEM_PRESETS,
} from './system.ts'
