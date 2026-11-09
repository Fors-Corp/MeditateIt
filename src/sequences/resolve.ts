import { cloneRecipe, getSystemPreset } from '../presets'
import { getPreset } from '../storage'
import type { ResolvedStage, Sequence, SequenceStage } from './types'

export class StageResolveError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StageResolveError'
  }
}

/**
 * Resolve a stage's recipe synchronously when it uses an inline recipe
 * or a system preset id. Throws when the stage needs async user-preset lookup.
 */
export function resolveStageSync(stage: SequenceStage): ResolvedStage {
  if (stage.recipe) {
    return {
      stage,
      recipe: cloneRecipe(stage.recipe),
      recipeLabel: stage.name,
    }
  }

  if (!stage.presetId) {
    throw new StageResolveError(
      `Stage “${stage.id}” has neither recipe nor presetId`,
    )
  }

  const preset = getSystemPreset(stage.presetId)
  if (!preset) {
    throw new StageResolveError(
      `Stage “${stage.id}” preset “${stage.presetId}” is not a system preset; use resolveStage()`,
    )
  }

  return {
    stage,
    recipe: cloneRecipe(preset.recipe),
    recipeLabel: preset.name,
  }
}

/** Resolve a stage, including user presets from storage. */
export async function resolveStage(
  stage: SequenceStage,
): Promise<ResolvedStage> {
  if (stage.recipe) {
    return resolveStageSync(stage)
  }

  if (!stage.presetId) {
    throw new StageResolveError(
      `Stage “${stage.id}” has neither recipe nor presetId`,
    )
  }

  try {
    return resolveStageSync(stage)
  } catch (err) {
    if (!(err instanceof StageResolveError)) throw err
  }

  const preset = await getPreset(stage.presetId)
  if (!preset) {
    throw new StageResolveError(
      `Stage “${stage.id}” could not resolve preset “${stage.presetId}”`,
    )
  }

  return {
    stage,
    recipe: cloneRecipe(preset.recipe),
    recipeLabel: preset.name,
  }
}

export async function resolveSequenceStages(
  sequence: Sequence,
): Promise<ResolvedStage[]> {
  return Promise.all(sequence.stages.map((s) => resolveStage(s)))
}

export function totalDurationSec(sequence: Sequence): number {
  return sequence.stages.reduce((sum, s) => sum + Math.max(0, s.durationSec), 0)
}

export function cloneSequence(sequence: Sequence): Sequence {
  return {
    ...sequence,
    stages: sequence.stages.map((s) => ({
      ...s,
      recipe: s.recipe ? cloneRecipe(s.recipe) : undefined,
    })),
  }
}
