import { NextRequest, NextResponse } from 'next/server';
import { SourceConfigService } from '@/lib/intent-pipeline/source-config';

// GET /api/sources - List all sources
export async function GET() {
  try {
    const sources = await SourceConfigService.getAll();
    return NextResponse.json({ success: true, sources });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/sources - Create a new source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const source = await SourceConfigService.create({
      name: body.name,
      type: body.type,
      enabled: body.enabled ?? true,
      config: body.config || {},
      scan_interval_minutes: body.scan_interval_minutes || 60,
      max_results: body.max_results || 100,
      retry_attempts: body.retry_attempts || 3
    });

    return NextResponse.json({ success: true, source });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
