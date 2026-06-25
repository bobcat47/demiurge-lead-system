/**
 * Standalone Intent Detection Test
 * No workspace dependencies required
 */

// Service keyword mappings
const SERVICE_KEYWORDS = {
  plumbing: ['plumber', 'plumbing', 'leak', 'pipe', 'burst', 'drain', 'blocked', 'toilet', 'sink', 'faucet', 'tap', 'water heater', 'boiler'],
  electrical: ['electrician', 'electrical', 'wiring', 'fuse', 'circuit', 'power outage', 'lights', 'socket', 'rewire', 'electrics'],
  hvac: ['hvac', 'air conditioning', 'ac', 'heating', 'furnace', 'cooling', 'ventilation', 'heat pump', 'boiler repair'],
  roofing: ['roof', 'roofing', 'shingles', 'leak', 'gutter', 'chimney', 'flat roof', 'tiles'],
  landscaping: ['landscape', 'landscaping', 'garden', 'lawn', 'mowing', 'tree', 'hedge', 'patio', 'decking', 'fencing'],
  cleaning: ['cleaning', 'cleaner', 'house clean', 'deep clean', 'carpet', 'window clean'],
  painting: ['painter', 'painting', 'paint', 'decorating', 'wallpaper'],
  pest_control: ['pest', 'pest control', 'rat', 'mouse', 'insect', 'termite', 'bed bug', 'wasp'],
  moving: ['moving', 'removal', 'movers', 'relocation', 'house move', 'furniture removal'],
  locksmith: ['locksmith', 'lock', 'key', 'locked out', 'door lock'],
  appliance_repair: ['appliance', 'fridge', 'washing machine', 'dishwasher', 'oven', 'dryer'],
  carpentry: ['carpenter', 'carpentry', 'woodwork', 'cabinet', 'shelves']
};

const URGENCY_PATTERNS = {
  urgent: ['urgent', 'asap', 'emergency', 'immediately', 'right now', 'today', 'tonight', 'broken', 'burst', 'flooding', 'no power'],
  high: ['soon', 'quickly', 'fast', 'this week', 'tomorrow', 'leaking', 'not working'],
  medium: ['next week', 'planning', 'quote', 'estimate', 'looking for'],
  low: ['eventually', 'sometime', 'future', 'next month', 'just curious']
};

const BUDGET_PATTERNS = {
  premium: ['best quality', 'professional', 'top rated', 'premium', 'high end', 'luxury'],
  standard: ['reasonable', 'fair price', 'good value', 'standard'],
  budget: ['cheap', 'affordable', 'low cost', 'budget', 'best price', 'cheapest']
};

function detectIntent(text) {
  const lowerText = text.toLowerCase();
  
  // Detect service
  let bestService = null;
  let maxScore = 0;
  
  for (const [category, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score += matches.length;
    }
    if (score > maxScore) {
      maxScore = score;
      bestService = category;
    }
  }
  
  // Detect urgency
  let urgency = 'medium';
  let urgencyScore = 0;
  
  for (const [level, patterns] of Object.entries(URGENCY_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        const weight = level === 'urgent' ? 3 : level === 'high' ? 2 : 1;
        urgencyScore += weight;
        urgency = level;
      }
    }
  }
  
  // Detect budget
  let budget = 'standard';
  for (const [level, patterns] of Object.entries(BUDGET_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) budget = level;
    }
  }
  
  // Extract locations
  const locations = [];
  const locationPatterns = [
    /in\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g,
    /near\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g
  ];
  for (const pattern of locationPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) locations.push(match[1]);
    }
  }
  
  // Calculate quality score
  let qualityScore = 0;
  if (bestService) qualityScore += 40;
  if (locations.length > 0) qualityScore += 25;
  if (urgency === 'urgent') qualityScore += 20;
  else if (urgency === 'high') qualityScore += 15;
  if (text.split(/\s+/).length > 10) qualityScore += 10;
  if (/\b(need|looking|hire|want)\b/i.test(text)) qualityScore += 10;
  
  return {
    service: bestService,
    urgency,
    urgencyScore,
    budget,
    locations: [...new Set(locations)],
    qualityScore: Math.min(qualityScore, 100),
    isQualified: bestService !== null && qualityScore >= 50
  };
}

// Test cases
const testCases = [
  {
    name: "Urgent plumbing",
    text: "Urgently need a plumber in Downtown! Pipe burst and water is everywhere. Can anyone recommend someone who can come today? Budget is flexible for quick service."
  },
  {
    name: "Electrical quote",
    text: "Looking for an electrician to rewire my kitchen. Planning to do this next month, just getting quotes."
  },
  {
    name: "Emergency locksmith",
    text: "Locked out of my house! Need a locksmith ASAP near Riverside."
  }
];

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║        Demiurge Intent Detection Test                         ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

for (const test of testCases) {
  console.log(`${'='.repeat(60)}`);
  console.log(`Test: ${test.name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Text: "${test.text.substring(0, 80)}..."\n`);
  
  const result = detectIntent(test.text);
  
  console.log('📊 DETECTED INTENT:');
  console.log(`  Service: ${result.service || 'None'} (confidence: ${result.service ? 'high' : 'none'})`);
  console.log(`  Urgency: ${result.urgency} (score: ${result.urgencyScore})`);
  console.log(`  Budget: ${result.budget}`);
  console.log(`  Locations: ${result.locations.join(', ') || 'None detected'}`);
  console.log(`  Quality Score: ${result.qualityScore}/100`);
  console.log(`  Is Qualified: ${result.isQualified ? '✅ YES' : '❌ NO'}`);
  console.log();
}

// CLI argument support
const input = process.argv[2];
if (input) {
  console.log('\n' + '='.repeat(60));
  console.log('CUSTOM INPUT:');
  console.log('='.repeat(60));
  console.log(`Text: "${input}"\n`);
  
  const result = detectIntent(input);
  console.log(JSON.stringify(result, null, 2));
}
