import { NextRequest, NextResponse } from 'next/server';
import { DealMatchService } from '@/lib/intent-pipeline/deal-match';

// GET /api/deal-matches/:id/scripts - Get scripts for a deal match
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scripts = await DealMatchService.getScripts(params.id);
    return NextResponse.json({ success: true, scripts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/deal-matches/:id/scripts - Generate scripts for a deal match
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scripts = await DealMatchService.generateScripts(params.id);
    return NextResponse.json({ 
      success: true, 
      message: 'Scripts generated successfully',
      scripts 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
