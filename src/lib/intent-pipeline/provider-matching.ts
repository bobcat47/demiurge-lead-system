/**
 * Provider Matching Service
 * Scores and matches providers against intent leads
 */

import { db } from '../db';
import { IntentLead } from './intent-lead';

export interface Provider {
  id: string;
  business_name: string;
  services: string[];
  service_areas?: string[];
  location_lat?: number;
  location_lng?: number;
  rating?: number;
  review_count?: number;
  is_active: boolean;
  is_verified?: boolean;
  phone?: string;
  email?: string;
  website?: string;
}

export interface MatchScore {
  providerId: string;
  providerName: string;
  totalScore: number;
  breakdown: {
    categoryFit: number;
    locationFit: number;
    reputation: number;
    availability: number;
    urgencyFit: number;
    manualBoost: number;
  };
  reasons: string[];
  distance?: number;
}

export interface DealMatch {
  id: string;
  intent_lead_id: string;
  provider_id: string;
  match_score: number;
  match_reasons: string[];
  distance_miles?: number;
  category_fit_score: number;
  location_fit_score: number;
  urgency_fit_score: number;
  availability_fit_score: number;
  reputation_fit_score: number;
  estimated_job_value?: number;
  proposed_commission_type: 'percentage' | 'fixed' | 'unknown';
  proposed_commission_value?: number;
  status: DealMatchStatus;
  provider_contact_permission: boolean;
  client_contact_permission: boolean;
  created_at: string;
  updated_at: string;
}

export type DealMatchStatus = 
  | 'new_match' 
  | 'notified_admin' 
  | 'provider_contacted' 
  | 'client_contacted'
  | 'provider_accepted' 
  | 'client_accepted' 
  | 'agreement_needed' 
  | 'introduced'
  | 'won' 
  | 'lost' 
  | 'dismissed';

// Scoring weights (must sum to 1.0)
const SCORE_WEIGHTS = {
  categoryFit: 0.35,
  locationFit: 0.25,
  reputation: 0.15,
  availability: 0.10,
  urgencyFit: 0.10,
  manualBoost: 0.05
};

// Service category synonyms for matching
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'plumber': ['plumbing', 'plumbers', 'drain', 'pipe', 'water heater', 'leak'],
  'electrician': ['electrical', 'electricians', 'wiring', 'circuit', 'lighting'],
  'locksmith': ['locks', 'keys', 'security', 'door'],
  'cleaner': ['cleaning', 'cleaners', 'housekeeping', 'maid'],
  'roofer': ['roofing', 'roofers', 'gutter', 'chimney'],
  'gardener': ['gardening', 'landscaping', 'lawn', 'tree', 'garden'],
  'builder': ['building', 'construction', 'renovation', 'contractor'],
  'handyman': ['handyman', 'repair', 'maintenance', 'odd jobs'],
  'pest_control': ['pest', 'exterminator', 'bugs', 'rodent'],
  'phone_repair': ['phone repair', 'screen repair', 'mobile repair'],
  'mechanic': ['auto repair', 'car repair', 'mechanic', 'garage'],
  'barber': ['barber', 'haircut', 'hairdresser', 'styling'],
  'fitness': ['personal trainer', 'gym', 'fitness', 'workout'],
  'pharmacy': ['pharmacy', 'chemist', 'drugstore']
};

