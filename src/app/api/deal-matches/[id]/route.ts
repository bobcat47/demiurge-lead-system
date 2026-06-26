import { NextRequest, NextResponse } from 'next/server';
import { DealMatchService } from '@/lib/intent-pipeline/deal-match';
import { ProviderMatchingService } from '@/lib/intent-pipeline/provider-matching';

// GET /api/deal-matches/:id - Get a deal match with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await DealMatchService.getById(params.id);
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Deal match not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/deal-matches/:id - Update deal match status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const match = await DealMatchService.updateStatus(
      params.id,
      body.status,
      body.metadata
    );

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Deal match not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, match });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
