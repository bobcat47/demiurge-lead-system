import nlp from 'compromise';
import natural from 'natural';
import type { ParsedIntent, Provider } from '@demiurge/database';

// Service keyword mappings
const SERVICE_KEYWORDS: Record<string, string[]> = {
  plumbing: ['plumber', 'plumbing', 'leak', 'pipe', 'burst', 'drain', 'blocked', 'toilet', 'sink', 'faucet', 'tap', 'water heater', 'boiler'],
  electrical: ['electrician', 'electrical', 'wiring', 'fuse', 'circuit', 'power outage', 'lights', 'socket', 'rewire', 'electrics', 'outlet'],
  hvac: ['hvac', 'air conditioning', 'ac', 'heating', 'furnace', 'cooling', 'ventilation', 'heat pump', 'boiler repair', 'thermostat'],
  roofing: ['roof', 'roofing', 'shingles', 'leak', 'gutter', 'chimney', 'flat roof', 'tiles', 'roofer'],
  landscaping: ['landscape', 'landscaping', 'garden', 'lawn', 'mowing', 'tree', 'hedge', 'patio', 'decking', 'fencing', 'gardener'],
  cleaning: ['cleaning', 'cleaner', 'house clean', 'deep clean', 'carpet', 'window clean', 'office clean', 'end of tenancy', 'maid'],
  painting: ['painter', 'painting', 'paint', 'decorating', 'wallpaper', 'exterior paint', 'interior paint', 'decorator'],
  pest_control: ['pest', 'pest control', 'rat', 'mouse', 'insect', 'termite', 'bed bug', 'wasp', 'rodent', 'exterminator'],
  moving: ['moving', 'removal', 'movers', 'relocation', 'house move', 'furniture removal', 'man with van'],
  locksmith: ['locksmith', 'lock', 'key', 'locked out', 'door lock', 'window lock', 'security'],
  appliance_repair: ['appliance', 'fridge', 'refrigerator', 'washing machine', 'dishwasher', 'oven', 'dryer', 'repair'],
  carpentry: ['carpenter', 'carpentry', 'woodwork', 'cabinet', 'shelves', 'door', 'furniture', 'joinery'],
  flooring: ['flooring', 'floor', 'hardwood', 'laminate', 'tile', 'carpet installation', 'vinyl'],
  masonry: ['masonry', 'brick', 'concrete', 'foundation', 'chimney repair', 'stonework'],
  welding: ['welding', 'welder', 'metal work', 'ironwork', 'steel'],
  pool: ['pool', 'swimming pool', 'hot tub', 'spa', 'pool cleaning', 'pool maintenance']
};

// Urgency indicators
const URGENCY_PATTERNS = {
  urgent: ['urgent', 'asap', 'emergency', 'immediately', 'right now', 'today', 'tonight', 'broken', 'burst', 'flooding', 'no power', 'no water', 'dangerous'],
  high: ['soon', 'quickly', 'fast', 'this week', 'tomorrow', 'leaking', 'not working', 'stopped working', 'need help'],
  medium: ['next week', 'planning', 'quote', 'estimate', 'looking for', 'considering', 'thinking about'],
  low: ['eventually', 'sometime', 'future', 'next month', 'just curious', 'wondering', 'any recommendations']
};

// Budget indicators
const BUDGET_PATTERNS = {
  premium: ['best quality', 'professional', 'top rated', 'premium', 'high end', 'luxury', 'no budget concern', 'money not an issue', 'willing to pay'],
  standard: ['reasonable', 'fair price', 'good value', 'standard', 'mid range', 'decent'],
  budget: ['cheap', 'affordable', 'low cost', 'budget', 'best price', 'cheapest', 'student', 'saving money', 'not expensive']
};

// Spam/irrelevant patterns
const SPAM_PATTERNS = [
  /\b(viagra|cialis|casino|lottery|winner|prize|click here|limited time)\b/gi,
  /\b(make money|earn \$|work from home|crypto investment)\b/gi,
  /(.)\1{10,}/, // Repeated characters
  /https?:\/\/\S{50,}/ // Suspicious long URLs
];