export const ProviderMatchingService = {
  /**
   * Get all active providers
   */
  async getActiveProviders(): Promise<Provider[]> {
    return db.query('providers', {
      where: { is_active: true },
      orderBy: { column: 'business_name', direction: 'asc' }
    });
  },

  /**
   * Calculate match score between intent lead and provider
   */
  calculateMatchScore(lead: IntentLead, provider: Provider): MatchScore {
    const breakdown = {
      categoryFit: this.calculateCategoryFit(lead, provider),
      locationFit: this.calculateLocationFit(lead, provider),
      reputation: this.calculateReputationScore(provider),
      availability: this.calculateAvailabilityScore(provider),
      urgencyFit: this.calculateUrgencyFit(lead, provider),
      manualBoost: this.calculateManualBoost(lead, provider)
    };

    // Calculate weighted total
    const totalScore = Math.round(
      breakdown.categoryFit * SCORE_WEIGHTS.categoryFit +
      breakdown.locationFit * SCORE_WEIGHTS.locationFit +
      breakdown.reputation * SCORE_WEIGHTS.reputation +
      breakdown.availability * SCORE_WEIGHTS.availability +
      breakdown.urgencyFit * SCORE_WEIGHTS.urgencyFit +
      breakdown.manualBoost * SCORE_WEIGHTS.manualBoost
    );

    // Generate match reasons
    const reasons = this.generateMatchReasons(lead, provider, breakdown);

    // Calculate distance if coordinates available
    let distance: number | undefined;
    if (lead.location_lat && lead.location_lng && provider.location_lat && provider.location_lng) {
      distance = this.calculateDistance(
        lead.location_lat, lead.location_lng,
        provider.location_lat, provider.location_lng
      );
    }

    return {
      providerId: provider.id,
      providerName: provider.business_name,
      totalScore: Math.min(100, Math.max(0, totalScore)),
      breakdown,
      reasons,
      distance
    };
  },

  /**
   * Find best matching providers for an intent lead
   */
  async findMatches(lead: IntentLead, options: {
    minScore?: number;
    maxResults?: number;
  } = {}): Promise<MatchScore[]> {
    const minScore = options.minScore || 70;
    const maxResults = options.maxResults || 10;

    const providers = await this.getActiveProviders();
    
    const scores = providers.map(provider => 
      this.calculateMatchScore(lead, provider)
    );

    // Filter by minimum score and sort
    return scores
      .filter(score => score.totalScore >= minScore)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, maxResults);
  },

  /**
   * Create a deal match record
   */
  async createDealMatch(
    leadId: string, 
    providerId: string, 
    matchScore: MatchScore,
    estimatedValue?: number
  ): Promise<DealMatch> {
    // Check for existing match
    const existing = await db.query('deal_matches', {
      where: { 
        intent_lead_id: leadId,
        provider_id: providerId
      },
      limit: 1
    });

    if (existing.length > 0) {
      throw new Error('Deal match already exists for this lead-provider pair');
    }

    // Get default commission settings
    const settings = await db.query('system_settings', {
      where: { key: 'commission_default_percentage' }
    });
    const defaultCommission = settings[0]?.value || 10;

    const result = await db.insert('deal_matches', {
      intent_lead_id: leadId,
      provider_id: providerId,
      match_score: matchScore.totalScore,
      match_reasons: matchScore.reasons,
      distance_miles: matchScore.distance,
      category_fit_score: matchScore.breakdown.categoryFit,
      location_fit_score: matchScore.breakdown.locationFit,
      urgency_fit_score: matchScore.breakdown.urgencyFit,
      availability_fit_score: matchScore.breakdown.availability,
      reputation_fit_score: matchScore.breakdown.reputation,
      estimated_job_value: estimatedValue,
      proposed_commission_type: 'percentage',
      proposed_commission_value: defaultCommission,
      status: 'new_match',
      provider_contact_permission: false,
      client_contact_permission: false
    });

    // Update intent lead status
    await db.update('intent_leads', {
      where: { id: leadId },
      data: { 
        status: 'matched',
        matched_provider_id: providerId
      }
    });

    // Log event
    await db.insert('deal_match_events', {
      deal_match_id: result.id,
      event_type: 'created',
      payload: {
        match_score: matchScore.totalScore,
        provider_name: matchScore.providerName
      }
    });

    return result;
  },

  /**
   * Get deal matches for an intent lead
   */
  async getMatchesForLead(leadId: string): Promise<DealMatch[]> {
    return db.query('deal_matches', {
      where: { intent_lead_id: leadId },
      orderBy: { column: 'match_score', direction: 'desc' }
    });
  },

  /**
   * Get deal matches for a provider
   */
  async getMatchesForProvider(providerId: string): Promise<DealMatch[]> {
    return db.query('deal_matches', {
      where: { provider_id: providerId },
      orderBy: { column: 'created_at', direction: 'desc' }
    });
  },

  /**
   * Update deal match status
   */
  async updateMatchStatus(
    matchId: string, 
    status: DealMatchStatus,
    metadata?: Record<string, any>
  ): Promise<DealMatch | null> {
    const result = await db.update('deal_matches', {
      where: { id: matchId },
      data: { status }
    });

    if (result) {
      await db.insert('deal_match_events', {
        deal_match_id: matchId,
        event_type: 'status_changed',
        payload: { status, ...metadata }
      });
    }

    return result;
  },

  // ============ PRIVATE SCORING METHODS ============

  private calculateCategoryFit(lead: IntentLead, provider: Provider): number {
    const leadCategory = lead.service_category.toLowerCase();
    const providerServices = (provider.services || []).map(s => s.toLowerCase());

    // Direct match
    if (providerServices.some(s => s.includes(leadCategory) || leadCategory.includes(s))) {
      return 100;
    }

    // Synonym match
    const synonyms = CATEGORY_SYNONYMS[leadCategory] || [];
    for (const synonym of synonyms) {
      if (providerServices.some(s => s.includes(synonym) || synonym.includes(s))) {
        return 85;
      }
    }

    // Partial word match
    const leadWords = leadCategory.split(/\s+/);
    const matchCount = leadWords.filter(word => 
      providerServices.some(s => s.includes(word))
    ).length;

    if (matchCount > 0) {
      return Math.min(70, matchCount * 30);
    }

    return 20; // Low base score if no match
  },

  private calculateLocationFit(lead: IntentLead, provider: Provider): number {
    // If no location data, give neutral score
    if (!lead.location_text) return 60;

    // Check if provider services this area
    const providerAreas = (provider.service_areas || []).map(a => a.toLowerCase());
    const leadLocation = lead.location_text.toLowerCase();

    // Direct service area match
    if (providerAreas.some(area => 
      leadLocation.includes(area) || area.includes(leadLocation)
    )) {
      return 100;
    }

    // Distance-based scoring if coordinates available
    if (lead.location_lat && lead.location_lng && provider.location_lat && provider.location_lng) {
      const distance = this.calculateDistance(
        lead.location_lat, lead.location_lng,
        provider.location_lat, provider.location_lng
      );

      if (distance < 1) return 100;
      if (distance < 3) return 90;
      if (distance < 5) return 80;
      if (distance < 10) return 65;
      if (distance < 20) return 50;
      return 30;
    }

    // Default if location mentioned but no specific match
    return 50;
  },

  private calculateReputationScore(provider: Provider): number {
    if (!provider.rating) return 50; // Neutral if no rating

    // Base score from rating (0-5 scale to 0-100)
    let score = (provider.rating / 5) * 100;

    // Boost for high review count (indicates established business)
    if (provider.review_count) {
      if (provider.review_count > 100) score += 10;
      else if (provider.review_count > 50) score += 5;
      else if (provider.review_count > 20) score += 2;
    }

    // Verified bonus
    if (provider.is_verified) score += 10;

    return Math.min(100, score);
  },

  private calculateAvailabilityScore(provider: Provider): number {
    // Default to neutral if no data
    let score = 60;

    // Active status bonus
    if (provider.is_active) score += 20;

    // Verified providers are more likely to be available
    if (provider.is_verified) score += 10;

    // Contact info available indicates responsiveness
    if (provider.phone) score += 5;
    if (provider.email) score += 5;

    return Math.min(100, score);
  },

  private calculateUrgencyFit(lead: IntentLead, provider: Provider): number {
    // Higher urgency leads should match with more responsive/reputable providers
    const urgency = lead.urgency;
    const reputation = this.calculateReputationScore(provider);
    const availability = this.calculateAvailabilityScore(provider);

    if (urgency === 'emergency') {
      // For emergencies, require high reputation and availability
      return (reputation * 0.5 + availability * 0.5);
    } else if (urgency === 'high') {
      return (reputation * 0.4 + availability * 0.6);
    } else {
      // For normal urgency, be more lenient
      return 70;
    }
  },

  private calculateManualBoost(lead: IntentLead, provider: Provider): number {
    // Placeholder for future manual priority boosts
    // Could check a provider_priority table or similar
    return 50; // Neutral default
  },

  private generateMatchReasons(lead: IntentLead, provider: Provider, breakdown: any): string[] {
    const reasons: string[] = [];

    if (breakdown.categoryFit >= 90) {
      reasons.push(`Specializes in ${lead.service_category}`);
    } else if (breakdown.categoryFit >= 70) {
      reasons.push(`Offers related services to ${lead.service_category}`);
    }

    if (breakdown.locationFit >= 90) {
      reasons.push('Services the exact location');
    } else if (breakdown.locationFit >= 70) {
      reasons.push('Nearby service area');
    }

    if (breakdown.reputation >= 80) {
      reasons.push(`Highly rated (${provider.rating}★)`);
    }

    if (provider.is_verified) {
      reasons.push('Verified provider');
    }

    if (lead.urgency === 'emergency' || lead.urgency === 'high') {
      reasons.push(`Suitable for ${lead.urgency} priority jobs`);
    }

    return reasons.length > 0 ? reasons : ['General service match'];
  },

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
};
