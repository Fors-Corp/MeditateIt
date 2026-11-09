import {
  cloneRecipe,
  isSystemPresetId,
  isValidRecipe,
  normalizeRecipe,
  type Preset,
  type SessionRecipe,
} from '../presets/index.ts'
import { STORAGE_KEYS } from './keys.ts'
import { readJson, writeJson } from './local.ts'

/** Cap untrusted string fields from JSON import / localStorage. */
const MAX_PRESET_ID_LEN = 128
const MAX_PRESET_NAME_LEN = 120

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeUserPreset(raw: unknown): Preset | null {
  if (!isObject(raw)) return null
  if (typeof raw.id !== 'string' || raw.id.length === 0) return null
  if (raw.id.length > MAX_PRESET_ID_LEN) return null
  if (typeof raw.name !== 'string' || raw.name.trim().length === 0) return null
  if (isSystemPresetId(raw.id)) return null

  const recipe = normalizeRecipe(raw.recipe)
  if (!recipe) return null

  const defaultDurationSec =
    typeof raw.defaultDurationSec === 'number' &&
    Number.isFinite(raw.defaultDurationSec) &&
    raw.defaultDurationSec >= 0
      ? raw.defaultDurationSec
      : raw.defaultDurationSec === null
        ? null
        : null

  return {
    id: raw.id,
    name: raw.name.trim().slice(0, MAX_PRESET_NAME_LEN),
    source: 'user',
    recipe,
    defaultDurationSec,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt.length > 0
        ? raw.updatedAt.slice(0, 64)
        : new Date().toISOString(),
  }
}

async function readAll(): Promise<Preset[]> {
  const raw = await readJson<unknown>(STORAGE_KEYS.userPresets)
  if (!Array.isArray(raw)) return []
  const out: Preset[] = []
  for (const item of raw) {
    const preset = normalizeUserPreset(item)
    if (preset) out.push(preset)
  }
  return out
}

async function writeAll(presets: Preset[]): Promise<void> {
  await writeJson(
    STORAGE_KEYS.userPresets,
    presets.map((p) => ({
      ...p,
      source: 'user' as const,
      recipe: cloneRecipe(p.recipe),
    })),
  )
}

export async function listUserPresets(): Promise<Preset[]> {
  return readAll()
}

export async function getUserPreset(id: string): Promise<Preset | null> {
  const all = await readAll()
  return all.find((p) => p.id === id) ?? null
}

export type SaveUserPresetInput = {
  /** Omit or leave empty to mint a new id */
  id?: string
  name: string
  recipe: SessionRecipe
  defaultDurationSec?: number | null
}

/**
 * Create or overwrite a user preset.
 * Refuses system preset ids — clone with a new id instead.
 */
export async function saveUserPreset(
  input: SaveUserPresetInput,
): Promise<Preset> {
  const name = input.name.trim()
  if (!name) throw new Error('Preset name is required')
  if (!isValidRecipe(input.recipe)) throw new Error('Invalid session recipe')

  const id = input.id?.trim() || crypto.randomUUID()
  if (isSystemPresetId(id)) {
    throw new Error('Cannot overwrite a system preset')
  }

  const next: Preset = {
    id,
    name,
    source: 'user',
    recipe: cloneRecipe(input.recipe),
    defaultDurationSec:
      input.defaultDurationSec === undefined ? null : input.defaultDurationSec,
    updatedAt: new Date().toISOString(),
  }

  const all = await readAll()
  const idx = all.findIndex((p) => p.id === id)
  if (idx >= 0) all[idx] = next
  else all.push(next)
  await writeAll(all)
  return next
}

/** Returns true when a user preset was removed. */
export async function deleteUserPreset(id: string): Promise<boolean> {
  if (isSystemPresetId(id)) return false
  const all = await readAll()
  const next = all.filter((p) => p.id !== id)
  if (next.length === all.length) return false
  await writeAll(next)
  return true
}

/**
 * Replace the entire user-preset list (backup import `replace`).
 * Invalid / system-id entries are skipped.
 */
export async function replaceUserPresets(
  presets: unknown[],
): Promise<Preset[]> {
  const next: Preset[] = []
  for (const item of presets) {
    const preset = normalizeUserPreset(item)
    if (preset) next.push(preset)
  }
  await writeAll(next)
  return next
}

/**
 * Merge imported presets by id (imported wins). Existing ids not in
 * the import are kept.
 */
export async function mergeUserPresets(presets: unknown[]): Promise<Preset[]> {
  const all = await readAll()
  const byId = new Map(all.map((p) => [p.id, p]))
  for (const item of presets) {
    const preset = normalizeUserPreset(item)
    if (preset) byId.set(preset.id, preset)
  }
  const next = [...byId.values()]
  await writeAll(next)
  return next
}
