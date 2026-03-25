/**
 * @module EmotionDetector
 * @description Core emotion detection engine that analyzes messages for sentiment,
 * emotional triggers, and aggression levels. Combines lexicon-based analysis with
 * pattern matching to provide comprehensive emotional profiling of legal communications.
 */

import { TriggerIdentifier } from './trigger-identifier';
import { AggressionScorer } from './aggression-scorer';
import type {
  EmotionDetectorConfig,
  EmotionAnalysis,
  SentimentResult,
  EmotionCategory,
} from '../types';

/**
 * Default configuration for the EmotionDetector
 */
const DEFAULT_CONFIG: Required<EmotionDetectorConfig> = {
  aggressionThreshold: 60,
  wordLevelAnalysis: true,
  customTriggerWords: {} as Record<string, string[]>,
  model: 'default',
};

/**
 * Negative sentiment word list with weighted scores.
 * Words commonly found in hostile legal communications.
 */
const NEGATIVE_LEXICON: Record<string, number> = {
  // High-aggression words (-3 to -5)
  hate: -4, destroy: -4, attack: -3, threaten: -5,
  never: -2, always: -2, terrible: -3, worst: -3,
  liar: -4, pathetic: -3, disgusting: -4, worthless: -4,
  stupid: -3, incompetent: -3, useless: -3, failure: -3,
  // Medium-aggression words (-1 to -2)
  wrong: -1, unfair: -2, refuse: -2, blame: -2,
  demand: -2, angry: -2, frustrated: -1, upset: -1,
  impossible: -2, ridiculous: -2, unacceptable: -2,
  // Passive-aggressive markers (-1)
  fine: -1, whatever: -1, apparently: -1, supposedly: -1,
  obviously: -1, clearly: -1,
};

/**
 * Positive sentiment word list with weighted scores.
 */
const POSITIVE_LEXICON: Record<string, number> = {
  agree: 2, cooperate: 3, together: 2, please: 1,
  thank: 2, appreciate: 2, understand: 2, willing: 2,
  suggest: 1, propose: 1, consider: 1, help: 2,
  support: 2, share: 1, respect: 2, fair: 2,
  reasonable: 2, flexible: 2, compromise: 2, solution: 2,
};

/**
 * Emotion keyword mappings for dominant emotion detection.
 */
const EMOTION_KEYWORDS: Record<EmotionCategory, string[]> = {
  anger: ['angry', 'furious', 'rage', 'hate', 'livid', 'outraged', 'infuriated'],
  fear: ['afraid', 'scared', 'terrified', 'worried', 'anxious', 'panic', 'dread'],
  sadness: ['sad', 'depressed', 'hurt', 'heartbroken', 'devastated', 'miserable'],
  disgust: ['disgusted', 'appalled', 'revolted', 'sickened', 'repulsed'],
  surprise: ['shocked', 'stunned', 'amazed', 'astonished', 'surprised'],
  neutral: [],
  frustration: ['frustrated', 'exasperated', 'annoyed', 'irritated', 'fed up'],
  contempt: ['pathetic', 'worthless', 'beneath', 'laughable', 'joke'],
  anxiety: ['anxious', 'nervous', 'worried', 'stressed', 'overwhelmed', 'panicked'],
};

/**
 * EmotionDetector analyzes text messages for emotional content,
 * identifying sentiment, triggers, and aggression levels.
 *
 * @example
 * ```typescript
 * const detector = new EmotionDetector({ aggressionThreshold: 50 });
 * const analysis = await detector.analyze("You NEVER follow the agreement!");
 * console.log(analysis.aggressionScore); // 72
 * console.log(analysis.triggers); // [{ type: 'absolute_language', ... }]
 * ```
 */
export class EmotionDetector {
  private config: Required<EmotionDetectorConfig>;
  private triggerIdentifier: TriggerIdentifier;
  private aggressionScorer: AggressionScorer;

  /**
   * Create a new EmotionDetector instance.
   * @param config - Configuration options for detection behavior
   */
  constructor(config: Partial<EmotionDetectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.triggerIdentifier = new TriggerIdentifier(this.config.customTriggerWords);
    this.aggressionScorer = new AggressionScorer();
  }

