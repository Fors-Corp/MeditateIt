import { messages } from '../i18n/index.ts'
import { STORAGE_KEYS } from './keys.ts'
import { readJson, writeJson } from './local.ts'

/** null = no time limit (count cap only). */
export type HistoryRetentionDays = 7 | 30 | 90 | 365 | null

export const HISTORY_RETENTION_DAY_OPTIONS: readonly HistoryRetentionDays[] = [
  null,
  7,
  30,
  90,
  365,
] as const

const ALLOWED = new Set<number>([7, 30, 90, 365])

export function normalizeHistoryRetentionDays(
  raw: unknown,
): HistoryRetentionDays {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'number' && ALLOWED.has(raw)) {
    return raw as 7 | 30 | 90 | 365
  }
  if (typeof raw === 'object' && raw !== null) {
    const days = (raw as { days?: unknown }).days
    if (days === null) return null
    if (typeof days === 'number' && ALLOWED.has(days)) {
      return days as 7 | 30 | 90 | 365
    }
  }
  return null
}

export async function loadHistoryRetentionDays(): Promise<HistoryRetentionDays> {
  const raw = await readJson<unknown>(STORAGE_KEYS.historyRetention)
  return normalizeHistoryRetentionDays(raw)
}

export async function saveHistoryRetentionDays(
  days: HistoryRetentionDays,
): Promise<HistoryRetentionDays> {
  const next = normalizeHistoryRetentionDays(days)
  await writeJson(STORAGE_KEYS.historyRetention, { days: next })
  return next
}

export function labelForHistoryRetention(days: HistoryRetentionDays): string {
  if (days === null) return messages.settings.retentionForever
  return messages.settings.retentionDays(days)
}
