import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stats = await db.getStats();
    
    return NextResponse.json({
      crawlerStatus: 'running',
      lastCrawl: null,
      postsToday: 0,
      leadsToday: stats.totalLeads,
      activeSources: stats.activeSources,
      activeProviders: stats.activeProviders,
      queueSize: 0
    });
  } catch (error) {
    console.error('Error in status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
