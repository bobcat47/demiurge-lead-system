/**
 * Free Google Maps Scraper (No API Key Required)
 * 
 * Uses puppeteer/playwright to scrape Google Maps directly
 * This is for educational purposes - respect robots.txt and rate limits
 */

import { PlaywrightCrawler, RequestQueue, Dataset } from 'crawlee';
import type { Provider } from '@demiurge/database';

export interface ScrapedBusiness {
  placeId?: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  latitude?: number;
  longitude?: number;
  hours?: string[];
  thumbnail?: string;
}

export interface FreeScraperOptions {
  query: string;
  location: string;
  maxResults?: number;
  headless?: boolean;
}

/**
 * Free Google Maps scraper using Crawlee + Playwright
 * No API key required - scrapes the public Google Maps website
 */
export async function scrapeGoogleMapsFree(
  options: FreeScraperOptions
): Promise<ScrapedBusiness[]> {
  const { query, location, maxResults = 20 } = options;
  const businesses: ScrapedBusiness[] = [];

  console.log(`[Free Scraper] Searching "${query}" in ${location}...`);

  const crawler = new PlaywrightCrawler({
    requestHandlerTimeoutSecs: 60,
    maxRequestsPerCrawl: maxResults,
    headless: true,

    async requestHandler({ page, request, log }) {
      log.info(`Processing: ${request.url}`);

      // Wait for results to load
      await page.waitForSelector('[data-result-index]', { timeout: 30000 });

      // Extract business data
      const results = await page.evaluate(() => {
        const items: ScrapedBusiness[] = [];
        const cards = document.querySelectorAll('[data-result-index]');

        cards.forEach((card) => {
          try {
            const name = card.querySelector('.fontHeadlineSmall')?.textContent?.trim() ||
                        card.querySelector('h3')?.textContent?.trim() ||
                        'Unknown';

            const address = card.querySelector('[data-item-id*="address"]')?.textContent?.trim() ||
                           card.querySelector('.W4Efsd:last-child')?.textContent?.trim();

            const phone = card.querySelector('[data-item-id*="phone"]')?.textContent?.trim();

            const website = card.querySelector('a[href*="website"]')?.getAttribute('href');

            const ratingText = card.querySelector('.MW4etd')?.textContent;
            const rating = ratingText ? parseFloat(ratingText.replace(',', '.')) : undefined;

            const reviewText = card.querySelector('.UY7F9')?.textContent;
            const reviewCount = reviewText ? 
              parseInt(reviewText.replace(/[()]/g, '').replace(/,/g, '')) : undefined;

            const category = card.querySelector('.W4Efsd:first-child')?.textContent?.trim();

            // Get place ID from nearby button
            const nearbyBtn = card.querySelector('button[data-value*="Nearby"]');
            const placeId = nearbyBtn?.getAttribute('data-value')?.match(/0x[\w:]+/)?.[0];

            items.push({
              name,
              address,
              phone,
              website: website ? decodeURIComponent(website) : undefined,
              rating,
              reviewCount,
              category,
              placeId
            });
          } catch (err) {
            console.error('Error parsing card:', err);
          }
        });

        return items;
      });

      businesses.push(...results);
      log.info(`Extracted ${results.length} businesses`);

      // Check if we need to load more
      if (businesses.length < maxResults) {
        const loadMoreBtn = await page.$('button[aria-label*="More results"]');
        if (loadMoreBtn) {
          await loadMoreBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    },

    failedRequestHandler({ request, log }) {
      log.error(`Request failed: ${request.url}`);
    },
  });

  // Build Google Maps search URL
  const searchQuery = encodeURIComponent(`${query} ${location}`);
  const url = `https://www.google.com/maps/search/${searchQuery}`;

  await crawler.run([{ url }]);

  console.log(`[Free Scraper] Found ${businesses.length} businesses`);
  return businesses.slice(0, maxResults);
}

/**
 * Scrape detailed business info from a place page
 */
export async function scrapeBusinessDetails(placeId: string): Promise<Partial<ScrapedBusiness>> {
  const url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  
  const crawler = new PlaywrightCrawler({
    headless: true,
    
    async requestHandler({ page, log }) {
      log.info(`Getting details for: ${placeId}`);

      await page.waitForSelector('[data-tab-index="0"]', { timeout: 30000 });

      const details = await page.evaluate(() => {
        const phone = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.includes('phone') || b.getAttribute('data-tooltip')?.includes('phone'))
          ?.textContent?.trim();

        const website = document.querySelector('a[aria-label*="Website"]')?.getAttribute('href');

        const hours: string[] = [];
        document.querySelectorAll('.t39EBf').forEach(el => {
          hours.push(el.textContent?.trim() || '');
        });

        return { phone, website, hours };
      });

      return details;
    }
  });

  const results: Partial<ScrapedBusiness>[] = [];
  await crawler.run([{ url }]);
  
  return results[0] || {};
}

/**
 * Alternative: Use DuckDuckGo Maps (no rate limiting)
 */
export async function scrapeDuckDuckGoMaps(
  query: string,
  location: string,
  maxResults: number = 20
): Promise<ScrapedBusiness[]> {
  const businesses: ScrapedBusiness[] = [];
  const searchQuery = encodeURIComponent(`${query} ${location}`);

  const crawler = new PlaywrightCrawler({
    headless: true,

    async requestHandler({ page, log }) {
      log.info('Scraping DuckDuckGo Maps...');

      // DuckDuckGo Maps URL
      const url = `https://duckduckgo.com/?q=${searchQuery}+near+${location}&ia=places`;
      await page.goto(url);

      await page.waitForSelector('.result', { timeout: 30000 });

      const results = await page.evaluate(() => {
        const items: ScrapedBusiness[] = [];
        const cards = document.querySelectorAll('.result');

        cards.forEach((card) => {
          const name = card.querySelector('h2 a')?.textContent?.trim();
          if (!name) return;

          const address = card.querySelector('.result__snippet')?.textContent?.trim();
          const phone = card.textContent?.match(/[\d\-\(\)\s]{10,}/)?.[0];
          const website = card.querySelector('a[href^="http"]')?.getAttribute('href');

          items.push({ name, address, phone, website });
        });

        return items;
      });

      businesses.push(...results);
    }
  });

  await crawler.run([]);
  return businesses.slice(0, maxResults);
}

/**
 * Transform scraped business to Provider format
 */
export function transformToProvider(business: ScrapedBusiness): Partial<Provider> {
  // Extract services from category
  const services: string[] = [];
  if (business.category) {
    services.push(business.category.toLowerCase());
  }

  // Parse location from address
  let city: string | undefined;
  let postcode: string | undefined;
  
  if (business.address) {
    const parts = business.address.split(',');
    if (parts.length >= 2) {
      city = parts[parts.length - 2].trim();
      const zipMatch = business.address.match(/\b\d{5}(-\d{4})?\b/);
      if (zipMatch) postcode = zipMatch[0];
    }
  }

  return {
    provider_id: business.placeId || `manual_${Date.now()}`,
    business_name: business.name,
    services,
    service_areas: city ? [city] : [],
    city,
    postcode,
    phone: business.phone,
    website: business.website,
    rating: business.rating,
    review_count: business.reviewCount,
    source: 'google_maps_free',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
