import { NextResponse } from 'next/server';
import { searchLeads, searchMockLeads } from '@/lib/lead-finder';
import { searchWithRealProvider, isRealProviderAvailable, getCurrentProviderName } from '@/lib/lead-finder/real-providers';
import { LeadSearchParams } from '@/lib/lead-finder/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessType, location, radius, limit } = body;

    if (!businessType || !location) {
      return NextResponse.json(
        { error: 'Business type and location are required' },
        { status: 400 }
      );
    }

    const params: LeadSearchParams = {
      businessType: businessType.trim(),
      location: location.trim(),
      radius: radius || 5,
      limit: limit || 20,
    };

    // Try real provider first if available
    let result;
    let usedProvider = 'mock';
    let providerError: string | undefined;
    
    if (isRealProviderAvailable()) {
      const providerName = getCurrentProviderName();
      try {
        result = await searchWithRealProvider(params);
        usedProvider = providerName;
      } catch (error) {
        providerError = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Real provider ${providerName} failed, falling back to mock:`, providerError);
        result = await searchMockLeads(params);
        usedProvider = 'mock';
      }
    } else {
      result = await searchMockLeads(params);
    }

    return NextResponse.json({
      success: true,
      leads: result.leads,
      total: result.total,
      query: result.query,
      searchId: result.searchId,
      provider: usedProvider,
      providerError,
      usingMockData: usedProvider === 'mock',
    });
  } catch (error) {
    console.error('Lead search error:', error);
    return NextResponse.json(
      { error: 'Failed to search leads' },
      { status: 500 }
    );
  }
}
