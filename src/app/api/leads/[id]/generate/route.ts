import { NextResponse } from 'next/server';
import { getLeadById, generateAIAnalysis } from '@/lib/lead-finder';

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

    const analysis = await generateAIAnalysis(lead);

    return NextResponse.json({
      success: true,
      analysis,
      message: 'AI proposal generated successfully',
    });
  } catch (error) {
    console.error('Generate AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI analysis' },
      { status: 500 }
    );
  }
}
