export * from './types';
export * from './mock-provider';
export * from './real-providers';

import { LeadSearchParams, LeadSearchResult } from './types';
import { searchMockLeads } from './mock-provider';
import { searchWithRealProvider, isRealProviderAvailable, getCurrentProviderName } from './real-providers';

// Re-export for use in API routes
export { searchMockLeads };

// Unified search function - tries real providers first, falls back to mock
export async function searchLeads(params: LeadSearchParams): Promise<LeadSearchResult> {
  // Check if real provider is available
  if (isRealProviderAvailable()) {
    try {
      console.log(`Searching with real provider: ${getCurrentProviderName()}`);
      return await searchWithRealProvider(params);
    } catch (error) {
      console.warn('Real provider failed, falling back to mock data:', error);
      // Fall through to mock data
    }
  }
  
  // Use mock data
  console.log('Using mock data provider');
  return await searchMockLeads(params);
}

// Export provider info
export { isRealProviderAvailable, getCurrentProviderName };
