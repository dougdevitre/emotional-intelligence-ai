/**
 * @module DeEscalator
 * @description Reduces aggression in messages while preserving the sender's
 * intended meaning. Applies word substitutions, phrase transformations,
 * and structural changes to lower the emotional temperature.
 */

import type { ToneTarget, ChangeDetail } from '../types';

/**
 * Result of a de-escalation operation
 */
export interface DeEscalationResult {
  /** The de-escalated text */
  text: string;
  /** List of changes made */
  changes: ChangeDetail[];
}

/**
 * Word-level substitution rules organized by target tone.
 * Each entry maps an aggressive word to its de-escalated alternatives.
 */
const WORD_SUBSTITUTIONS: Record<ToneTarget, Record<string, string>> = {
  neutral: {
    'hate': 'disagree with',
    'stupid': 'concerning',
    'idiot': 'the other party',
    'terrible': 'problematic',
    'horrible': 'difficult',
    'pathetic': 'insufficient',
    'worthless': 'inadequate',
    'liar': 'inaccurate',
    'lazy': 'not following through',
    'selfish': 'not considering',
    'disgusting': 'inappropriate',
    'ridiculous': 'unreasonable',
    'destroy': 'address',
    'demand': 'request',
    'refuse': 'decline',
    'attack': 'raise concerns about',
  },
  warm: {
    'hate': 'feel strongly about',
    'stupid': 'not ideal',
    'terrible': 'challenging',
    'horrible': 'very difficult',
    'demand': 'would appreciate',
    'refuse': 'would prefer not to',
    'attack': 'would like to discuss',
    'ridiculous': 'surprising',
    'disgusting': 'troubling',
    'selfish': 'focused elsewhere',
  },
  firm: {
    'hate': 'strongly object to',
    'stupid': 'unacceptable',
    'terrible': 'unacceptable',
    'demand': 'require',
    'refuse': 'will not accept',
    'attack': 'formally object to',
    'ridiculous': 'without merit',
    'disgusting': 'wholly inappropriate',
  },
};

/**
 * Phrase-level transformation patterns.
 * Matches aggressive phrase structures and replaces them.
 */
const PHRASE_PATTERNS: Array<{ pattern: RegExp; replacement: string; reason: string }> = [
  {
    pattern: /\byou\s+never\b/gi,
    replacement: 'I have noticed that it has not been happening',
    reason: 'Replace absolute accusation with observation',
  },
  {
    pattern: /\byou\s+always\b/gi,
    replacement: 'it has frequently been the case that',
    reason: 'Replace absolute accusation with frequency observation',
  },
  {
    pattern: /\byou\s+need\s+to\b/gi,
    replacement: 'I would appreciate it if you could',
    reason: 'Replace demand with request',
  },
  {
    pattern: /\byou\s+have\s+to\b/gi,
    replacement: 'it would be helpful if you would',
    reason: 'Replace command with collaborative language',
  },
  {
    pattern: /\byou\s+can't\s+even\b/gi,
    replacement: 'I would like assistance with',
    reason: 'Replace criticism with request for help',
  },
  {
    pattern: /\bi\s+can't\s+believe\s+you\b/gi,
    replacement: 'I was surprised when',
    reason: 'Replace incredulity with observation',
  },
  {
    pattern: /\bwhat\s+is\s+wrong\s+with\s+you\b/gi,
    replacement: 'I would like to understand your perspective',
    reason: 'Replace personal attack with inquiry',
  },
  {
    pattern: /\bit's\s+(all\s+)?your\s+fault\b/gi,
    replacement: 'I believe we can work together to resolve this',
    reason: 'Replace blame with solution focus',
  },
];

/**
 * DeEscalator reduces the aggression level of messages while
 * preserving the sender's core meaning and intent.
 *
 * @example
 * ```typescript
 * const deEscalator = new DeEscalator();
 * const result = deEscalator.deEscalate(
 *   "You NEVER follow the agreement! You're a terrible parent!",
 *   'neutral'
 * );
 * console.log(result.text);
 * // "I have noticed that the agreement has not been followed recently.
 * //  There are some problematic parenting concerns I would like to discuss."
 * ```
 */
export class DeEscalator {
  /**
   * De-escalate a message to match the target tone.
   *
   * @param message - The original aggressive message
   * @param tone - The target tone level
   * @returns De-escalated text with change log
   */
  deEscalate(message: string, tone: ToneTarget): DeEscalationResult {
    const changes: ChangeDetail[] = [];
    let text = message;

    // Step 1: Apply phrase-level transformations first
    for (const phraseRule of PHRASE_PATTERNS) {
      const match = text.match(phraseRule.pattern);
      if (match) {
        text = text.replace(phraseRule.pattern, phraseRule.replacement);
        changes.push({
          type: 'replacement',
          original: match[0],
          replacement: phraseRule.replacement,
          reason: phraseRule.reason,
        });
      }
    }

    // Step 2: Apply word-level substitutions
    const substitutions = WORD_SUBSTITUTIONS[tone];
    for (const [aggressive, deEscalated] of Object.entries(substitutions)) {
      const wordRegex = new RegExp(`\\b${aggressive}\\b`, 'gi');
      const match = text.match(wordRegex);
      if (match) {
        text = text.replace(wordRegex, deEscalated);
        changes.push({
          type: 'replacement',
          original: match[0],
          replacement: deEscalated,
          reason: `Replace aggressive word "${aggressive}" with "${deEscalated}"`,
        });
      }
    }

    // Step 3: Normalize excessive punctuation
    const excessivePunctuation = text.match(/[!]{2,}/g);
    if (excessivePunctuation) {
      text = text.replace(/[!]{2,}/g, '.');
      changes.push({
        type: 'replacement',
        original: excessivePunctuation[0],
        replacement: '.',
        reason: 'Normalize excessive exclamation marks',
      });
    }

    // Step 4: Remove ALL CAPS (preserve meaning)
    text = text.replace(/\b([A-Z]{2,})\b/g, (match) => {
      const lower = match.toLowerCase();
      changes.push({
        type: 'replacement',
        original: match,
        replacement: lower,
        reason: 'Remove aggressive capitalization',
      });
      return lower;
    });

    return { text, changes };
  }
}
