import { NextResponse } from 'next/server';
import { getLeadById } from '@/lib/lead-finder';
import { generateAIAnalysisWithProvider } from '@/lib/ai/analysis-generator';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await getLeadById(params.id);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const analysis = await generateAIAnalysisWithProvider(lead);

    return NextResponse.json({
      success: true,
      analysis,
      message: 'AI proposal generated successfully',
    });
  } catch (error) {
    console.error('Generate AI analysis error:', error);
    
    // Check if it's an AI configuration error
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI analysis';
    const isConfigError = errorMessage.includes('unavailable') || errorMessage.includes('add a free AI provider');
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: isConfigError ? 'AI_NOT_CONFIGURED' : 'GENERATION_FAILED',
      },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
