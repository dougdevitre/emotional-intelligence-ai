/**
 * @module TriggerIdentifier
 * @description Identifies inflammatory language, threats, manipulation,
 * and other emotional triggers in legal communications. Uses pattern
 * matching and keyword analysis to flag problematic phrases.
 */

import type { DetectedTrigger, TriggerType, TriggerSeverity } from '../types';

/**
 * Pattern definition for trigger detection
 */
interface TriggerPattern {
  /** Regex pattern to match */
  pattern: RegExp;
  /** Type of trigger this pattern detects */
  type: TriggerType;
  /** Default severity for this pattern */
  severity: TriggerSeverity;
  /** Suggested replacement or mitigation */
  suggestion: string;
}

/**
 * Built-in trigger patterns for common hostile legal communication patterns
 */
const DEFAULT_PATTERNS: TriggerPattern[] = [
  // Absolute language
  { pattern: /\b(you\s+)?never\b/gi, type: 'absolute_language', severity: 'medium', suggestion: 'Replace with specific instances rather than absolutes' },
  { pattern: /\b(you\s+)?always\b/gi, type: 'absolute_language', severity: 'medium', suggestion: 'Replace with specific instances rather than absolutes' },
  { pattern: /\bevery\s+single\s+time\b/gi, type: 'absolute_language', severity: 'medium', suggestion: 'Cite specific dates or instances' },

  // Personal attacks
  { pattern: /\byou('re|\s+are)\s+(a\s+)?(terrible|horrible|worst|bad)\s+(parent|mother|father|person)\b/gi, type: 'personal_attack', severity: 'high', suggestion: 'Focus on specific behaviors rather than character judgments' },
  { pattern: /\b(idiot|stupid|moron|incompetent|pathetic|worthless|loser)\b/gi, type: 'personal_attack', severity: 'high', suggestion: 'Remove personal insults entirely' },

  // Threats
  { pattern: /\b(i('ll|\s+will)\s+)(destroy|ruin|take\s+everything|make\s+you\s+pay)\b/gi, type: 'threat', severity: 'critical', suggestion: 'Remove threatening language; state desired outcomes instead' },
  { pattern: /\byou('ll|\s+will)\s+(regret|pay\s+for|be\s+sorry)\b/gi, type: 'threat', severity: 'critical', suggestion: 'Remove threats; focus on resolution' },
  { pattern: /\bmy\s+(lawyer|attorney)\s+will\b/gi, type: 'threat', severity: 'medium', suggestion: 'Let your attorney communicate legal positions directly' },

  // Manipulation
  { pattern: /\bif\s+you\s+(really|actually|truly)\s+(loved|cared)\b/gi, type: 'manipulation', severity: 'high', suggestion: 'State your needs directly without emotional leverage' },
  { pattern: /\bthe\s+kids?\s+(want|need|prefer)\s+(me|to\s+be\s+with\s+me)\b/gi, type: 'manipulation', severity: 'medium', suggestion: 'Let children speak for themselves through appropriate channels' },

  // Contempt
  { pattern: /\b(pathetic|laughable|joke|what\s+a\s+joke)\b/gi, type: 'contempt', severity: 'high', suggestion: 'Express disagreement without contempt' },
  { pattern: /\bgood\s+luck\s+with\s+that\b/gi, type: 'passive_aggression', severity: 'low', suggestion: 'Remove dismissive language' },

  // Blame shifting
  { pattern: /\b(it's|this\s+is)\s+(all\s+)?(your|you)\s+fault\b/gi, type: 'blame_shifting', severity: 'medium', suggestion: 'Focus on solutions rather than assigning blame' },
  { pattern: /\byou\s+made\s+me\b/gi, type: 'blame_shifting', severity: 'medium', suggestion: 'Take ownership of your own reactions' },

  // Gaslighting
  { pattern: /\bthat\s+(never|didn't)\s+happen/gi, type: 'gaslighting', severity: 'high', suggestion: 'Acknowledge different perspectives without denying reality' },
  { pattern: /\byou('re|\s+are)\s+(crazy|insane|delusional|imagining)\b/gi, type: 'gaslighting', severity: 'critical', suggestion: 'Remove language that questions mental state' },

  // Sarcasm
  { pattern: /\b(oh\s+)?sure[,.]?\s+(right|whatever)\b/gi, type: 'sarcasm', severity: 'low', suggestion: 'State your actual position directly' },
  { pattern: /\bparent\s+of\s+the\s+year\b/gi, type: 'sarcasm', severity: 'medium', suggestion: 'Address specific parenting concerns directly' },
];

/**
 * TriggerIdentifier finds inflammatory language, threats, manipulation,
 * and other emotional triggers within messages.
 *
 * @example
 * ```typescript
 * const identifier = new TriggerIdentifier();
 * const triggers = identifier.identify("You NEVER follow the agreement!");
 * console.log(triggers[0].type); // 'absolute_language'
 * ```
 */
export class TriggerIdentifier {
  private patterns: TriggerPattern[];

  /**
   * Create a new TriggerIdentifier.
   * @param customWords - Additional trigger words organized by type
   */
  constructor(customWords: Partial<Record<TriggerType, string[]>> = {}) {
    this.patterns = [...DEFAULT_PATTERNS];
    this.registerCustomWords(customWords);
  }

  /**
   * Identify all triggers in a message.
   *
   * @param message - The text to scan for triggers
   * @returns Array of detected triggers with positions and suggestions
   */
  identify(message: string): DetectedTrigger[] {
    const triggers: DetectedTrigger[] = [];

    for (const pattern of this.patterns) {
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(message)) !== null) {
        triggers.push({
          id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: pattern.type,
          severity: pattern.severity,
          matchedText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          suggestion: pattern.suggestion,
        });
      }
    }

    // Sort by position in the message
    triggers.sort((a, b) => a.startIndex - b.startIndex);

    return triggers;
  }

  /**
   * Register custom trigger words to extend the default patterns.
   *
   * @param customWords - Words organized by trigger type
   */
  private registerCustomWords(customWords: Partial<Record<TriggerType, string[]>>): void {
    for (const [type, words] of Object.entries(customWords)) {
      if (words && words.length > 0) {
        const wordPattern = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        this.patterns.push({
          pattern: new RegExp(`\\b(${wordPattern})\\b`, 'gi'),
          type: type as TriggerType,
          severity: 'medium',
          suggestion: `Consider rephrasing`,
        });
      }
    }
  }
}
