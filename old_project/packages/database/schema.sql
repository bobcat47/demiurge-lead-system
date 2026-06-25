-- Demiurge Social Intent Lead Matcher - Database Schema
-- PostgreSQL/Supabase compatible

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text matching

-- ============================================
-- PROVIDERS TABLE
-- ============================================
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id TEXT UNIQUE NOT NULL, -- External reference ID
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE GENERATED ALWAYS AS (lower(regexp_replace(business_name, '[^a-zA-Z0-9]+', '-', 'g'))) STORED,
    
    -- Services
    services TEXT[] NOT NULL DEFAULT '{}',
    service_categories TEXT[] DEFAULT '{}',
    specialties TEXT[] DEFAULT '{}',
    
    -- Location
    service_areas TEXT[] DEFAULT '{}',
    service_postcodes TEXT[] DEFAULT '{}',
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    service_radius_km INTEGER DEFAULT 50,
    
    -- Availability
    emergency_available BOOLEAN DEFAULT false,
    response_time TEXT, -- "1 hour", "Same day", etc.
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable', 'on_leave')),
    
    -- Pricing
    price_tier TEXT DEFAULT 'standard' CHECK (price_tier IN ('budget', 'standard', 'premium', 'luxury')),
    hourly_rate_min DECIMAL(10, 2),
    hourly_rate_max DECIMAL(10, 2),
    
    -- Rating & Quality
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    years_experience INTEGER,
    licensed BOOLEAN DEFAULT false,
    insured BOOLEAN DEFAULT false,
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    facebook TEXT,
    instagram TEXT,
    whatsapp TEXT,
    preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('phone', 'email', 'sms', 'whatsapp', 'facebook')),
    
    -- Lead Preferences
    preferred_lead_types TEXT[] DEFAULT '{}',
    max_leads_per_day INTEGER DEFAULT 10,
    auto_accept_leads_under DECIMAL(10, 2),
    
    -- Performance Tracking
    leads_received INTEGER DEFAULT 0,
    leads_accepted INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 4) DEFAULT 0,
    avg_response_time_minutes INTEGER,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full text search
    search_vector TSVECTOR
);

-- Indexes for providers
CREATE INDEX idx_providers_services ON providers USING GIN(services);
CREATE INDEX idx_providers_service_areas ON providers USING GIN(service_areas);
CREATE INDEX idx_providers_postcodes ON providers USING GIN(service_postcodes);
CREATE INDEX idx_providers_emergency ON providers(emergency_available) WHERE emergency_available = true;
CREATE INDEX idx_providers_rating ON providers(rating DESC);
CREATE INDEX idx_providers_location ON providers(latitude, longitude);
CREATE INDEX idx_providers_active ON providers(is_active) WHERE is_active = true;
CREATE INDEX idx_providers_search ON providers USING GIN(search_vector);

-- Trigger to update search vector
CREATE OR REPLACE FUNCTION update_provider_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.services, ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.service_areas, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_provider_search_update
    BEFORE INSERT OR UPDATE ON providers
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_search_vector();

-- ============================================
-- SOURCES TABLE (Crawling sources)
-- ============================================
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    -- Source Type
    source_type TEXT NOT NULL CHECK (source_type IN (
        'reddit', 'facebook_page', 'forum', 'directory', 
        'classifieds', 'community_board', 'website', 'rss', 'api'
    )),
    
    -- Connection
    base_url TEXT NOT NULL,
    crawl_config JSONB DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'disabled')),
    last_crawled_at TIMESTAMP WITH TIME ZONE,
    last_error_at TIMESTAMP WITH TIME ZONE,
    last_error_message TEXT,
    
    -- Crawl Settings
    crawl_frequency_minutes INTEGER DEFAULT 60,
    retry_attempts INTEGER DEFAULT 3,
    rate_limit_delay_ms INTEGER DEFAULT 1000,
    respect_robots_txt BOOLEAN DEFAULT true,
    
    -- Compliance
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    compliance_notes TEXT,
    data_retention_days INTEGER DEFAULT 90,
    
    -- Statistics
    posts_crawled INTEGER DEFAULT 0,
    posts_qualified INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sources_status ON sources(status);
