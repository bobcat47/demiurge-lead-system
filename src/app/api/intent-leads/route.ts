import { NextRequest, NextResponse } from 'next/server';
import { IntentLeadService } from '@/lib/intent-pipeline/intent-lead';

// GET /api/intent-leads - List intent leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      urgency: searchParams.get('urgency') || undefined,
      minConfidence: searchParams.get('minConfidence') 
        ? parseInt(searchParams.get('minConfidence')!) 
        : undefined,
      limit: searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!) 
        : 100
    };

    const leads = await IntentLeadService.getAll(filters);
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/intent-leads - Create an intent lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const lead = await IntentLeadService.create({
      source_config_id: body.source_config_id,
      source_scan_run_id: body.source_scan_run_id,
      source_type: body.source_type,
      source_name: body.source_name,
      source_url: body.source_url,
      original_content: body.original_content,
      detected_need: body.detected_need,
      service_category: body.service_category,
      location_text: body.location_text,
      location_lat: body.location_lat,
      location_lng: body.location_lng,
      urgency: body.urgency || 'medium',
      confidence_score: body.confidence_score || 0,
      contact_name: body.contact_name,
      contact_profile_url: body.contact_profile_url,
      contact_public_info: body.contact_public_info,
      contact_phone: body.contact_phone,
      contact_email: body.contact_email,
      ai_summary: body.ai_summary,
      status: 'new',
      client_contact_permission: false
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
