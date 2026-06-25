-- Migration: Add provider discovery fields for local-leads-finder integration

-- Add new columns to providers table
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opening_hours JSONB,
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS scrape_job_id UUID REFERENCES crawl_jobs(id),
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.8,
ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMP WITH TIME ZONE;

-- Create index for external_id lookups
CREATE INDEX IF NOT EXISTS idx_providers_external_id ON providers(external_id);
CREATE INDEX IF NOT EXISTS idx_providers_scrape_job ON providers(scrape_job_id);

-- Create provider sources table
CREATE TABLE IF NOT EXISTS provider_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('google_maps', 'yelp', 'facebook', 'directory', 'api', 'manual')),
    base_url TEXT,
    api_endpoint TEXT,
    credentials JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'requires_approval')),
    last_crawled_at TIMESTAMP WITH TIME ZONE,
    records_found INTEGER DEFAULT 0,
    records_imported INTEGER DEFAULT 0,
    error_message TEXT,
    compliance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scrape jobs table for provider discovery
CREATE TABLE IF NOT EXISTS provider_scrape_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES provider_sources(id),
    job_type TEXT DEFAULT 'discovery' CHECK (job_type IN ('discovery', 'enrichment', 'refresh')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    query TEXT,
    city TEXT,
    country TEXT,
    limit INTEGER DEFAULT 20,
    records_found INTEGER DEFAULT 0,
    records_imported INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    raw_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider enrichment logs
CREATE TABLE IF NOT EXISTS provider_enrichment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id),
    job_id UUID REFERENCES provider_scrape_jobs(id),
    enrichment_type TEXT NOT NULL CHECK (enrichment_type IN ('email', 'phone', 'website', 'social', 'hours')),
    source TEXT,
    old_value TEXT,
    new_value TEXT,
    confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_provider_sources_status ON provider_sources(status);
CREATE INDEX IF NOT EXISTS idx_provider_scrape_jobs_status ON provider_scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_provider_scrape_jobs_source ON provider_scrape_jobs(source_id);
CREATE INDEX IF NOT EXISTS idx_provider_enrichment_logs_provider ON provider_enrichment_logs(provider_id);

-- Insert default provider sources
INSERT INTO provider_sources (name, source_type, status, compliance_notes) VALUES
('Google Maps', 'google_maps', 'requires_approval', 'Requires Decodo API credentials. Set DECODO_USERNAME and DECODO_PASSWORD environment variables.'),
('Yelp', 'yelp', 'requires_approval', 'Requires Yelp Fusion API key.'),
('Facebook Pages', 'facebook', 'requires_approval', 'Requires Facebook Graph API access.')
ON CONFLICT DO NOTHING;

-- Update trigger for provider_sources
CREATE OR REPLACE FUNCTION update_provider_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_provider_sources_updated_at ON provider_sources;
CREATE TRIGGER trigger_provider_sources_updated_at
    BEFORE UPDATE ON provider_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_sources_updated_at();
