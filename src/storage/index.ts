/**
 * Storage ownership: sibling agents.
 * IndexedDB / localStorage for prefs, user presets, optional session history.
 * Scaffold only — persistence is not wired yet.
 */

export interface UserPrefsStub {
  lastPresetId: string | null
  masterVolume: number
}

export const DEFAULT_PREFS: UserPrefsStub = {
  lastPresetId: null,
  masterVolume: 0.45,
}

export async function loadPrefsStub(): Promise<UserPrefsStub> {
  return { ...DEFAULT_PREFS }
}

export async function savePrefsStub(_prefs: UserPrefsStub): Promise<void> {
  /* sibling: write to IndexedDB / localStorage */
  void _prefs
}
