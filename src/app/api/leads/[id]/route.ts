import { NextResponse } from 'next/server';
import { getLeadById } from '@/lib/lead-finder/mock-provider';

export async function GET(
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

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Get lead error:', error);
    return NextResponse.json(
      { error: 'Failed to get lead' },
      { status: 500 }
    );
  }
}
