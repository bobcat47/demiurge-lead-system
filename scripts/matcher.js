/**
 * Demiurge Lead Matcher
 * Keyword-based NLP matcher for local business leads
 * Zero dependencies
 */

const fs = require('fs');
const path = require('path');

// Service keywords mapping
const SERVICE_KEYWORDS = {
  'plumbing': ['plumber', 'plumbing', 'leak', 'pipe', 'burst', 'drain', 'blocked', 'toilet', 'sink', 'faucet', 'tap', 'water heater', 'boiler'],
  'electrical': ['electrician', 'electrical', 'wiring', 'fuse', 'circuit', 'power outage', 'lights', 'socket', 'rewire', 'electrics'],
  'hvac': ['hvac', 'air conditioning', 'ac', 'heating', 'furnace', 'cooling', 'ventilation', 'heat pump', 'boiler repair'],
  'roofing': ['roof', 'roofing', 'shingles', 'leak', 'gutter', 'chimney', 'flat roof', 'tiles'],
  'landscaping': ['landscape', 'landscaping', 'garden', 'lawn', 'mowing', 'tree', 'hedge', 'patio', 'decking', 'fencing'],
  'cleaning': ['cleaning', 'cleaner', 'house clean', 'deep clean', 'carpet', 'window clean', 'office clean', 'end of tenancy'],
  'painting': ['painter', 'painting', 'paint', 'decorating', 'wallpaper', 'exterior paint', 'interior paint'],
  'pest_control': ['pest', 'pest control', 'rat', 'mouse', 'insect', 'termite', 'bed bug', 'wasp', 'rodent', 'exterminator'],
  'moving': ['moving', 'removal', 'movers', 'relocation', 'house move', 'furniture removal', 'man with van'],
  'locksmith': ['locksmith', 'lock', 'key', 'locked out', 'door lock', 'window lock', 'security'],
  'appliance_repair': ['appliance', 'fridge', 'washing machine', 'dishwasher', 'oven', 'dryer', 'repair'],
  'carpentry': ['carpenter', 'carpentry', 'woodwork', 'cabinet', 'shelves', 'door', 'furniture', 'joinery']
};

// Urgency indicators
const URGENCY_KEYWORDS = {
  'urgent': ['urgent', 'asap', 'emergency', 'immediately', 'today', 'tonight', 'right now', 'broken', 'burst', 'flooding', 'no power'],
  'high': ['soon', 'quickly', 'fast', 'this week', 'tomorrow', 'leaking', 'not working'],
  'medium': ['next week', 'planning', 'quote', 'estimate', 'looking for', 'considering'],
  'low': ['eventually', 'sometime', 'future', 'next month', 'just curious']
};

// Budget indicators
const BUDGET_KEYWORDS = {
  'premium': ['best quality', 'professional', 'top rated', 'premium', 'high end', 'luxury', 'no budget concern'],
  'standard': ['reasonable', 'fair price', 'good value', 'standard', 'mid range'],
  'budget': ['cheap', 'affordable', 'low cost', 'budget', 'best price', 'cheapest', 'student', 'saving money']
};

// Location patterns
const LOCATION_PATTERNS = [
  /in\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g,
  /near\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g,
  /around\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g,
  /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+area/gi
];

/**
 * Parse intent from post text
 */
function parseIntent(text) {
  const lowerText = text.toLowerCase();
  
  // Detect service
  let detectedService = null;
  let serviceScore = 0;
  
  for (const [service, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > serviceScore) {
      serviceScore = score;
      detectedService = service;
    }
  }
  
  // Detect urgency
  let urgency = 'medium';
  let urgencyScore = 0;
  
  for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        const weight = level === 'urgent' ? 3 : level === 'high' ? 2 : 1;
        urgencyScore += weight;
        urgency = level;
      }
    }
  }
  
  // Detect budget
  let budget = 'standard';
  let budgetScore = 0;
  
  for (const [level, keywords] of Object.entries(BUDGET_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        budget = level;
        budgetScore++;
      }
    }
  }
  
  // Extract location mentions
  const locations = [];
  for (const pattern of LOCATION_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && !locations.includes(match[1])) {
        locations.push(match[1]);
      }
    }
  }
  
  // Extract postcode (UK format)
  const postcodeMatch = text.match(/[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}/gi);
  const postcodes = postcodeMatch ? postcodeMatch : [];
  
  return {
    service: detectedService,
    serviceConfidence: serviceScore,
    urgency: urgency,
    urgencyScore: urgencyScore,
    budget: budget,
    budgetMentioned: budgetScore > 0,
    locations: locations,
    postcodes: postcodes,
    originalText: text
  };
}

/**
 * Calculate match score between intent and business
 */
