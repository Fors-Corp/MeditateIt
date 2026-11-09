import { cloneRecipe, normalizeRecipe } from '../presets/index.ts'
import { isSystemSequenceId } from '../sequences/system.ts'
import type { Sequence, SequenceStage } from '../sequences/types.ts'
import { STORAGE_KEYS } from './keys.ts'
import {
  MAX_DURATION_SEC,
  MAX_ID_CHARS,
  MAX_NAME_CHARS,
  MAX_SEQUENCE_STAGES,
  MAX_SUMMARY_CHARS,
  MAX_USER_SEQUENCES,
} from './limits.ts'
import { readJson, writeJson } from './local.ts'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max)
}

function cloneSequence(sequence: Sequence): Sequence {
  return {
    ...sequence,
    stages: sequence.stages.map((s) => ({
      ...s,
      recipe: s.recipe ? cloneRecipe(s.recipe) : undefined,
    })),
  }
}

function normalizeStage(raw: unknown): SequenceStage | null {
  if (!isObject(raw)) return null
  if (typeof raw.id !== 'string' || raw.id.trim().length === 0) return null
  if (raw.id.length > MAX_ID_CHARS) return null
  if (typeof raw.name !== 'string' || raw.name.trim().length === 0) return null

  const id = truncate(raw.id.trim(), MAX_ID_CHARS)
  const name = truncate(raw.name.trim(), MAX_NAME_CHARS)
  if (!id || !name) return null

  const durationSec =
    typeof raw.durationSec === 'number' &&
    Number.isFinite(raw.durationSec) &&
    raw.durationSec >= 0
      ? Math.min(MAX_DURATION_SEC, Math.max(0, Math.round(raw.durationSec)))
      : null
  if (durationSec == null) return null

  const hasRecipe = raw.recipe !== undefined && raw.recipe !== null
  const presetId =
    typeof raw.presetId === 'string' && raw.presetId.trim().length > 0
      ? truncate(raw.presetId.trim(), MAX_ID_CHARS)
      : undefined

  if (hasRecipe) {
    const recipe = normalizeRecipe(raw.recipe)
    if (!recipe) return null
    return {
      id,
      name,
      durationSec,
      recipe,
      ...(presetId ? { presetId } : {}),
    }
  }

  if (!presetId) return null
  return { id, name, durationSec, presetId }
}

/**
 * Soft-validate a persisted / imported user sequence.
 * System sequence ids are rejected — clone with a new id instead.
 */
export function normalizeUserSequence(raw: unknown): Sequence | null {
  if (!isObject(raw)) return null
  if (typeof raw.id !== 'string' || raw.id.length === 0) return null
  if (raw.id.length > MAX_ID_CHARS) return null
  if (typeof raw.name !== 'string' || raw.name.trim().length === 0) return null
  if (!Array.isArray(raw.stages) || raw.stages.length === 0) return null

  const id = truncate(raw.id.trim(), MAX_ID_CHARS)
  if (!id || isSystemSequenceId(id)) return null

  const name = truncate(raw.name.trim(), MAX_NAME_CHARS)
  if (!name) return null

  const summary =
    typeof raw.summary === 'string'
      ? truncate(raw.summary.trim(), MAX_SUMMARY_CHARS)
      : ''

  const stages: SequenceStage[] = []
  for (const item of raw.stages) {
    if (stages.length >= MAX_SEQUENCE_STAGES) break
    const stage = normalizeStage(item)
    if (stage) stages.push(stage)
  }
  if (stages.length === 0) return null

  return {
    id,
    name,
    summary,
    source: 'user',
    stages,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt.length > 0
        ? truncate(raw.updatedAt, 64)
        : new Date().toISOString(),
  }
}

async function readAll(): Promise<Sequence[]> {
  const raw = await readJson<unknown>(STORAGE_KEYS.userSequences)
  if (!Array.isArray(raw)) return []
  const out: Sequence[] = []
  for (const item of raw) {
    if (out.length >= MAX_USER_SEQUENCES) break
    const sequence = normalizeUserSequence(item)
    if (sequence) out.push(sequence)
  }
  return out
}

