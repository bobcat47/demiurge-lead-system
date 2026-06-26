import { NextRequest, NextResponse } from 'next/server';
import { DealMatchService } from '@/lib/intent-pipeline/deal-match';

// GET /api/deal-matches - List deal matches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get('status') || undefined,
      minScore: searchParams.get('minScore') 
        ? parseInt(searchParams.get('minScore')!) 
        : undefined,
      limit: searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!) 
        : 100
    };

    const matches = await DealMatchService.getAll(filters);
    return NextResponse.json({ success: true, matches });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
