/**
 * @tests RewriteEngine
 * @description Tests for the core message rewrite engine.
 */

import { RewriteEngine } from '../src/rewriting/rewrite-engine';
import type { RewriteResult } from '../src/types';

describe('RewriteEngine', () => {
  let engine: RewriteEngine;

  beforeEach(() => {
    engine = new RewriteEngine({
      tone: 'neutral',
      childFocusEnabled: true,
      maxIterations: 3,
      courtReadinessMinimum: 70,
    });
  });

  describe('rewrite()', () => {
    it('should reduce aggression in hostile messages', async () => {
      const result = await engine.rewrite(
        "You NEVER follow the agreement! You're a terrible parent!"
      );

      expect(result.rewrittenAnalysis.aggressionScore)
        .toBeLessThan(result.originalAnalysis.aggressionScore);
      expect(result.changeSummary.aggressionReduction).toBeGreaterThan(0);
    });

    it('should apply child-focused language transformations', async () => {
      const result = await engine.rewrite('I want my kids this weekend.');

      expect(result.rewrittenText.toLowerCase()).toContain('children');
    });

    it('should return court readiness score', async () => {
      const result = await engine.rewrite(
        'I would like to discuss the schedule for next week.'
      );

      expect(result.courtReadinessScore).toBeGreaterThanOrEqual(0);
      expect(result.courtReadinessScore).toBeLessThanOrEqual(100);
    });

    it('should track the number of iterations', async () => {
      const result = await engine.rewrite('You are impossible!');

      expect(result.iterations).toBeGreaterThanOrEqual(1);
      expect(result.iterations).toBeLessThanOrEqual(3);
    });

    it('should include both original and rewritten analysis', async () => {
      const result = await engine.rewrite('This is terrible and you know it!');

      expect(result.originalAnalysis).toBeDefined();
      expect(result.rewrittenAnalysis).toBeDefined();
      expect(result.originalAnalysis.originalMessage).toBe('This is terrible and you know it!');
    });
  });

  describe('tone targeting', () => {
    it('should support neutral tone rewrites', async () => {
      const result = await engine.rewrite("You're being ridiculous!", 'neutral');

      expect(result.toneTarget).toBe('neutral');
    });

    it('should support warm tone rewrites', async () => {
      const result = await engine.rewrite("You're being ridiculous!", 'warm');

      expect(result.toneTarget).toBe('warm');
    });

    it('should support firm tone rewrites', async () => {
      const result = await engine.rewrite("You're being ridiculous!", 'firm');

      expect(result.toneTarget).toBe('firm');
    });
  });

  describe('rewriteBatch()', () => {
    it('should process multiple messages', async () => {
      const messages = [
        'You never listen!',
        'This is stupid!',
        'I hate dealing with you!',
      ];

      const results = await engine.rewriteBatch(messages, 2);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.rewrittenText).toBeDefined();
        expect(result.courtReadinessScore).toBeDefined();
      });
    });

    it('should return results in order', async () => {
      const messages = ['Message A', 'Message B'];
      const results = await engine.rewriteBatch(messages);

      expect(results[0].originalText).toBe('Message A');
      expect(results[1].originalText).toBe('Message B');
    });
  });

  describe('change tracking', () => {
    it('should track changes made during rewriting', async () => {
      const result = await engine.rewrite(
        "You NEVER follow the agreement! You're a terrible parent!"
      );

      expect(result.changeSummary.changes.length).toBeGreaterThan(0);
      result.changeSummary.changes.forEach((change) => {
        expect(change.type).toBeDefined();
        expect(change.reason).toBeDefined();
      });
    });

    it('should include a unique rewrite ID', async () => {
      const result = await engine.rewrite('Test message');

      expect(result.id).toMatch(/^rw-/);
    });

    it('should include a timestamp', async () => {
      const result = await engine.rewrite('Test message');

      expect(result.rewrittenAt).toBeInstanceOf(Date);
    });
  });
});
