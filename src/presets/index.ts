/**
 * Presets ownership: sibling agents.
 * System templates (Sleep, Focus, …) + user preset CRUD live here.
 * Scaffold only — no real recipes yet.
 */

export type PresetSource = 'system' | 'user'

export interface PresetStub {
  id: string
  name: string
  source: PresetSource
}

export const SYSTEM_PRESET_STUBS: readonly PresetStub[] = [
  { id: 'daily-calm', name: 'Daily calm', source: 'system' },
  { id: 'sleep', name: 'Sleep', source: 'system' },
  { id: 'focus', name: 'Focus', source: 'system' },
] as const

export function listSystemPresets(): readonly PresetStub[] {
  return SYSTEM_PRESET_STUBS
}