// Contact extraction patterns
const CONTACT_PATTERNS = {
  phone: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
};

export interface IntentDetectionResult {
  serviceCategory: string | null;
  serviceConfidence: number;
  urgency: 'urgent' | 'high' | 'medium' | 'low';
  urgencyScore: number;
  budget: 'budget' | 'standard' | 'premium' | 'luxury';
  budgetConfidence: number;
  locations: string[];
  postcodes: string[];
  locationConfidence: number;
  contactAvailable: boolean;
  phoneNumbers: string[];
  emails: string[];
  leadQualityScore: number;
  spamProbability: number;
  isQualified: boolean;
  signals: Record<string, boolean>;
  entities: Record<string, any>;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export class IntentDetector {
  private tokenizer: natural.WordTokenizer;
  private stemmer: typeof natural.PorterStemmer;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  detectIntent(text: string): IntentDetectionResult {
    const lowerText = text.toLowerCase();
    const doc = nlp(text);
    
    // Check for spam
    const spamProbability = this.calculateSpamProbability(text);
    if (spamProbability > 0.7) {
      return this.createSpamResult(spamProbability);
    }

    // Extract service category
    const serviceResult = this.detectService(lowerText);
    
    // Extract urgency
    const urgencyResult = this.detectUrgency(lowerText);
    
    // Extract budget
    const budgetResult = this.detectBudget(lowerText);
    
    // Extract locations
    const locationResult = this.detectLocations(text, doc);
    
    // Extract contact info
    const contactResult = this.extractContactInfo(text);
    
    // Extract entities
    const entities = this.extractEntities(doc);
    
    // Calculate sentiment
    const sentiment = this.analyzeSentiment(text);
    
    // Calculate quality score
    const qualityResult = this.calculateQualityScore({
      serviceResult,
      urgencyResult,
      locationResult,
      contactResult,
      text
    });

    // Build signals
    const signals = this.buildSignals(lowerText, serviceResult, urgencyResult, locationResult);

    // Extract keywords
    const keywords = this.extractKeywords(text);

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(serviceResult, locationResult, qualityResult.score);

    return {
      serviceCategory: serviceResult.category,
      serviceConfidence: serviceResult.confidence,
      urgency: urgencyResult.level,
      urgencyScore: urgencyResult.score,
      budget: budgetResult.level,
      budgetConfidence: budgetResult.confidence,
      locations: locationResult.locations,
      postcodes: locationResult.postcodes,
      locationConfidence: locationResult.confidence,
      contactAvailable: contactResult.hasContact,
      phoneNumbers: contactResult.phones,
      emails: contactResult.emails,
      leadQualityScore: qualityResult.score,
      spamProbability,
      isQualified: qualityResult.isQualified,
      signals,
      entities,
      keywords,
      sentiment,
      confidence
    };
  }

  private detectService(text: string): { category: string | null; confidence: number; matches: string[] } {
    let bestCategory: string | null = null;
    let maxScore = 0;
    const allMatches: string[] = [];

    for (const [category, keywords] of Object.entries(SERVICE_KEYWORDS)) {
      let score = 0;
      const categoryMatches: string[] = [];

      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length;
          categoryMatches.push(keyword);
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
        allMatches.push(...categoryMatches);
      }
    }

    // Normalize confidence (0-1)
    const confidence = Math.min(maxScore / 3, 1);

    return {
      category: bestCategory,
      confidence,
      matches: [...new Set(allMatches)]
    };
  }

  private detectUrgency(text: string): { level: 'urgent' | 'high' | 'medium' | 'low'; score: number } {
    let urgencyScore = 0;
    let detectedLevel: 'urgent' | 'high' | 'medium' | 'low' = 'medium';

    for (const [level, patterns] of Object.entries(URGENCY_PATTERNS)) {
      for (const pattern of patterns) {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          const weight = level === 'urgent' ? 3 : level === 'high' ? 2 : 1;
          urgencyScore += matches.length * weight;
          detectedLevel = level as any;
        }
      }
    }

    // Time-based urgency detection
    const timeUrgency = this.detectTimeUrgency(text);
    urgencyScore += timeUrgency;

