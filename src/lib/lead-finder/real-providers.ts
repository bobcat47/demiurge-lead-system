import { Lead, LeadSearchParams, LeadSearchResult } from './types';

// Provider configuration
interface ProviderConfig {
  type: 'google-places' | 'serpapi' | 'apify' | 'mock';
  apiKey?: string;
  enabled: boolean;
}

// Get provider configuration from environment
function getProviderConfig(): ProviderConfig {
  // Priority: GOOGLE_PLACES_API_KEY > SERPAPI_KEY > APIFY_TOKEN > mock
  if (process.env.GOOGLE_PLACES_API_KEY) {
    return { type: 'google-places', apiKey: process.env.GOOGLE_PLACES_API_KEY, enabled: true };
  }
  if (process.env.SERPAPI_KEY) {
    return { type: 'serpapi', apiKey: process.env.SERPAPI_KEY, enabled: true };
  }
  if (process.env.APIFY_TOKEN) {
    return { type: 'apify', apiKey: process.env.APIFY_TOKEN, enabled: true };
  }
  return { type: 'mock', enabled: true };
}

// Google Places API Provider
async function searchGooglePlaces(params: LeadSearchParams): Promise<LeadSearchResult> {
  const { Client } = await import('@googlemaps/google-maps-services-js');
  const client = new Client({});
  
  const apiKey = process.env.GOOGLE_PLACES_API_KEY!;
  
  try {
    // First, geocode the location
    const geocodeResponse = await client.geocode({
      params: {
        address: params.location,
        key: apiKey,
      },
    });
    
    const location = geocodeResponse.data.results[0]?.geometry.location;
    if (!location) {
      throw new Error('Location not found');
    }
    
    // Search for places
    const placesResponse = await client.placesNearby({
      params: {
        location: [location.lat, location.lng],
        radius: (params.radius || 5) * 1000, // Convert km to meters
        keyword: params.businessType,
        key: apiKey,
      },
    });
    
    const leads: Lead[] = await Promise.all(
      placesResponse.data.results.slice(0, params.limit || 20).map(async (place, index) => {
        // Get detailed place information
        const detailsResponse = await client.placeDetails({
          params: {
            place_id: place.place_id!,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'rating', 'user_ratings_total', 'opening_hours', 'photos', 'types'],
            key: apiKey,
          },
        });
        
        const details = detailsResponse.data.result;
        
        return {
          id: `LD-${Date.now()}-${index}`,
          businessName: details.name || place.name || 'Unknown',
          businessType: params.businessType,
          category: place.types?.[0] || params.businessType,
          address: details.formatted_address || place.vicinity || '',
          location: params.location,
          phone: details.formatted_phone_number || undefined,
          website: details.website || undefined,
          rating: details.rating || place.rating || undefined,
          reviewCount: details.user_ratings_total || undefined,
          source: 'Google Places API',
          leadScore: calculateRealLeadScore(details),
          status: 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          openingHours: details.opening_hours?.weekday_text ? 
            Object.fromEntries(details.opening_hours.weekday_text.map((day: string) => {
              const [weekday, hours] = day.split(': ');
              return [weekday, hours];
            })) : undefined,
          services: place.types?.slice(0, 3) || [params.businessType],
        };
      })
    );
    
    return {
      leads,
      total: leads.length,
      query: params,
      searchId: `SEARCH-GP-${Date.now()}`,
    };
  } catch (error) {
    console.error('Google Places API error:', error);
    throw error;
  }
}