  /**
   * Analyze a message for emotional content.
   * Performs sentiment analysis, trigger identification, and aggression scoring.
   *
   * @param message - The text message to analyze
   * @returns Complete emotion analysis result
   */
  async analyze(message: string): Promise<EmotionAnalysis> {
    const tokens = this.tokenize(message);
    const sentiment = this.analyzeSentiment(tokens, message);
    const triggers = this.triggerIdentifier.identify(message);
    const aggressionScore = this.aggressionScorer.score(tokens, sentiment, triggers);
    const emotionScores = this.detectEmotions(tokens);
    const dominantEmotion = this.getDominantEmotion(emotionScores);

    const analysis: EmotionAnalysis = {
      id: this.generateId(),
      originalMessage: message,
      sentiment,
      aggressionScore,
      dominantEmotion,
      emotionScores,
      triggers,
      flagged: aggressionScore >= this.config.aggressionThreshold,
      summary: this.generateSummary(aggressionScore, dominantEmotion, triggers.length),
      analyzedAt: new Date(),
    };

    return analysis;
  }

  /**
   * Perform sentiment analysis using the lexicon-based approach.
   * Scores each token against positive and negative word lists.
   *
   * @param tokens - Tokenized and lowercased words
   * @param originalMessage - Original message for context
   * @returns Sentiment analysis result
   */
  private analyzeSentiment(tokens: string[], originalMessage: string): SentimentResult {
    let totalScore = 0;
    const positiveWords: string[] = [];
    const negativeWords: string[] = [];

    for (const token of tokens) {
      const negScore = NEGATIVE_LEXICON[token];
      const posScore = POSITIVE_LEXICON[token];

      if (negScore !== undefined) {
        totalScore += negScore;
        negativeWords.push(token);
      }
      if (posScore !== undefined) {
        totalScore += posScore;
        positiveWords.push(token);
      }
    }

    // Check for ALL CAPS emphasis (amplifies negativity)
    const capsWords = originalMessage.split(/\s+/).filter(
      (w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)
    );
    totalScore -= capsWords.length * 1.5;

    // Check for excessive punctuation (!!!, ???)
    const excessivePunctuation = (originalMessage.match(/[!?]{2,}/g) || []).length;
    totalScore -= excessivePunctuation * 1;

    const comparative = tokens.length > 0 ? totalScore / tokens.length : 0;
    const normalizedScore = Math.max(-1, Math.min(1, comparative));

    return {
      score: normalizedScore,
      comparative,
      positiveWords,
      negativeWords,
    };
  }

  /**
   * Detect emotion categories present in the message.
   * Returns confidence scores for each emotion category.
   *
   * @param tokens - Tokenized words
   * @returns Record of emotion categories to confidence scores (0-1)
   */
  private detectEmotions(tokens: string[]): Record<EmotionCategory, number> {
    const scores: Record<EmotionCategory, number> = {
      anger: 0, fear: 0, sadness: 0, disgust: 0,
      surprise: 0, neutral: 0.1, frustration: 0,
      contempt: 0, anxiety: 0,
    };

    for (const token of tokens) {
      for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
        if (keywords.includes(token)) {
          scores[emotion as EmotionCategory] += 0.3;
        }
      }
    }

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...Object.values(scores), 0.1);
    for (const emotion of Object.keys(scores) as EmotionCategory[]) {
      scores[emotion] = Math.min(1, scores[emotion] / maxScore);
    }

    return scores;
  }

  /**
   * Determine the dominant emotion from emotion scores.
   *
   * @param scores - Emotion category scores
   * @returns The emotion with the highest confidence
   */
  private getDominantEmotion(scores: Record<EmotionCategory, number>): EmotionCategory {
    let maxEmotion: EmotionCategory = 'neutral';
    let maxScore = 0;

    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion as EmotionCategory;
      }
    }

    return maxEmotion;
  }

  /**
   * Tokenize a message into lowercase words.
   *
   * @param message - Raw text message
   * @returns Array of lowercase tokens
   */
  private tokenize(message: string): string[] {
    return message
      .toLowerCase()
      .replace(/[^\w\s']/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }

  /**
   * Generate a human-readable summary of the analysis.
   *
   * @param aggressionScore - The computed aggression score
   * @param dominantEmotion - The dominant emotion detected
   * @param triggerCount - Number of triggers found
   * @returns A summary string
   */
  private generateSummary(
    aggressionScore: number,
    dominantEmotion: EmotionCategory,
    triggerCount: number
  ): string {
    const level =
      aggressionScore >= 80 ? 'highly aggressive' :
      aggressionScore >= 60 ? 'moderately aggressive' :
      aggressionScore >= 40 ? 'slightly tense' :
      'generally appropriate';

    return `Message is ${level} (score: ${aggressionScore}/100) ` +
      `with dominant emotion: ${dominantEmotion}. ` +
      `${triggerCount} trigger(s) identified.`;
  }

  /**
   * Generate a unique identifier for an analysis.
   * @returns UUID-like string
   */
  private generateId(): string {
    return `ea-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
