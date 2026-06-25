# Demiurge Lead Matcher - Architecture Document

## System Overview

The Demiurge Social Intent Lead Matcher is an automated system that:
1. Monitors public social/media posts for service-intent signals
2. Extracts and classifies intent (service, urgency, location, budget)
3. Matches qualified leads with appropriate providers
4. Generates outreach templates for human-approved contact

## Core Components

### 1. Source Ingestion Layer

**Purpose:** Collect public posts from approved sources

**Components:**
- **Crawler Worker** (`apps/worker/src/crawler.ts`)
  - Uses Crawlee for browser automation
  - Handles JavaScript-rendered pages
  - Implements rate limiting and retries
  - Respects robots.txt

- **Crawl4AI Integration** (future enhancement)
  - LLM-ready content extraction
  - Markdown conversion
  - Structured data extraction

**Supported Sources:**
- Reddit (public subreddits)
- Forums (public boards)
- Directories (public listings)
- Community websites
- Classified sites (public ads)

**Data Flow:**
```
Source Config → Crawl Job Queue → Crawlee Browser → Raw HTML → Extract Posts → Store Raw
```

### 2. Intent Detection Pipeline

**Purpose:** Parse raw posts into structured intent signals

**Components:**
- **IntentDetector** (`packages/core/src/intent-detector.ts`)
  - Service category classification (NLP + keyword matching)
  - Urgency detection (time-sensitive language)
  - Budget signal extraction
  - Location extraction (places, postcodes)
  - Spam filtering
  - Duplicate detection

**Service Categories:**
```typescript
const SERVICES = [
  'plumbing', 'electrical', 'hvac', 'roofing', 'landscaping',
  'cleaning', 'painting', 'pest_control', 'moving', 'locksmith',
  'appliance_repair', 'carpentry', 'flooring', 'masonry', 'pool'
];
```

**Output Schema:**
```typescript
interface ParsedIntent {
  service_category: string | null;
  service_confidence: number;
  urgency: 'urgent' | 'high' | 'medium' | 'low';
  budget: 'budget' | 'standard' | 'premium' | 'luxury';
  locations: string[];
  postcodes: string[];
  lead_quality_score: number;  // 0-100
  spam_probability: number;    // 0-1
  is_qualified: boolean;
  signals: Record<string, boolean>;
}
```

### 3. Provider Matching Engine

**Purpose:** Cross-reference intent against provider database

**Components:**
- **MatchingEngine** (`packages/core/src/matching-engine.ts`)
  - Multi-factor scoring algorithm
  - Geographic proximity calculation
  - Availability checking
  - Historical performance weighting

**Scoring Weights:**
```typescript
const WEIGHTS = {
  service: 35,      // Exact service match
  location: 25,     // Geographic proximity
  urgency: 15,      // Response capability
  rating: 10,       // Reputation
  price: 10,        // Budget alignment
  availability: 5   // Current status
};
```

**Match Output:**
```typescript
interface MatchResult {
  provider: Provider;
  matchScore: number;      // 0-100
  factors: MatchFactor[];  // Breakdown
  reasons: string[];       // Human-readable
  riskFlags: string[];     // Warnings
}
```

### 4. Lead Queue System

**Purpose:** Manage leads through workflow stages

**Status Workflow:**
```
NEW → SCORED → MATCHED → APPROVED → CONTACTED → ACCEPTED/DECLINED → CONVERTED
  ↓        ↓         ↓          ↓           ↓
REJECTED  SPAM    (skip)   REJECTED   NO_RESPONSE
```

**Database Tables:**
- `raw_posts`: Ingested content
- `parsed_intents`: Extracted signals
- `leads`: Qualified opportunities
- `lead_matches`: Provider recommendations
- `outreach_logs`: Contact attempts

### 5. Outreach System

**Purpose:** Generate compliant outreach messages

**Components:**
- **OutreachGenerator** (`packages/core/src/outreach.ts`)
  - Template-based message generation
  - Variable substitution
  - Multi-channel support

**Channels:**
- SMS (160-320 chars)
- Email (full templates)
- WhatsApp (formatted)
- Facebook DM (casual)

**Templates:**
```typescript
interface OutreachTemplate {
  name: string;
  type: 'sms' | 'email' | 'whatsapp' | 'facebook';
  subject?: string;  // For email
  body: string;      // With {{variables}}
}
```

**Variables:**
- `{{provider_name}}`
- `{{service}}`
- `{{location}}`
- `{{urgency}}`
- `{{customer_message}}`
- `{{quality_score}}`

### 6. Dashboard (Next.js)

**Purpose:** Human oversight and management interface