    return {
      level: detectedLevel,
      score: urgencyScore
    };
  }

  private detectTimeUrgency(text: string): number {
    let score = 0;
    
    // Today/Tonight = +3
    if (/\b(today|tonight|this morning|this afternoon)\b/i.test(text)) score += 3;
    // Tomorrow = +2
    if (/\b(tomorrow|tomorrow morning)\b/i.test(text)) score += 2;
    // This week = +1
    if (/\b(this week|in a few days)\b/i.test(text)) score += 1;
    
    return score;
  }

  private detectBudget(text: string): { level: 'budget' | 'standard' | 'premium' | 'luxury'; confidence: number } {
    let budgetScores = { budget: 0, standard: 0, premium: 0, luxury: 0 };

    for (const [level, patterns] of Object.entries(BUDGET_PATTERNS)) {
      for (const pattern of patterns) {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          budgetScores[level as keyof typeof budgetScores] += matches.length;
        }
      }
    }

    const maxScore = Math.max(...Object.values(budgetScores));
    const detectedLevel = (Object.entries(budgetScores)
      .sort((a, b) => b[1] - a[1])[0][0] || 'standard') as any;

    return {
      level: detectedLevel,
      confidence: Math.min(maxScore / 2, 1)
    };
  }

  private detectLocations(text: string, doc: any): { 
    locations: string[]; 
    postcodes: string[]; 
    confidence: number;
    detectedCity: string | null;
    detectedState: string | null;
  } {
    const locations: string[] = [];
    const postcodes: string[] = [];

    // Extract places using compromise
    const places = doc.places().json();
    for (const place of places) {
      if (place.text && place.text.length > 2) {
        locations.push(place.text);
      }
    }

    // Pattern-based location extraction
    const locationPatterns = [
      /in\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g,
      /near\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g,
      /around\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+area/gi
    ];

    for (const pattern of locationPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && !locations.includes(match[1])) {
          locations.push(match[1]);
        }
      }
    }

    // Extract postcodes (US and UK)
    const usZip = text.match(/\b\d{5}(-\d{4})?\b/g);
    const ukPostcode = text.match(/[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}/gi);
    
    if (usZip) postcodes.push(...usZip);
    if (ukPostcode) postcodes.push(...ukPostcode);

    const confidence = locations.length > 0 || postcodes.length > 0 ? 0.8 : 0.2;

    return {
      locations: [...new Set(locations)],
      postcodes: [...new Set(postcodes)],
      confidence,
      detectedCity: locations[0] || null,
      detectedState: null // Would need geocoding
    };
  }

  private extractContactInfo(text: string): { 
    hasContact: boolean; 
    phones: string[]; 
    emails: string[];
    preferredMethod: string | null;
  } {
    const phones = text.match(CONTACT_PATTERNS.phone) || [];
    const emails = text.match(CONTACT_PATTERNS.email) || [];
    
    // Detect preferred contact method
    const lowerText = text.toLowerCase();
    let preferredMethod: string | null = null;
    
    if (lowerText.includes('call me') || lowerText.includes('text me')) {
      preferredMethod = 'phone';
    } else if (lowerText.includes('email me')) {
      preferredMethod = 'email';
    } else if (lowerText.includes('dm me')) {
      preferredMethod = 'dm';
    }

    return {
      hasContact: phones.length > 0 || emails.length > 0,
      phones: [...new Set(phones)],
      emails: [...new Set(emails)],
      preferredMethod
    };
  }

  private extractEntities(doc: any): Record<string, any> {
    return {
      people: doc.people().json().map((p: any) => p.text),
      organizations: doc.organizations().json().map((o: any) => o.text),
      dates: doc.dates().json().map((d: any) => d.text),
      money: doc.money().json().map((m: any) => m.text),
      phoneNumbers: doc.phoneNumbers?.().json().map((p: any) => p.text) || []
    };
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const tokens = this.tokenizer.tokenize(text) || [];
    const score = analyzer.getSentiment(tokens);

    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  }

  private calculateQualityScore(inputs: {
    serviceResult: { category: string | null; confidence: number };
    urgencyResult: { level: string; score: number };
    locationResult: { locations: string[]; confidence: number };
    contactResult: { hasContact: boolean };
    text: string;
  }): { score: number; isQualified: boolean } {
    let score = 0;

    // Service detection (0-30 points)
    if (inputs.serviceResult.category) {
      score += 20 + Math.round(inputs.serviceResult.confidence * 10);
    }

    // Urgency (0-20 points) - urgent leads score higher
    const urgencyPoints: Record<string, number> = { urgent: 20, high: 15, medium: 10, low: 5 };
    score += urgencyPoints[inputs.urgencyResult.level] || 10;

    // Location (0-20 points)
    if (inputs.locationResult.locations.length > 0) {
      score += 15 + Math.round(inputs.locationResult.confidence * 5);
    }

    // Contact availability (0-15 points)
    if (inputs.contactResult.hasContact) {
      score += 15;
    }

    // Content quality (0-15 points)
    const wordCount = inputs.text.split(/\s+/).length;
    if (wordCount > 10) score += 5;
    if (wordCount > 30) score += 5;
    if (wordCount > 50) score += 5;

    return {
      score: Math.min(score, 100),
      isQualified: score >= 50 && inputs.serviceResult.category !== null
    };
  }

  private buildSignals(
    text: string,
    serviceResult: { category: string | null },
    urgencyResult: { level: string },
    locationResult: { locations: string[] }
  ): Record<string, boolean> {
    return {
      has_service_mention: serviceResult.category !== null,
      has_urgency_signal: ['urgent', 'high'].includes(urgencyResult.level),
      has_location: locationResult.locations.length > 0,
      has_budget_mention: /\$|\bdollar|\bcost|\bprice|\bbudget|\bcheap|\bexpensive/i.test(text),
      has_timeline: /\btoday|\btomorrow|\bthis week|\bnext week|\b asap/i.test(text),
      asking_for_recommendations: /\brecommend|\bsuggestion|\bwho\s+(can|knows)|\blooking\s+for/i.test(text),
      ready_to_hire: /\bhire|\bneed\s+(someone|a\s+\w+)|\blooking\s+to|\bwant\s+to\s+get/i.test(text),
      comparing_quotes: /\bquote|\bestimate|\bprice|\bcompare|\bcheapest/i.test(text),
      has_contact_info: CONTACT_PATTERNS.phone.test(text) || CONTACT_PATTERNS.email.test(text)
    };
  }

  private extractKeywords(text: string): string[] {
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return [...new Set(tokens
      .filter(t => t.length > 3 && !stopWords.has(t))
      .map(t => this.stemmer.stem(t))
    )].slice(0, 20);
  }

  private calculateSpamProbability(text: string): number {
    let spamScore = 0;
    const lowerText = text.toLowerCase();

    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(text)) {
        spamScore += 0.3;
      }
    }

    // All caps check
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.7) spamScore += 0.2;

    // Excessive punctuation
    if ((text.match(/[!]/g) || []).length > 5) spamScore += 0.1;

    // URL density
    const urlCount = (text.match(/https?:\/\//g) || []).length;
    if (urlCount > 2) spamScore += urlCount * 0.1;

    return Math.min(spamScore, 1);
  }

  private createSpamResult(spamProbability: number): IntentDetectionResult {
    return {
      serviceCategory: null,
      serviceConfidence: 0,
      urgency: 'low',
      urgencyScore: 0,
      budget: 'standard',
      budgetConfidence: 0,
      locations: [],
      postcodes: [],
      locationConfidence: 0,
      contactAvailable: false,
      phoneNumbers: [],
      emails: [],
      leadQualityScore: 0,
      spamProbability,
      isQualified: false,
      signals: {},
      entities: {},
      keywords: [],
      sentiment: 'neutral',
      confidence: 0
    };
  }

  private calculateOverallConfidence(
    serviceResult: { confidence: number },
    locationResult: { confidence: number },
    qualityScore: number
  ): number {
    return (
      serviceResult.confidence * 0.4 +
      locationResult.confidence * 0.3 +
      (qualityScore / 100) * 0.3
    );
  }
}

// Export singleton
export const intentDetector = new IntentDetector();
