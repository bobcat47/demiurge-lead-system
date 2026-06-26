import { NextResponse } from 'next/server';
import { MatchmakerAgent } from '@/lib/intent-pipeline/matchmaker-agent';

// GET /api/matchmaker/status - Get matchmaker status
export async function GET() {
  try {
    const status = await MatchmakerAgent.getStatus();
    const history = await MatchmakerAgent.getLoopHistory(undefined, 10);

    return NextResponse.json({
      success: true,
      status,
      recentRuns: history
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
