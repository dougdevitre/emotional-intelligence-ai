/**
 * @module BoundaryPreserver
 * @description Ensures that firm boundaries from the original message are
 * maintained in the rewritten version. Prevents over-softening that could
 * undermine the sender's legitimate positions or safety concerns.
 */

/**
 * BoundaryPreserver keeps firm boundaries in place during rewrites,
 * ensuring that de-escalation does not eliminate legitimate assertions.
 *
 * @example
 * ```typescript
 * const preserver = new BoundaryPreserver();
 * const result = preserver.preserve(rewrittenText, originalText);
 * ```
 */
export class BoundaryPreserver {
  /** Boundary phrases that should be preserved or strengthened */
  private boundaryPatterns: RegExp[] = [
    /\bI\s+(will\s+not|won't|cannot|can't)\s+accept\b/i,
    /\bthis\s+is\s+not\s+(acceptable|negotiable)\b/i,
    /\bI\s+need\s+you\s+to\b/i,
    /\bper\s+(the|our)\s+(agreement|order|decree)\b/i,
    /\bthe\s+court\s+order\s+(states|requires)\b/i,
    /\bfor\s+safety\s+reasons\b/i,
    /\bI\s+am\s+not\s+comfortable\b/i,
  ];

  /**
   * Preserve firm boundaries from the original message in the rewrite.
   * If the original contained legitimate boundary statements, ensure
   * they survive the de-escalation process.
   *
   * @param rewritten - The de-escalated text
   * @param original - The original message for reference
   * @returns Text with boundaries preserved
   */
  preserve(rewritten: string, original: string): string {
    let result = rewritten;

    for (const pattern of this.boundaryPatterns) {
      const originalMatch = original.match(pattern);
      const rewrittenMatch = rewritten.match(pattern);

      // If the original had a boundary that was lost in rewriting, restore it
      if (originalMatch && !rewrittenMatch) {
        const boundaryPhrase = this.neutralizeBoundary(originalMatch[0]);
        result = result.trimEnd();
        if (!/[.!?]$/.test(result)) result += '.';
        result += ` ${boundaryPhrase}`;
      }
    }

    return result;
  }

  /**
   * Neutralize a boundary phrase — keep it firm but remove hostility.
   *
   * @param phrase - The original boundary phrase
   * @returns A firm but neutral version
   */
  private neutralizeBoundary(phrase: string): string {
    return phrase
      .replace(/!/g, '.')
      .replace(/[A-Z]{2,}/g, (m) => m.charAt(0) + m.slice(1).toLowerCase());
  }
}
