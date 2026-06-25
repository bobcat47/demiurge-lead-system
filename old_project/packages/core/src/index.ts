export { IntentDetector, intentDetector, type IntentDetectionResult } from './intent-detector.js';
export { MatchingEngine, matchingEngine, type MatchResult, type MatchFactor } from './matching-engine.js';
export { OutreachGenerator, outreachGenerator, type GeneratedMessage, type OutreachContext } from './outreach.js';

// Lead processing pipeline
import type { RawPost, ParsedIntent, Lead, LeadMatch, Provider } from '@demiurge/database';
import { intentDetector, type IntentDetectionResult } from './intent-detector.js';
import { matchingEngine, type MatchResult } from './matching-engine.js';
import { outreachGenerator, type GeneratedMessage } from './outreach.js';

export interface ProcessedLead {
  rawPost: RawPost;
  intent: IntentDetectionResult;
  lead?: Lead;
  matches: MatchResult[];
  messages: Map<string, GeneratedMessage[]>;
}

export async function processRawPost(
  post: RawPost,
  providers: Provider[],
  options: {
    minMatchScore?: number;
    maxMatches?: number;
    autoApprove?: boolean;
  } = {}
): Promise<ProcessedLead> {
  // Step 1: Detect intent
  const intent = intentDetector.detectIntent(post.content);

  // Step 2: Find matches
  const matches = matchingEngine.findMatches(
    {
      service_category: intent.serviceCategory,
      urgency: intent.urgency,
      budget: intent.budget,
      locations: intent.locations,
      postcodes: intent.postcodes,
      lead_quality_score: intent.leadQualityScore
    } as ParsedIntent,
    providers,
    {
      minScore: options.minMatchScore || 50,
      maxResults: options.maxMatches || 5
    }
  );

  // Step 3: Generate outreach messages for each match
  const messages = new Map<string, GeneratedMessage[]>();
  for (const match of matches) {
    const context = {
      provider: match.provider,
      intent: {
        service_category: intent.serviceCategory,
        urgency: intent.urgency,
        budget: intent.budget,
        locations: intent.locations,
        postcodes: intent.postcodes,
        lead_quality_score: intent.leadQualityScore
      } as ParsedIntent,
      post,
      matchScore: match.matchScore,
      matchReasons: match.reasons
    };
    messages.set(match.provider.id, outreachGenerator.generateMessages(context));
  }

  return {
    rawPost: post,
    intent,
    matches,
    messages
  };
}
