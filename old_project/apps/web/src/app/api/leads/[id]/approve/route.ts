import { NextResponse } from 'next/server';
import { createDatabaseClient } from '@demiurge/database';

const db = createDatabaseClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    const { error: leadError } = await db.client
      .from('leads')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (leadError) {
      return NextResponse.json({ error: 'Failed to approve lead' }, { status: 500 });
    }

    const { error: matchError } = await db.client
      .from('lead_matches')
      .update({ status: 'approved' })
      .eq('lead_id', leadId)
      .eq('status', 'recommended');

    if (matchError) {
      return NextResponse.json({ error: 'Failed to approve matches' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
