import { NextRequest, NextResponse } from 'next/server';
import { MatchmakerAgent } from '@/lib/intent-pipeline/matchmaker-agent';

// POST /api/matchmaker/run - Run the matchmaker loop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const loopType = body.type || 'all';

    let results;
    switch (loopType) {
      case 'matching':
        results = [await MatchmakerAgent.runMatchingLoop()];
        break;
      case 'scripts':
        results = [await MatchmakerAgent.runScriptGenerationLoop()];
        break;
      case 'notifications':
        results = [await MatchmakerAgent.runNotificationLoop()];
        break;
      case 'all':
      default:
        results = await MatchmakerAgent.runAllDue();
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Matchmaker ${loopType} loop completed`,
      results
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
