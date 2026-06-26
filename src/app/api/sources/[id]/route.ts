import { NextRequest, NextResponse } from 'next/server';
import { SourceConfigService } from '@/lib/intent-pipeline/source-config';

// GET /api/sources/:id - Get a single source
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const source = await SourceConfigService.getById(params.id);
    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, source });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/sources/:id - Update a source
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const source = await SourceConfigService.update(params.id, {
      name: body.name,
      enabled: body.enabled,
      config: body.config,
      scan_interval_minutes: body.scan_interval_minutes,
      max_results: body.max_results,
      retry_attempts: body.retry_attempts
    });

    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, source });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/sources/:id - Delete a source
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await SourceConfigService.delete(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
