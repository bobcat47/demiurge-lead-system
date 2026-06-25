import { NextResponse } from 'next/server';
import { createDatabaseClient } from '@demiurge/database';

const db = createDatabaseClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const body = await request.json();
    const { method } = body;

    // Get match details
    const { data: match, error: matchError } = await db.client
      .from('lead_matches')
      .select('*, lead:leads(*), provider:providers(*)')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Create outreach log
    const { error: logError } = await db.client
      .from('outreach_logs')
      .insert({
        lead_match_id: matchId,
        lead_id: match.lead_id,
        provider_id: match.provider_id,
        method,
        status: 'pending',
        consent_basis: 'legitimate_interest',
        consent_documented: true
      });

    if (logError) {
      return NextResponse.json({ error: 'Failed to queue outreach' }, { status: 500 });
    }

    // Update match status
    await db.client
      .from('lead_matches')
      .update({ status: 'contacted', outreach_method: method })
      .eq('id', matchId);

    await db.client
      .from('leads')
      .update({ status: 'contacted' })
      .eq('id', match.lead_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in outreach API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
