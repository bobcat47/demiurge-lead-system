import { NextRequest, NextResponse } from 'next/server';
import { IntentLeadService } from '@/lib/intent-pipeline/intent-lead';
import { ProviderMatchingService } from '@/lib/intent-pipeline/provider-matching';

// POST /api/intent-leads/:id/match-provider - Find and create matches for an intent lead
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await IntentLeadService.getById(params.id);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Intent lead not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const minScore = body.minScore || 70;
    const maxResults = body.maxResults || 5;

    // Find matches
    const matches = await ProviderMatchingService.findMatches(lead, {
      minScore,
      maxResults
    });

    // Create deal matches
    const createdMatches = [];
    for (const match of matches) {
      try {
        const dealMatch = await ProviderMatchingService.createDealMatch(
          lead.id,
          match.providerId,
          match
        );
        createdMatches.push(dealMatch);
      } catch (error: any) {
        if (!error.message?.includes('already exists')) {
          console.error('Failed to create deal match:', error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      matchesFound: matches.length,
      matchesCreated: createdMatches.length,
      matches,
      dealMatches: createdMatches
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
