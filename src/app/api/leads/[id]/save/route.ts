import { NextResponse } from 'next/server';
import { getLeadById, saveLead } from '@/lib/lead-finder';

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

    const updatedLead = await saveLead({
      ...lead,
      status: lead.status === 'saved' ? 'reviewed' : 'saved',
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      message: lead.status === 'saved' ? 'Lead unsaved' : 'Lead saved',
    });
  } catch (error) {
    console.error('Save lead error:', error);
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}
