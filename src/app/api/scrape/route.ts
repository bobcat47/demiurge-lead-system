import { NextResponse } from 'next/server';
import { getScraperManager, ScrapeJob } from '@/lib/scrapers';

// In-memory job storage (use Redis in production)
const jobs = new Map<string, ScrapeJob>();

/**
 * POST /api/scrape - Create a new scraping job
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, city, sources, maxResults } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get scraper manager with Apify token if available
    const manager = getScraperManager(process.env.APIFY_TOKEN);
    
    // Create job
    const job = manager.createJob(query, {
      city,
      sources: sources || ['puppeteer', 'apify-maps'],
      maxResults: maxResults || 50
    });

    // Store job reference
    jobs.set(job.id, job);

    // Start scraping asynchronously
    manager.runJob(job.id).then(() => {
      console.log(`Job ${job.id} completed`);
    }).catch(err => {
      console.error(`Job ${job.id} failed:`, err);
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      message: 'Scraping job started'
    });

  } catch (error) {
    console.error('Error creating scrape job:', error);
    return NextResponse.json(
      { error: 'Failed to create scraping job' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scrape - Get all jobs or specific job
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    const manager = getScraperManager();

    if (jobId) {
      // Get specific job
      const job = manager.getJob(jobId);
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ job });
    }

    // Get all jobs
    const allJobs = manager.getAllJobs();
    return NextResponse.json({ jobs: allJobs });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
