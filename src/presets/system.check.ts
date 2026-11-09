/**
 * System preset catalog invariants (count, categories, distinct recipes).
 * Run via `npm test` (scripts/run-checks.ts).
 */
import assert from 'node:assert/strict'
import {
  isPresetCategoryId,
  PRESET_CATEGORY_IDS,
} from './categories.ts'
import {
  getSystemPreset,
  isSystemPresetId,
  listSystemPresets,
  SYSTEM_PRESETS,
} from './system.ts'

const presets = listSystemPresets()

assert.ok(
  presets.length >= 20,
  `expected ≥20 system presets, got ${presets.length}`,
)
assert.equal(SYSTEM_PRESETS.length, presets.length)

const ids = new Set<string>()
const recipeFingerprints = new Set<string>()

for (const preset of presets) {
  assert.equal(preset.source, 'system')
  assert.ok(preset.id.length > 0, 'preset id required')
  assert.ok(!ids.has(preset.id), `duplicate preset id ${preset.id}`)
  ids.add(preset.id)

  assert.ok(
    Array.isArray(preset.categories) && preset.categories.length >= 1,
    `${preset.id} needs ≥1 category`,
  )
  for (const cat of preset.categories!) {
    assert.ok(isPresetCategoryId(cat), `${preset.id} bad category ${cat}`)
  }

  assert.ok(isSystemPresetId(preset.id))
  const resolved = getSystemPreset(preset.id)
  assert.ok(resolved, `getSystemPreset(${preset.id})`)
  assert.equal(resolved!.id, preset.id)
  assert.deepEqual(resolved!.categories, preset.categories)

  const fingerprint = JSON.stringify({
    noise: preset.recipe.noise,
    tone: {
      enabled: preset.recipe.tone.enabled,
      frequencyHz: preset.recipe.tone.frequencyHz,
      solfeggioId: preset.recipe.tone.solfeggioId ?? null,
      eq: preset.recipe.tone.eq ?? null,
    },
    beat: {
      enabled: preset.recipe.beat.enabled,
      mode: preset.recipe.beat.mode,
      carrierHz: preset.recipe.beat.carrierHz,
      beatHz: preset.recipe.beat.beatHz,
      pulseDepth: preset.recipe.beat.pulseDepth ?? null,
      eq: preset.recipe.beat.eq ?? null,
    },
    nature: preset.recipe.nature,
    gains: preset.recipe.gains,
  })
  assert.ok(
    !recipeFingerprints.has(fingerprint),
    `recipe collision for ${preset.id}`,
  )
  recipeFingerprints.add(fingerprint)
}

for (const cat of PRESET_CATEGORY_IDS) {
  const count = presets.filter((p) => p.categories?.includes(cat)).length
  assert.ok(count >= 1, `category ${cat} has no presets`)
}

assert.ok(isSystemPresetId('daily-calm'))
assert.ok(isSystemPresetId('anxiety-softener'))
assert.ok(isSystemPresetId('dusk-hum'))
assert.equal(isSystemPresetId('nope'), false)

console.log(
  `system.check: ok (${presets.length} presets; categories ${PRESET_CATEGORY_IDS.join(', ')})`,
)