function calculateMatchScore(intent, business) {
  let score = 0;
  const reasons = [];
  
  // Service match (highest weight)
  if (intent.service && business.services) {
    const serviceMatch = business.services.find(s => 
      s.toLowerCase().includes(intent.service.toLowerCase()) ||
      intent.service.toLowerCase().includes(s.toLowerCase())
    );
    
    if (serviceMatch) {
      score += 50;
      reasons.push(`Offers ${intent.service} services`);
    } else {
      // Partial match on related services
      const serviceKeywords = SERVICE_KEYWORDS[intent.service] || [];
      for (const service of business.services) {
        for (const keyword of serviceKeywords) {
          if (service.toLowerCase().includes(keyword)) {
            score += 25;
            reasons.push(`Related service: ${service}`);
            break;
          }
        }
      }
    }
  }
  
  // Location match
  if (intent.locations.length > 0 && business.areas) {
    for (const location of intent.locations) {
      const areaMatch = business.areas.find(area => 
        area.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes(area.toLowerCase())
      );
      if (areaMatch) {
        score += 30;
        reasons.push(`Serves ${location} area`);
        break;
      }
    }
  }
  
  // Postcode match
  if (intent.postcodes.length > 0 && business.postcodes) {
    for (const pc of intent.postcodes) {
      const pcPrefix = pc.substring(0, 2).toUpperCase();
      const postcodeMatch = business.postcodes.find(bpc => 
        bpc.toUpperCase().startsWith(pcPrefix)
      );
      if (postcodeMatch) {
        score += 25;
        reasons.push(`Covers postcode ${pc}`);
        break;
      }
    }
  }
  
  // Urgency match - businesses with emergency services score higher for urgent requests
  if (intent.urgency === 'urgent' && business.emergencyService) {
    score += 20;
    reasons.push('24/7 emergency service available');
  }
  
  // Budget match
  if (intent.budget === 'premium' && business.pricingTier === 'premium') {
    score += 10;
    reasons.push('Premium service quality');
  } else if (intent.budget === 'budget' && business.pricingTier === 'budget') {
    score += 10;
    reasons.push('Competitive pricing');
  }
  
  // Response time bonus
  if (business.responseTime) {
    if (business.responseTime.includes('hour') || business.responseTime.includes('1 hour')) {
      score += 15;
      reasons.push(`Fast response: ${business.responseTime}`);
    }
  }
  
  // Rating bonus
  if (business.rating && business.rating >= 4.5) {
    score += 10;
    reasons.push(`Excellent rating: ${business.rating}/5`);
  }
  
  return {
    score: Math.min(score, 100),
    reasons: reasons.length > 0 ? reasons : ['General services match']
  };
}

/**
 * Generate outreach templates
 */
function generateTemplates(intent, business) {
  const serviceName = intent.service ? intent.service.replace(/_/g, ' ') : 'service';
  const urgencyText = intent.urgency === 'urgent' ? ' urgently' : '';
  const businessName = business.name;
  
  // SMS Template
  const sms = `Hi ${businessName}, I saw a post from someone looking for${urgencyText} ${serviceName} help. Interested in the lead? Reply for details.`;
  
  // Email Template
  const email = {
    subject: `Lead: ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} request${urgencyText}`,
    body: `Hi ${businessName},

I came across a post from someone looking for${urgencyText} ${serviceName} services.

Post summary:
- Service needed: ${serviceName}
- Urgency: ${intent.urgency}
- Location: ${intent.locations.join(', ') || 'Not specified'}
- Budget indication: ${intent.budget}

The poster mentioned: "${intent.originalText.substring(0, 200)}${intent.originalText.length > 200 ? '...' : ''}"

Would you like me to connect you with this potential customer?

Best regards`
  };
  
  // Facebook Template
  const facebook = `Hi ${businessName}! 👋 I noticed someone in your area is looking for${urgencyText} ${serviceName} services. Would you like the referral? I can share their details if you're interested and available.`;
  
  return {
    sms: sms,
    email: email,
    facebook: facebook
  };
}

/**
 * Main matcher function
 */
function matchPostToBusinesses(postText, businesses) {
  // Parse the intent from the post
  const intent = parseIntent(postText);
  
  // Calculate matches for each business
  const matches = businesses.map(business => {
    const matchResult = calculateMatchScore(intent, business);
    const templates = generateTemplates(intent, business);
    
    return {
      business: business,
      score: matchResult.score,
      reasons: matchResult.reasons,
      templates: templates
    };
  });
  
  // Sort by score (descending)
  matches.sort((a, b) => b.score - a.score);
  
  return {
    intent: intent,
    matches: matches,
    totalMatches: matches.length,
    topMatch: matches.length > 0 ? matches[0] : null
  };
}

/**
 * Load businesses from JSON file
 */
function loadBusinesses(filePath) {
  const fullPath = path.resolve(filePath);
  const data = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(data);
}

// Export for use as module
module.exports = {
  parseIntent,
  calculateMatchScore,
  generateTemplates,
  matchPostToBusinesses,
  loadBusinesses,
  SERVICE_KEYWORDS
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node matcher.js <businesses.json> "post text here"');
    process.exit(1);
  }
  
  const businessesFile = args[0];
  const postText = args.slice(1).join(' ');
  
  try {
    const businesses = loadBusinesses(businessesFile);
    const result = matchPostToBusinesses(postText, businesses);
    
    console.log('\n=== PARSED INTENT ===');
    console.log(JSON.stringify(result.intent, null, 2));
    
    console.log('\n=== TOP MATCHES ===');
    result.matches.slice(0, 5).forEach((match, i) => {
      console.log(`\n${i + 1}. ${match.business.name} (Score: ${match.score})`);
      console.log('   Reasons:', match.reasons.join(', '));
    });
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
