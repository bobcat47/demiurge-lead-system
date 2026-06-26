import { NextResponse } from 'next/server';
import { SourceConfigService } from '@/lib/intent-pipeline/source-config';

// POST /api/sources/:id/scan - Trigger a scan for a source
export async function POST(
  request: Request,
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

    // Create a scan run
    const scanRun = await SourceConfigService.createScanRun(params.id);

    // In a real implementation, this would trigger the actual scanner
    // For now, we'll just mark it as started
    await SourceConfigService.updateScanRun(scanRun.id, 'running');

    return NextResponse.json({ 
      success: true, 
      message: 'Scan started',
      scanRun 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
