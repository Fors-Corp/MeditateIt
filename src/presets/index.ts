/**
 * Presets — system templates + recipe helpers.
 * Persistence (save/load/delete user presets, prefs) lives in `src/storage`.
 */

export type {
  BeatMode,
  BeatParams,
  LayerEqParams,
  LayerGains,
  NatureParams,
  NatureSoundId,
  NoiseKind,
  NoiseParams,
  Preset,
  PresetCategoryId,
  PresetSource,
  SessionRecipe,
  ToneParams,
  ThemeId,
  UserPrefs,
} from './types.ts'

export { NEUTRAL_LAYER_EQ } from './types.ts'

export {
  isPresetCategoryId,
  PRESET_CATEGORY_IDS,
} from './categories.ts'

export {
  cloneLayerEq,
  cloneRecipe,
  createBlankRecipe,
  DEFAULT_FADE_IN_SEC,
  DEFAULT_FADE_OUT_SEC,
  DEFAULT_GAINS,
  isValidRecipe,
  normalizeRecipe,
} from './recipe.ts'

export {
  cloneAsUserPreset,
  getSystemPreset,
  isSystemPresetId,
  listSystemPresets,
  SYSTEM_PRESETS,
} from './system.ts'