CREATE INDEX idx_sources_type ON sources(source_type);

-- ============================================
-- RAW_POSTS TABLE (Ingested content)
-- ============================================
CREATE TABLE raw_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Source
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    external_id TEXT, -- ID from source platform
    source_url TEXT NOT NULL,
    
    -- Content
    title TEXT,
    content TEXT NOT NULL,
    content_markdown TEXT,
    raw_html TEXT,
    
    -- Author (public only)
    author_name TEXT,
    author_id TEXT,
    
    -- Metadata
    posted_at TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    language TEXT DEFAULT 'en',
    
    -- Processing
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN (
        'pending', 'processing', 'parsed', 'failed', 'spam', 'duplicate', 'irrelevant'
    )),
    
    -- Duplicate detection
    content_hash TEXT,
    duplicate_of UUID REFERENCES raw_posts(id),
    similarity_score DECIMAL(5, 4),
    
    -- Quality signals
    word_count INTEGER,
    has_contact_info BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_raw_posts_source ON raw_posts(source_id);
CREATE INDEX idx_raw_posts_status ON raw_posts(processing_status);
CREATE INDEX idx_raw_posts_external ON raw_posts(source_id, external_id);
CREATE INDEX idx_raw_posts_content_hash ON raw_posts(content_hash);
CREATE INDEX idx_raw_posts_scraped ON raw_posts(scraped_at DESC);

-- ============================================
-- PARSED_INTENTS TABLE (Extracted signals)
-- ============================================
CREATE TABLE parsed_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_post_id UUID NOT NULL REFERENCES raw_posts(id) ON DELETE CASCADE,
    
    -- Detected Intent
    service_category TEXT, -- plumbing, electrical, etc.
    service_confidence DECIMAL(5, 4),
    
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('urgent', 'high', 'medium', 'low')),
    urgency_score INTEGER DEFAULT 0,
    
    budget TEXT DEFAULT 'standard' CHECK (budget IN ('budget', 'standard', 'premium', 'luxury')),
    budget_confidence DECIMAL(5, 4),
    
    -- Location
    locations TEXT[] DEFAULT '{}',
    postcodes TEXT[] DEFAULT '{}',
    detected_city TEXT,
    detected_state TEXT,
    location_confidence DECIMAL(5, 4),
    
    -- Contact availability
    contact_available BOOLEAN DEFAULT true,
    preferred_contact_method TEXT,
    phone_numbers TEXT[] DEFAULT '{}',
    emails TEXT[] DEFAULT '{}',
    
    -- Quality scoring
    lead_quality_score INTEGER DEFAULT 0 CHECK (lead_quality_score >= 0 AND lead_quality_score <= 100),
    spam_probability DECIMAL(5, 4) DEFAULT 0,
    is_qualified BOOLEAN DEFAULT false,
    
    -- Signals
    signals JSONB DEFAULT '{}',
    -- Example: {"has_budget_mention": true, "has_timeline": true, "asking_for_recommendations": true}
    
    -- NLP Features
    entities JSONB DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    sentiment TEXT,
    
    -- Model info
    extractor_model TEXT,
    extraction_confidence DECIMAL(5, 4),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_parsed_intents_post ON parsed_intents(raw_post_id);
CREATE INDEX idx_parsed_intents_service ON parsed_intents(service_category);
CREATE INDEX idx_parsed_intents_urgency ON parsed_intents(urgency);
CREATE INDEX idx_parsed_intents_qualified ON parsed_intents(is_qualified) WHERE is_qualified = true;
CREATE INDEX idx_parsed_intents_quality ON parsed_intents(lead_quality_score DESC);

