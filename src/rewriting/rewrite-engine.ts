/**
 * @module RewriteEngine
 * @description Core rewrite engine that transforms aggressive or hostile messages
 * into court-appropriate, de-escalated communication. Orchestrates the DeEscalator,
 * ClarityEnhancer, and ChildFocusFilter to produce tone-targeted rewrites.
 */

import { EmotionDetector } from '../detection/emotion-detector';
import { DeEscalator } from './de-escalator';
import { ClarityEnhancer } from './clarity-enhancer';
import { ChildFocusFilter } from './child-focus-filter';
import { ToneValidator } from '../quality/tone-validator';
import { BoundaryPreserver } from '../quality/boundary-preserver';
import { CourtReadiness } from '../quality/court-readiness';
import type {
  RewriteEngineConfig,
  RewriteResult,
  ToneTarget,
  ChangeSummary,
  ChangeDetail,
} from '../types';

/**
 * Default configuration for the RewriteEngine
 */
const DEFAULT_CONFIG: Required<RewriteEngineConfig> = {
  tone: 'neutral',
  childFocusEnabled: true,
  maxIterations: 3,
  courtReadinessMinimum: 70,
  apiKey: '',
  model: 'gpt-4',
  preserveBoundaries: true,
};

/**
 * RewriteEngine transforms hostile or aggressive messages into
 * court-appropriate, de-escalated communication while preserving
 * the sender's intended meaning and firm boundaries.
 *
 * @example
 * ```typescript
 * const engine = new RewriteEngine({ tone: 'neutral', childFocusEnabled: true });
 * const result = await engine.rewrite("You NEVER let me see the kids!");
 * console.log(result.rewrittenText);
 * // "I would like to discuss adjusting the parenting schedule."
 * ```
 */
export class RewriteEngine {
  private config: Required<RewriteEngineConfig>;
  private detector: EmotionDetector;
  private deEscalator: DeEscalator;
  private clarityEnhancer: ClarityEnhancer;
  private childFocusFilter: ChildFocusFilter;
  private toneValidator: ToneValidator;
  private boundaryPreserver: BoundaryPreserver;
  private courtReadiness: CourtReadiness;

  /**
   * Create a new RewriteEngine.
   * @param config - Configuration for rewrite behavior and tone targeting
   */
  constructor(config: Partial<RewriteEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.detector = new EmotionDetector();
    this.deEscalator = new DeEscalator();
    this.clarityEnhancer = new ClarityEnhancer();
    this.childFocusFilter = new ChildFocusFilter();
    this.toneValidator = new ToneValidator();
    this.boundaryPreserver = new BoundaryPreserver();
    this.courtReadiness = new CourtReadiness();
  }

  /**
   * Rewrite a message to match the target tone while preserving meaning.
   * Iterates through de-escalation, clarity enhancement, and optional
   * child-focus filtering until the target tone is achieved.
   *
   * @param message - The original message to rewrite
   * @param toneOverride - Optional tone override for this specific rewrite
   * @returns Complete rewrite result with analysis and scoring
   */
  async rewrite(message: string, toneOverride?: ToneTarget): Promise<RewriteResult> {
    const tone = toneOverride || this.config.tone;
    const originalAnalysis = await this.detector.analyze(message);
    const changes: ChangeDetail[] = [];

    let currentText = message;
    let iteration = 0;
    let toneAchieved = false;

    while (iteration < this.config.maxIterations && !toneAchieved) {
      iteration++;

      // Step 1: De-escalate aggression
      const deEscalated = this.deEscalator.deEscalate(currentText, tone);
      if (deEscalated.text !== currentText) {
        changes.push(...deEscalated.changes);
        currentText = deEscalated.text;
      }

      // Step 2: Enhance clarity
      const clarified = this.clarityEnhancer.enhance(currentText);
      if (clarified.text !== currentText) {
        changes.push(...clarified.changes);
        currentText = clarified.text;
      }

      // Step 3: Apply child-focus filter if enabled
      if (this.config.childFocusEnabled) {
        const childFocused = this.childFocusFilter.apply(currentText);
        if (childFocused.text !== currentText) {
          changes.push(...childFocused.changes);
          currentText = childFocused.text;
        }
      }

      // Step 4: Preserve boundaries
      if (this.config.preserveBoundaries) {
        currentText = this.boundaryPreserver.preserve(currentText, message);
      }

      // Step 5: Validate tone
      toneAchieved = this.toneValidator.validate(currentText, tone);
    }

    // Final analysis of rewritten message
    const rewrittenAnalysis = await this.detector.analyze(currentText);
    const courtResult = this.courtReadiness.evaluate(currentText);

    const changeSummary: ChangeSummary = {
      triggersAddressed: originalAnalysis.triggers.length - rewrittenAnalysis.triggers.length,
      aggressionReduction: originalAnalysis.aggressionScore - rewrittenAnalysis.aggressionScore,
      changes,
    };

    return {
      id: `rw-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      originalText: message,
      rewrittenText: currentText,
      toneTarget: tone,
      toneAchieved,
      iterations: iteration,
      boundariesPreserved: this.config.preserveBoundaries,
      courtReadinessScore: courtResult.score,
      changeSummary,
      originalAnalysis,
      rewrittenAnalysis,
      rewrittenAt: new Date(),
    };
  }

  /**
   * Rewrite multiple messages in batch.
   *
   * @param messages - Array of messages to rewrite
   * @param concurrency - Maximum concurrent rewrites
   * @returns Array of rewrite results
   */
  async rewriteBatch(messages: string[], concurrency: number = 3): Promise<RewriteResult[]> {
    const results: RewriteResult[] = [];
    for (let i = 0; i < messages.length; i += concurrency) {
      const batch = messages.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map((m) => this.rewrite(m)));
      results.push(...batchResults);
    }
    return results;
  }

  /**
   * Update the engine configuration.
   * @param config - Partial configuration to merge
   */
  updateConfig(config: Partial<RewriteEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
