import type { Provider, ParsedIntent, LeadMatch } from '@demiurge/database';

export interface MatchFactor {
  name: string;
  weight: number;
  score: number;
  reason?: string;
}

export interface MatchResult {
  provider: Provider;
  matchScore: number;
  factors: MatchFactor[];
  reasons: string[];
  riskFlags: string[];
}

export interface MatchingOptions {
  minScore?: number;
  maxResults?: number;
  requireAvailable?: boolean;
  preferEmergency?: boolean;
  locationRadiusKm?: number;
}

export class MatchingEngine {
  private static readonly SERVICE_WEIGHT = 35;
  private static readonly LOCATION_WEIGHT = 25;
  private static readonly URGENCY_WEIGHT = 15;
  private static readonly RATING_WEIGHT = 10;
  private static readonly PRICE_WEIGHT = 10;
  private static readonly AVAILABILITY_WEIGHT = 5;

  findMatches(
    intent: ParsedIntent,
    providers: Provider[],
    options: MatchingOptions = {}
  ): MatchResult[] {
    const {
      minScore = 50,
      maxResults = 5,
      requireAvailable = true,
      preferEmergency = intent.urgency === 'urgent' || intent.urgency === 'high',
      locationRadiusKm = 50
    } = options;

    const results: MatchResult[] = [];

    for (const provider of providers) {
      // Skip inactive providers
      if (!provider.is_active) continue;

      // Skip unavailable providers if required
      if (requireAvailable && provider.availability_status === 'unavailable') continue;

      const result = this.calculateMatch(intent, provider, {
        preferEmergency,
        locationRadiusKm
      });

      if (result.matchScore >= minScore) {
        results.push(result);
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    return results.slice(0, maxResults);
  }

  private calculateMatch(
    intent: ParsedIntent,
    provider: Provider,
    options: { preferEmergency: boolean; locationRadiusKm: number }
  ): MatchResult {
    const factors: MatchFactor[] = [];
    const reasons: string[] = [];
    const riskFlags: string[] = [];

    // 1. Service Match (35 points)
    const serviceMatch = this.calculateServiceMatch(intent, provider);
    factors.push({
      name: 'service',
      weight: MatchingEngine.SERVICE_WEIGHT,
      score: serviceMatch.score,
      reason: serviceMatch.reason
    });
    if (serviceMatch.reason) reasons.push(serviceMatch.reason);

    // 2. Location Match (25 points)
    const locationMatch = this.calculateLocationMatch(intent, provider, options.locationRadiusKm);
    factors.push({
      name: 'location',
      weight: MatchingEngine.LOCATION_WEIGHT,
      score: locationMatch.score,
      reason: locationMatch.reason
    });
    if (locationMatch.reason) reasons.push(locationMatch.reason);

    // 3. Urgency Match (15 points)
    const urgencyMatch = this.calculateUrgencyMatch(intent, provider, options.preferEmergency);
    factors.push({
      name: 'urgency',
      weight: MatchingEngine.URGENCY_WEIGHT,
      score: urgencyMatch.score,
      reason: urgencyMatch.reason
    });
    if (urgencyMatch.reason) reasons.push(urgencyMatch.reason);

    // 4. Rating Match (10 points)
    const ratingMatch = this.calculateRatingMatch(provider);
    factors.push({
      name: 'rating',
      weight: MatchingEngine.RATING_WEIGHT,
      score: ratingMatch.score,
      reason: ratingMatch.reason
    });
    if (ratingMatch.reason) reasons.push(ratingMatch.reason);

    // 5. Price Match (10 points)
    const priceMatch = this.calculatePriceMatch(intent, provider);
    factors.push({
      name: 'price',
      weight: MatchingEngine.PRICE_WEIGHT,
      score: priceMatch.score,
      reason: priceMatch.reason
    });
    if (priceMatch.reason) reasons.push(priceMatch.reason);

    // 6. Availability Match (5 points)
    const availabilityMatch = this.calculateAvailabilityMatch(provider);
    factors.push({
      name: 'availability',
      weight: MatchingEngine.AVAILABILITY_WEIGHT,
      score: availabilityMatch.score,
      reason: availabilityMatch.reason
    });
    if (availabilityMatch.reason) reasons.push(availabilityMatch.reason);

    // Calculate weighted total
    const totalScore = factors.reduce((sum, f) => {
      return sum + (f.score * f.weight / 100);
    }, 0);

    // Add conversion rate bonus
    const conversionBonus = this.calculateConversionBonus(provider);
    const finalScore = Math.min(Math.round(totalScore + conversionBonus), 100);

    // Risk flags
    if (provider.conversion_rate < 0.1 && provider.leads_received > 10) {
      riskFlags.push('Low historical conversion rate');
    }
    if (provider.avg_response_time_minutes && provider.avg_response_time_minutes > 120) {
      riskFlags.push('Slow response time');
    }
    if (provider.review_count < 5) {
      riskFlags.push('Limited reviews');
    }

    return {
      provider,
      matchScore: finalScore,
      factors,
      reasons: reasons.length > 0 ? reasons : ['General service match'],
      riskFlags
    };
  }

  private calculateServiceMatch(intent: ParsedIntent, provider: Provider): { score: number; reason?: string } {
    if (!intent.service_category) {
      return { score: 0 };
    }

    // Direct service match
    const hasExactMatch = provider.services.some(s => 
      s.toLowerCase() === intent.service_category?.toLowerCase()
    );

    if (hasExactMatch) {
      return { score: 100, reason: `Specializes in ${intent.service_category}` };
    }

    // Category match
    const hasCategoryMatch = provider.service_categories?.some(c =>
      c.toLowerCase() === intent.service_category?.toLowerCase()
    );

    if (hasCategoryMatch) {
      return { score: 85, reason: `Offers ${intent.service_category} services` };
    }

    // Keyword match
    const keywordMatch = provider.services.some(s =>
      s.toLowerCase().includes(intent.service_category!.toLowerCase()) ||
      intent.service_category!.toLowerCase().includes(s.toLowerCase())
    );

    if (keywordMatch) {
      return { score: 70, reason: `Related service available` };
    }

    // Preferred lead types match
    const preferredMatch = provider.preferred_lead_types?.some(t =>
      t.toLowerCase().includes(intent.service_category!.toLowerCase())
    );

    if (preferredMatch) {
      return { score: 60, reason: 'Service matches preferences' };
    }

    return { score: 0 };
  }

  private calculateLocationMatch(
    intent: ParsedIntent, 
    provider: Provider,
    radiusKm: number
  ): { score: number; reason?: string } {
    // Exact area match
    if (intent.locations.length > 0 && provider.service_areas) {
      for (const location of intent.locations) {
        const areaMatch = provider.service_areas.some(area =>
          area.toLowerCase() === location.toLowerCase() ||
          area.toLowerCase().includes(location.toLowerCase()) ||
          location.toLowerCase().includes(area.toLowerCase())
        );
        if (areaMatch) {
          return { score: 100, reason: `Serves ${location} area` };
        }
      }
    }

    // Postcode match
    if (intent.postcodes.length > 0 && provider.service_postcodes) {
      for (const pc of intent.postcodes) {
        const pcPrefix = pc.substring(0, 3).toUpperCase();
        const postcodeMatch = provider.service_postcodes.some(ppc =>
          ppc.toUpperCase().startsWith(pcPrefix)
        );
        if (postcodeMatch) {
          return { score: 90, reason: `Covers postcode ${pc}` };
        }
      }
    }

    // City match
    if (intent.detected_city && provider.city) {
      if (intent.detected_city.toLowerCase() === provider.city.toLowerCase()) {
        return { score: 80, reason: `Based in ${provider.city}` };
      }
    }

    // Geographic distance (if coordinates available)
    if (intent.locations.length > 0 && provider.latitude && provider.longitude) {
      // Would use haversine formula here with geocoded intent location
      // For now, assume partial match
      return { score: 50, reason: 'May service this area' };
    }

    // No location info = neutral
    if (intent.locations.length === 0 && intent.postcodes.length === 0) {
      return { score: 50 };
    }

    return { score: 0 };
  }

  private calculateUrgencyMatch(
    intent: ParsedIntent,
    provider: Provider,
    preferEmergency: boolean
  ): { score: number; reason?: string } {
    // Urgent request + emergency provider = perfect match
    if (['urgent', 'high'].includes(intent.urgency) && provider.emergency_available) {
      return { score: 100, reason: '24/7 emergency service available' };
    }

    // Fast response time
    if (intent.urgency === 'urgent') {
      if (provider.response_time?.includes('1 hour') || provider.response_time?.includes('30 min')) {
        return { score: 90, reason: `Fast response: ${provider.response_time}` };
      }
      if (provider.response_time?.includes('Same day')) {
        return { score: 70, reason: `Same-day response` };
      }
    }

    // Standard urgency with regular availability
    if (intent.urgency === 'medium' && provider.availability_status === 'available') {
      return { score: 80 };
    }

    // Low urgency is flexible
    if (intent.urgency === 'low') {
      return { score: 70 };
    }

    return { score: 40 };
  }

  private calculateRatingMatch(provider: Provider): { score: number; reason?: string } {
    if (!provider.rating) {
      return { score: 50 }; // Unknown = neutral
    }

    if (provider.rating >= 4.8) {
      return { score: 100, reason: `Excellent rating: ${provider.rating}/5` };
    }
    if (provider.rating >= 4.5) {
      return { score: 90, reason: `Great rating: ${provider.rating}/5` };
    }
    if (provider.rating >= 4.0) {
      return { score: 75, reason: `Good rating: ${provider.rating}/5` };
    }
    if (provider.rating >= 3.5) {
      return { score: 60 };
    }

    return { score: 40 };
  }

  private calculatePriceMatch(intent: ParsedIntent, provider: Provider): { score: number; reason?: string } {
    // Direct tier match
    if (intent.budget === provider.price_tier) {
      return { score: 100, reason: `Matches ${intent.budget} budget preference` };
    }

    // Adjacent tiers
    const tiers = ['budget', 'standard', 'premium', 'luxury'];
    const intentIdx = tiers.indexOf(intent.budget);
    const providerIdx = tiers.indexOf(provider.price_tier);

    if (Math.abs(intentIdx - providerIdx) === 1) {
      return { score: 70, reason: 'Near budget range' };
    }

    // No preference or unknown
    if (intent.budget === 'standard') {
      return { score: 80 };
    }

    return { score: 40 };
  }

  private calculateAvailabilityMatch(provider: Provider): { score: number; reason?: string } {
    switch (provider.availability_status) {
      case 'available':
        return { score: 100, reason: 'Currently available' };
      case 'busy':
        return { score: 60, reason: 'Limited availability' };
      case 'on_leave':
        return { score: 20 };
      case 'unavailable':
        return { score: 0 };
      default:
        return { score: 50 };
    }
  }

  private calculateConversionBonus(provider: Provider): number {
    // Bonus for providers with proven track record
    if (provider.conversion_rate > 0.5) return 5;
    if (provider.conversion_rate > 0.3) return 3;
    return 0;
  }

  // Generate match explanation
  generateExplanation(match: MatchResult): string {
    const parts: string[] = [];

    parts.push(`${match.provider.business_name} scores ${match.matchScore}% for this lead.`);
    
    if (match.reasons.length > 0) {
      parts.push(`Key factors: ${match.reasons.join(', ')}.`);
    }

    if (match.riskFlags.length > 0) {
      parts.push(`Note: ${match.riskFlags.join(', ')}.`);
    }

    return parts.join(' ');
  }
}

// Export singleton
export const matchingEngine = new MatchingEngine();
