/**
 * @module @justice-os/emotional-ai/types
 * @description Core type definitions for the Emotional Intelligence AI system.
 * Covers emotion detection, message rewriting, and quality validation.
 */

/** Supported tone targets for message rewriting */
export type ToneTarget = 'neutral' | 'warm' | 'firm';

/** Severity classification for detected triggers */
export type TriggerSeverity = 'low' | 'medium' | 'high' | 'critical';

/** Types of emotional triggers detected in messages */
export type TriggerType =
  | 'accusation'
  | 'threat'
  | 'manipulation'
  | 'contempt'
  | 'absolute_language'
  | 'personal_attack'
  | 'passive_aggression'
  | 'sarcasm'
  | 'blame_shifting'
  | 'gaslighting';

/** Dominant emotion categories */
export type EmotionCategory =
  | 'anger'
  | 'fear'
  | 'sadness'
  | 'disgust'
  | 'surprise'
  | 'neutral'
  | 'frustration'
  | 'contempt'
  | 'anxiety';

/** Role of the message author in the legal context */
export type AuthorRole = 'co-parent' | 'attorney' | 'mediator' | 'guardian_ad_litem' | 'advocate';

/**
 * Configuration for the EmotionDetector
 */
export interface EmotionDetectorConfig {
  /** Minimum aggression score to flag a message (0-100) */
  aggressionThreshold?: number;
  /** Whether to include word-level analysis */
  wordLevelAnalysis?: boolean;
  /** Custom trigger word lists to extend defaults */
  customTriggerWords?: Record<TriggerType, string[]>;
  /** Language model to use for advanced detection */
  model?: string;
}

/**
 * Result of sentiment analysis on a message
 */
export interface SentimentResult {
  /** Overall sentiment score from -1.0 (very negative) to 1.0 (very positive) */
  score: number;
  /** Comparative score normalized by word count */
  comparative: number;
  /** Words that contributed positively */
  positiveWords: string[];
  /** Words that contributed negatively */
  negativeWords: string[];
}

/**
 * A single identified trigger within a message
 */
export interface DetectedTrigger {
  /** Unique identifier */
  id: string;
  /** Classification of the trigger */
  type: TriggerType;
  /** How severe this trigger is */
  severity: TriggerSeverity;
  /** The text that matched */
  matchedText: string;
  /** Start character index in the original message */
  startIndex: number;
  /** End character index in the original message */
  endIndex: number;
  /** Suggested replacement or mitigation */
  suggestion?: string;
}

/**
 * Complete emotion analysis result for a message
 */
export interface EmotionAnalysis {
  /** Unique analysis ID */
  id: string;
  /** The original message that was analyzed */
  originalMessage: string;
  /** Sentiment analysis result */
  sentiment: SentimentResult;
  /** Aggression score from 0 (peaceful) to 100 (highly aggressive) */
  aggressionScore: number;
  /** The dominant emotion detected */
  dominantEmotion: EmotionCategory;
  /** All emotions detected with their confidence scores */
  emotionScores: Record<EmotionCategory, number>;
  /** Identified triggers in the message */
  triggers: DetectedTrigger[];
  /** Whether the message exceeds the aggression threshold */
  flagged: boolean;
  /** Human-readable summary of the analysis */
  summary: string;
  /** Timestamp of analysis */
  analyzedAt: Date;
}

/**
 * Configuration for the RewriteEngine
 */
export interface RewriteEngineConfig {
  /** Target tone for the rewrite */
  tone: ToneTarget;
  /** Whether to apply the child-focus filter */
  childFocusEnabled?: boolean;
  /** Maximum number of rewrite iterations */
  maxIterations?: number;
  /** Minimum court readiness score to accept */
  courtReadinessMinimum?: number;
  /** OpenAI API key for LLM-powered rewriting */
  apiKey?: string;
  /** LLM model to use */
  model?: string;
  /** Whether to preserve firm boundaries */
  preserveBoundaries?: boolean;
}

/**
 * Result of a message rewrite operation
 */
export interface RewriteResult {
  /** Unique rewrite ID */
  id: string;
  /** The original message */
  originalText: string;
  /** The rewritten message */
  rewrittenText: string;
  /** The tone that was targeted */
  toneTarget: ToneTarget;
  /** Whether the target tone was achieved */
  toneAchieved: boolean;
  /** Number of rewrite iterations performed */
  iterations: number;
  /** Whether firm boundaries were preserved */
  boundariesPreserved: boolean;
  /** Court readiness score of the rewritten message (0-100) */
  courtReadinessScore: number;
  /** Summary of changes made */
  changeSummary: ChangeSummary;
  /** Emotion analysis of the original message */
  originalAnalysis: EmotionAnalysis;
  /** Emotion analysis of the rewritten message */
  rewrittenAnalysis: EmotionAnalysis;
  /** Timestamp of rewrite */
  rewrittenAt: Date;
}

/**
 * Summary of changes made during rewriting
 */
export interface ChangeSummary {
  /** Number of trigger phrases removed or replaced */
  triggersAddressed: number;
  /** Aggression score reduction */
  aggressionReduction: number;
  /** Specific changes made */
  changes: ChangeDetail[];
}

/**
 * A single change made during rewriting
 */
export interface ChangeDetail {
  /** What type of change was made */
  type: 'removal' | 'replacement' | 'restructure' | 'addition';
  /** The original text */
  original: string;
  /** The replacement text */
  replacement: string;
  /** Why this change was made */
  reason: string;
}

/**
 * Court readiness evaluation result
 */
export interface CourtReadinessResult {
  /** Overall court readiness score (0-100) */
  score: number;
  /** Whether the message passes court readiness */
  passes: boolean;
  /** Breakdown of scoring factors */
  factors: CourtReadinessFactor[];
  /** Specific recommendations for improvement */
  recommendations: string[];
}

/**
 * Individual factor in court readiness scoring
 */
export interface CourtReadinessFactor {
  /** Name of the factor */
  name: string;
  /** Score for this factor (0-100) */
  score: number;
  /** Weight of this factor in the overall score */
  weight: number;
  /** Description of the factor */
  description: string;
}

/**
 * Configuration for a tone profile
 */
export interface ToneProfile {
  /** Unique tone name */
  name: ToneTarget;
  /** Description of this tone */
  description: string;
  /** Maximum aggression score allowed */
  aggressionCeiling: number;
  /** Minimum formality score required */
  formalityFloor: number;
  /** Whether child-focused framing is required */
  childFocusRequired: boolean;
  /** Word substitution mappings */
  wordSubstitutions: Record<string, string>;
  /** Phrase pattern rules */
  phrasePatterns: PhrasePattern[];
}

/**
 * A pattern rule for phrase-level transformations
 */
export interface PhrasePattern {
  /** Regex pattern to match */
  pattern: string;
  /** Replacement template */
  replacement: string;
  /** Description of what this pattern addresses */
  description: string;
}

/**
 * Options for batch processing multiple messages
 */
export interface BatchOptions {
  /** Maximum concurrent processing */
  concurrency?: number;
  /** Whether to stop on first error */
  stopOnError?: boolean;
  /** Progress callback */
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Result of batch processing
 */
export interface BatchResult {
  /** Total messages processed */
  total: number;
  /** Successfully rewritten */
  succeeded: number;
  /** Failed to rewrite */
  failed: number;
  /** Individual results */
  results: RewriteResult[];
  /** Any errors encountered */
  errors: Array<{ index: number; message: string; error: string }>;
}
