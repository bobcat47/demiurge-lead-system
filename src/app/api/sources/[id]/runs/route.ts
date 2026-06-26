import { NextResponse } from 'next/server';
import { SourceConfigService } from '@/lib/intent-pipeline/source-config';

// GET /api/sources/:id/runs - Get scan runs for a source
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const runs = await SourceConfigService.getScanRuns(params.id, limit);
    return NextResponse.json({ success: true, runs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
