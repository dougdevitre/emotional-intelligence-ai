/**
 * @module @justice-os/emotional-ai
 * @description AI-powered emotional intelligence for legal communication.
 * Detects aggression, de-escalates conflict, and produces court-ready messages.
 *
 * @example
 * ```typescript
 * import { EmotionDetector, RewriteEngine } from '@justice-os/emotional-ai';
 *
 * const detector = new EmotionDetector();
 * const analysis = await detector.analyze('Your hostile message here');
 *
 * const rewriter = new RewriteEngine({ tone: 'neutral' });
 * const result = await rewriter.rewrite('Your hostile message here');
 * ```
 */

export { EmotionDetector } from './detection/emotion-detector';
export { TriggerIdentifier } from './detection/trigger-identifier';
export { AggressionScorer } from './detection/aggression-scorer';

export { RewriteEngine } from './rewriting/rewrite-engine';
export { DeEscalator } from './rewriting/de-escalator';
export { ClarityEnhancer } from './rewriting/clarity-enhancer';
export { ChildFocusFilter } from './rewriting/child-focus-filter';

export { ToneValidator } from './quality/tone-validator';
export { BoundaryPreserver } from './quality/boundary-preserver';
export { CourtReadiness } from './quality/court-readiness';

export type {
  ToneTarget,
  TriggerSeverity,
  TriggerType,
  EmotionCategory,
  AuthorRole,
  EmotionDetectorConfig,
  SentimentResult,
  DetectedTrigger,
  EmotionAnalysis,
  RewriteEngineConfig,
  RewriteResult,
  ChangeSummary,
  ChangeDetail,
  CourtReadinessResult,
  CourtReadinessFactor,
  ToneProfile,
  PhrasePattern,
  BatchOptions,
  BatchResult,
} from './types';
