import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL || '';
const pgPool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;

    if (!pgPool) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const client = await pgPool.connect();
    try {
      // Update lead status
      await client.query(
        `UPDATE leads SET status = 'approved', approved_at = NOW() WHERE id = $1`,
        [leadId]
      );

      // Update matches status
      await client.query(
        `UPDATE lead_matches SET status = 'approved' WHERE lead_id = $1 AND status = 'recommended'`,
        [leadId]
      );

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error approving lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
