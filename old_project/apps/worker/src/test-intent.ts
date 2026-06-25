/**
 * Test script for intent detection
 * Usage: npx tsx src/test-intent.ts "your text here"
 */

import { intentDetector, matchingEngine, outreachGenerator } from '@demiurge/core';

const testCases = [
  {
    name: "Urgent plumbing",
    text: "Urgently need a plumber in Downtown! Pipe burst and water is everywhere. Can anyone recommend someone who can come today? Budget is flexible for quick service."
  },
  {
    name: "Electrical quote",
    text: "Looking for an electrician to rewire my kitchen. Planning to do this next month, just getting quotes right now. Any recommendations in the Northside area?"
  },
  {
    name: "Budget moving",
    text: "Need cheap movers for a small apartment move. Student budget, looking for the best price. Moving from Eastside to Westside next week."
  },
  {
    name: "Emergency locksmith",
    text: "Locked out of my house! Need a locksmith ASAP near Riverside. Please help!"
  },
  {
    name: "HVAC maintenance",
    text: "My AC stopped working in the middle of this heatwave. Need someone to fix it urgently. Willing to pay premium for same-day service."
  },
  {
    name: "Spam test",
    text: "MAKE MONEY FAST!!! Click here to earn $5000 per day working from home!!! Limited time offer!!!"
  }
];

async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║        Demiurge Intent Detection Test Suite                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test: ${testCase.name}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Text: "${testCase.text.substring(0, 80)}..."\n`);

    // Detect intent
    const intent = intentDetector.detectIntent(testCase.text);

    console.log('📊 DETECTED INTENT:');
    console.log(`  Service: ${intent.serviceCategory || 'None'} (confidence: ${(intent.serviceConfidence * 100).toFixed(0)}%)`);
    console.log(`  Urgency: ${intent.urgency} (score: ${intent.urgencyScore})`);
    console.log(`  Budget: ${intent.budget} (confidence: ${(intent.budgetConfidence * 100).toFixed(0)}%)`);
    console.log(`  Locations: ${intent.locations.join(', ') || 'None detected'}`);
    console.log(`  Quality Score: ${intent.leadQualityScore}/100`);
    console.log(`  Spam Probability: ${(intent.spamProbability * 100).toFixed(1)}%`);
    console.log(`  Is Qualified: ${intent.isQualified ? '✅ YES' : '❌ NO'}`);

    if (Object.keys(intent.signals).length > 0) {
      console.log('\n📡 SIGNALS:');
      Object.entries(intent.signals)
        .filter(([_, value]) => value)
        .forEach(([key]) => console.log(`  ✓ ${key.replace(/_/g, ' ')}`));
    }

    if (intent.keywords.length > 0) {
      console.log('\n🔑 KEYWORDS:', intent.keywords.slice(0, 10).join(', '));
    }

    if (intent.phoneNumbers.length > 0 || intent.emails.length > 0) {
      console.log('\n📞 CONTACT INFO:');
      intent.phoneNumbers.forEach(p => console.log(`  Phone: ${p}`));
      intent.emails.forEach(e => console.log(`  Email: ${e}`));
    }

    console.log('\n');
  }

  console.log('\n✅ All tests completed!');
}

// Run with command line argument or default tests
const input = process.argv[2];
if (input) {
  console.log('Testing custom input:\n');
  const intent = intentDetector.detectIntent(input);
  console.log(JSON.stringify(intent, null, 2));
} else {
  runTests();
}
