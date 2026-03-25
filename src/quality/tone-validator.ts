/**
 * @module ToneValidator
 * @description Validates that a rewritten message achieves the target tone.
 * Checks aggression level, formality, and overall appropriateness.
 */

import type { ToneTarget } from '../types';

/** Tone thresholds for validation */
const TONE_THRESHOLDS: Record<ToneTarget, { maxAggression: number; minFormality: number }> = {
  neutral: { maxAggression: 25, minFormality: 50 },
  warm: { maxAggression: 15, minFormality: 30 },
  firm: { maxAggression: 35, minFormality: 70 },
};

/**
 * ToneValidator verifies that a rewritten message meets the target tone criteria.
 *
 * @example
 * ```typescript
 * const validator = new ToneValidator();
 * const isValid = validator.validate("I would like to discuss...", 'neutral');
 * ```
 */
export class ToneValidator {
  /**
   * Validate that a message matches the target tone.
   *
   * @param message - The message to validate
   * @param targetTone - The desired tone
   * @returns True if the message achieves the target tone
   */
  validate(message: string, targetTone: ToneTarget): boolean {
    const threshold = TONE_THRESHOLDS[targetTone];
    const aggressionEstimate = this.estimateAggression(message);
    const formalityEstimate = this.estimateFormality(message);

    return aggressionEstimate <= threshold.maxAggression &&
           formalityEstimate >= threshold.minFormality;
  }

  /**
   * Quick aggression estimate without full analysis.
   * @param message - Text to evaluate
   * @returns Estimated aggression score (0-100)
   */
  private estimateAggression(message: string): number {
    const aggressiveIndicators = [
      /[!]{2,}/, /[A-Z]{3,}/, /\b(never|always|hate|terrible|worst)\b/i,
      /\b(stupid|idiot|pathetic)\b/i, /\byou\s+(need|have)\s+to\b/i,
    ];
    let score = 0;
    for (const indicator of aggressiveIndicators) {
      if (indicator.test(message)) score += 15;
    }
    return Math.min(100, score);
  }

  /**
   * Quick formality estimate.
   * @param message - Text to evaluate
   * @returns Estimated formality score (0-100)
   */
  private estimateFormality(message: string): number {
    const formalIndicators = [
      /\bI would (like|appreciate)\b/i, /\bplease\b/i, /\bthank you\b/i,
      /\bregarding\b/i, /\bI believe\b/i, /\bit would be helpful\b/i,
    ];
    let score = 30; // baseline
    for (const indicator of formalIndicators) {
      if (indicator.test(message)) score += 12;
    }
    return Math.min(100, score);
  }
}
