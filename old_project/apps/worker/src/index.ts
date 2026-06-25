/**
 * Demiurge Worker - Main Entry Point
 * Runs crawler and processor workers
 */

import 'dotenv/config';
import cron from 'node-cron';
import { log } from 'crawlee';
import { crawler } from './crawler.js';
import { startWorkers, queuePendingPosts, crawlQueue, processQueue } from './processor.js';
import { getDbClient } from '@demiurge/database';

const db = getDbClient();

/**
 * Run crawler for all active sources
 */
async function runCrawlCycle(): Promise<void> {
  log.info('Starting crawl cycle...');

  try {
    const sources = await db.getActiveSources();
    log.info(`Found ${sources.length} active sources`);

    for (const source of sources) {
      // Check if it's time to crawl this source
      const lastCrawled = source.last_crawled_at ? new Date(source.last_crawled_at) : null;
      const frequencyMs = (source.crawl_frequency_minutes || 60) * 60 * 1000;
      
      if (lastCrawled && Date.now() - lastCrawled.getTime() < frequencyMs) {
        log.info(`Skipping ${source.name}, crawled recently`);
        continue;
      }

      // Create crawl job
      const job = await db.createCrawlJob({
        source_id: source.id,
        job_type: 'incremental',
        status: 'pending',
        urls_discovered: 0,
        urls_crawled: 0,
        posts_extracted: 0,
        posts_qualified: 0,
        errors_count: 0,
        crawler_version: '1.0.0',
        crawler_node: process.env.HOSTNAME || 'worker-1'
      });

      // Queue crawl job
      await crawlQueue.add('crawl-source', {
        sourceId: source.id,
        jobId: job.id
      }, {
        jobId: `crawl-${source.id}-${Date.now()}`,
        attempts: source.retry_attempts || 3
      });

      log.info(`Queued crawl for ${source.name}`);
    }
  } catch (error) {
    log.error('Error in crawl cycle:', error);
  }
}

/**
 * Run processor cycle
 */
async function runProcessCycle(): Promise<void> {
  log.info('Starting process cycle...');

  try {
    const queued = await queuePendingPosts();
    log.info(`Queued ${queued} posts for processing`);
  } catch (error) {
    log.error('Error in process cycle:', error);
  }
}

/**
 * Handle crawl job
 */
async function handleCrawlJob(job: any): Promise<void> {
  const { sourceId, jobId } = job.data;

  const { data: source, error } = await db.client
    .from('sources')
    .select('*')
    .eq('id', sourceId)
    .single();

  if (error || !source) {
    throw new Error(`Source ${sourceId} not found`);
  }

  await crawler.crawlSource({
    source,
    jobId,
    maxRequests: 100,
    maxDepth: 2
  });
}

/**
 * Main function
 */
async function main(): Promise<void> {
  log.info('╔════════════════════════════════════════════════╗');
  log.info('║   Demiurge Social Intent Lead Matcher Worker   ║');
  log.info('╚════════════════════════════════════════════════╝');

  // Start background workers
  startWorkers();

  // Schedule crawl cycle (every 15 minutes)
  cron.schedule('*/15 * * * *', () => {
    runCrawlCycle().catch(err => log.error('Crawl cycle error:', err));
  });

  // Schedule process cycle (every 5 minutes)
  cron.schedule('*/5 * * * *', () => {
    runProcessCycle().catch(err => log.error('Process cycle error:', err));
  });

  // Run initial cycles
  await runCrawlCycle();
  await runProcessCycle();

  log.info('Worker scheduler started');
  log.info('Crawl cycle: every 15 minutes');
  log.info('Process cycle: every 5 minutes');

  // Keep alive
  process.on('SIGINT', async () => {
    log.info('Shutting down gracefully...');
    process.exit(0);
  });
}

// Run main
main().catch(error => {
  log.error('Fatal error:', error);
  process.exit(1);
});
