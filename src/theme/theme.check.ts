/**
 * Theme preference normalize / resolve (no DOM).
 * Run via: npm test
 */
import { normalizePrefs } from '../storage/prefs.ts'
import {
  isThemeId,
  normalizeThemePreference,
  resolveThemeId,
  THEME_IDS,
} from './ids.ts'

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

assert(THEME_IDS.length === 5, 'five named themes')
assert(isThemeId('light') && isThemeId('forest'), 'known ids')
assert(!isThemeId('system') && !isThemeId('neon'), 'rejects unknown')

assert(normalizeThemePreference(null) === null, 'null → system')
assert(normalizeThemePreference('system') === null, 'system → null')
assert(normalizeThemePreference('dusk') === 'dusk', 'named kept')
assert(normalizeThemePreference('neon') === null, 'junk → system')
assert(normalizeThemePreference(12) === null, 'non-string → system')

assert(resolveThemeId('mist', true) === 'mist', 'named wins over dark OS')
assert(resolveThemeId(null, true) === 'dark', 'system + dark OS')
assert(resolveThemeId(null, false) === 'light', 'system + light OS')

const fromPrefs = normalizePrefs({ themeId: 'forest', masterVolume: 0.2 })
assert(fromPrefs.themeId === 'forest', 'prefs keep forest')
assert(normalizePrefs({}).themeId === null, 'prefs default system')
assert(normalizePrefs({ themeId: 'nope' }).themeId === null, 'prefs junk → null')

console.log('theme.check: ok')