-- ============================================
-- LEADS TABLE (Qualified opportunities)
-- ============================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_number SERIAL,
    
    -- Relations
    raw_post_id UUID NOT NULL REFERENCES raw_posts(id),
    parsed_intent_id UUID NOT NULL REFERENCES parsed_intents(id),
    
    -- Display
    title TEXT,
    summary TEXT,
    
    -- Status workflow
    status TEXT DEFAULT 'new' CHECK (status IN (
        'new', 'scored', 'matched', 'approved', 'rejected', 
        'contacted', 'provider_responded', 'accepted', 'converted', 'expired'
    )),
    
    -- Scoring
    priority_score INTEGER DEFAULT 0, -- 0-100
    match_count INTEGER DEFAULT 0,
    top_match_score INTEGER DEFAULT 0,
    
    -- Timestamps
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_matched_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    contacted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assigned_to UUID, -- Admin user
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority_score DESC);
CREATE INDEX idx_leads_detected ON leads(detected_at DESC);
CREATE INDEX idx_leads_expires ON leads(expires_at);

-- ============================================
-- LEAD_MATCHES TABLE (Provider recommendations)
-- ============================================
CREATE TABLE lead_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id),
    
    -- Scoring
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    match_reasons TEXT[] DEFAULT '{}',
    
    -- Factors
    service_match_score INTEGER,
    location_match_score INTEGER,
    urgency_match_score INTEGER,
    rating_match_score INTEGER,
    price_match_score INTEGER,
    availability_match_score INTEGER,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'recommended', 'approved', 'rejected', 
        'contacted', 'responded', 'accepted', 'declined'
    )),
    
    -- Outreach
    outreach_sent_at TIMESTAMP WITH TIME ZONE,
    outreach_method TEXT,
    outreach_template_used TEXT,
    provider_response_at TIMESTAMP WITH TIME ZONE,
    provider_response TEXT,
    
    -- Outcome
    provider_accepted BOOLEAN,
    accepted_price DECIMAL(10, 2),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(lead_id, provider_id)
);

CREATE INDEX idx_lead_matches_lead ON lead_matches(lead_id);
CREATE INDEX idx_lead_matches_provider ON lead_matches(provider_id);
CREATE INDEX idx_lead_matches_score ON lead_matches(match_score DESC);
CREATE INDEX idx_lead_matches_status ON lead_matches(status);

-- ============================================
-- OUTREACH_TEMPLATES TABLE
-- ============================================
CREATE TABLE outreach_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('sms', 'email', 'whatsapp', 'facebook', 'dm')),
    
    -- Content
    subject TEXT, -- For email
    body TEXT NOT NULL,
    
    -- Context
    service_categories TEXT[] DEFAULT '{}',
    urgency_levels TEXT[] DEFAULT '{}',
    price_tiers TEXT[] DEFAULT '{}',
    
    -- Usage
    is_default BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- OUTREACH_LOGS TABLE
-- ============================================
CREATE TABLE outreach_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    lead_match_id UUID REFERENCES lead_matches(id),
    lead_id UUID REFERENCES leads(id),
    provider_id UUID REFERENCES providers(id),
    
    -- Message
    template_id UUID REFERENCES outreach_templates(id),
    method TEXT NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    
    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance
    consent_basis TEXT, -- 'legitimate_interest', 'consent', etc.
    consent_documented BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_outreach_logs_lead ON outreach_logs(lead_id);
CREATE INDEX idx_outreach_logs_status ON outreach_logs(status);

-- ============================================
-- CRAWL_JOBS TABLE (Queue for crawler)
-- ============================================
CREATE TABLE crawl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    job_type TEXT DEFAULT 'full' CHECK (job_type IN ('full', 'incremental', 'test')),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    
    -- Progress
    urls_discovered INTEGER DEFAULT 0,
    urls_crawled INTEGER DEFAULT 0,
    posts_extracted INTEGER DEFAULT 0,
    posts_qualified INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Error info
    error_message TEXT,
    stack_trace TEXT,
    
    -- Metadata
    crawler_version TEXT,
    crawler_node TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_crawl_jobs_source ON crawl_jobs(source_id);
CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_crawl_jobs_created ON crawl_jobs(created_at DESC);

-- ============================================
-- ACTIVITY_LOGS TABLE (Audit trail)
-- ============================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    entity_type TEXT NOT NULL, -- 'lead', 'provider', 'source', etc.
    entity_id UUID NOT NULL,
    
    action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', etc.
    performed_by UUID, -- User ID
    performed_by_name TEXT,
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- SYSTEM_SETTINGS TABLE
-- ============================================
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_matches_updated_at BEFORE UPDATE ON lead_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update provider conversion rate
CREATE OR REPLACE FUNCTION update_provider_conversion_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE providers
    SET conversion_rate = CASE 
        WHEN leads_received > 0 THEN leads_converted::DECIMAL / leads_received
        ELSE 0
    END
    WHERE id = NEW.provider_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversion_rate
    AFTER UPDATE OF provider_accepted ON lead_matches
    FOR EACH ROW
    WHEN (NEW.provider_accepted = true)
    EXECUTE FUNCTION update_provider_conversion_rate();

-- ============================================
-- SEED DATA
-- ============================================

-- Default outreach templates
INSERT INTO outreach_templates (name, template_type, subject, body, is_default) VALUES
(
    'Default SMS',
    'sms',
    NULL,
    'Hi {{provider_name}}, we found a lead for {{service}} in {{location}}. Urgency: {{urgency}}. Interested? Reply YES for details.',
    true
),
(
    'Default Email',
    'email',
    'New Lead: {{service}} request in {{location}}',
    'Hi {{provider_name}},

We found a potential customer looking for {{service}} services in {{location}}.

Lead Details:
- Service: {{service}}
- Urgency: {{urgency}}
- Location: {{location}}
- Budget indication: {{budget}}

Customer message: "{{customer_message}}"

Would you like us to connect you with this lead?

Reply to accept or ignore if not interested.

Best regards',
    true
),
(
    'Urgent SMS',
    'sms',
    NULL,
    '🚨 URGENT: {{provider_name}}, someone needs {{service}} ASAP in {{location}}. Can you respond today? Reply YES for details.',
    false
),
(
    'WhatsApp',
    'whatsapp',
    NULL,
    'Hi {{provider_name}}! 👋 We have a lead for {{service}} in {{location}}. Urgency: {{urgency}}. Interested in connecting?',
    true
),
(
    'Facebook DM',
    'facebook',
    NULL,
    'Hi {{provider_name}}! We noticed someone in your service area is looking for {{service}}. Would you like the referral? We can share details if you\'re available.',
    true
);

-- Sample sources
INSERT INTO sources (name, slug, source_type, base_url, status, crawl_config) VALUES
(
    'Reddit r/HomeImprovement',
    'reddit-homeimprovement',
    'reddit',
    'https://www.reddit.com/r/HomeImprovement/new/',
    'paused',
    '{"subreddit": "HomeImprovement", "sort": "new", "limit": 25}'::jsonb
),
(
    'Local Services Forum',
    'local-services-forum',
    'forum',
    'https://example-forum.com/services/',
    'paused',
    '{}'::jsonb
);

-- System settings
INSERT INTO system_settings (key, value, description) VALUES
('crawler.enabled', 'true'::jsonb, 'Master switch for crawler'),
('crawler.max_concurrent_jobs', '3'::jsonb, 'Maximum concurrent crawl jobs'),
('intent.min_confidence', '0.6'::jsonb, 'Minimum confidence for intent detection'),
('lead.auto_approve_score', '85'::jsonb, 'Auto-approve leads above this score'),
('lead.expiry_hours', '48'::jsonb, 'Hours until lead expires'),
('matching.min_score', '60'::jsonb, 'Minimum match score to recommend provider'),
('outreach.require_approval', 'true'::jsonb, 'Require human approval before sending');
