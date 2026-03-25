/**
 * @module ClarityEnhancer
 * @description Simplifies message structure, removes ambiguity,
 * and improves readability for court and co-parenting communications.
 */

import type { ChangeDetail } from '../types';

/**
 * Result of a clarity enhancement operation
 */
export interface ClarityResult {
  /** The enhanced text */
  text: string;
  /** List of changes made */
  changes: ChangeDetail[];
}

/**
 * ClarityEnhancer simplifies, structures, and disambiguates messages
 * to improve their readability and effectiveness.
 *
 * @example
 * ```typescript
 * const enhancer = new ClarityEnhancer();
 * const result = enhancer.enhance("Well like I said before you know...");
 * ```
 */
export class ClarityEnhancer {
  /**
   * Enhance the clarity of a message.
   *
   * @param message - The text to enhance
   * @returns Enhanced text with change log
   */
  enhance(message: string): ClarityResult {
    const changes: ChangeDetail[] = [];
    let text = message;

    // Remove filler words and hedging
    const fillers = [
      { pattern: /\b(like,?\s+)/gi, replacement: '', reason: 'Remove filler word' },
      { pattern: /\b(you know,?\s+)/gi, replacement: '', reason: 'Remove filler phrase' },
      { pattern: /\b(basically,?\s+)/gi, replacement: '', reason: 'Remove hedging word' },
      { pattern: /\b(well,?\s+)/gi, replacement: '', reason: 'Remove filler word' },
      { pattern: /\b(I mean,?\s+)/gi, replacement: '', reason: 'Remove filler phrase' },
      { pattern: /\b(just saying,?\s*)/gi, replacement: '', reason: 'Remove passive filler' },
    ];

    for (const filler of fillers) {
      const match = text.match(filler.pattern);
      if (match) {
        text = text.replace(filler.pattern, filler.replacement);
        changes.push({
          type: 'removal',
          original: match[0],
          replacement: filler.replacement,
          reason: filler.reason,
        });
      }
    }

    // Normalize whitespace
    text = text.replace(/\s{2,}/g, ' ').trim();

    // Ensure proper sentence endings
    if (text.length > 0 && !/[.!?]$/.test(text)) {
      text += '.';
      changes.push({
        type: 'addition',
        original: '',
        replacement: '.',
        reason: 'Add proper sentence ending',
      });
    }

    return { text, changes };
  }
}
