import { NextResponse } from 'next/server';
import { createDatabaseClient } from '@demiurge/database';

const db = createDatabaseClient();

export async function GET() {
  try {
    // Get total leads
    const { count: totalLeads } = await db.client
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // Get leads this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: leadsThisWeek } = await db.client
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('detected_at', oneWeekAgo.toISOString());

    // Get conversion rate
    const { count: converted } = await db.client
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'converted');

    // Get average match score
    const { data: avgScore } = await db.client
      .from('lead_matches')
      .select('match_score')
      .limit(1000);

    const avgMatchScore = avgScore && avgScore.length > 0
      ? avgScore.reduce((sum, m) => sum + m.match_score, 0) / avgScore.length
      : 0;

    // Get top services
    const { data: services } = await db.client
      .from('parsed_intents')
      .select('service_category')
      .not('service_category', 'is', null);

    const serviceCounts: Record<string, number> = {};
    services?.forEach((s: any) => {
      serviceCounts[s.service_category] = (serviceCounts[s.service_category] || 0) + 1;
    });

    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Get top locations
    const { data: locations } = await db.client
      .from('parsed_intents')
      .select('locations');

    const locationCounts: Record<string, number> = {};
    locations?.forEach((l: any) => {
      l.locations?.forEach((loc: string) => {
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      });
    });

    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      totalLeads: totalLeads || 0,
      leadsThisWeek: leadsThisWeek || 0,
      conversionRate: totalLeads ? (converted || 0) / totalLeads : 0,
      avgMatchScore,
      topServices,
      topLocations
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
