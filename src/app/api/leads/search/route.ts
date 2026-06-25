import { NextResponse } from 'next/server';
import { searchLeads } from '@/lib/lead-finder';
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

    const result = await searchLeads(params);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Lead search error:', error);
    return NextResponse.json(
      { error: 'Failed to search leads' },
      { status: 500 }
    );
  }
}
