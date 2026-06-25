/**
 * Decodo Web Scraping API Client
 * Adapted from local-leads-finder for Demiurge Lead Matcher
 * 
 * Decodo (formerly ScraperAPI) provides structured data extraction
 * from Google Maps, Google Search, and custom URLs.
 */

import axios, { AxiosError } from 'axios';

export interface DecodoConfig {
  username: string;
  password: string;
  rps?: number;
  apiEndpoint?: string;
}

export interface ScrapeRequest {
  target: string;
  query?: string;
  geo?: string;
  parse?: boolean;
  [key: string]: any;
}

export interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  raw?: any;
}

export interface GoogleMapsBusiness {
  place_id?: string;
  cid?: string;
  title?: string;
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  latitude?: number;
  longitude?: number;
  category?: string;
  hours?: string;
  open_hours?: Record<string, string>;
  thumbnail?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  links?: {
    website?: string;
    phone?: string;
  };
}

export class DecodoUnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecodoUnauthorizedError';
  }
}

export class DecodoClient {
  private username: string;
  private password: string;
  private rps: number;
  private apiEndpoint: string;
  private lastRequestTime: number = 0;

  constructor(config: DecodoConfig) {
    this.username = config.username || process.env.DECODO_USERNAME || '';
    this.password = config.password || process.env.DECODO_PASSWORD || '';
    this.rps = config.rps || 1.0;
    this.apiEndpoint = config.apiEndpoint || 'https://scraper-api.decodo.com/v2/scrape';

    if (!this.username || !this.password) {
      throw new Error(
        'Decodo credentials required. Set DECODO_USERNAME and DECODO_PASSWORD env vars '
      );
    }
  }

  /**
   * Enforce rate limiting
   */
  private async rateLimit(): Promise<void> {
    if (this.rps > 0) {
      const minInterval = 1000 / this.rps;
      const elapsed = Date.now() - this.lastRequestTime;
      if (elapsed < minInterval) {
        await new Promise(resolve => setTimeout(resolve, minInterval - elapsed));
      }
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Make a scraping request
   */
  async scrape(request: ScrapeRequest): Promise<ScrapeResult> {
    await this.rateLimit();

    try {
      const response = await axios.post(
        this.apiEndpoint,
        request,
        {
          auth: {
            username: this.username,
            password: this.password
          },
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 401) {
          return {
            success: false,
            error: 'Decodo API rejected credentials. Check DECODO_USERNAME and DECODO_PASSWORD.',
            raw: axiosError.response.data
          };
        }

        return {
          success: false,
          error: `Scraper API request failed: ${axiosError.message}`,
          raw: axiosError.response?.data
        };
      }

      return {
        success: false,
        error: `Unexpected error: ${error}`
      };
    }
  }

  /**
   * Search Google Maps for businesses
   */
  async searchGoogleMaps(
    query: string,
    options: {
      geo?: string;
      limit?: number;
      locale?: string;
      domain?: string;
      pageFrom?: string;
    } = {}
  ): Promise<ScrapeResult> {
    return this.scrape({
      target: 'google_maps',
      query,
      geo: options.geo,
      limit: options.limit || 20,
      locale: options.locale || 'en-US',
      domain: options.domain || 'com',
      page_from: options.pageFrom || '1',
      google_results_language: 'en',
      google_nfpr: true
    });
  }

  /**
   * Search Google for general results
   */
  async searchGoogle(
    query: string,
    options: {
      geo?: string;
      domain?: string;
    } = {}
  ): Promise<ScrapeResult> {
    return this.scrape({
      target: 'google_search',
      query,
      geo: options.geo,
      domain: options.domain || 'com',
      parse: true
    });
  }

  /**
   * Scrape a custom URL
   */
  async scrapeUrl(
    url: string,
    options: {
      geo?: string;
      headless?: boolean;
      parse?: boolean;
    } = {}
  ): Promise<ScrapeResult> {
    return this.scrape({
      target: 'universal',
      url,
      geo: options.geo,
      headless: options.headless || false,
      parse: options.parse || false
    });
  }
}

/**
 * Parse Google Maps results into standardized format
 */
export function parseGoogleMapsResults(data: any): GoogleMapsBusiness[] {
  if (!data || !data.results) {
    return [];
  }

  return data.results.map((result: any) => {
    const business: GoogleMapsBusiness = {
      place_id: result.place_id,
      cid: result.cid,
      title: result.title,
      name: result.title,
      description: result.description,
      address: result.address,
      phone: result.phone || result.links?.phone,
      website: result.website || result.links?.website,
      rating: result.rating,
      reviews_count: result.reviews_count,
      category: result.category,
      hours: result.hours,
      open_hours: result.open_hours,
      thumbnail: result.thumbnail,
      gps_coordinates: result.gps_coordinates,
      links: result.links
    };

    // Extract coordinates if available
    if (result.gps_coordinates) {
      business.latitude = result.gps_coordinates.latitude;
      business.longitude = result.gps_coordinates.longitude;
    }

    return business;
  });
}

/**
 * Check if Decodo credentials are configured
 */
export function isDecodoConfigured(): boolean {
  return !!(process.env.DECODO_USERNAME && process.env.DECODO_PASSWORD);
}

/**
 * Get Decodo client instance
 */
export function getDecodoClient(): DecodoClient | null {
  if (!isDecodoConfigured()) {
    return null;
  }
  
  return new DecodoClient({
    username: process.env.DECODO_USERNAME!,
    password: process.env.DECODO_PASSWORD!,
    rps: parseFloat(process.env.DECODO_RPS || '1.0')
  });
}
