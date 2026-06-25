/**
 * Provider Discovery Scraper (Client-side wrapper)
 * 
 * This is a browser-compatible wrapper that calls the API.
 * The actual scraping happens server-side.
 */

export interface ProviderDiscoveryOptions {
  query: string;
  city: string;
  country?: string;
  limit?: number;
}

export async function discoverProviders(options: ProviderDiscoveryOptions): Promise<{
  success: boolean;
  message: string;
  providers?: number;
  error?: string;
}> {
  const response = await fetch('/api/providers/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Discovery failed');
  }

  return data;
}
