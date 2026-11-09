import { STORAGE_KEYS } from './keys.ts'
import { readJson, writeJson } from './local.ts'
import type { SessionRecord } from './types.ts'

/** Cap stored history so localStorage stays bounded. */
export const SESSION_HISTORY_LIMIT = 100

/** Skip accidental play taps shorter than this. */
export const MIN_SESSION_DURATION_SEC = 1

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeSessionRecord(raw: unknown): SessionRecord | null {
  if (!isObject(raw)) return null
  if (typeof raw.id !== 'string' || raw.id.length === 0) return null
  if (typeof raw.startedAt !== 'string' || raw.startedAt.length === 0) return null
  if (typeof raw.endedAt !== 'string' || raw.endedAt.length === 0) return null
  if (
    typeof raw.durationSec !== 'number' ||
    !Number.isFinite(raw.durationSec) ||
    raw.durationSec < 0
  ) {
    return null
  }

  const presetId =
    typeof raw.presetId === 'string'
      ? raw.presetId
      : raw.presetId === null
        ? null
        : null

  const sequenceId =
    typeof raw.sequenceId === 'string'
      ? raw.sequenceId
      : raw.sequenceId === null
        ? null
        : null

  const presetName =
    typeof raw.presetName === 'string' && raw.presetName.trim().length > 0
      ? raw.presetName.trim()
      : presetId ?? 'Session'

  return {
    id: raw.id,
    startedAt: raw.startedAt,
    endedAt: raw.endedAt,
    durationSec: Math.round(raw.durationSec),
    presetId,
    presetName,
    sequenceId,
  }
}

async function readAll(): Promise<SessionRecord[]> {
  const raw = await readJson<unknown>(STORAGE_KEYS.sessionHistory)
  if (!Array.isArray(raw)) return []
  const out: SessionRecord[] = []
  for (const item of raw) {
    const record = normalizeSessionRecord(item)
    if (record) out.push(record)
  }
  return out
}

async function writeAll(records: SessionRecord[]): Promise<void> {
  await writeJson(STORAGE_KEYS.sessionHistory, records)
}

/** Newest first. */
export async function listSessionHistory(): Promise<SessionRecord[]> {
  const all = await readAll()
  return all.sort((a, b) => (a.endedAt < b.endedAt ? 1 : -1))
}

export type AppendSessionInput = {
  startedAt: string
  endedAt?: string
  presetId: string | null
  presetName: string
  sequenceId?: string | null
  /** Override computed duration (seconds). */
  durationSec?: number
}

/**
 * Append a finished session. Returns null when duration is below the
 * minimum (ignored accidental taps). Newest records are kept within limit.
 */
export async function appendSessionRecord(
  input: AppendSessionInput,
): Promise<SessionRecord | null> {
  const endedAt = input.endedAt ?? new Date().toISOString()
  const startMs = Date.parse(input.startedAt)
  const endMs = Date.parse(endedAt)
  const computed =
    Number.isFinite(startMs) && Number.isFinite(endMs)
      ? Math.max(0, Math.round((endMs - startMs) / 1000))
      : 0
  const durationSec =
    typeof input.durationSec === 'number' && Number.isFinite(input.durationSec)
      ? Math.max(0, Math.round(input.durationSec))
      : computed

  if (durationSec < MIN_SESSION_DURATION_SEC) return null

  const record: SessionRecord = {
    id: crypto.randomUUID(),
    startedAt: input.startedAt,
    endedAt,
    durationSec,
    presetId: input.presetId === 'custom' ? null : input.presetId,
    presetName: input.presetName.trim() || 'Session',
    sequenceId: input.sequenceId ?? null,
  }

  const all = await readAll()
  all.unshift(record)
  await writeAll(all.slice(0, SESSION_HISTORY_LIMIT))
  return record
}

/** Replace the entire history list (used by backup import). */
export async function replaceSessionHistory(
  records: SessionRecord[],
): Promise<SessionRecord[]> {
  const normalized: SessionRecord[] = []
  for (const item of records) {
    const record = normalizeSessionRecord(item)
    if (record) normalized.push(record)
  }
  normalized.sort((a, b) => (a.endedAt < b.endedAt ? 1 : -1))
  const capped = normalized.slice(0, SESSION_HISTORY_LIMIT)
  await writeAll(capped)
  return capped
}

/** Merge by id (imported wins on conflict); keep newest-first within limit. */
export async function mergeSessionHistory(
  incoming: SessionRecord[],
): Promise<SessionRecord[]> {
  const current = await readAll()
  const byId = new Map<string, SessionRecord>()
  for (const r of current) byId.set(r.id, r)
  for (const item of incoming) {
    const record = normalizeSessionRecord(item)
    if (record) byId.set(record.id, record)
  }
  const merged = [...byId.values()].sort((a, b) =>
    a.endedAt < b.endedAt ? 1 : -1,
  )
  const capped = merged.slice(0, SESSION_HISTORY_LIMIT)
  await writeAll(capped)
  return capped
}

export async function clearSessionHistory(): Promise<void> {
  await writeAll([])
}
