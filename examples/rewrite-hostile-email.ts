/**
 * @example Rewrite a Hostile Email
 * @description Demonstrates how to analyze and rewrite a hostile co-parenting
 * email into court-appropriate communication.
 *
 * Usage: npx ts-node examples/rewrite-hostile-email.ts
 */

import { EmotionDetector, RewriteEngine } from '../src';

async function main() {
  // A typical hostile co-parenting email
  const hostileEmail = `
    You NEVER follow the parenting plan! Last weekend you were supposed to
    have the kids back by 6pm and you didn't bring them home until almost 9!!!
    You're a terrible parent and you don't care about anyone but yourself.
    My lawyer is going to hear about this. You'll regret this.
  `.trim();

  console.log('=== Original Message ===');
  console.log(hostileEmail);
  console.log();

  // Step 1: Analyze the message
  const detector = new EmotionDetector({ aggressionThreshold: 50 });
  const analysis = await detector.analyze(hostileEmail);

  console.log('=== Emotion Analysis ===');
  console.log(`Aggression Score: ${analysis.aggressionScore}/100`);
  console.log(`Dominant Emotion: ${analysis.dominantEmotion}`);
  console.log(`Flagged: ${analysis.flagged}`);
  console.log(`Triggers Found: ${analysis.triggers.length}`);
  for (const trigger of analysis.triggers) {
    console.log(`  - [${trigger.severity}] ${trigger.type}: "${trigger.matchedText}"`);
  }
  console.log();

  // Step 2: Rewrite with neutral tone
  const rewriter = new RewriteEngine({
    tone: 'neutral',
    childFocusEnabled: true,
    preserveBoundaries: true,
  });

  const result = await rewriter.rewrite(hostileEmail);

  console.log('=== Rewritten Message (Neutral Tone) ===');
  console.log(result.rewrittenText);
  console.log();

  console.log('=== Rewrite Stats ===');
  console.log(`Tone Achieved: ${result.toneAchieved}`);
  console.log(`Iterations: ${result.iterations}`);
  console.log(`Court Readiness: ${result.courtReadinessScore}/100`);
  console.log(`Aggression Reduction: ${result.changeSummary.aggressionReduction} points`);
  console.log(`Triggers Addressed: ${result.changeSummary.triggersAddressed}`);
}

main().catch(console.error);
