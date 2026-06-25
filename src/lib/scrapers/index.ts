/**
 * Lead Scraper Manager
 * Orchestrates multiple scraping sources for maximum lead coverage
 * 
 * Sources:
 * 1. Puppeteer (free, no API keys) - Google Maps
 * 2. Apify (user has token) - Google Maps, Reddit, Facebook, Yellow Pages
 * 3. Future: SerpAPI, ScrapingBee, etc.
 */

import { PuppeteerMapsScraper, BusinessLead as PuppeteerLead } from './puppeteer-maps';
import { ApifyScraper, ApifyLead } from './apify-scraper';

export type UnifiedLead = {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number | string;
  reviewsCount?: number;
  category?: string;
  categories?: string[];
  email?: string;
  source: string;
  sourceUrl?: string;
  scrapedAt: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  rawData?: any;
  // Social intent fields
  intentDetected?: boolean;
  intentService?: string;
  intentUrgency?: 'low' | 'medium' | 'high' | 'critical';
  intentText?: string;
  matchedProviders?: any[];
};

export interface ScrapeJob {
  id: string;
  query: string;
  city?: string;
  sources: ('puppeteer' | 'apify-maps' | 'apify-reddit' | 'apify-facebook' | 'apify-yellowpages')[];
  maxResults?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: UnifiedLead[];
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export class LeadScraperManager {
  private puppeteerScraper: PuppeteerMapsScraper | null = null;
  private apifyScraper: ApifyScraper | null = null;
  private jobs: Map<string, ScrapeJob> = new Map();

  constructor(apifyToken?: string) {
    if (apifyToken) {
      this.apifyScraper = new ApifyScraper(apifyToken);
    }
  }

  private getPuppeteerScraper(): PuppeteerMapsScraper {
    if (!this.puppeteerScraper) {
      this.puppeteerScraper = new PuppeteerMapsScraper();
    }
    return this.puppeteerScraper;
  }

  private getApifyScraper(): ApifyScraper {
    if (!this.apifyScraper) {
      throw new Error('Apify scraper not configured - missing API token');
    }
    return this.apifyScraper;
  }

  /**
   * Create a new scraping job
   */
  createJob(query: string, options: {
    city?: string;
    sources?: ScrapeJob['sources'];
    maxResults?: number;
  } = {}): ScrapeJob {
    const job: ScrapeJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      city: options.city,
      sources: options.sources || ['puppeteer', 'apify-maps'],
      maxResults: options.maxResults || 50,
      status: 'pending',
      progress: 0,
      results: []
    };

    this.jobs.set(job.id, job);
    return job;
  }

