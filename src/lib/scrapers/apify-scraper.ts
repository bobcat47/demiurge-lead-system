/**
 * Apify Integration for Lead Scraping
 * Uses Apify actors for various scraping tasks
 * Docs: https://docs.apify.com/
 */

export interface ApifyLead {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
  categories?: string[];
  email?: string;
  source: string;
  url?: string;
  scrapedAt: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface ApifyScraperOptions {
  maxResults?: number;
  proxy?: 'residential' | 'datacenter';
}

export class ApifyScraper {
  private apiToken: string;
  private baseUrl = 'https://api.apify.com/v2';

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async callActor(actorId: string, input: any): Promise<any> {
    const url = `${this.baseUrl}/acts/${actorId}/runs?token=${this.apiToken}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  private async waitForRun(runId: string, actorId: string, maxWaitMs: number = 120000): Promise<any> {
    const startTime = Date.now();
    const url = `${this.baseUrl}/acts/${actorId}/runs/${runId}?token=${this.apiToken}`;

    while (Date.now() - startTime < maxWaitMs) {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data.status === 'SUCCEEDED') {
        return data.data;
      }
      
      if (data.data.status === 'FAILED' || data.data.status === 'ABORTED') {
        throw new Error(`Apify run failed: ${data.data.statusMessage || 'Unknown error'}`);
      }

      await new Promise(r => setTimeout(r, 5000)); // Poll every 5 seconds
    }

    throw new Error('Timeout waiting for Apify run to complete');
  }

  private async getDatasetItems(datasetId: string): Promise<any[]> {
    const url = `${this.baseUrl}/datasets/${datasetId}/items?token=${this.apiToken}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Scrape Google Maps using Apify's Google Maps Scraper actor
   * Actor: apify/google-maps-scraper
   */
  async scrapeGoogleMaps(
    searchQueries: string[],
    options: ApifyScraperOptions = {}
  ): Promise<ApifyLead[]> {
    const actorId = 'compass~google-maps-scraper';
    const maxResults = options.maxResults || 50;

    const input = {
      searchStringsArray: searchQueries,
      maxCrawledPlaces: maxResults,
      maxImages: 0,
      scrapeContacts: true,
      scrapeReviews: false,
      scrapeTableReservationProvider: false,
      proxyConfig: {
        useApifyProxy: true,
        apifyProxyGroups: options.proxy === 'residential' ? ['RESIDENTIAL'] : ['SHADER'],
      },
      searchLocation: '',
      lat: null,
      lng: null,
      zoom: 10
    };

    console.log('🔍 Starting Apify Google Maps scraper...');
    const run = await this.callActor(actorId, input);
    console.log(`⏳ Waiting for run ${run.id}...`);
    
    const completedRun = await this.waitForRun(run.id, actorId);
    const items = await this.getDatasetItems(completedRun.defaultDatasetId);

    console.log(`✅ Retrieved ${items.length} results from Apify`);

    return items.map((item: any) => ({
      name: item.title || item.name || 'Unknown',
      address: item.address || '',
      phone: item.phone || item.phoneUnformatted || '',
      website: item.website || '',
      rating: item.totalScore || item.stars || 0,
      reviewsCount: item.reviewsCount || 0,
      categories: item.categories || [],
      email: item.email || '',
      source: 'Google Maps (Apify)',
      url: item.url || '',
      scrapedAt: new Date().toISOString(),
      city: item.city || '',
      country: item.countryCode || '',
      latitude: item.location?.lat,
      longitude: item.location?.lng
    }));
  }

  /**
   * Scrape Reddit posts for lead opportunities
   * Actor: apify/reddit-scraper
   */
  async scrapeReddit(
    subreddits: string[],
    keywords: string[],
    options: ApifyScraperOptions = {}
  ): Promise<any[]> {
    const actorId = 'trudax~reddit-scraper';

    const input = {
      searches: keywords.map(k => subreddits.map(s => `subreddit:${s} ${k}`)).flat(),
      maxPostCount: options.maxResults || 50,
      maxComments: 10,
      maxCommunitiesCount: 1,
      scrollTimeout: 40,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL']
      }
    };

    console.log('🔍 Starting Apify Reddit scraper...');
    const run = await this.callActor(actorId, input);
    console.log(`⏳ Waiting for run ${run.id}...`);

    const completedRun = await this.waitForRun(run.id, actorId);
    const items = await this.getDatasetItems(completedRun.defaultDatasetId);

    console.log(`✅ Retrieved ${items.length} Reddit posts`);
    return items;
  }

  /**
   * Scrape Facebook Groups for leads
   * Actor: apify/facebook-groups-scraper
   */
  async scrapeFacebookGroups(
    groupUrls: string[],
    options: ApifyScraperOptions = {}
  ): Promise<any[]> {
    const actorId = 'apify~facebook-groups-scraper';

    const input = {
      startUrls: groupUrls.map(url => ({ url })),
      resultsLimit: options.maxResults || 50,
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL']
      }
    };

    console.log('🔍 Starting Apify Facebook Groups scraper...');
    const run = await this.callActor(actorId, input);
    console.log(`⏳ Waiting for run ${run.id}...`);

    const completedRun = await this.waitForRun(run.id, actorId);
    const items = await this.getDatasetItems(completedRun.defaultDatasetId);

    console.log(`✅ Retrieved ${items.length} Facebook posts`);
    return items;
  }

  /**
   * Scrape Yellow Pages
   * Actor: apify/yellow-pages-scraper
   */
  async scrapeYellowPages(
    searchTerms: string[],
    locations: string[],
    options: ApifyScraperOptions = {}
  ): Promise<ApifyLead[]> {
    const actorId = 'epctex~yellow-pages-scraper';

    const input = {
      searches: searchTerms.flatMap(term => 
        locations.map(loc => `${term} in ${loc}`)
      ),
      maxItems: options.maxResults || 50,
      proxyConfiguration: {
        useApifyProxy: true
      }
    };

    console.log('🔍 Starting Apify Yellow Pages scraper...');
    const run = await this.callActor(actorId, input);
    console.log(`⏳ Waiting for run ${run.id}...`);

    const completedRun = await this.waitForRun(run.id, actorId);
    const items = await this.getDatasetItems(completedRun.defaultDatasetId);

    console.log(`✅ Retrieved ${items.length} Yellow Pages results`);

    return items.map((item: any) => ({
      name: item.name || item.title || 'Unknown',
      address: item.address?.full || item.address || '',
      phone: item.phone || item.phoneNumbers?.[0] || '',
      website: item.website || item.url || '',
      rating: item.rating || 0,
      reviewsCount: item.reviewsCount || 0,
      categories: item.categories || [item.category].filter(Boolean),
      email: item.email || '',
      source: 'Yellow Pages (Apify)',
      url: item.url || '',
      scrapedAt: new Date().toISOString(),
      city: item.address?.city || '',
      country: 'US'
    }));
  }
}
