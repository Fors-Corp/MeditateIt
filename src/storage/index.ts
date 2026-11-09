/**
 * Local persistence for prefs + user presets (localStorage, async API).
 * System presets stay in `src/presets`; this module never mutates them.
 */

import {
  getSystemPreset,
  listSystemPresets,
  type Preset,
  type UserPrefs,
} from '../presets/index.ts'
import {
  loadPrefs,
  updatePrefs,
} from './prefs.ts'
import {
  deleteUserPreset,
  getUserPreset,
  listUserPresets,
} from './userPresets.ts'

export { STORAGE_KEYS } from './keys.ts'

export {
  DEFAULT_PREFS,
  loadPrefs,
  normalizePrefs,
  savePrefs,
  updatePrefs,
} from './prefs.ts'

export {
  deleteUserPreset,
  getUserPreset,
  listUserPresets,
  saveUserPreset,
  type SaveUserPresetInput,
} from './userPresets.ts'

/** System templates first, then user presets (insertion / save order). */
export async function listAllPresets(): Promise<Preset[]> {
  const user = await listUserPresets()
  return [...listSystemPresets().map((p) => structuredClone(p)), ...user]
}

/** Resolve system or user preset by id. */
export async function getPreset(id: string): Promise<Preset | null> {
  const system = getSystemPreset(id)
  if (system) return system
  return getUserPreset(id)
}

/**
 * Last-used preset for quick start.
 * Falls back to Daily calm when unset / missing.
 */
export async function getLastUsedPreset(): Promise<Preset> {
  const prefs = await loadPrefs()
  if (prefs.lastPresetId) {
    const found = await getPreset(prefs.lastPresetId)
    if (found) return found
  }
  return getSystemPreset('daily-calm') ?? listSystemPresets()[0]!
}

/** Record which preset the session started from (and optional recipe snapshot). */
export async function rememberLastPreset(
  presetId: string,
  recipe?: UserPrefs['lastRecipe'],
): Promise<UserPrefs> {
  return updatePrefs({
    lastPresetId: presetId,
    ...(recipe !== undefined ? { lastRecipe: recipe } : {}),
  })
}

/** Delete a user preset and clear lastPresetId when it pointed there. */
export async function deleteUserPresetAndForget(
  id: string,
): Promise<boolean> {
  const removed = await deleteUserPreset(id)
  if (!removed) return false
  const prefs = await loadPrefs()
  if (prefs.lastPresetId === id) {
    await updatePrefs({ lastPresetId: null })
  }
  return true
}