**Pages:**
- **Live Leads:** Real-time lead feed with actions
- **Sources:** Source management and status
- **Providers:** Provider database
- **Analytics:** Metrics and reporting
- **Settings:** System configuration

**Features:**
- Real-time updates (polling)
- Lead approval/rejection
- Outreach triggering
- Compliance monitoring

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CRAWL PHASE                                                  │
│     Source URL → Crawlee → Raw HTML → Extract Posts → DB         │
│                                                                  │
│  2. PROCESS PHASE (every 5 min)                                  │
│     Raw Post → Intent Detector → Parsed Intent → Qualified?      │
│                              ↓                                   │
│                         Create Lead → Match Providers            │
│                                                                  │
│  3. MATCHING PHASE                                               │
│     Lead + Providers → Scoring Algorithm → Ranked Matches        │
│                                                                  │
│  4. APPROVAL PHASE                                               │
│     Human Review → Approve/Reject → Queue Outreach               │
│                                                                  │
│  5. OUTREACH PHASE                                               │
│     Generate Message → Human Approval → Send → Track Response    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

**providers**
```sql
- id (uuid, pk)
- business_name (text)
- services (text[])
- service_areas (text[])
- emergency_available (boolean)
- response_time (text)
- rating (decimal)
- price_tier (enum)
- contact info fields...
```

**sources**
```sql
- id (uuid, pk)
- name (text)
- source_type (enum: reddit, forum, etc.)
- base_url (text)
- crawl_config (jsonb)
- status (enum)
- compliance fields...
```

**raw_posts**
```sql
- id (uuid, pk)
- source_id (uuid, fk)
- content (text)
- content_hash (text) -- for deduplication
- processing_status (enum)
- scraped_at (timestamp)
```

**parsed_intents**
```sql
- id (uuid, pk)
- raw_post_id (uuid, fk)
- service_category (text)
- urgency (enum)
- budget (enum)
- locations (text[])
- lead_quality_score (int)
- signals (jsonb)
```

**leads**
```sql
- id (uuid, pk)
- lead_number (serial)
- status (enum)
- priority_score (int)
- match_count (int)
- expires_at (timestamp)
```

**lead_matches**
```sql
- id (uuid, pk)
- lead_id (uuid, fk)
- provider_id (uuid, fk)
- match_score (int)
- match_reasons (text[])
- status (enum)
```

## Worker Architecture

### Job Queues (BullMQ + Redis)

**crawl-jobs**
- Trigger: Every 15 minutes (cron)
- Action: Crawl active sources
- Output: raw_posts records

**process-jobs**
- Trigger: Every 5 minutes + new posts
- Action: Intent detection + matching
- Output: leads + lead_matches

**outreach-jobs**
- Trigger: Human approval
- Action: Send messages
- Output: outreach_logs

### Worker Scaling

```yaml
# Can run multiple worker instances
worker-1:
  - Handles crawl jobs
  - Processes sources 1-5

worker-2:
  - Handles process jobs
  - Intent detection

worker-3:
  - Handles outreach jobs
  - Rate-limited sending
```

## Security & Compliance

### Data Protection
- No personal data stored without consent
- Public posts only (no DMs/private groups)
- Data retention: 90 days default
- Encryption at rest and in transit

### Crawling Ethics
- Respects robots.txt
- Rate limiting (1 req/sec default)
- No credential theft
- No paywall bypassing
- User-Agent identification

### Outreach Compliance
- Human approval required
- Opt-out mechanisms
- Business contact only
- Legitimate interest basis
- Audit trail maintained

## Scaling Considerations

### Horizontal Scaling
- Multiple crawler workers (source sharding)
- Separate process workers
- Dedicated outreach workers
- Read replicas for dashboard

### Performance
- Content hashing for deduplication
- Caching for provider lookups
- Batch processing for leads
- Connection pooling

### Storage
- Partition leads by date
- Archive old raw_posts
- Index frequently queried fields
- Use materialized views for analytics

## Monitoring

### Metrics to Track
- Posts crawled per hour
- Lead qualification rate
- Average match score
- Conversion rate by provider
- Response time by provider
- System error rates

### Alerts
- Crawler failures
- High spam rate
- Database connection issues
- Queue backlog
- Compliance violations

## Future Enhancements

1. **LLM Integration**
   - GPT-4 for intent extraction
   - Better semantic matching
   - Auto-generated templates

2. **ML Models**
   - Conversion prediction
   - Lead quality scoring
   - Provider performance prediction

3. **Advanced Crawling**
   - API integrations (official)
   - Webhook support
   - Real-time streaming

4. **Provider Features**
   - Self-service portal
   - Response time tracking
   - Performance analytics

5. **Integration**
   - CRM integrations
   - Email service providers
   - SMS gateways
   - Calendar booking
