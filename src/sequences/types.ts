/** Multi-stage session sequences (Wave 3). */

import type { PresetSource, SessionRecipe } from '../presets'

/**
 * One timed stage. Provide either an inline `recipe` or a `presetId`
 * (system or user) — not both required; recipe wins when both exist.
 */
export interface SequenceStage {
  id: string
  name: string
  durationSec: number
  recipe?: SessionRecipe
  presetId?: string
}

export interface Sequence {
  id: string
  name: string
  /** Short home-list blurb */
  summary: string
  source: PresetSource
  stages: SequenceStage[]
  /** ISO timestamp for user sequences; stable for system */
  updatedAt: string
}

export interface ResolvedStage {
  stage: SequenceStage
  recipe: SessionRecipe
  /** Display name of the recipe source when resolved from a preset */
  recipeLabel: string
}
