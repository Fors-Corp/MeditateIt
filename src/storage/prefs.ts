import {
  DEFAULT_FADE_IN_SEC,
  DEFAULT_FADE_OUT_SEC,
  normalizeRecipe,
  type UserPrefs,
} from '../presets/index.ts'
import { STORAGE_KEYS } from './keys.ts'
import { readJson, writeJson } from './local.ts'

export const DEFAULT_PREFS: Readonly<UserPrefs> = Object.freeze({
  lastPresetId: null,
  lastRecipe: null,
  masterVolume: 0.45,
  defaultFadeInSec: DEFAULT_FADE_IN_SEC,
  defaultFadeOutSec: DEFAULT_FADE_OUT_SEC,
  preferHeadphonesAck: false,
  reduceMotion: false,
  defaultDurationSec: null,
})

function clamp01(n: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback
  return Math.min(1, Math.max(0, n))
}

function clampNonNeg(n: number, fallback: number): number {
  if (!Number.isFinite(n) || n < 0) return fallback
  return n
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Soft-normalize stored prefs; unknown shapes fall back field-by-field. */
export function normalizePrefs(raw: unknown): UserPrefs {
  const base = { ...DEFAULT_PREFS }
  if (!isObject(raw)) return base

  const lastPresetId =
    typeof raw.lastPresetId === 'string'
      ? raw.lastPresetId
      : raw.lastPresetId === null
        ? null
        : base.lastPresetId

  // Never persist a raw object graph from JSON import / localStorage.
  const lastRecipe = normalizeRecipe(raw.lastRecipe)

  const defaultDurationSec =
    typeof raw.defaultDurationSec === 'number' &&
    Number.isFinite(raw.defaultDurationSec) &&
    raw.defaultDurationSec >= 0
      ? raw.defaultDurationSec
      : raw.defaultDurationSec === null
        ? null
        : base.defaultDurationSec

  return {
    lastPresetId,
    lastRecipe,
    masterVolume: clamp01(
      typeof raw.masterVolume === 'number' ? raw.masterVolume : base.masterVolume,
      base.masterVolume,
    ),
    defaultFadeInSec: clampNonNeg(
      typeof raw.defaultFadeInSec === 'number'
        ? raw.defaultFadeInSec
        : base.defaultFadeInSec,
      base.defaultFadeInSec,
    ),
    defaultFadeOutSec: clampNonNeg(
      typeof raw.defaultFadeOutSec === 'number'
        ? raw.defaultFadeOutSec
        : base.defaultFadeOutSec,
      base.defaultFadeOutSec,
    ),
    preferHeadphonesAck:
      typeof raw.preferHeadphonesAck === 'boolean'
        ? raw.preferHeadphonesAck
        : base.preferHeadphonesAck,
    reduceMotion:
      typeof raw.reduceMotion === 'boolean'
        ? raw.reduceMotion
        : base.reduceMotion,
    defaultDurationSec,
  }
}

export async function loadPrefs(): Promise<UserPrefs> {
  const raw = await readJson<unknown>(STORAGE_KEYS.prefs)
  return normalizePrefs(raw)
}

export async function savePrefs(prefs: UserPrefs): Promise<UserPrefs> {
  const next = normalizePrefs(prefs)
  await writeJson(STORAGE_KEYS.prefs, next)
  return next
}

export async function updatePrefs(
  patch: Partial<UserPrefs>,
): Promise<UserPrefs> {
  const current = await loadPrefs()
  return savePrefs({ ...current, ...patch })
}
