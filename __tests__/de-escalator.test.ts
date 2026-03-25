/**
 * @tests DeEscalator
 * @description Tests for the de-escalation module.
 */

import { DeEscalator } from '../src/rewriting/de-escalator';

describe('DeEscalator', () => {
  let deEscalator: DeEscalator;

  beforeEach(() => {
    deEscalator = new DeEscalator();
  });

  describe('deEscalate()', () => {
    it('should replace "you never" with observational language', () => {
      const result = deEscalator.deEscalate('You never follow the plan.', 'neutral');

      expect(result.text.toLowerCase()).not.toContain('you never');
      expect(result.changes.length).toBeGreaterThan(0);
    });

    it('should replace "you always" with frequency language', () => {
      const result = deEscalator.deEscalate('You always show up late.', 'neutral');

      expect(result.text.toLowerCase()).not.toContain('you always');
    });

    it('should replace aggressive words with neutral alternatives', () => {
      const result = deEscalator.deEscalate(
        'That is a terrible and ridiculous idea.',
        'neutral'
      );

      expect(result.text.toLowerCase()).not.toContain('terrible');
      expect(result.text.toLowerCase()).not.toContain('ridiculous');
      expect(result.text.toLowerCase()).toContain('problematic');
      expect(result.text.toLowerCase()).toContain('unreasonable');
    });

    it('should use warm alternatives when tone is warm', () => {
      const result = deEscalator.deEscalate('I hate this situation.', 'warm');

      expect(result.text.toLowerCase()).not.toContain('hate');
      expect(result.text.toLowerCase()).toContain('feel strongly about');
    });

    it('should use firm alternatives when tone is firm', () => {
      const result = deEscalator.deEscalate('I hate this situation.', 'firm');

      expect(result.text.toLowerCase()).not.toContain('hate');
      expect(result.text.toLowerCase()).toContain('strongly object to');
    });

    it('should normalize excessive exclamation marks', () => {
      const result = deEscalator.deEscalate('This is unacceptable!!!', 'neutral');

      expect(result.text).not.toContain('!!!');
    });

    it('should remove ALL CAPS emphasis', () => {
      const result = deEscalator.deEscalate('You NEVER follow the RULES!', 'neutral');

      expect(result.text).not.toMatch(/[A-Z]{2,}/);
    });

    it('should track all changes made', () => {
      const result = deEscalator.deEscalate(
        'You NEVER follow the plan! You are terrible!!!',
        'neutral'
      );

      expect(result.changes.length).toBeGreaterThan(0);
      result.changes.forEach((change) => {
        expect(change.type).toBeDefined();
        expect(change.reason).toBeDefined();
      });
    });

    it('should preserve content that is already appropriate', () => {
      const appropriate = 'I would like to discuss the schedule for next week.';
      const result = deEscalator.deEscalate(appropriate, 'neutral');

      expect(result.text).toBe(appropriate);
      expect(result.changes).toHaveLength(0);
    });
  });

  describe('phrase-level transformations', () => {
    it('should transform "you need to" into a request', () => {
      const result = deEscalator.deEscalate('You need to return the kids on time.', 'neutral');

      expect(result.text.toLowerCase()).not.toContain('you need to');
      expect(result.text.toLowerCase()).toContain('appreciate');
    });

    it('should transform "it\'s your fault" into solution focus', () => {
      const result = deEscalator.deEscalate("It's your fault this happened.", 'neutral');

      expect(result.text.toLowerCase()).not.toContain('your fault');
      expect(result.text.toLowerCase()).toContain('work together');
    });

    it('should transform "what is wrong with you" into inquiry', () => {
      const result = deEscalator.deEscalate('What is wrong with you?', 'neutral');

      expect(result.text.toLowerCase()).not.toContain('wrong with you');
      expect(result.text.toLowerCase()).toContain('understand');
    });
  });
});