// SerpAPI Provider
async function searchSerpAPI(params: LeadSearchParams): Promise<LeadSearchResult> {
  const { getJson } = await import('serpapi');
  
  try {
    const response = await getJson('google_maps', {
      api_key: process.env.SERPAPI_KEY,
      q: params.businessType,
      ll: `@40.7455096,-74.0083012,14z`, // This would be dynamic based on location
      hl: 'en',
      type: 'search',
    });
    
    const leads: Lead[] = (response.local_results || []).slice(0, params.limit || 20).map((result: any, index: number) => ({
      id: `LD-${Date.now()}-${index}`,
      businessName: result.title || 'Unknown',
      businessType: params.businessType,
      category: result.type || params.businessType,
      address: result.address || '',
      location: params.location,
      phone: result.phone || undefined,
      website: result.website || result.link || undefined,
      rating: result.rating || undefined,
      reviewCount: result.reviews || undefined,
      source: 'SerpAPI / Google Maps',
      leadScore: calculateRealLeadScore({
        rating: result.rating,
        reviews: result.reviews,
        website: result.website,
        phone: result.phone,
      }),
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      services: [params.businessType],
    }));
    
    return {
      leads,
      total: leads.length,
      query: params,
      searchId: `SEARCH-SERP-${Date.now()}`,
    };
  } catch (error) {
    console.error('SerpAPI error:', error);
    throw error;
  }
}

// Apify Provider
async function searchApify(params: LeadSearchParams): Promise<LeadSearchResult> {
  // Use the existing Apify scraper from the project
  const { ApifyScraper } = await import('../scrapers/apify-scraper');
  
  const scraper = new ApifyScraper(process.env.APIFY_TOKEN!);
  
  try {
    const apifyLeads = await scraper.scrapeGoogleMaps(
      [`${params.businessType} in ${params.location}`],
      { maxResults: params.limit || 20 }
    );
    
    const leads: Lead[] = apifyLeads.map((result, index) => ({
      id: `LD-${Date.now()}-${index}`,
      businessName: result.name,
      businessType: params.businessType,
      category: result.categories?.[0] || params.businessType,
      address: result.address || '',
      location: params.location,
      phone: result.phone || undefined,
      website: result.website || undefined,
      email: result.email || undefined,
      rating: typeof result.rating === 'number' ? result.rating : undefined,
      reviewCount: result.reviewsCount || undefined,
      source: 'Apify / Google Maps',
      leadScore: calculateRealLeadScore({
        rating: result.rating,
        reviews: result.reviewsCount,
        website: result.website,
        phone: result.phone,
        email: result.email,
      }),
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      latitude: result.latitude,
      longitude: result.longitude,
      services: result.categories || [params.businessType],
    }));
    
    return {
      leads,
      total: leads.length,
      query: params,
      searchId: `SEARCH-APIFY-${Date.now()}`,
    };
  } catch (error) {
    console.error('Apify error:', error);
    throw error;
  }
}

// Calculate lead score for real data
function calculateRealLeadScore(data: any): number {
  let score = 50;
  
  if (data.rating >= 4.5) score += 20;
  else if (data.rating >= 4.0) score += 15;
  else if (data.rating >= 3.5) score += 10;
  
  if (data.reviews > 100) score += 15;
  else if (data.reviews > 50) score += 10;
  else if (data.reviews > 20) score += 5;
  
  if (data.website) score += 10;
  if (data.phone) score += 5;
  if (data.email) score += 5;
  
  return Math.min(score, 100);
}

// Main search function that selects the appropriate provider
export async function searchWithRealProvider(params: LeadSearchParams): Promise<LeadSearchResult> {
  const config = getProviderConfig();
  
  console.log(`Using provider: ${config.type}`);
  
  switch (config.type) {
    case 'google-places':
      return await searchGooglePlaces(params);
    case 'serpapi':
      return await searchSerpAPI(params);
    case 'apify':
      return await searchApify(params);
    default:
      throw new Error('No real data provider configured');
  }
}

// Check if real provider is available
export function isRealProviderAvailable(): boolean {
  const config = getProviderConfig();
  return config.type !== 'mock' && config.enabled;
}

// Get current provider name
export function getCurrentProviderName(): string {
  const config = getProviderConfig();
  return config.type;
}
