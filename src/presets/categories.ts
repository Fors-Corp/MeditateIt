/** Browse categories for system presets (Home filter chips). */

export const PRESET_CATEGORY_IDS = [
  'focus',
  'sleep',
  'calm',
  'nature',
  'beats',
  'tones',
] as const

export type PresetCategoryId = (typeof PRESET_CATEGORY_IDS)[number]

export function isPresetCategoryId(value: unknown): value is PresetCategoryId {
  return (
    typeof value === 'string' &&
    (PRESET_CATEGORY_IDS as readonly string[]).includes(value)
  )
}
