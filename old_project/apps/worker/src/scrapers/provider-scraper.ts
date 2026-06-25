/**
 * Provider Discovery Scraper
 * 
 * Discovers local businesses/providers from Google Maps and other sources.
 * Integrates local-leads-finder logic into Demiurge Lead Matcher.
 */

import { DecodoClient, parseGoogleMapsResults, GoogleMapsBusiness } from './decodo-client.js';
import { getDbClient } from '@demiurge/database';

export interface ProviderDiscoveryOptions {
  query: string;
  city: string;
  country?: string;
  limit?: number;
  enrich?: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface ScrapedProvider {
  externalId: string;
  source: string;
  businessName: string;
  category?: string;
  services: string[];
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  googleMapsUrl?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: Record<string, string>;
  thumbnail?: string;
  raw: any;
}

export interface ScrapingProgress {
  searchId: string;
  status: 'initializing' | 'searching' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  resultsFound: number;
  uniqueCount: number;
  error?: string;
}

// In-memory progress tracking (replace with Redis in production)
const searchProgress = new Map<string, ScrapingProgress>();

export class ProviderScraper {
  private client: DecodoClient;
  private db = getDbClient();

  constructor(client: DecodoClient) {
    this.client = client;
  }

  /**
   * Generate unique search ID
   */
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Build geo string for Decodo API
   */
  private buildGeo(
    city: string,
    country?: string,
    latitude?: number,
    longitude?: number
  ): string {
    if (latitude !== undefined && longitude !== undefined) {
      return `${latitude},${longitude}`;
    }
    
    if (country && city) {
      return `${city}, ${country}`;
    }
    
    return city;
  }

  /**
   * Derive locale from country code
   */
  private deriveLocale(country?: string): string {
    const locales: Record<string, string> = {
      'US': 'en-US',
      'CA': 'en-CA',
      'GB': 'en-GB',
      'UK': 'en-GB',
      'AU': 'en-AU',
      'NZ': 'en-NZ',
      'IE': 'en-IE'
    };
    
    return country ? (locales[country] || 'en-US') : 'en-US';
  }

  /**
   * Derive domain from country code
   */
  private deriveDomain(country?: string): string {
    const domains: Record<string, string> = {
      'US': 'com',
      'CA': 'ca',
      'GB': 'co.uk',
      'UK': 'co.uk',
      'AU': 'com.au',
      'NZ': 'co.nz',
      'IE': 'ie'
    };
    
    return country ? (domains[country] || 'com') : 'com';
  }

  /**
   * Transform Google Maps business to ScrapedProvider
   */
  private transformBusiness(business: GoogleMapsBusiness): ScrapedProvider {
    // Extract city from address if available
    let city: string | undefined;
    let postcode: string | undefined;
    
    if (business.address) {
      // Simple extraction - can be improved with proper address parsing
      const parts = business.address.split(',');
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1].trim();
        const zipMatch = lastPart.match(/\b\d{5}(-\d{4})?\b/);
        if (zipMatch) {
          postcode = zipMatch[0];
        }
      }
    }

