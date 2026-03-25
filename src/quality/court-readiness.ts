/**
 * @module CourtReadiness
 * @description Evaluates messages for court appropriateness, scoring them
 * across multiple factors including tone, professionalism, factual basis,
 * and emotional neutrality.
 */

import type { CourtReadinessResult, CourtReadinessFactor } from '../types';

/**
 * CourtReadiness scores messages for how appropriate they are
 * for court filings, communications with attorneys, or mediator review.
 *
 * @example
 * ```typescript
 * const cr = new CourtReadiness();
 * const result = cr.evaluate("I would like to discuss adjusting the schedule.");
 * console.log(result.score); // 92
 * console.log(result.passes); // true
 * ```
 */
export class CourtReadiness {
  private minimumScore: number;

  /**
   * Create a CourtReadiness evaluator.
   * @param minimumScore - Minimum score to pass (default: 70)
   */
  constructor(minimumScore: number = 70) {
    this.minimumScore = minimumScore;
  }

  /**
   * Evaluate a message for court readiness.
   *
   * @param message - The message to evaluate
   * @returns Detailed court readiness result with factor breakdown
   */
  evaluate(message: string): CourtReadinessResult {
    const factors: CourtReadinessFactor[] = [
      this.scoreTone(message),
      this.scoreProfessionalism(message),
      this.scoreClarity(message),
      this.scoreEmotionalNeutrality(message),
      this.scoreFactualBasis(message),
    ];

    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedScore = factors.reduce((sum, f) => sum + (f.score * f.weight), 0);
    const score = Math.round(weightedScore / totalWeight);

    const recommendations = this.generateRecommendations(factors);

    return {
      score,
      passes: score >= this.minimumScore,
      factors,
      recommendations,
    };
  }

  private scoreTone(message: string): CourtReadinessFactor {
    let score = 100;
    if (/[!]{2,}/.test(message)) score -= 30;
    if (/[A-Z]{3,}/.test(message)) score -= 20;
    if (/\b(hate|stupid|idiot|pathetic)\b/i.test(message)) score -= 40;
    if (/\b(please|appreciate|respectfully)\b/i.test(message)) score += 5;
    return { name: 'Tone', score: Math.max(0, Math.min(100, score)), weight: 0.3, description: 'Overall tone appropriateness' };
  }

  private scoreProfessionalism(message: string): CourtReadinessFactor {
    let score = 80;
    if (/\b(gonna|wanna|gotta|ain't)\b/i.test(message)) score -= 15;
    if (/\b(Your Honor|respectfully|pursuant)\b/i.test(message)) score += 10;
    if (/[.!?]$/.test(message.trim())) score += 5;
    return { name: 'Professionalism', score: Math.max(0, Math.min(100, score)), weight: 0.2, description: 'Professional language use' };
  }

  private scoreClarity(message: string): CourtReadinessFactor {
    let score = 70;
    const sentences = message.split(/[.!?]+/).filter(Boolean);
    const avgLength = sentences.reduce((s, sent) => s + sent.split(/\s+/).length, 0) / (sentences.length || 1);
    if (avgLength > 30) score -= 20;
    if (avgLength < 20) score += 10;
    return { name: 'Clarity', score: Math.max(0, Math.min(100, score)), weight: 0.2, description: 'Message clarity and readability' };
  }

  private scoreEmotionalNeutrality(message: string): CourtReadinessFactor {
    let score = 100;
    const emotionalWords = message.match(/\b(angry|furious|devastated|heartbroken|livid|terrified)\b/gi);
    if (emotionalWords) score -= emotionalWords.length * 15;
    return { name: 'Emotional Neutrality', score: Math.max(0, Math.min(100, score)), weight: 0.2, description: 'Freedom from emotional language' };
  }

  private scoreFactualBasis(message: string): CourtReadinessFactor {
    let score = 60;
    if (/\b(on|dated?)\s+\d{1,2}[\/\-]\d{1,2}/i.test(message)) score += 15;
    if (/\bper\s+(the|our)\b/i.test(message)) score += 10;
    if (/\b(never|always|every\s+single)\b/i.test(message)) score -= 20;
    return { name: 'Factual Basis', score: Math.max(0, Math.min(100, score)), weight: 0.1, description: 'Grounding in specific facts' };
  }

  private generateRecommendations(factors: CourtReadinessFactor[]): string[] {
    const recs: string[] = [];
    for (const factor of factors) {
      if (factor.score < 60) {
        recs.push(`Improve ${factor.name.toLowerCase()}: ${factor.description}`);
      }
    }
    return recs;
  }
}
