import { NextRequest, NextResponse } from 'next/server';
import { IntentLeadService } from '@/lib/intent-pipeline/intent-lead';

// GET /api/intent-leads/:id - Get a single intent lead
export async function GET(
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

    // Get events
    const events = await IntentLeadService.getEvents(params.id);

    return NextResponse.json({ success: true, lead, events });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/intent-leads/:id - Update an intent lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const lead = await IntentLeadService.update(params.id, {
      detected_need: body.detected_need,
      service_category: body.service_category,
      location_text: body.location_text,
      urgency: body.urgency,
      status: body.status,
      client_contact_permission: body.client_contact_permission,
      ai_summary: body.ai_summary
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Intent lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/intent-leads/:id - Delete an intent lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await IntentLeadService.delete(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Intent lead not found' },
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