    // Build Google Maps URL
    let googleMapsUrl: string | undefined;
    if (business.cid) {
      googleMapsUrl = `https://www.google.com/maps?cid=${business.cid}`;
    } else if (business.place_id) {
      googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${business.place_id}`;
    }

    // Extract services from category
    const services: string[] = [];
    if (business.category) {
      services.push(business.category);
    }

    return {
      externalId: business.place_id || business.cid || `unknown_${Date.now()}`,
      source: 'google_maps',
      businessName: business.title || business.name || 'Unknown Business',
      category: business.category,
      services,
      address: business.address,
      city,
      postcode,
      latitude: business.latitude,
      longitude: business.longitude,
      phone: business.phone,
      website: business.website,
      googleMapsUrl,
      rating: business.rating,
      reviewCount: business.reviews_count,
      openingHours: business.open_hours,
      thumbnail: business.thumbnail,
      raw: business
    };
  }

  /**
   * Search for providers
   */
  async searchProviders(
    options: ProviderDiscoveryOptions,
    onProgress?: (progress: ScrapingProgress) => void
  ): Promise<ScrapedProvider[]> {
    const searchId = this.generateSearchId();
    
    const progress: ScrapingProgress = {
      searchId,
      status: 'initializing',
      progress: 0,
      message: 'Initializing search...',
      resultsFound: 0,
      uniqueCount: 0
    };
    
    searchProgress.set(searchId, progress);
    onProgress?.(progress);

    try {
      progress.status = 'searching';
      progress.progress = 10;
      progress.message = `Searching Google Maps for '${options.query}' in ${options.city}...`;
      onProgress?.(progress);

      const geo = this.buildGeo(options.city, options.country, options.latitude, options.longitude);
      const locale = this.deriveLocale(options.country);
      const domain = this.deriveDomain(options.country);
      const searchQuery = options.city 
        ? `${options.query} ${options.city}`.trim() 
        : options.query;

      const result = await this.client.searchGoogleMaps(searchQuery, {
        geo,
        limit: options.limit || 20,
        locale,
        domain
      });

      if (!result.success) {
        throw new Error(result.error || 'Search failed');
      }

      progress.status = 'processing';
      progress.progress = 50;
      progress.message = 'Processing results...';
      onProgress?.(progress);

      // Parse results
      const businesses = parseGoogleMapsResults(result.data);
      const providers = businesses.map(b => this.transformBusiness(b));

      // Remove duplicates by externalId
      const seen = new Set<string>();
      const unique = providers.filter(p => {
        if (seen.has(p.externalId)) return false;
        seen.add(p.externalId);
        return true;
      });

      progress.status = 'completed';
      progress.progress = 100;
      progress.message = `Found ${unique.length} unique providers`;
      progress.resultsFound = providers.length;
      progress.uniqueCount = unique.length;
      onProgress?.(progress);

      return unique;
    } catch (error) {
      progress.status = 'error';
      progress.error = error instanceof Error ? error.message : 'Unknown error';
      progress.message = 'Search failed';
      onProgress?.(progress);
      throw error;
    }
  }

  /**
   * Save scraped providers to database
   */
  async saveProviders(providers: ScrapedProvider[], jobId: string): Promise<void> {
    for (const provider of providers) {
      try {
        await this.db.client.from('providers').upsert({
          provider_id: provider.externalId,
          business_name: provider.businessName,
          services: provider.services,
          service_areas: provider.city ? [provider.city] : [],
          city: provider.city,
          postcode: provider.postcode,
          country: provider.country,
          latitude: provider.latitude,
          longitude: provider.longitude,
          phone: provider.phone,
          email: provider.email,
          website: provider.website,
          google_maps_url: provider.googleMapsUrl,
          rating: provider.rating,
          review_count: provider.reviewCount,
          source: provider.source,
          scrape_job_id: jobId,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'provider_id'
        });
      } catch (error) {
        console.error(`Failed to save provider ${provider.externalId}:`, error);
      }
    }
  }

  /**
   * Get search progress
   */
  getProgress(searchId: string): ScrapingProgress | undefined {
    return searchProgress.get(searchId);
  }

  /**
   * Clean up old search progress
   */
  cleanupOldSearches(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    for (const [id, progress] of searchProgress.entries()) {
      const searchTime = parseInt(id.split('_')[1]);
      if (now - searchTime > maxAgeMs) {
        searchProgress.delete(id);
      }
    }
  }
}

/**
 * Create provider scraper instance
 */
export function createProviderScraper(): ProviderScraper | null {
  const { DecodoClient, isDecodoConfigured } = require('./decodo-client.js');
  
  if (!isDecodoConfigured()) {
    return null;
  }
  
  const client = new DecodoClient({
    username: process.env.DECODO_USERNAME!,
    password: process.env.DECODO_PASSWORD!,
    rps: parseFloat(process.env.DECODO_RPS || '1.0')
  });
  
  return new ProviderScraper(client);
}
