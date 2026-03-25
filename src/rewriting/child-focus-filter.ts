/**
 * @module ChildFocusFilter
 * @description Ensures communication is framed around children's needs
 * and well-being rather than adult conflict. Transforms adversarial
 * parent-vs-parent language into child-centered communication.
 */

import type { ChangeDetail } from '../types';

/**
 * Result of applying the child-focus filter
 */
export interface ChildFocusResult {
  /** The child-focused text */
  text: string;
  /** List of changes made */
  changes: ChangeDetail[];
}

/**
 * Patterns that reframe adult-centric language to child-centered language
 */
const CHILD_FOCUS_PATTERNS: Array<{ pattern: RegExp; replacement: string; reason: string }> = [
  {
    pattern: /\bmy\s+kids?\b/gi,
    replacement: 'our children',
    reason: 'Use inclusive language for shared children',
  },
  {
    pattern: /\bmy\s+time\s+with\s+(the\s+)?kids?\b/gi,
    replacement: "the children's time with me",
    reason: 'Frame parenting time from the child perspective',
  },
  {
    pattern: /\byour\s+time\s+with\s+(the\s+)?kids?\b/gi,
    replacement: "the children's time with you",
    reason: 'Frame parenting time from the child perspective',
  },
  {
    pattern: /\bi\s+want\s+(the\s+)?kids?\b/gi,
    replacement: 'I believe the children would benefit from',
    reason: 'Reframe desires in terms of child benefit',
  },
  {
    pattern: /\byou\s+took\s+(the\s+)?kids?\b/gi,
    replacement: 'the children were',
    reason: 'Remove adversarial framing around children',
  },
  {
    pattern: /\b(custody|visitation)\s+rights?\b/gi,
    replacement: 'parenting time',
    reason: 'Use modern child-focused terminology',
  },
];

/**
 * ChildFocusFilter ensures that communications are framed around
 * children's needs rather than adult conflict.
 *
 * @example
 * ```typescript
 * const filter = new ChildFocusFilter();
 * const result = filter.apply("I want my kids this weekend.");
 * console.log(result.text);
 * // "I believe the children would benefit from time with me this weekend."
 * ```
 */
export class ChildFocusFilter {
  /**
   * Apply the child-focus filter to a message.
   *
   * @param message - The text to transform
   * @returns Child-focused text with change log
   */
  apply(message: string): ChildFocusResult {
    const changes: ChangeDetail[] = [];
    let text = message;

    for (const rule of CHILD_FOCUS_PATTERNS) {
      const match = text.match(rule.pattern);
      if (match) {
        text = text.replace(rule.pattern, rule.replacement);
        changes.push({
          type: 'replacement',
          original: match[0],
          replacement: rule.replacement,
          reason: rule.reason,
        });
      }
    }

    return { text, changes };
  }
}
