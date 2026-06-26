import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return NextResponse.json(
      { success: false, error: 'DATABASE_URL not configured' },
      { status: 500 }
    );
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    try {
      const migrationSql = `
-- Create providers table first (referenced by foreign keys)
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    services JSONB DEFAULT '[]',
    service_areas JSONB DEFAULT '[]',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    rating DECIMAL(3, 2),
    review_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    contacts JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(100),
    source_url TEXT,
    content TEXT,
    detected_intent JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    confidence_score DECIMAL(5, 2),
    location_text VARCHAR(255),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('reddit', 'facebook', 'google_maps', 'yellow_pages', 'website', 'custom')),
    enabled BOOLEAN DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}',
    scan_interval_minutes INTEGER DEFAULT 60,
    max_results INTEGER DEFAULT 100,
    retry_attempts INTEGER DEFAULT 3,
    health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
    last_run_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_scan_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_config_id UUID NOT NULL REFERENCES source_configs(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'failed', 'partial')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    items_scanned INTEGER DEFAULT 0,
    intent_leads_created INTEGER DEFAULT 0,
    error_message TEXT,
    raw_summary JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intent_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_config_id UUID REFERENCES source_configs(id) ON DELETE SET NULL,
    source_scan_run_id UUID REFERENCES source_scan_runs(id) ON DELETE SET NULL,
    source_type VARCHAR(50) NOT NULL,
    source_name VARCHAR(255),
    source_url TEXT,
    original_content TEXT,
    detected_need TEXT NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    location_text VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
    confidence_score DECIMAL(5, 2) DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    contact_name VARCHAR(255),
    contact_profile_url TEXT,
    contact_public_info JSONB DEFAULT '{}',
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    ai_summary TEXT,
    matched_provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'matched', 'proposal_generated', 'contacted', 'deal_created', 'dismissed')),
    client_contact_permission BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intent_lead_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent_lead_id UUID NOT NULL REFERENCES intent_leads(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent_lead_id UUID NOT NULL REFERENCES intent_leads(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    match_score DECIMAL(5, 2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    match_reasons JSONB DEFAULT '[]',
    distance_miles DECIMAL(8, 2),
    category_fit_score DECIMAL(5, 2) DEFAULT 0,
    location_fit_score DECIMAL(5, 2) DEFAULT 0,
    urgency_fit_score DECIMAL(5, 2) DEFAULT 0,
    availability_fit_score DECIMAL(5, 2) DEFAULT 0,
    reputation_fit_score DECIMAL(5, 2) DEFAULT 0,
    estimated_job_value DECIMAL(12, 2),
    proposed_commission_type VARCHAR(20) DEFAULT 'percentage' CHECK (proposed_commission_type IN ('percentage', 'fixed', 'unknown')),
    proposed_commission_value DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'new_match' CHECK (status IN (
        'new_match', 'notified_admin', 'provider_contacted', 'client_contacted',
        'provider_accepted', 'client_accepted', 'agreement_needed', 'introduced',
        'won', 'lost', 'dismissed'
    )),
    provider_contact_permission BOOLEAN DEFAULT false,
    client_contact_permission BOOLEAN DEFAULT false,
    agreement_signed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(intent_lead_id, provider_id)
);

CREATE TABLE IF NOT EXISTS deal_match_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_match_id UUID NOT NULL REFERENCES deal_matches(id) ON DELETE CASCADE,
    script_type VARCHAR(50) NOT NULL CHECK (script_type IN (
        'provider_call', 'provider_sms', 'provider_email',
        'client_call', 'client_sms', 'client_email',
        'vapi_agent_prompt'
    )),
    content TEXT NOT NULL,
    generated_by VARCHAR(100) DEFAULT 'ai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deal_match_id, script_type)
);

CREATE TABLE IF NOT EXISTS deal_match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_match_id UUID NOT NULL REFERENCES deal_matches(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}',
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_loop_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loop_type VARCHAR(50) NOT NULL CHECK (loop_type IN (
        'source_scan', 'intent_detection', 'provider_matching',
        'notification_dispatch', 'script_generation'
    )),
    status VARCHAR(50) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'failed')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    items_processed INTEGER DEFAULT 0,
    items_created INTEGER DEFAULT 0,
    error_message TEXT,
    summary JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_settings (key, value, description) VALUES
('match_score_threshold', '70', 'Minimum match score to create a deal match'),
('commission_default_percentage', '10', 'Default commission percentage for intro fees'),
('automation_mode', '"manual"', 'Automation mode: manual, notify_only, auto_generate'),
('notification_email', '""', 'Admin notification email'),
('matchmaker_enabled', 'true', 'Enable automatic matchmaker loop')
ON CONFLICT (key) DO NOTHING;
`;

      await client.query(migrationSql);
      
      return NextResponse.json({
        success: true,
        message: 'Migration completed successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
