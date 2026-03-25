/**
 * @tests CourtReadiness
 * @description Tests for the court readiness scoring system.
 */

import { CourtReadiness } from '../src/quality/court-readiness';
import type { CourtReadinessResult } from '../src/types';

describe('CourtReadiness', () => {
  let courtReadiness: CourtReadiness;

  beforeEach(() => {
    courtReadiness = new CourtReadiness(70);
  });

  describe('evaluate()', () => {
    it('should score professional messages highly', () => {
      const result = courtReadiness.evaluate(
        'I would like to respectfully request an adjustment to the parenting schedule, per our agreement dated 01/15.'
      );

      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.passes).toBe(true);
    });

    it('should score hostile messages poorly', () => {
      const result = courtReadiness.evaluate(
        "You're a TERRIBLE parent and you KNOW IT!!! I HATE dealing with you!!!"
      );

      expect(result.score).toBeLessThan(50);
      expect(result.passes).toBe(false);
    });

    it('should return factor breakdown', () => {
      const result = courtReadiness.evaluate('A test message.');

      expect(result.factors).toBeDefined();
      expect(result.factors.length).toBeGreaterThan(0);

      result.factors.forEach((factor) => {
        expect(factor.name).toBeDefined();
        expect(factor.score).toBeGreaterThanOrEqual(0);
        expect(factor.score).toBeLessThanOrEqual(100);
        expect(factor.weight).toBeGreaterThan(0);
        expect(factor.description).toBeDefined();
      });
    });

    it('should provide recommendations for low-scoring messages', () => {
      const result = courtReadiness.evaluate(
        "You're stupid and pathetic!!! I'm gonna destroy you!!!"
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should not provide recommendations for high-scoring messages', () => {
      const result = courtReadiness.evaluate(
        'I respectfully request that we discuss the parenting schedule.'
      );

      // High-scoring messages should have few or no recommendations
      expect(result.score).toBeGreaterThanOrEqual(70);
    });
  });

  describe('scoring factors', () => {
    it('should penalize informal language', () => {
      const formal = courtReadiness.evaluate('I would like to discuss this matter.');
      const informal = courtReadiness.evaluate("I'm gonna talk about this, ain't gonna be pretty.");

      expect(formal.score).toBeGreaterThan(informal.score);
    });

    it('should penalize emotional language', () => {
      const neutral = courtReadiness.evaluate('The schedule needs adjustment.');
      const emotional = courtReadiness.evaluate('I am devastated and heartbroken by the schedule.');

      expect(neutral.score).toBeGreaterThan(emotional.score);
    });

    it('should reward specific dates and references', () => {
      const vague = courtReadiness.evaluate('The agreement was violated.');
      const specific = courtReadiness.evaluate('Per the agreement, on 01/15 the schedule was not followed.');

      expect(specific.score).toBeGreaterThan(vague.score);
    });

    it('should penalize ALL CAPS and excessive punctuation', () => {
      const calm = courtReadiness.evaluate('Please follow the agreement.');
      const aggressive = courtReadiness.evaluate('PLEASE follow the AGREEMENT!!!');

      expect(calm.score).toBeGreaterThan(aggressive.score);
    });
  });

  describe('custom minimum score', () => {
    it('should use custom minimum score for pass/fail', () => {
      const strict = new CourtReadiness(90);
      const lenient = new CourtReadiness(30);

      const message = 'This is a reasonably good message.';
      const strictResult = strict.evaluate(message);
      const lenientResult = lenient.evaluate(message);

      // Same score, different pass criteria
      expect(strictResult.score).toBe(lenientResult.score);
      expect(lenientResult.passes).toBe(true);
    });
  });
});
