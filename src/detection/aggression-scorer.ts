/**
 * @module AggressionScorer
 * @description Scores messages on a 0-100 aggression scale based on
 * sentiment analysis, detected triggers, and linguistic patterns.
 * Classifies severity as low, moderate, high, or critical.
 */

import type { SentimentResult, DetectedTrigger, TriggerSeverity } from '../types';

/** Severity classification with score ranges */
export type AggressionLevel = 'low' | 'moderate' | 'high' | 'critical';

/** Severity weights for trigger contribution to overall score */
const SEVERITY_WEIGHTS: Record<TriggerSeverity, number> = {
  low: 5,
  medium: 10,
  high: 20,
  critical: 30,
};

/**
 * AggressionScorer computes a 0-100 aggression score for a message
 * based on sentiment, triggers, and linguistic features.
 *
 * @example
 * ```typescript
 * const scorer = new AggressionScorer();
 * const score = scorer.score(tokens, sentiment, triggers);
 * console.log(score); // 72
 * console.log(scorer.classify(score)); // 'high'
 * ```
 */
export class AggressionScorer {
  /**
   * Compute the aggression score for a message.
   *
   * @param tokens - Lowercased word tokens
   * @param sentiment - Sentiment analysis result
   * @param triggers - Detected triggers
   * @returns Aggression score from 0 (peaceful) to 100 (highly aggressive)
   */
  score(tokens: string[], sentiment: SentimentResult, triggers: DetectedTrigger[]): number {
    let score = 0;

    // Factor 1: Sentiment contribution (0-30 points)
    // More negative sentiment = higher aggression
    const sentimentContribution = Math.max(0, -sentiment.score * 30);
    score += sentimentContribution;

    // Factor 2: Trigger contribution (0-50 points, capped)
    let triggerContribution = 0;
    for (const trigger of triggers) {
      triggerContribution += SEVERITY_WEIGHTS[trigger.severity];
    }
    score += Math.min(50, triggerContribution);

    // Factor 3: Linguistic intensity markers (0-20 points)
    score += this.scoreLinguisticIntensity(tokens);

    // Clamp to 0-100
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Classify an aggression score into a severity level.
   *
   * @param score - Aggression score (0-100)
   * @returns The severity level classification
   */
  classify(score: number): AggressionLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    return 'low';
  }

  /**
   * Score linguistic intensity markers such as ALL CAPS,
   * excessive punctuation, and emphatic patterns.
   *
   * @param tokens - Word tokens
   * @returns Intensity score (0-20)
   */
  private scoreLinguisticIntensity(tokens: string[]): number {
    let intensity = 0;

    // ALL CAPS words (excluding common acronyms)
    const capsCount = tokens.filter(
      (t) => t.length > 2 && t === t.toUpperCase() && /[A-Z]/.test(t)
    ).length;
    intensity += Math.min(10, capsCount * 2);

    // Excessive exclamation/question marks already handled in sentiment
    // Add points for high negative word density
    const totalWords = tokens.length || 1;
    const negDensity = tokens.filter((t) =>
      ['never', 'always', 'hate', 'terrible', 'worst', 'stupid'].includes(t)
    ).length / totalWords;

    intensity += Math.min(10, negDensity * 50);

    return Math.min(20, intensity);
  }
}
