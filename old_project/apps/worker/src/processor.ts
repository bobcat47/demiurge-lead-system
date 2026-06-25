/**
 * Lead Processor Worker
 * Processes raw posts through intent detection and provider matching
 */

import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { getDbClient, type RawPost, type Provider } from '@demiurge/database';
import { processRawPost, intentDetector, matchingEngine, outreachGenerator } from '@demiurge/core';
import { log } from 'crawlee';

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// Job queues
export const crawlQueue = new Queue('crawl-jobs', { connection: redis });
export const processQueue = new Queue('process-jobs', { connection: redis });
export const outreachQueue = new Queue('outreach-jobs', { connection: redis });

const db = getDbClient();

interface ProcessJobData {
  rawPostId: string;
  autoApprove?: boolean;
}

interface OutreachJobData {
  leadId: string;
  matchId: string;
  method: string;
  approved: boolean;
}

/**
 * Process a raw post through the intent detection pipeline
 */
export async function processPostJob(job: Job<ProcessJobData>): Promise<{
  leadId?: string;
  matchCount: number;
  qualified: boolean;
}> {
  const { rawPostId, autoApprove = false } = job.data;

  log.info(`Processing post: ${rawPostId}`);

  try {
    // Get raw post
    const { data: rawPost, error: postError } = await db.client
      .from('raw_posts')
      .select('*')
      .eq('id', rawPostId)
      .single();

    if (postError || !rawPost) {
      throw new Error(`Raw post not found: ${rawPostId}`);
    }

    // Update status
    await db.updatePostStatus(rawPostId, 'processing');

    // Get active providers
    const providers = await db.getProviders({ isActive: true });

    // Detect intent
    const intent = intentDetector.detectIntent(rawPost.content);

    // Check if qualified
    if (!intent.isQualified) {
      log.info(`Post ${rawPostId} not qualified (spam: ${intent.spamProbability})`);
      await db.updatePostStatus(rawPostId, intent.spamProbability > 0.5 ? 'spam' : 'irrelevant');
      return { matchCount: 0, qualified: false };
    }

    // Store parsed intent
    const parsedIntent = await db.createParsedIntent({
      raw_post_id: rawPostId,
      service_category: intent.serviceCategory,
      service_confidence: intent.serviceConfidence,
      urgency: intent.urgency,
      urgency_score: intent.urgencyScore,
      budget: intent.budget,
      budget_confidence: intent.budgetConfidence,
      locations: intent.locations,
      postcodes: intent.postcodes,
      detected_city: null, // Would need geocoding
      detected_state: null,
      location_confidence: intent.locationConfidence,
      contact_available: intent.contactAvailable,
      preferred_contact_method: null,
      phone_numbers: intent.phoneNumbers,
      emails: intent.emails,
      lead_quality_score: intent.leadQualityScore,
      spam_probability: intent.spamProbability,
      is_qualified: intent.isQualified,
      signals: intent.signals,
      entities: intent.entities,
      keywords: intent.keywords,
      sentiment: intent.sentiment,
      extractor_model: 'compromise-v14',
      extraction_confidence: intent.confidence
    });

    // Find provider matches
    const matches = matchingEngine.findMatches(
      {
        ...parsedIntent,
        detected_city: null,
        detected_state: null
      },
      providers,
      {
        minScore: 50,
        maxResults: 5
      }
    );

    // Create lead
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const lead = await db.createLead({
      raw_post_id: rawPostId,
      parsed_intent_id: parsedIntent.id,
      title: rawPost.title || `Lead: ${intent.serviceCategory}`,
      summary: rawPost.content.substring(0, 200) + '...',
      status: 'new',
      priority_score: intent.lead_quality_score,
      match_count: matches.length,
      top_match_score: matches[0]?.matchScore || 0,
      detected_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      assigned_to: null,
      notes: null,
      tags: []
    });

    // Create lead matches
    for (const match of matches) {
      const leadMatch = await db.createLeadMatch({
        lead_id: lead.id,
        provider_id: match.provider.id,
        match_score: match.matchScore,
        match_reasons: match.reasons,
        service_match_score: match.factors.find(f => f.name === 'service')?.score || 0,
        location_match_score: match.factors.find(f => f.name === 'location')?.score || 0,
        urgency_match_score: match.factors.find(f => f.name === 'urgency')?.score || 0,
        rating_match_score: match.factors.find(f => f.name === 'rating')?.score || 0,
        price_match_score: match.factors.find(f => f.name === 'price')?.score || 0,
        availability_match_score: match.factors.find(f => f.name === 'availability')?.score || 0,
        status: autoApprove && match.matchScore > 85 ? 'approved' : 'recommended'
      });

      // Queue outreach if auto-approved
      if (autoApprove && match.matchScore > 85) {
        await outreachQueue.add('send-outreach', {
          leadId: lead.id,
          matchId: leadMatch.id,
          method: match.provider.preferred_contact_method,
          approved: true
        });
      }
    }

    // Update post status
    await db.updatePostStatus(rawPostId, 'parsed');

    log.info(`Created lead ${lead.id} with ${matches.length} matches`);

    return {
      leadId: lead.id,
      matchCount: matches.length,
      qualified: true
    };

  } catch (error) {
    log.error(`Error processing post ${rawPostId}:`, error);
    await db.updatePostStatus(rawPostId, 'failed');
    throw error;
  }
}