  /**
   * Get job status
   */
  getJob(id: string): ScrapeJob | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ScrapeJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => 
      (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0)
    );
  }

  /**
   * Run a scraping job
   */
  async runJob(jobId: string): Promise<ScrapeJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    if (job.status === 'running') throw new Error(`Job ${jobId} is already running`);

    job.status = 'running';
    job.startedAt = new Date();
    job.progress = 0;

    const searchQuery = job.city ? `${job.query} ${job.city}` : job.query;
    const allResults: UnifiedLead[] = [];

    try {
      // Run each source in parallel
      const promises: Promise<void>[] = [];

      if (job.sources.includes('puppeteer')) {
        promises.push(this.runPuppeteerScraper(searchQuery, job, allResults));
      }

      if (job.sources.includes('apify-maps')) {
        promises.push(this.runApifyMapsScraper([searchQuery], job, allResults));
      }

      if (job.sources.includes('apify-reddit')) {
        promises.push(this.runApifyRedditScraper(job.query, job, allResults));
      }

      if (job.sources.includes('apify-yellowpages')) {
        promises.push(this.runApifyYellowPagesScraper(job.query, job.city, job, allResults));
      }

      await Promise.all(promises);

      // Deduplicate results
      job.results = this.deduplicateResults(allResults);
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();

      console.log(`✅ Job ${jobId} completed with ${job.results.length} unique leads`);

    } catch (error) {
      job.status = 'failed';
      job.error = (error as Error).message;
      console.error(`❌ Job ${jobId} failed:`, job.error);
    }

    return job;
  }

  private async runPuppeteerScraper(query: string, job: ScrapeJob, results: UnifiedLead[]): Promise<void> {
    try {
      console.log('🎭 Starting Puppeteer scraper...');
      const scraper = this.getPuppeteerScraper();
      const puppeteerResults = await scraper.scrapeGoogleMaps(query, {
        maxResults: Math.ceil((job.maxResults || 50) / 2)
      });

      results.push(...puppeteerResults.map(r => this.normalizePuppeteerResult(r)));
      job.progress += 30;
      
      console.log(`✅ Puppeteer: ${puppeteerResults.length} leads`);
    } catch (error) {
      console.warn('⚠️ Puppeteer scraper failed:', (error as Error).message);
    }
  }

  private async runApifyMapsScraper(queries: string[], job: ScrapeJob, results: UnifiedLead[]): Promise<void> {
    try {
      if (!this.apifyScraper) return;
      
      console.log('🎬 Starting Apify Maps scraper...');
      const scraper = this.getApifyScraper();
      const apifyResults = await scraper.scrapeGoogleMaps(queries, {
        maxResults: Math.ceil((job.maxResults || 50) / 2)
      });

      results.push(...apifyResults.map(r => this.normalizeApifyResult(r)));
      job.progress += 30;
      
      console.log(`✅ Apify Maps: ${apifyResults.length} leads`);
    } catch (error) {
      console.warn('⚠️ Apify Maps scraper failed:', (error as Error).message);
    }
  }

  private async runApifyRedditScraper(query: string, job: ScrapeJob, results: UnifiedLead[]): Promise<void> {
    try {
      if (!this.apifyScraper) return;

      console.log('🔴 Starting Apify Reddit scraper...');
      const scraper = this.getApifyScraper();
      
      // Search for service requests on Reddit
      const subreddits = ['HomeImprovement', 'Plumbing', 'Electricians', 'HVAC', 'Construction'];
      const keywords = [
        `need ${query}`,
        `looking for ${query}`,
        `${query} recommendation`,
        `hire ${query}`,
        `${query} emergency`
      ];

      const redditResults = await scraper.scrapeReddit(subreddits, keywords, {
        maxResults: job.maxResults || 20
      });

      // Convert Reddit posts to leads (these are potential customers, not businesses)
      const redditLeads = redditResults.map(post => this.normalizeRedditResult(post, query));
      results.push(...redditLeads);
      job.progress += 20;

      console.log(`✅ Apify Reddit: ${redditLeads.length} leads`);
    } catch (error) {
      console.warn('⚠️ Apify Reddit scraper failed:', (error as Error).message);
    }
  }

  private async runApifyYellowPagesScraper(query: string, city: string | undefined, job: ScrapeJob, results: UnifiedLead[]): Promise<void> {
    try {
      if (!this.apifyScraper || !city) return;

      console.log('📒 Starting Apify Yellow Pages scraper...');
      const scraper = this.getApifyScraper();
      
      const ypResults = await scraper.scrapeYellowPages([query], [city], {
        maxResults: Math.ceil((job.maxResults || 50) / 3)
      });

      results.push(...ypResults.map(r => this.normalizeApifyResult(r)));
      job.progress += 20;

      console.log(`✅ Apify Yellow Pages: ${ypResults.length} leads`);
    } catch (error) {
      console.warn('⚠️ Apify Yellow Pages scraper failed:', (error as Error).message);
    }
  }

  private normalizePuppeteerResult(r: PuppeteerLead): UnifiedLead {
    return {
      name: r.name,
      address: r.address,
      phone: r.phone,
      website: r.website,
      rating: r.rating,
      reviewsCount: r.reviews_count,
      category: r.category,
      email: r.email,
      source: r.source,
      sourceUrl: r.referenceLink,
      scrapedAt: r.scrapedAt,
      city: r.city,
      country: r.country
    };
  }

  private normalizeApifyResult(r: ApifyLead): UnifiedLead {
    return {
      name: r.name,
      address: r.address,
      phone: r.phone,
      website: r.website,
      rating: r.rating,
      reviewsCount: r.reviewsCount,
      categories: r.categories,
      email: r.email,
      source: r.source,
      sourceUrl: r.url,
      scrapedAt: r.scrapedAt,
      city: r.city,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude
    };
  }

  private normalizeRedditResult(post: any, serviceQuery: string): UnifiedLead {
    // Detect intent from post
    const intentService = this.detectServiceFromText(post.body || post.title || '', serviceQuery);
    const urgency = this.detectUrgency(post.body || post.title || '');

    return {
      name: post.author || 'Unknown',
      source: 'Reddit (Apify)',
      scrapedAt: new Date().toISOString(),
      intentDetected: true,
      intentService,
      intentUrgency: urgency,
      intentText: `${post.title}\n${post.body || ''}`.substring(0, 500),
      rawData: post
    };
  }

  private detectServiceFromText(text: string, defaultService: string): string {
    const services = [
      'plumber', 'plumbing', 'electrician', 'electrical',
      'hvac', 'ac repair', 'heating', 'cooling',
      'roofer', 'roofing', 'locksmith', 'lock',
      'painter', 'painting', 'carpenter', 'handyman',
      'contractor', 'builder', 'remodeling', 'renovation'
    ];

    const lowerText = text.toLowerCase();
    for (const service of services) {
      if (lowerText.includes(service)) {
        return service;
      }
    }
    return defaultService;
  }

  private detectUrgency(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerText = text.toLowerCase();
    
    const criticalWords = ['emergency', 'urgent', 'asap', 'immediately', 'flooding', 'burst', 'broken pipe'];
    const highWords = ['need soon', 'this week', 'quickly', 'fast', 'urgent'];
    const mediumWords = ['planning', 'looking for', 'interested', 'considering'];

    if (criticalWords.some(w => lowerText.includes(w))) return 'critical';
    if (highWords.some(w => lowerText.includes(w))) return 'high';
    if (mediumWords.some(w => lowerText.includes(w))) return 'medium';
    return 'low';
  }

  private deduplicateResults(results: UnifiedLead[]): UnifiedLead[] {
    const seen = new Map<string, UnifiedLead>();
    
    for (const result of results) {
      const key = result.name.toLowerCase().trim();
      
      if (seen.has(key)) {
        // Merge with existing
        const existing = seen.get(key)!;
        if (!existing.phone && result.phone) existing.phone = result.phone;
        if (!existing.email && result.email) existing.email = result.email;
        if (!existing.website && result.website) existing.website = result.website;
        if (!existing.address && result.address) existing.address = result.address;
        // Combine sources
        if (!existing.source.includes(result.source)) {
          existing.source += `, ${result.source}`;
        }
      } else {
        seen.set(key, result);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Clean up scrapers
   */
  async close(): Promise<void> {
    if (this.puppeteerScraper) {
      await this.puppeteerScraper.close();
      this.puppeteerScraper = null;
    }
  }
}

// Export singleton instance
let scraperManager: LeadScraperManager | null = null;

export function getScraperManager(apifyToken?: string): LeadScraperManager {
  if (!scraperManager) {
    scraperManager = new LeadScraperManager(apifyToken || process.env.APIFY_TOKEN);
  }
  return scraperManager;
}

export * from './puppeteer-maps';
export * from './apify-scraper';
