/**
 * @example Child-Centered Rewrite
 * @description Demonstrates the child-focus filter that reframes
 * adult-centric language into child-centered communication.
 *
 * Usage: npx ts-node examples/child-centered-rewrite.ts
 */

import { RewriteEngine } from '../src';

async function main() {
  const messages = [
    "I want my kids this weekend. It's my custody time.",
    "You took the kids to your parents' house without telling me!",
    "My time with the kids is more important than your time.",
    "The kids don't want to go to your house.",
  ];

  const rewriter = new RewriteEngine({
    tone: 'warm',
    childFocusEnabled: true,
  });

  console.log('=== Child-Centered Rewrites ===\n');

  for (const message of messages) {
    const result = await rewriter.rewrite(message);

    console.log(`Original:  ${message}`);
    console.log(`Rewritten: ${result.rewrittenText}`);
    console.log(`Court Readiness: ${result.courtReadinessScore}/100`);
    console.log();
  }
}

main().catch(console.error);
