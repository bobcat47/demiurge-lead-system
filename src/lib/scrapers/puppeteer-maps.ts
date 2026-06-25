/**
 * Puppeteer-based Google Maps Scraper
 * No API keys required - uses headless browser automation
 * Based on: https://github.com/asiifdev/business-leads-ai-automation
 */

import puppeteer from 'puppeteer-core';

export interface BusinessLead {
  id?: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: string;
  reviews_count?: number;
  category?: string;
  email?: string;
  source: string;
  referenceLink?: string;
  hasWebsite: boolean;
  scrapedAt: string;
  city?: string;
  country?: string;
}

export interface ScraperOptions {
  maxResults?: number;
  headless?: boolean;
  delay?: number;
}

export class PuppeteerMapsScraper {
  private browser: any = null;
  private delay: number;
  private maxResults: number;

  constructor(options: ScraperOptions = {}) {
    this.delay = options.delay || 1500;
    this.maxResults = options.maxResults || 50;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async init(headless: boolean = true) {
    const launchOptions: any = {
      headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1280,800',
        '--disable-blink-features=AutomationControlled'
      ]
    };

    // Use system Chrome if available, otherwise puppeteer's bundled Chromium
    try {
      this.browser = await puppeteer.launch(launchOptions);
    } catch (e) {
      // Fallback for environments without Chrome
      console.log('Chrome not found, scraping will use fallback mode');
      throw new Error('Chrome/Chromium not available for scraping');
    }
  }

  async scrapeGoogleMaps(searchQuery: string, options: ScraperOptions = {}): Promise<BusinessLead[]> {
    if (!this.browser) await this.init(options.headless ?? true);

    const maxResults = options.maxResults || this.maxResults;
    const page = await this.browser.newPage();
    
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 800 });

    try {
      // Navigate to Google Maps
      await page.goto('https://www.google.com/maps/', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      await this.sleep(2000);

      // Sanitize and enter search query
      const safeQuery = String(searchQuery)
        .replace(/[\x00-\x1f<>"'`]/g, '')
        .substring(0, 200);
      
      console.log('🔍 Searching Google Maps:', safeQuery);

      // Find and use search box
      const searchBoxSelectors = [
        '#searchboxinput',
        'input[name="q"]',
        '[aria-label="Search Google Maps"]'
      ];
      
      let searchBox = null;
      for (const sel of searchBoxSelectors) {
        searchBox = await page.$(sel);
        if (searchBox) break;
      }

      if (searchBox) {
        await searchBox.click({ clickCount: 3 });
        await page.keyboard.type(safeQuery, { delay: 40 });
        await page.keyboard.press('Enter');
        await this.sleep(3000);
      }

      // Scroll to load more results
      await this.scrollResultsList(page, maxResults);

      // Extract business data
      const businesses = await page.$$eval(
        '.Nv2PK, [data-result-index]',
        (cards: any[]) => cards.map((card: any) => {
          // Name extraction
          const nameSelectors = ['.qBF1Pd', '.fontHeadlineSmall', '[class*="fontHeadline"]', 'h3'];
          let name = '';
          for (const s of nameSelectors) {
            const el = card.querySelector(s);
            if (el && el.textContent?.trim()) {
              name = el.textContent.trim();
              break;
            }
          }
          if (!name) return null;

          // Rating
          let rating = '';
          const rEl = card.querySelector('.MW4etd, [aria-label*="star"]');
          if (rEl) rating = rEl.textContent?.trim() || '';

          // Extract category from name/rating line
          let category = '';
          const categoryEl = card.querySelector('.W4Efsd');
          if (categoryEl) {
            const text = categoryEl.textContent || '';
            const parts = text.split('·');
            if (parts.length > 1) {
              category = parts[parts.length - 1].trim();
            }
          }

          // Address and phone
          let address = '', phone = '';
          for (const span of card.querySelectorAll('span')) {
            const t = span.textContent?.trim() || '';
            if (!t || t.length < 3) continue;
            
            // Phone detection
            if (!phone && /^[+\d]/.test(t) && t.replace(/\D/g, '').length >= 7) {
              phone = t;
              continue;
            }
            
            // Address detection
            if (!address && /\bJl\.|\bJalan\b|\bStreet\b|\bSt\.|\bRd\.|\bNo\.\s*\d/i.test(t)) {
              address = t.replace(/^[·•–]\s*/, '').trim();
            }
          }

          // Website and reference link
          let website = '', referenceLink = '';
          for (const a of card.querySelectorAll('a[href]')) {
            const href = (a as HTMLAnchorElement).href || '';
            if (href.includes('google.com/maps/place') && !referenceLink) {
              referenceLink = href;
            } else if (!website && /https?:\/\//.test(href) && !href.includes('google.com')) {
              website = href;
            }
          }

          return {
            name,
            address,
            phone,
            rating,
            category,
            website,
            referenceLink,
            hasWebsite: !!website,
            source: 'Google Maps (Puppeteer)',
            scrapedAt: new Date().toISOString()
          };
        }).filter(Boolean)
      ).catch(() => []);

      console.log(`✅ Extracted ${businesses.length} businesses from Google Maps`);
      await page.close();
      return this.deduplicateResults(businesses as BusinessLead[]);

    } catch (error) {
      console.error('❌ Google Maps scraping error:', (error as Error).message);
      await page.close();
      return [];
    }
  }

  private async scrollResultsList(page: any, maxResults: number) {
    const scrollSelectors = [
      '[role="feed"]',
      '.m6QErb.DxyBCb',
      '.m6QErb',
      '[aria-label*="Results"]'
    ];

    let container = null;
    for (const sel of scrollSelectors) {
      container = await page.$(sel);
      if (container) break;
    }

    if (!container) {
      // Fallback: scroll page body
      for (let i = 0; i < 8; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await this.sleep(1500);
      }
      return;
    }

    let prev = 0;
    let stale = 0;
    for (let i = 0; i < 60; i++) {
      await page.evaluate((el: any) => { el.scrollTop = el.scrollHeight; }, container);
      await this.sleep(1800);

      const count = await page.evaluate(() =>
        document.querySelectorAll('[data-result-index], .Nv2PK').length
      ).catch(() => 0);

      if (count >= maxResults) break;
      if (count === prev) {
        stale++;
        if (stale >= 3) break;
      } else {
        stale = 0;
      }
      prev = count;
    }
  }

  private deduplicateResults(results: BusinessLead[]): BusinessLead[] {
    const seen = new Set<string>();
    return results.filter(b => {
      const key = `${b.name.toLowerCase()}|${b.address.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '').replace(/^62/, '0').replace(/^0+/, '0');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
