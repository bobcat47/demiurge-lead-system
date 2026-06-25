/**
 * Demiurge Crawler Worker
 * Uses Crawlee for robust web crawling and Crawl4AI for content extraction
 */

import { CheerioCrawler, RequestQueue, Dataset, log, Configuration } from 'crawlee';
import { createHash } from 'crypto';
import { getDbClient, type Source, type RawPost } from '@demiurge/database';
import { processRawPost } from '@demiurge/core';

// Configure logging
log.setLevel(log.LEVELS.INFO);

interface CrawlOptions {
  source: Source;
  jobId: string;
  maxRequests?: number;
  maxDepth?: number;
}

interface ExtractedPost {
  title: string | null;
  content: string;
  author: string | null;
  postedAt: Date | null;
  url: string;
  externalId: string | null;
}

export class SocialIntentCrawler {
  private db = getDbClient();

  async crawlSource(options: CrawlOptions): Promise<{
    postsExtracted: number;
    postsQualified: number;
    urlsCrawled: number;
    errors: string[];
  }> {
    const { source, jobId, maxRequests = 100, maxDepth = 2 } = options;
    const results = {
      postsExtracted: 0,
      postsQualified: 0,
      urlsCrawled: 0,
      errors: [] as string[]
    };

    log.info(`Starting crawl for source: ${source.name} (${source.source_type})`);

    // Update job status
    await this.db.updateCrawlJob(jobId, {
      status: 'running',
      started_at: new Date().toISOString()
    });

    try {
      // Configure crawler based on source type
      const crawlerConfig = this.getCrawlerConfig(source);

      const crawler = new CheerioCrawler({
        maxRequestsPerCrawl: maxRequests,
        maxRequestRetries: source.retry_attempts || 3,
        requestHandlerTimeoutSecs: 30,

        // Respect rate limits
        minConcurrency: 1,
        maxConcurrency: 2,

        preNavigationHooks: [
          async ({ request, page }) => {
            // Add delay between requests
            const delay = source.rate_limit_delay_ms || 1000;
            await new Promise(r => setTimeout(r, delay));
          }
        ],

        async requestHandler({ request, $, log: requestLog }) {
          results.urlsCrawled++;
          requestLog.info(`Processing: ${request.url}`);

          try {
            // Extract posts based on source type
            const posts = await this.extractPosts($, source, request.url);

            for (const post of posts) {
              results.postsExtracted++;

              // Check for duplicates
              const contentHash = createHash('md5')
                .update(post.content.trim().toLowerCase())
                .digest('hex');

              const duplicates = await this.db.findDuplicatePosts(contentHash);
              if (duplicates.length > 0) {
                requestLog.debug(`Duplicate found, skipping: ${post.url}`);
                continue;
              }

              // Store raw post
              const rawPost = await this.db.createRawPost({
                source_id: source.id,
                external_id: post.externalId,
                source_url: post.url,
                title: post.title,
                content: post.content,
                content_markdown: null,
                raw_html: null,
                author_name: post.author,
                author_id: null,
                posted_at: post.postedAt?.toISOString() || null,
                scraped_at: new Date().toISOString(),
                language: 'en',
                processing_status: 'pending',
                content_hash: contentHash,
                duplicate_of: null,
                similarity_score: null,
                word_count: post.content.split(/\s+/).length,
                has_contact_info: /\d{3}/.test(post.content) || /@/.test(post.content)
              });

              results.postsQualified++;
              requestLog.info(`Stored post: ${rawPost.id}`);
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            results.errors.push(`${request.url}: ${errorMsg}`);
            requestLog.error(`Error processing ${request.url}: ${errorMsg}`);
          }
        },

        async failedRequestHandler({ request, log: requestLog }) {
          results.errors.push(`${request.url}: Failed after retries`);
          requestLog.error(`Request failed: ${request.url}`);
        }
      });

      // Add initial URL
      await crawler.addRequests([{
        url: source.base_url,
        userData: { depth: 0 }
      }]);

      // Run crawler
      await crawler.run();

      // Update source stats
      await this.db.client
        .from('sources')
        .update({
          last_crawled_at: new Date().toISOString(),
          posts_crawled: source.posts_crawled + results.postsExtracted,
          posts_qualified: source.posts_qualified + results.postsQualified
        })
        .eq('id', source.id);

      // Complete job
      await this.db.updateCrawlJob(jobId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        urls_crawled: results.urlsCrawled,
        posts_extracted: results.postsExtracted,
        posts_qualified: results.postsQualified,
        errors_count: results.errors.length
      });

      log.info(`Crawl completed for ${source.name}: ${results.postsQualified} qualified posts`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.error(`Crawl failed for ${source.name}: ${errorMsg}`);

      await this.db.updateCrawlJob(jobId, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMsg,
        stack_trace: error instanceof Error ? error.stack : undefined
      });

      results.errors.push(errorMsg);
    }

    return results;
  }

  private getCrawlerConfig(source: Source): any {
    const configs: Record<string, any> = {
      reddit: {
        // Reddit-specific selectors and behavior
        respectRobotsTxt: true,
        additionalMimeTypes: ['text/html']
      },
      forum: {
        // Generic forum selectors
        respectRobotsTxt: true
      },
      website: {
        respectRobotsTxt: source.respect_robots_txt ?? true
      },
      directory: {
        respectRobotsTxt: true
      }
    };

    return configs[source.source_type] || configs.website;
  }

