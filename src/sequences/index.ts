/**
 * Multi-stage sequences — system templates + stage resolution.
 * User sequence persistence lives in `src/storage/userSequences`.
 * Player UI lives in `src/components/sequence` + `src/pages/SequencePage`.
 */

export type { ResolvedStage, Sequence, SequenceStage } from './types.ts'

export {
  StageResolveError,
  cloneSequence,
  resolveSequenceStages,
  resolveStage,
  resolveStageSync,
  totalDurationSec,
} from './resolve.ts'

export {
  SYSTEM_SEQUENCES,
  formatSequenceDuration,
  getSystemSequence,
  isSystemSequenceId,
  listSystemSequences,
} from './system.ts'
