import {
  loadHistoryRetentionDays,
  type HistoryRetentionDays,
} from './historyRetention.ts'
import { STORAGE_KEYS } from './keys.ts'
import {
  MAX_DURATION_SEC,
  MAX_ID_CHARS,
  MAX_NAME_CHARS,
} from './limits.ts'
import { readJson, writeJson } from './local.ts'
import type { SessionRecord } from './types.ts'

/** Cap stored history so localStorage stays bounded. */
export const SESSION_HISTORY_LIMIT = 100

/** Skip accidental play taps shorter than this. */
export const MIN_SESSION_DURATION_SEC = 1

const MS_PER_DAY = 24 * 60 * 60 * 1000

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max)
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

  const id = truncate(raw.id, MAX_ID_CHARS)
  if (!id) return null

  const presetId =
    typeof raw.presetId === 'string'
      ? truncate(raw.presetId, MAX_ID_CHARS) || null
      : raw.presetId === null
        ? null
        : null

  const sequenceId =
    typeof raw.sequenceId === 'string'
      ? truncate(raw.sequenceId, MAX_ID_CHARS) || null
      : raw.sequenceId === null
        ? null
        : null

  const presetName =
    typeof raw.presetName === 'string' && raw.presetName.trim().length > 0
      ? truncate(raw.presetName.trim(), MAX_NAME_CHARS)
      : truncate(presetId ?? 'Session', MAX_NAME_CHARS)

  return {
    id,
    startedAt: truncate(raw.startedAt, 64),
    endedAt: truncate(raw.endedAt, 64),
    durationSec: Math.min(MAX_DURATION_SEC, Math.round(raw.durationSec)),
    presetId,
    presetName,
    sequenceId,
  }
}

/**
 * Drop records older than the retention window (by endedAt).
 * null retentionDays = no time filter (caller still applies count cap).
 */
export function filterHistoryByRetention(
  records: SessionRecord[],
  retentionDays: HistoryRetentionDays,
  nowMs: number = Date.now(),
): SessionRecord[] {
  if (retentionDays == null) return records
  const cutoff = nowMs - retentionDays * MS_PER_DAY
  return records.filter((r) => {
    const t = Date.parse(r.endedAt)
    return Number.isFinite(t) && t >= cutoff
  })
}

function newestFirst(records: SessionRecord[]): SessionRecord[] {
  return [...records].sort((a, b) => (a.endedAt < b.endedAt ? 1 : -1))
}

function sameIds(a: SessionRecord[], b: SessionRecord[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.id !== b[i]!.id) return false
  }
  return true
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

/**
 * Apply time retention + count cap; rewrite storage when anything drops.
 * Returns newest-first list.
 */
export async function applySessionHistoryRetention(
  nowMs: number = Date.now(),
): Promise<SessionRecord[]> {
  const days = await loadHistoryRetentionDays()
  const all = await readAll()
  const filtered = filterHistoryByRetention(all, days, nowMs)
  const capped = newestFirst(filtered).slice(0, SESSION_HISTORY_LIMIT)
  const prior = newestFirst(all)
  if (!sameIds(prior, capped)) {
    await writeAll(capped)
  }
  return capped
}

/** Newest first; also purges by TTL + count cap. */
export async function listSessionHistory(): Promise<SessionRecord[]> {
  return applySessionHistoryRetention()
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
 * minimum (ignored accidental taps). Newest records are kept within limit
 * and time retention.
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
    durationSec: Math.min(MAX_DURATION_SEC, durationSec),
    presetId:
      input.presetId === 'custom' || input.presetId == null
        ? null
        : truncate(input.presetId, MAX_ID_CHARS) || null,
    presetName: truncate(input.presetName.trim() || 'Session', MAX_NAME_CHARS),
    sequenceId:
      input.sequenceId == null
        ? null
        : truncate(input.sequenceId, MAX_ID_CHARS) || null,
  }

  const days = await loadHistoryRetentionDays()
  const all = await readAll()
  all.unshift(record)
  const filtered = filterHistoryByRetention(all, days)
  await writeAll(newestFirst(filtered).slice(0, SESSION_HISTORY_LIMIT))
  return record
}

/** Replace the entire history list (used by backup import). */
export async function replaceSessionHistory(
  records: SessionRecord[],
): Promise<SessionRecord[]> {
  const days = await loadHistoryRetentionDays()
  const normalized: SessionRecord[] = []
  for (const item of records) {
    const record = normalizeSessionRecord(item)
    if (record) normalized.push(record)
  }
  const filtered = filterHistoryByRetention(normalized, days)
  const capped = newestFirst(filtered).slice(0, SESSION_HISTORY_LIMIT)
  await writeAll(capped)
  return capped
}

/** Merge by id (imported wins on conflict); keep newest-first within limit. */
export async function mergeSessionHistory(
  incoming: SessionRecord[],
): Promise<SessionRecord[]> {
  const days = await loadHistoryRetentionDays()
  const current = await readAll()
  const byId = new Map<string, SessionRecord>()
  for (const r of current) byId.set(r.id, r)
  for (const item of incoming) {
    const record = normalizeSessionRecord(item)
    if (record) byId.set(record.id, record)
  }
  const filtered = filterHistoryByRetention([...byId.values()], days)
  const capped = newestFirst(filtered).slice(0, SESSION_HISTORY_LIMIT)
  await writeAll(capped)
  return capped
}

export async function clearSessionHistory(): Promise<void> {
  await writeAll([])
}
