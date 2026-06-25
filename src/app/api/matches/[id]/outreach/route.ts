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
    const matchId = params.id;
    const body = await request.json();
    const { method } = body;

    if (!pgPool) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const client = await pgPool.connect();
    try {
      // Get match details
      const matchResult = await client.query(
        `SELECT lead_id, provider_id FROM lead_matches WHERE id = $1`,
        [matchId]
      );

      if (matchResult.rows.length === 0) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }

      const match = matchResult.rows[0];

      // Create outreach log
      await client.query(
        `INSERT INTO outreach_logs (lead_match_id, lead_id, provider_id, method, status, consent_basis, consent_documented)
         VALUES ($1, $2, $3, $4, 'pending', 'legitimate_interest', true)`,
        [matchId, match.lead_id, match.provider_id, method]
      );

      // Update match status
      await client.query(
        `UPDATE lead_matches SET status = 'contacted', outreach_method = $1 WHERE id = $2`,
        [method, matchId]
      );

      // Update lead status
      await client.query(
        `UPDATE leads SET status = 'contacted' WHERE id = $1`,
        [match.lead_id]
      );

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in outreach API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
