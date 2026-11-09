import {
  cloneRecipe,
  isSystemPresetId,
  normalizeRecipe,
  type Preset,
  type SessionRecipe,
} from '../presets/index.ts'
import { STORAGE_KEYS } from './keys.ts'
import {
  MAX_DURATION_SEC,
  MAX_ID_CHARS,
  MAX_NAME_CHARS,
  MAX_USER_PRESETS,
} from './limits.ts'
import { readJson, writeJson } from './local.ts'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max)
}

function normalizeUserPreset(raw: unknown): Preset | null {
  if (!isObject(raw)) return null
  if (typeof raw.id !== 'string' || raw.id.length === 0) return null
  // Reject oversized ids outright (truncation could collide).
  if (raw.id.length > MAX_ID_CHARS) return null
  if (typeof raw.name !== 'string' || raw.name.trim().length === 0) return null

  const id = truncate(raw.id.trim(), MAX_ID_CHARS)
  if (!id || isSystemPresetId(id)) return null

  const name = truncate(raw.name.trim(), MAX_NAME_CHARS)
  if (!name) return null

  const recipe = normalizeRecipe(raw.recipe)
  if (!recipe) return null

  const defaultDurationSec =
    typeof raw.defaultDurationSec === 'number' &&
    Number.isFinite(raw.defaultDurationSec) &&
    raw.defaultDurationSec >= 0
      ? Math.min(MAX_DURATION_SEC, raw.defaultDurationSec)
      : raw.defaultDurationSec === null
        ? null
        : null

  return {
    id,
    name,
    source: 'user',
    recipe,
    defaultDurationSec,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt.length > 0
        ? truncate(raw.updatedAt, 64)
        : new Date().toISOString(),
  }
}

async function readAll(): Promise<Preset[]> {
  const raw = await readJson<unknown>(STORAGE_KEYS.userPresets)
  if (!Array.isArray(raw)) return []
  const out: Preset[] = []
  for (const item of raw) {
    if (out.length >= MAX_USER_PRESETS) break
    const preset = normalizeUserPreset(item)
    if (preset) out.push(preset)
  }
  return out
}

async function writeAll(presets: Preset[]): Promise<void> {
  await writeJson(
    STORAGE_KEYS.userPresets,
    presets.slice(0, MAX_USER_PRESETS).map((p) => ({
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
  const name = truncate(input.name.trim(), MAX_NAME_CHARS)
  if (!name) throw new Error('Preset name is required')
  const recipe = normalizeRecipe(input.recipe)
  if (!recipe) throw new Error('Invalid session recipe')

  const id = truncate(input.id?.trim() || crypto.randomUUID(), MAX_ID_CHARS)
  if (!id) throw new Error('Preset id is required')
  if (isSystemPresetId(id)) {
    throw new Error('Cannot overwrite a system preset')
  }

  const defaultDurationSec =
    input.defaultDurationSec === undefined
      ? null
      : input.defaultDurationSec === null
        ? null
        : Math.min(
            MAX_DURATION_SEC,
            Math.max(0, input.defaultDurationSec),
          )

  const next: Preset = {
    id,
    name,
    source: 'user',
    recipe,
    defaultDurationSec,
    updatedAt: new Date().toISOString(),
  }

  const all = await readAll()
  const idx = all.findIndex((p) => p.id === id)
  if (idx >= 0) {
    all[idx] = next
  } else {
    if (all.length >= MAX_USER_PRESETS) {
      throw new Error(`At most ${MAX_USER_PRESETS} user presets`)
    }
    all.push(next)
  }
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
    if (next.length >= MAX_USER_PRESETS) break
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
  const next = [...byId.values()].slice(0, MAX_USER_PRESETS)
  await writeAll(next)
  return next
}
