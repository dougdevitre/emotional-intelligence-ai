/**
 * @example Batch Rewrite
 * @description Demonstrates batch processing of multiple messages,
 * useful for reviewing entire email threads or case communications.
 *
 * Usage: npx ts-node examples/batch-rewrite.ts
 */

import { RewriteEngine } from '../src';

async function main() {
  // Simulated email thread
  const emailThread = [
    "You are impossible to deal with. Every single time we try to arrange something you make it about yourself.",
    "Fine, whatever. I'll just let my lawyer handle everything from now on.",
    "The kids hate going to your place and you know it. Stop pretending everything is fine.",
    "I can't believe you told the teacher I'm a bad parent. You'll pay for that.",
  ];

  const rewriter = new RewriteEngine({
    tone: 'neutral',
    childFocusEnabled: true,
    courtReadinessMinimum: 75,
  });

  console.log('=== Batch Rewrite: Email Thread ===\n');

  const results = await rewriter.rewriteBatch(emailThread, 2);

  let totalAggressionReduction = 0;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    console.log(`--- Email ${i + 1} ---`);
    console.log(`Original:    ${emailThread[i]}`);
    console.log(`Rewritten:   ${result.rewrittenText}`);
    console.log(`Aggression:  ${result.originalAnalysis.aggressionScore} → ${result.rewrittenAnalysis.aggressionScore}`);
    console.log(`Court Ready: ${result.courtReadinessScore}/100`);
    console.log();

    totalAggressionReduction += result.changeSummary.aggressionReduction;
  }

  console.log('=== Summary ===');
  console.log(`Messages processed: ${results.length}`);
  console.log(`Total aggression reduction: ${totalAggressionReduction} points`);
  console.log(`Average court readiness: ${Math.round(results.reduce((s, r) => s + r.courtReadinessScore, 0) / results.length)}/100`);
}

main().catch(console.error);