/**
 * Process outreach job
 */
export async function processOutreachJob(job: Job<OutreachJobData>): Promise<{
  sent: boolean;
  method: string;
}> {
  const { leadId, matchId, method, approved } = job.data;

  if (!approved) {
    log.info(`Outreach not approved for lead ${leadId}`);
    return { sent: false, method };
  }

  try {
    // Get lead details
    const lead = await db.getLeadById(leadId);
    const match = lead.matches?.find(m => m.id === matchId);

    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    // Generate message
    const messages = outreachGenerator.generateMessages({
      provider: match.provider,
      intent: lead.parsed_intent,
      post: lead.raw_post,
      matchScore: match.match_score,
      matchReasons: match.match_reasons
    });

    const message = messages.find(m => m.method === method) || messages[0];

    if (!message) {
      throw new Error('No message generated');
    }

    // Log outreach attempt
    await db.client.from('outreach_logs').insert({
      lead_match_id: matchId,
      lead_id: leadId,
      provider_id: match.provider.id,
      method: message.method,
      subject: message.subject,
      content: message.body,
      status: 'pending',
      consent_basis: 'legitimate_interest',
      consent_documented: true
    });

    // Update match status
    await db.updateLeadMatchStatus(matchId, 'contacted');
    await db.updateLeadStatus(leadId, 'contacted');

    log.info(`Outreach queued for lead ${leadId} to ${match.provider.business_name}`);

    return { sent: true, method: message.method };

  } catch (error) {
    log.error(`Error sending outreach for lead ${leadId}:`, error);
    throw error;
  }
}

/**
 * Start the processor workers
 */
export function startWorkers(): void {
  // Process job worker
  const processWorker = new Worker<ProcessJobData>('process-jobs', processPostJob, {
    connection: redis,
    concurrency: 5
  });

  processWorker.on('completed', (job, result) => {
    log.info(`Process job ${job.id} completed:`, result);
  });

  processWorker.on('failed', (job, err) => {
    log.error(`Process job ${job?.id} failed:`, err);
  });

  // Outreach job worker
  const outreachWorker = new Worker<OutreachJobData>('outreach-jobs', processOutreachJob, {
    connection: redis,
    concurrency: 3
  });

  outreachWorker.on('completed', (job, result) => {
    log.info(`Outreach job ${job.id} completed:`, result);
  });

  outreachWorker.on('failed', (job, err) => {
    log.error(`Outreach job ${job?.id} failed:`, err);
  });

  log.info('Workers started');
}

/**
 * Queue posts for processing
 */
export async function queuePendingPosts(): Promise<number> {
  const { data: pendingPosts, error } = await db.client
    .from('raw_posts')
    .select('id')
    .eq('processing_status', 'pending')
    .limit(100);

  if (error) {
    throw error;
  }

  for (const post of pendingPosts || []) {
    await processQueue.add('process-post', {
      rawPostId: post.id
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
  }

  log.info(`Queued ${pendingPosts?.length || 0} posts for processing`);
  return pendingPosts?.length || 0;
}