async function writeAll(sequences: Sequence[]): Promise<void> {
  await writeJson(
    STORAGE_KEYS.userSequences,
    sequences.slice(0, MAX_USER_SEQUENCES).map((s) => ({
      ...cloneSequence(s),
      source: 'user' as const,
    })),
  )
}

export async function listUserSequences(): Promise<Sequence[]> {
  return readAll()
}

export async function getUserSequence(id: string): Promise<Sequence | null> {
  const all = await readAll()
  const found = all.find((s) => s.id === id)
  return found ? cloneSequence(found) : null
}

export type SaveUserSequenceInput = {
  /** Omit or leave empty to mint a new id */
  id?: string
  name: string
  summary?: string
  stages: SequenceStage[]
}

/**
 * Create or overwrite a user sequence.
 * Refuses system sequence ids — clone with a new id instead.
 */
export async function saveUserSequence(
  input: SaveUserSequenceInput,
): Promise<Sequence> {
  const name = truncate(input.name.trim(), MAX_NAME_CHARS)
  if (!name) throw new Error('Sequence name is required')

  const summary = truncate((input.summary ?? '').trim(), MAX_SUMMARY_CHARS)

  const stages: SequenceStage[] = []
  for (const item of input.stages) {
    if (stages.length >= MAX_SEQUENCE_STAGES) break
    const stage = normalizeStage(item)
    if (stage) stages.push(stage)
  }
  if (stages.length === 0) throw new Error('Sequence needs at least one stage')

  const id = truncate(input.id?.trim() || crypto.randomUUID(), MAX_ID_CHARS)
  if (!id) throw new Error('Sequence id is required')
  if (isSystemSequenceId(id)) {
    throw new Error('Cannot overwrite a system sequence')
  }

  const next: Sequence = {
    id,
    name,
    summary,
    source: 'user',
    stages,
    updatedAt: new Date().toISOString(),
  }

  const all = await readAll()
  const idx = all.findIndex((s) => s.id === id)
  if (idx >= 0) {
    all[idx] = next
  } else {
    if (all.length >= MAX_USER_SEQUENCES) {
      throw new Error(`At most ${MAX_USER_SEQUENCES} user sequences`)
    }
    all.push(next)
  }
  await writeAll(all)
  return cloneSequence(next)
}

/** Returns true when a user sequence was removed. */
export async function deleteUserSequence(id: string): Promise<boolean> {
  if (isSystemSequenceId(id)) return false
  const all = await readAll()
  const next = all.filter((s) => s.id !== id)
  if (next.length === all.length) return false
  await writeAll(next)
  return true
}

/**
 * Replace the entire user-sequence list (backup import `replace`).
 * Invalid / system-id entries are skipped.
 */
export async function replaceUserSequences(
  sequences: unknown[],
): Promise<Sequence[]> {
  const next: Sequence[] = []
  for (const item of sequences) {
    if (next.length >= MAX_USER_SEQUENCES) break
    const sequence = normalizeUserSequence(item)
    if (sequence) next.push(sequence)
  }
  await writeAll(next)
  return next.map((s) => cloneSequence(s))
}

/**
 * Merge imported sequences by id (imported wins). Existing ids not in
 * the import are kept.
 */
export async function mergeUserSequences(
  sequences: unknown[],
): Promise<Sequence[]> {
  const all = await readAll()
  const byId = new Map(all.map((s) => [s.id, s]))
  for (const item of sequences) {
    const sequence = normalizeUserSequence(item)
    if (sequence) byId.set(sequence.id, sequence)
  }
  const next = [...byId.values()].slice(0, MAX_USER_SEQUENCES)
  await writeAll(next)
  return next.map((s) => cloneSequence(s))
}

export async function clearUserSequences(): Promise<void> {
  await writeAll([])
}
