import { NextResponse } from 'next/server';
import { createDatabaseClient } from '@demiurge/database';

const db = createDatabaseClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    const { error } = await db.client
      .from('leads')
      .update({ status: 'rejected' })
      .eq('id', leadId);

    if (error) {
      return NextResponse.json({ error: 'Failed to reject lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