  private async extractPosts($: cheerio.Root, source: Source, url: string): Promise<ExtractedPost[]> {
    const extractors: Record<string, () => ExtractedPost[]> = {
      reddit: () => this.extractRedditPosts($, url),
      forum: () => this.extractForumPosts($, url),
      website: () => this.extractGenericPosts($, url),
      directory: () => this.extractDirectoryPosts($, url),
      classifieds: () => this.extractClassifiedPosts($, url)
    };

    const extractor = extractors[source.source_type] || extractors.website;
    return extractor();
  }

  private extractRedditPosts($: cheerio.Root, baseUrl: string): ExtractedPost[] {
    const posts: ExtractedPost[] = [];

    // Reddit post selectors
    const postElements = $('[data-testid="post-container"], .Post, .thing');

    postElements.each((_, elem) => {
      const $elem = $(elem);
      
      const title = $elem.find('h3, [data-testid="post-title"], a.title').first().text().trim() || null;
      const content = $elem.find('[data-testid="post-content"], .usertext-body, .md').first().text().trim();
      const author = $elem.find('[data-testid="author-link"], a.author').first().text().trim() || null;
      const permalink = $elem.find('a[data-testid="post-title"], a.title').first().attr('href');
      const timestamp = $elem.find('time, [data-testid="post_timestamp"]').first().attr('datetime');
      const externalId = $elem.attr('data-fullname') || $elem.attr('id') || null;

      if (content && content.length > 20) {
        posts.push({
          title,
          content: title ? `${title}\n\n${content}` : content,
          author,
          postedAt: timestamp ? new Date(timestamp) : null,
          url: permalink ? new URL(permalink, baseUrl).href : baseUrl,
          externalId
        });
      }
    });

    return posts;
  }

  private extractForumPosts($: cheerio.Root, baseUrl: string): ExtractedPost[] {
    const posts: ExtractedPost[] = [];

    // Common forum post selectors
    const postElements = $('.post, .topic, .thread, article, [class*="post"], [class*="topic"]');

    postElements.each((_, elem) => {
      const $elem = $(elem);
      
      const title = $elem.find('h1, h2, h3, .title, .topic-title').first().text().trim() || null;
      const content = $elem.find('.content, .post-content, .message, .body, [class*="content"], [class*="text"]').first().text().trim();
      const author = $elem.find('.author, .username, .user, [class*="author"], [class*="user"]').first().text().trim() || null;
      const link = $elem.find('a[href]').first().attr('href');
      const timeText = $elem.find('time, .time, .date, .timestamp, [class*="time"], [class*="date"]').first().text().trim();

      if (content && content.length > 30) {
        posts.push({
          title,
          content: title ? `${title}\n\n${content}` : content,
          author,
          postedAt: timeText ? this.parseDate(timeText) : null,
          url: link ? new URL(link, baseUrl).href : baseUrl,
          externalId: $elem.attr('id') || null
        });
      }
    });

    return posts;
  }

  private extractGenericPosts($: cheerio.Root, baseUrl: string): ExtractedPost[] {
    const posts: ExtractedPost[] = [];

    // Look for content blocks that might be posts
    const contentBlocks = $('article, .post, .entry, [class*="content"], [class*="post"]');

    contentBlocks.each((_, elem) => {
      const $elem = $(elem);
      const text = $elem.text().trim();
      
      // Filter for service-related content
      if (this.isServiceRelated(text) && text.length > 50 && text.length < 5000) {
        posts.push({
          title: null,
          content: text,
          author: null,
          postedAt: null,
          url: baseUrl,
          externalId: null
        });
      }
    });

    return posts;
  }

  private extractDirectoryPosts($: cheerio.Root, baseUrl: string): ExtractedPost[] {
    // Similar to generic but with directory-specific selectors
    return this.extractGenericPosts($, baseUrl);
  }

  private extractClassifiedPosts($: cheerio.Root, baseUrl: string): ExtractedPost[] {
    const posts: ExtractedPost[] = [];

    // Common classified ad selectors
    const listings = $('.listing, .ad, .item, [class*="listing"], [class*="ad-"]');

    listings.each((_, elem) => {
      const $elem = $(elem);
      
      const title = $elem.find('h1, h2, h3, .title, .listing-title').first().text().trim() || null;
      const description = $elem.find('.description, .desc, .details, [class*="description"]').first().text().trim();
      const price = $elem.find('.price, [class*="price"]').first().text().trim();
      const location = $elem.find('.location, [class*="location"]').first().text().trim();

      let content = '';
      if (title) content += title + '\n';
      if (price) content += `Price: ${price}\n`;
      if (location) content += `Location: ${location}\n`;
      content += description;

      if (content.length > 30) {
        posts.push({
          title,
          content,
          author: null,
          postedAt: null,
          url: baseUrl,
          externalId: $elem.attr('id') || $elem.attr('data-id') || null
        });
      }
    });

    return posts;
  }

  private isServiceRelated(text: string): boolean {
    const serviceKeywords = [
      'plumber', 'electrician', 'hvac', 'roofing', 'landscaping', 'cleaning',
      'painting', 'pest control', 'moving', 'locksmith', 'repair', 'service',
      'contractor', 'handyman', 'renovation', 'remodel', 'installation',
      'looking for', 'need help', 'recommendation', 'hire', 'quote'
    ];

    const lowerText = text.toLowerCase();
    return serviceKeywords.some(kw => lowerText.includes(kw));
  }

  private parseDate(dateStr: string): Date | null {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }
}

// Crawler instance
export const crawler = new SocialIntentCrawler();
