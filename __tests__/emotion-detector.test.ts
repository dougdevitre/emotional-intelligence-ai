/**
 * @tests EmotionDetector
 * @description Tests for the core emotion detection engine.
 */

import { EmotionDetector } from '../src/detection/emotion-detector';
import type { EmotionAnalysis } from '../src/types';

describe('EmotionDetector', () => {
  let detector: EmotionDetector;

  beforeEach(() => {
    detector = new EmotionDetector({ aggressionThreshold: 60 });
  });

  describe('analyze()', () => {
    it('should detect high aggression in hostile messages', async () => {
      const analysis = await detector.analyze(
        "You NEVER follow the agreement! You're a terrible parent and you know it!"
      );

      expect(analysis.aggressionScore).toBeGreaterThanOrEqual(60);
      expect(analysis.flagged).toBe(true);
      expect(analysis.triggers.length).toBeGreaterThan(0);
    });

    it('should detect low aggression in neutral messages', async () => {
      const analysis = await detector.analyze(
        'I would like to discuss adjusting the parenting schedule for next month.'
      );

      expect(analysis.aggressionScore).toBeLessThan(30);
      expect(analysis.flagged).toBe(false);
      expect(analysis.triggers.length).toBe(0);
    });

    it('should identify absolute language triggers', async () => {
      const analysis = await detector.analyze('You never let me see the kids.');

      const absoluteTriggers = analysis.triggers.filter(
        (t) => t.type === 'absolute_language'
      );
      expect(absoluteTriggers.length).toBeGreaterThan(0);
    });

    it('should detect personal attacks', async () => {
      const analysis = await detector.analyze("You're a terrible parent.");

      const attacks = analysis.triggers.filter((t) => t.type === 'personal_attack');
      expect(attacks.length).toBeGreaterThan(0);
    });

    it('should return a valid sentiment score', async () => {
      const analysis = await detector.analyze('I appreciate your cooperation.');

      expect(analysis.sentiment.score).toBeGreaterThan(0);
      expect(analysis.sentiment.positiveWords.length).toBeGreaterThan(0);
    });
  });

  describe('sentiment analysis', () => {
    it('should score negative sentiment for hostile words', async () => {
      const analysis = await detector.analyze('I hate this terrible situation.');

      expect(analysis.sentiment.score).toBeLessThan(0);
      expect(analysis.sentiment.negativeWords).toContain('hate');
      expect(analysis.sentiment.negativeWords).toContain('terrible');
    });

    it('should amplify negativity for ALL CAPS words', async () => {
      const normalAnalysis = await detector.analyze('You never follow the plan.');
      const capsAnalysis = await detector.analyze('You NEVER follow the plan.');

      expect(capsAnalysis.aggressionScore).toBeGreaterThan(normalAnalysis.aggressionScore);
    });

    it('should detect excessive punctuation as aggressive', async () => {
      const calmAnalysis = await detector.analyze('Please follow the plan.');
      const aggressiveAnalysis = await detector.analyze('Please follow the plan!!!');

      expect(aggressiveAnalysis.sentiment.score).toBeLessThan(calmAnalysis.sentiment.score);
    });
  });

  describe('emotion detection', () => {
    it('should detect anger as dominant emotion in angry messages', async () => {
      const analysis = await detector.analyze(
        'I am furious about this situation. I am so angry!'
      );

      expect(analysis.dominantEmotion).toBe('anger');
    });

    it('should detect frustration in frustrated messages', async () => {
      const analysis = await detector.analyze(
        'I am so frustrated and exasperated with this process.'
      );

      expect(analysis.dominantEmotion).toBe('frustration');
    });

    it('should return neutral for objective messages', async () => {
      const analysis = await detector.analyze(
        'The hearing is scheduled for Tuesday at 2pm.'
      );

      expect(analysis.aggressionScore).toBeLessThan(20);
    });
  });

  describe('analysis metadata', () => {
    it('should generate a unique analysis ID', async () => {
      const analysis1 = await detector.analyze('Test message 1');
      const analysis2 = await detector.analyze('Test message 2');

      expect(analysis1.id).not.toBe(analysis2.id);
      expect(analysis1.id).toMatch(/^ea-/);
    });

    it('should include the original message in the result', async () => {
      const message = 'This is the original message.';
      const analysis = await detector.analyze(message);

      expect(analysis.originalMessage).toBe(message);
    });

    it('should generate a human-readable summary', async () => {
      const analysis = await detector.analyze('You are terrible!');

      expect(analysis.summary).toContain('score:');
      expect(analysis.summary).toContain('trigger(s) identified');
    });

    it('should include a timestamp', async () => {
      const before = new Date();
      const analysis = await detector.analyze('Test message');
      const after = new Date();

      expect(analysis.analyzedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(analysis.analyzedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
